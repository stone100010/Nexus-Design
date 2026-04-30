'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import { Navbar } from '@/components/shared/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'

export default function ProjectSettingsPage() {
  const { status } = useSession()
  const router = useRouter()
  const { showToast } = useUIStore()
  const { canvas, setCanvasSize } = useEditorStore()

  const [projectName, setProjectName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  const handleSave = async () => {
    setSaving(true)
    try {
      const projectId = localStorage.getItem('currentProjectId')
      if (projectId) {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: projectName || undefined,
            description: projectDesc || undefined,
            settings: {
              canvasWidth: canvas.width,
              canvasHeight: canvas.height,
            }
          })
        })

        if (response.ok) {
          showToast('项目设置已保存', 'success')
        } else {
          showToast('保存失败', 'error')
        }
      } else {
        showToast('请先创建或打开一个项目', 'warning')
      }
    } catch {
      showToast('保存失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  const presetSizes = [
    { label: 'iPhone 14 Pro', w: 393, h: 852 },
    { label: 'iPhone 14', w: 390, h: 844 },
    { label: 'iPad', w: 768, h: 1024 },
    { label: 'iPad Pro', w: 1024, h: 1366 },
    { label: 'Desktop HD', w: 1920, h: 1080 },
    { label: 'MacBook Pro 14"', w: 1512, h: 982 },
  ]

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-card to-dark">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-200">项目设置</h1>
          <p className="text-sm text-gray-500 mt-1">配置项目名称、画布尺寸等</p>
        </div>

        <div className="space-y-6">
          {/* Project info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">项目信息</CardTitle>
              <CardDescription>设置项目名称和描述</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">项目名称</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="我的设计项目"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">项目描述</label>
                <textarea
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="项目描述（可选）"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-gray-200 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Canvas size */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">画布尺寸</CardTitle>
              <CardDescription>选择设备预设或自定义尺寸</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {presetSizes.map((preset) => {
                  const isActive = canvas.width === preset.w && canvas.height === preset.h
                  return (
                    <button
                      key={preset.label}
                      onClick={() => setCanvasSize({ width: preset.w, height: preset.h })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isActive
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-sm font-medium">{preset.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{preset.w} × {preset.h}</div>
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center space-x-4 pt-2 border-t border-gray-700">
                <div>
                  <label className="text-xs text-gray-500">宽度</label>
                  <input
                    type="number"
                    value={canvas.width}
                    onChange={(e) => setCanvasSize({ width: Number(e.target.value), height: canvas.height })}
                    className="w-24 px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-primary text-gray-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">高度</label>
                  <input
                    type="number"
                    value={canvas.height}
                    onChange={(e) => setCanvasSize({ width: canvas.width, height: Number(e.target.value) })}
                    className="w-24 px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-primary text-gray-200 font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-red-900/50">
            <CardHeader>
              <CardTitle className="text-lg text-red-400">危险操作</CardTitle>
              <CardDescription>这些操作不可恢复</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('确定要清空画布吗？此操作不可恢复。')) {
                    useEditorStore.getState().clearCanvas()
                    showToast('画布已清空', 'info')
                  }
                }}
              >
                清空画布
              </Button>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => router.back()}>
              返回
            </Button>
            <Button onClick={handleSave} loading={saving}>
              保存设置
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
