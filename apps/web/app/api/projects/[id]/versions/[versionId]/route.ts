import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { handleApiError } from '@/lib/api-error'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 获取版本详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
    }

    const version = await prisma.version.findFirst({
      where: {
        id: params.versionId,
        projectId: params.id,
      },
      include: {
        project: {
          select: { id: true, name: true, ownerId: true },
        },
      },
    })

    if (!version) {
      return NextResponse.json({ success: false, error: '版本不存在' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: version })
  } catch (error) {
    return handleApiError(error)
  }
}
