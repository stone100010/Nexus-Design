'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import * as React from 'react'

import { useUIStore } from '@/stores/ui'

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  )
}

/**
 * 初始化主题的组件
 */
export function ThemeInitializer() {
  const setTheme = useUIStore((state) => state.setTheme)
  
  React.useEffect(() => {
    // 从 localStorage 读取主题
    const savedTheme = localStorage.getItem('ui-storage')
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme)
        if (parsed.state?.theme) {
          setTheme(parsed.state.theme)
        }
      } catch (e) {
        console.warn('Failed to parse saved theme', e)
      }
    }
  }, [setTheme])
  
  return null
}

import { Toast } from '@/components/shared/toast'

/**
 * 根 Provider，包裹所有应用
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ThemeInitializer />
        {children}
        <Toast />
      </ThemeProvider>
    </SessionProvider>
  )
}
