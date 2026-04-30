import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { handleApiError } from '@/lib/api-error'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 获取项目版本列表
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
    }

    const versions = await prisma.version.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({ success: true, data: versions })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST - 保存新版本
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 })
    }

    const body = await request.json()
    const { name, data, changes } = body

    // Get current max version number
    const latestVersion = await prisma.version.findFirst({
      where: { projectId: params.id },
      orderBy: { version: 'desc' }
    })

    const versionNum = (latestVersion?.version || 0) + 1

    const version = await prisma.version.create({
      data: {
        projectId: params.id,
        version: versionNum,
        name: name || `v${versionNum}`,
        data: data || {},
        changes: changes || {},
        createdBy: user.id
      }
    })

    return NextResponse.json({
      success: true,
      data: version,
      message: `版本 v${versionNum} 已保存`
    })
  } catch (error) {
    return handleApiError(error)
  }
}
