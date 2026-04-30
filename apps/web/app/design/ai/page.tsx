'use client'

import { Activity, History, Loader2, Send, Sparkles, Wand2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect,useState } from 'react'

import { Navbar } from '@/components/shared/navbar'
import { getTotalEstimatedTokens, writeAIStreamStatus } from '@/lib/ai-stream-status'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'
import { DesignOutput, DesignPage, MultiPageDesignOutput } from '@/types'

type DesignData = DesignOutput | MultiPageDesignOutput

interface AIHistory {
  id: string
  prompt: string
  response: DesignData
  createdAt: string
  tokensUsed: number
  cost: number
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
}

interface StreamStats {
  elapsed: number
  chars: number
  estimatedTokens: number
  reasoningChars: number
  reasoningEstimatedTokens: number
  pages: number
  firstPageTokens: number | null
  phase: string
}

// 判断是否为多页格式
function isMultiPage(data: DesignData): data is MultiPageDesignOutput {
  return 'pages' in data && Array.isArray(data.pages)
}

// 获取页面列表
function getPages(data: DesignData): DesignPage[] {
  if (isMultiPage(data)) {
    return data.pages
  }
  // 旧单页格式 → 转为单页
  if ('elements' in data && Array.isArray(data.elements)) {
    return [{
      id: 'page-1',
      name: '页面 1',
      canvas: data.canvas || { width: 375, height: 812 },
      elements: data.elements as DesignPage['elements'],
    }]
  }
  return []
}

// 获取总元素数
function getTotalElements(data: DesignData): number {
  return getPages(data).reduce((sum, p) => sum + p.elements.length, 0)
}

