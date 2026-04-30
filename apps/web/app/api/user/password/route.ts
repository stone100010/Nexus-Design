import { compare,hash } from 'bcryptjs'
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
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: '请提供当前密码和新密码' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: '新密码至少需要 6 个字符' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: '用户不存在或未设置密码' },
        { status: 404 }
      )
    }

    // Verify current password
    const isValid = await compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: '当前密码错误' },
        { status: 400 }
      )
    }

    // Hash new password and update
    const hashedPassword = await hash(newPassword, 12)

    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      message: '密码已更新'
    })
  } catch (error) {
    return handleApiError(error)
  }
}
