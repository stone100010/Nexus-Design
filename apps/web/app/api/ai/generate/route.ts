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

// 校验元素数组，过滤不合格的
function validateElements(elements: Record<string, unknown>[]) {
  return elements
    .filter((el) => {
      return el.type && typeof el.x === 'number' && typeof el.y === 'number'
        && typeof el.width === 'number' && typeof el.height === 'number'
    })
    .map((el) => ({
      type: el.type,
      x: el.x,
      y: el.y,
      width: Math.max(10, el.width as number),
      height: Math.max(10, el.height as number),
      props: el.props || {},
      styles: el.styles || {},
    }))
}

// 校验单个 page 对象
function validatePage(page: Record<string, unknown>, index: number) {
  const elements = Array.isArray(page.elements) ? page.elements : []
  return {
    id: page.id || `page-${index + 1}`,
    name: page.name || `页面 ${index + 1}`,
    description: page.description || '',
    canvas: page.canvas || { width: 375, height: 812 },
    elements: validateElements(elements as Record<string, unknown>[]),
  }
}

// 系统提示词 - 多页 APP UI 设计（JSON 输出）
const SYSTEM_PROMPT = `你是顶级 APP UI/UX 设计专家。根据用户描述生成完整 APP 多页设计方案。

只返回纯 JSON，不要任何解释文字。不要用 \`\`\`json 包裹。

JSON 格式：
{
  "app": "APP名称",
  "style": "设计风格",
  "pages": [
    {
      "id": "page-1",
      "name": "页面名称",
      "description": "页面描述",
      "canvas": { "width": 375, "height": 812 },
      "elements": [
        {
          "type": "text|button|container|input|image|icon",
          "x": number,
          "y": number,
          "width": number,
          "height": number,
          "props": { "text"?: "string", "placeholder"?: "string", "src"?: "string" },
          "styles": { "background"?: "string", "color"?: "string", "fontSize"?: "string", "borderRadius"?: "string" }
        }
      ]
    }
  ]
}

设计规范（严格遵守）：
1. 生成 3 个核心页面，覆盖 APP 主要功能流
2. 玻璃拟态风格：半透明卡片 rgba(255,255,255,0.08)
3. 配色：背景 #0f0c29，卡片 rgba(255,255,255,0.08)，边框 rgba(255,255,255,0.12)
4. 每个页面必须有：
   - 顶部状态栏 (y=0, h=44)：左"9:41"，右信号电池
   - 底部标签栏 (y=729, h=83)：4个tab
   - 中间内容区：标题、卡片、按钮
5. 每个页面 6-8 个元素（不要太多）
6. 所有文字用中文，图片用 https://picsum.photos/宽/高
7. 元素不溢出画布`

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
    const { prompt, projectId, stream: wantStream } = body

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

    // ========== 流式响应（增量分页，直接 HTTP 绕过 SDK） ==========
    if (wantStream) {
      const aiUrl = `${process.env.OPENAI_BASE_URL || 'https://open.bigmodel.cn/api/coding/paas/v4'}/chat/completions`
      const aiKey = process.env.OPENAI_API_KEY || ''
      const aiModel = process.env.OPENAI_MODEL || 'glm-5.1'

      const encoder = new TextEncoder()
      let buffer = ''
      let pageCount = 0
      const allPages: Record<string, unknown>[] = []

      const readable = new ReadableStream({
        async start(controller) {
          const startTime = Date.now()
          const heartbeat = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', message: `AI 正在生成中... ${elapsed}s` })}\n\n`))
          }, 5000)

          try {
            const response = await fetch(aiUrl, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${aiKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: aiModel,
                messages: [
                  { role: 'system', content: SYSTEM_PROMPT },
                  { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 16000,
                stream: true,
              }),
            })

            if (!response.ok) {
              const errBody = await response.text()
              throw new Error(`AI API ${response.status}: ${errBody.slice(0, 200)}`)
            }

            const reader = response.body?.getReader()
            if (!reader) throw new Error('无法读取响应流')
            const decoder = new TextDecoder()
            let sseBuffer = ''

            for (;;) {
              const { done, value } = await reader.read()
              if (done) break

              sseBuffer += decoder.decode(value, { stream: true })
              const lines = sseBuffer.split('\n')
              sseBuffer = lines.pop() || ''

              for (const line of lines) {
                const trimmed = line.trim()
                if (!trimmed.startsWith('data: ')) continue
                const payload = trimmed.slice(6)
                if (payload === '[DONE]') continue

                try {
                  const chunk = JSON.parse(payload)
                  const delta = chunk.choices?.[0]?.delta?.content || ''
                  if (!delta) continue
                  buffer += delta
                } catch { /* ignore parse errors */ }
              }

              // 增量解析：从 buffer 中提取完整的 page 对象
              // 查找 "pages" 数组的起始位置（兼容流式片段拼接）
              const pagesKeyIdx = buffer.indexOf('"pages"')
              if (pagesKeyIdx === -1 && buffer.length > 500) {
                // eslint-disable-next-line no-console
                console.log(`[AI] buffer ${buffer.length} chars, no "pages" found. starts: ${JSON.stringify(buffer.slice(0, 80))}`)
              }
              if (pagesKeyIdx !== -1) {
                // 从 "pages" 之后找到 [ 的位置
                const afterKey = buffer.indexOf('[', pagesKeyIdx)
                if (afterKey !== -1) {
                  let i = afterKey + 1
                  let depth = 0
                  let pageStart = -1
                  let inString = false
                  let escapeNext = false

                  while (i < buffer.length) {
                    const ch = buffer[i]

                    if (escapeNext) {
                      escapeNext = false
                      i++
                      continue
                    }

                    if (inString) {
                      if (ch === '\\') escapeNext = true
                      else if (ch === '"') inString = false
                      i++
                      continue
                    }

                    if (ch === '"') {
                      inString = true
                      i++
                      continue
                    }

                    if (ch === '{') {
                      if (depth === 0) pageStart = i
                      depth++
                    } else if (ch === '}') {
                      depth--
                      if (depth === 0 && pageStart !== -1) {
                        const pageStr = buffer.substring(pageStart, i + 1)
                        try {
                          const pageObj = JSON.parse(pageStr)
                          pageCount++
                          const validatedPage = validatePage(pageObj, pageCount - 1)
                          allPages.push(validatedPage as unknown as Record<string, unknown>)
                          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'page', page: validatedPage, index: pageCount })}\n\n`))
                        } catch { /* JSON 不完整，继续累积 */ }
                        pageStart = -1
                      }
                    } else if (ch === ']') {
                      // pages 数组结束
                      break
                    }

                    i++
                  }
                  // 保留未解析完的部分（最后一个不完整 page）
                  buffer = pageStart !== -1 ? buffer.substring(pageStart) : ''
                }
              }
            }

            clearInterval(heartbeat)
            // eslint-disable-next-line no-console
            console.log(`[AI] stream done: ${pageCount} pages, buffer=${buffer.length} chars`)
            if (pageCount === 0) {
              // eslint-disable-next-line no-console
              console.log(`[AI] buffer full: ${buffer}`)
            }

            // fallback：增量解析没拿到 page 时整体解析
            if (pageCount === 0 && buffer.length > 0) {
              try {
                let jsonStr = buffer.trim()
                const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
                if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim()
                if (!jsonStr.startsWith('{')) {
                  const start = jsonStr.indexOf('{')
                  const end = jsonStr.lastIndexOf('}')
                  if (start !== -1 && end !== -1) jsonStr = jsonStr.substring(start, end + 1)
                }
                const parsed = JSON.parse(jsonStr)
                const pagesArr = parsed.pages || (parsed.elements ? [{ id: 'page-1', name: '页面 1', canvas: parsed.canvas || { width: 375, height: 812 }, elements: parsed.elements }] : [])
                for (const pageData of pagesArr) {
                  pageCount++
                  const validatedPage = validatePage(pageData, pageCount - 1)
                  allPages.push(validatedPage as unknown as Record<string, unknown>)
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'page', page: validatedPage, index: pageCount })}\n\n`))
                }
              } catch { /* fallback 也失败 */ }
            }

            // 保存到数据库
            if (pageCount > 0) {
              const designOutput = { app: 'APP', style: 'glassmorphism', pages: allPages.map((p, i) => validatePage(p, i)) }
              prisma.aIGeneration.create({
                data: {
                  userId: user.id,
                  projectId: projectId || null,
                  prompt,
                  response: { pages: allPages.length },
                  model: aiModel,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  design: designOutput as any,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  code: (allPages[0]?.elements || []) as any,
                  tokensUsed: 0,
                  cost: 0,
                  status: 'SUCCESS'
                }
              }).catch(() => {})
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', totalPages: pageCount, dailyRemaining: dailyLimit - todayCount - 1, dailyLimit })}\n\n`))
            controller.close()
          } catch (err) {
            clearInterval(heartbeat)
            console.error('[AI] stream error:', err instanceof Error ? err.message : err)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: err instanceof Error ? err.message : '生成失败' })}\n\n`))
            controller.close()
          }
        }
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // ========== 非流式响应（兼容旧逻辑） ==========
    const completion = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL || 'deepseek-v3.2',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 16000
    })

    const responseContent = completion.choices[0].message.content

    if (!responseContent) {
      throw new Error('AI 响应为空')
    }

    // 提取 JSON（容错：AI 可能返回 markdown 包裹的 JSON）
    let jsonStr = responseContent.trim()

    // 去掉 ```json ... ``` 包裹
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim()
    }

    // 如果开头不是 {，尝试找第一个 { 到最后一个 }
    if (!jsonStr.startsWith('{')) {
      const start = jsonStr.indexOf('{')
      const end = jsonStr.lastIndexOf('}')
      if (start !== -1 && end !== -1) {
        jsonStr = jsonStr.substring(start, end + 1)
      }
    }

    let designData
    try {
      designData = JSON.parse(jsonStr)
    } catch {
      console.error('[AI Generate] JSON parse failed, raw (first 2000 chars):', responseContent.substring(0, 2000))
      throw new Error('AI 响应格式无效，请重试')
    }

    // 验证响应格式
    let designOutput: Record<string, unknown>

    if (designData.pages && Array.isArray(designData.pages)) {
      designOutput = {
        app: designData.app || 'APP',
        style: designData.style || 'glassmorphism',
        pages: designData.pages.map((page: Record<string, unknown>, index: number) => validatePage(page, index)),
      }
    } else if (designData.elements && Array.isArray(designData.elements)) {
      designOutput = {
        app: designData.app || 'APP',
        style: designData.style || 'glassmorphism',
        pages: [
          {
            id: 'page-1',
            name: '页面 1',
            description: '',
            canvas: designData.canvas || { width: 375, height: 812 },
            elements: validateElements(designData.elements),
          },
        ],
      }
    } else {
      throw new Error('AI 响应缺少 pages 或 elements 数组')
    }

    const tokensUsed = completion.usage?.total_tokens || 0
    const cost = (tokensUsed / 1000) * 0.002

    const generation = await prisma.aIGeneration.create({
      data: {
        userId: user.id,
        projectId: projectId || null,
        prompt,
        response: designData,
        model: process.env.OPENAI_MODEL || 'deepseek-v3.2',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        design: designOutput as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code: ((designOutput.pages as Record<string, unknown>[])?.[0]?.elements || []) as any,
        tokensUsed,
        cost,
        status: 'SUCCESS'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        design: designOutput,
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
      // 静默处理
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

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

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
