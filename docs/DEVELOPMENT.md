# Nexus Design - 开发指南

## 环境搭建

### 系统要求

- Node.js 18.18+
- PostgreSQL 15+
- Redis (可选)

### 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填写数据库连接信息

# 初始化数据库
npx prisma generate
npx prisma db push
npx prisma db seed

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000`

演示账号：`demo@nexusdesign.app` / 配置的密码

## 项目结构

```
apps/web/
├── app/
│   ├── api/              # API 路由
│   ├── auth/             # 认证页面
│   ├── components/       # 共享组件
│   │   ├── editor/       # 编辑器组件
│   │   ├── shared/       # 导航栏、Toast
│   │   └── ui/           # Button、Card 等
│   ├── design/           # 编辑器和 AI 页面
│   ├── lib/              # 工具函数和数据库客户端
│   ├── stores/           # Zustand 状态管理
│   ├── types/            # TypeScript 类型定义
│   └── workspace/        # 工作区页面
├── prisma/               # 数据库 schema
└── e2e/                  # Playwright 测试
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (Turbopack) |
| `npm run build` | 生产构建 |
| `npm run lint` | ESLint 检查 |
| `npx tsc --noEmit` | TypeScript 类型检查 |
| `npx vitest run` | 运行单元测试 |
| `npx vitest --ui` | 测试 UI |
| `npx prisma studio` | 数据库管理界面 |
| `npx prisma db push` | 同步数据库 schema |

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript 5.x (严格模式)
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: NextAuth.js 4.x
- **状态管理**: Zustand
- **样式**: Tailwind CSS 3.4
- **测试**: Vitest + Testing Library + Playwright

## 架构说明

- 所有页面使用 `'use client'` 指令
- Provider 集中在 `app/layout.tsx` 的 `AppProvider` 中
- API 错误使用统一的 `handleApiError` 工具函数
- 编辑器状态由 `useEditorStore` (Zustand) 管理
- UI 状态（主题、Toast、侧边栏）在 `useUIStore` 中
