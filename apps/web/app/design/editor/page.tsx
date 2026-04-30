'use client'

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  BookOpen,
  Download,
  History,
  Moon,
  Play,
  Save,
  Settings as SettingsIcon,
  Sun,
  Trash2,
  Zap} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect,useState } from 'react'

import { cn } from '@/lib/utils'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'

// Dynamic imports for code splitting
const Canvas = dynamic(() => import('@/components/editor/canvas'), { ssr: false })
const ComponentLibrary = dynamic(() => import('@/components/editor/component-library'), { ssr: false })
const PropertiesPanel = dynamic(() => import('@/components/editor/properties-panel'), { ssr: false })

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
    history,
    selectedElementIds,
    alignElements,
    theme,
    setTheme,
    saveVersion,
  } = useEditorStore()

  const { showToast } = useUIStore()
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showCodePreview, setShowCodePreview] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [versions, setVersions] = useState<Record<string, unknown>[]>([])
  const [exportFormat, setExportFormat] = useState<'react' | 'vue' | 'html'>('react')

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
    } catch {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUndo, canRedo, undo, redo, showToast])

  const handleExport = () => {
    let code: string
    switch (exportFormat) {
      case 'vue':
        code = generateVueCode()
        break
      case 'html':
        code = generateHtmlCode()
        break
      default:
        code = generateReactCode()
    }
    setGeneratedCode(code)
    setShowCodePreview(true)
  }

  const handleDownloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const ext = exportFormat === 'vue' ? 'vue' : exportFormat === 'html' ? 'html' : 'tsx'
    const timestamp = new Date().toISOString().slice(0, 10)
    a.download = `design-${timestamp}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    setShowCodePreview(false)
    showToast('代码已导出', 'success')
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode)
    showToast('代码已复制到剪贴板', 'success')
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

  // Version management
  const handleSaveVersion = async () => {
    await saveVersion()
  }

  const handleLoadVersions = async () => {
    const projectId = localStorage.getItem('currentProjectId')
    if (!projectId) {
      showToast('请先保存项目', 'warning')
      return
    }
    try {
      const response = await fetch(`/api/projects/${projectId}/versions`)
      const result = await response.json()
      if (result.success) {
        setVersions(result.data || [])
        setShowVersionHistory(true)
      }
    } catch {
      showToast('加载版本历史失败', 'error')
    }
  }

  const handleLoadVersion = async (versionId: string) => {
    const projectId = localStorage.getItem('currentProjectId')
    if (!projectId) return
    const { loadVersion } = useEditorStore.getState()
    await loadVersion(projectId, versionId)
    setShowVersionHistory(false)
  }

  // Alignment
  const handleAlign = (direction: 'left' | 'right' | 'center-h' | 'center-v') => {
    if (selectedElementIds.length < 2) {
      showToast('请选择至少 2 个元素', 'warning')
      return
    }
    alignElements(direction)
  }

  // Theme toggle
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleLoad = async () => {
    try {
      await loadProject('draft')
      showToast('项目已加载', 'success')
    } catch {
      showToast('加载失败', 'error')
    }
  }

  const generateReactCode = () => {
    const elementCode = elements.map(el => {
      const posStyle = `left: ${el.x}px, top: ${el.y}px, width: ${el.width}px, height: ${el.height}px`
      const styleProps = Object.entries(el.styles || {})
        .map(([k, v]) => `${k}: '${v}'`)
        .join(', ')

      if (el.type === 'button') {
        return `      <button
        style={{ position: 'absolute', ${posStyle}, ${styleProps} }}
        className="rounded-md font-medium transition-colors hover:opacity-90"
      >
        ${el.props?.text || '按钮'}
      </button>`
      } else if (el.type === 'text') {
        return `      <div
        style={{ position: 'absolute', ${posStyle}, ${styleProps} }}
      >
        ${el.props?.text || '文本'}
      </div>`
      } else if (el.type === 'input') {
        return `      <input
        placeholder="${el.props?.placeholder || '请输入...'}"
        style={{ position: 'absolute', ${posStyle}, ${styleProps} }}
        className="rounded-md border px-3 py-2"
      />`
      } else if (el.type === 'image') {
        return `      <img
        src="${el.props?.src || ''}"
        alt="${el.props?.alt || ''}"
        style={{ position: 'absolute', ${posStyle}, ${styleProps} }}
      />`
      } else {
        return `      <div
        style={{ position: 'absolute', ${posStyle}, ${styleProps} }}
        className="rounded-md"
      >
        ${el.props?.text || el.props?.children || ''}
      </div>`
      }
    }).join('\n\n')

    return `import React from 'react'

