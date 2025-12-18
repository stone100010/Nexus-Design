# Nexus Design - 技术架构设计

## 📋 设计参考文件

**位置**：`/home/workspace/nexus-design/demo/`

本项目包含 UI 设计组主管提供的三个演示文件，作为产品实现的**视觉参考**和**功能规范**：

| 文件 | 功能 | 主要特性 |
|------|------|----------|
| `landing.html` | 产品着陆页 | 响应式设计、定价方案、客户案例 |
| `auth.html` | 认证系统 | 登录/注册、社交登录、表单验证 |
| `workspace.html` | 设计工作区 | 多设备预览、拖拽编辑、代码生成、AI助手 |

> **重要说明**：这些 HTML 演示文件展示了产品的**最终用户体验**，技术架构设计的目标是使用 Next.js + TypeScript + 现代前端技术栈来**实现并优化**这些功能，同时添加后端支持、AI 集成和实时协作等高级功能。

## 🏗️ 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户层 (User Layer)                    │
│                    Web / Mobile / Desktop                    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     前端层 (Frontend Layer)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Next.js 16  │  │  UI 组件库   │  │  状态管理        │  │
│  │  App Router  │  │  Tailwind    │  │  Zustand         │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      API 层 (API Layer)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Next.js API │  │  WebSocket   │  │  文件上传        │  │
│  │  Routes      │  │  Real-time   │  │  AWS S3          │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     服务层 (Service Layer)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  AI 服务     │  │  数据库      │  │  缓存            │  │
│  │  OpenAI      │  │  PostgreSQL  │  │  Redis           │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     基础设施 (Infrastructure)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  部署平台    │  │  监控        │  │  存储            │  │
│  │  Vercel      │  │  Sentry      │  │  Cloudinary      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📂 项目目录结构

```
NexusDesign/
├── 📁 apps/                      # 应用模块
│   ├── web/                     # 主前端应用
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── (auth)/          # 认证路由组
│   │   │   ├── (design)/        # 设计器路由组
│   │   │   ├── api/             # API 路由
│   │   │   └── layout.tsx       # 根布局
│   │   ├── components/          # 通用组件
│   │   ├── lib/                 # 工具函数
│   │   └── types/               # TypeScript 类型
│   └── admin/                   # 管理后台
│
├── 📁 packages/                  # 共享包
│   ├── ui/                      # UI 组件库
│   ├── core/                    # 核心逻辑
│   ├── ai/                      # AI 服务封装
│   ├── editor/                  # 设计器核心
│   └── utils/                   # 工具库
│
├── 📁 services/                  # 后端服务
│   ├── database/                # 数据库层
│   ├── storage/                 # 文件存储
│   ├── realtime/                # 实时通信
│   └── queue/                   # 任务队列
│
├── 📁 docs/                      # 文档
│   ├── OVERVIEW.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── DEVELOPMENT.md
│   └── DEPLOYMENT.md
│
├── 📁 config/                    # 配置文件
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── prisma/schema.prisma
│   └── environment/
│
├── 📁 scripts/                   # 脚本工具
│   ├── migrate.sh
│   ├── deploy.sh
│   └── backup.sh
│
└── 📁 tests/                     # 测试
    ├── e2e/                     # 端到端测试
    ├── integration/             # 集成测试
    └── unit/                    # 单元测试
```

## 🎨 前端架构设计

### 1. 应用架构模式

**Next.js 16 App Router 架构**
```
app/
├── (public)/                    # 公共路由
│   ├── page.tsx                 # 首页
│   └── about/page.tsx
│
├── (auth)/                      # 认证路由
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx               # 认证布局
│
├── (design)/                    # 设计器路由（需要登录）
│   ├── workspace/page.tsx       # 设计工作区
│   ├── project/[id]/page.tsx    # 项目详情
│   └── layout.tsx               # 设计器布局
│
├── api/                         # API 路由
│   ├── auth/[...nextauth]/route.ts
│   ├── projects/route.ts
│   ├── ai/generate/route.ts
│   └── export/code/route.ts
│
└── components/                  # 组件
    ├── ui/                      # 基础 UI 组件
    ├── editor/                  # 编辑器组件
    ├── ai/                      # AI 相关组件
    └── shared/                  # 通用组件
```

### 2. 状态管理架构

