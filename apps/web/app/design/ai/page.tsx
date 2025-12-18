'use client'

import { useState, useEffect } from 'react'
import { useSession, SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { useUIStore } from '@/app/stores/ui'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Send, History, Sparkles, Loader2, Copy, Check } from 'lucide-react'
import { useEditorStore } from '@/app/stores/editor'

interface AIHistory {
  id: string
  prompt: string
  result: any
  timestamp: string
  cost: number
}

function AIContent() {
  const { data: session, status } = useSession()
  const { showToast } = useUIStore()
  const { addElement } = useEditorStore()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<AIHistory[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // 示例提示词
  const examplePrompts = [
    '创建一个现代化的登录页面，包含邮箱、密码输入框和登录按钮',
    '设计一个电商产品卡片，包含图片、标题、价格和购买按钮',
    '生成一个用户个人资料页面，包含头像、用户名和编辑按钮',
    '创建一个仪表板，包含统计卡片、图表和最近活动列表',
    '设计一个导航栏，包含logo、菜单项和用户头像下拉菜单'
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('请输入描述', 'warning')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      const result = await response.json()

      if (result.success && result.data?.design) {
        const design = result.data.design

        // 清空当前画布
        const currentElements = useEditorStore.getState().elements
        if (currentElements.length > 0) {
          useEditorStore.getState().clear()
        }

        // 设置画布尺寸
        if (design.canvas) {
          setCanvasSize({
            width: design.canvas.width || 375,
            height: design.canvas.height || 812
          })
        }

        // 添加生成的元素
        design.elements.forEach((element: any) => {
          addElement(element)
        })

        showToast(`AI 生成了 ${design.elements.length} 个元素`, 'success')
        
        // 跳转到编辑器
        router.push('/design/editor')
      } else {
        showToast(result.error || '生成失败', 'error')
      }
    } catch (error) {
      showToast('请求失败，请检查网络', 'error')
      console.error(error)
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
    } catch (error) {
      console.error('加载历史失败:', error)
    }
  }

  const loadDesign = (design: any) => {
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

    design.elements.forEach((element: any) => {
      addElement(element)
    })

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
      {/* 顶部导航 */}
      <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-4">
        <button
          onClick={() => router.push('/workspace')}
          className="flex items-center space-x-2 text-gray-400 hover:text-gray-200 transition-colors mr-4"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">返回</span>
        </button>
        
        <div className="flex items-center space-x-2 text-purple-400">
          <Zap size={20} />
          <h1 className="text-sm font-semibold">AI 设计生成器</h1>
        </div>
      </div>

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

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className={cn(
                  'w-full mt-4 flex items-center justify-center space-x-2',
                  'py-3 rounded-lg font-medium transition-all',
                  loading || !prompt.trim()
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
                    className={cn(
                      'w-full text-left p-3 rounded-lg bg-gray-900',
                      'text-gray-400 hover:text-gray-200 hover:bg-gray-700',
                      'transition-all text-sm border border-transparent',
                      'hover:border-gray-600'
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