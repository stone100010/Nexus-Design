'use client'

import { History, Loader2, Send, Sparkles, Wand2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect,useState } from 'react'

import { Navbar } from '@/components/shared/navbar'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'
import { DesignOutput } from '@/types'

interface AIHistory {
  id: string
  prompt: string
  response: DesignOutput
  createdAt: string
  tokensUsed: number
  cost: number
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
}

// 缩略图预览组件
function DesignThumbnail({ design }: { design: DesignOutput }) {
  if (!design?.elements?.length || !design?.canvas) return null

  const canvasW = design.canvas.width || 375
  const canvasH = design.canvas.height || 812
  const previewW = 160
  const scale = previewW / canvasW
  const previewH = canvasH * scale

  return (
    <div
      className="relative bg-gray-900 rounded border border-gray-700 overflow-hidden mt-2"
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
        {design.elements.map((el, i) => (
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
  )
}

function AIContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { showToast } = useUIStore()
  const { addElements, setCanvasSize } = useEditorStore()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<AIHistory[]>([])
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate')
  const [canvasSize, setCanvasSizeLocal] = useState<'iphone' | 'ipad' | 'desktop'>('iphone')
  const [style, setStyle] = useState<'modern' | 'minimal' | 'tech' | 'cute'>('modern')
  const [optimizeMode, setOptimizeMode] = useState(false)
  const [dailyRemaining, setDailyRemaining] = useState<number | null>(null)
  const [dailyLimit, setDailyLimit] = useState<number | null>(null)

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
    '创建一个现代化的登录页面，包含邮箱、密码输入框和登录按钮',
    '设计一个电商产品卡片，包含图片、标题、价格和购买按钮',
    '生成一个用户个人资料页面，包含头像、用户名和编辑按钮',
    '创建一个仪表板，包含统计卡片、图表和最近活动列表',
    '设计一个导航栏，包含logo、菜单项和用户头像下拉菜单'
  ]

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
    try {
      const sizeConfig = canvasSizes[canvasSize]
      const styleDesc = styles[style]

      // 构建增强提示词
      const enhancedPrompt = `${prompt}\n\n设计要求：\n- 画布尺寸：${sizeConfig.width}x${sizeConfig.height}px（${canvasSize}）\n- 设计风格：${styleDesc}\n${optimizeMode ? '- 在当前设计基础上优化改进' : ''}`

      // 获取最近的生成记录作为上下文
      const recentContext = history.slice(0, 3).map(h => h.prompt).join('；')
      const contextPrefix = recentContext ? `之前的生成记录：${recentContext}\n\n` : ''

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: contextPrefix + enhancedPrompt,
          canvasSize: sizeConfig,
          style,
        })
      })

      // 处理特定 HTTP 状态码
      if (response.status === 401) {
        showToast('请先登录', 'error')
        router.push('/auth/login')
        return
      }
      if (response.status === 429) {
        showToast('请求过于频繁，请稍后再试', 'warning')
        return
      }
      if (response.status >= 500) {
        showToast('AI 服务暂时不可用，请稍后重试', 'error')
        return
      }

      const result = await response.json()

      if (result.success && result.data?.design) {
        const design = result.data.design

        // 更新每日剩余次数
        if (result.data.metadata?.dailyRemaining !== undefined) {
          setDailyRemaining(result.data.metadata.dailyRemaining)
          setDailyLimit(result.data.metadata.dailyLimit)
        }

        // 优化模式下不清空，追加元素
        if (!optimizeMode) {
          const currentElements = useEditorStore.getState().elements
          if (currentElements.length > 0) {
            useEditorStore.getState().clear()
          }
        }

        // 设置画布尺寸
        if (design.canvas) {
          setCanvasSize({
            width: design.canvas.width || 375,
            height: design.canvas.height || 812
          })
        }

        // 批量添加生成的元素（只存一次历史）
        addElements(design.elements as Parameters<typeof addElements>[0])

        showToast(`AI 生成了 ${design.elements.length} 个元素`, 'success')

        // 跳转到编辑器
        router.push('/design/editor')
      } else {
        showToast(result.error || '生成失败', 'error')
      }
    } catch {
      showToast('网络连接失败，请检查网络', 'error')
    } finally {
      setLoading(false)
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

  const loadDesign = (design: DesignOutput) => {
    const currentElements = useEditorStore.getState().elements
    if (currentElements.length > 0) {
      if (!confirm('当前画布有内容，确定要覆盖吗？')) return
    }

    useEditorStore.getState().clear()
    
    if (design.canvas) {
      setCanvasSize({
        width: design.canvas.width || 375,
        height: design.canvas.height || 812
      })
    }

    addElements(design.elements as Parameters<typeof addElements>[0])

    showToast('设计已加载', 'success')
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
      <div className="max-w-4xl mx-auto p-6">
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
                  描述你想要的设计
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
                  <span className="text-xs text-gray-400">在当前设计基础上优化（不清空画布）</span>
                </label>
              )}

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：创建一个现代化的登录页面，包含邮箱、密码输入框和登录按钮"
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
                    <span>生成中...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>生成设计</span>
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
                <li>• 描述具体元素：登录表单、按钮、卡片等</li>
                <li>• 说明布局：居中、左右排列、网格等</li>
                <li>• 指定风格：现代、简约、科技感等</li>
                <li>• 包含功能：搜索框、导航、表单等</li>
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
                    <span>元素: {item.response?.elements?.length || 0}</span>
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