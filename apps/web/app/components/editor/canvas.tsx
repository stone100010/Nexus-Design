'use client'

import { Maximize2, Minimize2, Move, ZoomIn, ZoomOut } from 'lucide-react'
import React, { useEffect,useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'

interface CanvasProps {
  projectId?: string
  className?: string
  onElementAdd?: (element: any) => void
}

export const Canvas: React.FC<CanvasProps> = ({ 
  projectId,
  className,
  onElementAdd 
}) => {
  const {
    elements,
    selectedElementIds,
    canvas,
    addElement,
    updateElement,
    selectElement,
    clearSelection,
    setZoom,
    setCanvasSize
  } = useEditorStore()

  const { showToast } = useUIStore()
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 })
  const [selectedElement, setSelectedElement] = useState<any>(null)

  // 画布背景网格
  const gridSize = 20

  // 处理画布点击（清除选择）
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearSelection()
      setSelectedElement(null)
    }
  }

  // 处理画布双击（添加新元素）
  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left - canvasPosition.x) / canvas.zoom
    const y = (e.clientY - rect.top - canvasPosition.y) / canvas.zoom

    const newElement = {
      id: `element-${Date.now()}`,
      type: 'button',
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

    addElement(newElement)
    selectElement(newElement.id)
    setSelectedElement(newElement)
    
    if (onElementAdd) {
      onElementAdd(newElement)
    }

    showToast('元素已添加', 'success')
  }

  // 处理元素拖拽
  const handleElementMouseDown = (e: React.MouseEvent, element: any) => {
    e.stopPropagation()
    
    selectElement(element.id)
    setSelectedElement(element)
    
    if (e.button === 0) { // 左键
      setIsDragging(true)
      setDragStart({
        x: e.clientX - element.x * canvas.zoom - canvasPosition.x,
        y: e.clientY - element.y * canvas.zoom - canvasPosition.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return

    const newX = (e.clientX - dragStart.x - canvasPosition.x) / canvas.zoom
    const newY = (e.clientY - dragStart.y - canvasPosition.y) / canvas.zoom

    updateElement(selectedElement.id, { x: newX, y: newY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 处理画布平移（按住空格键）
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // 中键或 Ctrl+左键
      e.preventDefault()
      setIsDragging(true)
      setDragStart({
        x: e.clientX - canvasPosition.x,
        y: e.clientY - canvasPosition.y
      })
    }
  }

  // 处理画布平移时的鼠标移动
  const handleCanvasDragMove = (e: React.MouseEvent) => {
    if (!isDragging || selectedElement) return // 如果有选中元素，不平移画布
    
    // 检查是否在平移模式（通过全局状态或按键状态）
    if (e.buttons === 4 || (e.buttons === 1 && e.ctrlKey)) {
      setCanvasPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete 删除选中元素
      if (e.key === 'Delete' && selectedElementIds.length > 0) {
        selectedElementIds.forEach(id => {
          useEditorStore.getState().deleteElement(id)
        })
        clearSelection()
        setSelectedElement(null)
        showToast('元素已删除', 'info')
      }

      // Ctrl+A 全选
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault()
        // 全选逻辑
      }

      // Ctrl+Z 撤销
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        useEditorStore.getState().undo()
      }

      // Ctrl+Y 重做
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault()
        useEditorStore.getState().redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElementIds, clearSelection, showToast])

  // 缩放处理
  const handleZoomIn = () => {
    setZoom(Math.min(canvas.zoom + 0.1, 3))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(canvas.zoom - 0.1, 0.1))
  }

  const handleZoomReset = () => {
    setZoom(1)
  }

  return (
    <div 
      className={cn(
        'relative h-full bg-gray-900 overflow-hidden',
        className
      )}
      onClick={handleCanvasClick}
      onDoubleClick={handleCanvasDoubleClick}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasDragMove}
      onMouseUp={handleMouseUp}
    >
      {/* 画布工具栏 */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-gray-800/90 backdrop-blur rounded-lg p-2">
        <button
          onClick={handleZoomOut}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          title="缩小"
        >
          <ZoomOut size={16} />
        </button>
        
        <span className="text-xs font-mono text-gray-300 w-12 text-center">
          {Math.round(canvas.zoom * 100)}%
        </span>
        
        <button
          onClick={handleZoomIn}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          title="放大"
        >
          <ZoomIn size={16} />
        </button>
        
        <div className="w-px h-4 bg-gray-600 mx-1" />
        
        <button
          onClick={handleZoomReset}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          title="重置缩放"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* 画布状态指示器 */}
      <div className="absolute top-4 right-4 z-10 bg-gray-800/90 backdrop-blur rounded-lg px-3 py-2 text-xs text-gray-300">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isDragging ? 'bg-yellow-400' : 'bg-green-400'}`} />
          <span>{isDragging ? '拖拽中' : '就绪'}</span>
        </div>
        <div className="mt-1 text-gray-500">
          {elements.length} 个元素
        </div>
      </div>

      {/* 画布区域 */}
      <div 
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${canvas.zoom})`,
          transformOrigin: '0 0',
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        {/* 网格背景 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #4b5563 1px, transparent 1px),
              linear-gradient(to bottom, #4b5563 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            width: canvas.width,
            height: canvas.height
          }}
        />

        {/* 画布边界 */}
        <div
          className="absolute border-2 border-dashed border-gray-600 bg-gray-800/10"
          style={{
            width: canvas.width,
            height: canvas.height,
            left: 0,
            top: 0
          }}
        />

        {/* 渲染元素 */}
        {elements.map((element) => {
          const isSelected = selectedElementIds.includes(element.id)
          
          return (
            <div
              key={element.id}
              className={cn(
                'absolute cursor-move transition-all',
                isSelected && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900'
              )}
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                ...(element.styles || {})
              }}
              onMouseDown={(e) => handleElementMouseDown(e, element)}
            >
              {/* 元素内容 */}
              {element.type === 'button' && (
                <button
                  className="w-full h-full flex items-center justify-center"
                  style={element.styles}
                >
                  {element.props?.text || '按钮'}
                </button>
              )}

              {element.type === 'text' && (
                <div
                  className="w-full h-full flex items-center"
                  style={element.styles}
                >
                  {element.props?.text || '文本'}
                </div>
              )}

              {element.type === 'container' && (
                <div
                  className="w-full h-full border border-gray-600 bg-gray-800/50"
                  style={element.styles}
                >
                  {element.props?.children}
                </div>
              )}

              {/* 选中状态指示器 */}
              {isSelected && (
                <div className="absolute -inset-1 border-2 border-blue-500 pointer-events-none" />
              )}
            </div>
          )
        })}

        {/* 空状态提示 */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-gray-500 text-center">
              <div className="text-4xl mb-2">🎨</div>
              <div className="text-sm">双击画布添加元素</div>
              <div className="text-xs text-gray-600 mt-1">或从左侧组件库拖拽</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Canvas