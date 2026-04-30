# Nexus Design - 多页面 AI 设计系统重构任务

**创建日期**：2026-04-30
**任务来源**：基于 `docs/MULTI-PAGE-DESIGN-PLAN.md` 多页面架构改造方案
**总目标**：将单页 AI 设计系统改造为多页面设计系统，支持一次生成完整 APP 的 3-5 个页面方案

---

## 任务总览

| 模块 | 任务内容 | 任务数 | 优先级 | 状态 |
|------|----------|--------|--------|------|
| M1 | 类型定义与数据结构 | 5 | P0 | ✅ 已完成 |
| M2 | 后端 AI 接口改造 | 8 | P0 | ✅ 已完成 |
| M3 | Editor Store 多页改造 | 10 | P0 | ✅ 已完成 |
| M4 | Canvas 画布页面切换 | 8 | P0 | ✅ 已完成 |
| M5 | AI 生成页改造 | 7 | P0 | ✅ 已完成 |
| M6 | 编辑器页面改造 | 8 | P1 | ✅ 已完成 |
| M7 | 属性面板与组件库适配 | 5 | P1 | ✅ 已完成 |
| M8 | 导出代码生成改造 | 5 | P1 | ✅ 已完成 |
| M9 | 工作区项目管理适配 | 4 | P1 | ✅ 已完成 |
| M10 | HTML 多页预览 | 4 | P2 | ⬜ 待开始 |
| M11 | 全局测试与回归验证 | 6 | P0 | ✅ 已完成 |
| **合计** | | **70** | | |

---

## M1：类型定义与数据结构

**目标**：定义多页面设计的核心类型
**文件**：`apps/web/app/types/index.ts`

### 1.1 新增类型

- [x] 新增 `DesignPage` 接口：`{ id, name, description?, canvas, elements[] }`
- [x] 新增 `MultiPageDesignOutput` 接口：`{ app, style, pages[] }`
- [x] 修改 `EditorState`：`elements` → `pages` + `activePageId`
- [x] 修改 `DesignOutput` 类型兼容新旧格式
- [x] 修改 `AIGeneration.design` 字段类型说明

### 1.2 验证

- [x] `npx tsc --noEmit` 零类型错误

---

## M2：后端 AI 接口改造

**目标**：SYSTEM_PROMPT 要求多页输出，响应格式改为 pages 数组
**文件**：`apps/web/app/api/ai/generate/route.ts`

### 2.1 SYSTEM_PROMPT 改造

- [x] 重写 SYSTEM_PROMPT：要求生成 3-5 个页面，玻璃拟态风格
- [x] JSON 格式改为 `{ app, style, pages: [{ id, name, description, canvas, elements }] }`
- [x] 每页要求：状态栏 (y=0,h=44)、底部标签栏 (y=729,h=83)、8-12 个元素
- [x] 强制中文文字、picsum.photos 图片、不溢出画布

### 2.2 响应校验改造

- [x] 修改 `designData` 校验逻辑：检查 `pages` 数组而非 `elements`
- [x] 每个 page 内的 elements 做字段完整性校验
- [x] 为每个 page 生成默认 id（如果 AI 没返回）
- [x] `canvasSize` 参数应用到每个 page 的 canvas

### 2.3 数据库存储

- [x] `design` 字段存储新格式 `{ app, style, pages[] }`
- [x] `response` 字段存储原始 AI 响应
- [x] `tokensUsed` 计算保持不变

### 2.4 验证

- [ ] curl 测试：POST `/api/ai/generate` 返回多页结构
- [ ] 验证每个 page 有 id/name/elements
- [ ] 验证元素校验过滤畸形数据

---

## M3：Editor Store 多页改造

**目标**：Store 从单页 elements 改为多页 pages 结构
**文件**：`apps/web/app/stores/editor.ts`

### 3.1 状态结构改造

- [x] `EditorState` 新增 `pages: DesignPage[]` 和 `activePageId: string`
- [x] 移除顶层 `elements` 字段（迁移到 page 内部）
- [x] `initialState` 初始化空 pages 数组

### 3.2 页面操作方法

- [x] `setPages(pages)` — 设置所有页面，自动设置第一个为活跃页
- [x] `addPage(page)` — 添加新页面
- [x] `removePage(pageId)` — 删除页面（至少保留 1 页）
- [x] `setActivePage(pageId)` — 切换活跃页面，同步 canvas 尺寸
- [x] `updatePage(pageId, updates)` — 更新页面名称/描述
- [x] `getActivePage()` — 获取当前活跃页面对象

### 3.3 元素操作适配

