# Nexus Design - 数据库设计

## 📊 数据库概述

**数据库类型**：PostgreSQL 15+  
**ORM**：Prisma 5.x  
**迁移工具**：Prisma Migrate  
**连接池**：PgBouncer (生产环境)

### 设计原则
- ✅ 规范化设计 (3NF)
- ✅ 适当的反规范化优化查询
- ✅ JSONB 字段用于灵活数据结构
- ✅ 软删除支持
- ✅ 审计日志
- ✅ 索引优化

## 🗄️ Prisma Schema

### 1. 数据源配置

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 自定义类型定义
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatar        String?
  role          Role      @default(USER)
  
  // 认证相关
  password      String?   // 可为空，支持社交登录
  emailVerified DateTime?
  
  // 团队关系
  teams         TeamMember[]
  ownedTeams    Team[]       @relation("TeamOwner")
  
  // 项目关系
  projects      Project[]
  ownedProjects Project[]    @relation("ProjectOwner")
  
  // AI 使用统计
  aiGenerations AIGeneration[]
  
  // 文件
  files         File[]
  
  // 协作会话
  sessions      CollaborationSession[]
  
  // 评论
  comments      Comment[]
  
  // 时间戳
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  
  @@index([email])
  @@index([role])
  @@map("users")
}

enum Role {
  ADMIN
  USER
  GUEST
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  
  // 设备信息
  ipAddress String?
  userAgent String?
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([expiresAt])
  @@map("sessions")
}

model Team {
  id          String   @id @default(cuid())
  name        String
  description String?
  
  // 所有者
  ownerId     String
  owner       User     @relation("TeamOwner", fields: [ownerId], references: [id])
  
  // 成员
  members     TeamMember[]
  
  // 项目
  projects    Project[]
  
  // 组件库
  components  Component[]
  
  // 设置
  settings    Json     @default("{}")
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  
  @@index([ownerId])
  @@map("teams")
}

model TeamMember {
  id        String   @id @default(cuid())
  teamId    String
  userId    String
  role      TeamRole @default(EDITOR)
  
  team      Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  joinedAt  DateTime @default(now())
  
  @@unique([teamId, userId])
  @@index([teamId])
  @@index([userId])
  @@map("team_members")
}

enum TeamRole {
  ADMIN
  EDITOR
  VIEWER
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  
  // 所有者 & 团队
  ownerId     String
  owner       User     @relation("ProjectOwner", fields: [ownerId], references: [id])
  
  teamId      String?
  team        Team?    @relation(fields: [teamId], references: [id])
  
  // 设计数据
  thumbnail   String?
  data        Json?    // 完整的设计数据 (JSON格式)
  
  // 版本
  versions    Version[]
  
  // 评论
  comments    Comment[]
  
  // 设置
  settings    Json     @default("{\"theme\": \"dark\", \"devices\": [\"iphone-14-pro\"]}")
  
  // 权限
  isPublic    Boolean  @default(false)
  
