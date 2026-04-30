# 多页面 AI 设计系统改造方案

## 问题现状

当前系统是**单页架构**：AI 返回一组元素，全部堆在一个画布上。实际 APP 设计需要多个页面（登录、首页、详情、个人中心等），每个页面独立布局。

## 改造目标

AI 一次生成完整 APP 的多页设计方案（3-5 页），编辑器支持页面切换和独立编辑，最终导出为多页预览 HTML。

---

## 一、AI 响应格式改造

### 现有格式（单页）
```json
{
  "canvas": { "width": 375, "height": 812 },
  "elements": [
    { "type": "text", "x": 0, "y": 0, "width": 100, "height": 20, "props": {...}, "styles": {...} }
  ]
}
```

### 新格式（多页）
```json
{
  "app": "电商APP",
  "style": "glassmorphism",
  "pages": [
    {
      "id": "page-1",
      "name": "启动页",
      "description": "应用启动引导页",
      "canvas": { "width": 375, "height": 812 },
      "elements": [...]
    },
    {
      "id": "page-2",
      "name": "首页",
      "description": "商品浏览主页",
      "canvas": { "width": 375, "height": 812 },
      "elements": [...]
    },
    {
      "id": "page-3",
      "name": "商品详情",
      "description": "商品详细信息页",
      "canvas": { "width": 375, "height": 812 },
      "elements": [...]
    }
  ]
}
```

---

## 二、SYSTEM_PROMPT 改造

```
你是顶级 APP UI/UX 设计专家。根据用户描述生成完整 APP 多页设计方案。

只返回纯 JSON，不要任何解释文字。

JSON 格式：
{
  "app": "APP名称",
  "style": "设计风格",
  "pages": [
    {
      "id": "page-1",
      "name": "页面名称",
      "description": "页面描述",
      "canvas": { "width": 375, "height": 812 },
      "elements": [
        {
          "type": "text|button|container|input|image|icon",
          "x": number,
          "y": number,
          "width": number,
          "height": number,
          "props": { "text"?: "string", "placeholder"?: "string", "src"?: "string" },
          "styles": { "background"?: "string", "color"?: "string", ... }
        }
      ]
    }
  ]
}

设计规范（严格遵守）：
1. 生成 3-5 个核心页面，覆盖 APP 主要功能流
2. 玻璃拟态风格：半透明卡片 rgba(255,255,255,0.08)，backdrop-filter: blur(20px)
3. 配色：主背景 linear-gradient(135deg, #0f0c29, #302b63, #24243e)，强调色 #667eea/#764ba2
4. 每个页面必须有：
   - 顶部状态栏 (y=0, h=44)：左"9:41"，右"📶 🔋"
   - 底部标签栏 (y=729, h=83)：4-5个 tab 图标+文字
   - 中间内容区：标题、卡片、按钮、输入框等
5. 每个页面 8-12 个元素
6. 所有文字用中文
7. 图片用 https://picsum.photos/宽/高
8. 元素不溢出画布
9. 页面间保持视觉一致性（相同的状态栏、标签栏、配色）
```

---

## 三、TypeScript 类型改造

### 新增类型 `types/index.ts`

```typescript
// 页面类型
export interface DesignPage {
  id: string
  name: string
  description?: string
  canvas: { width: number; height: number }
  elements: EditorElement[]
}

// 多页设计输出
export interface MultiPageDesignOutput {
  app: string
  style: string
  pages: DesignPage[]
}

// 编辑器状态改造
export interface EditorState {
  pages: DesignPage[]          // 所有页面
  activePageId: string         // 当前活跃页面 ID
  selectedElementIds: string[]
  canvas: {
    width: number
    height: number
    zoom: number
    x: number
    y: number
  }
  history: EditorHistory[]
  historyIndex: number
  isSaving?: boolean
}
```

---

## 四、Store 改造 `stores/editor.ts`

### 核心变更

```typescript
interface EditorStore extends EditorState {
  // 页面操作
  setPages: (pages: DesignPage[]) => void
  addPage: (page: DesignPage) => void
  removePage: (pageId: string) => void
  setActivePage: (pageId: string) => void
  updatePage: (pageId: string, updates: Partial<DesignPage>) => void
  getActivePage: () => DesignPage | undefined

  // 元素操作（作用于当前活跃页面）
  addElement: (element: Omit<EditorElement, 'id'>) => string
  addElements: (elements: Omit<EditorElement, 'id'>[]) => void
  updateElement: (id: string, updates: Partial<EditorElement>) => void
  deleteElement: (id: string) => void

  // 历史操作（按页面独立）
  saveHistory: (action: string) => void
  undo: () => void
  redo: () => void
}

const initialState: EditorState = {
  pages: [],
  activePageId: '',
  selectedElementIds: [],
  canvas: { width: 375, height: 812, zoom: 1, x: 0, y: 0 },
  history: [],
  historyIndex: -1,
  isSaving: false,
}
```

### 关键实现逻辑

```typescript
// 获取当前活跃页面
getActivePage: () => {
  const { pages, activePageId } = get()
  return pages.find(p => p.id === activePageId)
}

// 元素操作自动定位到活跃页面
addElement: (element) => {
  const id = generateId('element')
  const newElement = { ...element, id }
  const { pages, activePageId } = get()

  set({
    pages: pages.map(p =>
      p.id === activePageId
        ? { ...p, elements: [...p.elements, newElement] }
        : p
    )
  })
  get().saveHistory('Add Element')
  return id
}

// 切换页面时同步 canvas 尺寸
setActivePage: (pageId) => {
  const page = get().pages.find(p => p.id === pageId)
  if (page) {
    set({
      activePageId: pageId,
      canvas: { ...get().canvas, width: page.canvas.width, height: page.canvas.height },
      selectedElementIds: [],
    })
  }
}
```

