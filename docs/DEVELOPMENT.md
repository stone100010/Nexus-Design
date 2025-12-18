# Nexus Design - 开发指南

## 🛠️ 环境搭建

### 1. 系统要求

**必需工具**
- Node.js 18.18+ (推荐 20.x)
- npm 9.x+ 或 pnpm 8.x+
- Git
- PostgreSQL 15+
- Redis 7+ (可选，用于缓存和实时功能)

**推荐工具**
- Docker (用于数据库和依赖服务)
- VS Code (推荐插件: ESLint, Prettier, Tailwind CSS IntelliSense)
- TablePlus / Postico (数据库管理工具)

---

### 2. 开发环境配置

#### 2.1 克隆项目

```bash
# 克隆仓库
git clone https://github.com/nexusdesign/nexus-design.git
cd nexus-design

# 安装依赖
npm install
# 或使用 pnpm
pnpm install
```

#### 2.2 环境变量配置

创建 `.env.local` 文件：

```bash
# 复制模板
cp .env.example .env.local
```

**环境变量说明**

```env
# ===== 数据库配置 =====
DATABASE_URL="postgresql://user:password@localhost:5432/nexus_design?schema=public"

# ===== NextAuth 配置 =====
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # 使用 openssl rand -base64 32 生成

# ===== OpenAI API 配置 =====
OPENAI_API_KEY="sk-your-api-key-here"
```

#### 2.3 数据库初始化

```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma db push

# 种子数据库（创建演示数据）
npx prisma db seed
```

---

### 3. 启动开发服务

#### 3.1 启动开发服务器

```bash
# 进入 web 应用目录
cd apps/web

# 启动开发服务器（使用 Turbopack）
npm run dev -- --turbo
```

服务器将在 `http://localhost:3000` 启动

#### 3.2 启动 Prisma Studio（可选）

```bash
# 在新终端中运行
npx prisma studio --port 5555
```

访问 `http://localhost:5555` 查看数据库

---

### 4. 项目结构

```
nexus-design/
├── apps/web/                    # Next.js 主应用
│   ├── app/                    # App Router 路由
│   │   ├── api/               # API 路由
│   │   │   ├── auth/          # 认证相关
│   │   │   ├── ai/            # AI 生成
│   │   │   ├── admin/         # 管理工具
│   │   │   └── projects/      # 项目管理
│   │   ├── auth/              # 认证页面
│   │   ├── design/            # 设计编辑器
│   │   ├── components/        # 组件
│   │   │   ├── editor/       # 编辑器组件
│   │   │   ├── shared/       # 共享组件
│   │   │   └── ui/           # UI 组件
│   │   ├── lib/              # 工具库
│   │   ├── stores/           # 状态管理
│   │   └── types/            # 类型定义
│   ├── prisma/               # Prisma 配置
│   └── public/               # 静态资源
├── packages/                  # 共享包
│   ├── ai/                   # AI 相关
│   ├── core/                 # 核心逻辑
│   ├── editor/               # 编辑器核心
│   └── ui/                   # UI 组件库
├── prisma/                   # 数据库 schema
├── docs/                     # 文档
└── scripts/                  # 脚本
```

---

### 5. 核心功能开发

#### 5.1 数据库设计

**数据库模型** (`prisma/schema.prisma`)

- **User**: 用户账户
- **Account**: OAuth 账户关联
- **Session**: 会话管理
- **VerificationToken**: 邮箱验证
- **Project**: 设计项目
- **ProjectVersion**: 项目版本历史
- **EditorElement**: 设计元素
- **DevicePreset**: 设备预设
- **AIGeneration**: AI 生成记录
- **AIPrompt**: AI 提示词
- **Comment**: 评论/反馈
- **Notification**: 通知

**关系说明**:
- 一个用户可以有多个项目
- 一个项目可以有多个版本
- 一个版本包含多个元素
- 一个用户可以有多个 AI 生成记录

#### 5.2 认证系统

**技术栈**: NextAuth.js 4.24.5

**认证方式**:
- ✅ 邮箱/密码登录
- ✅ 用户注册
- ✅ OAuth (GitHub, Google) - 配置就绪
- ✅ 会话管理
- ✅ 保护路由

**文件**:
- `apps/web/app/api/auth/[...nextauth]/route.ts`: NextAuth 配置
- `apps/web/app/api/auth/register/route.ts`: 注册 API
- `apps/web/app/lib/auth.ts`: 认证工具函数
- `apps/web/app/auth/login/page.tsx`: 登录页面
- `apps/web/app/auth/register/page.tsx`: 注册页面

