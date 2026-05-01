'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-gradient-to-br from-dark via-card to-dark">
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

      {/* Product Screenshots */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">产品预览</h2>
          <p className="text-muted">直观了解 Nexus Design 的核心界面</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Generation */}
          <div className="group">
            <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-800/50 hover:border-purple-500/50 transition-all">
              <div className="bg-gray-900 px-4 py-2 flex items-center space-x-2 border-b border-gray-700">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-gray-500 ml-2">AI 生成</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex space-x-2">
                  <div className="px-2 py-1 bg-purple-600 rounded text-[10px] text-white">iPhone</div>
                  <div className="px-2 py-1 bg-gray-700 rounded text-[10px] text-gray-400">iPad</div>
                  <div className="px-2 py-1 bg-gray-700 rounded text-[10px] text-gray-400">Desktop</div>
                </div>
                <div className="flex space-x-2">
                  <div className="px-2 py-1 bg-purple-600 rounded text-[10px] text-white">现代</div>
                  <div className="px-2 py-1 bg-gray-700 rounded text-[10px] text-gray-400">简约</div>
                  <div className="px-2 py-1 bg-gray-700 rounded text-[10px] text-gray-400">科技</div>
                </div>
                <div className="bg-gray-900 rounded p-3 text-[10px] text-gray-500 border border-gray-700">
                  创建一个现代化的登录页面...
                </div>
                <div className="flex items-center justify-center py-2">
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-purple-400 ml-2">AI 生成中...</span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-400 mt-3 font-medium">AI 智能生成</p>
          </div>

          {/* Visual Editor */}
          <div className="group">
            <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-800/50 hover:border-blue-500/50 transition-all">
              <div className="bg-gray-900 px-4 py-2 flex items-center space-x-2 border-b border-gray-700">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-gray-500 ml-2">可视化编辑器</span>
              </div>
              <div className="flex">
                <div className="w-10 bg-gray-800 border-r border-gray-700 p-1 space-y-1">
                  <div className="w-full h-6 bg-gray-700 rounded" />
                  <div className="w-full h-6 bg-gray-700 rounded" />
                  <div className="w-full h-6 bg-gray-700 rounded" />
                </div>
                <div className="flex-1 p-3 bg-gray-900/50 min-h-[140px] relative">
                  <div className="absolute top-3 left-3 w-20 h-8 bg-indigo-600 rounded flex items-center justify-center text-[9px] text-white">按钮</div>
                  <div className="absolute top-14 left-3 w-28 h-4 bg-gray-700 rounded" />
                  <div className="absolute top-3 right-3 w-16 h-16 bg-gray-700 rounded border border-blue-500 border-dashed" />
                </div>
                <div className="w-16 bg-gray-800 border-l border-gray-700 p-1 space-y-1">
                  <div className="w-full h-3 bg-gray-700 rounded" />
                  <div className="w-full h-3 bg-gray-700 rounded" />
                  <div className="w-3/4 h-3 bg-gray-700 rounded" />
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-400 mt-3 font-medium">可视化编辑器</p>
          </div>

          {/* Code Export */}
          <div className="group">
            <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-800/50 hover:border-green-500/50 transition-all">
              <div className="bg-gray-900 px-4 py-2 flex items-center space-x-2 border-b border-gray-700">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-gray-500 ml-2">代码导出</span>
              </div>
              <div className="p-3 bg-gray-900 font-mono text-[10px] leading-relaxed">
                <div><span className="text-purple-400">{'import'}</span> <span className="text-gray-300">{'{ Button }'}</span> <span className="text-purple-400">from</span> <span className="text-green-400">&apos;./components&apos;</span></div>
                <div className="mt-1"><span className="text-purple-400">{'export default'}</span> <span className="text-blue-400">function</span> <span className="text-yellow-400">LoginPage</span>() {'{'}</div>
                <div className="ml-3"><span className="text-purple-400">return</span> (</div>
                <div className="ml-6">{'<'}<span className="text-blue-400">div</span> <span className="text-green-400">className</span>=<span className="text-orange-400">&quot;min-h-screen&quot;</span>{'>'}</div>
                <div className="ml-9">{'<'}<span className="text-blue-400">input</span> <span className="text-green-400">type</span>=<span className="text-orange-400">&quot;email&quot;</span> /{'>'}</div>
                <div className="ml-9">{'<'}<span className="text-blue-400">Button</span>{'>'}登录{'</'}<span className="text-blue-400">Button</span>{'>'}</div>
                <div className="ml-6">{'</'}<span className="text-blue-400">div</span>{'>'}</div>
                <div className="ml-3">)</div>
                <div>{'}'}</div>
              </div>
              <div className="flex border-t border-gray-700">
                <div className="flex-1 text-center py-1.5 text-[10px] text-purple-400 border-b-2 border-purple-500 bg-gray-800/50">React</div>
                <div className="flex-1 text-center py-1.5 text-[10px] text-gray-500">Vue</div>
                <div className="flex-1 text-center py-1.5 text-[10px] text-gray-500">HTML</div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-400 mt-3 font-medium">多框架代码导出</p>
          </div>
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
              <CardDescription>当前页面</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted space-y-1">
                <li>• 完整产品介绍</li>
                <li>• 响应式设计</li>
                <li>• 三层定价方案</li>
                <li>• 客户案例展示</li>
              </ul>
              <Button className="w-full mt-4" variant="secondary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                回到顶部
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>🔐 认证系统</CardTitle>
              <CardDescription>auth</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted space-y-1">
                <li>• 登录/注册切换</li>
                <li>• 演示账号: demo</li>
                <li>• 社交登录支持</li>
                <li>• 完整表单验证</li>
              </ul>
              <Button className="w-full mt-4" variant="secondary" asChild>
                <Link href="/auth/login">查看演示</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>🎨 设计工作区</CardTitle>
              <CardDescription>workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted space-y-1">
                <li>• 6种设备预览</li>
                <li>• 拖拽式组件库</li>
                <li>• 代码生成演示</li>
                <li>• AI助手功能</li>
              </ul>
              <Button className="w-full mt-4" variant="secondary" asChild>
                <Link href="/workspace">查看演示</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">定价方案</h2>
          <p className="text-muted">选择适合您的方案</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-gray-700">
            <CardHeader>
              <CardTitle>免费版</CardTitle>
              <CardDescription>个人开发者</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">¥0<span className="text-sm font-normal text-muted">/月</span></div>
              <ul className="text-sm text-muted space-y-2">
                <li>• 每日 5 次 AI 生成</li>
                <li>• 3 个项目</li>
                <li>• 基础组件库</li>
                <li>• React 代码导出</li>
              </ul>
              <Button className="w-full mt-6" variant="secondary">开始使用</Button>
            </CardContent>
          </Card>

          <Card className="border-primary/50 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs rounded-full">推荐</div>
            <CardHeader>
              <CardTitle>专业版</CardTitle>
              <CardDescription>专业设计师</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">¥99<span className="text-sm font-normal text-muted">/月</span></div>
              <ul className="text-sm text-muted space-y-2">
                <li>• 无限 AI 生成</li>
                <li>• 无限项目</li>
                <li>• 完整组件库</li>
                <li>• 多框架代码导出</li>
                <li>• 版本管理</li>
              </ul>
              <Button className="w-full mt-6">立即订阅</Button>
            </CardContent>
          </Card>

          <Card className="border-gray-700">
            <CardHeader>
              <CardTitle>企业版</CardTitle>
              <CardDescription>团队协作</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">¥299<span className="text-sm font-normal text-muted">/月</span></div>
              <ul className="text-sm text-muted space-y-2">
                <li>• 专业版全部功能</li>
                <li>• 实时协作</li>
                <li>• 团队管理</li>
                <li>• 优先支持</li>
                <li>• 自定义部署</li>
              </ul>
              <Button className="w-full mt-6" variant="outline">联系我们</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">用户评价</h2>
          <p className="text-muted">来自设计师和开发者的真实反馈</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: '张明',
              role: '前端开发工程师',
              content: 'Nexus Design 让我从设计稿到代码的时间缩短了 80%。AI 生成的代码质量非常高，几乎可以直接用到生产环境。',
              avatar: 'Z',
            },
            {
              name: '李雪',
              role: 'UI 设计师',
              content: '终于有一个工具能让设计师和开发者的协作变得如此顺畅。实时预览和代码导出功能太棒了！',
              avatar: 'L',
            },
            {
              name: '王浩',
              role: '创业公司 CTO',
              content: '我们用 Nexus Design 在一周内完成了整个 MVP 的 UI 设计和前端开发。节省了大量的时间和人力成本。',
              avatar: 'W',
            },
          ].map((testimonial, index) => (
            <Card key={index} className="border-gray-700">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-300 mb-4">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-200">{testimonial.name}</div>
                    <div className="text-xs text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
            测试账号: next_design@openaigc.fun / demo123_secure
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">常见问题</h2>
          <p className="text-muted">快速了解 Nexus Design</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Nexus Design 是什么？',
              a: 'Nexus Design 是一个 AI 驱动的设计即代码平台，让设计师和开发者能够通过自然语言描述快速生成高质量的 UI 设计和生产级代码。'
            },
            {
              q: '支持哪些代码框架？',
              a: '目前支持 React/Next.js，计划中支持 Vue、Angular、微信小程序、iOS SwiftUI 和 Android Jetpack Compose。'
            },
            {
              q: '如何开始使用？',
              a: '注册账号后即可免费使用基础功能。在工作区点击"AI 生成"，输入设计描述，AI 会自动为您生成界面。'
            },
            {
              q: '生成的设计可以导出吗？',
              a: '可以。编辑器支持导出为 React TSX 代码，包含完整的样式和组件结构。'
            }
          ].map((item, index) => (
            <div key={index} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-200 mb-2">{item.q}</h3>
              <p className="text-sm text-gray-400">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-primary/10 mt-16">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span className="font-semibold text-gray-300">Nexus Design</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="/workspace" className="hover:text-primary transition-colors">工作区</a>
              <a href="/design/editor" className="hover:text-primary transition-colors">编辑器</a>
              <a href="/auth/login" className="hover:text-primary transition-colors">登录</a>
              <a href="/auth/register" className="hover:text-primary transition-colors">注册</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center space-x-6 text-xs text-gray-600">
              <a href="/docs/DEVELOPMENT.md" className="hover:text-gray-400 transition-colors">开发文档</a>
              <a href="/docs/DEPLOYMENT.md" className="hover:text-gray-400 transition-colors">部署指南</a>
              <a href="/docs/API.md" className="hover:text-gray-400 transition-colors">API 文档</a>
              <a href="https://github.com/stone100010/Nexus-Design" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">GitHub</a>
            </div>
          </div>
          <div className="text-center text-xs text-gray-600 mt-4">
            基于 Next.js + TypeScript + Prisma 构建
          </div>
        </div>
      </div>
    </main>
  )
}
