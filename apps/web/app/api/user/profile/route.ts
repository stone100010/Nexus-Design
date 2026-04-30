import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { handleApiError } from '@/lib/api-error'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: '姓名至少需要 2 个字符' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { name: name.trim() },
      select: { id: true, name: true, email: true }
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: '个人资料已更新'
    })
  } catch (error) {
    return handleApiError(error)
  }
}
