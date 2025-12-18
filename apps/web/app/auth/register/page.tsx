import { Metadata } from 'next'

'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { AuthForm } from '../components/auth-form'

function RegisterWrapper() {
  return <AuthForm type="register" />
}

export default function RegisterPage() {
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
            <RegisterWrapper />
          </div>
        </div>
      </ThemeProvider>
    </SessionProvider>
  )
}
