'use client'

import { Maximize2, Plus, Sparkles, ZoomIn, ZoomOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'
import { EditorElement } from '@/types'

const EMPTY_ELEMENTS: EditorElement[] = []

// Memoized element renderer
const CanvasElement = React.memo<{
  element: EditorElement
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent, element: EditorElement) => void
}>(({ element, isSelected, onMouseDown }) => {
  return (
    <div
      className={cn(
        'absolute cursor-move transition-all',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900'
      )}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
      }}
      onMouseDown={(e) => onMouseDown(e, element)}
    >
      {element.type === 'button' && (
        <button
          className="w-full h-full flex items-center justify-center"
          style={element.styles as React.CSSProperties}
        >
          {String(element.props?.text || '按钮')}
        </button>
      )}

      {element.type === 'text' && (
        <div
          className="w-full h-full flex items-center"
          style={element.styles as React.CSSProperties}
        >
          {String(element.props?.text || '文本')}
        </div>
      )}

      {element.type === 'container' && (
        <div
          className="w-full h-full"
          style={element.styles as React.CSSProperties}
        >
          {String(element.props?.children || '')}
        </div>
      )}

      {element.type === 'image' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={String(element.props?.src || '')}
          alt={String(element.props?.alt || '')}
          className="w-full h-full"
          style={element.styles as React.CSSProperties}
          draggable={false}
        />
      )}

      {element.type === 'input' && (
        <input
          type={String(element.props?.type || 'text')}
          placeholder={String(element.props?.placeholder || '请输入...')}
          className="w-full h-full px-3 outline-none"
          style={element.styles as React.CSSProperties}
          readOnly
        />
      )}

      {element.type === 'icon' && (
        <div
          className="w-full h-full flex items-center justify-center"
          style={element.styles as React.CSSProperties}
        >
          {String(element.props?.text || element.props?.name || '⭐')}
        </div>
      )}

      {isSelected && (
        <div className="absolute -inset-1 border-2 border-blue-500 pointer-events-none" />
      )}
    </div>
  )
})
CanvasElement.displayName = 'CanvasElement'

interface CanvasProps {
  className?: string
  onElementAdd?: (element: EditorElement) => void
}

