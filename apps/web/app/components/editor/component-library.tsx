'use client'

import {
  Divide,
  Image as ImageIcon,
  LayoutTemplate,
  List,
  Monitor,
  MousePointer,
  Navigation,
  Search,
  Smartphone,
  Square,
  Star,
  SwitchCamera,
  Tablet,
  ToggleLeft,
  Type} from 'lucide-react'
import React, { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'

interface ComponentLibraryProps {
  className?: string
}

interface ComponentItem {
  id: string
  name: string
  type: string
  category: string
  icon: React.ElementType
  defaultSize: { width: number; height: number }
  defaultStyles: Record<string, string | number>
  defaultProps?: Record<string, string>
}

const COMPONENTS: ComponentItem[] = [
  // Basic components
  {
    id: 'button',
    name: '按钮',
    type: 'button',
    category: 'basic',
    icon: MousePointer,
    defaultSize: { width: 120, height: 40 },
    defaultStyles: {
      background: '#6366f1',
      color: '#ffffff',
      borderRadius: '8px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '500'
    },
    defaultProps: { text: '按钮' }
  },
  {
    id: 'text',
    name: '文本',
    type: 'text',
    category: 'basic',
    icon: Type,
    defaultSize: { width: 200, height: 30 },
    defaultStyles: {
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '400'
    },
    defaultProps: { text: '文本内容' }
  },
  {
    id: 'container',
    name: '容器',
    type: 'container',
    category: 'basic',
    icon: Square,
    defaultSize: { width: 200, height: 150 },
    defaultStyles: {
      background: '#1f2937',
      borderRadius: '8px',
      border: '1px solid #374151'
    }
  },
  {
    id: 'card',
    name: '卡片',
    type: 'container',
    category: 'basic',
    icon: LayoutTemplate,
    defaultSize: { width: 280, height: 180 },
    defaultStyles: {
      background: '#111827',
      borderRadius: '12px',
      border: '1px solid #374151',
      padding: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
    }
  },
  {
    id: 'input',
    name: '输入框',
    type: 'input',
    category: 'basic',
    icon: Type,
    defaultSize: { width: 240, height: 40 },
    defaultStyles: {
      background: '#1f2937',
      border: '1px solid #4b5563',
      borderRadius: '8px',
      padding: '8px 12px',
      color: '#ffffff'
    },
    defaultProps: { placeholder: '请输入...' }
  },
  {
    id: 'image',
    name: '图片',
    type: 'image',
    category: 'basic',
    icon: ImageIcon,
    defaultSize: { width: 200, height: 200 },
    defaultStyles: {
      background: '#1f2937',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  {
    id: 'icon',
    name: '图标',
    type: 'icon',
    category: 'basic',
    icon: Star,
    defaultSize: { width: 40, height: 40 },
    defaultStyles: {
      color: '#fbbf24'
    }
  },
  // Mobile components
  {
    id: 'navbar',
    name: '导航栏',
    type: 'container',
    category: 'mobile',
    icon: Navigation,
    defaultSize: { width: 375, height: 56 },
    defaultStyles: {
      background: '#111827',
      borderBottom: '1px solid #374151',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px'
    }
  },
  {
    id: 'bottom-tab',
    name: '底部导航',
    type: 'container',
    category: 'mobile',
    icon: SwitchCamera,
    defaultSize: { width: 375, height: 56 },
    defaultStyles: {
      background: '#111827',
      borderTop: '1px solid #374151',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around'
    }
  },
  {
    id: 'list',
    name: '列表',
    type: 'container',
    category: 'mobile',
    icon: List,
    defaultSize: { width: 375, height: 200 },
    defaultStyles: {
      background: '#1f2937',
      borderRadius: '8px'
    }
  },
  {
    id: 'divider',
    name: '分割线',
    type: 'container',
    category: 'mobile',
    icon: Divide,
    defaultSize: { width: 375, height: 1 },
    defaultStyles: {
      background: '#374151'
    }
  },
  {
    id: 'toggle',
    name: '开关',
    type: 'container',
    category: 'mobile',
    icon: ToggleLeft,
    defaultSize: { width: 51, height: 31 },
    defaultStyles: {
      background: '#4b5563',
      borderRadius: '16px',
      border: '2px solid #6b7280'
    }
  }
]

const DEVICE_PRESETS = [
  {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro',
    icon: Smartphone,
    width: 393,
    height: 852
  },
  {
    id: 'ipad',
    name: 'iPad',
    icon: Tablet,
    width: 768,
    height: 1024
  },
  {
    id: 'desktop',
    name: 'Desktop',
    icon: Monitor,
    width: 1920,
    height: 1080
  }
]

const CATEGORIES = [
  { id: 'basic', label: '基础组件' },
  { id: 'mobile', label: '移动组件' },
  { id: 'custom', label: '自定义组件' },
]

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ className }) => {
  const { addElement, setCanvasSize, canvas } = useEditorStore()
  const { showToast } = useUIStore()
  const [searchQuery, setSearchQuery] = useState('')

  // Load custom components from localStorage
  const allComponents = useMemo(() => {
    try {
      const saved = localStorage.getItem('custom_components')
      const custom: ComponentItem[] = saved ? JSON.parse(saved) : []
      return [...COMPONENTS, ...custom.map(c => ({ ...c, icon: Star }))]
    } catch {
      return COMPONENTS
    }
  }, [])

  const filteredComponents = useMemo(() => {
    if (!searchQuery.trim()) return allComponents
    const q = searchQuery.toLowerCase()
    return allComponents.filter(
      c => c.name.includes(q) || c.type.includes(q) || c.id.includes(q)
    )
  }, [searchQuery, allComponents])

  const handleAddComponent = (component: ComponentItem) => {
    const centerX = (canvas.width / 2) - (component.defaultSize.width / 2)
    const centerY = (canvas.height / 2) - (component.defaultSize.height / 2)

    const newElement = {
      id: `element-${Date.now()}`,
      type: component.type,
      x: centerX,
      y: centerY,
      width: component.defaultSize.width,
      height: component.defaultSize.height,
      styles: component.defaultStyles,
      props: component.defaultProps || {}
    }

    addElement(newElement)
    showToast(`已添加 ${component.name}`, 'success')
  }

  const handleDeviceChange = (device: typeof DEVICE_PRESETS[0]) => {
    setCanvasSize({ width: device.width, height: device.height })
    showToast(`切换到 ${device.name}`, 'info')
  }

  return (
    <div className={cn('flex flex-col h-full bg-gray-800', className)}>
      {/* Title */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200">组件库</h3>
        <p className="text-xs text-gray-500 mt-1">点击添加到画布</p>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="搜索组件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-700 border border-gray-600 rounded-md focus:border-blue-500 focus:outline-none text-gray-200 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Device presets */}
      <div className="p-3 border-b border-gray-700">
        <div className="text-xs font-medium text-gray-400 mb-2">设备预设</div>
        <div className="grid grid-cols-3 gap-2">
          {DEVICE_PRESETS.map((device) => {
            const isActive =
              canvas.width === device.width &&
              canvas.height === device.height

            return (
              <button
                key={device.id}
                onClick={() => handleDeviceChange(device)}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg transition-all',
                  'text-xs space-y-1',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                )}
                title={device.name}
              >
                <device.icon size={16} />
                <span className="text-[10px]">{device.name.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto p-3">
        {searchQuery.trim() ? (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-400 mb-2">
              搜索结果 ({filteredComponents.length})
            </div>
            {filteredComponents.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-xs">
                未找到匹配的组件
              </div>
            ) : (
              filteredComponents.map((component) => (
                <ComponentButton
                  key={component.id}
                  component={component}
                  onClick={() => handleAddComponent(component)}
                />
              ))
            )}
          </div>
        ) : (
          CATEGORIES.map((category) => {
            const categoryComponents = filteredComponents.filter(c => c.category === category.id)
            if (categoryComponents.length === 0) return null

            return (
              <div key={category.id} className="mb-4">
                <div className="text-xs font-medium text-gray-400 mb-2">{category.label}</div>
                <div className="space-y-2">
                  {categoryComponents.map((component) => (
                    <ComponentButton
                      key={component.id}
                      component={component}
                      onClick={() => handleAddComponent(component)}
                    />
                  ))}
                </div>
              </div>
            )
          })
        )}

        {/* Canvas stats */}
        <div className="mt-6 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">当前画布</div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">尺寸</span>
            <span className="font-mono text-gray-200">
              {canvas.width}×{canvas.height}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-300">元素</span>
            <span className="font-mono text-gray-200">
              {useEditorStore.getState().elements.length}
            </span>
          </div>
        </div>
      </div>

      {/* Shortcuts hint */}
      <div className="p-3 border-t border-gray-700 bg-gray-900/30">
        <div className="text-[10px] text-gray-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>双击画布</span>
            <span className="text-gray-600">快速添加按钮</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Delete</span>
            <span className="text-gray-600">删除选中</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Ctrl+Z / Ctrl+Y</span>
            <span className="text-gray-600">撤销 / 重做</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ComponentButton({ component, onClick }: { component: ComponentItem; onClick: () => void }) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/nexus-component', JSON.stringify(component))
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <button
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
      className={cn(
        'w-full flex items-center space-x-3 p-3 rounded-lg',
        'bg-gray-700/50 hover:bg-gray-600',
        'border border-transparent hover:border-gray-500',
        'transition-all cursor-pointer group'
      )}
      title={`拖拽或点击添加 ${component.name}`}
    >
      <div className={cn(
        'p-2 rounded-md bg-gray-800',
        'group-hover:bg-gray-700 transition-colors'
      )}>
        <component.icon size={18} className="text-gray-300" />
      </div>
      <div className="flex-1 text-left">
        <div className="text-sm font-medium text-gray-200">
          {component.name}
        </div>
        <div className="text-xs text-gray-500">
          {component.type}
        </div>
      </div>
      <div className="text-xs text-gray-600 group-hover:text-gray-400">
        {component.defaultSize.width}×{component.defaultSize.height}
      </div>
    </button>
  )
}

export default ComponentLibrary
