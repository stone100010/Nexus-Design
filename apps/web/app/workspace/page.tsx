'use client'

import { useSession, SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: '工作区 | Nexus Design',
  description: '您的设计工作区',
}

function WorkspaceContent() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">正在加载...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex h-screen items-center justify-center bg-dark">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">需要登录</h2>
          <p className="text-muted mb-6">请先登录以访问工作区</p>
          <Button onClick={() => window.location.href = '/auth/login'}>
            前往登录
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-card to-dark p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              设计工作区
            </h1>
            <p className="text-muted mt-2">开始创建您的设计项目</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">导入项目</Button>
            <Button>新建项目</Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>🚀 快速开始</CardTitle>
              <CardDescription>使用 AI 生成界面</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted mb-4">
                输入描述，AI 帮您生成设计
              </p>
              <Button className="w-full" variant="primary">立即尝试</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>🎨 模板库</CardTitle>
              <CardDescription>从模板开始</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted mb-4">
                浏览专业设计模板
              </p>
              <Button className="w-full" variant="secondary">浏览模板</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>👥 团队协作</CardTitle>
              <CardDescription>邀请成员协作</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted mb-4">
                实时多人编辑设计
              </p>
              <Button className="w-full" variant="outline">邀请成员</Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>最近项目</CardTitle>
            <CardDescription>您最近编辑的设计项目</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted">
              <p>暂无项目</p>
              <p className="text-sm mt-2">创建您的第一个设计项目</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function WorkspacePage() {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange={false}
      >
        <WorkspaceContent />
      </ThemeProvider>
    </SessionProvider>
  )
}
