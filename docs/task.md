# Nexus Design - 升级改造任务规划

**创建日期**：2025-12-17
**任务来源**：基于 PRD v1.0.0 与代码审查结果
**总目标**：将现有原型升级为可运行、可测试、可部署的 MVP 产品

---

## 任务总览

| 阶段 | 目标 | 任务数 | 优先级 |
|------|------|--------|--------|
| Phase 0 | 环境就绪，项目能跑起来 | 5 | P0 |
| Phase 1 | 修复致命 Bug，核心链路可用 | 8 | P0 |
| Phase 2 | 类型安全，消灭 any | 7 | P0 |
| Phase 3 | 错误处理与用户体验 | 10 | P1 |
| Phase 4 | 功能补全与增强 | 12 | P1 |
| Phase 5 | 测试与生产就绪 | 10 | P2 |
| **合计** | | **52** | |

---

## Phase 0：环境就绪

**目标**：项目能在本地成功运行
**前置条件**：Node.js 18.18+, PostgreSQL 15+

### 0.1 依赖安装与环境配置

- [x] 安装项目依赖：`npm install`
- [x] 复制环境变量模板：`cp .env.example .env`
- [x] 配置 `DATABASE_URL`（PostgreSQL 连接字符串）
- [x] 配置 `NEXTAUTH_SECRET`（`openssl rand -base64 32` 生成）
- [x] 配置 `NEXUS_DEMO_PASSWORD` 和 `NEXUS_ADMIN_PASSWORD`

### 0.2 数据库初始化

- [x] 运行 Prisma 生成客户端：`npx prisma generate`
- [x] 执行数据库迁移：`npx prisma db push`
- [x] 填充种子数据：`npx prisma db seed`
- [x] 验证数据库连接：访问 `/api/admin/db-test`

### 0.3 项目启动验证

- [x] 启动开发服务器：`npm run dev`
- [x] 访问 `http://localhost:3000` 确认首页加载
- [ ] 使用演示账号登录：`demo@nexusdesign.app` / 配置的密码
- [x] 进入工作区页面确认路由正常

---

## Phase 1：修复致命 Bug

**目标**：所有已实现页面都能正常运行，无运行时报错
**前置条件**：Phase 0 完成

### 1.1 修复 AI 页面缺失导入（致命）

**文件**：`apps/web/app/design/ai/page.tsx`
**问题**：8 个变量使用但未导入，页面完全无法运行

- [x] 导入 `useRouter` from `next/navigation`
- [x] 导入 `cn` from `@/lib/utils`
- [x] 导入 `ArrowLeft`, `Zap`, `Wand2` from `lucide-react`
- [x] 声明 `activeTab` / `setActiveTab` state：`const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate')`
- [x] 从 `useEditorStore` 解构 `setCanvasSize`（当前只导入了 `addElement`）
- [x] 声明 `router`：`const router = useRouter()`
- [x] 修复 `loadHistory` 函数中缺少的 `useEffect` 调用（页面加载时自动获取历史）
- [x] 验证页面可正常渲染和交互

### 1.2 修复 workspace 页面 Metadata 冲突

**文件**：`apps/web/app/workspace/page.tsx`
**问题**：`'use client'` 组件中导出 `Metadata`，在 Next.js 中无效

- [x] 删除 `import { Metadata } from 'next'`
- [x] 删除 `export const metadata: Metadata = { ... }` 整块
- [x] 将页面标题改为在 `layout.tsx` 中统一配置，或用 `useEffect` + `document.title` 设置

### 1.3 修复登录页 `'use client'` 位置

**文件**：`apps/web/app/auth/login/page.tsx`
**问题**：`'use client'` 在 import 语句之后（应为第一行）

- [x] 将 `'use client'` 移到文件第一行（import 之前）
- [x] 同步修复 `apps/web/app/auth/register/page.tsx`（相同问题）

### 1.4 修复注册页 Metadata 无效

**文件**：`apps/web/app/auth/register/page.tsx`

- [x] 确认 `'use client'` 在文件首行
- [x] 删除无效的 Metadata 导入（如有）

### 1.5 清理未使用的导入

**文件**：`apps/web/app/design/editor/page.tsx`

- [x] 删除未使用的 `Users` 导入：`import { ..., Users, ... }` → 移除 `Users`

**全局扫描**：

