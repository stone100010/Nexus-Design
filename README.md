# Nexus Design - 统一设计平台

## 🎬 产品预览

### 📱 产品着陆页 (landing.html)
![产品着陆页](demo/landing.html.png)

### 🎨 设计工作区 (workspace.html)
![设计工作区](demo/workspace.html.png)

## 📰 媒体报道

### 🔥 新闻报道截图
![新闻报道 1](news/ScreenShot_2025-12-18_163322_198.png)
![新闻报道 2](news/ScreenShot_2025-12-18_163525_805.png)
![新闻报道 3](news/359b033b5bb5c9eab41f2dde7e9b46103bf3b356.webp)
![新闻报道 4](news/562c11dfa9ec8a13b3bce1481fef7e9fa2ecc0f6.webp)

## 📋 项目概述

Nexus Design 是一个革命性的UI设计工具，由 **mimo-v2-flash** 全权负责全栈工程开发，支持多平台设计，包括微信小程序、iOS应用、响应式网站等。通过AI驱动的设计生成和自动代码输出，让设计师和开发者能够无缝协作，实现设计即代码的工作流程。

**核心开发**：本项目由 **mimo-v2-flash** 全权负责全栈工程开发，从架构设计到代码实现，从安全审计到文档编写，展现了 AI 在现代软件工程中的强大能力。

## 🗂️ 项目结构

```
NexusDesign/
├── demo/                    # 演示文件夹
│   ├── landing.html        # 产品着陆页 - Gemini 3 Pro 设计
│   ├── auth.html           # 登录注册页面 - Gemini 3 Pro 设计
│   └── workspace.html      # 设计工作区 - Gemini 3 Pro 设计
├── docs/                   # 设计文档
│   ├── OVERVIEW.md         # 项目概览 - mimo-v2-flash 生成
│   ├── ARCHITECTURE.md     # 技术架构 - mimo-v2-flash 生成
│   ├── DEVELOPMENT.md      # 开发指南 - mimo-v2-flash 生成
│   ├── API.md              # API文档 - mimo-v2-flash 生成
│   ├── DATABASE.md         # 数据库设计 - mimo-v2-flash 生成
│   └── DEPLOYMENT.md       # 部署文档 - mimo-v2-flash 生成
├── apps/web/               # 全栈工程代码 - mimo-v2-flash 开发
│   ├── app/                # Next.js 应用
│   ├── prisma/             # 数据库模型
│   └── ...                 # 完整项目结构
├── README.md               # 中文说明文档
├── README.en.md            # 英文说明文档
├── LICENSE                 # 许可证文件
├── SECURITY.md             # 安全指南
├── .env.example            # 环境变量模板
└── turbo.json              # Turborepo 配置
```

### 🎨 设计来源

- **演示文件** (`demo/*.html`)：由 **Gemini 3 Pro** 生成，提供视觉参考和交互规范
- **设计文档** (`docs/*.md`)：由 **mimo-v2-flash** 生成，包含完整的技术文档
- **全栈代码** (`apps/web/`, `packages/`)：由 **mimo-v2-flash** 开发，生产级实现

### 📄 演示文件说明

这三个 HTML 文件由 **Gemini 3 Pro** 生成，作为产品实现的**设计参考**和**功能规范**：

- ✅ **视觉标准**：定义了产品的整体风格、配色、布局
- ✅ **交互规范**：展示了用户操作流程和交互细节
- ✅ **功能范围**：明确了需要实现的核心功能模块
- ✅ **用户体验**：提供了完整的用户旅程演示

> **使用建议**：在开发过程中，应参考这些演示文件来确保实现效果符合设计预期，同时结合技术架构进行优化和扩展。

## 🚀 功能特性

### 💻 Next.js Web 应用 (web/)
基于 Next.js 16.0.10 的完整生产级应用，包含：

#### 🏠 产品着陆页 (`/`)
- 完整的产品介绍和功能演示
- 响应式设计，支持所有设备
- 三层定价方案（免费/专业/企业）
- 客户案例展示
- 清晰的注册/登录引导

#### 🔐 认证系统 (`/auth/login`, `/auth/register`)
- 双重模式：登录/注册无缝切换
- 演示账号：demo@nexusdesign.app / NexusDesign123
- 社交登录：Google、GitHub、Apple
- 完整表单验证
- "记住我"功能

#### 🎨 设计工作区 (`/workspace`)
- 项目管理和创建
- API 模式切换（Mock/Real）
- 版本历史查看
- 团队协作界面
- AI 助手入口
- 响应式工作区布局

#### 🛠️ 技术特性
- **UI 组件库**: Button, Card, Input (可扩展)
- **API 工具**: Mock/Real 双模式支持
- **路由保护**: 中间件认证
- **主题系统**: 自定义 Tailwind 配置
- **类型安全**: 完整 TypeScript 支持

### 📄 演示文件 (demo/)
- `landing.html` - 产品着陆页
- `auth.html` - 认证系统演示
- `workspace.html` - 完整设计器演示

> 💡 **说明**: demo 文件是 UI 设计组主管提供的视觉参考，web/ 目录是基于 Next.js 的生产级实现。

## 💼 核心价值

### 🎯 设计即代码
- 设计直接生成生产级代码
- 支持React、Vue、Angular、微信小程序等
- 自动响应式布局适配

### 🤖 AI驱动设计
- 文本描述生成UI界面
- 智能布局建议
- 自动组件推荐

### 👥 团队协作
- 实时多人编辑
- 版本控制和历史回溯
- 评论和反馈系统

## 🎮 快速开始

### 1. 访问产品着陆页
```
打开 landing.html 了解产品功能
```

