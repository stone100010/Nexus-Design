# Nexus Design Web Application

基于 Next.js 16 的 Nexus Design 前端应用。

## 🚀 快速开始

### 1. 环境准备

确保已安装：
- Node.js 18.18+
- npm 9.0+

### 2. 安装依赖

在项目根目录运行：
```bash
npm install
```

### 3. 环境变量配置

复制环境变量模板并配置：
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

编辑 `.env.local` 并填入必要的配置。

### 4. 数据库设置

#### 本地 PostgreSQL (推荐 Docker)

```bash
# 启动 PostgreSQL
docker run --name nexus-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=nexusdesign_dev -p 5432:5432 -d postgres:15

# 或使用已有的 PostgreSQL 实例
```

#### 生成和运行迁移

```bash
# 生成 Prisma 客户端
npm run db:generate

# 创建并应用迁移
npm run db:migrate

# 可选：查看数据库
npm run db:studio
```

### 5. 开发模式

```bash
# 启动开发服务器
npm run dev

# 或使用 turbo
npm run dev
```

应用将在 http://localhost:3000 启动。

## 📁 项目结构

```
apps/web/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── auth/              # 认证页面
│   ├── components/        # UI 组件
│   │   ├── ai/           # AI 相关组件
│   │   ├── editor/       # 编辑器组件
│   │   ├── shared/       # 通用组件
│   │   └── ui/           # 基础 UI 组件
│   ├── design/           # 设计工作区
│   ├── hooks/            # React Hooks
│   ├── lib/              # 工具函数
│   ├── providers/        # Context Providers
│   ├── stores/           # Zustand 状态管理
│   ├── styles/           # 样式文件
│   └── types/            # TypeScript 类型定义
├── public/               # 静态资源
├── .eslintrc.js          # ESLint 配置
├── .prettierrc           # Prettier 配置
├── next.config.js        # Next.js 配置
├── tailwind.config.js    # Tailwind 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 项目依赖
```

## 🔧 常用命令

```bash
# 开发
npm run dev                    # 启动开发服务器
npm run build                  # 构建生产版本
npm run start                  # 启动生产服务器

# 代码质量
npm run lint                   # 运行 ESLint
npm run type-check            # TypeScript 类型检查
npm run format                # 格式化代码

# 测试
npm run test                  # 运行单元测试
npm run test:ui               # 运行带 UI 的测试
npm run test:e2e             # 运行端到端测试

# 数据库
npm run db:generate          # 生成 Prisma 客户端
npm run db:migrate           # 运行迁移
npm run db:studio            # 打开 Prisma Studio
npm run db:reset             # 重置数据库
npm run db:seed              # 种子数据
```

## 🛠️ 技术栈

- **框架**: Next.js 16.0.10 (App Router)
- **语言**: TypeScript 5.3.3
- **样式**: Tailwind CSS 3.4.0
- **状态管理**: Zustand 4.4.7
- **认证**: NextAuth.js 4.24.5
- **数据库**: Prisma 5.8.0 + PostgreSQL
- **AI**: OpenAI API
- **实时协作**: Socket.io
- **缓存**: Redis
- **测试**: Vitest + Playwright
- **代码规范**: ESLint + Prettier

## 🎯 核心功能

### 已实现
- ✅ 基础项目结构
- ✅ TypeScript 配置
- ✅ Tailwind CSS 配置
- ✅ ESLint & Prettier
- ✅ Zustand 状态管理
- ✅ 工具函数库
- ✅ React Hooks 集合
- ✅ 基础 UI 组件
- ✅ NextAuth 集成
- ✅ Prisma Schema

### 待实现
- 🔲 设计编辑器核心
- 🔲 AI 生成界面
- 🔲 实时协作功能
- 🔲 组件库系统
- 🔲 代码导出功能
- 🔲 多设备预览
- 🔲 版本控制
- 🔲 评论系统

## 🔐 环境变量说明

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | ✅ |
| `NEXTAUTH_URL` | 应用 URL | ✅ |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | ✅ |
| `OPENAI_API_KEY` | OpenAI API 密钥 | ❌ |
| `REDIS_URL` | Redis 连接字符串 | ❌ |

## 🐛 常见问题

### 1. 数据库连接失败
确保 PostgreSQL 正在运行，并且 `DATABASE_URL` 配置正确。

### 2. Prisma 客户端未生成
运行 `npm run db:generate`。

### 3. 类型错误
运行 `npm run type-check` 检查类型错误。

### 4. ESLint 错误
运行 `npm run lint` 并根据提示修复。

## 📚 文档

- [API 文档](../../docs/API.md)
- [数据库设计](../../docs/DATABASE.md)
- [开发指南](../../docs/DEVELOPMENT.md)
- [架构说明](../../docs/ARCHITECTURE.md)

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

Apache 2.0 - 详见 [LICENSE](../../LICENSE)

---

**版本**: v1.0.0  
**最后更新**: 2025-12-18
