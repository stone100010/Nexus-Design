import { create } from 'zustand'

import { generateId } from '@/lib/utils'
import { useUIStore } from '@/stores/ui'
import { DesignPage, EditorElement, EditorHistory, EditorState } from '@/types'

interface EditorStore extends EditorState {
  // Internal
  _ensureActivePage: () => string

  // Page operations
  setPages: (pages: DesignPage[]) => void
  addPage: (page: DesignPage) => void
  removePage: (pageId: string) => void
  setActivePage: (pageId: string) => void
  updatePage: (pageId: string, updates: Partial<DesignPage>) => void
  getActivePage: () => DesignPage | undefined

  // Element operations (act on active page)
  addElement: (element: Omit<EditorElement, 'id'>) => string
  addElements: (elements: Omit<EditorElement, 'id'>[]) => void
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
  importState: (state: Partial<EditorState> & { elements?: EditorElement[] }) => void
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
  pages: [],
  activePageId: '',
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

  // ==================== Page Operations ====================

  setPages: (pages) => {
    const activePageId = pages.length > 0 ? pages[0].id : ''
    const activePage = pages[0]
    set({
      pages,
      activePageId,
      selectedElementIds: [],
      canvas: activePage
        ? { ...get().canvas, width: activePage.canvas.width, height: activePage.canvas.height }
        : get().canvas,
    })
  },

  addPage: (page) => {
    set((state) => ({
      pages: [...state.pages, page],
    }))
  },

  removePage: (pageId) => {
    const { pages, activePageId } = get()
    if (pages.length <= 1) return // 至少保留 1 页

    const newPages = pages.filter(p => p.id !== pageId)
    const newActiveId = pageId === activePageId
      ? newPages[0].id
      : activePageId

    const activePage = newPages.find(p => p.id === newActiveId)
    set({
      pages: newPages,
      activePageId: newActiveId,
      selectedElementIds: [],
      canvas: activePage
        ? { ...get().canvas, width: activePage.canvas.width, height: activePage.canvas.height }
        : get().canvas,
    })
    get().saveHistory('Remove Page')
  },

  setActivePage: (pageId) => {
    const page = get().pages.find(p => p.id === pageId)
    if (page) {
      set({
        activePageId: pageId,
        canvas: { ...get().canvas, width: page.canvas.width, height: page.canvas.height },
        selectedElementIds: [],
      })
    }
  },

  updatePage: (pageId, updates) => {
    set((state) => ({
      pages: state.pages.map(p =>
        p.id === pageId ? { ...p, ...updates } : p
      ),
    }))
  },

  getActivePage: () => {
    const { pages, activePageId } = get()
    return pages.find(p => p.id === activePageId)
  },

  // ==================== Element Operations ====================

  // 确保存在活跃页面，没有则自动创建
  _ensureActivePage: (): string => {
    const { pages, activePageId, canvas } = get()
    if (activePageId && pages.find(p => p.id === activePageId)) return activePageId

    const page: DesignPage = {
      id: generateId('page'),
      name: '页面 1',
      canvas: { width: canvas.width, height: canvas.height },
      elements: [],
    }
    set({ pages: [page], activePageId: page.id })
    return page.id
  },

  addElement: (element) => {
    const id = generateId('element')
    const newElement = { ...element, id }
    const pageId = get()._ensureActivePage()
    const { pages } = get()

    set({
      pages: pages.map(p =>
        p.id === pageId
          ? { ...p, elements: [...p.elements, newElement] }
          : p
      ),
    })

    get().saveHistory('Add Element')
    return id
  },

  addElements: (newElements) => {
    const elementsWithIds = newElements.map(el => ({
      ...el,
      id: generateId('element')
    }))

    const pageId = get()._ensureActivePage()
    const { pages } = get()
    set({
      pages: pages.map(p =>
        p.id === pageId
          ? { ...p, elements: [...p.elements, ...elementsWithIds] }
          : p
      ),
    })

    get().saveHistory('Add Elements')
  },

  updateElement: (id, updates) => {
    const { pages, activePageId } = get()
    set({
      pages: pages.map(p =>
        p.id === activePageId
          ? {
              ...p,
              elements: p.elements.map(el =>
                el.id === id ? { ...el, ...updates } : el
              ),
            }
          : p
      ),
    })
  },

