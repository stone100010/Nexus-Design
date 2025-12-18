import bcrypt from 'bcryptjs'
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'

import { prisma } from './db'

// 扩展 NextAuth 类型
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role: string
      image?: string
    }
  }
  
  interface User {
    id: string
    email: string
    name?: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // 密码登录
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // 演示账号 - 检查环境变量中的演示密码（仅开发环境）
        if (
          process.env.NODE_ENV === 'development' &&
          credentials.email === 'demo@nexusdesign.app' &&
          credentials.password === process.env.NEXUS_DEMO_PASSWORD
        ) {
          return {
            id: 'demo-user',
            email: credentials.email,
            name: 'Demo User',
            role: 'USER',
          }
        }

        // 数据库用户验证
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
            },
          })

          if (!user || !user.password) {
            return null
          }

          // 验证密码
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
    
    // Google 登录
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // GitHub 登录
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  
  // 自定义页面
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  
  // 回调
  callbacks: {
    async jwt({ token, user }) {
      // 初次登录时将用户信息添加到 token
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  
  // 会话配置
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  
  // JWT 配置
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  
  // 启用调试（仅开发环境）
  debug: process.env.NODE_ENV === 'development',
}

export const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
