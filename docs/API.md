# Nexus Design - API 接口设计

## 📡 API 概述

**API 基础路径**：`https://api.nexusdesign.app/api/v1`  
**认证方式**：Bearer Token (JWT)  
**数据格式**：JSON  
**响应格式**：统一响应结构

### 基础响应结构

**成功响应**
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2025-12-17T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

**错误响应**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Email format invalid"
    }
  },
  "meta": {
    "timestamp": "2025-12-17T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

### 错误代码

| 代码 | HTTP 状态码 | 说明 |
|------|------------|------|
| `UNAUTHORIZED` | 401 | 未认证或 Token 过期 |
| `FORBIDDEN` | 403 | 权限不足 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `VALIDATION_ERROR` | 400 | 数据验证失败 |
| `RATE_LIMITED` | 429 | 请求频率限制 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |
| `AI_SERVICE_ERROR` | 502 | AI 服务异常 |

---

## 🔐 认证相关

### 1. 用户注册

**POST** `/auth/register`

**请求**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "张三",
  "inviteCode": "optional-invite-code"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "张三",
      "role": "USER",
      "createdAt": "2025-12-17T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误场景**
- `VALIDATION_ERROR`: 邮箱格式错误、密码太弱
- `CONFLICT`: 邮箱已存在

---

### 2. 用户登录

**POST** `/auth/login`

**请求**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "张三",
      "role": "USER",
      "avatar": "https://cdn.example.com/avatar.jpg",
      "createdAt": "2025-12-17T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh-token-string"
  }
}
```

---

### 3. 社交登录

**POST** `/auth/social`

**请求**
```json
{
  "provider": "google", // google, github, apple
  "token": "oauth-access-token"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token",
    "isNewUser": false // 是否为新用户
  }
}
```

---

### 4. 刷新 Token

**POST** `/auth/refresh`

**请求**
```json
{
  "refreshToken": "refresh-token-string"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "token": "new-jwt-token",
    "refreshToken": "new-refresh-token"
  }
}
```

---

## 👤 用户相关

### 1. 获取用户信息

**GET** `/users/me`

**响应**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "张三",
    "avatar": "https://cdn.example.com/avatar.jpg",
    "role": "USER",
    "stats": {
      "projectCount": 15,
      "teamCount": 3,
      "aiGenerations": 120,
      "storageUsed": 250000000 // bytes
    },
    "createdAt": "2025-12-17T10:30:00Z"
  }
}
```

---

### 2. 更新用户信息

**PUT** `/users/me`

**请求**
```json
{
  "name": "李四",
  "avatar": "https://cdn.example.com/new-avatar.jpg"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "李四",
    "avatar": "https://cdn.example.com/new-avatar.jpg",
    "updatedAt": "2025-12-17T11:00:00Z"
  }
}
```

---

### 3. 修改密码

**PUT** `/users/me/password`

**请求**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**响应**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## 👥 团队相关

### 1. 创建团队

**POST** `/teams`

**请求**
```json
{
  "name": "设计团队",
  "description": "我们的设计团队"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "id": "team_456",
    "name": "设计团队",
    "description": "我们的设计团队",
    "ownerId": "user_123",
    "members": [
      {
        "userId": "user_123",
        "role": "ADMIN",
        "joinedAt": "2025-12-17T10:30:00Z"
      }
    ],
    "createdAt": "2025-12-17T10:30:00Z"
  }
}
```

---

### 2. 获取团队列表

**GET** `/teams`

**查询参数**
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20, 最大: 100)