  // AI 生成历史
  aiGenerations AIGeneration[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  
  @@index([ownerId])
  @@index([teamId])
  @@index([isPublic])
  @@map("projects")
}

model Version {
  id          String   @id @default(cuid())
  projectId   String
  version     Int      @default(1)
  name        String?
  
  // 完整设计数据
  data        Json
  
  // 创建者
  createdBy   String
  creator     User     @relation(fields: [createdBy], references: [id])
  
  // 变更信息
  message     String?
  changes     Json?    // 变更摘要
  
  // 快照
  thumbnail   String?
  
  createdAt   DateTime @default(now())
  
  @@unique([projectId, version])
  @@index([projectId])
  @@index([createdAt])
  @@map("versions")
}

model Component {
  id          String   @id @default(cuid())
  name        String
  type        String   // button, card, form, etc.
  
  // 所属团队 (公共组件)
  teamId      String?
  team        Team?    @relation(fields: [teamId], references: [id])
  
  // 组件定义
  props       Json     @default("{}")
  styles      Json     @default("{}")
  events      Json?    // 事件定义
  
  // 元数据
  category    String?  // common, mobile, ai
  tags        String[] // 标签
  
  // 版本控制
  version     Int      @default(1)
  isPublic    Boolean  @default(false)
  
  // 创建者
  createdBy   String
  creator     User     @relation(fields: [createdBy], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([teamId])
  @@index([category])
  @@index([createdBy])
  @@map("components")
}

model AIGeneration {
  id          String   @id @default(cuid())
  userId      String
  projectId   String?
  
  // AI 调用信息
  prompt      String
  response    Json     // AI 返回的原始数据
  model       String   // gpt-4o, etc.
  
  // 结果
  design      Json?   // 转换后的设计数据
  code        Json?   // 生成的代码
  
  // 使用统计
  tokensUsed  Int
  cost        Float   // 美元
  
  // 状态
  status      AIGenerationStatus @default(SUCCESS)
  errorMessage String?
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project     Project? @relation(fields: [projectId], references: [id])
  
  createdAt   DateTime @default(now())
  
  @@index([userId])
  @@index([projectId])
  @@index([createdAt])
  @@map("ai_generations")
}

enum AIGenerationStatus {
  SUCCESS
  FAILED
  PENDING
}

model CollaborationSession {
  id          String   @id @default(cuid())
  projectId   String
  userId      String
  
  // 实时数据
  socketId    String   @unique
  cursor      Json?    // {x, y, color}
  selection   String[] // 选中的元素ID
  
  // 状态
  isActive    Boolean  @default(true)
  
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  joinedAt    DateTime @default(now())
  lastActive  DateTime @updatedAt
  
  @@index([projectId])
  @@index([userId])
  @@index([socketId])
  @@map("collaboration_sessions")
}

model Comment {
  id          String   @id @default(cuid())
  projectId   String
  userId      String
  elementId   String?  // 关联的元素
  
  // 评论内容
  content     String
  x           Float?   // 位置
  y           Float?
  
  // 状态
  resolved    Boolean  @default(false)
  
  // 回复
  parentId    String?
  replies     Comment[] @relation("CommentReplies")
  
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id])
  parent      Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([projectId])
  @@index([elementId])
  @@map("comments")
}

model File {
  id          String   @id @default(cuid())
  userId      String
  name        String
  url         String   // CDN URL
  size        Int      // bytes
  mimeType    String
  
  // 存储信息
  provider    StorageProvider @default(S3)
  key         String?  // 存储键
  
  // 元数据
  width       Int?
  height      Int?
  duration    Int?     // 视频/音频时长
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  
  @@index([userId])
  @@map("files")
}

enum StorageProvider {
  S3
  CLOUDINARY
  LOCAL
}

// 审计日志表 (可选，用于企业版)
model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  action      String   // create, update, delete, export, etc.
  resource    String   // project, component, etc.
  resourceId  String?
  
  // 详情
  details     Json?
  ipAddress   String?
  userAgent   String?
  
  // 结果
  success     Boolean  @default(true)
  error       String?
  
  createdAt   DateTime @default(now())
  
  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}
```

## 🔗 数据关系图

```
User
├── owns ──────────────────────────────┐
│                                       │
├── belongs_to ── Team ── has_many ────┤
│                                       │
├── creates ──── Project ── has_many ──┤
│              │         │             │
│              │         └── Version   │
│              │         └── Comment   │
│              │         └── AIGen     │
│              │                       │
│              └── has_many ─ Component│
│                                       │
└── uploads ─── File ──────────────────┘

Team
├── has_many ─ TeamMember ── User
├── has_many ─ Project
└── has_many ─ Component

Project
├── has_many ─ Version
├── has_many ─ Comment
├── has_many ─ AIGeneration
├── has_many ─ CollaborationSession
└── belongs_to ─ User/Team

Version
└── belongs_to ─ Project ── User

CollaborationSession
├── belongs_to ─ Project
└── belongs_to ─ User

Comment
├── belongs_to ─ Project ── User
└── has_many ── Comment (replies)

AIGeneration
├── belongs_to ─ User
└── belongs_to ─ Project (optional)

File
└── belongs_to ─ User

AuditLog
└── belongs_to ─ User (optional)
```

## 📈 索引策略

### 1. 性能索引

```sql
-- 用户相关
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created ON users(createdAt);

-- 团队相关
CREATE INDEX idx_teams_owner ON teams(ownerId);
CREATE INDEX idx_teams_created ON teams(createdAt);

