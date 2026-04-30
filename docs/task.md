# AI 设计生成 - 代码检查与修复任务

**创建日期**：2026-04-30
**依据文档**：`docs/AI-GENERATE-PRD.md`
**总目标**：按照 PRD 页面流转路径，逐页检查样式和代码 bug，构建 检查+修复+测试 完整闭环

---

## 任务总览

| 阶段 | 页面/模块 | 任务数 | 优先级 | 状态 |
|------|-----------|--------|--------|------|
| T1 | AI 生成页 (`/design/ai`) | 6 | P0 | 待开始 |
| T2 | 后端 API (`/api/ai/generate`) | 5 | P0 | 待开始 |
| T3 | 编辑器 Store (`stores/editor.ts`) | 5 | P0 | 待开始 |
| T4 | 画布组件 (`canvas.tsx`) | 4 | P0 | 待开始 |
| T5 | 编辑器页面 (`/design/editor`) | 5 | P0 | 待开始 |
| T6 | 属性面板 (`properties-panel.tsx`) | 3 | P1 | 待开始 |
| T7 | 组件库 (`component-library.tsx`) | 2 | P1 | 待开始 |
| T8 | 工作区 (`/workspace`) | 3 | P1 | 待开始 |
| T9 | 项目 API (`/api/projects`) | 2 | P1 | 待开始 |
| T10 | 类型定义 (`types/index.ts`) | 2 | P1 | 待开始 |
| T11 | 全局测试与验证 | 6 | P0 | 待开始 |
| **合计** | | **43** | | |

---

## T1：AI 生成页 (`apps/web/app/design/ai/page.tsx`)

**目标**：SSE 流式接收、首屏快速跳转、后续页后台加载

### 1.1 代码 Bug

- [ ] **[Critical] 增量解析器 0 页问题**：后端 incremental JSON parser 在 buffer 有 4200 字符时仍提取 0 页。需验证修复后的 `for(;;)` + `inString` 跟踪逻辑是否正确工作，添加 buffer 内容日志定位根因
- [ ] **[Medium] `elements` 变量每次渲染重新创建**：`const elements = activePage?.elements ?? []` 在 useEffect 依赖中会导致每次渲染触发自动保存。改用 `useMemo` 或从 store selector 获取
- [ ] **[Medium] SSE 事件解析边界情况**：`sseBuffer.split('\n\n')` 在 chunk 边界恰好切断 `\n\n` 时可能丢事件。需验证 `events.pop()` 保留不完整片段的逻辑

### 1.2 样式检查

- [ ] **[Low] `<img>` 标签警告**：第 111 行使用 `<img>` 而非 Next.js `<Image />`，影响 LCP 性能。此为历史记录缩略图，影响较小，可添加 eslint-disable 注释
- [ ] **[Low] 按钮加载状态样式**：`streamProgress` 显示在按钮内，长时间生成时按钮文字过长可能溢出。检查 `truncate` 或 `max-width` 处理

### 1.3 测试验证

- [ ] 输入 prompt → 点击"开始设计" → 按钮变为"AI 正在生成中... Xs" → 首页到达后自动跳转编辑器

---

## T2：后端 API (`apps/web/app/api/ai/generate/route.ts`)

**目标**：SSE 流式响应正确推送 page 事件，增量解析可靠提取页面

### 2.1 代码 Bug

- [ ] **[Critical] 增量 JSON 解析器可靠性**：`buffer.indexOf('"pages"')` 依赖精确匹配，若 GLM 返回的 JSON 中 key 带空格（如 `"pages" :`）则找不到。已改为 `indexOf` 但仍需端到端测试验证
- [ ] **[Medium] fallback 整体解析的 buffer 残留**：增量解析后 `buffer` 可能残留不完整 JSON，fallback 解析时 `JSON.parse` 会失败。需确保 fallback 时 buffer 是完整 JSON
- [ ] **[Medium] `reasoning_content` 污染风险**：当前只读 `delta.content`，但若 GLM 某次更新改变字段名会静默失败。添加 `delta.reasoning_content` 检测日志
- [ ] **[Low] 数据库保存 fire-and-forget**：`prisma.aIGeneration.create().catch(() => {})` 静默吞掉错误，生产环境应至少 log

### 2.2 样式/规范检查

- [ ] **[Low] SYSTEM_PROMPT 元素数量**：PRD 要求 6-8 个元素，SYSTEM_PROMPT 写的也是 6-8，一致。确认无误

### 2.3 测试验证

- [ ] `curl -N` 流式请求 → 收到 `progress` 心跳 → 收到 `page` 事件（含 elements）→ 收到 `done` 事件
- [ ] 验证 buffer 日志：`[AI] stream done: 3 pages` 而非 `0 pages`

---

## T3：编辑器 Store (`apps/web/app/stores/editor.ts`)

**目标**：多页状态管理正确，历史记录/撤销/重做正常

### 3.1 代码 Bug

