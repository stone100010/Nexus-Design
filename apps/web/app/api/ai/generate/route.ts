import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import OpenAI from 'openai'

import { handleApiError } from '@/lib/api-error'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://apis.iflow.cn/v1'
  })
}

// 系统提示词 - 用于指导 AI 生成 UI 设计
const SYSTEM_PROMPT = `你是一个专业的 UI/UX 设计师和前端开发专家。用户将描述他们想要的界面，你需要生成相应的设计元素。

请以 JSON 格式返回，包含以下结构：
{
  "elements": [
    {
      "type": "button" | "text" | "container" | "input" | "image" | "icon",
      "x": number,
      "y": number,
      "width": number,
      "height": number,
      "props": {
        "text"?: string,
        "placeholder"?: string,
        "src"?: string,
        "alt"?: string
      },
      "styles": {
        "background"?: string,
        "color"?: string,
        "borderRadius"?: string,
        "fontSize"?: string,
        "fontWeight"?: string,
        "padding"?: string,
        "margin"?: string,
        "boxShadow"?: string,
        "border"?: string,
        "textAlign"?: string,
        "lineHeight"?: string
      }
    }
  ],
  "canvas": {
    "width": number,
    "height": number
  }
}

设计要求（必须严格遵守）：
1. 所有文字内容必须使用中文
2. 配色使用现代深色主题：背景 #111827/#1f2937，卡片 #1a1a2e/#16213e，强调色 #e94560/#6366f1/#4cc9f0
3. 使用丰富的视觉效果：渐变背景 linear-gradient、阴影 boxShadow、圆角 borderRadius
4. 元素间距合理，不要重叠，确保可读性
5. image 类型的 src 使用 https://picsum.photos/宽度/高度 格式的随机图片
6. 生成足够多的元素（至少 6-10 个），让设计看起来丰富完整
7. 每个元素的 x/y/width/height 必须是合理的数值，确保在画布范围内
8. 文字元素要有合适的 fontSize（标题 18-24px，正文 14-16px，按钮 14-16px）

示例：用户说"登录页面"→ 返回包含 logo、标题、邮箱输入框、密码输入框、登录按钮、忘记密码链接、注册链接的完整设计`

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { prompt, projectId, canvasSize } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: '缺少提示词参数' },
        { status: 400 }
      )
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 每用户每日生成限制
    const dailyLimit = parseInt(process.env.AI_DAILY_LIMIT || '50')
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayCount = await prisma.aIGeneration.count({
      where: {
        userId: user.id,
        createdAt: { gte: todayStart },
        status: 'SUCCESS'
      }
    })

    if (todayCount >= dailyLimit) {
      return NextResponse.json(
        { success: false, error: `今日生成次数已达上限（${dailyLimit} 次），请明天再试` },
        { status: 429 }
      )
    }

    // 调用 OpenAI API
    const completion = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL || 'deepseek-v3.2',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    })

    const responseContent = completion.choices[0].message.content
    
    if (!responseContent) {
      throw new Error('AI 响应为空')
    }

    let designData
    try {
      designData = JSON.parse(responseContent)
    } catch {
      throw new Error('AI 响应格式无效')
    }

    // 验证响应格式
    if (!designData.elements || !Array.isArray(designData.elements)) {
      throw new Error('AI 响应缺少 elements 数组')
    }

    // 校验每个元素的基本字段，过滤不合格的
    designData.elements = designData.elements.filter((el: Record<string, unknown>) => {
      return el.type && typeof el.x === 'number' && typeof el.y === 'number'
        && typeof el.width === 'number' && typeof el.height === 'number'
    }).map((el: Record<string, unknown>) => ({
      type: el.type,
      x: el.x,
      y: el.y,
      width: Math.max(10, el.width as number),
      height: Math.max(10, el.height as number),
      props: el.props || {},
      styles: el.styles || {},
    }))

    // 如果前端传了 canvasSize，用它覆盖 AI 返回的 canvas
    if (canvasSize?.width && canvasSize?.height) {
      designData.canvas = { width: canvasSize.width, height: canvasSize.height }
    } else if (!designData.canvas) {
      designData.canvas = { width: 375, height: 812 }
    }

    // 计算消耗的 token 数
    const tokensUsed = completion.usage?.total_tokens || 0
    
    // 估算成本 (假设每 1000 tokens 0.002 美元)
    const cost = (tokensUsed / 1000) * 0.002

    // 保存生成记录到数据库
    const generation = await prisma.aIGeneration.create({
      data: {
        userId: user.id,
        projectId: projectId || null,
        prompt,
        response: designData,
        model: process.env.OPENAI_MODEL || 'deepseek-v3.2',
        design: designData,
        code: designData.elements, // 简化的代码表示
        tokensUsed,
        cost,
        status: 'SUCCESS'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        design: designData,
        metadata: {
          tokensUsed,
          cost,
          generationId: generation.id,
          dailyRemaining: dailyLimit - todayCount - 1,
          dailyLimit
        }
      }
    })
  } catch (error) {
    console.error('[AI Generate] Error:', error instanceof Error ? error.message : error)
    // 记录失败的生成
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email }
        })

        if (user) {
          await prisma.aIGeneration.create({
            data: {
              userId: user.id,
              projectId: null,
              prompt: '',
              response: {},
              model: process.env.OPENAI_MODEL || 'deepseek-v3.2',
              tokensUsed: 0,
              cost: 0,
              status: 'FAILED',
              errorMessage: error instanceof Error ? error.message : '未知错误'
            }
          })
        }
      }
    } catch {
      // 静默处理数据库记录失败
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

// GET - 获取 AI 生成历史
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // 查询生成历史
    const generations = await prisma.aIGeneration.findMany({
      where: {
        userId: user.id,
        ...(projectId ? { projectId } : {})
      },
      include: {
        project: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit
    })

    // 获取总数
    const total = await prisma.aIGeneration.count({
      where: {
        userId: user.id,
        ...(projectId ? { projectId } : {})
      }
    })

    return NextResponse.json({
      success: true,
      data: generations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}