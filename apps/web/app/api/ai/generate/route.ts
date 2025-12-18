import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import OpenAI from 'openai'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://apis.iflow.cn/v1'
})

// 系统提示词 - 用于指导 AI 生成 UI 设计
const SYSTEM_PROMPT = `
你是一个专业的 UI/UX 设计师和前端开发专家。用户将描述他们想要的界面，你需要生成相应的设计元素和代码。

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
        "src"?: string
      },
      "styles": {
        "background"?: string,
        "color"?: string,
        "borderRadius"?: string,
        "fontSize"?: string,
        "padding"?: string
      }
    }
  ],
  "canvas": {
    "width": number,
    "height": number
  }
}

设计原则：
1. 使用现代设计风格，深色主题优先
2. 确保良好的视觉层次和间距
3. 使用专业的配色方案
4. 保持响应式布局考虑
5. 元素应该合理分布在画布上

示例：
用户描述："一个登录表单，包含邮箱输入、密码输入和登录按钮"
返回：一个包含输入框和按钮的登录表单布局
`

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
    const { prompt, projectId } = body

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

    // 调用 OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'deepseek-v3.2',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })

    const responseContent = completion.choices[0].message.content
    
    if (!responseContent) {
      throw new Error('AI 响应为空')
    }

    let designData
    try {
      designData = JSON.parse(responseContent)
    } catch (parseError) {
      throw new Error('AI 响应格式无效')
    }

    // 验证响应格式
    if (!designData.elements || !Array.isArray(designData.elements)) {
      throw new Error('AI 响应缺少 elements 数组')
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
          generationId: generation.id
        }
      }
    })
  } catch (error) {
    console.error('AI 生成错误:', error)

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
    } catch (dbError) {
      console.error('保存失败记录错误:', dbError)
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'AI 生成失败',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
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
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '获取历史失败' 
      },
      { status: 500 }
    )
  }
}