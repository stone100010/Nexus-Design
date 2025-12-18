'use client'

import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useUIStore } from '@/stores/ui'

interface AuthFormProps {
  type: 'login' | 'register'
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter()
  const { setToast } = useUIStore()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const isLogin = type === 'login'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          setToast({ message: '登录失败，请检查您的凭据', type: 'error' })
        } else {
          setToast({ message: '登录成功！', type: 'success' })
          router.push('/workspace')
        }
      } else {
        // 注册逻辑
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          setToast({ message: '注册成功！请登录', type: 'success' })
          router.push('/auth/login')
        } else {
          const data = await response.json()
          setToast({ message: data.error || '注册失败', type: 'error' })
        }
      }
    } catch (error) {
      setToast({ message: '发生错误，请稍后重试', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true)
    await signIn(provider, { callbackUrl: '/workspace' })
  }

  // 演示登录（仅开发环境）
  const demoLogin = async () => {
    if (process.env.NODE_ENV !== 'development') {
      setToast({ message: '演示登录仅在开发环境可用', type: 'error' })
      return
    }
    
    setLoading(true)
    try {
      // 从环境变量获取演示密码，或使用默认值
      const demoPassword = process.env.NEXUS_DEMO_PASSWORD || 'demo123'
      
      const result = await signIn('credentials', {
        email: 'demo@nexusdesign.app',
        password: demoPassword,
        redirect: false,
      })

      if (result?.error) {
        setToast({ message: '演示登录失败，请重试', type: 'error' })
      } else {
        setToast({ message: '演示账号登录成功！', type: 'success' })
        router.push('/workspace')
      }
    } catch (error) {
      setToast({ message: '演示登录失败', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full bg-card/80 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {isLogin ? '欢迎回来' : '创建账户'}
        </CardTitle>
        <CardDescription className="text-center">
          {isLogin 
            ? '登录您的 Nexus Design 账户' 
            : '开始您的设计之旅'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">姓名</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-dark/50 border border-primary/20 rounded-lg focus:outline-none focus:border-primary"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">邮箱</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 bg-dark/50 border border-primary/20 rounded-lg focus:outline-none focus:border-primary"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">密码</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 bg-dark/50 border border-primary/20 rounded-lg focus:outline-none focus:border-primary"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
            variant="primary"
          >
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </Button>
        </form>

        {isLogin && (
          <>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted">或者使用演示账号快速体验</p>
              <Button 
                onClick={demoLogin}
                className="w-full mt-2"
                variant="secondary"
                disabled={loading}
              >
                使用演示账号登录
              </Button>
            </div>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted">或继续使用</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button
                onClick={() => handleSocialLogin('google')}
                variant="secondary"
                disabled={loading}
              >
                Google
              </Button>
              <Button
                onClick={() => handleSocialLogin('github')}
                variant="secondary"
                disabled={loading}
              >
                GitHub
              </Button>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted">
          {isLogin ? "还没有账户？" : "已有账户？"}
          <button
            onClick={() => router.push(isLogin ? '/auth/register' : '/auth/login')}
            className="ml-1 text-primary hover:underline font-medium"
          >
            {isLogin ? '立即注册' : '立即登录'}
          </button>
        </p>
      </CardFooter>
    </Card>
  )
}