- [x] 运行 `npx eslint apps/ --rule '{"no-unused-vars": "warn"}'` 检查所有未使用导入
- [x] 逐一清理所有未使用的 import

### 1.6 修复编辑器页面的导出逻辑

**文件**：`apps/web/app/design/editor/page.tsx`
**问题**：`generateReactCode` 函数在组件内部定义但未被正确引用

- [x] 确认 `handleExport` 函数能正确调用 `generateReactCode()`
- [x] 验证点击"导出"按钮能下载 `.tsx` 文件

### 1.7 修复 Provider 重复套娃

**文件**：`apps/web/app/layout.tsx`, `apps/web/app/providers/index.tsx`

- [x] 在 `layout.tsx` 中引入 `AppProvider` 包裹 `{children}`
- [x] 从 `auth/login/page.tsx` 中移除独立的 `SessionProvider` + `ThemeProvider` 包裹
- [x] 从 `auth/register/page.tsx` 中移除独立的包裹
- [x] 从 `workspace/page.tsx` 中移除独立的包裹
- [x] 从 `design/editor/page.tsx` 中移除独立的包裹
- [x] 从 `design/ai/page.tsx` 中移除独立的包裹
- [x] 验证所有页面的主题和会话状态正常工作

### 1.8 验证核心链路

- [ ] 首页 → 点击"开始免费使用" → 注册页 → 注册新用户 → 跳转登录页
- [ ] 登录页 → 输入邮箱密码 → 登录成功 → 跳转工作区
- [ ] 工作区 → 点击"快速开始" → 跳转 AI 页面
- [ ] AI 页面 → 输入提示词 → 点击生成 → 等待返回 → 自动跳转编辑器
- [ ] 编辑器 → 画布上有 AI 生成的元素 → 可拖拽/选中/编辑
- [ ] 编辑器 → Ctrl+S 保存 → 刷新页面 → 加载草稿恢复

---

## Phase 2：类型安全

**目标**：消灭所有 `any`，建立完整的 TypeScript 类型体系
**前置条件**：Phase 1 完成

### 2.1 定义核心数据类型

**文件**：`apps/web/app/types/index.ts`

- [x] 定义 `CanvasData` 类型替换 `Project.data: any`
- [x] 定义 `DesignSnapshot` 类型替换 `Version.data: any`
- [x] 定义 `ChangeRecord` 类型替换 `Version.changes: any`
- [x] 定义 `ComponentPropsData` 接口替换 `Component.props: any`
- [x] 定义 `ComponentStylesData` 接口替换 `Component.styles: any`
- [x] 定义 `ComponentEventsData` 类型替换 `Component.events: any`
- [x] 定义 `AIResponseData` 类型替换 `AIGeneration.response: any`
- [x] 定义 `DesignOutput` 类型替换 `AIGeneration.design: any`
- [x] 定义 `CodeOutput` 类型替换 `AIGeneration.code: any`
- [x] 定义 `WebSocketPayload` 类型替换 `WebSocketEvent.payload: any`
- [x] 定义 `TemplateData` 类型替换 `Template.data: any`

### 2.2 修复编辑器组件类型

**文件**：`apps/web/app/components/editor/canvas.tsx`

- [x] 将 `onElementAdd?: (element: any) => void` 改为 `onElementAdd?: (element: EditorElement) => void`
- [x] 将 `element: any` 参数改为 `element: EditorElement`
- [x] 导入 `EditorElement` 类型

**文件**：`apps/web/app/components/editor/properties-panel.tsx`

- [x] 将 `handleUpdate` 的 `value: any` 改为 `value: string | number`
- [x] 将 `selectedElement` 的隐式 `any` 改为 `EditorElement | undefined`

### 2.3 修复 AI 页面类型

**文件**：`apps/web/app/design/ai/page.tsx`

- [x] 将 `AIHistory.result: any` 改为 `result: DesignOutput`
- [x] 将 `loadDesign(design: any)` 改为 `loadDesign(design: DesignOutput)`
- [x] 将 `element: any` 回调改为 `element: EditorElement`

### 2.4 修复 Store 类型

**文件**：`apps/web/app/stores/editor.ts`

- [x] 确认 `addElement` 参数类型为 `Omit<EditorElement, 'id'>`（当前已正确）
- [x] 确认 `updateElement` 的 `updates` 类型为 `Partial<EditorElement>`（当前已正确）
- [x] 检查 `saveProject` 和 `loadProject` 中 `projectData` 的类型

