import { beforeEach, describe, expect, it } from 'vitest'

import { useEditorStore } from '../editor'

describe('useEditorStore', () => {
  beforeEach(() => {
    useEditorStore.setState({
      elements: [],
      selectedElementIds: [],
      canvas: { width: 375, height: 812, zoom: 1, x: 0, y: 0 },
      history: [],
      historyIndex: -1,
      isSaving: false,
    })
  })

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

      const elements = useEditorStore.getState().elements
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

      const element = useEditorStore.getState().elements.find(el => el.id === id)
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

      const element = useEditorStore.getState().elements.find(el => el.id === id)
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

      expect(useEditorStore.getState().elements).toHaveLength(0)
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

      expect(useEditorStore.getState().elements).toHaveLength(1)
      // After first action, history has 1 entry at index 0
      expect(useEditorStore.getState().history.length).toBeGreaterThanOrEqual(1)
    })

    it('undoes after multiple actions', () => {
      useEditorStore.getState().addElement({
        type: 'button', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })
      useEditorStore.getState().addElement({
        type: 'text', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })

      expect(useEditorStore.getState().elements).toHaveLength(2)
      expect(useEditorStore.getState().canUndo()).toBe(true)

      useEditorStore.getState().undo()
      expect(useEditorStore.getState().elements).toHaveLength(1)
    })

    it('redoes an undone action', () => {
      useEditorStore.getState().addElement({
        type: 'button', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })
      useEditorStore.getState().addElement({
        type: 'text', x: 0, y: 0, width: 100, height: 40, props: {}, styles: {},
      })

      useEditorStore.getState().undo()
      expect(useEditorStore.getState().elements).toHaveLength(1)

      useEditorStore.getState().redo()
      expect(useEditorStore.getState().elements).toHaveLength(2)
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

      expect(useEditorStore.getState().elements).toHaveLength(0)
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

      const elements = useEditorStore.getState().elements
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

      const elements = useEditorStore.getState().elements
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

      const elements = useEditorStore.getState().elements
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
})