export const Canvas: React.FC<CanvasProps> = ({
  className,
  onElementAdd
}) => {
  const {
    selectedElementIds,
    canvas,
    addElement,
    selectElement,
    clearSelection,
    setZoom,
    pages,
    activePageId,
    setActivePage,
    addPage,
  } = useEditorStore()

  const elements = useEditorStore(
    useCallback(
      (state) => state.pages.find(page => page.id === state.activePageId)?.elements ?? EMPTY_ELEMENTS,
      []
    )
  )

  const { showToast } = useUIStore()
  const router = useRouter()

  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [isDraggingElement, setIsDraggingElement] = useState(false)
  const panStart = useRef({ x: 0, y: 0 })
  const dragStart = useRef({ x: 0, y: 0 })

  const gridSize = 20

  // 初始居中画布
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setCanvasPosition({
        x: (rect.width - canvas.width * canvas.zoom) / 2,
        y: (rect.height - canvas.height * canvas.zoom) / 2
      })
    }
  }, [canvas.width, canvas.height, canvas.zoom])

  // 添加新页面
  const handleAddPage = useCallback(() => {
    const pageNum = pages.length + 1
    const newPage = {
      id: `page-${Date.now()}`,
      name: `页面 ${pageNum}`,
      canvas: { width: canvas.width, height: canvas.height },
      elements: [],
    }
    addPage(newPage)
    setActivePage(newPage.id)
    showToast(`已添加 ${newPage.name}`, 'success')
  }, [pages.length, canvas.width, canvas.height, addPage, setActivePage, showToast])

  // 右键拖拽平移画布
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // 右键 = 平移画布
    if (e.button === 2) {
      e.preventDefault()
      setIsPanning(true)
      panStart.current = {
        x: e.clientX - canvasPosition.x,
        y: e.clientY - canvasPosition.y
      }
      return
    }

    // 左键点击空白区域 = 清除选中
    if (e.button === 0 && e.target === e.currentTarget) {
      clearSelection()
    }
  }, [canvasPosition, clearSelection])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setCanvasPosition({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y
      })
      return
    }

    if (isDraggingElement && selectedElementIds.length === 1) {
      const store = useEditorStore.getState()
      const el = store.getActivePage()?.elements.find(el => el.id === selectedElementIds[0])
      if (!el) return

      const newX = (e.clientX - dragStart.current.x) / canvas.zoom
      const newY = (e.clientY - dragStart.current.y) / canvas.zoom

      store.updateElement(el.id, {
        x: Math.round(newX / gridSize) * gridSize,
        y: Math.round(newY / gridSize) * gridSize
      })
    }
  }, [isPanning, isDraggingElement, selectedElementIds, canvas.zoom])

  const handleMouseUp = useCallback(() => {
    if (isDraggingElement) {
      useEditorStore.getState().saveHistory('Move Element')
    }
    setIsPanning(false)
    setIsDraggingElement(false)
  }, [isDraggingElement])

  // 禁用右键菜单
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  // 双击添加元素
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (e.target !== containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - canvasPosition.x) / canvas.zoom
    const y = (e.clientY - rect.top - canvasPosition.y) / canvas.zoom

    const newElement = {
      type: 'button' as const,
      x,
      y,
      width: 120,
      height: 40,
      props: { text: '按钮' },
      styles: {
        background: '#6366f1',
        color: '#ffffff',
        borderRadius: '8px',
        padding: '8px 16px'
      }
    }

    const elementId = addElement(newElement)
    selectElement(elementId)

    if (onElementAdd) {
      onElementAdd({ ...newElement, id: elementId } as EditorElement)
    }

    showToast('元素已添加', 'success')
  }, [canvasPosition, canvas.zoom, addElement, selectElement, onElementAdd, showToast])

  // 元素拖拽
  const handleElementMouseDown = useCallback((e: React.MouseEvent, element: EditorElement) => {
    e.stopPropagation()
    if (e.button !== 0) return // 只响应左键

    selectElement(element.id)

    setIsDraggingElement(true)
    dragStart.current = {
      x: e.clientX - element.x * canvas.zoom,
      y: e.clientY - element.y * canvas.zoom
    }
  }, [selectElement, canvas.zoom])

  // 滚轮缩放（不需要 Ctrl）
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // 鼠标在画布坐标中的位置（缩放前）
    const canvasX = (mouseX - canvasPosition.x) / canvas.zoom
    const canvasY = (mouseY - canvasPosition.y) / canvas.zoom

    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(0.1, Math.min(3, canvas.zoom + delta))

    // 缩放后重新计算位置，使鼠标下的点不变
    setCanvasPosition({
      x: mouseX - canvasX * newZoom,
      y: mouseY - canvasY * newZoom
    })

    setZoom(newZoom)
  }, [canvasPosition, canvas.zoom, setZoom])

  // 重置视图（居中画布）
  const handleResetView = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setCanvasPosition({
        x: (rect.width - canvas.width * canvas.zoom) / 2,
        y: (rect.height - canvas.height * canvas.zoom) / 2
      })
    }
  }, [canvas.width, canvas.height, canvas.zoom])

  const handleZoomIn = () => setZoom(Math.min(canvas.zoom + 0.1, 3))
  const handleZoomOut = () => setZoom(Math.max(canvas.zoom - 0.1, 0.1))

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElementIds.length > 0) {
        selectedElementIds.forEach(id => {
          useEditorStore.getState().deleteElement(id)
        })
        clearSelection()
        showToast('元素已删除', 'info')
      }
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        useEditorStore.getState().undo()
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault()
        useEditorStore.getState().redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElementIds, clearSelection, showToast])

  // 组件库拖放
  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/nexus-component')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const data = e.dataTransfer.getData('application/nexus-component')
    if (!data) return

    try {
      const component = JSON.parse(data)
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = (e.clientX - rect.left - canvasPosition.x) / canvas.zoom - component.defaultSize.width / 2
      const y = (e.clientY - rect.top - canvasPosition.y) / canvas.zoom - component.defaultSize.height / 2

      addElement({
        type: component.type,
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize,
        width: component.defaultSize.width,
        height: component.defaultSize.height,
        styles: component.defaultStyles || {},
        props: component.defaultProps || {},
      })

      showToast(`已添加 ${component.name}`, 'success')
    } catch {
      // ignore
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-full bg-gray-900 overflow-hidden select-none',
        isPanning ? 'cursor-grabbing' : 'cursor-default',
        className
      )}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* 页面标签栏 */}
      {pages.length > 0 && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gray-800/90 backdrop-blur border-b border-gray-700">
          <div className="flex items-center h-9 px-2 overflow-x-auto scrollbar-hide">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => {
                  setActivePage(page.id)
                  // 切换页面时居中画布
                  setTimeout(() => {
                    if (containerRef.current) {
                      const rect = containerRef.current.getBoundingClientRect()
                      setCanvasPosition({
                        x: (rect.width - page.canvas.width * canvas.zoom) / 2,
                        y: (rect.height - page.canvas.height * canvas.zoom) / 2
                      })
                    }
                  }, 0)
                }}
                className={cn(
                  'flex-shrink-0 px-3 py-1 text-xs rounded-md transition-colors mr-1',
                  page.id === activePageId
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-300'
                )}
              >
                {page.name}
              </button>
            ))}
            <button
              onClick={handleAddPage}
              className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors"
              title="添加页面"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 工具栏 */}
      <div className={cn(
        'absolute left-1/2 -translate-x-1/2 z-10 flex items-center space-x-2 bg-gray-800/90 backdrop-blur rounded-lg p-2',
        pages.length > 0 ? 'top-11' : 'top-4'
      )}>
        <button onClick={handleZoomOut} className="p-1.5 hover:bg-gray-700 rounded" title="缩小">
          <ZoomOut size={16} />
        </button>
        <span className="text-xs font-mono text-gray-300 w-12 text-center">
          {Math.round(canvas.zoom * 100)}%
        </span>
        <button onClick={handleZoomIn} className="p-1.5 hover:bg-gray-700 rounded" title="放大">
          <ZoomIn size={16} />
        </button>
        <div className="w-px h-4 bg-gray-600 mx-1" />
        <button onClick={handleResetView} className="p-1.5 hover:bg-gray-700 rounded" title="居中画布">
          <Maximize2 size={16} />
        </button>
      </div>

      {/* 状态栏 */}
      <div className={cn(
        'absolute right-4 z-10 bg-gray-800/90 backdrop-blur rounded-lg px-3 py-2 text-xs text-gray-300',
        pages.length > 0 ? 'top-11' : 'top-4'
      )}>
        <div className="flex items-center space-x-2">
          <div className={cn('w-2 h-2 rounded-full', isPanning ? 'bg-yellow-400' : 'bg-green-400')} />
          <span>{isPanning ? '平移中' : '就绪'}</span>
        </div>
        <div className="mt-1 text-gray-500">{elements.length} 个元素</div>
        <div className="mt-0.5 text-gray-600">右键拖拽画布 · 滚轮缩放</div>
      </div>

      {/* 无限画布 */}
      <div
        className="absolute"
        style={{
          transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${canvas.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* 网格 - 覆盖画布区域 */}
        <div
          style={{
            position: 'absolute',
            left: -1000,
            top: -1000,
            width: canvas.width + 2000,
            height: canvas.height + 2000,
            backgroundImage: `
              linear-gradient(to right, #4b5563 1px, transparent 1px),
              linear-gradient(to bottom, #4b5563 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            opacity: 0.15,
            pointerEvents: 'none'
          }}
        />

        {/* 画布边界 */}
        <div
          className="absolute border-2 border-dashed border-gray-600 bg-gray-800/5"
          style={{
            width: canvas.width,
            height: canvas.height,
            left: 0,
            top: 0
          }}
        />

        {/* 渲染元素 */}
        {elements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElementIds.includes(element.id)}
            onMouseDown={handleElementMouseDown}
          />
        ))}

        {/* 空状态 */}
        {elements.length === 0 && (
          <div
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              width: canvas.width,
              height: canvas.height,
              left: 0,
              top: 0
            }}
          >
            <div className="text-gray-500 text-center">
              <div className="text-4xl mb-2">🎨</div>
              <div className="text-sm">双击画布添加元素</div>
              <div className="text-xs text-gray-600 mt-1">或从左侧组件库拖拽</div>
              <button
                onClick={() => router.push('/design/ai')}
                className="pointer-events-auto mt-4 flex items-center space-x-2 mx-auto px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-400 text-xs transition-colors"
              >
                <Sparkles size={14} />
                <span>从 AI 生成</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Canvas
