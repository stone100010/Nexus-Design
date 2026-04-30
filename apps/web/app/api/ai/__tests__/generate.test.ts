/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach,describe, expect, it, vi } from 'vitest'

// Mock modules
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    aIGeneration: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('@/lib/api-error', () => ({
  handleApiError: (error: unknown) => new Response(
    JSON.stringify({ success: false, error: String(error) }),
    { status: 500 }
  ),
}))

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: '{"elements":[{"type":"text","x":10,"y":10,"width":200,"height":30,"props":{"text":"Hello"},"styles":{"color":"#fff"}}],"canvas":{"width":375,"height":812}}' } }],
            usage: { total_tokens: 100 },
          }),
        },
      }
    },
  }
})

import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/db'

function createMockRequest(body?: unknown) {
  return {
    json: body ? vi.fn().mockResolvedValue(body) : undefined,
    url: 'http://localhost:3000/api/ai/generate',
  } as any
}

describe('AI Generate API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  async function readSseEvents(response: Response) {
    const reader = response.body?.getReader()
    expect(reader).toBeDefined()

    const decoder = new TextDecoder()
    let text = ''

    for (;;) {
      const { done, value } = await reader!.read()
      if (done) break
      text += decoder.decode(value, { stream: true })
    }

    return text
      .split('\n\n')
      .map(event => event.trim())
      .filter(event => event.startsWith('data: '))
      .map(event => JSON.parse(event.slice(6)))
  }

  describe('POST', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const route = await import('@/api/ai/generate/route')
      const response = await route.POST(createMockRequest({ prompt: 'test' }))

      expect(response.status).toBe(401)
    })

    it('returns 400 when prompt is missing', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any)

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      } as any)

      const route = await import('@/api/ai/generate/route')
      const response = await route.POST(createMockRequest({}))

      expect(response.status).toBe(400)
    })

    it('returns successful generation result', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any)

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      } as any)

      vi.mocked(prisma.aIGeneration.create).mockResolvedValue({
        id: 'gen-1',
        status: 'SUCCESS',
      } as any)

      const route = await import('@/api/ai/generate/route')
      const response = await route.POST(createMockRequest({ prompt: 'A login form' }))
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.design).toBeDefined()
      expect(data.data.metadata).toBeDefined()
    })

    it('streams pages incrementally from spaced pages key and ignores reasoning_content', async () => {
      vi.useFakeTimers()
      vi.mocked(getServerSession).mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any)

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      } as any)

      vi.mocked(prisma.aIGeneration.count).mockResolvedValue(0)
      vi.mocked(prisma.aIGeneration.create).mockResolvedValue({
        id: 'gen-stream',
        status: 'SUCCESS',
      } as any)

      const encoder = new TextEncoder()
      const aiChunks = [
        { choices: [{ delta: { reasoning_content: 'thinking...' } }] },
        { choices: [{ delta: { content: '{"app":"Demo","style":"glass","pages" : [' } }] },
        { choices: [{ delta: { content: '{"id":"page-1","name":"首页","canvas":{"width":375,"height":812},"elements":[{"type":"text","x":10,"y":20,"width":120,"height":24,"props":{"text":"首页"},"styles":{"color":"#fff"}}]}' } }] },
        { choices: [{ delta: { content: ',{"id":"page-2","name":"详情","canvas":{"width":375,"height":812},"elements":[{"type":"button","x":20,"y":100,"width":140,"height":44,"props":{"text":"提交"},"styles":{"background":"#6366f1"}}]}]}' } }] },
      ]

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(new ReadableStream({
        start(controller) {
          for (const chunk of aiChunks) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        },
      }), { status: 200 })))

      const route = await import('@/api/ai/generate/route')
      const response = await route.POST(createMockRequest({ prompt: 'stream app', stream: true }))
      const eventsPromise = readSseEvents(response)
      await vi.runAllTimersAsync()
      const events = await eventsPromise
      vi.useRealTimers()

      const pageEvents = events.filter(event => event.type === 'page')
      const progressEvents = events.filter(event => event.type === 'progress')
      expect(pageEvents).toHaveLength(2)
      expect(pageEvents[0].page.name).toBe('首页')
      expect(pageEvents[0].firstPageTokens).toBeGreaterThan(0)
      expect(pageEvents[0].estimatedTokens).toBeGreaterThan(0)
      expect(pageEvents[1].page.name).toBe('详情')
      expect(progressEvents.some(event => typeof event.estimatedTokens === 'number')).toBe(true)
      expect(progressEvents.some(event => typeof event.reasoningEstimatedTokens === 'number')).toBe(true)
      expect(events.some(event => event.type === 'done' && event.totalPages === 2)).toBe(true)
      expect(prisma.aIGeneration.create).toHaveBeenCalled()
    })
  })

  describe('GET', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const route = await import('@/api/ai/generate/route')
      const request = { url: 'http://localhost:3000/api/ai/generate' } as any
      const response = await route.GET(request)

      expect(response.status).toBe(401)
    })

    it('returns generation history', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any)

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      } as any)

      vi.mocked(prisma.aIGeneration.findMany).mockResolvedValue([
        { id: 'gen-1', prompt: 'test', status: 'SUCCESS' },
      ] as any)

      vi.mocked(prisma.aIGeneration.count).mockResolvedValue(1)

      const route = await import('@/api/ai/generate/route')
      const request = { url: 'http://localhost:3000/api/ai/generate?page=1&limit=10' } as any
      const response = await route.GET(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
    })
  })
})
