# Nexus Design - AI 驱动的设计即代码平台

<p align="center">
  <strong>设计由 Gemini 3 Pro 生成 · 文档由 mimo-v2-flash 生成 · 代码由 mimo-v2-flash 开发</strong>
</p>

## 📋 项目概述

Nexus Design 是一个革命性的 UI 设计工具，支持多平台设计（微信小程序、iOS应用、响应式网站等）。通过 AI 驱动的设计生成和自动代码输出，实现设计即代码的工作流程。

**核心特点**：
- 🤖 **AI 驱动**：文本描述生成 UI 界面
- 🎨 **多平台支持**：一套设计，多端输出
- 👥 **团队协作**：实时多人编辑与版本管理
- 💻 **代码即得**：直接生成生产级代码

## 🎬 产品预览

### 产品着陆页
![产品着陆页](demo/landing.html.png)

### 设计工作区
![设计工作区](demo/workspace.html.png)

### 新闻报道
![新闻报道](news/ScreenShot_2025-12-18_163322_198.png)  
![新闻报道](news/ScreenShot_2025-12-18_163525_805.png)

## 🗂️ 项目结构

```
nexus-design/
├── apps/web/                    # Next.js 主应用
│   ├── app/                     # 应用路由与页面
│   │   ├── auth/                # 认证页面
│   │   ├── design/              # 设计页面
│   │   ├── workspace/           # 工作区
│   │   └── api/                 # API 路由
│   ├── components/              # React 组件
│   ├── lib/                     # 工具函数
│   ├── stores/                  # 状态管理
│   └── prisma/                  # 数据库脚本
├── packages/                    # 共享包
│   ├── ai/                      # AI 相关功能
│   ├── core/                    # 核心逻辑
│   ├── editor/                  # 编辑器组件
│   └── ui/                      # UI 组件库
├── demo/                        # 设计参考文件
│   ├── landing.html             # 着陆页设计
│   ├── workspace.html           # 工作区设计
│   └── *.png                    # 截图预览
├── docs/                        # 技术文档
│   ├── OVERVIEW.md              # 项目概览
│   ├── ARCHITECTURE.md          # 技术架构
│   ├── API.md                   # API 文档
│   ├── DATABASE.md              # 数据库设计
│   ├── DEVELOPMENT.md           # 开发指南
│   └── DEPLOYMENT.md            # 部署文档
├── prisma/                      # 数据库 schema
├── scripts/                     # 脚本工具
├── tests/                       # 测试文件
├── .env.example                 # 环境变量模板
├── SECURITY.md                  # 安全指南
├── turbo.json                   # Monorepo 配置
└── package.json                 # 项目依赖
```

## 🚀 快速开始

### 1️⃣ 环境准备

```bash
# 克隆仓库
git clone https://github.com/stone100010/Nexus-Design.git
cd Nexus-Design

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入必要的配置
```

### 2️⃣ 数据库设置

```bash
# 启动数据库 (需要 PostgreSQL)
# 在 .env 中配置 DATABASE_URL
DATABASE_URL="postgresql://user:password@localhost:5432/nexus_design?schema=public"

# 生成并执行迁移
npx prisma generate
npx prisma db push
```

### 3️⃣ 运行项目

```bash
# 开发模式
npm run dev

# 构建并启动
npm run build
npm start
```

访问 http://localhost:3000 查看应用。

### 4️⃣ 演示模式

无需数据库，直接查看演示文件：
```bash
# 在浏览器中打开
open demo/landing.html      # 产品着陆页
open demo/workspace.html    # 设计工作区
```

## 🎯 功能特性

### 🔐 认证系统
- **登录/注册**：邮箱密码登录，社交登录支持
- **演示账号**：`demo@nexusdesign.app` / `NexusDesign123`
- **会话管理**：JWT 策略，30天过期
- **权限控制**：基于角色的访问控制

### 🎨 设计编辑器
- **组件库**：可拖拽的 UI 组件
- **属性面板**：实时编辑组件属性
- **画布渲染**：所见即所得的编辑体验
- **版本管理**：设计历史与回溯

### 🤖 AI 生成
- **文本生成**：自然语言描述生成界面
- **智能推荐**：基于上下文的组件建议
- **代码输出**：直接生成 React/Vue/小程序代码

### 👥 团队协作
- **实时编辑**：多人同时编辑
- **评论系统**：设计反馈与讨论
- **权限管理**：团队成员权限控制

## 🛠️ 技术栈

### 核心框架
- **Next.js 15** - React 18 + App Router
- **TypeScript** - 类型安全
- **Turborepo** - Monorepo 管理
- **Prisma** - ORM + PostgreSQL