export default function GeneratedComponent() {
  return (
    <div className="relative w-full min-h-screen bg-gray-900">
${elementCode}
    </div>
  )
}
`
  }

  const generateVueCode = () => {
    const elementCode = elements.map(el => {
      const style = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;${Object.entries(el.styles || {}).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`).join(';')}`

      if (el.type === 'button') {
        return `    <button style="${style}" class="rounded-md font-medium">${el.props?.text || '按钮'}</button>`
      } else if (el.type === 'text') {
        return `    <div style="${style}">${el.props?.text || '文本'}</div>`
      } else if (el.type === 'input') {
        return `    <input placeholder="${el.props?.placeholder || '请输入...'}" style="${style}" class="rounded-md border px-3 py-2" />`
      } else if (el.type === 'image') {
        return `    <img src="${el.props?.src || ''}" alt="${el.props?.alt || ''}" style="${style}" />`
      } else {
        return `    <div style="${style}" class="rounded-md">${el.props?.text || el.props?.children || ''}</div>`
      }
    }).join('\n')

    return `<template>
  <div class="design-container">
${elementCode}
  </div>
</template>

<script setup lang="ts">
// Generated by Nexus Design
</script>

<style scoped>
.design-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: #111827;
}
</style>
`
  }

  const generateHtmlCode = () => {
    const elementCode = elements.map(el => {
      const style = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;${Object.entries(el.styles || {}).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`).join(';')}`

      if (el.type === 'button') {
        return `    <button style="${style}">${el.props?.text || '按钮'}</button>`
      } else if (el.type === 'text') {
        return `    <div style="${style}">${el.props?.text || '文本'}</div>`
      } else if (el.type === 'input') {
        return `    <input placeholder="${el.props?.placeholder || '请输入...'}" style="${style}" />`
      } else if (el.type === 'image') {
        return `    <img src="${el.props?.src || ''}" alt="${el.props?.alt || ''}" style="${style}" />`
      } else {
        return `    <div style="${style}">${el.props?.text || el.props?.children || ''}</div>`
      }
    }).join('\n')

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Design</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .design-container { position: relative; width: 100%; min-height: 100vh; background: #111827; }
    button { cursor: pointer; border: none; }
    input { outline: none; }
  </style>
</head>
<body>
  <div class="design-container">
${elementCode}
  </div>
</body>
</html>
`
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
            <span>·</span>
            <span className={`flex items-center space-x-1 ${isSaving ? 'text-yellow-400' : 'text-green-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
              <span>{isSaving ? '保存中...' : '已保存'}</span>
            </span>
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

          {/* 对齐工具 */}
          {selectedElementIds.length >= 2 && (
            <div className="flex items-center space-x-1 border-l border-gray-600 pl-2 ml-2">
              <button onClick={() => handleAlign('left')} className="p-1.5 hover:bg-gray-700 rounded" title="左对齐">
                <AlignLeft size={14} />
              </button>
              <button onClick={() => handleAlign('center-h')} className="p-1.5 hover:bg-gray-700 rounded" title="水平居中">
                <AlignCenter size={14} />
              </button>
              <button onClick={() => handleAlign('right')} className="p-1.5 hover:bg-gray-700 rounded" title="右对齐">
                <AlignRight size={14} />
              </button>
            </div>
          )}

          {/* 保存版本 */}
          <button
            onClick={handleSaveVersion}
            className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-xs transition-colors"
            title="保存版本"
          >
            <BookOpen size={14} />
            <span>版本</span>
          </button>

          {/* 版本历史 */}
          <button
            onClick={handleLoadVersions}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
            title="版本历史"
          >
            <History size={14} />
            <span>历史</span>
          </button>

          {/* 主题切换 */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title={theme === 'dark' ? '切换亮色' : '切换暗色'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* 导出格式选择 */}
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'react' | 'vue' | 'html')}
            className="px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200 focus:outline-none"
          >
            <option value="react">React TSX</option>
            <option value="vue">Vue SFC</option>
            <option value="html">HTML/CSS</option>
          </select>

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

      {/* 版本历史侧边栏 */}
      {showVersionHistory && (
        <div className="absolute top-14 right-0 bottom-0 w-80 bg-gray-800/95 backdrop-blur border-l border-gray-700 z-40 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-200">版本历史</h3>
            <button
              onClick={() => setShowVersionHistory(false)}
              className="text-gray-400 hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {versions.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                暂无版本记录
              </div>
            ) : (
              versions.map((version) => (
                <button
                  key={String(version.id)}
                  onClick={() => handleLoadVersion(String(version.id))}
                  className="w-full text-left p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 border border-transparent hover:border-gray-600 transition-all"
                >
                  <div className="text-sm text-gray-200 font-medium">
                    {String(version.description || `版本 ${version.version}`)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(String(version.createdAt)).toLocaleString('zh-CN')}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* 保存状态提示 */}
      {isSaving && (
        <div className="absolute top-20 right-4 bg-blue-600/90 backdrop-blur text-white text-xs px-3 py-2 rounded-lg shadow-lg animate-pulse">
          保存中...
        </div>
      )}

      {/* Code Preview Modal */}
      {showCodePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[80vh] bg-gray-800 rounded-lg border border-gray-700 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-sm font-semibold text-gray-200">代码预览</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  复制代码
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                >
                  下载文件
                </button>
                <button
                  onClick={() => setShowCodePreview(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap bg-gray-900 rounded p-4">
                {generatedCode}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function EditorPage() {
  return <DesignEditorContent />
}