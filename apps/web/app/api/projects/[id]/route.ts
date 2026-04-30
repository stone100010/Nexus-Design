import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { handleApiError } from '@/lib/api-error'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 获取单个项目
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: '项目不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: project
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE - 删除项目（软删除通过更新状态，或直接删除）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 验证项目所有权
    const project = await prisma.project.findUnique({
      where: { id: params.id }
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: '项目不存在' },
        { status: 404 }
      )
    }

    if (project.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, error: '无权删除此项目' },
        { status: 403 }
      )
    }

    // 删除项目（级联删除关联数据）
    await prisma.project.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: '项目已删除'
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH - 更新项目
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, data, settings } = body

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(data !== undefined && { data }),
        ...(settings !== undefined && { settings }),
        updatedAt: new Date()
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: project,
      message: '项目已更新'
    })
  } catch (error) {
    return handleApiError(error)
  }
}
