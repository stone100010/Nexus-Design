import { create } from 'zustand'

import { generateId } from '@/lib/utils'
import { EditorElement, EditorHistory,EditorState } from '@/types'

interface EditorStore extends EditorState {
  // Element operations
  addElement: (element: Omit<EditorElement, 'id'>) => string
  updateElement: (id: string, updates: Partial<EditorElement>) => void
  deleteElement: (id: string) => void
  selectElement: (id: string, multiSelect?: boolean) => void
  deselectElement: (id: string) => void
  clearSelection: () => void
  getSelectedElements: () => EditorElement[]
  
  // Extended element operations
  duplicateElement: (id: string) => void
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  
  // Canvas operations
  setCanvas: (canvas: Partial<EditorState['canvas']>) => void
  setCanvasSize: (size: { width: number; height: number }) => void
  setZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  
  // History operations
  saveHistory: (action: string) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  
  // Bulk operations
  setElements: (elements: EditorElement[]) => void
  clear: () => void
  clearCanvas: () => void
  
  // Project operations
  saveProject: (name?: string) => Promise<void>
  loadProject: (name?: string) => Promise<void>
  
  // Loading state
  setSaving: (isSaving: boolean) => void
  
  // Import/Export
  importState: (state: Partial<EditorState>) => void
  exportState: () => EditorState
}

