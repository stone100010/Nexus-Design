/* eslint-disable @typescript-eslint/no-explicit-any */
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
      findUnique: vi.fn(),
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

    it('saves multi-page data when creating a project', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any)

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      } as any)

      vi.mocked(prisma.project.create).mockResolvedValue({
        id: 'proj-multi',
        name: 'Multi Page',
      } as any)

      const data = {
        pages: [
          { id: 'p1', name: '首页', canvas: { width: 375, height: 812 }, elements: [] },
          { id: 'p2', name: '详情', canvas: { width: 375, height: 812 }, elements: [] },
        ],
        activePageId: 'p1',
        canvas: { width: 375, height: 812, zoom: 1, x: 0, y: 0 },
      }

      const { POST } = await import('../route')
      const response = await POST(createMockRequest({ name: 'Multi Page', data }, 'POST'))
      const result = await response.json()

      expect(result.success).toBe(true)
      expect(prisma.project.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          data,
          ownerId: 'user-1',
        }),
      }))
    })

    it('updates an owned project with multi-page data', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any)

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      } as any)

      vi.mocked(prisma.project.findUnique).mockResolvedValue({
        id: 'proj-1',
        ownerId: 'user-1',
        members: [],
      } as any)

      vi.mocked(prisma.project.update).mockResolvedValue({
        id: 'proj-1',
        name: 'Updated',
      } as any)

      const data = {
        pages: [{ id: 'p1', name: '首页', canvas: { width: 375, height: 812 }, elements: [] }],
        activePageId: 'p1',
      }

      const { POST } = await import('../route')
      const response = await POST(createMockRequest({ id: 'proj-1', name: 'Updated', data }, 'POST'))
      const result = await response.json()

      expect(result.success).toBe(true)
      expect(prisma.project.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'proj-1' },
        data: expect.objectContaining({ data }),
      }))
    })

    it('forbids updating a project without ownership or membership', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any)

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      } as any)

      vi.mocked(prisma.project.findUnique).mockResolvedValue({
        id: 'proj-other',
        ownerId: 'user-2',
        members: [],
      } as any)

      const { POST } = await import('../route')
      const response = await POST(createMockRequest({ id: 'proj-other', name: 'Forbidden' }, 'POST'))
      const result = await response.json()

      expect(response.status).toBe(403)
      expect(result.success).toBe(false)
      expect(prisma.project.update).not.toHaveBeenCalled()
      expect(prisma.project.create).not.toHaveBeenCalled()
    })

    it('creates a new project when the provided id no longer exists', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any)

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      } as any)

      vi.mocked(prisma.project.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.project.create).mockResolvedValue({
        id: 'proj-recreated',
        name: 'Recreated',
      } as any)

      const { POST } = await import('../route')
      const response = await POST(createMockRequest({ id: 'deleted-project', name: 'Recreated' }, 'POST'))
      const result = await response.json()

      expect(result.success).toBe(true)
      expect(prisma.project.update).not.toHaveBeenCalled()
      expect(prisma.project.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ ownerId: 'user-1' }),
      }))
    })
  })
})
