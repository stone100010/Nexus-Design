# Nexus Design - 部署方案

## 🚀 部署概览

**目标平台**：Vercel (推荐) / Docker / AWS  
**CI/CD**：GitHub Actions  
**监控**：Sentry + Vercel Analytics  
**成本**：免费起步，按需扩展

---

## 📋 部署前准备

### 1. 生产环境变量配置

创建 `.env.production` 文件：

```env
# ===== 数据库 (生产环境) =====
DATABASE_URL="postgresql://user:password@host:5432/nexus_design?sslmode=require"

# ===== Redis (生产环境) =====
REDIS_URL="redis://host:6379"

# ===== NextAuth =====
NEXTAUTH_URL="https://nexusdesign.app"
NEXTAUTH_SECRET="your-production-secret"  # 使用 openssl rand -base64 32 生成

# ===== OAuth (生产环境) =====
# 需要在 Google Cloud Console 等平台重新配置回调 URL
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# ===== OpenAI =====
OPENAI_API_KEY="sk-..."
OPENAI_ORG_ID=""

# ===== AWS S3 (生产) =====
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET="nexus-design-prod"

# ===== CDN (可选) =====
NEXT_PUBLIC_CDN_URL="https://cdn.nexusdesign.app"

# ===== 监控 =====
SENTRY_DSN="https://xxx.ingest.sentry.io/xxx"
VERCEL_ANALYTICS_ID=""

# ===== 功能开关 =====
NEXT_PUBLIC_ENABLE_AI="true"
NEXT_PUBLIC_ENABLE_REALTIME="true"
NEXT_PUBLIC_ENABLE_COLLABORATION="true"

# ===== 性能优化 =====
NEXT_PUBLIC_ENABLE_SWC_MINIFY="true"
NEXT_PUBLIC_ENABLE_TURBOPACK="false"  # 生产环境暂不推荐
```

---

### 2. 数据库准备

**生产数据库配置**
```bash
# 1. 创建生产数据库 (推荐使用托管服务)
# - AWS RDS PostgreSQL
# - Google Cloud SQL
# - Supabase
# - Neon

# 2. 运行迁移
npx prisma migrate deploy

# 3. 生成客户端
npx prisma generate

# 4. 验证连接
npx prisma studio
```

**数据库备份策略**
```bash
# 每日自动备份
# 使用 pg_dump 或托管服务的自动备份

# 手动备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h $DB_HOST -U $DB_USER -d nexus_design > backup_$DATE.sql
gzip backup_$DATE.sql
aws s3 cp backup_$DATE.sql.gz s3://nexus-design-backups/
```

---

## 🎯 部署方式

### 方案一：Vercel 部署 (推荐)

**优势**
- ✅ 零配置部署
- ✅ 自动 CI/CD
- ✅ 全球 CDN
- ✅ 自动 HTTPS
- ✅ Serverless Functions
- ✅ Edge Network

**步骤**

1. **连接 Git 仓库**
```bash
# 在 Vercel 控制台
# Import Project → Connect GitHub Repository
# 选择 nexus-design 仓库
```

2. **配置环境变量**
```bash
# Vercel Dashboard → Project Settings → Environment Variables
# 添加所有生产环境变量
```

3. **构建配置**
```json
// vercel.json (可选，Next.js 通常自动检测)
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x",
      "memory": 1024
    }
  },
  
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

4. **部署**
```bash
# Vercel 会自动部署
# 或手动部署
vercel --prod
```

**Vercel 环境变量配置**
```bash
# 生产环境
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
# ... 其他变量

# 预览环境
vercel env add DATABASE_URL preview
```

---

### 方案二：Docker 部署

**Dockerfile**
```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# 生成 Prisma 客户端
RUN npm install prisma
RUN npx prisma generate

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动命令
CMD ["npm", "start"]
```

**Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      target: runner
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://nexus:nexus123@db:5432/nexus_design
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: nexus
      POSTGRES_PASSWORD: nexus123
      POSTGRES_DB: nexus_design
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # 可选：Nginx 反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

**部署命令**
```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down

# 备份数据
docker-compose exec db pg_dump -U nexus nexus_design > backup.sql
```

---

### 方案三：AWS 部署 (企业级)

**架构图**
```
┌─────────────────────────────────────────┐
│  Route 53 (DNS)                         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  CloudFront (CDN)                       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Application Load Balancer              │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────────┐      ┌────▼─────────┐
│ EC2 / ECS  │      │ EC2 / ECS    │
│ (Next.js)  │      │ (Next.js)    │
└─────┬──────┘      └──────┬───────┘
      │                    │
