import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import OpenAI from 'openai'

import { handleApiError } from '@/lib/api-error'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

function getAiConfig() {
  return {
    apiKey: process.env.NEXUS_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '',
    baseURL: process.env.NEXUS_OPENAI_BASE_URL || process.env.OPENAI_BASE_URL || 'https://open.bigmodel.cn/api/coding/paas/v4',
    model: process.env.NEXUS_OPENAI_MODEL || process.env.OPENAI_MODEL || 'glm-5.1',
  }
}

function getOpenAI() {
  const config = getAiConfig()
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  })
}

function estimateTokens(value: string | number) {
  const length = typeof value === 'number' ? value : value.length
  if (length <= 0) return 0
  return Math.ceil(length / 3)
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

function extractJsonPayload(content: string) {
  let jsonStr = content.trim()
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim()

  if (!jsonStr.startsWith('{')) {
    const start = jsonStr.indexOf('{')
    const end = jsonStr.lastIndexOf('}')
    if (start !== -1 && end !== -1) {
      jsonStr = jsonStr.substring(start, end + 1)
    }
  }

  return jsonStr
}

function parseCompletePages(content: string) {
  const pagesKeyMatch = /"pages"\s*:/.exec(content)
  if (!pagesKeyMatch) {
    return { pages: [] as Record<string, unknown>[], sawPagesKey: false }
  }

  const arrayStart = content.indexOf('[', pagesKeyMatch.index + pagesKeyMatch[0].length)
  if (arrayStart === -1) {
    return { pages: [] as Record<string, unknown>[], sawPagesKey: true }
  }

  const pages: Record<string, unknown>[] = []
  let depth = 0
  let pageStart = -1
  let inString = false
  let escapeNext = false

  for (let i = arrayStart + 1; i < content.length; i++) {
    const ch = content[i]

    if (escapeNext) {
      escapeNext = false
      continue
    }

    if (inString) {
      if (ch === '\\') escapeNext = true
      else if (ch === '"') inString = false
      continue
    }

    if (ch === '"') {
      inString = true
      continue
    }

    if (ch === '{') {
      if (depth === 0) pageStart = i
      depth++
      continue
    }

    if (ch === '}') {
      depth--
      if (depth === 0 && pageStart !== -1) {
        try {
          pages.push(JSON.parse(content.slice(pageStart, i + 1)))
        } catch {
          // 当前 chunk 中对象仍不完整时，等待后续内容补齐。
        }
        pageStart = -1
      }
      continue
    }

    if (ch === ']' && depth === 0) break
  }

  return { pages, sawPagesKey: true }
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
      const aiConfig = getAiConfig()
      const aiUrl = `${aiConfig.baseURL}/chat/completions`
      const aiKey = aiConfig.apiKey
      const aiModel = aiConfig.model
      const firstPageTimeoutMs = Number.parseInt(process.env.AI_FIRST_PAGE_TIMEOUT_MS || '90000', 10)
      const streamTimeoutMs = Number.parseInt(process.env.AI_STREAM_TIMEOUT_MS || '300000', 10)

      const encoder = new TextEncoder()
      let contentBuffer = ''
      let pageCount = 0
      const allPages: Record<string, unknown>[] = []
      let loggedMissingPagesKey = false
      let loggedReasoningContent = false
      let reasoningChars = 0
      let firstPageTokens: number | null = null

      const readable = new ReadableStream({
        async start(controller) {
          const startTime = Date.now()
          let lastProgressAt = 0
          const upstreamAbort = new AbortController()
          let firstPageTimer: ReturnType<typeof setTimeout> | null = null
          let streamTimer: ReturnType<typeof setTimeout> | null = null

          const clearFirstPageTimer = () => {
            if (firstPageTimer) {
              clearTimeout(firstPageTimer)
              firstPageTimer = null
            }
          }

          const clearAllTimers = () => {
            clearFirstPageTimer()
            if (streamTimer) {
              clearTimeout(streamTimer)
              streamTimer = null
            }
          }

          const buildProgress = (message: string, phase = 'streaming') => ({
            type: 'progress',
            phase,
            message,
            elapsed: Math.floor((Date.now() - startTime) / 1000),
            chars: contentBuffer.length,
            estimatedTokens: estimateTokens(contentBuffer),
            reasoningChars,
            reasoningEstimatedTokens: estimateTokens(reasoningChars),
            pages: pageCount,
            firstPageTokens,
          })

          const sendProgress = (message: string, phase = 'streaming') => {
            lastProgressAt = Date.now()
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(buildProgress(message, phase))}\n\n`))
          }

          const heartbeat = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000)
            sendProgress(`AI 正在生成中... ${elapsed}s`)
          }, 1000)

          try {
            firstPageTimer = setTimeout(() => {
              upstreamAbort.abort(new Error(`首屏生成超过 ${Math.round(firstPageTimeoutMs / 1000)} 秒，已停止本次请求。请缩短描述或稍后重试。`))
            }, firstPageTimeoutMs)
            streamTimer = setTimeout(() => {
              upstreamAbort.abort(new Error(`AI 生成超过 ${Math.round(streamTimeoutMs / 1000)} 秒，已停止本次请求。`))
            }, streamTimeoutMs)

            sendProgress('已连接 AI，正在等待首个响应...', 'connecting')
            const response = await fetch(aiUrl, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${aiKey}`, 'Content-Type': 'application/json' },
              signal: upstreamAbort.signal,
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
                  const deltaObj = chunk.choices?.[0]?.delta
                  const reasoningDelta = deltaObj?.reasoning_content
                  if (reasoningDelta) {
                    reasoningChars += String(reasoningDelta).length
                    if (!loggedReasoningContent) {
                      loggedReasoningContent = true
                      // eslint-disable-next-line no-console
                      console.log('[AI] reasoning_content detected and counted')
                    }
                  }
                  const delta = deltaObj?.content || ''
                  if (!delta) continue
                  contentBuffer += delta
                } catch { /* ignore parse errors */ }
              }

              // 增量解析：保留完整 content，根据已发 page 数补发新完成页面。
              const parsedPages = parseCompletePages(contentBuffer)
              if (!parsedPages.sawPagesKey && contentBuffer.length > 500 && !loggedMissingPagesKey) {
                loggedMissingPagesKey = true
                // eslint-disable-next-line no-console
                console.log(`[AI] buffer ${contentBuffer.length} chars, no "pages" key found. starts: ${JSON.stringify(contentBuffer.slice(0, 120))}`)
              }

              if (Date.now() - lastProgressAt > 500) {
                const phase = pageCount === 0 ? 'first_page' : 'streaming'
                const message = pageCount === 0
                  ? '正在生成首屏页面...'
                  : `已生成 ${pageCount} 个页面，继续接收后续页面...`
                sendProgress(message, phase)
              }

              while (pageCount < parsedPages.pages.length) {
                const pageObj = parsedPages.pages[pageCount]
                const validatedPage = validatePage(pageObj, pageCount)
                pageCount++
                allPages.push(validatedPage as unknown as Record<string, unknown>)
                if (pageCount === 1 && firstPageTokens === null) {
                  firstPageTokens = estimateTokens(contentBuffer)
                  clearFirstPageTimer()
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'page',
                  page: validatedPage,
                  index: pageCount,
                  chars: contentBuffer.length,
                  estimatedTokens: estimateTokens(contentBuffer),
                  reasoningChars,
                  reasoningEstimatedTokens: estimateTokens(reasoningChars),
                  firstPageTokens,
                })}\n\n`))
                sendProgress(`第 ${pageCount} 个页面已返回: ${validatedPage.name}`, pageCount === 1 ? 'first_page_ready' : 'page_ready')
              }
            }

            clearInterval(heartbeat)
            // eslint-disable-next-line no-console
            console.log(`[AI] stream done: ${pageCount} pages, buffer=${contentBuffer.length} chars`)
            if (pageCount === 0) {
              // eslint-disable-next-line no-console
              console.log(`[AI] buffer full: ${contentBuffer}`)
            }

            // fallback：增量解析没拿到 page 时整体解析
            if (pageCount === 0 && contentBuffer.length > 0) {
              try {
                const jsonStr = extractJsonPayload(contentBuffer)
                const parsed = JSON.parse(jsonStr)
                const pagesArr = parsed.pages || (parsed.elements ? [{ id: 'page-1', name: '页面 1', canvas: parsed.canvas || { width: 375, height: 812 }, elements: parsed.elements }] : [])
                for (const pageData of pagesArr) {
                  pageCount++
                  const validatedPage = validatePage(pageData as Record<string, unknown>, pageCount - 1)
                  allPages.push(validatedPage as unknown as Record<string, unknown>)
                  if (pageCount === 1 && firstPageTokens === null) {
                    firstPageTokens = estimateTokens(contentBuffer)
                    clearFirstPageTimer()
                  }
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'page',
                    page: validatedPage,
                    index: pageCount,
                    chars: contentBuffer.length,
                    estimatedTokens: estimateTokens(contentBuffer),
                    reasoningChars,
                    reasoningEstimatedTokens: estimateTokens(reasoningChars),
                    firstPageTokens,
                  })}\n\n`))
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
              }).catch((err) => {
                console.error('[AI] failed to save generation:', err instanceof Error ? err.message : err)
              })
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'done',
              totalPages: pageCount,
              dailyRemaining: dailyLimit - todayCount - 1,
              dailyLimit,
              chars: contentBuffer.length,
              estimatedTokens: estimateTokens(contentBuffer),
              reasoningChars,
              reasoningEstimatedTokens: estimateTokens(reasoningChars),
              firstPageTokens,
            })}\n\n`))
            clearAllTimers()
            controller.close()
          } catch (err) {
            clearInterval(heartbeat)
            clearAllTimers()
            const errorMessage = upstreamAbort.signal.aborted && upstreamAbort.signal.reason instanceof Error
              ? upstreamAbort.signal.reason.message
              : err instanceof Error ? err.message : '生成失败'
            console.error('[AI] stream error:', errorMessage)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`))
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
      model: getAiConfig().model,
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
    const jsonStr = extractJsonPayload(responseContent)

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
        model: getAiConfig().model,
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
              model: getAiConfig().model,
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