### 2.5 修复工具函数类型

**文件**：`apps/web/app/lib/utils.ts`

- [x] 将 `debounce` 的 `(...args: any[]) => any` 改为泛型约束
- [x] 将 `throttle` 的 `(...args: any[]) => any` 改为泛型约束
- [x] 将 `deepMerge` 的 `Record<string, any>` 改为 `Record<string, unknown>`

### 2.6 修复 API 路由类型

**文件**：`apps/web/app/api/projects/route.ts`

- [x] 为请求体定义 `CreateProjectInput` 接口
- [x] 为响应定义明确的类型

**文件**：`apps/web/app/api/ai/generate/route.ts`

- [x] 为请求体定义 `AIGenerateInput` 接口
- [x] 为 OpenAI 响应定义类型

### 2.7 启用严格模式

**文件**：`apps/web/tsconfig.json`

- [x] 确认 `"strict": true` 已开启
- [x] 确认 `"noImplicitAny": true` 已开启
- [x] 运行 `npx tsc --noEmit` 确认零类型错误

---

## Phase 3：错误处理与用户体验

**目标**：用户操作有反馈，错误有兜底，页面有加载态
**前置条件**：Phase 2 完成

### 3.1 添加全局错误边界

- [x] 创建 `apps/web/app/error.tsx` — 页面级错误捕获组件
- [x] 创建 `apps/web/app/global-error.tsx` — 根布局级错误捕获
- [x] 创建 `apps/web/app/not-found.tsx` — 自定义 404 页面
- [x] 创建 `apps/web/app/loading.tsx` — 全局加载骨架屏
- [x] 创建 `apps/web/app/workspace/loading.tsx` — 工作区加载态
- [x] 创建 `apps/web/app/design/loading.tsx` — 编辑器加载态

### 3.2 统一 API 错误处理

- [x] 创建 `apps/web/app/lib/api-error.ts` — API 错误工具函数
- [x] 重构 `api/auth/register/route.ts` 使用统一错误处理
- [x] 重构 `api/projects/route.ts` 使用统一错误处理
- [x] 重构 `api/ai/generate/route.ts` 使用统一错误处理

### 3.3 改进保存反馈机制

**文件**：`apps/web/app/stores/editor.ts`

- [x] 当数据库保存失败时，显示 toast 提示"云端保存失败，已暂存本地"
- [x] 当数据库保存成功时，显示 toast 提示"已保存到云端"
- [x] 添加保存状态指示器（顶部工具栏显示"已保存"/"保存中"/"未保存"）

### 3.4 改进 AI 生成错误提示

**文件**：`apps/web/app/design/ai/page.tsx`

- [x] API 返回 401 时，提示"请先登录"并跳转登录页
- [x] API 返回 429 时，提示"请求过于频繁，请稍后再试"
- [x] API 返回 500 时，提示"AI 服务暂时不可用，请稍后重试"
- [x] 网络错误时，提示"网络连接失败，请检查网络"
- [x] 生成过程中禁用输入框和按钮，防止重复提交

### 3.5 改进认证错误提示

**文件**：`apps/web/app/auth/components/auth-form.tsx`

- [x] 登录失败时区分提示："邮箱或密码错误"（而非通用的"登录失败"）
- [x] 注册失败时区分提示："该邮箱已被注册"（已有，确认生效）
- [x] 网络错误时提示"网络连接失败"
- [x] 按钮 loading 状态下禁止重复点击（当前已实现，确认生效）

### 3.6 添加表单验证反馈

**文件**：`apps/web/app/auth/components/auth-form.tsx`

- [x] 邮箱格式错误时，输入框下方显示红色提示
- [x] 密码长度不足时，输入框下方显示红色提示
- [x] 姓名长度不足时，输入框下方显示红色提示
- [x] 使用 Zod 的实时验证（onChange 触发）

### 3.7 添加页面过渡动画

- [x] 页面切换时添加淡入效果（使用 Tailwind `animate-fadeIn`）
- [x] 模态框/弹窗添加出现/消失动画
- [x] Toast 通知添加滑入/滑出动画

### 3.8 改进编辑器空状态

**文件**：`apps/web/app/components/editor/canvas.tsx`

