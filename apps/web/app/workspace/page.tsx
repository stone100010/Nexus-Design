'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'

import { Navbar } from '@/components/shared/navbar'
import { Sidebar } from '@/components/shared/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'
import { DesignPage, EditorElement, EditorState } from '@/types'

interface Project {
  id: string
  name: string
  description: string | null
  data: unknown
  updatedAt: string
  owner: { id: string; name: string | null; email: string }
  _count: { versions: number; comments: number }
}

function getProjectStats(data: unknown) {
  if (!data || typeof data !== 'object') {
    return { pageCount: 0, elementCount: 0 }
  }

  const projectData = data as { pages?: DesignPage[]; elements?: EditorElement[] }
  if (Array.isArray(projectData.pages)) {
    return {
      pageCount: projectData.pages.length,
      elementCount: projectData.pages.reduce((sum, page) => sum + (page.elements?.length ?? 0), 0),
    }
  }

  if (Array.isArray(projectData.elements)) {
    return { pageCount: 1, elementCount: projectData.elements.length }
  }

  return { pageCount: 0, elementCount: 0 }
}

function WorkspaceContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useUIStore()
  const { importState } = useEditorStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'updatedAt' | 'name'>('updatedAt')
  const [onboardingStep, setOnboardingStep] = useState<number | null>(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('onboarding_done')) return 0
    return null
  })

  const filteredProjects = useMemo(() => {
    let result = [...projects]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    }
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
    return result
  }, [projects, searchQuery, sortBy])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const result = await response.json()
      if (result.success) {
        setProjects(result.data)
      }
    } catch {
      showToast('加载项目列表失败', 'error')
    } finally {
      setLoadingProjects(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProjects()
    }
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  const openProject = (project: Project) => {
    if (project.data && typeof project.data === 'object') {
      const data = project.data as Record<string, unknown>

      // 支持多页格式和旧单页格式
      if (Array.isArray(data.pages)) {
        importState({
          pages: data.pages as DesignPage[],
          activePageId: data.activePageId as string || '',
          canvas: data.canvas as EditorState['canvas'],
        })
      } else {
        importState({
          elements: (data.elements as EditorElement[]) || [],
          canvas: data.canvas as EditorState['canvas'],
        })
      }

      localStorage.setItem('currentProjectId', project.id)
    }
    router.push('/design/editor')
  }

  const loadExampleProject = () => {
    importState({
      elements: [
        { id: 'ex-1', type: 'container', x: 0, y: 0, width: 375, height: 56, styles: { background: '#111827', borderBottom: '1px solid #374151', display: 'flex', alignItems: 'center', padding: '0 16px' }, props: {} },
        { id: 'ex-2', type: 'text', x: 16, y: 16, width: 120, height: 24, styles: { color: '#ffffff', fontSize: '18px', fontWeight: '600' }, props: { text: '示例应用' } },
        { id: 'ex-3', type: 'container', x: 16, y: 72, width: 343, height: 120, styles: { background: '#1f2937', borderRadius: '12px', padding: '16px', border: '1px solid #374151' }, props: {} },
        { id: 'ex-4', type: 'text', x: 32, y: 88, width: 200, height: 20, styles: { color: '#9ca3af', fontSize: '14px' }, props: { text: '总资产' } },
        { id: 'ex-5', type: 'text', x: 32, y: 116, width: 200, height: 32, styles: { color: '#ffffff', fontSize: '28px', fontWeight: '700' }, props: { text: '¥166,880.00' } },
        { id: 'ex-6', type: 'button', x: 16, y: 208, width: 160, height: 48, styles: { background: '#6366f1', color: '#ffffff', borderRadius: '12px', fontSize: '15px', fontWeight: '500' }, props: { text: '转账' } },
        { id: 'ex-7', type: 'button', x: 192, y: 208, width: 160, height: 48, styles: { background: '#1f2937', color: '#ffffff', borderRadius: '12px', fontSize: '15px', border: '1px solid #374151' }, props: { text: '收款' } },
      ],
      canvas: { width: 375, height: 812, zoom: 1, x: 0, y: 0 },
    })
    router.push('/design/editor')
    showToast('已加载示例项目', 'success')
  }

  const deleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    if (!confirm('确定要删除这个项目吗？')) return

    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId))
        showToast('项目已删除', 'success')
      } else {
        showToast('删除失败', 'error')
      }
    } catch {
      showToast('删除失败', 'error')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins} 分钟前`
    if (diffHours < 24) return `${diffHours} 小时前`
    if (diffDays < 7) return `${diffDays} 天前`
    return date.toLocaleDateString('zh-CN')
  }

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
          <Button onClick={() => router.push('/auth/login')}>
            前往登录
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-card to-dark">
      <Navbar />

      {/* 新手引导 */}
      {onboardingStep !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 border border-gray-700">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">
                {onboardingStep === 0 ? '👋' : onboardingStep === 1 ? '🎨' : '🚀'}
              </div>
              <h2 className="text-xl font-bold text-gray-200">
                {onboardingStep === 0 ? '欢迎使用 Nexus Design！' : onboardingStep === 1 ? 'AI 驱动设计' : '开始创作'}
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                {onboardingStep === 0
                  ? '这是一个 AI 驱动的设计即代码平台，让我们快速了解核心功能。'
                  : onboardingStep === 1
                  ? '输入自然语言描述，AI 会自动生成界面设计。支持多种设备尺寸和设计风格。'
                  : '在编辑器中可以拖拽组件、编辑属性、导出代码。Ctrl+S 保存，Ctrl+Z 撤销。'}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 mb-6">
              {[0, 1, 2].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full ${
                    step === onboardingStep ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  localStorage.setItem('onboarding_done', 'true')
                  setOnboardingStep(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
              >
                跳过
              </button>
              <button
                onClick={() => {
                  if (onboardingStep < 2) {
                    setOnboardingStep(onboardingStep + 1)
                  } else {
                    localStorage.setItem('onboarding_done', 'true')
                    setOnboardingStep(null)
                  }
                }}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white transition-colors"
              >
                {onboardingStep < 2 ? '下一步' : '开始使用'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        <Sidebar />
        <div className="flex-1 max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              设计工作区
            </h1>
            <p className="text-muted mt-2">
              {session?.user?.name ? `欢迎回来，${session.user.name}` : '开始创建您的设计项目'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">导入项目</Button>
            <Button onClick={() => router.push('/design/ai')}>新建项目</Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer hover:border-purple-500/30"
            onClick={() => router.push('/design/ai')}
          >
            <CardHeader>
              <CardTitle>快速开始</CardTitle>
              <CardDescription>使用 AI 生成界面</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted mb-4">
                输入描述，AI 帮您生成设计
              </p>
              <Button className="w-full" variant="primary">立即尝试</Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-500/30"
            onClick={() => router.push('/design/editor')}
          >
            <CardHeader>
              <CardTitle>空白画布</CardTitle>
              <CardDescription>从零开始设计</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted mb-4">
                使用可视化编辑器自由创作
              </p>
              <Button className="w-full" variant="secondary">打开编辑器</Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer hover:border-green-500/30"
            onClick={loadExampleProject}
          >
            <CardHeader>
              <CardTitle>示例项目</CardTitle>
              <CardDescription>加载演示数据</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted mb-4">
                加载金融 App 示例设计
              </p>
              <Button className="w-full" variant="outline">加载示例</Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>最近项目</CardTitle>
                <CardDescription>您最近编辑的设计项目</CardDescription>
              </div>
              {projects.length > 0 && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="搜索项目..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:border-primary text-gray-200 w-40"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'updatedAt' | 'name')}
                    className="px-2 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded-md focus:outline-none text-gray-200"
                  >
                    <option value="updatedAt">按时间</option>
                    <option value="name">按名称</option>
                  </select>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted text-sm">加载中...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📂</div>
                <p className="text-muted font-medium">暂无项目</p>
                <p className="text-sm text-gray-500 mt-2 mb-6">创建您的第一个设计项目</p>
                <Button onClick={() => router.push('/design/ai')}>
                  创建第一个项目
                </Button>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted text-sm">未找到匹配的项目</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => {
                  const stats = getProjectStats(project.data)

                  return (
                    <div
                      key={project.id}
                      onClick={() => openProject(project)}
                      className="group p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-primary/30 cursor-pointer transition-all"
                    >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-200 truncate">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => deleteProject(e, project.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                        title="删除项目"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                    <div className="mb-3 flex items-center gap-2 text-[11px] text-gray-400">
                      <span className="rounded-full bg-gray-900/70 px-2 py-0.5">
                        {stats.pageCount || 1} 页
                      </span>
                      <span className="rounded-full bg-gray-900/70 px-2 py-0.5">
                        {stats.elementCount} 元素
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(project.updatedAt)}</span>
                      <span>{project._count.versions} 个版本</span>
                    </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}

export default function WorkspacePage() {
  return <WorkspaceContent />
}
