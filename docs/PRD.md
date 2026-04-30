# Nexus Design - 产品需求文档 (PRD)

**文档版本**：v1.0.0  
**创建日期**：2025-12-17  
**最后更新**：2025-12-17  
**产品阶段**：MVP (Phase 1)  
**文档状态**：基于代码库实际状态编写

---

## 目录

1. [产品概述](#1-产品概述)
2. [目标用户与市场](#2-目标用户与市场)
3. [产品架构](#3-产品架构)
4. [功能模块详细需求](#4-功能模块详细需求)
5. [数据库模型](#5-数据库模型)
6. [API 接口规范](#6-api-接口规范)
7. [UI/UX 设计规范](#7-uiux-设计规范)
8. [技术实现状态](#8-技术实现状态)
9. [非功能性需求](#9-非功能性需求)
10. [产品路线图](#10-产品路线图)
11. [风险与约束](#11-风险与约束)
12. [附录](#12-附录)

---

## 1. 产品概述

### 1.1 产品定义

**Nexus Design** 是一个 AI 驱动的**设计即代码**（Design-to-Code）平台，旨在将 UI 设计与前端开发无缝连接。用户可以通过自然语言描述或可视化编辑生成 UI 设计，并一键导出为生产级代码。

### 1.2 核心价值主张

| 价值维度 | 描述 |
|---------|------|
| **效率提升** | 从想法到可运行原型的时间从天级缩短到分钟级 |
| **降低门槛** | 非技术人员也能通过自然语言描述创建专业 UI |
| **代码质量** | AI 生成的代码遵循最佳实践，可直接用于生产环境 |
| **多平台输出** | 一套设计，支持 React、Vue、小程序等多端代码输出 |
| **团队协作** | 实时多人编辑，版本控制，评论系统 |

### 1.3 产品定位

```
Nexus Design = Figma（可视化编辑） + Cursor（AI 代码生成） + Storybook（组件管理）
```

与竞品对比：

| 特性 | Nexus Design | Figma | v0.dev | Locofy |
|------|-------------|-------|--------|--------|
| 可视化编辑器 | ✅ | ✅ | ❌ | ✅ |
| AI 文本生成 UI | ✅ | ❌ | ✅ | ❌ |
| 代码导出 | ✅ | 插件 | ✅ | ✅ |
| 实时协作 | ✅ (规划中) | ✅ | ❌ | ❌ |
| 自托管 | ✅ | ❌ | ❌ | ❌ |
| 组件库管理 | ✅ | ✅ | ❌ | ❌ |

### 1.4 商业模式

| 版本 | 价格 | 项目数 | AI 调用/日 | 团队成员 | 支持 |
|------|------|--------|-----------|---------|------|
| 免费版 | $0 | 3 | 10 | 1 | 社区 |
| 专业版 | $29/月 | 无限 | 100 | 5 | 优先 |
| 企业版 | 定制 | 无限 | 无限 | 无限 | 7x24 |

---

## 2. 目标用户与市场

### 2.1 目标用户画像

#### 用户角色 1：产品经理 - 张明
- **背景**：互联网公司产品经理，3年经验
- **痛点**：需要快速制作原型给开发看，但不会写代码
- **需求**：输入描述即可生成可交互原型
- **使用场景**：需求评审前快速制作原型

#### 用户角色 2：UI 设计师 - 李雪
- **背景**：自由设计师，擅长视觉设计但不熟悉代码
- **痛点**：设计稿交付给开发后经常被"魔改"
- **需求**：设计直接生成代码，确保还原度
- **使用场景**：设计交付、组件库管理

#### 用户角色 3：全栈开发者 - 王强
- **背景**：创业公司唯一前端，需要快速出页面
- **痛点**：重复写 UI 代码效率低
- **需求**：AI 生成基础 UI，自己专注业务逻辑
- **使用场景**：新项目页面搭建、组件开发

#### 用户角色 4：创业团队 - 小李团队
- **背景**：3人创业团队，没有专职设计师
- **痛点**：产品外观粗糙，影响用户信任
- **需求**：快速生成专业级 UI，低成本验证 MVP
- **使用场景**：MVP 开发、产品迭代

### 2.2 市场规模

| 市场 | 规模 | 增长率 |
|------|------|--------|
| 全球 UI/UX 设计工具市场 | $5.2B (2025) | 12% CAGR |
| 低代码/无代码平台市场 | $27.8B (2025) | 22% CAGR |
| AI 辅助开发工具市场 | $1.8B (2025) | 35% CAGR |

### 2.3 用户使用流程

```
用户注册/登录
    ↓
进入工作区
    ↓
┌─────────────────────────────────────────┐
│  选择创建方式                            │
│  ├── AI 描述生成 → 输入自然语言 → 生成设计 │
│  ├── 从模板开始 → 选择模板 → 编辑修改     │
│  └── 空白画布 → 手动拖拽组件              │
└─────────────────────────────────────────┘
    ↓
可视化编辑器（拖拽、属性编辑、预览）
    ↓
保存/版本管理
    ↓
导出代码 / 分享链接 / 团队协作
```

---

## 3. 产品架构

### 3.1 系统架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                      用户层 (User Layer)                      │
│              Web Browser / Mobile Browser                     │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    前端层 (Frontend Layer)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Next.js 16  │  │  Zustand     │  │  Tailwind CSS    │  │
│  │  App Router  │  │  状态管理     │  │  + shadcn/ui     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      API 层 (API Layer)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Next.js API │  │  NextAuth.js │  │  OpenAI SDK      │  │
│  │  Routes      │  │  认证系统     │  │  AI 服务          │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     数据层 (Data Layer)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL  │  │  Redis       │  │  localStorage    │  │
│  │  (Prisma)    │  │  (缓存)      │  │  (本地备份)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 前端架构

#### 路由结构 (Next.js App Router)

```
app/
├── page.tsx                          # 首页（产品介绍）
├── layout.tsx                        # 根布局
├── globals.css                       # 全局样式
│
├── auth/
│   ├── login/page.tsx                # 登录页
│   ├── register/page.tsx             # 注册页
│   └── components/
│       └── auth-form.tsx             # 认证表单组件
│
├── workspace/
│   └── page.tsx                      # 工作区首页
│
├── design/
│   ├── editor/page.tsx               # 设计编辑器
│   └── ai/page.tsx                   # AI 生成页面
│
├── admin/
│   └── setup/page.tsx                # 管理员初始化
│
├── api/
│   ├── auth/
│   │   ├── [...nextauth]/route.ts    # NextAuth 处理
│   │   └── register/route.ts         # 用户注册
│   ├── projects/route.ts             # 项目 CRUD
│   ├── ai/
│   │   └── generate/route.ts         # AI 生成
│   └── admin/
│       └── db-test/route.ts          # 数据库测试
│
├── components/
│   ├── ui/
│   │   ├── button.tsx                # 按钮组件
│   │   └── card.tsx                  # 卡片组件
│   ├── editor/
│   │   ├── canvas.tsx                # 画布组件
│   │   ├── component-library.tsx     # 组件库面板
│   │   └── properties-panel.tsx      # 属性编辑面板
│   ├── shared/
│   │   └── toast.tsx                 # 通知提示
│   └── providers/
│       └── index.tsx                 # 全局 Provider
│
├── stores/
│   ├── editor.ts                     # 编辑器状态
│   └── ui.ts                         # UI 状态
│
├── hooks/
│   ├── useLocalStorage.ts            # 本地存储 Hook
│   └── useMediaQuery.ts              # 媒体查询 Hook
│
├── lib/
│   ├── auth.ts                       # NextAuth 配置
│   ├── db.ts                         # Prisma 客户端
│   ├── db-test.ts                    # 数据库测试工具
│   └── utils.ts                      # 工具函数
│
├── types/
│   └── index.ts                      # TypeScript 类型定义
│
└── providers/
    ├── theme-provider.tsx            # 主题 Provider
    └── index.tsx                     # 根 Provider
```

#### 状态管理架构

```
┌─────────────────────────────────────────┐
│  全局 UI 状态 (useUIStore - Zustand)     │
│  ├── theme: 'light' | 'dark'            │
│  ├── sidebarOpen: boolean               │
│  ├── selectedProjectId?: string         │
│  ├── selectedDevice?: string            │
│  ├── isCollaborating: boolean           │
│  └── toast: Toast | null                │
└─────────────────────────────────────────┘
         │
┌─────────────────────────────────────────┐
│  编辑器状态 (useEditorStore - Zustand)   │
│  ├── elements: EditorElement[]          │
│  ├── selectedElementIds: string[]       │
│  ├── canvas: { width, height, zoom }    │
│  ├── history: EditorHistory[]           │
│  ├── historyIndex: number               │
│  └── isSaving: boolean                  │
└─────────────────────────────────────────┘
         │
┌─────────────────────────────────────────┐
│  组件本地状态 (useState)                 │
│  ├── 表单输入状态                        │
│  ├── 拖拽状态                           │
│  └── UI 交互状态                        │
└─────────────────────────────────────────┘
```

### 3.3 后端架构

#### API 路由设计

| 路由 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth 认证 | - |
| `/api/auth/register` | POST | 用户注册 | - |
| `/api/projects` | GET | 获取项目列表 | ✅ |
| `/api/projects` | POST | 创建/更新项目 | ✅ |
| `/api/ai/generate` | POST | AI 生成设计 | ✅ |
| `/api/ai/generate` | GET | 获取 AI 历史 | ✅ |
| `/api/admin/db-test` | GET | 数据库连接测试 | ✅ |

#### 认证流程

```
用户输入邮箱/密码
    ↓
NextAuth CredentialsProvider
    ├── 演示账号 → 环境变量验证（仅开发环境）
    └── 普通用户 → Prisma 查询 → bcrypt 密码验证
    ↓
JWT Token 生成（30天有效期）
    ↓
Session 建立
    ↓
后续请求携带 Token
```

---

## 4. 功能模块详细需求

### 4.1 模块一：认证系统

#### 4.1.1 功能清单

| 功能 | 优先级 | 状态 | 描述 |
|------|--------|------|------|
| 邮箱密码登录 | P0 | ✅ 已实现 | 邮箱 + bcrypt 哈希密码验证 |
| 用户注册 | P0 | ✅ 已实现 | 姓名 + 邮箱 + 密码，Zod 验证 |
| 演示账号 | P0 | ✅ 已实现 | 开发环境专用，环境变量配置密码 |
| Google OAuth | P1 | ✅ 代码就绪 | 需配置 CLIENT_ID/SECRET |
| GitHub OAuth | P1 | ✅ 代码就绪 | 需配置 CLIENT_ID/SECRET |
| JWT 会话 | P0 | ✅ 已实现 | 30天有效期，含用户 ID 和角色 |
| 路由保护 | P0 | ✅ 已实现 | 未登录自动跳转登录页 |
| 密码重置 | P2 | ❌ 未实现 | 邮件发送重置链接 |
| 邮箱验证 | P2 | ❌ 未实现 | 注册后邮箱确认 |

#### 4.1.2 页面需求

**登录页** (`/auth/login`)
- 邮箱输入框（必填，邮箱格式验证）
- 密码输入框（必填，最少 6 字符）
- 登录按钮（带 loading 状态）
- 演示账号一键登录按钮（仅开发环境显示）
- Google 登录按钮
- GitHub 登录按钮
- "还没有账户？立即注册"链接
- 深色主题，居中卡片布局

**注册页** (`/auth/register`)
- 姓名输入框（必填，最少 2 字符）
- 邮箱输入框（必填，邮箱格式验证）
- 密码输入框（必填，最少 6 字符）
- 注册按钮（带 loading 状态）
- "已有账户？立即登录"链接
- 注册成功自动跳转登录页

#### 4.1.3 数据验证规则

```typescript
// 注册验证 (Zod Schema)
{
  name: z.string().min(2, '姓名至少需要2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
}

// 登录验证
{
  email: z.string().email(),
  password: z.string().min(1),
}
```

#### 4.1.4 演示账号

| 账号类型 | 邮箱 | 密码（环境变量） | 角色 |
|---------|------|-----------------|------|
| 演示用户 | demo@nexusdesign.app | NEXUS_DEMO_PASSWORD | USER |
| 管理员 | admin@nexusdesign.app | NEXUS_ADMIN_PASSWORD | ADMIN |

---

### 4.2 模块二：设计编辑器

#### 4.2.1 功能清单

| 功能 | 优先级 | 状态 | 描述 |
|------|--------|------|------|
| 可视化画布 | P0 | ✅ 已实现 | 网格背景，缩放，平移 |
| 双击添加元素 | P0 | ✅ 已实现 | 双击画布添加按钮元素 |
| 元素拖拽移动 | P0 | ✅ 已实现 | 左键拖拽移动元素位置 |
| 元素选择 | P0 | ✅ 已实现 | 点击选中，蓝色边框高亮 |
| 画布缩放 | P0 | ✅ 已实现 | 0.1x - 3x，滚轮/按钮控制 |
| 画布平移 | P0 | ✅ 已实现 | 中键/Ctrl+左键拖拽 |
| 键盘快捷键 | P0 | ✅ 已实现 | Ctrl+S/Z/Y, Delete |
| 属性编辑 | P0 | ✅ 已实现 | 样式/属性/布局三个标签页 |
| 组件库面板 | P0 | ✅ 已实现 | 7种基础组件 + 3种设备预设 |
| 撤销/重做 | P0 | ✅ 已实现 | 历史快照机制 |
| 元素复制 | P0 | ✅ 已实现 | 复制选中元素 |
| 元素删除 | P0 | ✅ 已实现 | Delete 键或面板按钮 |
| 层级调整 | P0 | ✅ 已实现 | 置顶/置底 |
| 自动保存 | P0 | ✅ 已实现 | 3秒防抖自动保存 |
| 手动保存 | P0 | ✅ 已实现 | Ctrl+S 快捷键 |
| 导出代码 | P0 | ✅ 已实现 | 导出 React TSX 代码 |
| 清空画布 | P1 | ✅ 已实现 | 确认对话框后清空 |
| 加载草稿 | P1 | ✅ 已实现 | 从数据库/本地存储加载 |
| 多选元素 | P1 | ❌ 未实现 | 框选或多点选择 |
| 对齐工具 | P1 | ❌ 未实现 | 左/右/上/下/居中对齐 |
| 标尺/参考线 | P2 | ❌ 未实现 | 精确定位辅助 |
| 图层面板 | P2 | ❌ 未实现 | 元素层级可视化管理 |

#### 4.2.2 画布引擎

**核心数据结构**

```typescript
interface CanvasState {
  width: number      // 画布宽度（默认 375px - iPhone）
  height: number     // 画布高度（默认 812px - iPhone）
  zoom: number       // 缩放比例（0.1 - 3.0）
  x: number          // 画布 X 偏移
  y: number          // 画布 Y 偏移
}

interface EditorElement {
  id: string         // 唯一标识 (element_timestamp_random)
  type: string       // 元素类型 (button/text/container/input/image/icon)
  x: number          // X 坐标
  y: number          // Y 坐标
  width: number      // 宽度
  height: number     // 高度
  props: any         // 元素属性（文本内容、placeholder 等）
  styles: any        // CSS 样式
  children?: EditorElement[]  // 子元素（容器类型）
}
```

**编辑器操作**

```typescript
interface EditorStore {
  // 元素操作
  addElement(element): string        // 添加元素，返回 ID
  updateElement(id, updates): void   // 更新元素属性
  deleteElement(id): void            // 删除元素
  selectElement(id, multi?): void    // 选中元素
  duplicateElement(id): void         // 复制元素
  bringToFront(id): void             // 置顶
  sendToBack(id): void               // 置底

  // 画布操作
  setCanvasSize(size): void          // 设置画布尺寸
  setZoom(zoom): void                // 设置缩放
  zoomIn(): void                     // 放大
  zoomOut(): void                    // 缩小

  // 历史操作
  saveHistory(action): void          // 保存快照
  undo(): void                       // 撤销
  redo(): void                       // 重做
  canUndo(): boolean                 // 是否可撤销
  canRedo(): boolean                 // 是否可重做

  // 项目操作
  saveProject(name?): Promise<void>  // 保存项目
  loadProject(name?): Promise<void>  // 加载项目
  clearCanvas(): void                // 清空画布
  exportState(): EditorState         // 导出状态
  importState(state): void           // 导入状态
}
```

#### 4.2.3 组件库

**基础组件列表**

| 组件 | 类型 | 默认尺寸 | 默认样式 |
|------|------|---------|---------|
| 按钮 (Button) | button | 120x40 | 主色背景，白色文字，8px 圆角 |
| 文本 (Text) | text | 200x30 | 白色文字，16px 字号 |
| 容器 (Container) | container | 200x150 | 深灰背景，8px 圆角，边框 |
| 卡片 (Card) | container | 280x180 | 深色背景，12px 圆角，阴影 |
| 输入框 (Input) | input | 240x40 | 深灰背景，边框，placeholder |
| 图片 (Image) | image | 200x200 | 深灰背景，居中对齐 |
| 图标 (Icon) | icon | 40x40 | 金色 |

**设备预设**

| 设备 | 宽度 | 高度 |
|------|------|------|
| iPhone 14 Pro | 393 | 852 |
| iPad | 768 | 1024 |
| Desktop | 1920 | 1080 |

#### 4.2.4 属性面板

**三个标签页**

1. **样式 (Style)**
   - 背景颜色（颜色选择器 + 文本输入）
   - 文字颜色
   - 字体大小
   - 内边距
   - 圆角
   - 显示文本

2. **属性 (Props)**
   - 元素类型（只读）
   - 元素 ID（只读）
   - 自定义属性列表（可编辑）

3. **布局 (Layout)**
   - X 坐标
   - Y 坐标
   - 宽度
   - 高度
   - 置顶/置底按钮

#### 4.2.5 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+S` | 保存项目 |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Y` | 重做 |
| `Delete` | 删除选中元素 |
| `双击画布` | 添加按钮元素 |
| `中键拖拽` | 平移画布 |
| `Ctrl+左键拖拽` | 平移画布 |

---

### 4.3 模块三：AI 设计生成

#### 4.3.1 功能清单

| 功能 | 优先级 | 状态 | 描述 |
|------|--------|------|------|
| 文本生成设计 | P0 | ✅ 已实现 | 自然语言描述 → JSON 设计元素 |
| 生成历史记录 | P0 | ✅ 已实现 | 保存每次生成的 prompt、结果、token 消耗 |
| Token 统计 | P0 | ✅ 已实现 | 记录每次调用的 token 数和成本 |
| 加载历史设计 | P0 | ✅ 已实现 | 从历史记录加载设计到画布 |
| 示例提示词 | P1 | ✅ 已实现 | 5个预设提示词供用户参考 |
| 提示技巧指导 | P1 | ✅ 已实现 | 如何写好提示词的建议 |
| 上下文记忆 | P2 | ❌ 未实现 | 基于最近对话优化生成 |
| 设计优化建议 | P2 | ❌ 未实现 | 分析现有设计并给出优化建议 |
| 多模型支持 | P2 | ❌ 未实现 | 支持 GPT-4/Claude/Gemini 切换 |
| 图像生成设计 | P3 | ❌ 未实现 | 上传截图生成对应设计 |

#### 4.3.2 AI 生成流程

```
用户输入描述文本
    ↓
前端验证（非空检查）
    ↓
POST /api/ai/generate
    ↓
NextAuth 验证用户身份
    ↓
查找用户记录
    ↓
构建 System Prompt + User Prompt
    ↓
调用 OpenAI API (deepseek-v3.2)
    ├── temperature: 0.7
    ├── max_tokens: 2000
    └── response_format: json_object
    ↓
解析 JSON 响应
    ↓
验证响应格式（elements 数组）
    ↓
计算 token 消耗和成本
    ↓
保存到 ai_generations 表
    ↓
返回设计数据给前端
    ↓
前端清空画布 → 加载生成的元素
    ↓
跳转到编辑器页面
```

#### 4.3.3 AI System Prompt

```
你是一个专业的 UI/UX 设计师和前端开发专家。
用户将描述他们想要的界面，你需要生成相应的设计元素和代码。

请以 JSON 格式返回，包含以下结构：
{
  "elements": [
    {
      "type": "button" | "text" | "container" | "input" | "image" | "icon",
      "x": number,
      "y": number,
      "width": number,
      "height": number,
      "props": {
        "text"?: string,
        "placeholder"?: string,
        "src"?: string
      },
      "styles": {
        "background"?: string,
        "color"?: string,
        "borderRadius"?: string,
        "fontSize"?: string,
        "padding"?: string
      }
    }
  ],
  "canvas": {
    "width": number,
    "height": number
  }
}

设计原则：
1. 使用现代设计风格，深色主题优先
2. 确保良好的视觉层次和间距
3. 使用专业的配色方案
4. 保持响应式布局考虑
5. 元素应该合理分布在画布上
```

#### 4.3.4 示例提示词

1. "创建一个现代化的登录页面，包含邮箱、密码输入框和登录按钮"
2. "设计一个电商产品卡片，包含图片、标题、价格和购买按钮"
3. "生成一个用户个人资料页面，包含头像、用户名和编辑按钮"
4. "创建一个仪表板，包含统计卡片、图表和最近活动列表"
5. "设计一个导航栏，包含 logo、菜单项和用户头像下拉菜单"

#### 4.3.5 成本计算

```typescript
// 当前计算方式
const cost = (tokensUsed / 1000) * 0.002  // 每 1000 tokens $0.002

// 配置
model: process.env.OPENAI_MODEL || 'deepseek-v3.2'
baseURL: process.env.OPENAI_BASE_URL || 'https://apis.iflow.cn/v1'
```

---

### 4.4 模块四：项目管理

#### 4.4.1 功能清单

| 功能 | 优先级 | 状态 | 描述 |
|------|--------|------|------|
| 项目创建 | P0 | ✅ 已实现 | 自动创建，名称默认"草稿项目" |
| 项目更新 | P0 | ✅ 已实现 | 保存时自动更新 |
| 项目列表 | P0 | ✅ 已实现 | API 支持，前端待完善 |
| 项目删除 | P1 | ❌ 未实现 | 软删除（设置 deletedAt） |
| 版本管理 | P1 | ❌ 未实现 | 保存版本快照，版本回溯 |
| 项目分享 | P2 | ❌ 未实现 | 生成分享链接 |
| 项目导入/导出 | P2 | ❌ 未实现 | JSON 格式导入导出 |
| 项目模板 | P2 | ❌ 未实现 | 从模板创建项目 |

#### 4.4.2 项目数据结构

```typescript
interface Project {
  id: string
  name: string              // 项目名称
  description?: string      // 项目描述
  ownerId: string           // 所有者 ID
  teamId?: string           // 所属团队 ID
  thumbnail?: string        // 缩略图 URL
  data?: {
    canvas: CanvasState     // 画布配置
    elements: EditorElement[]  // 设计元素
  }
  settings: {
    theme: 'dark' | 'light'
    devices: string[]
    plugins?: {
      aiAssistant?: boolean
      collaboration?: boolean
    }
  }
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### 4.4.3 保存策略

```
用户编辑操作
    ↓
3秒防抖定时器
    ↓
POST /api/projects
    ├── 检查 localStorage 是否有 projectId
    │   ├── 有 → 更新现有项目
    │   └── 无 → 创建新项目
    ↓
保存成功 → 更新 localStorage 中的 projectId
    ↓
同时保存到 localStorage 作为备份
    ↓
保存失败 → 降级保存到 localStorage
```

---

### 4.5 模块五：工作区

#### 4.5.1 功能清单

| 功能 | 优先级 | 状态 | 描述 |
|------|--------|------|------|
| 快速开始 | P0 | ✅ 已实现 | 跳转到 AI 生成页面 |
| 模板库入口 | P1 | ✅ UI 就绪 | 按钮展示，功能待实现 |
| 团队协作入口 | P1 | ✅ UI 就绪 | 按钮展示，功能待实现 |
| 最近项目列表 | P0 | ✅ UI 就绪 | API 已实现，前端待完善 |
| 项目搜索 | P1 | ❌ 未实现 | 关键词搜索项目 |
| 项目分类 | P2 | ❌ 未实现 | 按标签/日期分类 |
| 项目网格/列表视图 | P2 | ❌ 未实现 | 切换视图模式 |

---

### 4.6 模块六：代码导出

#### 4.6.1 功能清单

| 功能 | 优先级 | 状态 | 描述 |
|------|--------|------|------|
| React TSX 导出 | P0 | ✅ 已实现 | 生成带内联样式的 React 组件 |
| Vue SFC 导出 | P1 | ❌ 未实现 | 生成 Vue 单文件组件 |
| HTML/CSS 导出 | P1 | ❌ 未实现 | 生成原生 HTML + CSS |
| 小程序导出 | P2 | ❌ 未实现 | 生成微信小程序代码 |
| 代码预览 | P2 | ❌ 未实现 | 导出前预览代码 |
| 代码复制 | P2 | ❌ 未实现 | 一键复制到剪贴板 |
| 下载 ZIP 包 | P2 | ❌ 未实现 | 打包下载完整项目 |

#### 4.6.2 当前导出格式

```tsx
import React from 'react'

export default function GeneratedComponent() {
  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      background: '#111827'
    }}>
      <button style={{
        position: 'absolute',
        left: '20px',
        top: '100px',
        width: '335px',
        height: '48px',
        background: '#6366f1',
        color: '#ffffff',
        borderRadius: '8px',
        padding: '8px 16px'
      }}>开始使用</button>
    </div>
  )
}
```

---

## 5. 数据库模型

### 5.1 ER 图

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │────<│  Session │     │   Team   │
│          │     └──────────┘     │          │
│          │────<┌──────────┐     │          │
│          │     │TeamMember│>────│          │
│          │     └──────────┘     └──────────┘
│          │                              │
│          │────<┌──────────┐            │
│          │     │  Project │>───────────┘
│          │     │          │
│          │     │          │────<┌──────────┐
│          │     │          │     │  Version  │
│          │     │          │     └──────────┘
│          │     │          │────<┌──────────┐
│          │     │          │     │  Comment  │
│          │     │          │     └──────────┘
│          │     │          │────<┌──────────────┐
│          │     │          │     │AIGeneration  │
│          │     └──────────┘     └──────────────┘
│          │
│          │────<┌──────────────────────┐
│          │     │CollaborationSession  │
│          │     └──────────────────────┘
│          │
│          │────<┌──────────┐
│          │     │Component │
│          │     └──────────┘
│          │
│          │────<┌──────────┐
│          │     │   File   │
│          │     └──────────┘
│          │
│          │────<┌──────────┐
│          │     │ AuditLog │
│          │     └──────────┘
└──────────┘
```

### 5.2 核心模型定义

#### User（用户）

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatar        String?
  role          Role      @default(USER)
  password      String?
  emailVerified DateTime?

  // 关联关系
  teamMemberships  TeamMember[]
  ownedTeams       Team[]
  projectMemberships ProjectMember[]
  ownedProjects    Project[]
  aiGenerations    AIGeneration[]
  files            File[]
  sessions         Session[]
  collabSessions   CollaborationSession[]
  comments         Comment[]
  createdVersions  Version[]
  createdComponents Component[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  @@index([email])
  @@index([role])
  @@map("users")
}

enum Role {
  ADMIN
  USER
  GUEST
}
```

#### Project（项目）

```prisma
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  ownerId     String
  teamId      String?
  thumbnail   String?
  data        Json?           // { canvas, elements }
  settings    Json            // { theme, devices, plugins }
  isPublic    Boolean  @default(false)

  // 关联关系
  owner       User
  team        Team?
  members     ProjectMember[]
  versions    Version[]
  comments    Comment[]
  aiGenerations AIGeneration[]
  collabSessions CollaborationSession[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  @@index([ownerId])
  @@index([teamId])
  @@index([isPublic])
  @@map("projects")
}
```

#### AIGeneration（AI 生成记录）

```prisma
model AIGeneration {
  id           String   @id @default(cuid())
  userId       String
  projectId    String?
  prompt       String
  response     Json            // AI 原始返回
  model        String          // 使用的模型名称
  design       Json?           // 转换后的设计数据
  code         Json?           // 生成的代码
  tokensUsed   Int
  cost         Float           // 美元
  status       AIGenerationStatus @default(SUCCESS)
  errorMessage String?

  user         User
  project      Project?

  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([projectId])
  @@index([createdAt])
  @@map("ai_generations")
}

enum AIGenerationStatus {
  SUCCESS
  FAILED
  PENDING
}
```

#### Version（版本）

```prisma
model Version {
  id          String   @id @default(cuid())
  projectId   String
  version     Int      @default(1)
  name        String?
  data        Json            // 完整设计快照
  createdBy   String
  message     String?
  changes     Json?
  thumbnail   String?

  project     Project
  creator     User

  createdAt   DateTime @default(now())

  @@unique([projectId, version])
  @@index([projectId])
  @@map("versions")
}
```

### 5.3 完整模型列表

| 模型 | 表名 | 主要用途 |
|------|------|---------|
| User | users | 用户账户信息 |
| Session | sessions | 认证会话 |
| Team | teams | 团队组织 |
| TeamMember | team_members | 团队成员关系 |
| Project | projects | 设计项目 |
| ProjectMember | project_members | 项目成员关系 |
| Version | versions | 版本快照 |
| Component | components | 可复用组件 |
| AIGeneration | ai_generations | AI 调用记录 |
| CollaborationSession | collaboration_sessions | 实时协作会话 |
| Comment | comments | 评论（支持嵌套） |
| File | files | 文件存储 |
| AuditLog | audit_logs | 审计日志 |

---

## 6. API 接口规范

### 6.1 统一响应格式

```typescript
// 成功响应
{
  success: true,
  data: T,
  message?: string
}

// 错误响应
{
  success: false,
  error: string,
  details?: string  // 仅开发环境
}

// 分页响应
{
  success: true,
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### 6.2 认证接口

#### POST `/api/auth/register` - 用户注册

**请求体**
```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "password": "SecurePass123"
}
```

**成功响应** (201)
```json
{
  "message": "注册成功",
  "user": {
    "id": "clx123456789",
    "email": "zhangsan@example.com",
    "name": "张三",
    "role": "USER",
    "createdAt": "2025-12-17T10:30:00Z"
  }
}
```

**错误响应**
- 400: 验证失败（邮箱格式、密码长度、姓名长度）
- 400: 邮箱已存在
- 500: 服务器错误

#### POST `/api/auth/[...nextauth]` - NextAuth 认证

由 NextAuth.js 自动处理，支持：
- Credentials 登录（邮箱/密码）
- Google OAuth
- GitHub OAuth

### 6.3 项目接口

#### GET `/api/projects` - 获取项目列表

**请求头**
```
Authorization: Bearer <jwt-token>  // 由 NextAuth 自动处理 Cookie
```

**成功响应**
```json
{
  "success": true,
  "data": [
    {
      "id": "proj_123",
      "name": "草稿项目",
      "description": "",
      "owner": {
        "id": "user_123",
        "name": "张三",
        "email": "zhangsan@example.com"
      },
      "_count": {
        "versions": 3,
        "comments": 5
      },
      "createdAt": "2025-12-17T10:30:00Z",
      "updatedAt": "2025-12-17T11:00:00Z"
    }
  ]
}
```

#### POST `/api/projects` - 创建/更新项目

**请求体**
```json
{
  "id": "proj_123",          // 可选，有则更新，无则创建
  "name": "我的设计项目",
  "description": "项目描述",
  "data": {
    "canvas": { "width": 375, "height": 812, "zoom": 1 },
    "elements": [...]
  },
  "settings": {
    "theme": "dark",
    "devices": ["iphone-14-pro"]
  }
}
```

### 6.4 AI 接口

#### POST `/api/ai/generate` - AI 生成设计

**请求体**
```json
{
  "prompt": "创建一个现代化的登录页面",
  "projectId": "proj_123"    // 可选
}
```

**成功响应**
```json
{
  "success": true,
  "data": {
    "design": {
      "elements": [
        {
          "type": "container",
          "x": 0,
          "y": 0,
          "width": 375,
          "height": 812,
          "styles": { "background": "#111827" }
        },
        {
          "type": "text",
          "x": 20,
          "y": 100,
          "width": 335,
          "height": 40,
          "props": { "text": "欢迎登录" },
          "styles": { "color": "#ffffff", "fontSize": "24px" }
        }
      ],
      "canvas": { "width": 375, "height": 812 }
    },
    "metadata": {
      "tokensUsed": 1500,
      "cost": 0.003,
      "generationId": "gen_123"
    }
  }
}
```

#### GET `/api/ai/generate` - 获取 AI 生成历史

**查询参数**
- `projectId`: 按项目筛选（可选）
- `limit`: 返回数量（默认 10）
- `page`: 页码（默认 1）

---

## 7. UI/UX 设计规范

### 7.1 设计系统

#### 配色方案

```css
/* 深色主题（默认） */
--bg-dark: #050507          /* 页面背景 */
--bg-card: #131316          /* 卡片背景 */
--primary: #6366f1          /* 主色调 - 靛蓝色 */
--accent: #ec4899           /* 强调色 - 粉色 */
--text-main: #ffffff        /* 主文本 */
--text-muted: #9ca3af       /* 次要文本 */
--border: #1f2937           /* 边框颜色 */

/* 编辑器专用 */
--editor-bg: #111827        /* 编辑器背景 */
--editor-panel: #1f2937     /* 面板背景 */
--editor-border: #374151    /* 面板边框 */
--editor-hover: #4b5563     /* 悬停状态 */
--editor-selected: #3b82f6  /* 选中状态（蓝色） */
```

#### 字体

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

#### 圆角规范

| 元素 | 圆角 |
|------|------|
| 按钮 | 6px (rounded-md) |
| 卡片 | 12px (rounded-xl) |
| 输入框 | 6px (rounded-md) |
| 模态框 | 12px (rounded-xl) |
| 头像 | 50% (rounded-full) |

#### 阴影规范

```css
/* 卡片阴影 */
shadow-xl shadow-black/20

/* 按钮阴影 */
shadow-lg shadow-primary/20
```

### 7.2 页面布局规范

#### 首页布局

```
┌─────────────────────────────────────────┐
│           Hero Section                   │
│  ┌─────────────────────────────────┐    │
│  │      Nexus Design (标题)         │    │
│  │   统一设计平台 - AI驱动          │    │
│  │                                  │    │
│  │  [开始免费使用] [登录] [工作区]   │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│           Features Grid                  │
│  ┌────┐ ┌────┐ ┌────┐                  │
│  │ AI │ │多端│ │协作│                   │
│  └────┘ └────┘ └────┘                  │
│  ┌────┐ ┌────┐ ┌────┐                  │
│  │组件│ │原型│ │代码│                   │
│  └────┘ └────┘ └────┘                  │
├─────────────────────────────────────────┤
│           Demo Showcase                  │
│  ┌────┐ ┌────┐ ┌────┐                  │
│  │着陆│ │认证│ │工作│                   │
│  │页  │ │系统│ │区  │                   │
│  └────┘ └────┘ └────┘                  │
├─────────────────────────────────────────┤
│           CTA Section                    │
│  ┌─────────────────────────────────┐    │
│  │    准备好开始了吗？              │    │
│  │    [立即免费开始] [已有账户]     │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│           Footer                         │
│     Nexus Design © 2025                  │
└─────────────────────────────────────────┘
```

#### 编辑器布局

```
┌─────────────────────────────────────────────────────────┐
│  顶部工具栏 (56px)                                       │
│  [返回] [设计编辑器] [元素数] ... [AI] [导出] [保存] [用户] │
├──────────┬──────────────────────────┬──────────────────┤
│ 组件库    │       画布区域            │    属性面板       │
│ (256px)  │       (flex-1)           │    (288px)       │
│          │                          │                  │
│ 设备预设  │  ┌──────────────────┐   │  [样式][属性][布局]│
│ [iPhone] │  │                  │   │                  │
│ [iPad]   │  │   设计画布        │   │  背景颜色         │
│ [Desktop]│  │                  │   │  文字颜色         │
│          │  │   (网格背景)      │   │  字体大小         │
│ 基础组件  │  │                  │   │  圆角             │
│ [按钮]   │  │                  │   │  内边距           │
│ [文本]   │  └──────────────────┘   │                  │
│ [容器]   │                          │  [置顶][置底]     │
│ [卡片]   │  缩放: 100%              │                  │
│ [输入框] │  状态: 就绪              │  实时更新·自动保存 │
│ [图片]   │                          │                  │
│ [图标]   │                          │                  │
└──────────┴──────────────────────────┴──────────────────┘
```

### 7.3 组件规范

#### Button 组件

```typescript
// 变体
variant: 'default' | 'primary' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'

// 尺寸
size: 'default' | 'sm' | 'lg' | 'icon'

// 状态
disabled: boolean
loading: boolean  // 显示旋转图标 + 半透明
```

#### Card 组件

```typescript
// 子组件
Card           // 容器
CardHeader     // 头部区域
CardTitle      // 标题（渐变文字）
CardDescription // 描述（灰色文字）
CardContent    // 内容区域
CardFooter     // 底部区域
```

---

## 8. 技术实现状态

### 8.1 代码文件清单

| 模块 | 文件路径 | 行数 | 状态 |
|------|---------|------|------|
| **首页** | `app/page.tsx` | 235 | ✅ 完整 |
| **根布局** | `app/layout.tsx` | 62 | ✅ 完整 |
| **登录页** | `app/auth/login/page.tsx` | 28 | ✅ 完整 |
| **注册页** | `app/auth/register/page.tsx` | 30 | ✅ 完整 |
| **认证表单** | `app/auth/components/auth-form.tsx` | 221 | ✅ 完整 |
| **工作区** | `app/workspace/page.tsx` | 132 | ✅ 基础框架 |
| **编辑器** | `app/design/editor/page.tsx` | 354 | ✅ 完整 |
| **AI 页面** | `app/design/ai/page.tsx` | 336 | ✅ 完整 |
| **画布** | `app/components/editor/canvas.tsx` | 352 | ✅ 完整 |
| **组件库** | `app/components/editor/component-library.tsx` | 297 | ✅ 完整 |
| **属性面板** | `app/components/editor/properties-panel.tsx` | 398 | ✅ 完整 |
| **按钮组件** | `app/components/ui/button.tsx` | 62 | ✅ 完整 |
| **卡片组件** | `app/components/ui/card.tsx` | 79 | ✅ 完整 |
| **Toast 组件** | `app/components/shared/toast.tsx` | - | ✅ 完整 |
| **Provider** | `app/providers/index.tsx` | 65 | ✅ 完整 |
| **编辑器 Store** | `app/stores/editor.ts` | 432 | ✅ 完整 |
| **UI Store** | `app/stores/ui.ts` | 112 | ✅ 完整 |
| **NextAuth 配置** | `app/lib/auth.ts` | 161 | ✅ 完整 |
| **Prisma 客户端** | `app/lib/db.ts` | 11 | ✅ 完整 |
| **工具函数** | `app/lib/utils.ts` | 245 | ✅ 完整 |
| **类型定义** | `app/types/index.ts` | 415 | ✅ 完整 |
| **注册 API** | `app/api/auth/register/route.ts` | 70 | ✅ 完整 |
| **项目 API** | `app/api/projects/route.ts` | 147 | ✅ 完整 |
| **AI API** | `app/api/ai/generate/route.ts` | 196 | ✅ 完整 |
| **种子数据** | `prisma/seed.ts` | 103 | ✅ 完整 |
| **Prisma Schema** | `prisma/schema.prisma` | 382 | ✅ 完整 |

**总计**：约 4,400 行 TypeScript/TSX 代码

### 8.2 依赖清单

#### 生产依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| next | 16.0.10 | React 框架 |
| react | 18.2.0 | UI 库 |
| react-dom | 18.2.0 | React DOM |
| next-auth | 4.24.5 | 认证系统 |
| @prisma/client | 5.8.0 | 数据库 ORM |
| prisma | 5.8.0 | 数据库工具 |
| openai | 4.24.0 | AI API 客户端 |
| zustand | 4.4.7 | 状态管理 |
| tailwindcss | 3.4.0 | CSS 框架 |
| zod | 3.22.4 | 数据验证 |
| bcryptjs | 3.0.3 | 密码哈希 |
| ioredis | 5.3.2 | Redis 客户端 |
| socket.io-client | 4.7.2 | WebSocket 客户端 |
| lucide-react | 0.561.0 | 图标库 |
| class-variance-authority | 0.7.0 | 组件变体 |
| clsx | 2.1.0 | 类名合并 |
| tailwind-merge | 2.2.0 | Tailwind 类名合并 |
| next-themes | 0.4.6 | 主题切换 |

#### 开发依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| typescript | 5.3.3 | 类型系统 |
| eslint | 8.56.0 | 代码检查 |
| prettier | 3.2.0 | 代码格式化 |
| vitest | 1.2.0 | 单元测试 |
| playwright | 1.41.0 | E2E 测试 |
| @testing-library/react | 14.1.0 | React 测试工具 |
| ts-node | 10.9.2 | TypeScript 运行时 |

### 8.3 环境变量

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `DATABASE_URL` | ✅ | - | PostgreSQL 连接字符串 |
| `NEXTAUTH_URL` | ✅ | http://localhost:3000 | NextAuth 回调 URL |
| `NEXTAUTH_SECRET` | ✅ | - | JWT 签名密钥 |
| `NEXUS_DEMO_PASSWORD` | ❌ | demo123_secure | 演示账号密码 |
| `NEXUS_ADMIN_PASSWORD` | ❌ | admin123_secure | 管理员密码 |
| `OPENAI_API_KEY` | ❌ | - | OpenAI API 密钥 |
| `OPENAI_BASE_URL` | ❌ | https://apis.iflow.cn/v1 | API 基础 URL |
| `OPENAI_MODEL` | ❌ | deepseek-v3.2 | AI 模型名称 |
| `GOOGLE_CLIENT_ID` | ❌ | - | Google OAuth ID |
| `GOOGLE_CLIENT_SECRET` | ❌ | - | Google OAuth Secret |
| `GITHUB_CLIENT_ID` | ❌ | - | GitHub OAuth ID |
| `GITHUB_CLIENT_SECRET` | ❌ | - | GitHub OAuth Secret |
| `REDIS_URL` | ❌ | - | Redis 连接字符串 |

---

## 9. 非功能性需求

### 9.1 性能要求

| 指标 | 目标值 | 测量方式 |
|------|--------|---------|
| 首屏加载时间 | < 2s | Lighthouse |
| 交互响应时间 | < 100ms | Performance API |
| 画布渲染帧率 | 60fps | Chrome DevTools |
| AI 生成时间 | < 5s | API 响应时间 |
| 保存操作时间 | < 1s | API 响应时间 |

### 9.2 安全要求

| 要求 | 实现方式 | 状态 |
|------|---------|------|
| 密码存储 | bcrypt 哈希（12 轮） | ✅ |
| 认证机制 | JWT（30天有效期） | ✅ |
| 输入验证 | Zod Schema | ✅ |
| SQL 注入防护 | Prisma ORM 参数化查询 | ✅ |
| XSS 防护 | React 自动转义 | ✅ |
| CSRF 防护 | NextAuth 内置 | ✅ |
| 速率限制 | 待实现 | ❌ |
| HTTPS | 生产环境强制 | 待配置 |

### 9.3 可用性要求

| 要求 | 描述 |
|------|------|
| 浏览器支持 | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| 响应式设计 | 支持 1024px+ 宽度的桌面端 |
| 可访问性 | WCAG 2.1 AA 级别（规划中） |
| 国际化 | 中文优先，英文支持（规划中） |

### 9.4 可扩展性要求

| 阶段 | 用户规模 | 技术方案 |
|------|---------|---------|
| MVP | 1,000 | 单实例 + PostgreSQL |
| Phase 2 | 10,000 | 多实例 + Redis + 读写分离 |
| Phase 3 | 100,000 | 微服务 + CDN + 队列 |
| Phase 4 | 1,000,000+ | K8s + 分布式数据库 |

---

## 10. 产品路线图

### Phase 1: MVP（当前阶段）

**目标**：核心设计功能 + 基础 AI 生成

| 任务 | 优先级 | 状态 | 预估工时 |
|------|--------|------|---------|
| 认证系统（登录/注册） | P0 | ✅ 完成 | 3天 |
| 设计编辑器核心 | P0 | ✅ 完成 | 5天 |
| AI 生成基础功能 | P0 | ✅ 完成 | 3天 |
| 项目保存/加载 | P0 | ✅ 完成 | 2天 |
| 代码导出（React） | P0 | ✅ 完成 | 1天 |
| 工作区首页 | P0 | ✅ 完成 | 1天 |
| 数据库 Schema | P0 | ✅ 完成 | 2天 |
| 种子数据 | P0 | ✅ 完成 | 0.5天 |
| **MVP 总计** | | | **~17.5天** |

### Phase 2: 协作增强

**目标**：实时协作 + 团队功能

| 任务 | 优先级 | 预估工时 |
|------|--------|---------|
| WebSocket 实时同步 | P0 | 5天 |
| 光标追踪 | P0 | 2天 |
| 版本管理系统 | P1 | 3天 |
| 评论/标注系统 | P1 | 3天 |
| 团队管理 | P1 | 3天 |
| 项目分享链接 | P2 | 2天 |
| **Phase 2 总计** | | **~18天** |

### Phase 3: AI 深度集成

**目标**：高级 AI 功能 + 智能化

| 任务 | 优先级 | 预估工时 |
|------|--------|---------|
| 多模型支持（GPT-4/Claude） | P1 | 3天 |
| 上下文记忆优化 | P1 | 3天 |
| 设计优化建议 | P1 | 3天 |
| 图像生成设计 | P2 | 5天 |
| 代码多框架导出 | P1 | 5天 |
| AI 使用量限制 | P1 | 2天 |
| **Phase 3 总计** | | **~21天** |

### Phase 4: 企业级扩展

**目标**：企业部署 + 生态建设

| 任务 | 优先级 | 预估工时 |
|------|--------|---------|
| Docker 容器化 | P0 | 3天 |
| K8s 部署方案 | P1 | 5天 |
| 插件系统 | P2 | 10天 |
| 开放 API 平台 | P2 | 5天 |
| SSO 集成 | P2 | 3天 |
| 审计日志 | P2 | 2天 |
| **Phase 4 总计** | | **~28天** |

---

## 11. 风险与约束

### 11.1 技术风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| AI API 不稳定 | 生成失败 | 中 | 多模型降级、重试机制 |
| 画布性能瓶颈 | 大量元素卡顿 | 中 | 虚拟化渲染、Web Worker |
| 数据库连接池耗尽 | 服务不可用 | 低 | PgBouncer、连接池配置 |
| WebSocket 内存泄漏 | 服务崩溃 | 中 | 心跳检测、自动断开 |

### 11.2 产品风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| AI 生成质量不稳定 | 用户体验差 | 高 | Prompt 优化、人工审核 |
| 与 Figma 竞争 | 市场份额 | 中 | 差异化定位（AI+代码） |
| 用户学习成本 | 采用率低 | 中 | 引导教程、模板库 |
| 数据安全问题 | 信任危机 | 低 | 加密、权限控制、审计 |

### 11.3 约束条件

| 约束 | 描述 |
|------|------|
| AI API 成本 | 每次生成约 $0.002-0.01，需控制调用频率 |
| 浏览器兼容性 | Canvas API 限制旧浏览器支持 |
| 文件大小限制 | 上传文件需限制大小（建议 10MB） |
| 并发用户数 | MVP 阶段单实例支持约 100 并发 |

---

## 12. 附录

### 12.1 术语表

| 术语 | 定义 |
|------|------|
| 设计即代码 | Design-to-Code，设计直接转换为代码的工作流 |
| 画布 | Canvas，设计编辑的主工作区域 |
| 元素 | Element，画布上的可编辑对象（按钮、文本等） |
| 组件库 | Component Library，可复用的 UI 组件集合 |
| 属性面板 | Properties Panel，编辑选中元素属性的面板 |
| 版本快照 | Version Snapshot，项目某一时刻的完整状态 |
| Prompt | 提示词，用户输入给 AI 的自然语言描述 |

### 12.2 参考文档

| 文档 | 路径 |
|------|------|
| 项目概览 | `docs/OVERVIEW.md` |
| 技术架构 | `docs/ARCHITECTURE.md` |
| API 文档 | `docs/API.md` |
| 数据库设计 | `docs/DATABASE.md` |
| 开发指南 | `docs/DEVELOPMENT.md` |
| 部署文档 | `docs/DEPLOYMENT.md` |
| 安全指南 | `SECURITY.md` |

### 12.3 演示文件

| 文件 | 路径 | 用途 |
|------|------|------|
| 产品着陆页 | `demo/landing.html` | UI 设计参考 |
| 设计工作区 | `demo/workspace.html` | 交互规范参考 |

### 12.4 测试账号

| 角色 | 邮箱 | 密码环境变量 |
|------|------|-------------|
| 演示用户 | demo@nexusdesign.app | NEXUS_DEMO_PASSWORD |
| 管理员 | admin@nexusdesign.app | NEXUS_ADMIN_PASSWORD |

---

**文档维护者**：产品团队  
**审阅周期**：每两周更新一次  
**下一版本**：v1.1.0（Phase 2 功能需求）
