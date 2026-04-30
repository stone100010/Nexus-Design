import { beforeEach, describe, expect, it } from 'vitest'

import { useUIStore } from '../ui'

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarOpen: false,
      theme: 'dark',
      selectedProjectId: undefined,
      selectedDevice: undefined,
      isCollaborating: false,
      toast: null,
    })
  })

  describe('toggleSidebar', () => {
    it('toggles sidebar open state', () => {
      expect(useUIStore.getState().sidebarOpen).toBe(false)
      useUIStore.getState().toggleSidebar()
      expect(useUIStore.getState().sidebarOpen).toBe(true)
      useUIStore.getState().toggleSidebar()
      expect(useUIStore.getState().sidebarOpen).toBe(false)
    })
  })

  describe('setSidebarOpen', () => {
    it('sets sidebar state explicitly', () => {
      useUIStore.getState().setSidebarOpen(true)
      expect(useUIStore.getState().sidebarOpen).toBe(true)
      useUIStore.getState().setSidebarOpen(false)
      expect(useUIStore.getState().sidebarOpen).toBe(false)
    })
  })

  describe('toggleTheme', () => {
    it('toggles between light and dark', () => {
      expect(useUIStore.getState().theme).toBe('dark')
      useUIStore.getState().toggleTheme()
      expect(useUIStore.getState().theme).toBe('light')
      useUIStore.getState().toggleTheme()
      expect(useUIStore.getState().theme).toBe('dark')
    })
  })

  describe('setTheme', () => {
    it('sets theme explicitly', () => {
      useUIStore.getState().setTheme('light')
      expect(useUIStore.getState().theme).toBe('light')
    })
  })

  describe('showToast / clearToast', () => {
    it('shows a toast message', () => {
      useUIStore.getState().showToast('Test message', 'success')
      const toast = useUIStore.getState().toast
      expect(toast).not.toBeNull()
      expect(toast?.message).toBe('Test message')
      expect(toast?.type).toBe('success')
    })

    it('clears toast', () => {
      useUIStore.getState().showToast('Test', 'info')
      useUIStore.getState().clearToast()
      expect(useUIStore.getState().toast).toBeNull()
    })

    it('defaults to info type', () => {
      useUIStore.getState().showToast('Info message')
      expect(useUIStore.getState().toast?.type).toBe('info')
    })
  })

  describe('setSelectedProjectId', () => {
    it('sets and clears project id', () => {
      useUIStore.getState().setSelectedProjectId('proj-123')
      expect(useUIStore.getState().selectedProjectId).toBe('proj-123')
      useUIStore.getState().setSelectedProjectId(undefined)
      expect(useUIStore.getState().selectedProjectId).toBeUndefined()
    })
  })

  describe('setSelectedDevice', () => {
    it('sets device', () => {
      useUIStore.getState().setSelectedDevice('iphone-14-pro')
      expect(useUIStore.getState().selectedDevice).toBe('iphone-14-pro')
    })
  })

  describe('setCollaborating', () => {
    it('sets collaborating state', () => {
      useUIStore.getState().setCollaborating(true)
      expect(useUIStore.getState().isCollaborating).toBe(true)
    })
  })

  describe('reset', () => {
    it('resets to initial state', () => {
      useUIStore.getState().toggleSidebar()
      useUIStore.getState().toggleTheme()
      useUIStore.getState().setSelectedProjectId('test')
      useUIStore.getState().reset()

      const state = useUIStore.getState()
      expect(state.sidebarOpen).toBe(false)
      expect(state.theme).toBe('dark')
      expect(state.selectedProjectId).toBeUndefined()
    })
  })
})
