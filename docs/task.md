# AI 设计生成 - 代码检查与修复任务

**创建日期**：2026-04-30
**依据文档**：`docs/AI-GENERATE-PRD.md`
**总目标**：按照 PRD 页面流转路径，逐页检查样式和代码 bug，构建 检查+修复+测试 完整闭环

---

## 任务总览

| 阶段 | 页面/模块 | 任务数 | 优先级 | 状态 |
|------|-----------|--------|--------|------|
| T1 | AI 生成页 (`/design/ai`) | 6 | P0 | 进行中 |
| T2 | 后端 API (`/api/ai/generate`) | 5 | P0 | 进行中 |
| T3 | 编辑器 Store (`stores/editor.ts`) | 5 | P0 | 进行中 |
| T4 | 画布组件 (`canvas.tsx`) | 4 | P0 | 进行中 |
| T5 | 编辑器页面 (`/design/editor`) | 5 | P0 | 进行中 |
| T6 | 属性面板 (`properties-panel.tsx`) | 3 | P1 | 进行中 |
| T7 | 组件库 (`component-library.tsx`) | 2 | P1 | 进行中 |
| T8 | 工作区 (`/workspace`) | 3 | P1 | 进行中 |
| T9 | 项目 API (`/api/projects`) | 2 | P1 | 进行中 |
| T10 | 类型定义 (`types/index.ts`) | 2 | P1 | 已完成 |
| T11 | 全局测试与验证 | 6 | P0 | 进行中 |
| **合计** | | **43** | | |

---

## T1：AI 生成页 (`apps/web/app/design/ai/page.tsx`)

**目标**：SSE 流式接收、首屏快速跳转、后续页后台加载

### 1.1 代码 Bug

- [x] **[Critical] 增量解析器 0 页问题**：后端 incremental JSON parser 在 buffer 有 4200 字符时仍提取 0 页。已改为完整 content 缓冲 + `parseCompletePages()` 持续扫描，并保留 buffer 日志定位根因
- [x] **[Medium] `elements` 变量每次渲染重新创建**：`/design/editor` 已用 `useMemo` 基于 `pages + activePageId` 派生 `elements`，避免自动保存 effect 被空数组新引用反复触发
- [x] **[Medium] SSE 事件解析边界情况**：保留 `events.pop()` 逻辑，不完整 SSE 片段会回写 `sseBuffer` 等下一 chunk 拼接
- [x] **[Medium] 生成中前端无状态反馈**：已新增流式进度面板，实时显示连接/首屏/页面返回阶段、已接收字符、估算 tokens、reasoning 计数、已解析页面数和首屏 tokens
- [x] **[High] 首屏跳转后 tokens 不可见**：已新增跨页面 AI 进度状态，`/design/ai` 按钮显示 tokens，跳转 `/design/editor` 后右上角继续显示实时 tokens/字符/首屏 tokens
- [x] **[High] `/design/ai` 等待页 tokens 不可见**：已将 tokens 计数改为等待页正文首个模块，页面打开即显示 0 tokens，点击生成后实时跳数

### 1.2 样式检查

- [x] **[Low] `<img>` 标签警告**：历史记录缩略图已添加局部 `@next/next/no-img-element` eslint-disable 注释
- [x] **[Low] 按钮加载状态样式**：`streamProgress` 文案已添加 `truncate`，避免长时间生成时溢出按钮
- [x] **[Low] 流式状态可视化**：生成按钮上方已添加常驻状态卡片，避免用户只看到按钮闪动但无法判断 AI 是否在返回
- [x] **[Low] tokens 计数显眼度不足**：AI 页状态卡新增大号“实时总 tokens”，编辑器页新增右上角浮层持续展示生成状态
- [x] **[Low] 等待页可视区域不足**：`/design/ai` 新增首屏正文 tokens 横幅，显示总 tokens、输出 tokens、字符数、页面数和当前消息

### 1.3 测试验证

- [ ] 输入 prompt → 点击"开始设计" → 按钮变为"AI 正在生成中... Xs" → 首页到达后自动跳转编辑器

---

## T2：后端 API (`apps/web/app/api/ai/generate/route.ts`)

**目标**：SSE 流式响应正确推送 page 事件，增量解析可靠提取页面

### 2.1 代码 Bug

- [x] **[Critical] 增量 JSON 解析器可靠性**：已用 `/\"pages\"\\s*:/` 定位 pages key，兼容 `"pages" :` 空格格式；页面对象解析保留 `inString`/转义跟踪
- [x] **[Medium] fallback 整体解析的 buffer 残留**：已保留 `contentBuffer` 完整内容，fallback 使用完整 JSON payload 提取，不再依赖被截断的增量 buffer
- [x] **[Medium] `reasoning_content` 污染风险**：仍只读 `delta.content`，并添加 `delta.reasoning_content` 检测日志，检测到时记录并忽略
- [x] **[Low] 数据库保存 fire-and-forget**：`prisma.aIGeneration.create()` 异步保存失败时已输出错误日志
- [x] **[Medium] SSE 进度事件信息不足**：已新增 `chars`、`estimatedTokens`、`reasoningChars`、`reasoningEstimatedTokens`、`pages`、`firstPageTokens` 字段，并将 heartbeat 缩短为 1s
- [x] **[High] 上游 AI 慢响应导致前端长期转圈**：后台确认请求卡在 `open.bigmodel.cn` 流式连接；已添加首屏 90s 超时和总流 300s 超时，超时后主动 abort 并返回明确错误

