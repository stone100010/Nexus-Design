'use client'

import { AuthForm } from '../components/auth-form'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark via-card to-dark p-4">
      <div className="w-full max-w-md">
        <AuthForm type="register" />
      </div>
    </div>
  )
}