**测试账号**:
```
邮箱: demo@nexusdesign.app
密码: demo123

邮箱: admin@nexusdesign.app
密码: admin123
```

#### 5.3 状态管理

**Zustand Stores**:

1. **UI Store** (`apps/web/app/stores/ui.ts`)
   - 主题切换（暗色/亮色）
   - Toast 通知系统
   - Loading 状态
   - 模态框控制

2. **Editor Store** (`apps/web/app/stores/editor.ts`)
   - 画布元素管理
   - 拖拽状态
   - 历史记录（撤销/重做）
   - 画布缩放和平移
   - 项目持久化

**核心方法**:
```typescript
// 元素操作
addElement(element): void
updateElement(id, updates): void
deleteElement(id): void
selectElement(id): void
duplicateElement(id): void

// 历史记录
undo(): void
redo(): void
canUndo(): boolean
canRedo(): boolean

// 画布操作
setZoom(zoom): void
setCanvasSize(width, height): void
pan(dx, dy): void

// 项目管理
saveProject(name?): Promise<void>
loadProject(id): Promise<void>
```

#### 5.4 UI 组件库

**基础组件** (`apps/web/app/components/ui/`)

- **Button**: 按钮组件，支持多种变体
- **Card**: 卡片容器
- **Toast**: 通知提示（使用 sonner）

**编辑器组件** (`apps/web/app/components/editor/`)

- **Canvas**: 核心画布，支持拖拽、缩放、平移
- **ComponentLibrary**: 组件库面板
- **PropertiesPanel**: 属性编辑面板

#### 5.5 设计编辑器

**画布组件** (`apps/web/app/components/editor/canvas.tsx`)

功能：
- ✅ 可视化画布，支持网格背景
- ✅ 双击添加元素
- ✅ 拖拽移动
- ✅ 元素选择
- ✅ 缩放（0.1x - 3x）
- ✅ 平移（中键/Ctrl+拖拽）
- ✅ 键盘快捷键
- ✅ 自动保存

**组件库** (`apps/web/app/components/editor/component-library.tsx`)

组件类型：
- 按钮、文本、容器、卡片、输入框、图片、图标
- 设备预设：iPhone 14 Pro、iPad、Desktop

**属性面板** (`apps/web/app/components/editor/properties-panel.tsx`)

编辑功能：
- 样式（颜色、字体、圆角、间距）
- 位置（X/Y 坐标）
- 尺寸（宽/高）
- 文本内容
- 层级调整
- 复制/删除

**编辑器页面** (`apps/web/app/design/editor/page.tsx`)

布局：
```
┌─────────────────────────────────────┐
│  顶部工具栏 (保存、导出、AI、撤销/重做)  │
├──────────┬──────────────┬──────────┤
│ 组件库   │   画布区域    │ 属性面板  │
│          │              │           │
│          │              │           │
└──────────┴──────────────┴──────────┘
```

快捷键：
- `Ctrl+S`: 保存项目
- `Ctrl+Z`: 撤销
- `Ctrl+Y`: 重做
- `Delete`: 删除选中
- `双击画布`: 添加元素
- `中键拖拽`: 平移

#### 5.6 AI 生成系统

**API 端点**: `apps/web/app/api/ai/generate/route.ts`

功能：
- ✅ 基于提示词生成设计元素
- ✅ 上下文记忆（最近 5 条记录）
- ✅ 成本计算（Token 统计）
- ✅ 错误处理和重试

**AI 页面**: `apps/web/app/design/ai/page.tsx`

特性：
- ✅ 提示词输入
- ✅ 历史记录展示
- ✅ 生成结果预览
- ✅ 一键应用到画布
- ✅ 提示技巧指导

**系统提示词**:
```
你是一个专业的 UI/UX 设计师和前端开发专家。
请以 JSON 格式返回设计元素和代码。
遵循现代设计原则，使用深色主题，确保良好的视觉层次。
```

#### 5.7 项目管理 API

**API 接口**: `apps/web/app/api/projects/route.ts`
- ✅ 项目列表获取
- ✅ 项目创建
- ✅ 项目更新
- ✅ 自动关联用户
- ✅ 包含所有者信息
- ✅ 统计数据（版本数、评论数）

**数据结构**:
```typescript
interface Project {
  id: string
  name: string
  data: {
    elements: EditorElement[]
    canvas: { width, height, zoom }
  }
  settings: {
    theme: 'dark'
    devices: ['iphone-14-pro']
  }
}
```