- [ ] **[Medium] `setElements` 无条件保存历史**：第 480 行 `saveHistory('Set Elements')` 在 `activePageId` 为空时仍执行，会保存一个空状态快照。改为仅在有 activePage 时保存
- [ ] **[Medium] `importState` 类型不安全**：`state.elements` 在新类型定义中是 `EditorElement[]`，但 `importState` 参数类型 `Partial<EditorState> & { elements?: EditorElement[] }` 可能传入 `pages` 和 `elements` 同时存在的情况，导致 `elements` 被忽略
- [ ] **[Low] `saveHistory` 快照深拷贝性能**：`JSON.parse(JSON.stringify(state.pages))` 对大页面数组（50+ 元素 × 5 页）可能卡顿。暂可接受，后续可用 `structuredClone` 替代

### 3.2 功能检查

- [ ] **[Medium] `setActivePage` 切换页面时清空选区**：当前实现正确（`selectedElementIds: []`），确认不影响其他操作
- [ ] **[Low] `removePage` 至少保留 1 页**：当前实现正确，确认边界行为

### 3.3 测试验证

- [ ] 添加 3 个页面 → 切换页面 → 元素隔离（各页面独立）
- [ ] 操作 → 撤销 → 重做 → 页面状态正确恢复

---

## T4：画布组件 (`apps/web/app/components/editor/canvas.tsx`)

**目标**：多页标签栏切换、元素渲染正确、画布交互正常

### 4.1 代码 Bug

- [ ] **[Medium] 初始居中 effect 缺少依赖**：第 135 行 `useEffect` 依赖 `[]` 但读取 `canvas.width/height/zoom`，切换页面后画布尺寸变化不会重新居中。依赖应加 `canvas.width, canvas.height, canvas.zoom`
- [ ] **[Low] `<img>` 标签警告**：第 60 行元素渲染中使用 `<img>`，同 T1.2 处理

### 4.2 样式检查

- [ ] **[Medium] 页签栏样式**：检查页签栏在页面数量多时的横向滚动表现，确保 `overflow-x-auto` 生效
- [ ] **[Low] 空状态引导**：当 `pages` 为空时显示引导文字，检查样式是否与整体风格一致

### 4.3 测试验证

- [ ] 添加新页面 → 标签栏出现新 tab → 画布切换到新页面
- [ ] 切换页面 → 元素列表更新 → 画布尺寸跟随页面配置

---

## T5：编辑器页面 (`apps/web/app/design/editor/page.tsx`)

**目标**：工具栏、快捷键、自动保存、代码导出适配多页

### 5.1 代码 Bug

- [ ] **[Medium] `elements` 变量每次渲染重新创建**：第 55 行 `const elements = activePage?.elements ?? []`，第 79 行 `useEffect` 依赖 `elements` 会每次触发自动保存。用 `useEditorStore(s => s.pages.find(...)?.elements ?? [])` 或 `useMemo` 修复
- [ ] **[Medium] `handleSave` 闭包陈旧**：第 92 行 `useEffect` 内的 `handleSave` 引用了外部函数，但依赖数组只有 `[canUndo, canRedo, undo, redo, showToast]`，缺少 `handleSave`。将 `handleSave` 移入 effect 内或用 `useCallback` 包裹
- [ ] **[Low] 快捷键 effect 依赖不完整**：eslint-disable 注释压制了 `react-hooks/exhaustive-deps` 警告，但 `handleSave` 确实缺失

### 5.2 样式检查

- [ ] **[Low] 工具栏页面名称显示**：检查当前页面名称是否在顶部状态栏正确显示
- [ ] **[Low] 导出格式选择器样式**：检查 react/vue/html 三个按钮的视觉一致性

### 5.3 测试验证

- [ ] Ctrl+S → 项目保存 → 刷新页面 → 恢复所有页面
- [ ] Ctrl+Z → 撤销操作 → Ctrl+Y → 重做

---

## T6：属性面板 (`apps/web/app/components/editor/properties-panel.tsx`)

**目标**：正确读写当前活跃页面的选中元素属性

### 6.1 代码 Bug

- [ ] **[Medium] `getActivePage()` 在渲染期间调用**：第 35 行 `const elements = getActivePage()?.elements ?? []` 直接在渲染函数中调用 store 方法，绕过了 Zustand 的订阅机制，activePage 变化时组件不会重新渲染。应改为 selector：`useEditorStore(s => s.pages.find(p => p.id === s.activePageId)?.elements ?? [])`
- [ ] **[Low] `selectedElement` 可能为 undefined**：`elements.find()` 可能返回 undefined，后续 `selectedElement.type` 访问会崩溃。当前有 `if (selectedElement)` 守卫，确认所有分支覆盖

### 6.2 样式检查

- [ ] **[Low] 属性面板空状态**：无选中元素时显示"选择元素查看属性"，检查样式

### 6.3 测试验证

- [ ] 选中元素 → 属性面板显示正确属性 → 修改属性 → 画布实时更新

---

## T7：组件库 (`apps/web/app/components/editor/component-library.tsx`)

