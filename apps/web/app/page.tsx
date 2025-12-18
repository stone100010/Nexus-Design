import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-dark via-card to-dark">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center p-8 pt-20">
        <div className="text-center space-y-6 max-w-4xl">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-2">
            🚀 MVP 开发阶段
          </div>
          
          <div className="space-y-3">
            <h1 className="text-6xl font-extrabold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
              Nexus Design
            </h1>
            <p className="text-2xl text-muted">
              统一设计平台 - AI驱动的设计即代码
            </p>
            <p className="text-lg text-muted/80 max-w-2xl mx-auto">
              将设计直接转化为生产级代码，支持多平台输出，实时协作，AI智能辅助
            </p>
          </div>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register">
              <Button size="lg" className="group">
                🎨 开始免费使用
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="secondary">
                🔑 登录账户
              </Button>
            </Link>
            <Link href="/workspace">
              <Button size="lg" variant="outline">
                🚀 进入工作区
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">核心功能</h2>
          <p className="text-muted">一站式设计到代码的工作流程</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-1">
            <CardHeader>
              <div className="text-4xl mb-2">🤖</div>
              <CardTitle>AI 智能生成</CardTitle>
              <CardDescription>文本描述生成完整界面</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">
                使用自然语言描述您的需求，AI 自动生成高保真设计和代码
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-1">
            <CardHeader>
              <div className="text-4xl mb-2">📱</div>
              <CardTitle>多平台输出</CardTitle>
              <CardDescription>一次设计，多端适配</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">
                React、Vue、Angular、微信小程序、iOS、Android 全支持
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-1">
            <CardHeader>
              <div className="text-4xl mb-2">👥</div>
              <CardTitle>实时协作</CardTitle>
              <CardDescription>多人同时编辑设计</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">
                WebSocket 实时同步，光标追踪，版本控制，评论系统
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-1">
            <CardHeader>
              <div className="text-4xl mb-2">🎨</div>
              <CardTitle>组件库</CardTitle>
              <CardDescription>可复用设计组件</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">
                基础组件、移动组件、AI 组件、自定义组件库管理
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-1">
            <CardHeader>
              <div className="text-4xl mb-2">⚡</div>
              <CardTitle>快速原型</CardTitle>
              <CardDescription>从想法到可运行原型</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">
                拖拽编辑，实时预览，多设备测试，一键导出
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-1">
            <CardHeader>
              <div className="text-4xl mb-2">🔧</div>
              <CardTitle>代码优化</CardTitle>
              <CardDescription>生产级代码质量</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">
                TypeScript 支持，性能优化，最佳实践，响应式设计
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Demo Showcase */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">演示参考</h2>
          <p className="text-muted">UI设计组主管提供的完整产品演示</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>📄 产品着陆页</CardTitle>
              <CardDescription>landing.html</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted space-y-1">
                <li>• 完整产品介绍</li>
                <li>• 响应式设计</li>
                <li>• 三层定价方案</li>
                <li>• 客户案例展示</li>
              </ul>
              <Button className="w-full mt-4" variant="secondary" asChild>
                <a href="/demo/landing.html" target="_blank">查看演示</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>🔐 认证系统</CardTitle>
              <CardDescription>auth.html</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted space-y-1">
                <li>• 登录/注册切换</li>
                <li>• 演示账号: demo</li>
                <li>• 社交登录支持</li>
                <li>• 完整表单验证</li>
              </ul>
              <Button className="w-full mt-4" variant="secondary" asChild>
                <a href="/demo/auth.html" target="_blank">查看演示</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>🎨 设计工作区</CardTitle>
              <CardDescription>workspace.html</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted space-y-1">
                <li>• 6种设备预览</li>
                <li>• 拖拽式组件库</li>
                <li>• 代码生成演示</li>
                <li>• AI助手功能</li>
              </ul>
              <Button className="w-full mt-4" variant="secondary" asChild>
                <a href="/demo/workspace.html" target="_blank">查看演示</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-8 py-16 text-center">
        <div className="p-12 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
          <h2 className="text-3xl font-bold mb-4">准备好开始了吗？</h2>
          <p className="text-lg text-muted mb-6">
            立即注册，体验 AI 驱动的设计即代码革命
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="shadow-lg shadow-primary/25">
                🚀 立即免费开始
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="secondary">
                🔑 我已有账户
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted/60 mt-4">
            演示账号: demo@nexusdesign.app / NexusDesign123
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-primary/10 mt-16">
        <div className="max-w-6xl mx-auto px-8 py-8 text-center text-sm text-muted">
          <p>Nexus Design © 2025 - 统一设计平台</p>
          <p className="mt-2">基于 Next.js 16.0.10 + TypeScript 5.3.3 构建</p>
        </div>
      </div>
    </main>
  )
}