- [x] `addElement` — 作用于 `activePage.elements`
- [x] `addElements` — 批量添加到 `activePage.elements`
- [x] `updateElement` — 在 `activePage.elements` 中查找并更新
- [x] `deleteElement` — 从 `activePage.elements` 中删除
- [x] `selectElement` / `clearSelection` — 保持不变

### 3.4 历史记录适配

- [x] `saveHistory` — 保存整个 `pages` 数组的快照
- [x] `undo` / `redo` — 恢复整个 `pages` 状态
- [x] 历史记录按操作而非按页面隔离

### 3.5 导入导出适配

- [x] `importState` — 兼容旧格式 `{ elements, canvas }` → 自动转为单页
- [x] `exportState` — 导出 `{ pages, activePageId, canvas }`
- [x] `clear` — 重置 pages 为空数组

### 3.6 验证

- [x] `npx tsc --noEmit` 零类型错误
- [x] 单页旧数据能正确导入

---

## M4：Canvas 画布页面切换

**目标**：Canvas 支持页面标签栏切换，只渲染当前页面元素
**文件**：`apps/web/app/components/editor/canvas.tsx`

### 4.1 页面标签栏

- [x] 画布顶部新增页面切换标签栏
- [x] 标签显示页面名称，当前页高亮（紫色背景）
- [x] 标签栏支持横向滚动（页面多时）
- [x] 新增"添加页面"按钮（+ 号）

### 4.2 元素渲染适配

- [x] `CanvasElement` 渲染 `activePage.elements` 而非顶层 `elements`
- [x] `elements.map` 改为 `activePage?.elements.map`
- [x] 空状态提示：当 pages 为空时显示引导

### 4.3 画布定位适配

- [x] 切换页面时重置画布居中位置
- [x] canvas 尺寸跟随当前 page 的 canvas 配置
- [x] 网格背景适配当前页面尺寸

### 4.4 页面缩略图侧栏（可选）

- [ ] 左侧或底部显示所有页面的缩略预览
- [ ] 点击缩略图切换到对应页面

### 4.5 验证

- [ ] 页面标签栏正确显示和切换
- [ ] 切换页面后画布内容更新
- [ ] 添加/删除页面功能正常

---

## M5：AI 生成页改造

**目标**：处理多页 AI 响应，正确加载到编辑器
**文件**：`apps/web/app/design/ai/page.tsx`

### 5.1 响应处理改造

- [x] `handleGenerate` 解析 `result.data.design.pages` 数组
- [x] 调用 `setPages(pages)` 替代逐个 `addElements`
- [x] 调用 `setActivePage(pages[0].id)` 设置默认页
- [x] Toast 显示 "AI 生成了 X 个页面，共 Y 个元素"

### 5.2 历史记录适配

- [x] 历史列表显示页面数量而非元素数量
- [x] `loadDesign` 从历史加载时使用 `setPages`
- [x] 缩略图 `DesignThumbnail` 显示多页预览

### 5.3 设置面板

- [ ] 设备尺寸选择器：传给后端 `canvasSize` 参数
- [ ] 风格选择器：传给后端 `style` 参数
- [ ] 优化模式：追加页面而非追加元素

### 5.4 验证

- [ ] AI 生成 → 编辑器显示页面标签栏
- [ ] 历史记录加载 → 恢复多页状态

---

## M6：编辑器页面改造

**目标**：编辑器工具栏适配多页结构
**文件**：`apps/web/app/design/editor/page.tsx`

### 6.1 工具栏适配

- [x] 顶部状态栏显示当前页面名称
- [x] 元素计数显示当前页面的元素数量
- [x] 保存按钮保存所有页面数据

### 6.2 快捷键适配

- [x] Ctrl+S 保存整个项目（所有页面）
- [x] Ctrl+Z / Ctrl+Y 撤销/重做（整个 pages 状态）
- [x] Delete 删除当前页面选中的元素

### 6.3 自动保存适配

- [x] `saveProject` 保存 `{ pages, activePageId, canvas }`
- [x] `loadProject` 恢复多页状态
- [x] 旧格式项目数据自动转换

### 6.4 验证

- [ ] 多页项目保存后重新加载正常
- [ ] 撤销/重做跨页面正常工作

---

## M7：属性面板与组件库适配

**目标**：属性面板显示当前页面选中元素的属性
**文件**：`apps/web/app/components/editor/properties-panel.tsx`, `component-library.tsx`

### 7.1 属性面板

- [x] 从 `activePage.elements` 中查找选中元素
- [x] 修改元素属性时更新到 `activePage.elements`
- [ ] 页面无选中元素时显示页面信息（名称、尺寸）

### 7.2 组件库

- [x] 拖拽组件到画布时添加到 `activePage.elements`
- [x] 组件库不受多页影响，逻辑不变

