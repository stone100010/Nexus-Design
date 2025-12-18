import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 获取项目列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      )
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 获取用户的项目
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { 
            members: {
              some: { userId: user.id }
            }
          }
        ]
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { versions: true, comments: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: projects
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '获取项目失败' 
      },
      { status: 500 }
    )
  }
}

// POST - 创建或更新项目
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, name, description, data, settings } = body

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    let project

    if (id) {
      // 更新现有项目
      project = await prisma.project.update({
        where: { id },
        data: {
          name,
          description,
          data,
          settings: settings || { theme: 'dark', devices: ['iphone-14-pro'] },
          updatedAt: new Date()
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          }
        }
      })
    } else {
      // 创建新项目
      project = await prisma.project.create({
        data: {
          name: name || '未命名项目',
          description: description || '',
          data: data || {},
          settings: settings || { theme: 'dark', devices: ['iphone-14-pro'] },
          ownerId: user.id
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: project,
      message: id ? '项目已更新' : '项目已创建'
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '保存项目失败' 
      },
      { status: 500 }
    )
  }
}