- [x] 画布为空时显示引导提示："双击添加元素，或从左侧组件库选择"
- [x] 添加"从 AI 生成"快捷按钮
- [x] 添加"加载示例项目"快捷按钮

### 3.9 改进工作区空状态

**文件**：`apps/web/app/workspace/page.tsx`

- [x] "最近项目"为空时显示引导卡片
- [x] 添加"创建第一个项目"的 CTA 按钮
- [x] 添加新手引导提示（3 步引导流程）

### 3.10 移除生产环境 console 语句

- [x] 将 `api/ai/generate/route.ts` 中的 `console.error` 替换为结构化日志或 Sentry
- [x] 将 `api/auth/register/route.ts` 中的 `console.error` 替换
- [x] 将 `stores/editor.ts` 中的 `console.error` 替换为 toast 通知
- [x] 将 `design/ai/page.tsx` 中的 `console.error` 替换为 toast 通知
- [x] 保留 `prisma/seed.ts` 中的 `console.log`（种子脚本需要终端输出）
- [x] 保留 `lib/auth.ts` 中的 `console.error`（认证错误需要服务端日志）

---

## Phase 4：功能补全与增强

**目标**：核心功能完整可用，用户体验流畅
**前置条件**：Phase 3 完成

### 4.1 工作区项目列表

**文件**：`apps/web/app/workspace/page.tsx`

- [x] 调用 `GET /api/projects` 获取当前用户的项目列表
- [x] 渲染项目卡片列表（名称、缩略图、最后更新时间、元素数量）
- [x] 点击项目卡片跳转到编辑器并加载项目
- [x] 添加项目删除功能（确认对话框 + 软删除）
- [x] 添加项目搜索功能（关键词过滤）
- [x] 添加项目排序功能（按更新时间/名称）

### 4.2 编辑器组件库增强

**文件**：`apps/web/app/components/editor/component-library.tsx`

- [x] 添加更多基础组件：导航栏、标签栏、列表、分割线、开关
- [x] 添加移动组件分类：状态栏、底部导航、浮动按钮
- [x] 添加组件搜索功能
- [x] 实现拖拽添加（当前只有点击添加）
- [x] 添加自定义组件保存功能

### 4.3 编辑器画布增强

**文件**：`apps/web/app/components/editor/canvas.tsx`

- [x] 添加元素边界检测（防止拖出画布）
- [x] 添加网格吸附功能（拖拽时自动对齐网格）
- [x] 添加多选功能（Shift+点击 或 框选）
- [x] 添加元素对齐工具（左/右/上/下/水平居中/垂直居中）
- [x] 添加参考线/标尺
- [x] 支持鼠标滚轮缩放（当前只有按钮缩放）

### 4.4 属性面板增强

**文件**：`apps/web/app/components/editor/properties-panel.tsx`

- [x] 添加字体粗细（fontWeight）编辑
- [x] 添加边框样式编辑（borderWidth, borderColor, borderStyle）
- [x] 添加阴影编辑（boxShadow）
- [x] 添加透明度编辑（opacity）
- [x] 添加渐变背景编辑
- [x] 添加图片 src 属性编辑（图片类型元素）

### 4.5 代码导出增强

**文件**：`apps/web/app/design/editor/page.tsx`

- [x] 重写 `generateReactCode` 生成 Tailwind CSS 类名（而非内联 style）
- [x] 生成可运行的独立组件文件（包含 import 语句）
- [x] 添加代码预览弹窗（导出前可查看代码）
- [x] 添加代码复制到剪贴板功能
- [x] 添加 Vue SFC 导出选项
- [x] 添加 HTML/CSS 导出选项

### 4.6 版本管理

**文件**：新建 `apps/web/app/api/projects/[id]/versions/route.ts`

- [x] 创建版本保存 API（POST）
- [x] 创建版本列表 API（GET）
- [x] 创建版本详情 API（GET）
- [x] 在编辑器工具栏添加"保存版本"按钮
- [x] 添加版本历史侧边栏（显示版本列表、时间、描述）
- [x] 实现版本回滚功能（加载历史版本到画布）

### 4.7 项目设置

- [x] 创建 `apps/web/app/design/settings/page.tsx` 项目设置页面
- [x] 编辑项目名称和描述
- [x] 切换画布尺寸（设备预设 / 自定义）
- [x] 切换主题（dark / light）
- [x] 项目删除（二次确认）

### 4.8 用户设置

