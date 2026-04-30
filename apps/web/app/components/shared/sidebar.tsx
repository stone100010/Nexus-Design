'use client'

import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  LayoutTemplate,
  Settings,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'

import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
}

const NAV_ITEMS = [
  { href: '/workspace', label: '项目列表', icon: FolderOpen },
  { href: '/workspace?tab=team', label: '团队', icon: Users },
  { href: '/workspace?tab=templates', label: '模板库', icon: LayoutTemplate },
  { href: '/settings', label: '设置', icon: Settings },
]

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-gray-900 border-r border-gray-800 transition-all duration-300',
        collapsed ? 'w-16' : 'w-56',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        {!collapsed && (
          <span className="text-sm font-semibold text-gray-200">导航</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-200"
          title={collapsed ? '展开' : '收起'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href.includes('?') && pathname === item.href.split('?')[0])

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all',
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800">
        {!collapsed && (
          <div className="text-[10px] text-gray-600 text-center">
            Nexus Design v1.1.0
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