### 前端技术
- **React 18** - 组件化开发
- **Tailwind CSS** - 原子化样式
- **shadcn/ui** - 可复用组件
- **Zustand** - 状态管理
- **NextAuth.js** - 认证系统

### AI 集成
- **OpenAI API** - AI 生成能力
- **GPT-4 Turbo** - 自然语言处理

### 开发工具
- **ESLint** - 代码规范
- **Prettier** - 代码格式化
- **Husky** - Git Hooks
- **Vitest** - 单元测试
- **Playwright** - E2E 测试

## 📊 演示数据

### 金融 App 演示
- **总资产**：$166,880.00
- **投资收益**：+28.7% YTD
- **银行卡**：3张不同类型的银行卡
- **交易记录**：真实的交易流水数据
- **功能模块**：转账、投资、优惠券、账单等

### 用户数据
- **演示账号**：demo / NexusDesign123
- **团队协作**：模拟多人在线编辑
- **版本历史**：设计版本管理演示

## 🎨 设计系统

### 主题配色
```css
--bg-dark: #050507      /* 深色背景 */
--bg-card: #131316      /* 卡片背景 */
--primary: #6366f1      /* 主色调 - 靛蓝色 */
--accent: #ec4899       /* 强调色 - 粉色 */
--text-main: #ffffff    /* 主文本 */
--text-muted: #9ca3af   /* 次要文本 */
```

### 交互效果
- **悬停动画**：所有可交互元素的视觉反馈
- **过渡动画**：流畅的状态切换效果
- **加载动画**：模拟真实API调用
- **拖拽交互**：组件拖拽和画板移动

## 📱 设备支持

| 设备类型 | 分辨率 | 屏幕模式 |
|---------|--------|----------|
| iPhone 14 Pro | 375x812px | 竖屏/横屏 |
| iPhone 14 | 390x844px | 竖屏/横屏 |
| Android | 384x854px | 竖屏/横屏 |
| iPad Pro | 1024x1366px | 竖屏/横屏 |
| Desktop | 1440x900px | 桌面模式 |
| Tablet | 768x1024px | 平板模式 |

## 🎯 使用场景

### 企业团队
- **产品经理**：快速原型设计
- **UI设计师**：高保真界面设计
- **前端开发**：直接获取生产代码
- **项目经理**：进度跟踪和协作

### 创业公司
- **MVP开发**：快速产品原型
- **设计系统**：统一设计语言
- **团队协作**：远程团队协作
- **成本控制**：减少设计到开发的时间成本

## 🔮 未来规划

### 🚀 短期目标
- [ ] 更多设备预设支持
- [ ] 组件库扩展
- [ ] AI 功能增强
- [ ] 协作功能完善

### 🎯 长期愿景
- [ ] 插件生态系统
- [ ] 开放API平台
- [ ] 企业级部署方案
- [ ] 国际化支持

## 📖 文档

| 文档 | 说明 |
|------|------|
| [项目概览](docs/OVERVIEW.md) | 项目背景与目标 |
| [技术架构](docs/ARCHITECTURE.md) | 系统架构设计 |
| [API 文档](docs/API.md) | 接口说明 |
| [数据库设计](docs/DATABASE.md) | 数据模型 |
| [开发指南](docs/DEVELOPMENT.md) | 开发环境配置 |
| [部署文档](docs/DEPLOYMENT.md) | 生产部署指南 |
| [安全指南](SECURITY.md) | 安全最佳实践 |

## 🤖 开发团队

本项目采用 **AI 驱动开发** 模式：

| 阶段 | 工具/模型 | 产出物 |
|------|-----------|--------|
| 🎨 UI设计 | **Gemini 3 Pro** | 演示文件 (demo/*.html) |
| 📚 文档生成 | **mimo-v2-flash** | 完整设计文档 (docs/*.md) |
| 💻 工程实现 | **mimo-v2-flash** | 全栈代码 (apps/web/, packages/) |
| 🔒 安全审计 | **mimo-v2-flash** | 安全指南 (SECURITY.md) |

**技术负责人**：mimo-v2-flash  
**角色**：全栈架构师 + 开发工程师  
**职责**：系统架构、数据库建模、API 开发、前端组件、安全加固、文档编写

## 📞 联系与支持

- **代码仓库**：https://github.com/stone100010/Nexus-Design
- **技术文档**：见 `docs/` 目录
- **安全报告**：[SECURITY.md](SECURITY.md)
- **许可证**：仅供演示和学习使用

---

**Nexus Design** - AI 驱动的设计即代码平台 🚀