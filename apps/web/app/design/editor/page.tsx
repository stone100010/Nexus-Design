'use client'

import { 
  ArrowLeft,
  Download, 
  History, 
  Play, 
  Save, 
  Settings as SettingsIcon,
  Trash2,
  Users,
  Zap} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession, SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import React, { useEffect,useState } from 'react'

import { Canvas } from '@/components/editor/canvas'
import { ComponentLibrary } from '@/components/editor/component-library'
import { PropertiesPanel } from '@/components/editor/properties-panel'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'

function DesignEditorContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { 
    elements, 
    saveProject, 
    loadProject, 
    clearCanvas,
    undo,
    redo,
    canUndo,
    canRedo,
    isSaving,
    history
  } = useEditorStore()
  
  const { showToast } = useUIStore()
  const [showShortcuts, setShowShortcuts] = useState(false)

  // 检查认证状态
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?redirect=/design/editor')
    }
  }, [status, router])

  // 自动保存
  useEffect(() => {
    if (elements.length > 0) {
      const timer = setTimeout(() => {
        saveProject('draft')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [elements, saveProject])

  // 保存处理函数
  const handleSave = async () => {
    try {
      await saveProject('manual')
      showToast('项目已保存', 'success')
    } catch (error) {
      showToast('保存失败', 'error')
    }
  }

  // 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            handleSave()
            break
          case 'z':
            e.preventDefault()
            if (canUndo()) {
              undo()
              showToast('已撤销', 'info')
            }
            break
          case 'y':
            e.preventDefault()
            if (canRedo()) {
              redo()
              showToast('已重做', 'info')
            }
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, canRedo, undo, redo, showToast])

  const handleExport = () => {
    // 生成 React 代码
    const reactCode = generateReactCode()
    
    // 创建下载链接
    const blob = new Blob([reactCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'design-component.tsx'
    a.click()
    URL.revokeObjectURL(url)
    
    showToast('代码已导出', 'success')
  }

  const handleAI = () => {
    showToast('AI 生成器即将推出', 'info')
    router.push('/design/ai')
  }

  const handleClear = () => {
    if (confirm('确定要清空画布吗？此操作不可恢复。')) {
      clearCanvas()
      showToast('画布已清空', 'info')
    }
  }

  const handleLoad = async () => {
    try {
      await loadProject('draft')
      showToast('项目已加载', 'success')
    } catch (error) {
      showToast('加载失败', 'error')
    }
  }

  const generateReactCode = () => {
    const code = `import React from 'react'

export default function GeneratedComponent() {
  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      background: '#111827'
    }}>
      ${elements.map(el => {
        const style = {
          position: 'absolute',
          left: el.x + 'px',
          top: el.y + 'px',
          width: el.width + 'px',
          height: el.height + 'px',
          ...el.styles
        }
        
        if (el.type === 'button') {
          return `<button style={${JSON.stringify(style, null, 2)}}>${el.props?.text || '按钮'}</button>`
        } else if (el.type === 'text') {
          return `<div style={${JSON.stringify(style, null, 2)}}>${el.props?.text || '文本'}</div>`
        } else {
          return `<div style={${JSON.stringify(style, null, 2)}}>${el.props?.children || ''}</div>`
        }
      }).join('\n      ')}
    </div>
  )
}
`
    return code
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
    <div className="flex flex-col h-screen bg-gray-900">
      {/* 顶部工具栏 */}
      <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/workspace')}
            className="flex items-center space-x-2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">返回</span>
          </button>
          
          <div className="w-px h-6 bg-gray-600" />
          
          <h1 className="text-sm font-semibold text-white">设计编辑器</h1>
          
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span>元素: {elements.length}</span>
            <span>·</span>
            <span>历史: {history.length}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* 撤销/重做 */}
          <div className="flex items-center space-x-1 mr-2">
            <button
              onClick={() => {
                undo()
                showToast('已撤销', 'info')
              }}
              disabled={!canUndo()}
              className={cn(
                'p-2 rounded transition-colors',
                canUndo() ? 'hover:bg-gray-700' : 'opacity-30 cursor-not-allowed'
              )}
              title="撤销 (Ctrl+Z)"
            >
              <History size={16} />
            </button>
          </div>

          {/* AI 生成 */}
          <button
            onClick={handleAI}
            className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-xs transition-colors"
          >
            <Zap size={14} />
            <span>AI 生成</span>
          </button>

          {/* 导出 */}
          <button
            onClick={handleExport}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
          >
            <Download size={14} />
            <span>导出</span>
          </button>

          {/* 保存 */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              'flex items-center space-x-1 px-3 py-1.5 rounded text-xs transition-colors',
              isSaving ? 'bg-gray-600 cursor-wait' : 'bg-green-600 hover:bg-green-700'
            )}
            title="保存 (Ctrl+S)"
          >
            <Save size={14} />
            <span>{isSaving ? '保存中...' : '保存'}</span>
          </button>

          {/* 更多操作 */}
          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={handleLoad}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="加载草稿"
            >
              <Play size={16} />
            </button>
            <button
              onClick={handleClear}
              className="p-2 hover:bg-red-900/50 text-red-400 rounded transition-colors"
              title="清空画布"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className={cn(
                'p-2 rounded transition-colors',
                showShortcuts ? 'bg-gray-700' : 'hover:bg-gray-700'
              )}
              title="快捷键"
            >
              <SettingsIcon size={16} />
            </button>
          </div>

          {/* 用户信息 */}
          <div className="ml-4 flex items-center space-x-2 pl-4 border-l border-gray-600">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold">
              {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-medium text-gray-200">
                {session.user?.name || session.user?.email}
              </div>
              <div className="text-[10px] text-gray-500">编辑器就绪</div>
            </div>
          </div>
        </div>
      </div>

      {/* 工作区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：组件库 */}
        <div className="w-64 border-r border-gray-700 bg-gray-800">
          <ComponentLibrary />
        </div>

        {/* 中间：画布 */}
        <div className="flex-1 bg-gray-900 relative">
          <Canvas />
        </div>

        {/* 右侧：属性面板 */}
        <div className="w-72 border-l border-gray-700 bg-gray-800">
          <PropertiesPanel />
        </div>
      </div>

      {/* 快捷键提示 */}
      {showShortcuts && (
        <div className="absolute bottom-4 left-4 z-50 bg-gray-800/95 backdrop-blur rounded-lg p-4 border border-gray-700 shadow-xl w-80">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-200">键盘快捷键</h3>
            <button
              onClick={() => setShowShortcuts(false)}
              className="text-gray-400 hover:text-gray-200"
            >
              ×
            </button>
          </div>
          <div className="space-y-1 text-xs text-gray-300">
            <div className="flex justify-between"><span>保存项目</span><span className="font-mono text-gray-400">Ctrl+S</span></div>
            <div className="flex justify-between"><span>撤销</span><span className="font-mono text-gray-400">Ctrl+Z</span></div>
            <div className="flex justify-between"><span>重做</span><span className="font-mono text-gray-400">Ctrl+Y</span></div>
            <div className="flex justify-between"><span>删除元素</span><span className="font-mono text-gray-400">Delete</span></div>
            <div className="flex justify-between"><span>添加元素</span><span className="font-mono text-gray-400">双击画布</span></div>
            <div className="flex justify-between"><span>平移画布</span><span className="font-mono text-gray-400">中键/Ctrl+拖拽</span></div>
          </div>
        </div>
      )}

      {/* 保存状态提示 */}
      {isSaving && (
        <div className="absolute top-20 right-4 bg-blue-600/90 backdrop-blur text-white text-xs px-3 py-2 rounded-lg shadow-lg animate-pulse">
          保存中...
        </div>
      )}
    </div>
  )
}