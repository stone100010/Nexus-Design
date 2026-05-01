'use client'

import { AnimatePresence,motion } from 'framer-motion'
import { 
  ChevronRight,
  Clock,
  Code2,
  FolderOpen,
  LayoutTemplate, 
  Loader2,
  Palette,
  Plus, 
  Search, 
  Sparkles, 
  Trash2,
  X} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Navbar } from '@/components/shared/navbar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'
import { DesignPage, EditorElement } from '@/types'

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

// 生成项目缩略图的简化版本
function ProjectThumbnail({ data }: { data: unknown }) {
  const pages = data && typeof data === 'object' ? (data as { pages?: DesignPage[] }).pages : null
  const firstPage = pages?.[0]
  
  if (!firstPage || !firstPage.elements?.length) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
        <LayoutTemplate className="w-8 h-8 text-gray-600" />
      </div>
    )
  }

  const scale = 280 / (firstPage.canvas?.width || 375)
  
  return (
    <div className="w-full h-full overflow-hidden bg-[#0f0c29] relative">
      {firstPage.elements.slice(0, 12).map((el, i) => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: el.x * scale,
            top: el.y * scale,
            width: el.width * scale,
            height: el.height * scale,
            background: (el.styles?.background as string) || '#374151',
            opacity: 0.9,
          }}
        >
          {el.type === 'text' && (
            <div className="w-full h-full flex items-center overflow-hidden">
              <span 
                className="text-[6px] truncate px-0.5"
                style={{ color: (el.styles?.color as string) || '#fff' }}
              >
                {String(el.props?.text || '').slice(0, 15)}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// 快速操作卡片组件
function QuickActionCard({ 
  icon: Icon, 
  title, 
  description, 
  gradient,
  onClick,
  delay = 0
}: { 
  icon: React.ElementType
  title: string
  description: string
  gradient: string
  onClick: () => void
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      {/* 背景发光效果 */}
      <div className={cn(
        "absolute -inset-0.5 rounded-2xl opacity-0 blur-xl transition-opacity duration-300",
        "group-hover:opacity-60",
        gradient
      )} />
      
      {/* 卡片内容 */}
      <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 transition-all duration-300 group-hover:border-gray-600/50 overflow-hidden">
        {/* 背景装饰 */}
        <div className={cn(
          "absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl",
          gradient
        )} />
        
        <div className="relative">
          {/* 图标 */}
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
            "bg-gradient-to-br",
            gradient
          )}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          
          {/* 标题和描述 */}
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
          
          {/* 箭头 */}
          <div className="flex items-center gap-1 mt-4 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
            <span>开始创建</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// 项目卡片组件
function ProjectCard({ 
  project, 
  onClick, 
  onDelete,
  index 
}: { 
  project: Project
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
  index: number
}) {
  const stats = getProjectStats(project.data)
  
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      {/* 卡片 */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden transition-all duration-300 group-hover:border-purple-500/30 group-hover:shadow-lg group-hover:shadow-purple-500/10">
        {/* 缩略图 */}
        <div className="aspect-[4/3] relative overflow-hidden">
          <ProjectThumbnail data={project.data} />
          
          {/* 悬浮操作 */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] rounded-full font-medium">
                  {stats.pageCount || 1} 页
                </span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] rounded-full font-medium">
                  {stats.elementCount} 元素
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 信息 */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-xs text-gray-500 truncate mt-1">
                  {project.description}
                </p>
              )}
            </div>
            
            {/* 删除按钮 */}
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* 底部信息 */}
          <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(project.updatedAt)}</span>
            </div>
            <span>·</span>
            <span>{project._count.versions} 版本</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// 新手引导组件
function OnboardingModal({ 
  step, 
  onNext, 
  onSkip 
}: { 
  step: number
  onNext: () => void
  onSkip: () => void
}) {
  const steps = [
    {
      icon: Sparkles,
      title: '欢迎使用 Nexus Design',
      description: 'AI 驱动的设计即代码平台，让创意瞬间变为现实',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Palette,
      title: '智能设计生成',
      description: '用自然语言描述你的想法，AI 自动生成精美界面和多页应用',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Code2,
      title: '生产级代码导出',
      description: '支持 React、Vue、HTML 多框架导出，直接用于生产环境',
      gradient: 'from-green-500 to-emerald-500'
    }
  ]

  const current = steps[step]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        {/* 关闭按钮 */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 进度条 */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === step ? "w-8 bg-gradient-to-r from-purple-500 to-pink-500" : "w-2 bg-gray-700"
              )}
            />
          ))}
        </div>

        {/* 内容 */}
        <div className="text-center">
          <div className={cn(
            "w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center",
            "bg-gradient-to-br",
            current.gradient
          )}>
            <current.icon className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">{current.title}</h2>
          <p className="text-gray-400 leading-relaxed">{current.description}</p>
        </div>

        {/* 按钮 */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onSkip}
            className="flex-1 px-5 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors"
          >
            跳过
          </button>
          <button
            onClick={onNext}
            className={cn(
              "flex-1 px-5 py-3 rounded-xl font-medium transition-all",
              "bg-gradient-to-r from-purple-500 to-pink-500",
              "hover:shadow-lg hover:shadow-purple-500/25",
              "text-white"
            )}
          >
            {step < steps.length - 1 ? '下一步' : '开始使用'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// 空状态组件
function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20"
    >
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6">
        <FolderOpen className="w-12 h-12 text-purple-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">暂无项目</h3>
      <p className="text-gray-400 mb-8">创建你的第一个设计项目，开始创意之旅</p>
      <Button
        onClick={onCreateNew}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25"
      >
        <Plus className="w-4 h-4 mr-2" />
        创建第一个项目
      </Button>
    </motion.div>
  )
}

function WorkspaceContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useUIStore()
  const { importState } = useEditorStore()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'updatedAt' | 'name'>('updatedAt')
  const [showOnboarding, setShowOnboarding] = useState<number | null>(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('onboarding_done')) return 0
    return null
  })

  const filteredProjects = useMemo(() => {
    let result = [...projects]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q)
      )
    }
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
    return result
  }, [projects, searchQuery, sortBy])

    const fetchProjects = useCallback(async () => {

      try {

        const response = await fetch('/api/projects')

        const result = await response.json()

        if (result.success) {

          setProjects(result.data)

        }

      } catch {

        showToast('加载项目列表失败', 'error')

      } finally {

        setLoading(false)

      }

    }, [showToast])

  

  

    useEffect(() => {

      if (status === 'authenticated') {

        fetchProjects()

      }

    }, [status, fetchProjects])

  const openProject = (project: Project) => {
    // 直接跳转带项目 ID，让编辑器从数据库加载完整数据
    router.push(`/design/editor?id=${project.id}`)
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
      }
    } catch {
      showToast('删除失败', 'error')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">正在加载...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login?redirect=/workspace')
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]" />
      </div>

      <Navbar />

      {/* 主内容 */}
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* 头部 */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent mb-2">
                工作区
              </h1>
              <p className="text-gray-400">
                {session?.user?.name ? `欢迎回来，${session.user.name}` : '管理你的设计项目'}
              </p>
            </div>
            <Button
              onClick={() => router.push('/design/editor')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              新建项目
            </Button>
          </div>
        </motion.header>

        {/* 快速操作 */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickActionCard
              icon={Sparkles}
              title="AI 智能生成"
              description="用自然语言描述你的想法，AI 自动生成完整的多页应用界面"
              gradient="from-purple-500 to-pink-500"
              onClick={() => router.push('/design/editor')}
              delay={0.1}
            />
            <QuickActionCard
              icon={LayoutTemplate}
              title="空白画布"
              description="从零开始创作，使用可视化编辑器自由设计你的创意"
              gradient="from-blue-500 to-cyan-500"
              onClick={() => router.push('/design/editor')}
              delay={0.2}
            />
            <QuickActionCard
              icon={FolderOpen}
              title="示例项目"
              description="加载金融 App 示例，快速了解编辑器的强大功能"
              gradient="from-green-500 to-emerald-500"
              onClick={loadExampleProject}
              delay={0.3}
            />
          </div>
        </section>

        {/* 项目列表 */}
        <section>
          {/* 工具栏 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              最近项目
              {projects.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({projects.length})
                </span>
              )}
            </h2>
            
            {projects.length > 0 && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* 搜索框 */}
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="搜索项目..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                
                {/* 排序 */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'updatedAt' | 'name')}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
                >
                  <option value="updatedAt">按时间</option>
                  <option value="name">按名称</option>
                </select>
              </div>
            )}
          </div>

          {/* 项目网格 */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-gray-800/50 rounded-xl mb-3" />
                  <div className="h-4 bg-gray-800/50 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-800/50 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState onCreateNew={() => router.push('/design/editor')} />
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">未找到匹配的项目</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence>
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    onClick={() => openProject(project)}
                    onDelete={(e) => deleteProject(e, project.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>

      {/* 新手引导 */}
      <AnimatePresence>
        {showOnboarding !== null && (
          <OnboardingModal
            step={showOnboarding}
            onNext={() => {
              if (showOnboarding < 2) {
                setShowOnboarding(showOnboarding + 1)
              } else {
                localStorage.setItem('onboarding_done', 'true')
                setShowOnboarding(null)
              }
            }}
            onSkip={() => {
              localStorage.setItem('onboarding_done', 'true')
              setShowOnboarding(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function WorkspacePage() {
  return <WorkspaceContent />
}