  deleteElement: (id) => {
    const { pages, activePageId } = get()
    set({
      pages: pages.map(p =>
        p.id === activePageId
          ? { ...p, elements: p.elements.filter(el => el.id !== id) }
          : p
      ),
      selectedElementIds: get().selectedElementIds.filter(sid => sid !== id),
    })
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
    const activePage = get().getActivePage()
    const { selectedElementIds } = get()
    if (!activePage) return []
    return activePage.elements.filter((el) => selectedElementIds.includes(el.id))
  },

  // ==================== Extended Element Operations ====================

  duplicateElement: (id) => {
    const activePage = get().getActivePage()
    if (!activePage) return

    const element = activePage.elements.find((el) => el.id === id)
    if (!element) return

    const newElement = {
      ...element,
      id: generateId('element'),
      x: element.x + 20,
      y: element.y + 20,
    }

    const { pages, activePageId } = get()
    set({
      pages: pages.map(p =>
        p.id === activePageId
          ? { ...p, elements: [...p.elements, newElement] }
          : p
      ),
    })

    get().saveHistory('Duplicate Element')
  },

  bringToFront: (id) => {
    const { pages, activePageId } = get()
    const activePage = pages.find(p => p.id === activePageId)
    if (!activePage) return

    const element = activePage.elements.find((el) => el.id === id)
    if (!element) return

    const filtered = activePage.elements.filter((el) => el.id !== id)
    set({
      pages: pages.map(p =>
        p.id === activePageId
          ? { ...p, elements: [...filtered, element] }
          : p
      ),
    })

    get().saveHistory('Bring to Front')
  },

  sendToBack: (id) => {
    const { pages, activePageId } = get()
    const activePage = pages.find(p => p.id === activePageId)
    if (!activePage) return

    const element = activePage.elements.find((el) => el.id === id)
    if (!element) return

    const filtered = activePage.elements.filter((el) => el.id !== id)
    set({
      pages: pages.map(p =>
        p.id === activePageId
          ? { ...p, elements: [element, ...filtered] }
          : p
      ),
    })

    get().saveHistory('Send to Back')
  },

  // ==================== Canvas Operations ====================

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

  // ==================== History Operations ====================