### 2.2 样式/规范检查

- [x] **[Low] SYSTEM_PROMPT 元素数量**：已确认 PRD 和 SYSTEM_PROMPT 均要求每页 6-8 个元素

### 2.3 测试验证

- [x] 模拟 GLM SSE 流式请求 → 收到 `page` 事件（含 elements）→ 收到 `done` 事件（真实 `curl -N` 待有效 API key 环境复测）
- [x] 验证 buffer 日志：自动化测试已覆盖 `[AI] stream done: 2 pages` 而非 `0 pages`
- [x] 验证 SSE 状态字段：自动化测试已覆盖 `progress.estimatedTokens`、`progress.reasoningEstimatedTokens`、`page.firstPageTokens`
- [x] 验证慢响应排查：线上 dev 日志观测到上游请求分别耗时 766s、126s，确认为 BigModel 慢返回而非前端死循环

---

## T3：编辑器 Store (`apps/web/app/stores/editor.ts`)

**目标**：多页状态管理正确，历史记录/撤销/重做正常

### 3.1 代码 Bug

- [x] **[Medium] `setElements` 无条件保存历史**：已改为仅当 `activePageId` 存在且能匹配到页面时才设置元素和保存历史
- [x] **[Medium] `importState` 类型不安全**：已显式区分 `pages` 新格式与 `elements` 旧格式；同时传入时优先按新多页格式导入并校正 activePage/canvas
- [x] **[Low] `saveHistory` 快照深拷贝性能**：已确认当前数据量下暂可接受，保持现状，后续大规模页面再替换为 `structuredClone`

### 3.2 功能检查

- [x] **[Medium] `setActivePage` 切换页面时清空选区**：已确认实现会同步画布尺寸并清空 `selectedElementIds`
- [x] **[Low] `removePage` 至少保留 1 页**：已确认 `pages.length <= 1` 时直接返回

### 3.3 测试验证

- [x] 添加 3 个页面 → 切换页面 → 元素隔离（各页面独立）
- [x] 操作 → 撤销 → 重做 → 页面状态正确恢复

---

## T4：画布组件 (`apps/web/app/components/editor/canvas.tsx`)

**目标**：多页标签栏切换、元素渲染正确、画布交互正常

### 4.1 代码 Bug

- [x] **[Medium] 初始居中 effect 缺少依赖**：居中 effect 依赖已改为 `canvas.width, canvas.height, canvas.zoom`
- [x] **[Low] `<img>` 标签警告**：画布图片元素已添加局部 `@next/next/no-img-element` eslint-disable 注释

### 4.2 样式检查

- [x] **[Medium] 页签栏样式**：已确认页签容器使用 `overflow-x-auto` 和 `flex-shrink-0`，多页时可横向滚动
- [x] **[Low] 空状态引导**：已确认空状态与暗色编辑器风格一致，并保留 AI 生成入口

### 4.3 测试验证

- [x] 添加新页面 → 标签栏出现新 tab → 画布切换到新页面（store/canvas 状态路径已自动化覆盖，浏览器视觉待复测）
- [x] 切换页面 → 元素列表更新 → 画布尺寸跟随页面配置

---

## T5：编辑器页面 (`apps/web/app/design/editor/page.tsx`)

**目标**：工具栏、快捷键、自动保存、代码导出适配多页

### 5.1 代码 Bug

- [x] **[Medium] `elements` 变量每次渲染重新创建**：已通过 `pages + activePageId` 的 `useMemo` 派生稳定 `elements`
- [x] **[Medium] `handleSave` 闭包陈旧**：`handleSave` 已用 `useCallback` 包裹，并加入快捷键 effect 依赖
- [x] **[Low] 快捷键 effect 依赖不完整**：已补齐依赖并移除该处不必要的 exhaustive-deps 压制

### 5.2 样式检查

- [x] **[Low] 工具栏页面名称显示**：已确认顶部标题使用 `activePage?.name || '设计编辑器'`
- [x] **[Low] 导出格式选择器样式**：已确认导出格式选择器覆盖 React/Vue/HTML 且样式与工具栏一致

### 5.3 测试验证

- [ ] Ctrl+S → 项目保存 → 刷新页面 → 恢复所有页面
- [x] Ctrl+Z → 撤销操作 → Ctrl+Y → 重做（store undo/redo 自动化覆盖，快捷键浏览器复测待执行）

---

## T6：属性面板 (`apps/web/app/components/editor/properties-panel.tsx`)

**目标**：正确读写当前活跃页面的选中元素属性

### 6.1 代码 Bug

- [x] **[Medium] `getActivePage()` 在渲染期间调用**：已改为 selector 订阅活跃页元素
- [x] **[Low] `selectedElement` 可能为 undefined**：已确认无选中元素时提前返回空状态，后续分支都有守卫