**响应**
```json
{
  "success": true,
  "data": [
    {
      "id": "team_456",
      "name": "设计团队",
      "role": "ADMIN",
      "memberCount": 5,
      "projectCount": 8,
      "createdAt": "2025-12-17T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### 3. 获取团队详情

**GET** `/teams/:teamId`

**响应**
```json
{
  "success": true,
  "data": {
    "id": "team_456",
    "name": "设计团队",
    "description": "我们的设计团队",
    "owner": {
      "id": "user_123",
      "name": "张三",
      "email": "user@example.com"
    },
    "members": [
      {
        "userId": "user_123",
        "name": "张三",
        "role": "ADMIN",
        "joinedAt": "2025-12-17T10:30:00Z"
      }
    ],
    "settings": {
      "maxMembers": 50,
      "allowGuest": true
    },
    "createdAt": "2025-12-17T10:30:00Z"
  }
}
```

---

### 4. 邀请团队成员

**POST** `/teams/:teamId/invites`

**请求**
```json
{
  "email": "newmember@example.com",
  "role": "EDITOR" // ADMIN, EDITOR, VIEWER
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "inviteId": "invite_789",
    "email": "newmember@example.com",
    "role": "EDITOR",
    "status": "PENDING",
    "expiresAt": "2025-12-24T10:30:00Z"
  }
}
```

---

### 5. 移除团队成员

**DELETE** `/teams/:teamId/members/:userId`

**响应**
```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

---

## 📁 项目相关

### 1. 创建项目

**POST** `/projects`

**请求**
```json
{
  "name": "电商 App 设计",
  "description": "移动端电商应用界面设计",
  "teamId": "team_456", // 可选
  "settings": {
    "theme": "dark",
    "devices": ["iphone-14-pro", "desktop"]
  }
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "id": "proj_789",
    "name": "电商 App 设计",
    "description": "移动端电商应用界面设计",
    "ownerId": "user_123",
    "teamId": "team_456",
    "thumbnail": null,
    "settings": {
      "theme": "dark",
      "devices": ["iphone-14-pro", "desktop"]
    },
    "isPublic": false,
    "createdAt": "2025-12-17T10:30:00Z",
    "updatedAt": "2025-12-17T10:30:00Z"
  }
}
```

---

### 2. 获取项目列表

**GET** `/projects`

**查询参数**
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20, 最大: 100)
- `teamId`: 按团队筛选
- `search`: 搜索关键词
- `sort`: 排序字段 (name, createdAt, updatedAt) (默认: updatedAt)
- `order`: 排序方向 (asc, desc) (默认: desc)