-- 项目相关
CREATE INDEX idx_projects_owner ON projects(ownerId);
CREATE INDEX idx_projects_team ON projects(teamId);
CREATE INDEX idx_projects_public ON projects(isPublic);
CREATE INDEX idx_projects_created ON projects(createdAt);
CREATE INDEX idx_projects_updated ON projects(updatedAt);

-- 版本相关
CREATE INDEX idx_versions_project ON versions(projectId);
CREATE INDEX idx_versions_created ON versions(createdAt);
CREATE UNIQUE INDEX idx_versions_unique ON versions(projectId, version);

-- 组件相关
CREATE INDEX idx_components_team ON components(teamId);
CREATE INDEX idx_components_category ON components(category);
CREATE INDEX idx_components_created ON components(createdAt);

-- AI 生成相关
CREATE INDEX idx_ai_user ON ai_generations(userId);
CREATE INDEX idx_ai_project ON ai_generations(projectId);
CREATE INDEX idx_ai_created ON ai_generations(createdAt);

-- 协作相关
CREATE INDEX idx_collab_project ON collaboration_sessions(projectId);
CREATE INDEX idx_collab_user ON collaboration_sessions(userId);
CREATE INDEX idx_collab_active ON collaboration_sessions(isActive);
CREATE UNIQUE INDEX idx_collab_socket ON collaboration_sessions(socketId);

-- 评论相关
CREATE INDEX idx_comments_project ON comments(projectId);
CREATE INDEX idx_comments_element ON comments(elementId);
CREATE INDEX idx_comments_parent ON comments(parentId);
CREATE INDEX idx_comments_created ON comments(createdAt);

-- 文件相关
CREATE INDEX idx_files_user ON files(userId);
CREATE INDEX idx_files_created ON files(createdAt);

-- 审计日志
CREATE INDEX idx_audit_user ON audit_logs(userId);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(createdAt);
```

### 2. 复合索引

```sql
-- 项目列表查询优化
CREATE INDEX idx_projects_owner_created ON projects(ownerId, createdAt DESC);

-- 版本历史查询
CREATE INDEX idx_versions_project_version ON versions(projectId, version DESC);

-- 协作活跃会话
CREATE INDEX idx_collab_project_active ON collaboration_sessions(projectId, isActive, lastActive DESC);

-- AI 使用统计
CREATE INDEX idx_ai_user_date ON ai_generations(userId, createdAt DESC);
```

## 🗄️ 数据库迁移

### 1. Prisma 迁移流程

```bash
# 1. 修改 schema.prisma
# 2. 生成迁移
npx prisma migrate dev --name add_feature_x

# 3. 应用迁移
npx prisma migrate deploy

# 4. 生成客户端
npx prisma generate
```

### 2. 迁移文件示例

```sql
-- migrations/20251217120000_add_team_settings/migration.sql

-- 添加团队设置字段
ALTER TABLE "teams" 
ADD COLUMN "settings" JSONB NOT NULL DEFAULT '{}';

-- 创建团队成员索引
CREATE INDEX idx_team_members_joined ON "team_members"(joinedAt DESC);

-- 更新默认设置
UPDATE "teams" 
SET settings = '{"maxMembers": 50, "allowGuest": true}'::jsonb;