┌─────▼────────┐    ┌─────▼─────────┐
│ RDS PostgreSQL│    │ ElastiCache   │
│              │    │ (Redis)       │
└──────────────┘    └───────────────┘
```

**部署步骤**

1. **数据库 (RDS)**
```bash
# 创建 RDS PostgreSQL 实例
aws rds create-db-instance \
  --db-instance-identifier nexus-design-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.3 \
  --allocated-storage 20 \
  --master-username nexus \
  --master-user-password "YourSecurePassword123" \
  --vpc-security-group-ids sg-xxx \
  --backup-retention-period 7
```

2. **缓存 (ElastiCache)**
```bash
# 创建 Redis 集群
aws elasticache create-cache-cluster \
  --cache-cluster-id nexus-design-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

3. **容器注册表 (ECR)**
```bash
# 创建 ECR 仓库
aws ecr create-repository --repository-name nexus-design

# 登录并推送
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker tag nexus-design:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/nexus-design:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/nexus-design:latest
```

4. **ECS 部署**
```json
// task-definition.json
{
  "family": "nexus-design",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/nexus-design:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://..."
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/nexus-design",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

---

## 🔧 CI/CD 配置

### GitHub Actions

**主工作流** (`.github/workflows/deploy.yml`)
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: nexus
          POSTGRES_PASSWORD: nexus123
          POSTGRES_DB: nexus_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://nexus:nexus123@localhost:5432/nexus_test
        run: |
          npx prisma migrate deploy
          npm run test:integration
      
      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: postgresql://nexus:nexus123@localhost:5432/nexus_test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.PROD_NEXTAUTH_SECRET }}
          OPENAI_API_KEY: ${{ secrets.PROD_OPENAI_API_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./
```

**数据库迁移工作流** (`.github/workflows/migrate.yml`)
```yaml
name: Database Migration

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to migrate'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  migrate:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migration
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          npx prisma migrate deploy
          npx prisma generate
```

---

## 🛡️ 安全配置

### 1. HTTPS 和 SSL

**Vercel**: 自动配置
**自托管**: 使用 Let's Encrypt

```bash
# 使用 certbot 配置 HTTPS
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d nexusdesign.app -d www.nexusdesign.app

# 自动续期
sudo systemctl enable certbot.timer
```

**Nginx 配置**
```nginx
# /etc/nginx/sites-available/nexus-design
server {
    listen 80;
    server_name nexusdesign.app www.nexusdesign.app;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name nexusdesign.app www.nexusdesign.app;

    ssl_certificate /etc/letsencrypt/live/nexusdesign.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nexusdesign.app/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### 2. 安全最佳实践

**环境变量管理**
```bash
# 使用 Vault 或 AWS Secrets Manager
# 永远不要提交 .env 文件到 Git

# 在 Git 中忽略
echo ".env*" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

**API 安全**
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Rate limiting
  const ip = request.ip ?? 'unknown'
  // ... 限流逻辑
  
  // Security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
  )
  
  return response
}

export const config = {
  matcher: '/api/:path*'
}
```

**数据库安全**
```sql
-- 限制连接数
ALTER SYSTEM SET max_connections = 100;

-- 启用行级安全
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 创建只读用户用于分析
CREATE USER analytics_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE nexus_design TO analytics_user;
GRANT USAGE ON SCHEMA public TO analytics_user;
GRANT SELECT ON projects TO analytics_user;
```

---

## 📊 监控和日志

### 1. Sentry 错误追踪

**配置**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})

// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

**使用**
```typescript
try {
  await someRiskyOperation()
} catch (error) {
  Sentry.captureException(error, {
    tags: { operation: 'ai-generation' }
  })
  throw error
}
```

---

### 2. Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

### 3. 日志系统

**Winston 配置**
```typescript
// lib/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

export default logger
```

**使用**
```typescript
import logger from '@/lib/logger'