**响应**
```json
{
  "success": true,
  "data": [
    {
      "id": "proj_789",
      "name": "电商 App 设计",
      "description": "移动端电商应用界面设计",
      "thumbnail": "https://cdn.example.com/thumbnail.jpg",
      "owner": {
        "id": "user_123",
        "name": "张三"
      },
      "team": {
        "id": "team_456",
        "name": "设计团队"
      },
      "_count": {
        "versions": 5,
        "comments": 12
      },
      "createdAt": "2025-12-17T10:30:00Z",
      "updatedAt": "2025-12-17T11:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

### 3. 获取项目详情

**GET** `/projects/:projectId`

**响应**
```json
{
  "success": true,
  "data": {
    "id": "proj_789",
    "name": "电商 App 设计",
    "description": "移动端电商应用界面设计",
    "owner": { ... },
    "team": { ... },
    "data": {
      "canvas": { "width": 375, "height": 812, "zoom": 1 },
      "elements": [
        {
          "id": "element_1",
          "type": "button",
          "x": 20,
          "y": 100,
          "width": 335,
          "height": 48,
          "props": { "text": "立即购买" },
          "styles": { "background": "#6366f1" }
        }
      ]
    },
    "settings": {
      "theme": "dark",
      "devices": ["iphone-14-pro", "desktop"]
    },
    "isPublic": false,
    "createdAt": "2025-12-17T10:30:00Z",
    "updatedAt": "2025-12-17T11:00:00Z"
  }
}
```

---

### 4. 更新项目

**PUT** `/projects/:projectId`

**请求**
```json
{
  "name": "电商 App 设计 V2",
  "description": "更新后的描述",
  "settings": {
    "theme": "light",
    "devices": ["iphone-14-pro", "iphone-14", "desktop"]
  },
  "isPublic": true
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "id": "proj_789",
    "name": "电商 App 设计 V2",
    "updatedAt": "2025-12-17T11:30:00Z"
  }
}
```

---

### 5. 保存项目数据

**PUT** `/projects/:projectId/data`

**请求**
```json
{
  "data": {
    "canvas": { "width": 375, "height": 812, "zoom": 1 },
    "elements": [
      {
        "id": "element_1",
        "type": "button",
        "x": 20,
        "y": 100,
        "width": 335,
        "height": 48,
        "props": { "text": "立即购买" },
        "styles": { "background": "#6366f1" }
      }
    ]
  },
  "message": "添加购买按钮"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "versionId": "ver_123",
    "version": 2,
    "message": "添加购买按钮",
    "savedAt": "2025-12-17T11:30:00Z"
  }
}
```

---

### 6. 删除项目

**DELETE** `/projects/:projectId`

**响应**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## 📚 版本相关

### 1. 获取版本历史

**GET** `/projects/:projectId/versions`

**查询参数**
- `limit`: 返回版本数量 (默认: 20, 最大: 100)

**响应**
```json
{
  "success": true,
  "data": [
    {
      "id": "ver_123",
      "version": 5,
      "name": "最终版本",
      "message": "添加了支付流程",
      "creator": {
        "id": "user_123",
        "name": "张三"
      },
      "createdAt": "2025-12-17T11:30:00Z",
      "thumbnail": "https://cdn.example.com/version-5.jpg"
    }
  ]
}
```

---

### 2. 获取版本详情

**GET** `/projects/:projectId/versions/:versionId`

**响应**
```json
{
  "success": true,
  "data": {
    "id": "ver_123",
    "version": 5,
    "data": {
      "canvas": { ... },
      "elements": [ ... ]
    },
    "changes": {
      "added": ["element_1", "element_2"],
      "modified": ["element_3"],
      "deleted": ["element_4"]
    },
    "creator": { ... },
    "createdAt": "2025-12-17T11:30:00Z"
  }
}
```

---

### 3. 回滚到指定版本

**POST** `/projects/:projectId/versions/:versionId/rollback`

**请求**
```json
{
  "message": "回滚到版本 3"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "newVersion": 6,
    "rollbackFrom": 5,
    "message": "回滚到版本 3",
    "createdAt": "2025-12-17T12:00:00Z"
  }
}
```

---

## 🤖 AI 相关

### 1. 生成 UI 设计

**POST** `/ai/generate`

**请求**
```json
{
  "prompt": "创建一个电商商品卡片，包含商品图片、标题、价格和购买按钮，使用现代设计风格",
  "projectId": "proj_789", // 可选
  "options": {
    "style": "modern",
    "responsive": true,
    "includeAnimations": true
  }
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "generationId": "ai_gen_456",
    "design": {
      "elements": [
        {
          "id": "element_1",
          "type": "container",
          "children": [
            {
              "id": "element_2",
              "type": "image",
              "props": { "src": "product.jpg" }
            },
            {
              "id": "element_3",
              "type": "text",
              "props": { "content": "商品标题" }
            }
          ]
        }
      ]
    },
    "metadata": {
      "model": "gpt-4o",
      "tokensUsed": 1500,
      "cost": 0.03,
      "duration": 2500 // ms
    }
  }
}
```

**错误场景**
- `AI_SERVICE_ERROR`: AI 服务不可用
- `RATE_LIMITED`: 超过 AI 调用限制

---

### 2. 优化现有设计

**POST** `/ai/optimize`

**请求**
```json
{
  "projectId": "proj_789",
  "aspect": "layout", // layout, color, typography, all
  "constraints": {
    "brandColors": ["#6366f1", "#ec4899"],
    "targetAudience": "young-adults"
  }
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "type": "layout",
        "description": "调整元素间距，提升可读性",
        "changes": [
          {
            "elementId": "element_1",
            "property": "padding",
            "oldValue": "8px",
            "newValue": "16px"
          }
        ]
      }
    ],
    "applied": false // 是否应用（需要用户确认）
  }
}
```

---

### 3. 生成代码

**POST** `/ai/code`

**请求**
```json
{
  "projectId": "proj_789",
  "framework": "react", // react, vue, angular, mini-program
  "options": {
    "language": "typescript",
    "styling": "tailwind",
    "includeComments": true
  }
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "code": "import React from 'react';\n\nexport const ProductCard = () => { ... }",
    "files": [
      {
        "name": "ProductCard.tsx",
        "content": "..."
      },
      {
        "name": "ProductCard.css",
        "content": "..."
      }
    ],
    "metadata": {
      "framework": "react",
      "language": "typescript",
      "lines": 45
    }
  }
}
```

---

### 4. AI 使用统计

**GET** `/ai/stats`

**查询参数**
- `period`: 今天, 本周, 本月 (默认: 本月)

**响应**
```json
{
  "success": true,
  "data": {
    "totalGenerations": 45,
    "totalTokens": 67500,
    "totalCost": 1.02,
    "limit": {
      "max": 100,
      "remaining": 55,
      "resetsAt": "2025-12-18T00:00:00Z"
    },
    "daily": [
      {
        "date": "2025-12-17",
        "count": 12,
        "tokens": 18000,
        "cost": 0.27
      }
    ]
  }
}
```

---

## 🎨 组件相关

### 1. 创建组件

**POST** `/components`

**请求**
```json
{
  "name": "商品卡片",
  "type": "card",
  "props": {
    "image": "string",
    "title": "string",
    "price": "number"
  },
  "styles": {
    "borderRadius": "12px",
    "padding": "16px"
  },
  "category": "common",
  "tags": ["ecommerce", "product"]
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "id": "comp_789",
    "name": "商品卡片",
    "type": "card",
    "version": 1,
    "isPublic": false,
    "createdAt": "2025-12-17T10:30:00Z"
  }
}
```

---

### 2. 获取组件列表

**GET** `/components`

**查询参数**
- `teamId`: 团队组件
- `category`: 筛选分类
- `search`: 搜索关键词

**响应**
```json
{
  "success": true,
  "data": [
    {
      "id": "comp_789",
      "name": "商品卡片",
      "type": "card",
      "category": "common",
      "tags": ["ecommerce", "product"],
      "creator": { "id": "user_123", "name": "张三" },
      "usageCount": 42,
      "createdAt": "2025-12-17T10:30:00Z"
    }
  ]
}
```

---

### 3. 使用组件

**POST** `/projects/:projectId/components/:componentId/use`

**请求**
```json
{
  "position": {
    "x": 20,
    "y": 100
  },
  "customProps": {
    "title": "自定义商品标题"
  }
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "elementId": "element_123",
    "componentId": "comp_789",
    "position": { "x": 20, "y": 100 },
    "props": { "title": "自定义商品标题" }
  }
}
```

---

## 💬 协作相关

### 1. 加入协作会话

**POST** `/collaboration/join`

**请求**
```json
{
  "projectId": "proj_789"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "sessionId": "collab_456",
    "websocketUrl": "wss://realtime.nexusdesign.app",
    "token": "collab-token-string",
    "activeUsers": [
      {
        "userId": "user_123",
        "name": "张三",
        "cursor": { "x": 150, "y": 200 }
      }
    ]
  }
}
```

---

### 2. 获取活跃协作者

**GET** `/collaboration/:projectId/active`

**响应**
```json
{
  "success": true,
  "data": [
    {
      "userId": "user_123",
      "name": "张三",
      "cursor": { "x": 150, "y": 200 },
      "selection": ["element_1", "element_2"],
      "lastActive": "2025-12-17T11:30:00Z"
    }
  ]
}
```

---

### 3. 添加评论

**POST** `/projects/:projectId/comments`

**请求**
```json
{
  "elementId": "element_123",
  "content": "这个按钮的颜色需要调整",
  "x": 150,
  "y": 200
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "id": "comment_789",
    "elementId": "element_123",
    "content": "这个按钮的颜色需要调整",
    "user": { "id": "user_123", "name": "张三" },
    "resolved": false,
    "createdAt": "2025-12-17T11:30:00Z"
  }
}
```

---

### 4. 获取评论列表

**GET** `/projects/:projectId/comments`

**查询参数**
- `elementId`: 筛选特定元素的评论
- `resolved`: 是否已解决 (true/false)

**响应**
```json
{
  "success": true,
  "data": [
    {
      "id": "comment_789",
      "elementId": "element_123",
      "content": "这个按钮的颜色需要调整",
      "user": { "id": "user_123", "name": "张三" },
      "replies": [
        {
          "id": "comment_790",
          "content": "已修改为品牌主色",
          "user": { "id": "user_456", "name": "李四" }
        }
      ],
      "resolved": true,
      "createdAt": "2025-12-17T11:30:00Z"
    }
  ]
}
```

---

### 5. 标记评论为已解决

**PUT** `/projects/:projectId/comments/:commentId/resolve`

**响应**
```json
{
  "success": true,
  "data": {
    "id": "comment_789",
    "resolved": true,
    "resolvedAt": "2025-12-17T12:00:00Z"
  }
}
```

---

## 📤 导出相关

### 1. 导出代码

**POST** `/export/code`

**请求**
```json
{
  "projectId": "proj_789",
  "framework": "react",
  "options": {
    "language": "typescript",
    "styling": "tailwind",
    "includeAssets": false,
    "minify": false
  }
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://exports.nexusdesign.app/download/xyz123.zip",
    "files": [
      {
        "name": "components/ProductCard.tsx",
        "size": 2456
      },
      {
        "name": "styles/index.css",
        "size": 1234
      }
    ],
    "metadata": {
      "framework": "react",
      "totalSize": 3690,
      "estimatedBuildTime": "5s"
    }
  }
}
```

---

### 2. 导出图片

**POST** `/export/image`

**请求**
```json
{
  "projectId": "proj_789",
  "format": "png", // png, svg, pdf
  "scale": 2, // 1x, 2x, 3x
  "elements": ["element_1", "element_2"] // 可选，指定导出元素
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://exports.nexusdesign.app/download/abc456.png",
    "metadata": {
      "format": "png",
      "width": 750,
      "height": 1624,
      "size": 125000
    }
  }
}
```

---

### 3. 导出设计规范

**POST** `/export/design-system`

**请求**
```json
{
  "projectId": "proj_789",
  "format": "json" // json, pdf, markdown
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://exports.nexusdesign.app/download/def789.json",
    "content": {
      "colors": ["#6366f1", "#ec4899"],
      "typography": { ... },
      "spacing": { ... },
      "components": [ ... ]
    }
  }
}
```

---

## 📁 文件相关

### 1. 上传文件

**POST** `/files/upload`

**请求** (multipart/form-data)
```
file: binary
type: image | video | document
projectId: proj_789 (可选)
```

**响应**
```json
{
  "success": true,
  "data": {
    "id": "file_789",
    "name": "product-image.jpg",
    "url": "https://cdn.nexusdesign.app/files/xyz.jpg",
    "size": 250000,
    "mimeType": "image/jpeg",
    "uploadedAt": "2025-12-17T10:30:00Z"
  }
}
```

---

### 2. 获取文件列表

**GET** `/files`

**查询参数**
- `projectId`: 项目文件
- `type`: 文件类型
- `page`, `limit`: 分页

**响应**
```json
{
  "success": true,
  "data": [
    {
      "id": "file_789",
      "name": "product-image.jpg",
      "url": "https://cdn.nexusdesign.app/files/xyz.jpg",
      "size": 250000,
      "mimeType": "image/jpeg",
      "uploadedAt": "2025-12-17T10:30:00Z"
    }
  ]
}
```

---

### 3. 删除文件

**DELETE** `/files/:fileId`

**响应**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## 📊 统计相关

### 1. 用户统计

**GET** `/stats/user`

**响应**
```json
{
  "success": true,
  "data": {
    "projects": {
      "total": 15,
      "owned": 10,
      "shared": 5
    },
    "teams": {
      "total": 3,
      "owned": 1,
      "member": 2
    },
    "ai": {
      "totalGenerations": 120,
      "thisMonth": 45,
      "tokensUsed": 180000,
      "cost": 2.70
    },
    "storage": {
      "used": 250000000,
      "limit": 1000000000,
      "percentage": 25
    }
  }
}
```

---

### 2. 系统状态

**GET** `/status`

**响应**
```json
{
  "success": true,
  "data": {
    "api": {
      "version": "1.0.0",
      "status": "operational",
      "uptime": "99.99%"
    },
    "services": {
      "database": "operational",
      "storage": "operational",
      "ai": "operational",
      "realtime": "operational"
    },
    "rateLimit": {
      "remaining": 95,
      "limit": 100,
      "resetIn": 300
    }
  }
}
```

---

## 🎯 WebSocket 事件

### 实时协作事件

**连接**
```
wss://realtime.nexusdesign.app?token=jwt-token&projectId=proj_789
```

**事件类型**

| 事件名 | 方向 | 数据 | 说明 |
|--------|------|------|------|
| `connect` | 双向 | `{ userId, projectId }` | 连接建立 |
| `disconnect` | 双向 | - | 连接断开 |
| `cursor:move` | 发送 | `{ x, y }` | 光标移动 |
| `element:update` | 双向 | `{ elementId, data }` | 元素更新 |
| `element:add` | 双向 | `{ element }` | 元素添加 |
| `element:delete` | 双向 | `{ elementId }` | 元素删除 |
| `selection:update` | 双向 | `{ elementIds }` | 选中更新 |
| `comment:add` | 双向 | `{ comment }` | 添加评论 |
| `presence:join` | 广播 | `{ user }` | 用户加入 |
| `presence:leave` | 广播 | `{ userId }` | 用户离开 |
| `project:saved` | 广播 | `{ version }` | 项目保存 |

**消息格式**
```typescript
interface WSMessage {
  event: string;
  data: any;
  timestamp: number;
  sender: string; // user_id
  projectId?: string;
}
```

---

## ⚠️ 速率限制

### 限制策略

| 端点 | 限制 | 说明 |
|------|------|------|
| `/auth/*` | 10 req/min | 认证接口 |
| `/ai/*` | 50 req/hour | AI 相关 |
| `/export/*` | 20 req/hour | 导出功能 |
| 通用 API | 100 req/min | 其他接口 |
| WebSocket | 1 连接/用户 | 实时协作 |

### 超限响应

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "retryAfter": 300
  }
}
```

---

## 🔍 分页和筛选

### 分页参数

所有列表接口支持以下参数：

```typescript
interface PaginationParams {
  page?: number;    // 页码，默认 1
  limit?: number;   // 每页数量，默认 20，最大 100
  sort?: string;    // 排序字段
  order?: 'asc' | 'desc'; // 排序方向
}
```

### 响应元数据

```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## 📝 最佳实践

### 1. 错误处理

```typescript
// 前端示例
try {
  const response = await fetch('/api/v1/projects', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  
  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.error.message)
  }
  
  return result.data
} catch (error) {
  console.error('API Error:', error)
  // 显示用户友好的错误信息
}
```

### 2. 乐观更新

```typescript
// 先更新 UI，再发送请求
const optimisticUpdate = async (projectId, data) => {
  // 1. 立即更新本地状态
  updateLocalProject(projectId, data)
  
  try {
    // 2. 发送请求
    await api.updateProject(projectId, data)
  } catch (error) {
    // 3. 失败则回滚
    rollbackProject(projectId)
    showErrorMessage('更新失败')
  }
}
```

### 3. 重试机制

```typescript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return await response.json()
      
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After')) || 60
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
        continue
      }
      
      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
    }
  }
}
```

---

**版本**：v1.0.0  
**最后更新**：2025-12-17  
**状态**：API 设计完成