**分层状态管理策略**
```
┌─────────────────────────────────────┐
│  全局状态 (Zustand Store)            │
│  - 用户信息                          │
│  - 当前项目                          │
│  - 应用配置                          │
└─────────────────────────────────────┘
         │
┌─────────────────────────────────────┐
│  页面状态 (React Context)            │
│  - 设计器状态                        │
│  - 组件库状态                        │
│  - 协作状态                          │
└─────────────────────────────────────┘
         │
┌─────────────────────────────────────┐
│  组件状态 (useState)                 │
│  - UI 交互状态                       │
│  - 表单状态                          │
│  - 临时数据                          │
└─────────────────────────────────────┘
```

**状态管理实现**
```typescript
// stores/user.store.ts
interface UserState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (credentials: LoginParams) => Promise<void>;
  logout: () => void;
}

// stores/design.store.ts
interface DesignState {
  currentProject: Project | null;
  components: Component[];
  canvas: CanvasState;
  selectedElements: string[];
  updateCanvas: (state: Partial<CanvasState>) => void;
  addComponent: (component: Component) => void;
}

// stores/ai.store.ts
interface AIState {
  isGenerating: boolean;
  history: AIHistory[];
  generateUI: (prompt: string) => Promise<GeneratedDesign>;
  optimizeLayout: (canvas: CanvasState) => Promise<OptimizedLayout>;
}
```

### 3. 组件层次结构

```
┌─────────────────────────────────────────┐
│  页面层 (Page Components)                │
│  - WorkspacePage                        │
│  - ProjectPage                          │
│  - AuthPage                             │
└─────────────────────────────────────────┘
         │
┌─────────────────────────────────────────┐
│  容器层 (Container Components)           │
│  - DesignWorkspace                      │
│  - ComponentLibrary                     │
│  - PropertyPanel                        │
│  - Toolbar                              │
└─────────────────────────────────────────┘
         │
┌─────────────────────────────────────────┐
│  展示层 (Presentational Components)      │
│  - Canvas                               │
│  - DevicePreview                        │
│  - ComponentItem                        │
│  - PropertyInput                        │
└─────────────────────────────────────────┘
         │
┌─────────────────────────────────────────┐
│  基础层 (UI Components)                  │
│  - Button, Input, Card                  │
│  - Icons, Tooltip, Modal                │
└─────────────────────────────────────────┘
```

### 4. 设计器核心架构

**画布引擎**
```typescript
// 核心数据结构
interface CanvasState {
  width: number;
  height: number;
  zoom: number;
  elements: CanvasElement[];
  background: string;
}

interface CanvasElement {
  id: string;
  type: 'button' | 'text' | 'image' | 'container';
  x: number;
  y: number;
  width: number;
  height: number;
  props: Record<string, any>;
  styles: CSSProperties;
  children?: CanvasElement[];
}

// 渲染引擎
class CanvasRenderer {
  render(elements: CanvasElement[]): ReactNode;
  updateElement(id: string, updates: Partial<CanvasElement>): void;
  deleteElement(id: string): void;
  duplicateElement(id: string): void;
  getSelectedElements(): CanvasElement[];
}
```

**拖拽系统**
```typescript
// 使用 dnd-kit 实现
import { DndContext, DragOverlay } from '@dnd-kit/core';

const DesignCanvas = () => {
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <CanvasRenderer />
      <ComponentLibrary />
      <DragOverlay>
        {activeComponent && <ComponentPreview component={activeComponent} />}
      </DragOverlay>
    </DndContext>
  );
};
```

## 🔌 API 架构

### 1. RESTful API 设计

**基础结构**
```
/api/v1/{resource}
├── GET    /{resource}          # 列表
├── GET    /{resource}/{id}     # 详情
├── POST   /{resource}          # 创建
├── PUT    /{resource}/{id}     # 更新
├── DELETE /{resource}/{id}     # 删除
└── PATCH  /{resource}/{id}     # 部分更新
```

**主要资源**
```
/users
/projects
/components
/ai/generate
/export/code
/collaboration
/files
```

### 2. WebSocket 实时通信

