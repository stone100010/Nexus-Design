import { beforeEach,describe, expect, it, vi } from 'vitest'

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
