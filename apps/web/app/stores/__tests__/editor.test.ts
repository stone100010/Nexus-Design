import { beforeEach, describe, expect, it } from 'vitest'

import { useEditorStore } from '../editor'

describe('useEditorStore', () => {
  beforeEach(() => {
    useEditorStore.setState({
      pages: [],
      activePageId: '',
      selectedElementIds: [],
      canvas: { width: 375, height: 812, zoom: 1, x: 0, y: 0 },
      history: [],
      historyIndex: -1,
      isSaving: false,
    })
  })

  const getElements = () => useEditorStore.getState().getActivePage()?.elements ?? []

  describe('addElement', () => {
    it('adds an element with generated id', () => {
      const id = useEditorStore.getState().addElement({
        type: 'button',
        x: 10,
        y: 20,
        width: 100,
        height: 40,
        props: { text: 'Click me' },
        styles: { background: '#000' },
      })

      const elements = getElements()
      expect(elements).toHaveLength(1)
      expect(elements[0].id).toBe(id)
      expect(elements[0].type).toBe('button')
      expect(elements[0].x).toBe(10)
    })
  })

  describe('updateElement', () => {
    it('updates element properties', () => {
      const id = useEditorStore.getState().addElement({
        type: 'text',
        x: 0,
        y: 0,
        width: 100,
        height: 40,
        props: {},
        styles: {},
      })

      useEditorStore.getState().updateElement(id, { x: 50, y: 100 })

      const element = getElements().find(el => el.id === id)
      expect(element?.x).toBe(50)
      expect(element?.y).toBe(100)
    })

    it('updates element styles', () => {
      const id = useEditorStore.getState().addElement({
        type: 'button',
        x: 0,
        y: 0,
        width: 100,
        height: 40,
        props: {},
        styles: { background: '#000' },
      })

      useEditorStore.getState().updateElement(id, {
        styles: { background: '#fff', color: '#000' },
      })

      const element = getElements().find(el => el.id === id)
      expect(element?.styles).toEqual({ background: '#fff', color: '#000' })
    })
  })

  describe('deleteElement', () => {
    it('removes an element', () => {
      const id = useEditorStore.getState().addElement({
        type: 'button',
        x: 0,
        y: 0,
        width: 100,
        height: 40,
        props: {},
        styles: {},
      })

      useEditorStore.getState().deleteElement(id)

      expect(getElements()).toHaveLength(0)
    })

    it('removes element from selection', () => {
      const id = useEditorStore.getState().addElement({
        type: 'button',
        x: 0,
        y: 0,
        width: 100,
        height: 40,
        props: {},
        styles: {},
      })

      useEditorStore.getState().selectElement(id)
      useEditorStore.getState().deleteElement(id)

      expect(useEditorStore.getState().selectedElementIds).toHaveLength(0)
    })
  })

  describe('selectElement', () => {
    it('selects a single element', () => {
      const id = useEditorStore.getState().addElement({
        type: 'button',
        x: 0,
        y: 0,
        width: 100,
        height: 40,
        props: {},
        styles: {},
      })

      useEditorStore.getState().selectElement(id)
      expect(useEditorStore.getState().selectedElementIds).toEqual([id])
    })

    it('supports multi-select', () => {
      const id1 = useEditorStore.getState().addElement({
        type: 'button', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })
      const id2 = useEditorStore.getState().addElement({
        type: 'text', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })

      useEditorStore.getState().selectElement(id1)
      useEditorStore.getState().selectElement(id2, true)

      expect(useEditorStore.getState().selectedElementIds).toContain(id1)
      expect(useEditorStore.getState().selectedElementIds).toContain(id2)
    })
  })

  describe('undo/redo', () => {
    it('tracks history after actions', () => {
      useEditorStore.getState().addElement({
        type: 'button', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })

      expect(getElements()).toHaveLength(1)
      expect(useEditorStore.getState().history.length).toBeGreaterThanOrEqual(1)
    })

    it('undoes after multiple actions', () => {
      useEditorStore.getState().addElement({
        type: 'button', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })
      useEditorStore.getState().addElement({
        type: 'text', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })

      expect(getElements()).toHaveLength(2)
      expect(useEditorStore.getState().canUndo()).toBe(true)

      useEditorStore.getState().undo()
      expect(getElements()).toHaveLength(1)
    })

    it('redoes an undone action', () => {
      useEditorStore.getState().addElement({
        type: 'button', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })
      useEditorStore.getState().addElement({
        type: 'text', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })

      useEditorStore.getState().undo()
      expect(getElements()).toHaveLength(1)

      useEditorStore.getState().redo()
      expect(getElements()).toHaveLength(2)
    })

    it('cannot undo when no history', () => {
      expect(useEditorStore.getState().canUndo()).toBe(false)
    })

    it('cannot redo when at latest state', () => {
      useEditorStore.getState().addElement({
        type: 'button', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })

      expect(useEditorStore.getState().canRedo()).toBe(false)
    })
  })

  describe('clearCanvas', () => {
    it('removes all elements', () => {
      useEditorStore.getState().addElement({
        type: 'button', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })
      useEditorStore.getState().addElement({
        type: 'text', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })

      useEditorStore.getState().clearCanvas()

      expect(getElements()).toHaveLength(0)
      expect(useEditorStore.getState().selectedElementIds).toHaveLength(0)
    })
  })

  describe('duplicateElement', () => {
    it('creates a copy offset by 20px', () => {
      const id = useEditorStore.getState().addElement({
        type: 'button', x: 100, y: 100, width: 100, height: 40,
        props: { text: 'Original' }, styles: {},
      })

      useEditorStore.getState().duplicateElement(id)

      const elements = getElements()
      expect(elements).toHaveLength(2)

      const copy = elements.find(el => el.id !== id)
      expect(copy?.x).toBe(120)
      expect(copy?.y).toBe(120)
    })
  })

  describe('bringToFront/sendToBack', () => {
    it('moves element to front', () => {
      const id1 = useEditorStore.getState().addElement({
        type: 'button', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })
      useEditorStore.getState().addElement({
        type: 'text', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })

      useEditorStore.getState().bringToFront(id1)

      const elements = getElements()
      expect(elements[elements.length - 1].id).toBe(id1)
    })

    it('moves element to back', () => {
      useEditorStore.getState().addElement({
        type: 'button', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })
      const id2 = useEditorStore.getState().addElement({
        type: 'text', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })

      useEditorStore.getState().sendToBack(id2)

      const elements = getElements()
      expect(elements[0].id).toBe(id2)
    })
  })

  describe('zoom', () => {
    it('zooms in', () => {
      useEditorStore.getState().zoomIn()
      expect(useEditorStore.getState().canvas.zoom).toBeCloseTo(1.1)
    })

    it('zooms out', () => {
      useEditorStore.getState().zoomOut()
      expect(useEditorStore.getState().canvas.zoom).toBeCloseTo(0.9)
    })

    it('resets zoom', () => {
      useEditorStore.getState().zoomIn()
      useEditorStore.getState().zoomIn()
      useEditorStore.getState().resetZoom()
      expect(useEditorStore.getState().canvas.zoom).toBe(1)
    })

    it('does not zoom beyond limits', () => {
      for (let i = 0; i < 50; i++) {
        useEditorStore.getState().zoomIn()
      }
      expect(useEditorStore.getState().canvas.zoom).toBeLessThanOrEqual(3)

      for (let i = 0; i < 50; i++) {
        useEditorStore.getState().zoomOut()
      }
      expect(useEditorStore.getState().canvas.zoom).toBeGreaterThanOrEqual(0.1)
    })
  })

  describe('setCanvasSize', () => {
    it('updates canvas dimensions', () => {
      useEditorStore.getState().setCanvasSize({ width: 1024, height: 768 })
      expect(useEditorStore.getState().canvas.width).toBe(1024)
      expect(useEditorStore.getState().canvas.height).toBe(768)
    })
  })

  describe('page operations', () => {
    it('setPages creates pages and sets first as active', () => {
      const { setPages } = useEditorStore.getState()
      setPages([
        { id: 'p1', name: 'Page 1', canvas: { width: 375, height: 812 }, elements: [] },
        { id: 'p2', name: 'Page 2', canvas: { width: 375, height: 812 }, elements: [] },
      ])

      const state = useEditorStore.getState()
      expect(state.pages).toHaveLength(2)
      expect(state.activePageId).toBe('p1')
    })

    it('setActivePage switches page and syncs canvas', () => {
      const { setPages, setActivePage } = useEditorStore.getState()
      setPages([
        { id: 'p1', name: 'Page 1', canvas: { width: 375, height: 812 }, elements: [] },
        { id: 'p2', name: 'Page 2', canvas: { width: 414, height: 896 }, elements: [] },
      ])

      setActivePage('p2')
      const state = useEditorStore.getState()
      expect(state.activePageId).toBe('p2')
      expect(state.canvas.width).toBe(414)
      expect(state.canvas.height).toBe(896)
    })

    it('removePage keeps at least 1 page', () => {
      const { setPages, removePage } = useEditorStore.getState()
      setPages([
        { id: 'p1', name: 'Page 1', canvas: { width: 375, height: 812 }, elements: [] },
      ])

      removePage('p1')
      expect(useEditorStore.getState().pages).toHaveLength(1)
    })

    it('addElement targets active page', () => {
      const { setPages, setActivePage, addElement } = useEditorStore.getState()
      setPages([
        { id: 'p1', name: 'Page 1', canvas: { width: 375, height: 812 }, elements: [] },
        { id: 'p2', name: 'Page 2', canvas: { width: 375, height: 812 }, elements: [] },
      ])

      setActivePage('p1')
      addElement({ type: 'text', x: 0, y: 0, width: 100, height: 20, props: {}, styles: {} })

      setActivePage('p2')
      expect(getElements()).toHaveLength(0)

      setActivePage('p1')
      expect(getElements()).toHaveLength(1)
    })

    it('keeps elements isolated across three pages', () => {
      const { setPages, setActivePage, addElement } = useEditorStore.getState()
      setPages([
        { id: 'p1', name: 'Page 1', canvas: { width: 375, height: 812 }, elements: [] },
        { id: 'p2', name: 'Page 2', canvas: { width: 414, height: 896 }, elements: [] },
        { id: 'p3', name: 'Page 3', canvas: { width: 768, height: 1024 }, elements: [] },
      ])

      setActivePage('p1')
      addElement({ type: 'text', x: 0, y: 0, width: 100, height: 20, props: { text: 'P1' }, styles: {} })
      setActivePage('p2')
      addElement({ type: 'button', x: 10, y: 10, width: 100, height: 40, props: { text: 'P2' }, styles: {} })
      setActivePage('p3')
      addElement({ type: 'input', x: 20, y: 20, width: 180, height: 36, props: { placeholder: 'P3' }, styles: {} })

      const state = useEditorStore.getState()
      expect(state.pages.find(page => page.id === 'p1')?.elements).toHaveLength(1)
      expect(state.pages.find(page => page.id === 'p2')?.elements).toHaveLength(1)
      expect(state.pages.find(page => page.id === 'p3')?.elements).toHaveLength(1)
      expect(state.canvas.width).toBe(768)
      expect(state.canvas.height).toBe(1024)
    })

    it('clears selection when switching pages', () => {
      const { setPages, setActivePage, addElement, selectElement } = useEditorStore.getState()
      setPages([
        { id: 'p1', name: 'Page 1', canvas: { width: 375, height: 812 }, elements: [] },
        { id: 'p2', name: 'Page 2', canvas: { width: 375, height: 812 }, elements: [] },
      ])

      const id = addElement({ type: 'text', x: 0, y: 0, width: 100, height: 20, props: {}, styles: {} })
      selectElement(id)
      expect(useEditorStore.getState().selectedElementIds).toEqual([id])

      setActivePage('p2')
      expect(useEditorStore.getState().selectedElementIds).toEqual([])
    })
  })

  describe('bulk and import operations', () => {
    it('setElements does not save history without an active page', () => {
      useEditorStore.getState().setElements([
        { id: 'orphan', type: 'text', x: 0, y: 0, width: 100, height: 20, props: {}, styles: {} },
      ])

      expect(useEditorStore.getState().pages).toHaveLength(0)
      expect(useEditorStore.getState().history).toHaveLength(0)
    })

    it('imports old single-page elements as one page', () => {
      useEditorStore.getState().importState({
        canvas: { width: 390, height: 844, zoom: 1, x: 0, y: 0 },
        elements: [
          { id: 'legacy-1', type: 'text', x: 1, y: 2, width: 100, height: 20, props: {}, styles: {} },
        ],
      })

      const state = useEditorStore.getState()
      expect(state.pages).toHaveLength(1)
      expect(state.activePageId).toBe(state.pages[0].id)
      expect(state.pages[0].elements[0].id).toBe('legacy-1')
      expect(state.canvas.width).toBe(390)
    })

    it('imports pages over legacy elements and syncs canvas to active page', () => {
      useEditorStore.getState().importState({
        pages: [
          { id: 'p1', name: 'Page 1', canvas: { width: 375, height: 812 }, elements: [] },
          { id: 'p2', name: 'Page 2', canvas: { width: 1024, height: 768 }, elements: [] },
        ],
        activePageId: 'p2',
        canvas: { width: 375, height: 812, zoom: 1, x: 0, y: 0 },
        elements: [
          { id: 'ignored', type: 'text', x: 0, y: 0, width: 100, height: 20, props: {}, styles: {} },
        ],
      })

      const state = useEditorStore.getState()
      expect(state.pages).toHaveLength(2)
      expect(state.pages.some(page => page.elements.some(element => element.id === 'ignored'))).toBe(false)
      expect(state.activePageId).toBe('p2')
      expect(state.canvas.width).toBe(1024)
      expect(state.canvas.height).toBe(768)
    })
  })
})