**事件类型**
```typescript
// 连接事件
type ConnectionEvent = 'connect' | 'disconnect' | 'reconnect';

// 协作事件
type CollaborationEvent = 
  | 'project:join'           # 加入项目
  | 'project:leave'          # 离开项目
  | 'element:update'         # 元素更新
  | 'element:add'            # 元素添加
  | 'element:delete'         # 元素删除
  | 'cursor:move'            # 光标移动
  | 'comment:add'            # 添加评论
  | 'presence:update';       # 在线状态更新

// 广播事件
type BroadcastEvent = 
  | 'project:saved'          # 项目保存
  | 'project:version'        # 版本更新
  | 'error';                 # 错误通知
```

**消息格式**
```typescript
interface WebSocketMessage {
  event: string;
  data: any;
  timestamp: number;
  sender: string;  // user_id
  project_id: string;
}
```

## 🤖 AI 集成架构

### 1. AI 服务层设计

```
┌─────────────────────────────────────────┐
│  AI Service Layer                        │
│  ┌─────────────────────────────────────┐ │
│  │  Prompt Engineering                  │ │
│  │  - Template System                   │ │
│  │  - Context Management                │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │  Model Integration                   │ │
│  │  - OpenAI GPT-4                      │ │
│  │  - DALL-E 3                          │ │
│  │  - Custom Models                     │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │  Response Processing                 │ │
│  │  - Validation                        │ │
│  │  - Transformation                    │ │
│  │  - Error Handling                    │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 2. Prompt 工程架构

**UI 生成 Prompt 模板**
```typescript
const UI_GENERATION_TEMPLATE = `
你是一个专业的 UI/UX 设计师。根据以下需求生成 UI 界面：

需求描述：
{user_description}

设计要求：
- 现代化设计风格
- 响应式布局
- 符合 Material Design 规范
- 输出 JSON 格式的组件结构

输出格式：
{
  "components": [
    {
      "type": "button",
      "props": { ... },
      "styles": { ... },
      "position": { x, y, width, height }
    }
  ]
}
`;

const CODE_GENERATION_TEMPLATE = `
根据以下 UI 设计生成 {framework} 代码：

UI 设计：
{design_json}

框架要求：
- 使用 {framework} 最佳实践
- 包含类型定义
- 支持响应式
- 代码注释清晰

输出要求：
完整的组件代码
`;
```

**优化建议 Prompt**
```typescript
const OPTIMIZATION_TEMPLATE = `
分析以下界面设计，提供建议：

当前设计：
{design_json}

优化建议：
1. 布局优化
2. 配色建议
3. 交互改进
4. 性能优化

输出结构化建议
`;
```

### 3. AI 调用流程

```
用户输入描述
    ↓
Prompt 构建
    ↓
AI 模型调用 (OpenAI API)
    ↓
响应解析 & 验证
    ↓
转换为内部数据结构
    ↓
渲染到画布
    ↓
用户反馈 & 优化
```

**实现代码**
```typescript
class AIService {
  private openai: OpenAI;
  
  async generateUI(prompt: string): Promise<GeneratedDesign> {
    // 1. 构建完整 prompt
    const fullPrompt = this.buildPrompt(prompt);
    
    // 2. 调用 AI
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: fullPrompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });
    
    // 3. 解析响应
    const design = JSON.parse(response.choices[0].message.content!);
    
    // 4. 验证数据
    this.validateDesign(design);
    
    // 5. 转换格式
    return this.transformToCanvasElements(design);
  }
  
  async optimizeLayout(canvas: CanvasState): Promise<Optimization> {
    const prompt = this.buildOptimizationPrompt(canvas);
    // ... 类似流程
  }
}
```

## 🗄️ 数据库架构

### 1. 数据模型概览

```
User ──┐
       │
       ├── Project ──┐
       │             │
       ├── Team ─────┤
       │             │
       └── Component │
                     │
                     ├── Version ──┐
                     │             │
                     └── Comment   │
                                   │
File ──────────────────────────────┘
```

### 2. 核心表结构

**用户 & 认证**
```sql
users
├── id (PK)
├── email
├── name
├── avatar
├── role (admin/user/guest)
├── created_at
└── updated_at

sessions
├── id (PK)
├── user_id (FK)
├── token
├── expires_at
└── created_at

teams
├── id (PK)
├── name
├── owner_id (FK)
├── settings (JSONB)
└── created_at