**目标**：拖拽组件添加到当前活跃页面

### 7.1 代码 Bug

- [ ] **[Medium] 元素计数使用 `getState()`**：第 397 行 `useEditorStore.getState().getActivePage()?.elements.length` 使用 `getState()` 不会触发重渲染。改为 selector 方式
- [ ] **[Low] 拖拽添加元素**：确认 `addElement` 正确代理到 `_ensureActivePage()`

### 7.2 测试验证

- [ ] 拖拽按钮到画布 → 元素出现在当前页面 → 切换页面 → 新页面无此元素

---

## T8：工作区 (`apps/web/app/workspace/page.tsx`)

**目标**：正确加载和显示多页项目

### 8.1 代码 Bug

- [ ] **[Medium] `openProject` 多页格式判断**：检查 `data.pages && Array.isArray(data.pages)` 是否覆盖所有情况，包括 `pages: []` 空数组
- [ ] **[Low] 项目卡片信息**：当前未显示页面数量，用户无法区分单页和多页项目

### 8.2 样式检查

- [ ] **[Low] 项目卡片布局**：检查多页项目在卡片中的展示样式

### 8.3 测试验证

- [ ] 保存多页项目 → 工作区显示 → 打开 → 编辑器恢复多页状态

---

## T9：项目 API (`apps/web/app/api/projects/route.ts`)

**目标**：保存/加载多页项目数据

### 9.1 代码 Bug

- [ ] **[Medium] 项目不存在时降级创建**：`catch` 块捕获所有错误而非仅 `RecordNotFound`，可能掩盖其他数据库错误。应检查错误码
- [ ] **[Low] 更新与创建的字段一致性**：降级创建时 `ownerId` 字段与更新时的 `where: { id }` 逻辑不对称

### 9.2 测试验证

- [ ] POST 保存多页数据 → GET 加载 → 数据完整

---

## T10：类型定义 (`apps/web/app/types/index.ts`)

**目标**：类型完整、一致、无冗余

### 10.1 类型检查

- [ ] **[Medium] `DesignSnapshot` 与 `EditorState` 字段对齐**：`DesignSnapshot` 有 `elements?` 和 `pages?`，但 `EditorState` 只有 `pages`。确认 `DesignSnapshot` 仅用于快照场景
- [ ] **[Low] `AIGeneration.design` 联合类型**：`DesignOutput | MultiPageDesignOutput`，消费端需用类型守卫区分。确认所有消费端正确处理

### 10.2 验证

- [ ] `npx tsc --noEmit` 零类型错误（当前已通过）

---

## T11：全局测试与验证

**目标**：端到端流程正常，无回归

### 11.1 Lint 检查

- [ ] `npm run lint` 零 error（当前有 3 个 warning：2 个 img 标签、1 个 useEffect 依赖）

### 11.2 端到端流程

- [ ] **完整流程**：`/design/ai` 输入 prompt → 点击开始 → 按钮计时 → 首页到达跳转编辑器 → 后续页追加 tab → done toast
- [ ] **编辑器操作**：切换页面 → 添加元素 → 修改属性 → 删除 → 撤销/重做
- [ ] **保存加载**：保存项目 → 刷新 → 加载 → 多页状态完整恢复
- [ ] **代码导出**：导出 React/Vue/HTML → 代码包含所有页面

### 11.3 兼容性

- [ ] 旧单页项目数据 → `importState` 自动转为单页 → 正常编辑
- [ ] 旧 AI 历史记录 → 正确显示（单页格式）

### 11.4 边界测试

- [ ] 空项目（0 页面）→ 不崩溃 → `_ensureActivePage` 自动创建
- [ ] 5 页 × 10 元素 → 性能正常 → 撤销/重做不卡顿

---

## 修复优先级排序

```
第一轮（阻塞核心流程）：
  T2.1 增量解析器 0 页修复 → T1.1 SSE 事件处理验证 → T3.1 Store 逻辑

第二轮（渲染正确性）：
  T4.1 画布 effect 依赖 → T5.1 编辑器 elements 每次渲染 → T6.1 属性面板 selector

第三轮（体验优化）：
  T7.1 组件库 selector → T8.1 工作区 → T9.1 API 容错 → T10.1 类型对齐

第四轮（全局验证）：
  T11 Lint + 端到端 + 兼容性 + 边界测试
```

---

## 进度跟踪

| 阶段 | 总任务 | 已完成 | 进度 |
|------|--------|--------|------|
| T1 | 6 | 0 | 0% |
| T2 | 5 | 0 | 0% |
| T3 | 5 | 0 | 0% |
| T4 | 4 | 0 | 0% |
| T5 | 5 | 0 | 0% |
| T6 | 3 | 0 | 0% |
| T7 | 2 | 0 | 0% |
| T8 | 3 | 0 | 0% |
| T9 | 2 | 0 | 0% |
| T10 | 2 | 0 | 0% |
| T11 | 6 | 0 | 0% |
| **总计** | **43** | **0** | **0%** |
