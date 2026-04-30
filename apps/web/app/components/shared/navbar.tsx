'use client'

import { usePathname,useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

interface NavbarProps {
  className?: string
}

export function Navbar({ className }: NavbarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  const navLinks = [
    { label: '工作区', path: '/workspace' },
    { label: 'AI 生成', path: '/design/ai' },
    { label: '编辑器', path: '/design/editor' },
  ]

  return (
    <nav className={cn(
      'h-14 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 flex items-center px-4 z-50',
      className
    )}>
      {/* Logo */}
      <button
        onClick={() => router.push('/workspace')}
        className="flex items-center space-x-2 mr-8"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <span className="text-white text-sm font-bold">N</span>
        </div>
        <span className="text-sm font-semibold text-gray-200 hidden sm:inline">
          Nexus Design
        </span>
      </button>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-1 flex-1">
        {navLinks.map((link) => (
          <button
            key={link.path}
            onClick={() => router.push(link.path)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm transition-colors',
              isActive(link.path)
                ? 'bg-primary/10 text-primary'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
            )}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* User Menu */}
      {session?.user && (
        <div className="relative ml-auto">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-gray-700/50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm text-gray-300 hidden sm:inline max-w-[120px] truncate">
              {session.user.name || session.user.email}
            </span>
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 py-1">
                <div className="px-3 py-2 border-b border-gray-700">
                  <p className="text-sm text-gray-200 font-medium truncate">
                    {session.user.name || '用户'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session.user.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    router.push('/workspace')
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  工作区
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    signOut({ callbackUrl: '/' })
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                >
                  退出登录
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden ml-auto p-2 text-gray-400 hover:text-gray-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </nav>
  )
}

export default Navbar
