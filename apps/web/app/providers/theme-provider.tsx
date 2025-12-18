'use client'

import { useEffect, useState } from 'react'

import { useUIStore } from '@/stores/ui'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useUIStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }, [theme, mounted])

  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}
