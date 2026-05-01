'use client'

import { Loader2, Maximize2, Plus, ZoomIn, ZoomOut } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'
import { EditorElement } from '@/types'

const COLS = 4
const PAGE_GAP = 40
const PAGE_LABEL_HEIGHT = 28

type PagePosition = { id: string; x: number; y: number }

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
    isSaving,
  } = useEditorStore()

  const activePage = useEditorStore(
    useCallback(
      (state) => state.pages.find(page => page.id === state.activePageId),
      []
    )
  )

  const { showToast } = useUIStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [isDraggingElement, setIsDraggingElement] = useState(false)
  const panStart = useRef({ x: 0, y: 0 })
  const dragStart = useRef({ x: 0, y: 0 })

  const gridSize = 20

  // 计算画布总尺寸（所有页面排列后的总宽高）
  const canvasTotalWidth = useMemo(() => {
    const cols = Math.min(COLS, pages.length || 1)
    const pageW = canvas.width
    return cols * pageW + (cols + 1) * PAGE_GAP
  }, [pages.length, canvas.width])

  const canvasTotalHeight = useMemo(() => {
    const rows = Math.ceil((pages.length || 1) / COLS)
    const pageH = canvas.height
    return rows * pageH + (rows + 1) * PAGE_GAP + rows * PAGE_LABEL_HEIGHT
  }, [pages.length, canvas.height])

  // 计算每个页面在画布上的偏移位置
  const pagePositions: PagePosition[] = useMemo(() => {
    return pages.map((page, index) => {
      const row = Math.floor(index / COLS)
      const col = index % COLS
      const x = PAGE_GAP + col * (canvas.width + PAGE_GAP)
      const y = PAGE_GAP + row * (canvas.height + PAGE_GAP + PAGE_LABEL_HEIGHT)
      return { id: page.id, x, y }
    })
  }, [pages, canvas.width, canvas.height])

  // 初始居中
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setCanvasPosition({
        x: (rect.width - canvasTotalWidth * canvas.zoom) / 2,
        y: (rect.height - canvasTotalHeight * canvas.zoom) / 2
      })
    }
  }, [canvasTotalWidth, canvasTotalHeight, canvas.zoom])

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
    if (e.button === 2) {
      e.preventDefault()
      setIsPanning(true)
      panStart.current = {
        x: e.clientX - canvasPosition.x,
        y: e.clientY - canvasPosition.y
      }
      return
    }

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

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  // 双击添加元素
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!activePage || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pos = pagePositions.find(p => p.id === activePageId)
    if (!pos) return

    const canvasX = (e.clientX - rect.left - canvasPosition.x) / canvas.zoom - pos.x
    const canvasY = (e.clientY - rect.top - canvasPosition.y) / canvas.zoom - pos.y

    if (canvasX < 0 || canvasY < 0 || canvasX > canvas.width || canvasY > canvas.height) return

    const newElement = {
      type: 'button' as const,
      x: canvasX,
      y: canvasY,
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
  }, [canvasPosition, canvas.zoom, canvas.width, canvas.height, activePage, activePageId, pagePositions, addElement, selectElement, onElementAdd, showToast])

  // 元素拖拽
  const handleElementMouseDown = useCallback((e: React.MouseEvent, element: EditorElement) => {
    e.stopPropagation()
    if (e.button !== 0) return

    selectElement(element.id)

    setIsDraggingElement(true)
    const pos = pagePositions.find(p => p.id === activePageId)
    const offsetX = pos ? pos.x : 0
    const offsetY = pos ? pos.y : 0
    dragStart.current = {
      x: e.clientX - (element.x + offsetX) * canvas.zoom,
      y: e.clientY - (element.y + offsetY) * canvas.zoom
    }
  }, [selectElement, canvas.zoom, activePageId, pagePositions])

  // 滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const canvasX = (mouseX - canvasPosition.x) / canvas.zoom
    const canvasY = (mouseY - canvasPosition.y) / canvas.zoom

    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(0.1, Math.min(3, canvas.zoom + delta))

    setCanvasPosition({
      x: mouseX - canvasX * newZoom,
      y: mouseY - canvasY * newZoom
    })

    setZoom(newZoom)
  }, [canvasPosition, canvas.zoom, setZoom])

  const handleResetView = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setCanvasPosition({
        x: (rect.width - canvasTotalWidth * canvas.zoom) / 2,
        y: (rect.height - canvasTotalHeight * canvas.zoom) / 2
      })
    }
  }, [canvasTotalWidth, canvasTotalHeight, canvas.zoom])

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

      const pos = pagePositions.find(p => p.id === activePageId)
      const offsetX = pos ? pos.x : 0
      const offsetY = pos ? pos.y : 0

      const x = (e.clientX - rect.left - canvasPosition.x) / canvas.zoom - offsetX - component.defaultSize.width / 2
      const y = (e.clientY - rect.top - canvasPosition.y) / canvas.zoom - offsetY - component.defaultSize.height / 2

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
      {/* 左上角：页面列表 */}
      <div className="absolute top-4 left-4 z-10 bg-gray-800/90 backdrop-blur rounded-lg p-2 max-h-[calc(100vh-120px)] overflow-y-auto">
        <div className="text-xs text-gray-500 mb-2 px-1">页面列表</div>
        <div className="flex flex-col gap-1">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => {
                setActivePage(page.id)
                // 居中显示该页面，100% 缩放
                const pos = pagePositions.find(p => p.id === page.id)
                if (pos && containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect()
                  setCanvasPosition({
                    x: rect.width / 2 - (pos.x + canvas.width / 2),
                    y: rect.height / 2 - (pos.y + canvas.height / 2 + PAGE_LABEL_HEIGHT / 2),
                  })
                  setZoom(1)
                }
              }}
              className={cn(
                'px-3 py-1.5 rounded text-xs text-left transition-all',
                page.id === activePageId
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
              )}
            >
              <span className="font-medium">{page.name}</span>
              <span className="text-gray-500 ml-2">{page.elements?.length || 0}元素</span>
            </button>
          ))}
          {pages.length === 0 && (
            <div className="text-xs text-gray-500 px-3 py-1.5">暂无页面</div>
          )}
        </div>
      </div>

      {/* 工具栏 - 居中 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-2 bg-gray-800/90 backdrop-blur rounded-lg p-2">
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
        <div className="w-px h-4 bg-gray-600 mx-1" />
        <button onClick={handleAddPage} className="p-1.5 hover:bg-gray-700 rounded flex items-center gap-1" title="添加页面">
          <Plus size={16} />
          <span className="text-xs text-gray-300">添加页面</span>
        </button>
      </div>

      {/* 右上角：状态logo */}
      <div className="absolute top-4 right-4 z-10 bg-gray-800/90 backdrop-blur rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          {isSaving ? (
            <>
              <Loader2 size={14} className="text-blue-400 animate-spin" />
              <span className="text-xs text-blue-400">保存中</span>
            </>
          ) : (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-400">就绪</span>
            </>
          )}
        </div>
      </div>

      {/* 无限画布 - 所有页面并排展示 */}
      <div
        className="absolute"
        style={{
          transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${canvas.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* 网格背景 */}
        <div
          style={{
            position: 'absolute',
            left: -2000,
            top: -2000,
            width: canvasTotalWidth + 4000,
            height: canvasTotalHeight + 4000,
            backgroundImage: `
              linear-gradient(to right, #4b5563 1px, transparent 1px),
              linear-gradient(to bottom, #4b5563 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            opacity: 0.1,
            pointerEvents: 'none'
          }}
        />

        {/* 渲染每个页面 */}
        {pages.map((page, pageIndex) => {
          const pos = pagePositions[pageIndex]
          const isActive = page.id === activePageId

          return (
            <div key={page.id} style={{ position: 'absolute', left: pos.x, top: pos.y }}>
              {/* 页面标签 */}
              <div
                className={cn(
                  'text-xs font-medium mb-1 px-2 py-0.5 rounded-t-md inline-block cursor-pointer',
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-300'
                )}
                onClick={() => setActivePage(page.id)}
              >
                {page.name}
              </div>

              {/* 页面画布 */}
              <div
                className={cn(
                  'relative overflow-hidden transition-all',
                  isActive
                    ? 'border-2 border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'border border-gray-600 hover:border-gray-400'
                )}
                style={{
                  width: page.canvas.width,
                  height: page.canvas.height,
                  background: '#0f0c29',
                }}
                onClick={() => setActivePage(page.id)}
              >
                {/* 页面元素 */}
                {page.elements.map((element) => (
                  <CanvasElement
                    key={element.id}
                    element={element}
                    isSelected={isActive && selectedElementIds.includes(element.id)}
                    onMouseDown={(e) => {
                      if (!isActive) {
                        setActivePage(page.id)
                      }
                      handleElementMouseDown(e, element)
                    }}
                  />
                ))}

                {/* 空页面提示 */}
                {page.elements.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-gray-600 text-xs">双击添加元素</div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* 无页面空状态 */}
        {pages.length === 0 && (
          <div
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              width: canvas.width,
              height: canvas.height,
              left: PAGE_GAP,
              top: PAGE_GAP,
            }}
          >
            <div className="text-gray-500 text-center">
              <div className="text-4xl mb-2">🎨</div>
              <div className="text-sm">双击画布添加元素</div>
              <div className="text-xs text-gray-600 mt-1">或从左侧组件库拖拽，或在底部输入框使用 AI 生成</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Canvas