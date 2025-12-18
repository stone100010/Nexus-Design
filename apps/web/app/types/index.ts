// 用户类型
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role: 'ADMIN' | 'USER' | 'GUEST'
  emailVerified?: Date
  createdAt: Date
  updatedAt: Date
}

// 项目类型
export interface Project {
  id: string
  name: string
  description?: string
  ownerId: string
  teamId?: string
  thumbnail?: string
  data?: any
  settings: ProjectSettings
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  owner?: User
  team?: Team
  versions?: Version[]
  _count?: {
    versions: number
    comments: number
  }
}

export interface ProjectSettings {
  theme: 'light' | 'dark'
  devices: string[]
  plugins?: {
    aiAssistant?: boolean
    collaboration?: boolean
  }
  export?: {
    formats: string[]
    includeComments: boolean
  }
}

// 团队类型
export interface Team {
  id: string
  name: string
  description?: string
  ownerId: string
  owner?: User
  members?: TeamMember[]
  createdAt: Date
  updatedAt: Date
}

export interface TeamMember {
  id: string
  teamId: string
  userId: string
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
  user?: User
  joinedAt: Date
}

// 版本类型
export interface Version {
  id: string
  projectId: string
  version: number
  name?: string
  data: any
  createdBy: string
  creator?: User
  message?: string
  changes?: any
  thumbnail?: string
  createdAt: Date
}

// 组件类型
export interface Component {
  id: string
  name: string
  type: string
  teamId?: string
  props: any
  styles: any
  events?: any
  category?: string
  tags: string[]
  version: number
  isPublic: boolean
  createdBy: string
  creator?: User
  createdAt: Date
  updatedAt: Date
}

// AI 生成类型
export interface AIGeneration {
  id: string
  userId: string
  projectId?: string
  prompt: string
  response: any
  model: string
  design?: any
  code?: any
  tokensUsed: number
  cost: number
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  errorMessage?: string
  user?: User
  project?: Project
  createdAt: Date
}

// 协作会话类型
export interface CollaborationSession {
  id: string
  projectId: string
  userId: string
  socketId: string
  cursor?: {
    x: number
    y: number
    color: string
    name?: string
  }
  selection: string[]
  isActive: boolean
  project?: Project
  user?: User
  joinedAt: Date
  lastActive: Date
}

// 评论类型
export interface Comment {
  id: string
  projectId: string
  userId: string
  elementId?: string
  content: string
  x?: number
  y?: number
  resolved: boolean
  parentId?: string
  replies?: Comment[]
  project?: Project
  user?: User
  createdAt: Date
  updatedAt: Date
}

// 文件类型
export interface File {
  id: string
  userId: string
  name: string
  url: string
  size: number
  mimeType: string
  provider: 'S3' | 'CLOUDINARY' | 'LOCAL'
  key?: string
  width?: number
  height?: number
  duration?: number
  user?: User
  createdAt: Date
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// UI 状态类型
export interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  selectedProjectId?: string
  selectedDevice?: string
  isCollaborating: boolean
}

// 编辑器状态类型
export interface EditorState {
  elements: EditorElement[]
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

export interface EditorElement {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  props: any
  styles: any
  children?: EditorElement[]
}

export interface EditorHistory {
  timestamp: Date
  action: string
  state: EditorState
}

// Auth 类型
export interface AuthSession {
  user?: User
  expires: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
}

// 设备预览类型
export interface Device {
  id: string
  name: string
  width: number
  height: number
  icon: string
  type: 'mobile' | 'tablet' | 'desktop'
}

export const DEVICES: Device[] = [
  { id: 'iphone-14-pro', name: 'iPhone 14 Pro', width: 390, height: 844, icon: '📱', type: 'mobile' },
  { id: 'iphone-14', name: 'iPhone 14', width: 390, height: 844, icon: '📱', type: 'mobile' },
  { id: 'android', name: 'Android', width: 360, height: 800, icon: '📱', type: 'mobile' },
  { id: 'ipad-pro', name: 'iPad Pro', width: 1024, height: 1366, icon: '📱', type: 'tablet' },
  { id: 'desktop', name: 'Desktop', width: 1440, height: 900, icon: '💻', type: 'desktop' },
  { id: 'tablet', name: 'Tablet', width: 768, height: 1024, icon: '📱', type: 'tablet' },
]

// AI 生成状态
export interface AIGenerationState {
  status: 'idle' | 'loading' | 'success' | 'error'
  progress: number
  result?: any
  error?: string
}

// 导出类型
export interface ExportOptions {
  format: 'react' | 'vue' | 'angular' | 'mini-program' | 'html'
  includeStyles: boolean
  includeComments: boolean
  minify: boolean
}

// 通知类型
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  read: boolean
  createdAt: Date
}

// 搜索过滤器
export interface SearchFilters {
  query: string
  tags: string[]
  category?: string
  dateRange?: {
    start: Date
    end: Date
  }
  sortBy?: 'name' | 'date' | 'size'
  order?: 'asc' | 'desc'
}

// 分页参数
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  order?: 'asc' | 'desc'
}

// 排序方向
export type SortOrder = 'asc' | 'desc'

// 通用响应错误
export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
}

// WebSocket 事件类型
export interface WebSocketEvent {
  type: string
  payload: any
  timestamp: Date
  userId?: string
  projectId?: string
}

// 评论位置
export interface CommentPosition {
  x: number
  y: number
  elementId?: string
}

// 设计画布配置
export interface CanvasConfig {
  width: number
  height: number
  zoom: number
  background: string
  grid: boolean
  snapToGrid: boolean
  gridSize: number
}

// 组件属性
export interface ComponentProps {
  [key: string]: any
}

// 样式属性
export interface StyleProps {
  [key: string]: any
}

// 事件处理器
export interface EventHandler {
  event: string
  action: string
  params?: any
}

// 模板类型
export interface Template {
  id: string
  name: string
  description: string
  thumbnail: string
  data: any
  tags: string[]
  category: string
  isPublic: boolean
  createdAt: Date
}

// 主题配置
export interface ThemeConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
    border: string
  }
  fonts: {
    heading: string
    body: string
  }
  radius: number
}

// 快捷键配置
export interface Shortcut {
  id: string
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: string
  description: string
}