---

## 五、Canvas 改造 `components/editor/canvas.tsx`

### 新增功能

1. **页面切换器** — 画布上方显示页面标签栏，点击切换
2. **页面缩略图** — 侧边栏显示所有页面的缩略预览
3. **当前页面渲染** — 只渲染 `activePage` 的元素

### 页面标签栏 UI

```
┌──────────────────────────────────────────┐
│ [< ] [启动页] [首页] [详情页] [个人中心] [ >] │
├──────────────────────────────────────────┤
│                                          │
│           当前页面画布内容                  │
│                                          │
└──────────────────────────────────────────┘
```

### Canvas 组件改动

```typescript
export const Canvas: React.FC<CanvasProps> = ({ className }) => {
  const { pages, activePageId, setActivePage } = useEditorStore()
  const activePage = pages.find(p => p.id === activePageId)

  return (
    <div className="relative h-full bg-gray-900 overflow-hidden">
      {/* 页面切换标签栏 */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-gray-800/90 z-10 flex items-center px-4 space-x-2">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.id)}
            className={cn(
              'px-3 py-1 text-xs rounded-md transition-colors',
              page.id === activePageId
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            )}
          >
            {page.name}
          </button>
        ))}
      </div>

      {/* 画布区域 - 渲染当前页面元素 */}
      <div className="absolute inset-0 top-10">
        {/* 现有画布逻辑，但用 activePage.elements 替代 elements */}
        {activePage?.elements.map((element) => (
          <CanvasElement key={element.id} element={element} ... />
        ))}
      </div>
    </div>
  )
}
```

---

## 六、AI 页面改造 `design/ai/page.tsx`

### 生成流程变更

```typescript
const handleGenerate = async () => {
  // ... 请求逻辑不变 ...

  if (result.success && result.data?.design) {
    const design = result.data.design  // MultiPageDesignOutput

    // 清空编辑器
    useEditorStore.getState().clear()

    // 设置所有页面
    const pages: DesignPage[] = design.pages.map((p, i) => ({
      id: p.id || `page-${i + 1}`,
      name: p.name || `页面 ${i + 1}`,
      description: p.description || '',
      canvas: p.canvas || { width: 375, height: 812 },
      elements: p.elements || [],
    }))

    useEditorStore.getState().setPages(pages)
    useEditorStore.getState().setActivePage(pages[0].id)

    showToast(`AI 生成了 ${pages.length} 个页面`, 'success')
    router.push('/design/editor')
  }
}
```

---

## 七、HTML 预览改造

### 多页预览布局

```
┌─────────────────────────────────────────────┐
│              APP名称 · 玻璃拟态风格            │
├──────────┬──────────┬──────────┬─────────────┤
│ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │             │
│ │启动页 │ │ │首页   │ │ │详情页 │ │   ← 第1行   │
│ │      │ │ │      │ │ │      │ │             │
│ └──────┘ │ └──────┘ │ └──────┘ │             │
├──────────┼──────────┼──────────┤             │
│ ┌──────┐ │ ┌──────┐ │          │             │
│ │个人中心│ │ │设置页 │ │          │   ← 第2行   │
│ │      │ │ │      │ │          │             │
│ └──────┘ │ └──────┘ │          │             │
└──────────┴──────────┴──────────┴─────────────┘
```

每行 3 个页面预览，超出自动换行。每个页面带 375x812 手机边框 + 状态栏 + 标签栏。

---

## 八、数据库兼容

### ai_generations 表

`design` 字段（JSON 类型）存储格式从：
```json
{ "canvas": {...}, "elements": [...] }
```
改为：
```json
{ "app": "...", "style": "...", "pages": [...] }
```

无需改表结构，JSON 字段天然兼容。

### projects 表

`data` 字段存储格式从：
```json
{ "elements": [...], "canvas": {...} }
```
改为：
```json
{ "pages": [...], "activePageId": "...", "canvas": {...} }
```

需要在加载旧项目时做兼容转换。

---

## 九、实施步骤

| 阶段 | 任务 | 文件 | 优先级 |
|------|------|------|--------|
| 1 | 新增 DesignPage 类型 | types/index.ts | P0 |
| 2 | 改造 Store 支持多页 | stores/editor.ts | P0 |
| 3 | 改造 SYSTEM_PROMPT | api/ai/generate/route.ts | P0 |
| 4 | 改造 AI 页面处理多页响应 | design/ai/page.tsx | P0 |
| 5 | 改造 Canvas 支持页面切换 | components/editor/canvas.tsx | P0 |
| 6 | 改造编辑器页面标签栏 | design/editor/page.tsx | P1 |
| 7 | 改造属性面板 | components/editor/properties-panel.tsx | P1 |
| 8 | 改造导出代码生成 | design/editor/page.tsx | P1 |
| 9 | 改造 HTML 预览 | dev_test/ | P2 |
| 10 | 旧数据兼容转换 | stores/editor.ts, api/projects/ | P2 |

---

## 十、风险点

1. **AI 输出量增大** — 3-5 页 x 10 个元素 = 30-50 个元素的 JSON，max_tokens 需要调大到 8000-12000
2. **MiMo 响应时间** — 多页生成可能需要 60-120 秒，前端需要更好的 loading 状态
3. **Store 复杂度** — 多页历史记录管理比单页复杂很多，undo/redo 需要按页面隔离
4. **向后兼容** — 旧的单页项目数据需要能正确加载