const initialState: EditorState = {
  elements: [],
  selectedElementIds: [],
  canvas: {
    width: 375,
    height: 812,
    zoom: 1,
    x: 0,
    y: 0,
  },
  history: [],
  historyIndex: -1,
  isSaving: false,
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  addElement: (element) => {
    const id = generateId('element')
    const newElement = { ...element, id }
    
    set((state) => ({
      elements: [...state.elements, newElement],
    }))
    
    // 保存历史
    get().saveHistory('Add Element')
    
    return id
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }))
  },

  deleteElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementIds: state.selectedElementIds.filter(
        (selectedId) => selectedId !== id
      ),
    }))
    
    get().saveHistory('Delete Element')
  },

  selectElement: (id, multiSelect = false) => {
    set((state) => {
      if (multiSelect) {
        const isSelected = state.selectedElementIds.includes(id)
        return {
          selectedElementIds: isSelected
            ? state.selectedElementIds.filter((selectedId) => selectedId !== id)
            : [...state.selectedElementIds, id],
        }
      }
      return { selectedElementIds: [id] }
    })
  },

  deselectElement: (id) => {
    set((state) => ({
      selectedElementIds: state.selectedElementIds.filter(
        (selectedId) => selectedId !== id
      ),
    }))
  },

  clearSelection: () => {
    set({ selectedElementIds: [] })
  },

  getSelectedElements: () => {
    const { elements, selectedElementIds } = get()
    return elements.filter((el) => selectedElementIds.includes(el.id))
  },

  setCanvas: (canvas) => {
    set((state) => ({
      canvas: { ...state.canvas, ...canvas },
    }))
  },

  zoomIn: () => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        zoom: Math.min(state.canvas.zoom + 0.1, 3),
      },
    }))
  },

  zoomOut: () => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        zoom: Math.max(state.canvas.zoom - 0.1, 0.1),
      },
    }))
  },

  resetZoom: () => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        zoom: 1,
        x: 0,
        y: 0,
      },
    }))
  },

  saveHistory: (action) => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      const snapshot: EditorHistory = {
        timestamp: new Date(),
        action,
        state: {
          elements: JSON.parse(JSON.stringify(state.elements)),
          selectedElementIds: [...state.selectedElementIds],
          canvas: { ...state.canvas },
          history: [], // 不保存历史的历史
          historyIndex: -1,
        },
      }
      
      return {
        history: [...newHistory, snapshot],
        historyIndex: newHistory.length,
      }
    })
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex <= 0) return state
      
      const snapshot = state.history[state.historyIndex - 1]
      return {
        elements: JSON.parse(JSON.stringify(snapshot.state.elements)),
        selectedElementIds: [...snapshot.state.selectedElementIds],
        canvas: { ...snapshot.state.canvas },
        historyIndex: state.historyIndex - 1,
      }
    })
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state
      
      const snapshot = state.history[state.historyIndex + 1]
      return {
        elements: JSON.parse(JSON.stringify(snapshot.state.elements)),
        selectedElementIds: [...snapshot.state.selectedElementIds],
        canvas: { ...snapshot.state.canvas },
        historyIndex: state.historyIndex + 1,
      }
    })
  },

  canUndo: () => {
    const { historyIndex } = get()
    return historyIndex > 0
  },

  canRedo: () => {
    const { historyIndex, history } = get()
    return historyIndex < history.length - 1
  },

  setElements: (elements) => {
    set({ elements })
    get().saveHistory('Set Elements')
  },

  clear: () => {
    set(initialState)
    get().saveHistory('Clear')
  },

  importState: (state) => {
    set({
      elements: state.elements || [],
      selectedElementIds: state.selectedElementIds || [],
      canvas: state.canvas || initialState.canvas,
      history: state.history || [],
      historyIndex: state.historyIndex || -1,
    })
  },

  exportState: () => {
    const state = get()
    return {
      elements: state.elements,
      selectedElementIds: state.selectedElementIds,
      canvas: state.canvas,
      history: [], // 不导出历史
      historyIndex: -1,
    }
  },

  // Extended element operations
  duplicateElement: (id) => {
    const state = get()
    const element = state.elements.find((el) => el.id === id)
    if (!element) return

    const newElement = {
      ...element,
      id: generateId('element'),
      x: element.x + 20,
      y: element.y + 20,
    }

    set((state) => ({
      elements: [...state.elements, newElement],
    }))

    get().saveHistory('Duplicate Element')
  },

  bringToFront: (id) => {
    set((state) => {
      const element = state.elements.find((el) => el.id === id)
      if (!element) return state

      const filtered = state.elements.filter((el) => el.id !== id)
      return {
        elements: [...filtered, element],
      }
    })

    get().saveHistory('Bring to Front')
  },

  sendToBack: (id) => {
    set((state) => {
      const element = state.elements.find((el) => el.id === id)
      if (!element) return state

      const filtered = state.elements.filter((el) => el.id !== id)
      return {
        elements: [element, ...filtered],
      }
    })

    get().saveHistory('Send to Back')
  },

  // Canvas operations
  setCanvasSize: (size) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        width: size.width,
        height: size.height,
      },
    }))
  },

  setZoom: (zoom) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        zoom,
      },
    }))
  },

  clearCanvas: () => {
    set({ elements: [], selectedElementIds: [] })
    get().saveHistory('Clear Canvas')
  },

  // Project operations
  saveProject: async (name = 'draft') => {
    set({ isSaving: true })
    
    try {
      const state = get()
      const projectData = {
        elements: state.elements,
        canvas: state.canvas,
        timestamp: new Date().toISOString(),
      }

      // 优先保存到数据库
      try {
        // 检查是否有现有项目ID存储在localStorage中
        const existingProjectId = localStorage.getItem('currentProjectId')
        
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: existingProjectId,
            name: name === 'draft' ? '草稿项目' : name,
            data: projectData,
            settings: { theme: 'dark', devices: ['iphone-14-pro'] }
          })
        })

        const result = await response.json()
        
        if (result.success && result.data?.id) {
          // 保存项目ID到localStorage
          localStorage.setItem('currentProjectId', result.data.id)
          
          // 也保存到localStorage作为备份
          localStorage.setItem(`project_${name}`, JSON.stringify(projectData))
          return
        }
      } catch (error) {
        console.error('保存到数据库失败，使用本地存储:', error)
      }

      // 降级：保存到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`project_${name}`, JSON.stringify(projectData))
      }
    } finally {
      set({ isSaving: false })
    }
  },

  loadProject: async (name = 'draft') => {
    // 尝试从数据库加载
    try {
      const response = await fetch('/api/projects')
      const result = await response.json()
      
      if (result.success && result.data?.length > 0) {
        // 使用最新的项目
        const latestProject = result.data[0]
        if (latestProject.data) {
          // 保存项目ID
          localStorage.setItem('currentProjectId', latestProject.id)
          
          set({
            elements: latestProject.data.elements || [],
            canvas: latestProject.data.canvas || initialState.canvas,
            selectedElementIds: [],
          })
          get().saveHistory('Load Project from Database')
          return
        }
      }
    } catch (error) {
      console.error('从数据库加载失败，尝试本地存储:', error)
    }

    // 降级：从 localStorage 加载
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(`project_${name}`)
      if (data) {
        const project = JSON.parse(data)
        set({
          elements: project.elements || [],
          canvas: project.canvas || initialState.canvas,
          selectedElementIds: [],
        })
        get().saveHistory('Load Project from LocalStorage')
        return
      }
    }

    throw new Error('未找到保存的项目')
  },

  setSaving: (isSaving) => {
    set({ isSaving })
  },
}))
