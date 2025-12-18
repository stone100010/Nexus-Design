'use client'

import { 
  ArrowDown,
  ArrowUp,
  Copy,
  Layout, 
  Palette, 
  Settings, 
  Trash2,
  Type} from 'lucide-react'
import React, { useEffect,useState } from 'react'

import { cn } from '@/lib/utils'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'

interface PropertiesPanelProps {
  className?: string
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ className }) => {
  const { 
    elements, 
    selectedElementIds, 
    updateElement, 
    deleteElement,
    duplicateElement,
    bringToFront,
    sendToBack,
    clearSelection
  } = useEditorStore()
  
  const { showToast } = useUIStore()
  const [activeTab, setActiveTab] = useState<'style' | 'props' | 'layout'>('style')

  const selectedElement = elements.find(el => selectedElementIds.includes(el.id))

  // 表单状态
  const [formData, setFormData] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    background: '',
    color: '',
    fontSize: '',
    borderRadius: '',
    padding: '',
    text: ''
  })

  // 同步表单数据
  useEffect(() => {
    if (selectedElement) {
      setFormData({
        x: selectedElement.x || 0,
        y: selectedElement.y || 0,
        width: selectedElement.width || 0,
        height: selectedElement.height || 0,
        background: selectedElement.styles?.background || '',
        color: selectedElement.styles?.color || '',
        fontSize: selectedElement.styles?.fontSize || '',
        borderRadius: selectedElement.styles?.borderRadius || '',
        padding: selectedElement.styles?.padding || '',
        text: selectedElement.props?.text || ''
      })
    }
  }, [selectedElement])

  const handleUpdate = (field: string, value: any, isStyle: boolean = false) => {
    if (!selectedElement) return

    if (isStyle) {
      const newStyles = { ...selectedElement.styles, [field]: value }
      updateElement(selectedElement.id, { styles: newStyles })
    } else if (field === 'text') {
      const newProps = { ...selectedElement.props, text: value }
      updateElement(selectedElement.id, { props: newProps })
    } else {
      updateElement(selectedElement.id, { [field]: value })
    }

    // 更新本地状态
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDelete = () => {
    if (selectedElementIds.length === 0) return
    
    selectedElementIds.forEach(id => deleteElement(id))
    clearSelection()
    showToast(`已删除 ${selectedElementIds.length} 个元素`, 'info')
  }

  const handleDuplicate = () => {
    if (!selectedElement) return
    
    duplicateElement(selectedElement.id)
    showToast('元素已复制', 'success')
  }

  const handleZIndexChange = (direction: 'front' | 'back') => {
    if (!selectedElement) return
    
    if (direction === 'front') {
      bringToFront(selectedElement.id)
      showToast('已置顶', 'info')
    } else {
      sendToBack(selectedElement.id)
      showToast('已置底', 'info')
    }
  }

  // 颜色选择器
  const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div className="space-y-1">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
          placeholder="#000000"
        />
      </div>
    </div>
  )

  // 数值输入
  const NumberInput = ({ label, value, onChange, min, max }: { 
    label: string, 
    value: number, 
    onChange: (v: number) => void,
    min?: number,
    max?: number 
  }) => (
    <div className="space-y-1">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          className="flex-1 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none font-mono"
        />
        <span className="text-xs text-gray-500">px</span>
      </div>
    </div>
  )

  // 文本输入
  const TextInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div className="space-y-1">
      <label className="text-xs text-gray-400">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
      />
    </div>
  )

  if (!selectedElement) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center p-6 text-center',
        'bg-gray-800 text-gray-400',
        className
      )}>
        <Settings size={40} className="mb-3 opacity-50" />
        <div className="text-sm font-medium">未选择元素</div>
        <div className="text-xs mt-2 text-gray-500">
          在画布上点击元素进行编辑
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-gray-800', className)}>
      {/* 头部 */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-200">
            属性面板
          </h3>
          <div className="flex space-x-1">
            <button
              onClick={handleDuplicate}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors"
              title="复制"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 hover:bg-red-900/50 text-red-400 rounded transition-colors"
              title="删除"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {selectedElement.type} · ID: {selectedElement.id.slice(-6)}
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex border-b border-gray-700">
        {[
          { id: 'style', label: '样式', icon: Palette },
          { id: 'props', label: '属性', icon: Type },
          { id: 'layout', label: '布局', icon: Layout }
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex-1 flex items-center justify-center space-x-1 p-2 text-xs',
                'transition-colors border-b-2',
                isActive 
                  ? 'border-blue-500 text-blue-400 bg-gray-700/50'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              )}
            >
              <Icon size={12} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 样式面板 */}
        {activeTab === 'style' && (
          <>
            <div className="space-y-3">
              <div className="text-xs font-semibold text-gray-300">颜色</div>
              <ColorInput 
                label="背景颜色" 
                value={formData.background}
                onChange={(v) => handleUpdate('background', v, true)}
              />
              <ColorInput 
                label="文字颜色" 
                value={formData.color}
                onChange={(v) => handleUpdate('color', v, true)}
              />
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-gray-300">排版</div>
              <TextInput 
                label="字体大小"
                value={formData.fontSize}
                onChange={(v) => handleUpdate('fontSize', v, true)}
              />
              <TextInput 
                label="内边距"
                value={formData.padding}
                onChange={(v) => handleUpdate('padding', v, true)}
              />
              <TextInput 
                label="圆角"
                value={formData.borderRadius}
                onChange={(v) => handleUpdate('borderRadius', v, true)}
              />
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-gray-300">文本内容</div>
              <TextInput 
                label="显示文本"
                value={formData.text}
                onChange={(v) => handleUpdate('text', v, false)}
              />
            </div>
          </>
        )}

        {/* 属性面板 */}
        {activeTab === 'props' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-300">元素信息</div>
            <div className="bg-gray-900/50 rounded p-2 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">类型</span>
                <span className="font-mono text-gray-200">{selectedElement.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ID</span>
                <span className="font-mono text-gray-200 text-[10px]">{selectedElement.id}</span>
              </div>
            </div>

            <div className="text-xs font-semibold text-gray-300 mt-4">自定义属性</div>
            {Object.entries(selectedElement.props || {}).map(([key, value]) => (
              <TextInput
                key={key}
                label={key}
                value={String(value)}
                onChange={(v) => {
                  const newProps = { ...selectedElement.props, [key]: v }
                  updateElement(selectedElement.id, { props: newProps })
                }}
              />
            ))}

            {(!selectedElement.props || Object.keys(selectedElement.props).length === 0) && (
              <div className="text-xs text-gray-500 italic">无自定义属性</div>
            )}
          </div>
        )}

        {/* 布局面板 */}
        {activeTab === 'layout' && (
          <>
            <div className="space-y-3">
              <div className="text-xs font-semibold text-gray-300">位置</div>
              <div className="grid grid-cols-2 gap-2">
                <NumberInput 
                  label="X 坐标"
                  value={formData.x}
                  onChange={(v) => handleUpdate('x', v, false)}
                />
                <NumberInput 
                  label="Y 坐标"
                  value={formData.y}
                  onChange={(v) => handleUpdate('y', v, false)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-gray-300">尺寸</div>
              <div className="grid grid-cols-2 gap-2">
                <NumberInput 
                  label="宽度"
                  value={formData.width}
                  onChange={(v) => handleUpdate('width', v, false)}
                  min={1}
                />
                <NumberInput 
                  label="高度"
                  value={formData.height}
                  onChange={(v) => handleUpdate('height', v, false)}
                  min={1}
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-gray-700">
              <div className="text-xs font-semibold text-gray-300">层级</div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleZIndexChange('front')}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                >
                  <ArrowUp size={12} />
                  <span>置顶</span>
                </button>
                <button
                  onClick={() => handleZIndexChange('back')}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                >
                  <ArrowDown size={12} />
                  <span>置底</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 底部信息 */}
      <div className="p-2 border-t border-gray-700 bg-gray-900/30 text-[10px] text-gray-500 text-center">
        实时更新 · 自动保存
      </div>
    </div>
  )
}

export default PropertiesPanel