team_members
├── team_id (FK)
├── user_id (FK)
├── role (admin/editor/viewer)
└── joined_at
```

**项目 & 设计**
```sql
projects
├── id (PK)
├── name
├── description
├── owner_id (FK)
├── team_id (FK)
├── thumbnail
├── settings (JSONB)
├── is_public
├── created_at
├── updated_at
├── deleted_at

versions
├── id (PK)
├── project_id (FK)
├── version_number
├── data (JSONB)  # 完整的设计数据
├── created_by (FK)
├── created_at
├── message

components
├── id (PK)
├── team_id (FK)
├── name
├── type
├── props (JSONB)
├── styles (JSONB)
├── is_public
├── created_by (FK)
├── created_at
```

**AI & 协作**
```sql
ai_generations
├── id (PK)
├── user_id (FK)
├── project_id (FK)
├── prompt
├── response (JSONB)
├── tokens_used
├── cost
├── created_at

collaboration_sessions
├── id (PK)
├── project_id (FK)
├── user_id (FK)
├── socket_id
├── cursor (JSONB)
├── joined_at
└── last_active

comments
├── id (PK)
├── project_id (FK)
├── user_id (FK)
├── element_id
├── content
├── x
├── y
├── resolved
├── created_at
```

**文件存储**
```sql
files
├── id (PK)
├── user_id (FK)
├── name
├── url
├── size
├── mime_type
├── storage_provider (s3/cloudinary)
├── created_at
```

## 🔐 安全架构

### 1. 认证 & 授权

**JWT Token 结构**
```typescript
interface JWTPayload {
  sub: string;        // user_id
  email: string;
  role: string;
  team_id?: string;
  permissions: string[];
  iat: number;
  exp: number;
}
```

**权限系统**
```typescript
type Permission = 
  | 'project:create'
  | 'project:read'
  | 'project:update'
  | 'project:delete'
  | 'project:share'
  | 'component:create'
  | 'component:delete'
  | 'ai:generate'
  | 'export:code'
  | 'team:manage';

const ROLE_PERMISSIONS = {
  admin: ['*'],
  editor: ['project:read', 'project:update', 'component:create', 'ai:generate', 'export:code'],
  viewer: ['project:read']
};
```

### 2. 数据安全

**输入验证**
```typescript
import { z } from 'zod';

const ProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  settings: z.object({
    theme: z.enum(['light', 'dark']),
    devices: z.array(z.string())
  })
});
```

**API 安全**
- Rate limiting: 100 req/min per user
- CORS 配置
- SQL 注入防护 (Prisma)
- XSS 防护 (DOMPurify)

## 🎨 设计系统架构

### 1. 主题系统

```typescript
// themes/index.ts
export const themes = {
  light: {
    background: '#ffffff',
    surface: '#f8f9fa',
    primary: '#6366f1',
    secondary: '#ec4899',
    text: '#1f2937',
    border: '#e5e7eb'
  },
  dark: {
    background: '#050507',
    surface: '#131316',
    primary: '#6366f1',
    secondary: '#ec4899',
    text: '#ffffff',
    border: '#2d2d2d'
  }
};

// Tailwind 配置
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        accent: '#ec4899',
        dark: '#050507',
        card: '#131316'
      }
    }
  }
}
```

### 2. 组件设计规范

```typescript
// 组件基础接口
interface BaseComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  styles: CSSProperties;
  events?: ComponentEvents;
}

// 组件事件
interface ComponentEvents {
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onChange?: (value: any) => void;
}

// 组件变体
interface ComponentVariant {
  name: string;
  styles: CSSProperties;
  props: Record<string, any>;
}
```

## 📊 性能优化策略

### 1. 前端优化

**代码分割**
```typescript
// 动态导入
const AIDesignGenerator = dynamic(
  () => import('@/components/ai/DesignGenerator'),
  { 
    loading: () => <Skeleton />,
    ssr: false 
  }
);
```

**虚拟化列表**
```typescript
import { FixedSizeList } from 'react-window';

