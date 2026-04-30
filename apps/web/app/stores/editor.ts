import { create } from 'zustand'

import { generateId } from '@/lib/utils'
import { useUIStore } from '@/stores/ui'
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

  // Theme
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void

  // Alignment
  alignElements: (alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v') => void

  // Version management
  saveVersion: (description?: string) => Promise<void>
  loadVersion: (projectId: string, versionId: string) => Promise<void>
}

const initialState: EditorState & { theme: 'dark' | 'light' } = {
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
  theme: 'dark',
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
    const toast = useUIStore.getState().showToast

    try {
      const state = get()
      const projectData = {
        elements: state.elements,
        canvas: state.canvas,
        timestamp: new Date().toISOString(),
      }

      // 优先保存到数据库
      try {
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
          localStorage.setItem('currentProjectId', result.data.id)
          localStorage.setItem(`project_${name}`, JSON.stringify(projectData))
          toast('已保存到云端', 'success')
          return
        }
      } catch {
        // 数据库保存失败，降级到本地存储
      }

      // 降级：保存到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`project_${name}`, JSON.stringify(projectData))
      }
      toast('云端保存失败，已暂存本地', 'warning')
    } catch {
      toast('保存失败', 'error')
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
        const latestProject = result.data[0]
        if (latestProject.data) {
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
    } catch {
      // 从数据库加载失败，尝试本地存储
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

    useUIStore.getState().showToast('未找到保存的项目', 'warning')
  },

  setSaving: (isSaving) => {
    set({ isSaving })
  },

  // Theme
  theme: 'dark',
  setTheme: (theme) => {
    set({ theme })
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  },

  // Alignment
  alignElements: (alignment) => {
    const state = get()
    const selected = state.elements.filter((el) =>
      state.selectedElementIds.includes(el.id)
    )
    if (selected.length < 2) return

    let updates: Record<string, number>

    switch (alignment) {
      case 'left': {
        const minX = Math.min(...selected.map((el) => el.x))
        updates = { x: minX }
        break
      }
      case 'right': {
        const maxRight = Math.max(...selected.map((el) => el.x + el.width))
        selected.forEach((el) => {
          get().updateElement(el.id, { x: maxRight - el.width })
        })
        get().saveHistory('Align Right')
        return
      }
      case 'top': {
        const minY = Math.min(...selected.map((el) => el.y))
        updates = { y: minY }
        break
      }
      case 'bottom': {
        const maxBottom = Math.max(...selected.map((el) => el.y + el.height))
        selected.forEach((el) => {
          get().updateElement(el.id, { y: maxBottom - el.height })
        })
        get().saveHistory('Align Bottom')
        return
      }
      case 'center-h': {
        const minX = Math.min(...selected.map((el) => el.x))
        const maxRight = Math.max(...selected.map((el) => el.x + el.width))
        const centerX = (minX + maxRight) / 2
        selected.forEach((el) => {
          get().updateElement(el.id, { x: centerX - el.width / 2 })
        })
        get().saveHistory('Align Center Horizontal')
        return
      }
      case 'center-v': {
        const minY = Math.min(...selected.map((el) => el.y))
        const maxBottom = Math.max(...selected.map((el) => el.y + el.height))
        const centerY = (minY + maxBottom) / 2
        selected.forEach((el) => {
          get().updateElement(el.id, { y: centerY - el.height / 2 })
        })
        get().saveHistory('Align Center Vertical')
        return
      }
      default:
        return
    }

    selected.forEach((el) => {
      get().updateElement(el.id, updates)
    })
    get().saveHistory(`Align ${alignment}`)
  },

  // Version management
  saveVersion: async (description) => {
    const state = get()
    const toast = useUIStore.getState().showToast
    const projectId = typeof window !== 'undefined' ? localStorage.getItem('currentProjectId') : null

    if (!projectId) {
      toast('请先保存项目', 'warning')
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description || `版本保存 - ${new Date().toLocaleString('zh-CN')}`,
          data: {
            elements: state.elements,
            canvas: state.canvas,
          },
        }),
      })

      const result = await response.json()
      if (result.success) {
        toast('版本已保存', 'success')
      } else {
        toast(result.error || '版本保存失败', 'error')
      }
    } catch {
      toast('版本保存失败', 'error')
    }
  },

  loadVersion: async (projectId, versionId) => {
    const toast = useUIStore.getState().showToast

    try {
      const response = await fetch(`/api/projects/${projectId}/versions/${versionId}`)
      const result = await response.json()

      if (result.success && result.data?.data) {
        const versionData = result.data.data
        set({
          elements: versionData.elements || [],
          canvas: versionData.canvas || initialState.canvas,
          selectedElementIds: [],
        })
        get().saveHistory('Load Version')
        toast('版本已加载', 'success')
      } else {
        toast('版本加载失败', 'error')
      }
    } catch {
      toast('版本加载失败', 'error')
    }
  },
}))
