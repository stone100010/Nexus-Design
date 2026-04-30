import { AlertTriangle, CheckCircle, Database, Terminal } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: '数据库配置 | Nexus Design',
  description: '数据库连接和迁移配置',
}

export default function AdminSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-card to-dark p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            数据库配置向导
          </h1>
          <p className="text-muted">配置和初始化您的数据库</p>
        </div>

        {/* Step 1: Environment */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              <CardTitle>步骤 1: 配置环境变量</CardTitle>
            </div>
            <CardDescription>设置数据库连接字符串</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-dark/50 p-4 rounded-lg border border-primary/10 font-mono text-sm">
              <p className="text-muted">apps/web/.env.local</p>
              <p className="mt-2">DATABASE_URL=&quot;postgresql://postgres:postgres@localhost:5432/nexusdesign_dev&quot;</p>
              <p>NEXTAUTH_SECRET=&quot;your-secret-key&quot;</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/">返回首页</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Database */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <Database className="w-5 h-5 text-green-400" />
              </div>
              <CardTitle>步骤 2: 启动 PostgreSQL</CardTitle>
            </div>
            <CardDescription>使用 Docker 快速启动</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-dark/50 p-4 rounded-lg border border-primary/10 font-mono text-sm">
              <p className="text-muted mb-2"># Docker 方式 (推荐)</p>
              <p>docker run --name nexus-db \</p>
              <p className="ml-4">-e POSTGRES_PASSWORD=postgres \</p>
              <p className="ml-4">-e POSTGRES_DB=nexusdesign_dev \</p>
              <p className="ml-4">-p 5432:5432 \</p>
              <p className="ml-4">-d postgres:15</p>
            </div>
            <div className="bg-dark/50 p-4 rounded-lg border border-primary/10 font-mono text-sm">
              <p className="text-muted mb-2"># 或使用已有数据库</p>
              <p>createdb nexusdesign_dev</p>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Generate & Migrate */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Terminal className="w-5 h-5 text-purple-400" />
              </div>
              <CardTitle>步骤 3: 生成和迁移</CardTitle>
            </div>
            <CardDescription>运行 Prisma 命令</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-dark/50 p-4 rounded-lg border border-primary/10 font-mono text-sm">
              <p className="text-muted mb-2"># 在项目根目录运行</p>
              <p>cd /home/workspace/nexus-design</p>
              <p className="mt-2"># 生成客户端</p>
              <p>npx prisma generate --schema=./prisma/schema.prisma</p>
              <p className="mt-2"># 创建并应用迁移</p>
              <p>cd apps/web</p>
              <p>npm run db:migrate</p>
              <p className="mt-2"># 填充种子数据</p>
              <p>npm run db:seed</p>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Test */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-yellow-500/20 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <CardTitle>步骤 4: 测试连接</CardTitle>
            </div>
            <CardDescription>验证数据库是否正常工作</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-dark/50 p-4 rounded-lg border border-primary/10 font-mono text-sm">
              <p className="text-muted mb-2"># 验证命令</p>
              <p>cd apps/web</p>
              <p>npm run type-check</p>
              <p>npx prisma validate --schema=../prisma/schema.prisma</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/auth/login">测试登录页面</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/workspace">测试工作区</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Commands */}
        <Card className="border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-yellow-400">⚡ 一键执行命令</CardTitle>
            <CardDescription>复制到终端运行</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-dark/80 p-4 rounded-lg border border-yellow-500/20 font-mono text-sm">
              <p className="text-yellow-400 mb-2"># 完整设置流程</p>
              <p>cd /home/workspace/nexus-design</p>
              <p>cd apps/web</p>
              <p>npm run db:generate</p>
              <p>npm run db:migrate</p>
              <p>npm run db:seed</p>
              <p className="mt-2 text-muted"># 如果需要重置</p>
              <p>npm run db:reset</p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>🎯 演示账号信息</CardTitle>
            <CardDescription>种子数据创建的账号</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark/50 p-4 rounded-lg border border-primary/20">
                <p className="font-bold text-primary">测试用户</p>
                <p className="text-sm text-muted mt-1">邮箱: next_design@openaigc.fun</p>
                <p className="text-sm text-muted">密码: demo123_secure</p>
                <p className="text-xs text-muted mt-2">权限: 普通用户</p>
              </div>
              <div className="bg-dark/50 p-4 rounded-lg border border-primary/20">
                <p className="font-bold text-accent">管理员</p>
                <p className="text-sm text-muted mt-1">邮箱: admin@openaigc.fun</p>
                <p className="text-sm text-muted">密码: admin123_secure</p>
                <p className="text-xs text-muted mt-2">权限: 管理员</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-400 mb-1">重要提示</p>
            <p className="text-sm text-red-200/80">
              在配置数据库之前，请确保 PostgreSQL 正在运行，并且 .env.local 文件中的 DATABASE_URL 配置正确。
              如果使用 Docker，确保容器已启动且端口 5432 可用。
            </p>
          </div>
        </div>

        <div className="text-center pt-4">
          <p className="text-sm text-muted">
            配置完成后，访问 <Link href="/" className="text-primary hover:underline">首页</Link> 或 
            <Link href="/auth/login" className="text-primary hover:underline ml-1">登录</Link> 开始使用
          </p>
        </div>
      </div>
    </div>
  )
}