// 缩略图预览组件（支持多页）
function DesignThumbnail({ design }: { design: DesignData }) {
  const pages = getPages(design)
  if (pages.length === 0) return null

  const firstPage = pages[0]
  const canvasW = firstPage.canvas.width || 375
  const canvasH = firstPage.canvas.height || 812
  const previewW = 160
  const scale = previewW / canvasW
  const previewH = canvasH * scale

  return (
    <div className="mt-2">
      <div
        className="relative bg-gray-900 rounded border border-gray-700 overflow-hidden"
        style={{ width: previewW, height: Math.min(previewH, 120) }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: canvasW,
            height: canvasH,
          }}
        >
          {firstPage.elements.map((el, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                background: (el.styles?.background as string) || '#374151',
                borderRadius: (el.styles?.borderRadius as string) || '0',
                border: el.type === 'container' ? '1px solid #4b5563' : undefined,
              }}
            >
              {el.type === 'button' && (
                <div
                  className="w-full h-full flex items-center justify-center text-[8px] overflow-hidden"
                  style={{ color: (el.styles?.color as string) || '#fff' }}
                >
                  {String(el.props?.text || '')}
                </div>
              )}
              {el.type === 'text' && (
                <div
                  className="w-full h-full flex items-center overflow-hidden text-[8px]"
                  style={{ color: (el.styles?.color as string) || '#fff' }}
                >
                  {String(el.props?.text || '')}
                </div>
              )}
              {el.type === 'image' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={String(el.props?.src || '')}
                  className="w-full h-full"
                  style={{ objectFit: (el.styles?.objectFit as React.CSSProperties['objectFit']) || 'cover' }}
                  alt=""
                />
              )}
              {(el.type === 'input' || el.type === 'icon') && (
                <div
                  className="w-full h-full flex items-center justify-center text-[6px] text-gray-500 overflow-hidden"
                >
                  {el.type === 'input' ? String(el.props?.placeholder || '输入框') : String(el.props?.text || '⭐')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {pages.length > 1 && (
        <div className="text-[10px] text-gray-500 mt-1">
          共 {pages.length} 个页面
        </div>
      )}
    </div>
  )
}

function AIStreamTokenBanner({
  loading,
  streamProgress,
  streamStats,
}: {
  loading: boolean
  streamProgress: string
  streamStats: StreamStats | null
}) {
  const totalEstimatedTokens = getTotalEstimatedTokens(streamStats)

  return (
    <div className="rounded-2xl border-2 border-cyan-300 bg-gray-950 p-4 text-white shadow-2xl shadow-cyan-950/50">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/20', loading && 'animate-pulse')}>
            <Activity size={24} className="text-cyan-200" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-[0.22em] text-cyan-200">AI TOKENS 实时计数</div>
            <div className="mt-1 text-sm text-gray-200">
              {streamProgress || (loading ? '等待 AI 返回...' : '待启动：点击“启动 UI 设计”后这里会实时跳 tokens')}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-right">
          <div className="rounded-xl bg-cyan-400 px-3 py-2 text-gray-950">
            <div className="text-[10px] font-semibold">总 tokens</div>
            <div className="text-3xl font-black">{totalEstimatedTokens.toLocaleString()}</div>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-2">
            <div className="text-[10px] text-gray-400">输出</div>
            <div className="text-xl font-bold text-gray-100">{(streamStats?.estimatedTokens ?? 0).toLocaleString()}</div>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-2">
            <div className="text-[10px] text-gray-400">字符</div>
            <div className="text-xl font-bold text-gray-100">{(streamStats?.chars ?? 0).toLocaleString()}</div>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-2">
            <div className="text-[10px] text-gray-400">页面</div>
            <div className="text-xl font-bold text-gray-100">{streamStats?.pages ?? 0}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AIContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { showToast } = useUIStore()
  const { setPages, setActivePage, clear } = useEditorStore()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<AIHistory[]>([])
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate')
  const [canvasSize, setCanvasSizeLocal] = useState<'iphone' | 'ipad' | 'desktop'>('iphone')
  const [style, setStyle] = useState<'modern' | 'minimal' | 'tech' | 'cute'>('modern')
  const [optimizeMode, setOptimizeMode] = useState(false)
  const [dailyRemaining, setDailyRemaining] = useState<number | null>(null)
  const [dailyLimit, setDailyLimit] = useState<number | null>(null)
  const [streamProgress, setStreamProgress] = useState<string>('')
  const [streamStats, setStreamStats] = useState<StreamStats | null>(null)
  const [generationError, setGenerationError] = useState<string>('')

  const canvasSizes = {
    iphone: { width: 375, height: 812, label: 'iPhone' },
    ipad: { width: 768, height: 1024, label: 'iPad' },
    desktop: { width: 1920, height: 1080, label: 'Desktop' },
  }

  const styles = {
    modern: '现代风格：圆角、渐变、阴影',
    minimal: '简约风格：留白、细线、单色',
    tech: '科技风格：深色、霓虹、几何',
    cute: '可爱风格：粉色、圆润、卡通',
  }

  // 示例提示词
  const examplePrompts = [
    '设计一个完整的电商APP，包含启动页、首页、商品详情、购物车和个人中心',
    '创建一个社交媒体APP，包含登录页、动态流、消息列表和个人主页',
    '生成一个健身APP，包含首页仪表盘、运动记录、课程列表和我的设置',
    '设计一个新闻资讯APP，包含启动页、首页推荐、文章详情和收藏夹',
    '创建一个在线教育APP，包含首页课程推荐、课程详情、学习进度和个人中心',
  ]

  const formatGenerationError = (message: string) => {
    if (message.includes('401') || message.includes('令牌') || message.toLowerCase().includes('api key')) {
      return 'AI 服务认证失败：NEXUS_OPENAI_API_KEY 已过期或不正确，请更新 apps/web/.env.local 后重启服务。'
    }
    return message || '生成失败，请稍后重试'
  }

  const updateStreamStats = (data: Partial<StreamStats>) => {
    setStreamStats((current) => ({
      elapsed: data.elapsed ?? current?.elapsed ?? 0,
      chars: data.chars ?? current?.chars ?? 0,
      estimatedTokens: data.estimatedTokens ?? current?.estimatedTokens ?? 0,
      reasoningChars: data.reasoningChars ?? current?.reasoningChars ?? 0,
      reasoningEstimatedTokens: data.reasoningEstimatedTokens ?? current?.reasoningEstimatedTokens ?? 0,
      pages: data.pages ?? current?.pages ?? 0,
      firstPageTokens: data.firstPageTokens ?? current?.firstPageTokens ?? null,
      phase: data.phase ?? current?.phase ?? 'connecting',
    }))
  }

  const publishStreamStatus = (stats: StreamStats, message: string, active = true) => {
    writeAIStreamStatus({
      active,
      message,
      phase: stats.phase,
      elapsed: stats.elapsed,
      chars: stats.chars,
      estimatedTokens: stats.estimatedTokens,
      reasoningChars: stats.reasoningChars,
      reasoningEstimatedTokens: stats.reasoningEstimatedTokens,
      pages: stats.pages,
      firstPageTokens: stats.firstPageTokens,
      updatedAt: Date.now(),
    })
  }

  const mergeStreamStats = (data: Partial<StreamStats>) => ({
    elapsed: data.elapsed ?? streamStats?.elapsed ?? 0,
    chars: data.chars ?? streamStats?.chars ?? 0,
    estimatedTokens: data.estimatedTokens ?? streamStats?.estimatedTokens ?? 0,
    reasoningChars: data.reasoningChars ?? streamStats?.reasoningChars ?? 0,
    reasoningEstimatedTokens: data.reasoningEstimatedTokens ?? streamStats?.reasoningEstimatedTokens ?? 0,
    pages: data.pages ?? streamStats?.pages ?? 0,
    firstPageTokens: data.firstPageTokens ?? streamStats?.firstPageTokens ?? null,
    phase: data.phase ?? streamStats?.phase ?? 'connecting',
  })

  useEffect(() => {
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('请输入描述', 'warning')
      return
    }

    setLoading(true)
    setStreamProgress('')
    const initialStats = {
      elapsed: 0,
      chars: 0,
      estimatedTokens: 0,
      reasoningChars: 0,
      reasoningEstimatedTokens: 0,
      pages: 0,
      firstPageTokens: null,
      phase: 'connecting',
    }
    setStreamStats(initialStats)
    publishStreamStatus(initialStats, '已提交请求，等待 AI 连接...')
    setGenerationError('')
    try {
      const sizeConfig = canvasSizes[canvasSize]
      const styleDesc = styles[style]

      const enhancedPrompt = `${prompt}\n\n设计要求：\n- 画布尺寸：${sizeConfig.width}x${sizeConfig.height}px（${canvasSize}）\n- 设计风格：${styleDesc}\n${optimizeMode ? '- 在当前设计基础上优化改进' : ''}`

      const recentContext = history.slice(0, 3).map(h => h.prompt).join('；')
      const contextPrefix = recentContext ? `之前的生成记录：${recentContext}\n\n` : ''

      // 优化模式下不清空
      if (!optimizeMode) {
        clear()
      }

      // 流式请求
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: contextPrefix + enhancedPrompt,
          canvasSize: sizeConfig,
          style,
          stream: true,
        }),
      })

      if (response.status === 401) {
        showToast('请先登录', 'error')
        router.push('/auth/login')
        return
      }

      if (!response.ok) {
        const result = await response.json()
        const message = formatGenerationError(result.error || '生成失败')
        setGenerationError(message)
        showToast(message, 'error')
        return
      }

      // 读取 SSE 流
      const reader = response.body?.getReader()
      if (!reader) {
        const message = '响应流异常，请重试'
        setGenerationError(message)
        showToast(message, 'error')
        return
      }

      const decoder = new TextDecoder()
      let sseBuffer = ''
      let receivedPages = 0
      let firstPageSet = false

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break

        sseBuffer += decoder.decode(value, { stream: true })

        // 解析 SSE 事件（以 \n\n 分隔）
        const events = sseBuffer.split('\n\n')
        sseBuffer = events.pop() || '' // 最后一个可能是不完整的

        for (const event of events) {
          const dataLine = event.trim()
          if (!dataLine.startsWith('data: ')) continue

          try {
            const data = JSON.parse(dataLine.slice(6))

            if (data.type === 'progress') {
              setStreamProgress(data.message || 'AI 正在生成中...')
              const nextStats = mergeStreamStats(data)
              updateStreamStats(nextStats)
              publishStreamStatus(nextStats, data.message || 'AI 正在生成中...')

            } else if (data.type === 'page') {
              receivedPages++
              const page = data.page as DesignPage
              setStreamProgress(`正在生成第 ${receivedPages} 个页面: ${page.name}`)
              const nextStats = mergeStreamStats({
                elapsed: data.elapsed,
                chars: data.chars,
                estimatedTokens: data.estimatedTokens,
                reasoningChars: data.reasoningChars,
                reasoningEstimatedTokens: data.reasoningEstimatedTokens,
                pages: receivedPages,
                firstPageTokens: data.firstPageTokens,
                phase: receivedPages === 1 ? 'first_page_ready' : 'page_ready',
              })
              updateStreamStats(nextStats)
              publishStreamStatus(nextStats, `第 ${receivedPages} 个页面已返回: ${page.name}`)

              useEditorStore.getState().addPage(page)
              if (!firstPageSet) {
                useEditorStore.getState().setActivePage(page.id)
                firstPageSet = true
                // 第一个页面完成，立即跳转编辑器
                router.push('/design/editor')
              }

            } else if (data.type === 'done') {
              const nextStats = mergeStreamStats({
                chars: data.chars,
                estimatedTokens: data.estimatedTokens,
                reasoningChars: data.reasoningChars,
                reasoningEstimatedTokens: data.reasoningEstimatedTokens,
                pages: data.totalPages,
                firstPageTokens: data.firstPageTokens,
                phase: 'done',
              })
              updateStreamStats(nextStats)
              publishStreamStatus(nextStats, `生成完成，共 ${data.totalPages} 个页面`, false)
              if (data.dailyRemaining !== undefined) {
                setDailyRemaining(data.dailyRemaining)
                setDailyLimit(data.dailyLimit)
              }
              showToast(`AI 生成了 ${data.totalPages} 个页面`, 'success')

            } else if (data.type === 'error') {
              const message = formatGenerationError(data.error || '生成失败')
              setGenerationError(message)
              if (streamStats) publishStreamStatus(streamStats, message, false)
              showToast(message, 'error')
            }
          } catch {
            // 忽略解析错误
          }
        }
      }

      if (receivedPages === 0) {
        const message = generationError || 'AI 未返回有效数据，请重试'
        setGenerationError(message)
        showToast(message, 'warning')
      }

    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        const message = '生成超时，请简化描述后重试'
        setGenerationError(message)
        showToast(message, 'error')
      } else {
        const message = '网络连接失败，请检查服务日志或网络状态'
        setGenerationError(message)
        showToast(message, 'error')
      }
    } finally {
      setLoading(false)
      setStreamProgress('')
    }
  }

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/ai/generate')
      const result = await response.json()

      if (result.success) {
        setHistory(result.data)
      }
    } catch {
      showToast('加载历史失败', 'error')
    }
  }

  const loadDesign = (design: DesignData) => {
    const pages = getPages(design)
    if (pages.length === 0) return

    const currentElements = useEditorStore.getState().getActivePage()?.elements ?? []
    if (currentElements.length > 0) {
      if (!confirm('当前画布有内容，确定要覆盖吗？')) return
    }

    clear()
    setPages(pages)
    if (pages.length > 0) {
      setActivePage(pages[0].id)
    }

    showToast(`已加载 ${pages.length} 个页面`, 'success')
    router.push('/design/editor')
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <AIStreamTokenBanner
          loading={loading}
          streamProgress={streamProgress}
          streamStats={streamStats}
        />

        {/* 标签页切换 */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('generate')}
            className={cn(
              'flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all',
              activeTab === 'generate'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            )}
          >
            <Wand2 size={16} />
            <span>生成设计</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('history')
              loadHistory()
            }}
            className={cn(
              'flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all',
              activeTab === 'history'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            )}
          >
            <History size={16} />
            <span>历史记录</span>
          </button>
        </div>

        {/* 生成面板 */}
        {activeTab === 'generate' && (
          <div className="space-y-6">
            {/* 输入区域 */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles size={20} className="text-purple-400" />
                <h2 className="text-lg font-semibold text-gray-200">
                  描述你想要的 APP 设计
                </h2>
              </div>

              {/* 设备尺寸选择 */}
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-2">画布尺寸</div>
                <div className="flex space-x-2">
                  {(Object.keys(canvasSizes) as Array<keyof typeof canvasSizes>).map((key) => (
                    <button
                      key={key}
                      onClick={() => setCanvasSizeLocal(key)}
                      className={cn(
                        'px-3 py-1.5 text-xs rounded-lg transition-all',
                        canvasSize === key
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      )}
                    >
                      {canvasSizes[key].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 风格选择 */}
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-2">设计风格</div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(styles) as Array<keyof typeof styles>).map((key) => (
                    <button
                      key={key}
                      onClick={() => setStyle(key)}
                      className={cn(
                        'px-3 py-1.5 text-xs rounded-lg transition-all',
                        style === key
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      )}
                    >
                      {key === 'modern' ? '现代' : key === 'minimal' ? '简约' : key === 'tech' ? '科技' : '可爱'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 优化模式 */}
              {history.length > 0 && (
                <label className="flex items-center space-x-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optimizeMode}
                    onChange={(e) => setOptimizeMode(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-xs text-gray-400">在当前设计基础上优化（追加页面）</span>
                </label>
              )}

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：设计一个完整的电商APP，包含启动页、首页、商品详情、购物车和个人中心"
                className={cn(
                  'w-full h-32 p-4 bg-gray-900 border border-gray-700 rounded-lg',
                  'text-gray-200 placeholder-gray-600 resize-none focus:outline-none',
                  'focus:border-purple-500 transition-colors'
                )}
                disabled={loading}
              />

              {dailyRemaining !== null && dailyLimit !== null && (
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>今日剩余: {dailyRemaining} / {dailyLimit}</span>
                  <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        dailyRemaining > 10 ? 'bg-green-500' : dailyRemaining > 3 ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                      style={{ width: `${(dailyRemaining / dailyLimit) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {generationError && (
                <div className="mt-3 rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
                  {generationError}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim() || dailyRemaining === 0}
                className={cn(
                  'w-full mt-4 flex items-center justify-center space-x-2',
                  'py-3 rounded-lg font-medium transition-all',
                  loading || !prompt.trim() || dailyRemaining === 0
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                )}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span className="max-w-full truncate">
                      {streamProgress || '生成中...'} · {getTotalEstimatedTokens(streamStats).toLocaleString()} tokens · {(streamStats?.chars ?? 0).toLocaleString()} 字符
                    </span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>启动 UI 设计</span>
                  </>
                )}
              </button>
            </div>

            {/* 示例提示 */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                示例提示词
              </h3>
              <div className="space-y-2">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    disabled={loading}
                    className={cn(
                      'w-full text-left p-3 rounded-lg bg-gray-900',
                      'text-gray-400 hover:text-gray-200 hover:bg-gray-700',
                      'transition-all text-sm border border-transparent',
                      'hover:border-gray-600',
                      loading && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* 提示技巧 */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                提示技巧
              </h3>
              <ul className="text-xs text-gray-400 space-y-2">
                <li>• 描述完整 APP：包含多个页面（启动页、首页、详情页等）</li>
                <li>• 说明功能流：用户从哪到哪，页面间如何跳转</li>
                <li>• 指定风格：现代、简约、科技感等</li>
                <li>• 包含关键页面：登录、首页、详情、个人中心</li>
              </ul>
            </div>
          </div>
        )}

        {/* 历史记录面板 */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* 使用量统计 */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">使用量统计</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{history.length}</div>
                  <div className="text-xs text-gray-500">总调用次数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {history.reduce((sum, h) => sum + (h.tokensUsed || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Token 消耗</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    ${history.reduce((sum, h) => sum + (h.cost || 0), 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">总成本</div>
                </div>
              </div>
            </div>
            {history.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
                <History size={40} className="mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400">暂无生成历史</p>
                <p className="text-xs text-gray-600 mt-2">
                  生成的设计会在这里显示
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'bg-gray-800 rounded-lg p-4 border border-gray-700',
                    'hover:border-purple-500 transition-all'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm text-gray-300 font-medium line-clamp-1">
                        {item.prompt}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                      {item.status === 'SUCCESS' && item.response && (
                        <DesignThumbnail design={item.response} />
                      )}
                    </div>
                    <button
                      onClick={() => loadDesign(item.response)}
                      className={cn(
                        'ml-2 px-3 py-1 text-xs rounded',
                        'bg-purple-600 hover:bg-purple-700 text-white',
                        'transition-colors'
                      )}
                    >
                      加载
                    </button>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span>页面: {getPages(item.response).length}</span>
                    <span>元素: {getTotalElements(item.response)}</span>
                    <span>Token: {item.tokensUsed}</span>
                    <span>成本: ${item.cost.toFixed(4)}</span>
                    <span className={cn(
                      'px-2 py-0.5 rounded',
                      item.status === 'SUCCESS' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                    )}>
                      {item.status === 'SUCCESS' ? '成功' : '失败'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AIPage() {
  return <AIContent />
}
