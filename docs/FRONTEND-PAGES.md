# Nexus Design 前端页面全景文档

> 最后更新: 2026-04-30

## 目录

- [页面层级总览](#页面层级总览)
- [第一层：入口页面](#第一层入口页面)
- [第二层：核心功能页面](#第二层核心功能页面均需登录)
- [第三层：管理与错误页面](#第三层管理与错误页面)
- [共享组件](#共享组件)
- [状态管理](#状态管理-zustand)
- [API 路由](#api-路由)
- [用户典型流程](#用户典型流程)
- [技术栈](#技术栈)

---

## 页面层级总览

```
/ (根)
├── /                          首页 - 产品着陆页 (无需登录)
├── /auth
│   ├── /auth/login            登录页 (无需登录)
│   └── /auth/register         注册页 (无需登录)
├── /workspace                 工作区 (需登录)
├── /design
│   ├── /design/ai             AI 生成页 (需登录)
│   ├── /design/editor         可视化编辑器 (需登录)
│   └── /design/settings       项目设置 (需登录)
├── /settings                  用户设置 (需登录)
├── /admin
│   └── /admin/setup           数据库配置向导 (无需登录)
├── /not-found                 404 页面
├── /error                     页面级错误
└── /global-error              全局致命错误
```

### 文件路径映射

| 路由 | 文件路径 | 类型 |
|------|----------|------|
| `/` | `apps/web/app/page.tsx` | Client Component |
| `/auth/login` | `apps/web/app/auth/login/page.tsx` | Client Component |
| `/auth/register` | `apps/web/app/auth/register/page.tsx` | Client Component |
| `/workspace` | `apps/web/app/workspace/page.tsx` | Client Component |
| `/design/ai` | `apps/web/app/design/ai/page.tsx` | Client Component |
| `/design/editor` | `apps/web/app/design/editor/page.tsx` | Client Component |
| `/design/settings` | `apps/web/app/design/settings/page.tsx` | Client Component |
| `/settings` | `apps/web/app/settings/page.tsx` | Client Component |
| `/admin/setup` | `apps/web/app/admin/setup/page.tsx` | Server Component |
| `/not-found` | `apps/web/app/not-found.tsx` | Server Component |
| `/error` | `apps/web/app/error.tsx` | Client Component |
| `/global-error` | `apps/web/app/global-error.tsx` | Client Component |

---

## 第一层：入口页面

### 1. `/` - 首页 (产品着陆页)

- **文件**: `apps/web/app/page.tsx`
- **认证**: 无需登录
- **类型**: 静态展示页，纯前端渲染

#### 页面结构

| 区域 | 内容 |
|------|------|
| **Hero** | 产品标题 "Nexus Design"、MVP 标签、副标题、3 个 CTA 按钮 (注册/登录/进入工作区) |
| **核心功能** | 6 张卡片: AI 智能生成、多平台输出、实时协作、组件库、快速原型、代码优化 |
| **产品预览** | 3 个模拟界面截图: AI 生成界面、可视化编辑器、代码导出 |
| **演示参考** | 3 个静态 HTML 演示入口: 着陆页、认证系统、设计工作区 |
| **定价方案** | 三档定价: 免费版(¥0)、专业版(¥99/月,推荐)、企业版(¥299/月) |
| **用户评价** | 3 条虚构用户评价 (张明/李雪/王浩) |
| **CTA** | 行动号召区域 + 演示账号提示 (demo@nexusdesign.app / NexusDesign123) |
| **FAQ** | 4 个常见问题 |
| **Footer** | 导航链接、文档链接、GitHub、技术栈说明 |

#### 导航出口

- "开始免费使用" → `/auth/register`
- "登录账户" → `/auth/login`
- "进入工作区" → `/workspace`

---

### 2. `/auth/login` - 登录页

- **文件**: `apps/web/app/auth/login/page.tsx`
- **认证**: 无需登录
- **类型**: Client Component，渲染 `AuthForm` 组件

#### 功能

| 功能 | 说明 |
|------|------|
| 邮箱登录 | 邮箱 + 密码表单，调用 NextAuth `signIn('credentials')` |
| 演示登录 | 一键使用演示账号登录 (仅开发环境) |
| 社交登录 | Google / GitHub OAuth |
| 表单验证 | 邮箱格式校验、密码≥6位 |
| 跳转 | 登录成功 → `/workspace`；底部链接跳转注册页 |

---

### 3. `/auth/register` - 注册页

- **文件**: `apps/web/app/auth/register/page.tsx`
- **认证**: 无需登录
- **类型**: Client Component，渲染 `AuthForm` 组件

#### 功能

| 功能 | 说明 |
|------|------|
| 注册表单 | 姓名 + 邮箱 + 密码 |
| 表单验证 | 姓名≥2字符、邮箱格式、密码≥6位 |
| 提交 | POST `/api/auth/register` |
| 错误处理 | 邮箱已注册提示 |
| 跳转 | 注册成功 → `/auth/login`；底部链接跳转登录页 |

---

## 第二层：核心功能页面 (均需登录)

### 4. `/workspace` - 设计工作区

- **文件**: `apps/web/app/workspace/page.tsx`
- **认证**: 必须登录，未登录显示"需要登录"提示卡片
- **布局**: `Navbar` (顶部) + `Sidebar` (左侧)

#### 页面结构

| 区域 | 内容 |
|------|------|
| **新手引导** | 3 步引导弹窗 (欢迎 → AI驱动 → 开始创作)，状态存储在 `localStorage.onboarding_done` |
| **Header** | 标题 "设计工作区"、欢迎语、导入项目/新建项目按钮 |
| **快速开始** | 3 张卡片: AI 生成 → `/design/ai`、空白画布 → `/design/editor`、示例项目 (加载内置数据) |
| **最近项目** | 项目列表，支持搜索、排序(按时间/名称)，网格展示 |

#### 项目操作

| 操作 | 说明 |
|------|------|
| 打开项目 | 点击项目卡片 → `importState` 加载数据 → 跳转 `/design/editor` |
| 删除项目 | 悬停显示删除图标 → confirm → DELETE `/api/projects/[id]` |
| 加载示例 | 内置金融 App 示例 (7 个元素: 导航栏、总资产卡片、转账/收款按钮) |
| 搜索 | 按名称/描述模糊搜索 |
| 排序 | 按更新时间 (默认) / 按名称 |

#### Sidebar 导航项

| 链接 | 图标 | 说明 |
|------|------|------|
| `/workspace` | FolderOpen | 项目列表 |
| `/workspace?tab=team` | Users | 团队 (待实现) |
| `/workspace?tab=templates` | LayoutTemplate | 模板库 (待实现) |
| `/settings` | Settings | 用户设置 |

---

### 5. `/design/ai` - AI 生成页

- **文件**: `apps/web/app/design/ai/page.tsx`
- **认证**: 必须登录
- **布局**: `Navbar`

#### 标签页切换

| 标签 | 功能 |
|------|------|
| **生成设计** | AI 设计生成面板 |
| **历史记录** | 生成历史 + 使用量统计 |

#### 生成设计面板

| 配置项 | 选项 |
|--------|------|
| 画布尺寸 | iPhone (375×812) / iPad (768×1024) / Desktop (1920×1080) |
| 设计风格 | 现代 (圆角/渐变/阴影) / 简约 (留白/细线/单色) / 科技 (深色/霓虹/几何) / 可爱 (粉色/圆润/卡通) |
| 优化模式 | 复选框：在当前设计基础上追加元素 (不清空画布) |
| 输入 | 文本域，5 个示例提示词可点击填充 |
| 配额 | 显示今日剩余次数 / 总次数，进度条 (绿/黄/红) |

#### 生成流程

1. 构建增强提示词 (含尺寸、风格、上下文)
2. POST `/api/ai/generate`
3. 成功 → 清空画布(或追加) → 设置画布尺寸 → 添加元素 → 跳转编辑器
4. 失败 → 显示错误 Toast

#### 历史记录面板

| 区域 | 内容 |
|------|------|
| 使用量统计 | 总调用次数 / Token 消耗 / 总成本 |
| 历史列表 | 每条记录: 提示词、时间、缩略图预览、元素数、Token、成本、状态标签 |
| 操作 | "加载" 按钮 → 覆盖当前画布 → 跳转编辑器 |

---

### 6. `/design/editor` - 可视化设计编辑器

- **文件**: `apps/web/app/design/editor/page.tsx`
- **认证**: 必须登录，未登录重定向到 `/auth/login?redirect=/design/editor`
- **类型**: 最复杂的页面，动态导入子组件

#### 顶部工具栏

| 区域 | 功能 |
|------|------|
| 左侧 | 返回按钮(→ workspace) / 标题 "设计编辑器" / 元素计数 / 历史计数 / 保存状态指示灯 |
| 中间 | 撤销 / AI 生成按钮 / 对齐工具(选中≥2元素时显示) / 版本保存 / 版本历史 / 主题切换 |
| 右侧 | 导出格式选择(React/Vue/HTML) / 导出按钮 / 保存按钮 / 加载草稿 / 清空画布 / 快捷键 / 用户头像 |

#### 三栏布局

| 区域 | 组件 | 宽度 | 说明 |
|------|------|------|------|
| 左侧 | `ComponentLibrary` | 256px (w-64) | 组件库，动态导入 |
| 中间 | `Canvas` | flex-1 | 画布区域，动态导入 |
| 右侧 | `PropertiesPanel` | 288px (w-72) | 属性面板，动态导入 |

#### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+S` | 保存项目 |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Y` | 重做 |
| `Delete` | 删除选中元素 |
| 双击画布 | 添加元素 |
| 中键/Ctrl+拖拽 | 平移画布 |

#### 自动保存

- 元素变化后 3 秒自动保存草稿
- 保存状态指示: 绿色圆点(已保存) / 黄色脉冲(保存中)

#### 代码导出

支持三种格式:

| 格式 | 输出 | 说明 |
|------|------|------|
| React TSX | `.tsx` 文件 | 含 className、inline style |
| Vue SFC | `.vue` 文件 | `<template>` + `<script setup>` + `<style scoped>` |
| HTML/CSS | `.html` 文件 | 纯 HTML + 内联 style |

导出流程: 点击导出 → 弹窗预览 → 复制代码 / 下载文件

#### 版本管理

| 操作 | 说明 |
|------|------|
| 保存版本 | 调用 `saveVersion()` |
| 版本历史 | 从 `/api/projects/[id]/versions` 获取，侧边栏展示 |
| 加载版本 | 点击版本 → `loadVersion()` 覆盖当前画布 |

#### 快捷键面板

左下角浮层，显示所有快捷键说明。

---

### 7. `/design/settings` - 项目设置

- **文件**: `apps/web/app/design/settings/page.tsx`
- **认证**: 必须登录
- **布局**: `Navbar`

#### 功能区域

| 区域 | 内容 |
|------|------|
| **项目信息** | 项目名称输入、项目描述文本域 |
| **画布尺寸** | 6 个预设按钮: iPhone 14 Pro (393×852) / iPhone 14 (390×844) / iPad (768×1024) / iPad Pro (1024×1366) / Desktop HD (1920×1080) / MacBook Pro 14" (1512×982) |
| **自定义尺寸** | 宽度/高度数字输入框 |
| **危险操作** | 清空画布按钮 (需 confirm) |
| **操作按钮** | 返回 / 保存设置 → PATCH `/api/projects/[id]` |

---

### 8. `/settings` - 用户设置

- **文件**: `apps/web/app/settings/page.tsx`
- **认证**: 必须登录
- **布局**: `Navbar`

#### 功能区域

| 区域 | 内容 |
|------|------|
| **个人资料** | 头像(首字母渐变圆)、邮箱(只读)、姓名(可编辑) → PATCH `/api/user/profile` |
| **修改密码** | 当前密码、新密码、确认密码 → PATCH `/api/user/password` |
| **账户操作** | 退出登录按钮 → `signOut({ callbackUrl: '/' })` |

---

## 第三层：管理与错误页面

### 9. `/admin/setup` - 数据库配置向导

- **文件**: `apps/web/app/admin/setup/page.tsx`
- **认证**: 无 (Server Component)
- **类型**: 静态引导页，无需登录

#### 4 步引导

| 步骤 | 内容 |
|------|------|
| 步骤 1 | 配置环境变量 `.env.local` (DATABASE_URL, NEXTAUTH_SECRET) |
| 步骤 2 | 启动 PostgreSQL (Docker 命令或 createdb) |
| 步骤 3 | Prisma generate → migrate → seed |
| 步骤 4 | 测试连接 (type-check, prisma validate) |

额外内容: 一键执行命令、演示账号信息 (demo / admin)

---

### 10. `/not-found` - 404 页面

- **文件**: `apps/web/app/not-found.tsx`
- 大号 "404" 文字 + "页面不存在" + 返回首页链接

### 11. `/error` - 页面级错误

- **文件**: `apps/web/app/error.tsx`
- Client Component，`'use client'`
- 显示错误图标 + 错误信息 + dev 环境显示 stack trace
- 操作: 重试 (调用 `reset()`) / 返回首页

### 12. `/global-error` - 全局致命错误

- **文件**: `apps/web/app/global-error.tsx`
- Client Component，独立 HTML 结构 (绕过 RootLayout)
- 显示 "应用错误" + 重新加载按钮

---

## 共享组件

### 布局组件

| 组件 | 文件 | 用途 |
|------|------|------|
| `Navbar` | `app/components/shared/navbar.tsx` | 顶部导航栏 |
| `Sidebar` | `app/components/shared/sidebar.tsx` | 左侧边栏 (仅 workspace 使用) |

#### Navbar 详情

- **高度**: 56px (h-14)
- **左侧**: Logo (渐变紫色方块 + "N") + "Nexus Design" 文字
- **中间**: 导航链接 - 工作区 / AI 生成 / 编辑器 (当前路径高亮)
- **右侧**: 用户头像 + 下拉菜单 (用户信息 / 工作区 / 退出登录)
- **移动端**: 汉堡菜单按钮

#### Sidebar 详情

- **宽度**: 可折叠，展开 224px (w-56) / 收起 64px (w-16)
- **导航项**: 项目列表 / 团队 / 模板库 / 设置
- **底部**: 版本号 "Nexus Design v1.1.0"

### UI 组件

| 组件 | 文件 | 用途 |
|------|------|------|
| `Button` | `app/components/ui/button.tsx` | 通用按钮，支持 variant/size/loading |
| `Card` | `app/components/ui/card.tsx` | 卡片容器 (Card/CardHeader/CardTitle/CardDescription/CardContent) |
| `Toast` | `app/components/shared/toast.tsx` | 全局提示 |

### 认证组件

| 组件 | 文件 | 用途 |
|------|------|------|
| `AuthForm` | `app/auth/components/auth-form.tsx` | 登录/注册表单 |

#### AuthForm 功能

- 属性: `type: 'login' | 'register'`
- 登录模式: 邮箱密码 / 演示账号 / Google / GitHub
- 注册模式: 姓名 + 邮箱 + 密码
- 表单验证: 实时清除字段错误
- 登录成功 → `/workspace`；注册成功 → `/auth/login`

---

## 状态管理 (Zustand)

### `useEditorStore`

- **文件**: `app/stores/editor.ts`

| 状态/方法 | 类型 | 说明 |
|-----------|------|------|
| `elements` | `DesignElement[]` | 画布上的所有元素 |
| `selectedElementIds` | `string[]` | 选中的元素 ID |
| `canvas` | `CanvasState` | 画布尺寸 (width/height) |
| `history` | `HistoryEntry[]` | 操作历史 |
| `theme` | `'dark' \| 'light'` | 编辑器主题 |
| `isSaving` | `boolean` | 保存状态 |
| `addElement()` | 方法 | 添加元素 |
| `clearCanvas()` / `clear()` | 方法 | 清空画布 |
| `undo()` / `redo()` | 方法 | 撤销/重做 |
| `canUndo()` / `canRedo()` | 方法 | 是否可撤销/重做 |
| `saveProject()` / `loadProject()` | 方法 | 保存/加载项目 |
| `saveVersion()` / `loadVersion()` | 方法 | 版本管理 |
| `alignElements()` | 方法 | 元素对齐 |
| `setCanvasSize()` | 方法 | 设置画布尺寸 |
| `setTheme()` | 方法 | 切换主题 |
| `importState()` | 方法 | 导入完整状态 |

### `useUIStore`

- **文件**: `app/stores/ui.ts`

| 状态/方法 | 类型 | 说明 |
|-----------|------|------|
| `toast` | `ToastState` | 当前 Toast 信息 |
| `showToast()` | 方法 | 显示提示 (message, type) |
| `setToast()` | 方法 | 设置 Toast 状态 |

---

## API 路由

### 认证

| 路由 | 方法 | 文件 | 说明 |
|------|------|------|------|
| `/api/auth/[...nextauth]` | * | `app/api/auth/[...nextauth]/route.ts` | NextAuth 处理器 |
| `/api/auth/register` | POST | `app/api/auth/register/route.ts` | 用户注册 |

### 项目管理

| 路由 | 方法 | 文件 | 说明 |
|------|------|------|------|
| `/api/projects` | GET | `app/api/projects/route.ts` | 获取项目列表 |
| `/api/projects` | POST | `app/api/projects/route.ts` | 创建项目 |
| `/api/projects/[id]` | GET | `app/api/projects/[id]/route.ts` | 获取项目详情 |
| `/api/projects/[id]` | PATCH | `app/api/projects/[id]/route.ts` | 更新项目 |
| `/api/projects/[id]` | DELETE | `app/api/projects/[id]/route.ts` | 删除项目 |
| `/api/projects/[id]/versions` | GET | `app/api/projects/[id]/versions/route.ts` | 获取版本列表 |
| `/api/projects/[id]/versions` | POST | `app/api/projects/[id]/versions/route.ts` | 创建版本 |
| `/api/projects/[id]/versions/[versionId]` | GET | `app/api/projects/[id]/versions/[versionId]/route.ts` | 获取版本详情 |

### 用户管理

| 路由 | 方法 | 文件 | 说明 |
|------|------|------|------|
| `/api/user/profile` | PATCH | `app/api/user/profile/route.ts` | 更新用户资料 |
| `/api/user/password` | PATCH | `app/api/user/password/route.ts` | 修改密码 |

### AI 服务

| 路由 | 方法 | 文件 | 说明 |
|------|------|------|------|
| `/api/ai/generate` | GET | `app/api/ai/generate/route.ts` | 获取 AI 生成历史 |
| `/api/ai/generate` | POST | `app/api/ai/generate/route.ts` | AI 生成设计 |

### 管理

| 路由 | 方法 | 文件 | 说明 |
|------|------|------|------|
| `/api/admin/db-test` | GET | `app/api/admin/db-test/route.ts` | 数据库连接测试 |

### 中间件

| 文件 | 说明 |
|------|------|
| `app/api/middleware/rate-limit.ts` | API 速率限制中间件 |

---

## 用户典型流程

### 新用户注册流程

```
首页(/) → 点击"开始免费使用" → 注册页(/auth/register)
  → 填写姓名/邮箱/密码 → 注册成功 → 登录页(/auth/login)
  → 输入邮箱/密码 → 登录成功 → 工作区(/workspace)
```

### 老用户登录流程

```
首页(/) → 点击"登录账户" → 登录页(/auth/login)
  → 输入邮箱/密码 → 登录成功 → 工作区(/workspace)
```

### AI 设计生成流程

```
工作区(/workspace) → 点击"快速开始"或"新建项目"
  → AI 生成页(/design/ai) → 选择尺寸/风格 → 输入描述
  → 点击"生成设计" → AI 返回元素 → 自动跳转编辑器(/design/editor)
```

### 手动设计流程

```
工作区(/workspace) → 点击"空白画布"
  → 编辑器(/design/editor) → 从组件库拖拽元素 → 编辑属性
  → 导出代码 / 保存项目
```

### 项目管理流程

```
工作区(/workspace) → 项目列表
  → 点击项目 → 加载到编辑器(/design/editor)
  → 编辑 → 保存版本 → 查看版本历史 → 回滚版本
```

### 完整用户路径图

```
首页(/)
  │
  ├─→ 注册(/auth/register) ─→ 登录(/auth/login) ─┐
  │                                                 │
  └─→ 登录(/auth/login) ──────────────────────────┘
                                                        │
                                                        ▼
                                              工作区(/workspace)
                                                        │
                    ┌───────────────────────────────────┼───────────────────────────────────┐
                    │                                   │                                   │
                    ▼                                   ▼                                   ▼
            AI 生成(/design/ai)                空白画布(/design/editor)              示例项目(内置数据)
                    │                                   │                                   │
                    │                                   │                                   │
              选择尺寸/风格                              │                                   │
              输入设计描述                               │                                   │
              点击"生成设计"                             │                                   │
                    │                                   │                                   │
                    └───────────────────────────────────┼───────────────────────────────────┘
                                                        │
                                                        ▼
                                              编辑器(/design/editor)
                                                        │
                    ┌───────────────────────────────────┼───────────────────────────────────┐
                    │                                   │                                   │
                    ▼                                   ▼                                   ▼
            拖拽编辑/属性修改                      导出代码                            版本管理
            (组件库→画布→属性面板)                 ├─ React TSX                         ├─ 保存版本
                                                  ├─ Vue SFC                           ├─ 查看历史
                                                  └─ HTML/CSS                          └─ 回滚版本
                                                        │
                                                        ▼
                                              项目设置(/design/settings)
                                              ├─ 项目名称/描述
                                              ├─ 画布尺寸预设
                                              └─ 清空画布

                                              用户设置(/settings)
                                              ├─ 个人资料
                                              ├─ 修改密码
                                              └─ 退出登录
```

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | ^14.2.35 | 框架 (App Router) |
| React | ^18.3.1 | UI 库 |
| TypeScript | - | 类型系统 |
| Tailwind CSS | 3.4.0 | 样式 |
| NextAuth | 4.24.5 | 认证 |
| Prisma | 5.8.0 | ORM |
| Zustand | - | 状态管理 (stores/ui.ts, stores/editor.ts) |
| Lucide React | ^0.561.0 | 图标 |
| Zod | 3.22.4 | 数据验证 |
| OpenAI | 4.24.0 | AI 生成 |
| next-themes | ^0.4.6 | 主题切换 |
| socket.io-client | 4.7.2 | 实时协作 (预留) |
| class-variance-authority | 0.7.0 | 组件变体 |
| clsx / tailwind-merge | - | 类名合并 |
| bcryptjs | ^3.0.3 | 密码哈希 |
| ioredis | 5.3.2 | 缓存 (预留) |