### 2. 注册/登录账户
```
点击"Sign Up Free"或"Log in"跳转到认证页面
使用演示账号：demo / NexusDesign123 快速体验
```

### 3. 进入设计工作区
```
登录成功后自动跳转到 workspace.html
体验完整的设计工具功能
```

## 📱 设备支持

### 📲 移动设备
- iPhone 14 Pro (375x812px)
- iPhone 14 (390x844px)
- Android (384x854px)

### 💻 桌面设备
- iPad Pro (1024x1366px)
- Desktop (1440x900px)
- Tablet (768x1024px)

### 🔄 屏幕模式
- 竖屏模式（Portrait）
- 横屏模式（Landscape）

## 🎨 设计系统

### 🎨 主题配色
```css
--bg-dark: #050507      /* 深色背景 */
--bg-card: #131316      /* 卡片背景 */
--primary: #6366f1      /* 主色调 - 靛蓝色 */
--accent: #ec4899       /* 强调色 - 粉色 */
--text-main: #ffffff    /* 主文本 */
--text-muted: #9ca3af   /* 次要文本 */
```

### ✨ 交互效果
- **悬停动画**：所有可交互元素的视觉反馈
- **过渡动画**：流畅的状态切换效果
- **加载动画**：模拟真实API调用
- **拖拽交互**：组件拖拽和画板移动

## 🛠️ 技术栈

### 核心框架
- **Next.js 15**：React 18 + App Router
- **TypeScript**：类型安全
- **Turborepo**：多包管理
- **Prisma**：ORM + PostgreSQL

### 前端技术
- **React 18**：组件化开发
- **Tailwind CSS**：原子化样式
- **shadcn/ui**：可复用组件
- **Zustand**：状态管理
- **NextAuth.js**：认证系统

### AI 集成
- **OpenAI API**：AI 生成能力
- **GPT-4 Turbo**：自然语言处理

### 开发工具
- **ESLint**：代码规范
- **Prettier**：代码格式化
- **Husky**：Git Hooks
- **Vitest**：单元测试
- **Playwright**：E2E 测试

## 📊 演示数据

### 💳 金融App演示
- **总资产**：$166,880.00
- **投资收益**：+28.7% YTD
- **银行卡**：3张不同类型的银行卡
- **交易记录**：真实的交易流水数据
- **功能模块**：转账、投资、优惠券、账单等

### 👥 用户数据
- **演示账号**：demo / NexusDesign123
- **团队协作**：模拟多人在线编辑
- **版本历史**：设计版本管理演示

## 🎯 使用场景

### 🏢 企业团队
- **产品经理**：快速原型设计
- **UI设计师**：高保真界面设计
- **前端开发**：直接获取生产代码
- **项目经理**：进度跟踪和协作

### 🚀 创业公司
- **MVP开发**：快速产品原型
- **设计系统**：统一设计语言
- **团队协作**：远程团队协作
- **成本控制**：减少设计到开发的时间成本

## 📈 性能优化

### ⚡ 加载优化
- **代码分离**：按需加载JavaScript
- **CSS优化**：关键CSS内联
- **图片优化**：使用现代图片格式

### 🎭 用户体验
- **即时反馈**：所有操作都有视觉反馈
- **错误处理**：友好的错误提示信息
- **加载状态**：清晰的加载进度指示

## 🔮 未来规划

### 🚀 短期目标
- [ ] 更多设备预设支持
- [ ] 组件库扩展
- [ ] AI功能增强
- [ ] 协作功能完善

### 🎯 长期愿景
- [ ] 插件生态系统
- [ ] 开放API平台
- [ ] 企业级部署方案
- [ ] 国际化支持

## 🤖 开发团队

### 🎯 开发模式
本项目采用 **AI 驱动开发** 模式：

| 阶段 | 工具/模型 | 产出物 |
|------|-----------|--------|
| 🎨 UI设计 | **Gemini 3 Pro** | 演示文件 (landing.html, auth.html, workspace.html) |
| 📚 文档生成 | **mimo-v2-flash** | 完整设计文档 (docs/*.md) |
| 💻 工程实现 | **mimo-v2-flash** | 全栈代码 (apps/web/, packages/) |
| 🔒 安全审计 | **mimo-v2-flash** | 安全指南 (SECURITY.md) |

### 🔧 技术负责人
- **模型**：mimo-v2-flash
- **角色**：全栈架构师 + 开发工程师
- **职责**：
  - 系统架构设计
  - 数据库建模
  - API 开发
  - 前端组件实现
  - 安全加固
  - 文档编写

### 📝 开发日志
- **2025-12-18**: v1.0.0 基础架构完成
  - Next.js + Turborepo + Prisma
  - 认证系统 (NextAuth)
  - 设计编辑器核心
  - AI 生成集成
  - 安全审计通过

## 📞 联系我们

### 🌐 官方网站
- **产品主页**：landing.html (Gemini 3 Pro 设计)
- **设计工作区**：workspace.html (Gemini 3 Pro 设计)
- **技术支持**：auth.html (Gemini 3 Pro 设计)

### 🤖 技术支持
- **开发文档**：docs/ (mimo-v2-flash 生成)
- **代码仓库**：https://gitee.com/sun_qiikai/nexus-design
- **安全报告**：SECURITY.md

### 📧 商务合作
- **企业定制**：支持私有化部署
- **技术培训**：AI 驱动开发培训
- **API接入**：开放平台合作

## 📄 许可证

本项目仅供演示和学习使用，请勿用于商业用途。

---

**Nexus Design** - AI 驱动的设计即代码平台 🚀

*设计由 Gemini 3 Pro 生成 · 文档由 mimo-v2-flash 生成 · 代码由 mimo-v2-flash 开发*