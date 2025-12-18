import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { UIState } from '@/types'

interface Toast {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

interface UIStore extends UIState {
  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  setSelectedProjectId: (id?: string) => void
  setSelectedDevice: (device?: string) => void
  setCollaborating: (isCollaborating: boolean) => void
  reset: () => void
  toast: Toast | null
  setToast: (toast: Toast | null) => void
  clearToast: () => void
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void
}

const initialState: UIState = {
  sidebarOpen: false,
  theme: 'dark',
  selectedProjectId: undefined,
  selectedDevice: undefined,
  isCollaborating: false,
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      toast: null,

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open })
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme })
        // 更新 HTML 属性
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark')
        }
      },

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light'
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', newTheme === 'dark')
          }
          return { theme: newTheme }
        })
      },

      setSelectedProjectId: (id?: string) => {
        set({ selectedProjectId: id })
      },

      setSelectedDevice: (device?: string) => {
        set({ selectedDevice: device })
      },

      setCollaborating: (isCollaborating: boolean) => {
        set({ isCollaborating })
      },

      reset: () => {
        set(initialState)
      },

      setToast: (toast: Toast | null) => {
        set({ toast })
        if (toast) {
          setTimeout(() => {
            set({ toast: null })
          }, toast.duration || 3000)
        }
      },

      clearToast: () => set({ toast: null }),
      
      showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration?: number) => {
        set({ toast: { message, type, duration } })
        if (duration === undefined || duration > 0) {
          setTimeout(() => {
            set({ toast: null })
          }, duration || 3000)
        }
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