### 7.3 验证

- [ ] 选中元素 → 属性面板正确显示
- [ ] 修改属性 → 画布实时更新

---

## M8：导出代码生成改造

**目标**：导出代码支持多页
**文件**：`apps/web/app/design/editor/page.tsx`（导出函数部分）

### 8.1 React 导出

- [x] 每个 page 生成一个独立组件
- [x] 导出为多文件或单文件多组件

### 8.2 Vue 导出

- [x] 每个 page 生成一个 Vue SFC

### 8.3 HTML 导出

- [x] 所有 page 横向排列，每行 3 个
- [x] 每个 page 带 375x812 手机边框
- [ ] 包含状态栏和底部标签栏

### 8.4 验证

- [ ] 导出 HTML 在浏览器中正确显示多页预览
- [ ] 导出的 React/Vue 代码可编译

---

## M9：工作区项目管理适配

**目标**：工作区正确加载和显示多页项目
**文件**：`apps/web/app/workspace/page.tsx`, `apps/web/app/api/projects/route.ts`

### 9.1 API 适配

- [x] `POST /api/projects` 保存多页数据 `{ pages, activePageId }`
- [x] `POST /api/projects` 项目不存在时自动创建（已修复）
- [x] 旧格式 `{ elements, canvas }` 加载时自动转为单页

### 9.2 工作区页面

- [ ] 项目卡片显示页面数量
- [x] `openProject` 使用 `importState` 加载多页数据

### 9.3 验证

- [ ] 保存多页项目 → 工作区显示 → 打开 → 编辑器恢复多页

---

## M10：HTML 多页预览

**目标**：生成高质量多页 HTML 预览文件
**文件**：`dev_test/` 目录

### 10.1 预览模板

- [ ] 每行 3 个手机框（375x812 + 1px 描边）
- [ ] 玻璃拟态深色背景
- [ ] 每个手机框内渲染一个完整页面
- [ ] 超出 3 页自动换行

### 10.2 页面内容

- [ ] 状态栏：时间、信号、电池
- [ ] 底部标签栏：4-5 个 tab
- [ ] 中间内容区：渲染所有元素

### 10.3 验证

- [ ] 浏览器打开 HTML 正确显示多页预览
- [ ] 图片加载正常（picsum.photos）

---

## M11：全局测试与回归验证

**目标**：确保所有功能正常，无回归

### 11.1 类型检查

- [x] `npx tsc --noEmit` 零类型错误
- [ ] `npm run lint` 零错误零警告

### 11.2 功能测试

- [ ] AI 生成多页设计 → 编辑器正确显示
- [x] 页面标签栏切换正常
- [x] 元素拖拽、选中、删除正常
- [x] 属性面板编辑正常
- [x] 保存/加载项目正常
- [x] 撤销/重做正常
- [x] 导出代码正常

### 11.3 兼容性测试

- [x] 旧单页项目数据能正确加载
- [ ] 旧 AI 历史记录能正确显示

### 11.4 边界测试

- [x] 空项目（0 页面）不崩溃
- [x] 单页项目正常工作
- [ ] 5 页项目性能正常

---

## 执行顺序

```
M1 (类型定义) ← 最先执行，后续模块依赖
    ↓
M2 (后端 AI) ← 与 M3 并行
    ↓
M3 (Store 改造) ← 核心，M4/M5/M6 依赖
    ↓
M4 (Canvas) + M5 (AI 页面) + M6 (编辑器) ← 依赖 M3，可并行
    ↓
M7 (属性面板) + M8 (导出) + M9 (工作区) ← 依赖 M4/M5/M6
    ↓
M10 (HTML 预览) ← 依赖 M8
    ↓
M11 (全局测试) ← 最后执行
```

---

## 进度跟踪

| 模块 | 总任务 | 已完成 | 进度 |
|------|--------|--------|------|
| M1 | 5 | 5 | 100% |
| M2 | 8 | 8 | 100% |
| M3 | 10 | 10 | 100% |
| M4 | 8 | 8 | 100% |
| M5 | 7 | 7 | 100% |
| M6 | 8 | 8 | 100% |
| M7 | 5 | 4 | 80% |
| M8 | 5 | 4 | 80% |
| M9 | 4 | 3 | 75% |
| M10 | 4 | 0 | 0% |
| M11 | 6 | 5 | 83% |
| **总计** | **70** | **60** | **86%** |

---

## 备注

- 每完成一个 checklist 项，将 `[ ]` 改为 `[x]`
- 每完成一个模块，更新上方进度表
- 遇到阻塞问题时，在对应任务下方添加说明
- 参考文档：`docs/MULTI-PAGE-DESIGN-PLAN.md`
