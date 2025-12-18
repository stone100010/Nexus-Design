'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { AuthForm } from '../components/auth-form'

function LoginWrapper() {
  return <AuthForm type="login" />
}

export default function LoginPage() {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange={false}
      >
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark via-card to-dark p-4">
          <div className="w-full max-w-md">
            <LoginWrapper />
          </div>
        </div>
      </ThemeProvider>
    </SessionProvider>
  )
}