const ComponentList = ({ components }) => (
  <FixedSizeList
    height={600}
    itemCount={components.length}
    itemSize={80}
  >
    {({ index, style }) => (
      <div style={style}>
        <ComponentItem component={components[index]} />
      </div>
    )}
  </FixedSizeList>
);
```

**画布优化**
- 使用 React.memo 优化渲染
- 虚拟 DOM diff 算法
- 批量更新状态
- Web Worker 处理复杂计算

### 2. 后端优化

**数据库索引**
```sql
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_team ON projects(team_id);
CREATE INDEX idx_versions_project ON versions(project_id);
CREATE INDEX idx_ai_user ON ai_generations(user_id);
```

**缓存策略**
```typescript
// Redis 缓存层
class CacheService {
  async getProject(projectId: string): Promise<Project | null> {
    const cacheKey = `project:${projectId}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (project) {
      await redis.setex(cacheKey, 300, JSON.stringify(project));
    }
    return project;
  }
}
```

**队列处理**
```typescript
// AI 生成任务队列
import { Queue } from 'bullmq';

const aiQueue = new Queue('ai-generation', {
  connection: { host: 'localhost', port: 6379 }
});

// 生产者
await aiQueue.add('generate-ui', {
  userId,
  prompt,
  projectId
});

// 消费者
aiQueue.worker('generate-ui', async (job) => {
  const result = await aiService.generateUI(job.data.prompt);
  return result;
});
```

## 🔄 数据流设计

### 1. 用户操作流程

```
用户登录
  ↓
加载项目列表
  ↓
选择/创建项目
  ↓
进入设计器
  ↓
组件拖拽/编辑
  ↓
实时预览
  ↓
AI 辅助优化
  ↓
保存版本
  ↓
导出代码
```

### 2. 实时协作流程

```
用户 A 加入项目
  ↓
建立 WebSocket 连接
  ↓
广播 presence 事件
  ↓
用户 B 也加入
  ↓
同步当前画布状态
  ↓
用户 A 操作元素
  ↓
实时广播更新
  ↓
用户 B 接收更新
  ↓
光标位置同步
  ↓
评论/反馈
```

### 3. AI 生成流程

```
用户输入描述
  ↓
构建 Prompt (模板 + 上下文)
  ↓
调用 OpenAI API
  ↓
解析 JSON 响应
  ↓
验证数据结构
  ↓
转换为内部格式
  ↓
渲染到画布
  ↓
用户反馈
  ↓
优化 Prompt (学习)
```

## 🛠️ 开发工具链

### 1. 开发环境

```json
{
  "dependencies": {
    "next": "16.0.10",
    "react": "18.2.0",
    "typescript": "5.3.3",
    "tailwindcss": "3.4.0",
    "zustand": "4.4.7",
    "prisma": "5.8.0",
    "openai": "4.24.0",
    "socket.io": "4.7.2"
  },
  "devDependencies": {
    "@types/node": "20.11.0",
    "@types/react": "18.2.0",
    "eslint": "8.56.0",
    "prettier": "3.2.0",
    "vitest": "1.2.0",
    "playwright": "1.41.0"
  }
}
```

### 2. 代码质量工具

- **ESLint**: 代码规范检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查
- **Husky**: Git hooks
- **Commitlint**: 提交信息规范

### 3. 测试工具

- **Vitest**: 单元测试
- **React Testing Library**: 组件测试
- **Playwright**: E2E 测试
- **Cypress**: 集成测试

## 📈 扩展性设计

### 1. 插件系统架构

```typescript
interface Plugin {
  id: string;
  name: string;
  version: string;
  
  // 生命周期钩子
  onInit?: (context: PluginContext) => void;
  onDesignUpdate?: (design: DesignState) => void;
  onExport?: (format: string, data: any) => any;
  
  // UI 扩展
  components?: Component[];
  toolbar?: ToolbarItem[];
  settings?: SettingPanel[];
}

class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  
  register(plugin: Plugin): void;
  unregister(pluginId: string): void;
  getPlugin(pluginId: string): Plugin | undefined;
  
  // 触发钩子
  triggerHook(hook: string, data: any): any;
}
```

### 2. API 扩展性

```typescript
// API 版本控制
/api/v1/...
/api/v2/...

// 插件 API
/api/plugins/{pluginId}/endpoint

// Webhooks
POST /webhooks/{event}
```

### 3. 数据模型扩展

```typescript
// 使用 JSONB 字段存储扩展数据
interface Project {
  // ...
  settings: {
    theme: string;
    plugins: Record<string, any>;
    customFields: Record<string, any>;
  };
}
```

---

**版本**：v1.0.0  
**最后更新**：2025-12-17  
**状态**：架构设计完成