logger.info('User logged in', { userId: user.id })
logger.error('Database connection failed', { error: err.message })
```

---

## 💰 成本估算

### 1. 免费层 (MVP)

| 服务 | 成本 | 说明 |
|------|------|------|
| Vercel Hobby | $0 | 个人项目，有限资源 |
| Supabase Free | $0 | 500MB 数据库 |
| GitHub Actions | $0 | 2000 分钟/月 |
| OpenAI | ~$10/月 | 1000 次调用 |
| **总计** | **~$10/月** | 适合开发测试 |

### 2. 生产环境 (小规模)

| 服务 | 成本 | 说明 |
|------|------|------|
| Vercel Pro | $20/月/成员 | 团队协作 |
| PostgreSQL | $15-50/月 | 1-2GB 数据库 |
| Redis | $10-20/月 | 基础缓存 |
| OpenAI | $50-100/月 | 5000-10000 次调用 |
| Sentry | $26/月 | 错误追踪 |
| S3/Cloudinary | $5-20/月 | 文件存储 |
| **总计** | **~$126-216/月** | 支持 1000+ 用户 |

### 3. 企业级 (大规模)

| 服务 | 成本 | 说明 |
|------|------|------|
| Vercel Enterprise | 定制 | 无限功能 |
| AWS RDS | $100-500/月 | 多可用区 |
| AWS ElastiCache | $50-200/月 | Redis 集群 |
| OpenAI | $200-1000/月 | 高频调用 |
| Datadog/Sentry | $100-300/月 | 全面监控 |
| AWS CloudFront | $50-200/月 | CDN 流量 |
| **总计** | **~$500-2200/月** | 10000+ 用户 |

---

## 🔄 扩展策略

### 1. 水平扩展

**应用层**
```yaml
# Kubernetes Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexus-design-app
spec:
  replicas: 3  # 多个实例
  selector:
    matchLabels:
      app: nexus-design
  template:
    spec:
      containers:
      - name: app
        image: nexus-design:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

**数据库层**
```sql
-- 读写分离
-- 主库：写操作
-- 从库：读操作

-- 创建只读副本
CREATE PUBLICATION nexus_pub FOR TABLE projects, versions, comments;
```

### 2. 缓存策略

**Redis 缓存**
```typescript
// lib/cache.ts
export class CacheService {
  private static readonly TTL = 300
  
  async getProject(projectId: string) {
    const key = `project:${projectId}`
    const cached = await redis.get(key)
    if (cached) return JSON.parse(cached)
    
    const project = await db.project.findUnique({ where: { id: projectId } })
    if (project) {
      await redis.setex(key, this.TTL, JSON.stringify(project))
    }
    return project
  }
}
```

**CDN 配置**
```typescript
// next.config.js
module.exports = {
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
  },
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

---

## 🚨 故障恢复

### 1. 数据库恢复

```bash
# 从备份恢复
# 1. 停止应用
docker-compose stop app

# 2. 恢复数据库
gunzip backup_20251217.sql.gz
psql -h localhost -U nexus -d nexus_design < backup_20251217.sql

# 3. 重启应用
docker-compose start app
```

### 2. 应用回滚

```bash
# Vercel 回滚
# Dashboard → Deployments → 选择旧版本 → Redeploy

# Docker 回滚
docker tag nexus-design:latest nexus-design:backup
docker tag nexus-design:previous nexus-design:latest
docker-compose up -d
```

### 3. 灾难恢复计划

```markdown
# 灾难恢复清单

## 场景：数据库完全丢失
1. 停止所有应用实例
2. 从最新备份恢复数据库
3. 运行数据库迁移
4. 验证数据完整性
5. 重启应用
6. 监控错误日志

## 场景：应用服务器宕机
1. 启动备用实例
2. 更新 DNS 指向备用实例
3. 验证服务可用性
4. 调查根本原因

## 场景：AI 服务不可用
1. 降级到基本功能
2. 显示友好提示
3. 切换到备用 AI 提供商
4. 监控恢复情况
```

---

## 📈 性能优化检查清单

### 部署前检查
- [ ] 运行 `npm run build` 检查构建错误
- [ ] 运行 `npm run lint` 检查代码质量
- [ ] 运行所有测试
- [ ] 检查环境变量配置
- [ ] 验证数据库连接
- [ ] 测试 API 端点
- [ ] 检查依赖版本

### 性能优化
- [ ] 启用图片优化 (next/image)
- [ ] 配置代码分割
- [ ] 启用压缩 (gzip/brotli)
- [ ] 配置 CDN 缓存
- [ ] 优化数据库索引
- [ ] 启用 Redis 缓存
- [ ] 配置 Sentry 监控

### 安全检查
- [ ] 更新所有依赖到最新版本
- [ ] 检查安全漏洞 (npm audit)
- [ ] 配置 HTTPS
- [ ] 设置安全 headers
- [ ] 配置速率限制
- [ ] 验证环境变量安全
- [ ] 设置访问控制

---

## 📞 支持和维护

### 日常维护
```bash
# 每日
- 检查错误日志
- 监控性能指标
- 验证备份状态

# 每周
- 更新依赖
- 检查安全更新
- 优化数据库

# 每月
- 审计访问日志
- 性能分析
- 成本优化
```

### 监控指标
- **应用**: 响应时间、错误率、并发用户
- **数据库**: 连接数、查询性能、存储使用
- **AI**: 调用次数、响应时间、成本
- **业务**: 用户增长、活跃度、转化率

---

**版本**：v1.0.0  
**最后更新**：2025-12-17  
**状态**：部署方案完成