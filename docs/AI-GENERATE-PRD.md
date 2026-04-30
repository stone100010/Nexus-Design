# AI 设计生成 PRD

## 1. 产品概述

用户在 AI 生成页输入设计需求描述，系统调用大模型生成多页 APP UI 设计方案，以流式方式逐步返回页面，第一个页面完成后立即跳转编辑器，后续页面在后台持续加载。

## 2. 核心体验目标

- **即时反馈**：点击按钮后 5 秒内看到进度更新
- **渐进呈现**：第一个页面完成后立即进入编辑器，不用等全部生成
- **后台加载**：后续页面在编辑器内自动追加，不阻塞用户操作

## 3. 页面流转

### 3.1 AI 生成页 (`/design/ai`)

用户输入 prompt，选择画布尺寸和风格，点击"开始设计"。

**UI 状态变化：**

| 阶段 | 按钮文字 | 其他 |
|------|---------|------|
| 初始 | 开始设计 | 可点击 |
| 等待中 | AI 正在生成中... Xs | 不可点击，秒数递增 |
| 第一页到达 | 自动跳转编辑器 | — |

### 3.2 编辑器页 (`/design/editor`)

接收第一个 page 后自动跳转。

**关键行为：**
- 进入时只渲染第一个页面
- 顶部页签栏显示已加载的页面 tab
- 后续 page 到达时自动追加 tab
- 用户可立即操作当前页面（拖拽、改属性），不受后台加载影响

## 4. 后端流程

### 4.1 请求入口

```
POST /api/ai/generate
Body: { prompt: string, canvasSize?: object, style?: string, stream?: boolean }
```

### 4.2 处理流程

```
1. 验证用户身份 (NextAuth session)
2. 检查每日生成限额 (默认 50 次/天)
3. 创建 SSE ReadableStream 响应
4. 调用 GLM API (stream: true)
5. 流式读取响应，增量解析 JSON
6. 每解析出一个 page → 立即发 SSE 事件
7. 全部完成后保存到数据库
```

### 4.3 API 配置

| 配置项 | 值 | 来源 |
|--------|-----|------|
| 模型 | glm-5.1 | NEXUS_OPENAI_MODEL |
| API 地址 | https://open.bigmodel.cn/api/coding/paas/v4 | NEXUS_OPENAI_BASE_URL |
| API Key | (env) | NEXUS_OPENAI_API_KEY |
| 最大 token | 16000 | 硬编码 |

**重要：GLM 模型流式响应中，最终答案在 `content` 字段，思考过程在 `reasoning_content` 字段。只读 `content`，忽略 `reasoning_content`。**

## 5. SSE 事件协议

### 5.1 事件类型

| type | 说明 | 数据 |
|------|------|------|
| progress | 心跳进度 | `{ type: 'progress', message: 'AI 正在生成中... 5s' }` |
| page | 单个页面完成 | `{ type: 'page', page: DesignPage, index: number }` |
| done | 全部完成 | `{ type: 'done', totalPages: number, dailyRemaining: number, dailyLimit: number }` |
| error | 错误 | `{ type: 'error', error: string }` |

### 5.2 时序图

```
用户          前端                  后端                  GLM API
 │            │                    │                      │
 │─点击开始──→│                    │                      │
 │            │──POST /api/ai/────→│                      │
 │            │                    │──stream:true────────→│
 │            │←─SSE progress 5s──│←─heartbeat───────────│
 │←按钮计时──│                    │                      │
 │            │←─SSE progress 10s─│                      │
 │←按钮计时──│                    │                      │
 │            │                    │←─chunk(content)──────│
 │            │                    │←─chunk(content)──────│
 │            │                    │  增量解析→page 1 完成  │
 │            │←─SSE page 1───────│                      │
 │            │  addPage+跳转      │                      │
 │──进入编辑器─│                    │                      │
 │←渲染page1─│                    │←─chunk(content)──────│
 │            │                    │  增量解析→page 2 完成  │
 │            │←─SSE page 2───────│                      │
 │←追加tab───│                    │←─chunk(content)──────│
 │            │                    │  增量解析→page 3 完成  │
 │            │←─SSE page 3───────│                      │
 │←追加tab───│                    │                      │
 │            │←─SSE done─────────│  保存数据库            │
 │←toast─────│                    │                      │
```

## 6. 数据结构

### 6.1 DesignPage

```typescript
interface DesignPage {
  id: string              // "page-1"
  name: string            // "首页"
  description?: string    // "显示商品推荐"
  canvas: { width: number, height: number }  // { width: 375, height: 812 }
  elements: EditorElement[]
}
```

### 6.2 EditorElement

```typescript
interface EditorElement {
  type: 'text' | 'button' | 'container' | 'input' | 'image' | 'icon'
  x: number
  y: number
  width: number
  height: number
  props?: { text?: string, placeholder?: string, src?: string }
  styles?: { background?: string, color?: string, fontSize?: string, borderRadius?: string }
}
```

### 6.3 Store 操作

| 操作 | 说明 |
|------|------|
| `addPage(page)` | 追加页面到 pages 数组 |
| `setActivePage(id)` | 切换当前活跃页面，同步画布尺寸 |
| `getActivePage()` | 获取当前页面对象 |
| `addElement(element)` | 向当前活跃页面添加元素 |

## 7. 前端关键文件

| 文件 | 职责 |
|------|------|
| `app/design/ai/page.tsx` | AI 生成页，prompt 输入、SSE 接收、页面跳转 |
| `app/design/editor/page.tsx` | 编辑器页，画布渲染、工具栏、属性面板 |
| `app/stores/editor.ts` | Zustand store，多页状态管理 |
| `app/components/editor/canvas.tsx` | 画布组件，页签栏，元素渲染 |
| `app/api/ai/generate/route.ts` | 后端 API，GLM 调用，SSE 流式响应 |
| `app/types/index.ts` | 类型定义 |

## 8. 系统提示词

详见 `docs/AI-UI-PROMPT.md`。

核心要求：
- 3 个核心页面，覆盖 APP 主要功能流
- 玻璃拟态风格（半透明、backdrop-filter blur）
- 每页面 6-8 个元素
- 顶部状态栏 + 底部标签栏
- 只返回纯 JSON，无解释文字

## 9. 已知问题

| 问题 | 状态 | 说明 |
|------|------|------|
| 增量解析 0 页 | 待修 | buffer 有 4200 字符 JSON 但提取不到 page |
| OpenAI SDK 流式卡死 | 已绕过 | 改用直接 fetch 调用 GLM API |
| GLM reasoning_content 污染 | 已修 | 只读 content 字段 |
| 环境变量被 shell 覆盖 | 已修 | 启动时显式传入正确 env |