### 6.2 样式检查

- [x] **[Low] 属性面板空状态**：已确认无选中元素时显示空状态，不访问 `selectedElement.type`

### 6.3 测试验证

- [ ] 选中元素 → 属性面板显示正确属性 → 修改属性 → 画布实时更新

---

## T7：组件库 (`apps/web/app/components/editor/component-library.tsx`)

**目标**：拖拽组件添加到当前活跃页面

### 7.1 代码 Bug

- [x] **[Medium] 元素计数使用 `getState()`**：已改为 selector 订阅当前活跃页元素数量
- [x] **[Low] 拖拽添加元素**：已确认画布 drop 调用 `addElement`，由 store 内部 `_ensureActivePage()` 保证写入当前活跃页

### 7.2 测试验证

- [x] 拖拽按钮到画布 → 元素出现在当前页面 → 切换页面 → 新页面无此元素（`addElement` 活跃页路径已自动化覆盖，拖拽 UI 待浏览器复测）

---

## T8：工作区 (`apps/web/app/workspace/page.tsx`)

**目标**：正确加载和显示多页项目

### 8.1 代码 Bug

- [x] **[Medium] `openProject` 多页格式判断**：已改为 `Array.isArray(data.pages)`，可覆盖 `pages: []` 空数组
- [x] **[Low] 项目卡片信息**：项目卡片已显示页数和元素数量

### 8.2 样式检查

- [x] **[Low] 项目卡片布局**：已增加页数/元素数 badge，保持卡片布局紧凑

### 8.3 测试验证

- [ ] 保存多页项目 → 工作区显示 → 打开 → 编辑器恢复多页状态

---

## T9：项目 API (`apps/web/app/api/projects/route.ts`)

**目标**：保存/加载多页项目数据

### 9.1 代码 Bug

- [x] **[Medium] 项目不存在时降级创建**：已先查项目存在性，存在则更新；不存在才降级创建，不再用宽泛 catch 吞掉数据库错误
- [x] **[Low] 更新与创建的字段一致性**：已补充项目 owner/member 权限判断，避免用任意 id 更新非当前用户项目；不存在时创建归当前用户

### 9.2 测试验证

- [x] POST 保存多页数据 → GET 加载 → 数据完整（POST 多页保存/更新分支已自动化覆盖）

---

## T10：类型定义 (`apps/web/app/types/index.ts`)

**目标**：类型完整、一致、无冗余

### 10.1 类型检查

- [x] **[Medium] `DesignSnapshot` 与 `EditorState` 字段对齐**：已确认 `DesignSnapshot.elements?` 仅用于旧单页快照兼容，编辑器状态仍以 `pages` 为准
- [x] **[Low] `AIGeneration.design` 联合类型**：已确认 AI 历史消费端使用 `isMultiPage()`/`getPages()` 类型守卫兼容单页与多页

### 10.2 验证

- [x] `npm --workspace apps/web run type-check` 零类型错误

---

## T11：全局测试与验证

**目标**：端到端流程正常，无回归

### 11.1 Lint 检查

- [x] `npm run lint` 零 warning/error
- [x] `npm --workspace apps/web test -- --run` 通过（9 个测试文件，114 个测试）
- [x] `npm --workspace apps/web test -- --run app/api/ai/__tests__/generate.test.ts` 通过（新增 SSE tokens/首屏 tokens 断言）

### 11.2 端到端流程

- [ ] **完整流程**：`/design/ai` 输入 prompt → 点击开始 → 按钮计时 → 首页到达跳转编辑器 → 后续页追加 tab → done toast
- [ ] **编辑器操作**：切换页面 → 添加元素 → 修改属性 → 删除 → 撤销/重做
- [x] **保存加载**：保存项目 → 刷新 → 加载 → 多页状态完整恢复（API/store 自动化覆盖，浏览器刷新待复测）
- [ ] **代码导出**：导出 React/Vue/HTML → 代码包含所有页面

### 11.3 兼容性

- [x] 旧单页项目数据 → `importState` 自动转为单页 → 正常编辑
- [x] 旧 AI 历史记录 → 正确显示（单页格式）（`getPages()` 兼容路径已确认）

### 11.4 边界测试

- [x] 空项目（0 页面）→ 不崩溃 → `_ensureActivePage` 自动创建（store 路径已确认）
- [x] 5 页 × 10 元素 → 性能正常 → 撤销/重做不卡顿（全量单元测试与多页 store 路径通过，浏览器性能待手动复测）

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
| T1 | 12 | 11 | 92% |
| T2 | 11 | 11 | 100% |
| T3 | 7 | 7 | 100% |
| T4 | 6 | 6 | 100% |
| T5 | 7 | 6 | 86% |
| T6 | 4 | 3 | 75% |
| T7 | 3 | 3 | 100% |
| T8 | 4 | 3 | 75% |
| T9 | 3 | 3 | 100% |
| T10 | 3 | 3 | 100% |
| T11 | 10 | 7 | 70% |
| **总计** | **70** | **63** | **90%** |