  saveHistory: (action) => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      const snapshot: EditorHistory = {
        timestamp: new Date(),
        action,
        state: {
          pages: JSON.parse(JSON.stringify(state.pages)),
          activePageId: state.activePageId,
          selectedElementIds: [...state.selectedElementIds],
          canvas: { ...state.canvas },
          history: [],
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
        pages: JSON.parse(JSON.stringify(snapshot.state.pages)),
        activePageId: snapshot.state.activePageId,
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
        pages: JSON.parse(JSON.stringify(snapshot.state.pages)),
        activePageId: snapshot.state.activePageId,
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

  // ==================== Bulk Operations ====================

  setElements: (elements) => {
    // 兼容旧调用：设置到当前活跃页面
    const { pages, activePageId } = get()
    if (activePageId) {
      set({
        pages: pages.map(p =>
          p.id === activePageId ? { ...p, elements } : p
        ),
      })
    }
    get().saveHistory('Set Elements')
  },

  clear: () => {
    set({
      ...initialState,
      history: [],
      historyIndex: -1,
    })
  },

  clearCanvas: () => {
    const { pages, activePageId } = get()
    set({
      pages: pages.map(p =>
        p.id === activePageId ? { ...p, elements: [] } : p
      ),
      selectedElementIds: [],
    })
    get().saveHistory('Clear Canvas')
  },

  // ==================== Import/Export ====================

  importState: (state) => {
    // 兼容旧格式：{ elements, canvas } → 转为单页
    if (state.elements && !state.pages) {
      const page: DesignPage = {
        id: generateId('page'),
        name: '页面 1',
        canvas: state.canvas || initialState.canvas,
        elements: state.elements,
      }
      set({
        pages: [page],
        activePageId: page.id,
        selectedElementIds: state.selectedElementIds || [],
        canvas: state.canvas || initialState.canvas,
        history: state.history || [],
        historyIndex: state.historyIndex ?? -1,
      })
      return
    }

    // 新格式：{ pages, activePageId, canvas }
    set({
      pages: state.pages || [],
      activePageId: state.activePageId || (state.pages?.[0]?.id ?? ''),
      selectedElementIds: state.selectedElementIds || [],
      canvas: state.canvas || initialState.canvas,
      history: state.history || [],
      historyIndex: state.historyIndex ?? -1,
    })
  },

  exportState: () => {
    const state = get()
    return {
      pages: state.pages,
      activePageId: state.activePageId,
      selectedElementIds: state.selectedElementIds,
      canvas: state.canvas,
      history: [],
      historyIndex: -1,
    }
  },

  // ==================== Project Operations ====================

  saveProject: async (name = 'draft') => {
    set({ isSaving: true })
    const toast = useUIStore.getState().showToast

    try {
      const state = get()
      const projectData = {
        pages: state.pages,
        activePageId: state.activePageId,
        canvas: state.canvas,
        timestamp: new Date().toISOString(),
      }

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
    try {
      const response = await fetch('/api/projects')
      const result = await response.json()

      if (result.success && result.data?.length > 0) {
        const latestProject = result.data[0]
        if (latestProject.data) {
          localStorage.setItem('currentProjectId', latestProject.id)
          const data = latestProject.data

          // 兼容旧格式：{ elements, canvas } → { pages, activePageId }
          if (data.elements && !data.pages) {
            const page: DesignPage = {
              id: generateId('page'),
              name: '页面 1',
              canvas: data.canvas || initialState.canvas,
              elements: data.elements || [],
            }
            set({
              pages: [page],
              activePageId: page.id,
              selectedElementIds: [],
              canvas: data.canvas || initialState.canvas,
            })
          } else {
            set({
              pages: data.pages || [],
              activePageId: data.activePageId || data.pages?.[0]?.id || '',
              selectedElementIds: [],
              canvas: data.canvas || initialState.canvas,
            })
          }
          get().saveHistory('Load Project from Database')
          return
        }
      }
    } catch {
      // 从数据库加载失败，尝试本地存储
    }

    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(`project_${name}`)
      if (data) {
        const project = JSON.parse(data)
        if (project.elements && !project.pages) {
          const page: DesignPage = {
            id: generateId('page'),
            name: '页面 1',
            canvas: project.canvas || initialState.canvas,
            elements: project.elements || [],
          }
          set({
            pages: [page],
            activePageId: page.id,
            selectedElementIds: [],
            canvas: project.canvas || initialState.canvas,
          })
        } else {
          set({
            pages: project.pages || [],
            activePageId: project.activePageId || project.pages?.[0]?.id || '',
            selectedElementIds: [],
            canvas: project.canvas || initialState.canvas,
          })
        }
        get().saveHistory('Load Project from LocalStorage')
        return
      }
    }

    useUIStore.getState().showToast('未找到保存的项目', 'warning')
  },

  setSaving: (isSaving) => {
    set({ isSaving })
  },

  // ==================== Theme ====================

  theme: 'dark',
  setTheme: (theme) => {
    set({ theme })
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  },

  // ==================== Alignment ====================

  alignElements: (alignment) => {
    const activePage = get().getActivePage()
    if (!activePage) return

    const { selectedElementIds } = get()
    const selected = activePage.elements.filter((el) =>
      selectedElementIds.includes(el.id)
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

  // ==================== Version Management ====================

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
            pages: state.pages,
            activePageId: state.activePageId,
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

        // 兼容旧格式
        if (versionData.elements && !versionData.pages) {
          const page: DesignPage = {
            id: generateId('page'),
            name: '页面 1',
            canvas: versionData.canvas || initialState.canvas,
            elements: versionData.elements || [],
          }
          set({
            pages: [page],
            activePageId: page.id,
            selectedElementIds: [],
            canvas: versionData.canvas || initialState.canvas,
          })
        } else {
          set({
            pages: versionData.pages || [],
            activePageId: versionData.activePageId || versionData.pages?.[0]?.id || '',
            selectedElementIds: [],
            canvas: versionData.canvas || initialState.canvas,
          })
        }
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