-- 添加审计日志表
CREATE TABLE "audit_logs" (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    error TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON "audit_logs"(user_id);
CREATE INDEX idx_audit_logs_action ON "audit_logs"(action);
CREATE INDEX idx_audit_logs_created ON "audit_logs"(created_at);
```

### 3. 回滚脚本

```bash
# 回滚到指定版本
npx prisma migrate resolve --rolled-back 20251217120000_add_team_settings

# 或手动回滚
npx prisma migrate reset --force
```

## 🔧 数据访问层

### 1. Prisma Client 封装

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// lib/repositories/project.ts
export class ProjectRepository {
  async findById(id: string, userId: string) {
    return prisma.project.findFirst({
      where: {
        id,
        OR: [
          { ownerId: userId },
          { team: { members: { some: { userId } } } }
        ],
        deletedAt: null
      },
      include: {
        owner: true,
        team: {
          include: {
            members: {
              include: { user: true }
            }
          }
        },
        versions: {
          orderBy: { version: 'desc' },
          take: 10
        }
      }
    })
  }

  async findUserProjects(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    
    return prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { team: { members: { some: { userId } } } }
        ],
        deletedAt: null
      },
      include: {
        owner: true,
        team: true,
        _count: {
          select: { versions: true, comments: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit
    })
  }

  async create(data: {
    name: string
    description?: string
    ownerId: string
    teamId?: string
    settings?: any
  }) {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        teamId: data.teamId,
        settings: data.settings || {},
        data: {} // 空初始设计
      }
    })
  }

  async update(id: string, data: Partial<Parameters<typeof prisma.project.update>[0]['data']>) {
    return prisma.project.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  }

  async softDelete(id: string) {
    return prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
  }

  async getVersions(projectId: string, limit = 50) {
    return prisma.version.findMany({
      where: { projectId },
      orderBy: { version: 'desc' },
      take: limit,
      include: {
        creator: true
      }
    })
  }

  async createVersion(
    projectId: string,
    userId: string,
    data: any,
    message?: string
  ) {
    // 获取当前最大版本号
    const maxVersion = await prisma.version.aggregate({
      where: { projectId },
      _max: { version: true }
    })

    const newVersion = (maxVersion._max.version || 0) + 1

    return prisma.version.create({
      data: {
        projectId,
        version: newVersion,
        data,
        createdBy: userId,
        message,
        changes: this.calculateChanges(data) // 可选：计算变更
      }
    })
  }
}
```

### 2. 缓存层

```typescript
// lib/cache.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export class CacheService {
  private static readonly TTL = 300 // 5分钟

  static async getProject(projectId: string) {
    const key = `project:${projectId}`
    const cached = await redis.get(key)
    return cached ? JSON.parse(cached) : null
  }

  static async setProject(project: any) {
    const key = `project:${project.id}`
    await redis.setex(key, this.TTL, JSON.stringify(project))
  }

  static async invalidateProject(projectId: string) {
    await redis.del(`project:${projectId}`)
    await redis.del(`project:${projectId}:versions`)
  }

  static async getUserProjects(userId: string) {
    const key = `user:${userId}:projects`
    const cached = await redis.get(key)
    return cached ? JSON.parse(cached) : null
  }

  static async setUserProjects(userId: string, projects: any[]) {
    const key = `user:${userId}:projects`
    await redis.setex(key, this.TTL, JSON.stringify(projects))
  }
}
```

## 📊 数据统计查询

### 1. 用户使用统计

```typescript
// 统计用户 AI 使用情况
async function getUserAIStats(userId: string, days = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return prisma.aIGeneration.groupBy({
    by: ['createdAt'],
    where: {
      userId,
      createdAt: { gte: startDate },
      status: 'SUCCESS'
    },
    _count: true,
    _sum: { tokensUsed: true, cost: true }
  })
}

// 统计项目活跃度
async function getProjectActivity(projectId: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  return {
    versions: await prisma.version.count({
      where: { projectId, createdAt: { gte: thirtyDaysAgo } }
    }),
    comments: await prisma.comment.count({
      where: { projectId, createdAt: { gte: thirtyDaysAgo } }
    }),
    collaborations: await prisma.collaborationSession.count({
      where: { projectId, lastActive: { gte: thirtyDaysAgo } }
    })
  }
}
```

### 2. 系统统计

```typescript
async function getSystemStats() {
  return {
    users: await prisma.user.count(),
    activeProjects: await prisma.project.count({
      where: { 
        deletedAt: null,
        updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    }),
    aiGenerations: await prisma.aIGeneration.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    }),
    totalTokens: await prisma.aIGeneration.aggregate({
      _sum: { tokensUsed: true }
    }),
    revenue: await prisma.aIGeneration.aggregate({
      _sum: { cost: true }
    })
  }
}
```

## 🔐 数据安全

### 1. 行级安全 (RLS)

```sql
-- 启用 RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的项目或团队项目
CREATE POLICY project_access ON projects FOR ALL
  USING (
    ownerId = current_setting('app.current_user_id')::uuid 
    OR teamId IN (
      SELECT teamId FROM team_members 
      WHERE userId = current_setting('app.current_user_id')::uuid
    )
  );

-- 只有所有者可以删除
CREATE POLICY project_delete ON projects FOR DELETE
  USING (ownerId = current_setting('app.current_user_id')::uuid);
```

### 2. 数据加密

```typescript
// 敏感数据加密存储
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encrypted: string): string {
  const [ivHex, authTagHex, encryptedText] = encrypted.split(':')
  
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
```

## 🚀 性能优化

### 1. 查询优化

```typescript
// 避免 N+1 查询
const projects = await prisma.project.findMany({
  where: { ownerId: userId },
  include: {
    owner: true,           // 一次性包含
    team: {
      include: {
        members: {
          include: { user: true }
        }
      }
    },
    _count: {              // 只计数，不加载实际数据
      select: { versions: true, comments: true }
    }
  }
})

// 分页查询
const page = 1
const take = 20
const skip = (page - 1) * take

const projects = await prisma.project.findMany({
  where: { ... },
  skip,
  take,
  orderBy: { updatedAt: 'desc' }
})

// 使用游标分页（更高效）
const projects = await prisma.project.findMany({
  where: { ... },
  take: 20,
  cursor: { id: lastProjectId },
  skip: 1, // 跳过游标本身
  orderBy: { updatedAt: 'desc' }
})
```

### 2. 批量操作

```typescript
// 批量创建
await prisma.$transaction(
  components.map(comp => 
    prisma.component.create({ data: comp })
  )
)

// 批量更新
await prisma.$transaction(
  updates.map(({ id, data }) =>
    prisma.component.update({
      where: { id },
      data
    })
  )
)

// 使用 upsert
await prisma.component.upsert({
  where: { id: existingId || 'new-id' },
  update: { ...data },
  create: { ...data, id: existingId || undefined }
})
```

### 3. 数据归档

```typescript
// 归档旧版本
async function archiveOldVersions(projectId: string, keepLast = 50) {
  const versionsToKeep = await prisma.version.findMany({
    where: { projectId },
    orderBy: { version: 'desc' },
    take: keepLast,
    select: { id: true }
  })

  const keepIds = versionsToKeep.map(v => v.id)

  // 将旧版本移到归档表或标记为归档
  await prisma.version.updateMany({
    where: {
      projectId,
      id: { notIn: keepIds }
    },
    data: { isArchived: true }
  })
}
```

## 📝 数据字典

### 核心表字段说明

| 表名 | 主要字段 | 说明 |
|------|---------|------|
| users | id, email, role | 用户基本信息 |
| teams | id, name, ownerId | 团队信息 |
| projects | id, name, data | 设计项目 |
| versions | id, version, data | 版本历史 |
| components | id, props, styles | 可复用组件 |
| ai_generations | id, prompt, response | AI 调用记录 |
| collaboration_sessions | id, socketId, cursor | 实时协作 |
| comments | id, content, elementId | 设计评论 |
| files | id, url, size | 文件存储 |
| audit_logs | id, action, details | 操作日志 |

### JSONB 字段结构

**Project.settings**
```json
{
  "theme": "dark",
  "devices": ["iphone-14-pro", "desktop"],
  "plugins": {
    "aiAssistant": true,
    "collaboration": true
  },
  "export": {
    "formats": ["react", "vue", "mini-program"],
    "includeComments": false
  }
}
```

**Version.data**
```json
{
  "canvas": {
    "width": 375,
    "height": 812,
    "zoom": 1
  },
  "elements": [
    {
      "id": "element-1",
      "type": "button",
      "x": 20,
      "y": 100,
      "width": 335,
      "height": 48,
      "props": { "text": "Click Me" },
      "styles": { "background": "#6366f1" }
    }
  ]
}
```

**Component.props**
```json
{
  "text": "Button",
  "variant": "primary",
  "size": "medium",
  "disabled": false
}
```

**Component.styles**
```json
{
  "padding": "12px 24px",
  "borderRadius": "8px",
  "fontWeight": 600
}
```

**CollaborationSession.cursor**
```json
{
  "x": 150,
  "y": 200,
  "color": "#6366f1",
  "name": "John Doe"
}
```

---

**版本**：v1.0.0  
**最后更新**：2025-12-17  
**状态**：数据库设计完成