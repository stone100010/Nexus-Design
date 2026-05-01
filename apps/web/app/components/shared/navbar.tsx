'use client'

import { motion } from 'framer-motion'
import { 
  ChevronDown,
  Layout, 
  LogOut, 
  Menu, 
  X} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
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
    { label: '工作区', path: '/workspace', icon: Layout },
    { label: '编辑器', path: '/design/editor', icon: Layout },
  ]

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'h-16 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 flex items-center px-6 z-50',
        className
      )}
    >
      {/* Logo */}
      <button
        onClick={() => router.push('/workspace')}
        className="flex items-center gap-3 mr-10 group"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <span className="text-white text-lg font-bold">N</span>
          </div>
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 blur-lg group-hover:opacity-40 transition-opacity" />
        </div>
        <div className="hidden sm:block">
          <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Nexus Design
          </span>
        </div>
      </button>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-1 flex-1">
        {navLinks.map((link) => {
          const Icon = link.icon
          const active = isActive(link.path)
          return (
            <button
              key={link.path}
              onClick={() => router.push(link.path)}
              className={cn(
                'relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                'flex items-center gap-2',
                active
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              )}
            >
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{link.label}</span>
            </button>
          )
        })}
      </div>

      {/* User Menu */}
      {session?.user && (
        <div className="relative ml-auto">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-800/50 transition-colors"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-white text-sm font-semibold">
                  {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium text-white max-w-[140px] truncate">
                {session.user.name || '用户'}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span>在线</span>
                <ChevronDown className={cn(
                  "w-3 h-3 transition-transform",
                  menuOpen && "rotate-180"
                )} />
              </div>
            </div>
          </button>

          {/* 下拉菜单 */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
              >
                {/* 用户信息 */}
                <div className="px-4 py-4 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {session.user.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-white truncate">
                        {session.user.name || '用户'}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {session.user.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 菜单项 */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      router.push('/workspace')
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors"
                  >
                    <Layout className="w-4 h-4" />
                    <span>工作区</span>
                  </button>
                </div>

                {/* 退出登录 */}
                <div className="border-t border-gray-800 py-2">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </div>
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden ml-auto p-2 rounded-xl hover:bg-gray-800/50 text-gray-400 transition-colors"
      >
        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </motion.nav>
  )
}

export default Navbar