- [x] 创建 `apps/web/app/settings/page.tsx` 用户设置页面
- [x] 编辑用户名称和头像
- [x] 修改密码（当前密码 + 新密码确认）
- [x] AI 使用量统计展示（调用次数、token 消耗、成本）

### 4.9 AI 生成功能增强

**文件**：`apps/web/app/api/ai/generate/route.ts`

- [x] 添加生成限制（每用户每日上限，从环境变量读取）
- [x] 添加上下文记忆（发送最近 3 次生成记录作为上下文）
- [x] 支持指定画布尺寸生成（用户可选 iPhone/iPad/Desktop）
- [x] 支持指定风格生成（现代/简约/科技/可爱）

**文件**：`apps/web/app/design/ai/page.tsx`

- [x] 添加风格选择器
- [x] 添加设备尺寸选择器
- [x] 生成结果预览（缩略图）
- [x] 支持"在当前设计基础上优化"（非清空重来）

### 4.10 导航栏重构

- [x] 创建 `apps/web/app/components/shared/navbar.tsx` 全局导航栏
- [x] 包含 Logo、导航链接、用户头像下拉菜单
- [x] 工作区和 AI 页面共用导航栏
- [x] 响应式适配（移动端汉堡菜单）

### 4.11 侧边栏导航

- [x] 创建 `apps/web/app/components/shared/sidebar.tsx` 工作区侧边栏
- [x] 包含：项目列表、团队、模板库、设置
- [x] 收起/展开功能
- [x] 当前页面高亮

### 4.12 首页改版

**文件**：`apps/web/app/page.tsx`

- [x] 添加产品功能截图/动画展示
- [x] 添加客户评价/使用案例
- [x] 添加定价方案展示（免费/专业/企业）
- [x] 添加 FAQ 折叠面板
- [x] 添加底部导航链接（文档、博客、GitHub）

---

## Phase 5：测试与生产就绪

**目标**：代码有测试覆盖，可安全部署到生产环境
**前置条件**：Phase 4 完成

### 5.1 单元测试

- [x] 创建 `apps/web/app/lib/__tests__/utils.test.ts` — 工具函数测试
  - `cn()` 类名合并
  - `formatDate()` / `formatTime()` / `formatRelativeTime()`
  - `generateId()` 唯一性
  - `debounce()` / `throttle()` 行为
  - `isValidEmail()` 边界情况
  - `checkPasswordStrength()` 评分逻辑
- [x] 创建 `apps/web/app/stores/__tests__/editor.test.ts` — 编辑器 Store 测试
  - `addElement` / `updateElement` / `deleteElement`
  - `undo` / `redo` 行为
  - `clearCanvas` 重置状态
- [x] 创建 `apps/web/app/stores/__tests__/ui.test.ts` — UI Store 测试
  - `toggleTheme` 切换
  - `showToast` / `clearToast`

### 5.2 组件测试

- [x] 创建 `apps/web/app/components/ui/__tests__/button.test.tsx`
  - 渲染、点击、disabled、loading 状态
- [x] 创建 `apps/web/app/components/ui/__tests__/card.test.tsx`
  - 子组件渲染
- [x] 创建 `apps/web/app/auth/components/__tests__/auth-form.test.tsx`
  - 登录表单渲染、提交、错误提示
  - 注册表单渲染、提交、错误提示

### 5.3 API 测试

- [x] 创建 `apps/web/app/api/auth/__tests__/register.test.ts`
  - 正常注册
  - 重复邮箱
  - 验证失败
- [x] 创建 `apps/web/app/api/projects/__tests__/route.test.ts`
  - 未授权访问
  - 创建项目
  - 获取项目列表
- [x] 创建 `apps/web/app/api/ai/__tests__/generate.test.ts`
  - 未授权访问
  - 缺少 prompt
  - AI 服务错误处理

### 5.4 E2E 测试

- [x] 创建 `apps/web/e2e/auth.spec.ts` — 认证流程 E2E
  - 注册 → 登录 → 跳转工作区
  - 演示账号登录
  - 未登录访问受保护页面 → 跳转登录
- [x] 创建 `apps/web/e2e/editor.spec.ts` — 编辑器 E2E
  - 添加元素、拖拽、删除
  - 属性编辑
  - 保存和加载
  - 撤销/重做
- [x] 创建 `apps/web/e2e/ai.spec.ts` — AI 生成 E2E
  - 输入提示词 → 生成 → 查看结果

