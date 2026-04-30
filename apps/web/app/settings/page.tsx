'use client'

import { useRouter } from 'next/navigation'
import { signOut,useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import { Navbar } from '@/components/shared/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUIStore } from '@/stores/ui'

export default function UserSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useUIStore()

  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [status, session, router])

  const handleSaveProfile = async () => {
    if (name.trim().length < 2) {
      showToast('姓名至少需要 2 个字符', 'warning')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      if (response.ok) {
        showToast('个人资料已更新', 'success')
      } else {
        showToast('更新失败', 'error')
      }
    } catch {
      showToast('网络连接失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      showToast('新密码至少需要 6 个字符', 'warning')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('两次输入的密码不一致', 'warning')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      if (response.ok) {
        showToast('密码已更新', 'success')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const data = await response.json()
        showToast(data.error || '密码更新失败', 'error')
      }
    } catch {
      showToast('网络连接失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-card to-dark">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-200">用户设置</h1>
          <p className="text-sm text-gray-500 mt-1">管理您的个人资料和账户安全</p>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">个人资料</CardTitle>
              <CardDescription>更新您的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-200">{session.user?.name || '用户'}</div>
                  <div className="text-xs text-gray-500">{session.user?.email}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">邮箱</label>
                <input
                  type="email"
                  value={session.user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-600 mt-1">邮箱不可修改</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">姓名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-gray-200"
                />
              </div>

              <Button onClick={handleSaveProfile} loading={saving}>
                保存资料
              </Button>
            </CardContent>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">修改密码</CardTitle>
              <CardDescription>更新您的登录密码</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">当前密码</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">确认新密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-gray-200"
                />
              </div>
              <Button onClick={handleChangePassword} loading={saving}>
                更新密码
              </Button>
            </CardContent>
          </Card>

          {/* Account actions */}
          <Card className="border-red-900/50">
            <CardHeader>
              <CardTitle className="text-lg text-red-400">账户操作</CardTitle>
              <CardDescription>敏感操作请谨慎</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                退出登录
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
