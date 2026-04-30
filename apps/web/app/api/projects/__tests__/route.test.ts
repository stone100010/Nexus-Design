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
    project: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/api-error', () => ({
  handleApiError: (error: unknown) => ({
    json: () => ({ success: false, error: String(error) }),
    status: 500,
  }),
}))

import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/db'

function createMockRequest(body?: unknown, method = 'GET') {
  return {
    method,
    json: body ? vi.fn().mockResolvedValue(body) : undefined,
    url: 'http://localhost:3000/api/projects',
  } as any
}

describe('Projects API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const { GET } = await import('../route')
      const response = await GET()
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('未授权')
    })

    it('returns projects list for authenticated user', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any)

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      } as any)

      vi.mocked(prisma.project.findMany).mockResolvedValue([
        { id: 'proj-1', name: 'Test Project' },
      ] as any)

      const { GET } = await import('../route')
      const response = await GET()
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
    })
  })

  describe('POST', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const { POST } = await import('../route')
      const response = await POST(createMockRequest({ name: 'Test' }, 'POST'))
      const data = await response.json()

      expect(data.success).toBe(false)
    })

    it('creates a new project with valid data', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any)

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      } as any)

      vi.mocked(prisma.project.create).mockResolvedValue({
        id: 'proj-new',
        name: 'New Project',
      } as any)

      const { POST } = await import('../route')
      const request = createMockRequest({ name: 'New Project' }, 'POST')
      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(prisma.project.create).toHaveBeenCalled()
    })
  })
})