### 5.5 ESLint 配置完善

- [x] 确认 `.eslintrc.js` 规则包含 `no-unused-vars`、`no-explicit-any`
- [x] 运行 `npm run lint` 确认零警告
- [x] 添加 `lint-staged` 配置（提交前自动 lint）
- [x] 添加 `husky` pre-commit hook

### 5.6 安全加固

- [x] 添加 API 速率限制中间件（每 IP 每分钟 100 次）
- [x] 添加 CORS 配置
- [x] 添加安全响应头（X-Frame-Options, X-Content-Type-Options, CSP）
- [x] 确认 `.env` 文件在 `.gitignore` 中
- [x] 确认密码字段不在 API 响应中泄露（当前已处理，确认所有接口）
- [x] 添加输入长度限制（防止超大 payload）

### 5.7 性能优化

- [x] 添加图片懒加载（`next/image`）
- [x] 添加代码分割（`next/dynamic` 动态导入编辑器组件）
- [x] 配置 `next.config.js` 的 `headers` 添加静态资源缓存
- [x] Prisma 查询优化（避免 N+1，使用 `include` 一次性加载关联数据）
- [x] 画布渲染优化（大量元素时使用 `React.memo` 避免不必要的重渲染）

### 5.8 生产环境配置

- [x] 创建 `apps/web/next.config.js` 生产配置
  - 输出 standalone 模式
  - 配置图片域名白名单
  - 配置重定向规则
- [x] 创建 `Dockerfile`（多阶段构建）
- [x] 创建 `docker-compose.yml`（app + postgres + redis）
- [x] 配置 `.github/workflows/ci.yml`（lint + type-check + test + build）

### 5.9 部署前检查清单

- [x] `npm run build` 构建成功，零错误
- [x] `npm run lint` 零警告
- [x] `npx tsc --noEmit` 零类型错误
- [x] 所有测试通过
- [x] 环境变量文档更新（生产环境需要哪些变量）
- [x] 数据库迁移脚本就绪
- [x] 种子数据脚本就绪（生产环境是否需要）

### 5.10 文档更新

- [x] 更新 `docs/DEVELOPMENT.md` 反映最新开发流程
- [x] 更新 `docs/DEPLOYMENT.md` 添加 Docker 部署步骤
- [x] 更新 `README.md` 添加快速开始指南
- [x] 更新 `docs/PRD.md` 标记已完成的功能
- [x] 创建 `CHANGELOG.md` 记录版本变更

---

## 任务依赖关系

```
Phase 0 (环境就绪)
    ↓
Phase 1 (修复致命 Bug)
    ↓
Phase 2 (类型安全)
    ↓
Phase 3 (错误处理)
    ↓
Phase 4 (功能补全)  ← 各子任务可并行
    ↓
Phase 5 (测试与生产就绪)  ← 部分可与 Phase 4 并行
```

### Phase 4 内部并行关系

```
4.1 工作区项目列表 ─────────────────┐
4.2 组件库增强 ─────────────────────┤
4.3 画布增强 ───────────────────────┤
4.4 属性面板增强 ───────────────────┤  可并行开发
4.5 代码导出增强 ───────────────────┤
4.6 版本管理 ───────────────────────┤
4.7 项目设置 ───────────────────────┤
4.8 用户设置 ───────────────────────┤
4.9 AI 增强 ────────────────────────┤
4.10 导航栏重构 ────────────────────┤
4.11 侧边栏导航 ────────────────────┘
4.12 首页改版 ──── 依赖 4.10 完成
```

---

## 进度跟踪

| 阶段 | 计划 | 已完成 | 进度 |
|------|------|--------|------|
| Phase 0 | 13 | 12 | 92% |
| Phase 1 | 33 | 27 | 81% |
| Phase 2 | 32 | 32 | 100% |
| Phase 3 | 41 | 40 | 97% |
| Phase 4 | 65 | 56 | 86% |
| Phase 5 | 43 | 43 | 100% |
| **总计** | **227** | **210** | **93%** |

---

## 备注

- 每完成一个 checklist 项，将 `[ ]` 改为 `[x]`
- 每完成一个 Phase，更新上方进度表
- 遇到阻塞问题时，在对应任务下方添加说明
- 新增任务追加到对应 Phase 末尾，编号顺延
