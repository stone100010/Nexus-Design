import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach,describe, expect, it, vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock next-auth/react
const mockSignIn = vi.fn()
vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}))

// Mock UI store
vi.mock('@/stores/ui', () => ({
  useUIStore: () => ({
    setToast: vi.fn(),
    showToast: vi.fn(),
  }),
}))

import { AuthForm } from '../auth-form'

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignIn.mockResolvedValue({ error: null })
  })

  it('renders login form by default', () => {
    render(<AuthForm type="login" />)
    expect(screen.getByText('欢迎回来')).toBeInTheDocument()
    expect(screen.getByText('登录')).toBeInTheDocument()
    expect(screen.getByText('邮箱')).toBeInTheDocument()
  })

  it('renders register form when type is register', () => {
    render(<AuthForm type="register" />)
    expect(screen.getByText('创建账户')).toBeInTheDocument()
    expect(screen.getByText('注册')).toBeInTheDocument()
    expect(screen.getByText('姓名')).toBeInTheDocument()
  })

  it('renders email and password inputs', () => {
    render(<AuthForm type="login" />)
    expect(screen.getByText('邮箱')).toBeInTheDocument()
    expect(screen.getByText('密码')).toBeInTheDocument()
  })

  it('shows password validation error for short password', async () => {
    const user = userEvent.setup()
    render(<AuthForm type="login" />)

    const emailInput = screen.getAllByRole('textbox')[0]
    await user.type(emailInput, 'test@example.com')

    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
    await user.type(passwordInput, '123')

    const submitButton = screen.getByText('登录')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('密码至少需要 6 个字符')).toBeInTheDocument()
    })
  })

  it('submits login form successfully', async () => {
    mockSignIn.mockResolvedValue({ error: null })
    const user = userEvent.setup()
    render(<AuthForm type="login" />)

    const emailInput = screen.getAllByRole('textbox')[0]
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByText('登录')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      })
    })
  })

  it('shows error on failed login', async () => {
    mockSignIn.mockResolvedValue({ error: 'CredentialsSignin' })
    const user = userEvent.setup()
    render(<AuthForm type="login" />)

    const emailInput = screen.getAllByRole('textbox')[0]
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')

    const submitButton = screen.getByText('登录')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled()
    })
  })

  it('renders demo login button in login mode', () => {
    render(<AuthForm type="login" />)
    expect(screen.getByText('使用演示账号登录')).toBeInTheDocument()
  })

  it('does not render demo login in register mode', () => {
    render(<AuthForm type="register" />)
    expect(screen.queryByText('使用演示账号登录')).not.toBeInTheDocument()
  })

  it('renders social login buttons in login mode', () => {
    render(<AuthForm type="login" />)
    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })

  it('shows register link in login mode', () => {
    render(<AuthForm type="login" />)
    expect(screen.getByText('立即注册')).toBeInTheDocument()
  })
})
