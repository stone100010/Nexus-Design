# Nexus Design - 部署方案

## Docker 部署

### 构建和运行

```bash
# 构建镜像
docker build -t nexus-design .

# 使用 docker-compose 运行（包含 PostgreSQL + Redis）
docker-compose up -d
```

### 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | 是 | PostgreSQL 连接字符串 |
| `NEXTAUTH_SECRET` | 是 | 会话加密密钥 |
| `NEXTAUTH_URL` | 是 | 应用 URL |
| `NEXUS_OPENAI_API_KEY` | 是 | OpenAI API 密钥 |
| `NEXUS_OPENAI_BASE_URL` | 否 | 自定义 OpenAI 端点 |
| `NEXUS_OPENAI_MODEL` | 否 | AI 模型名称 (默认: deepseek-v3.2) |
| `NEXUS_DEMO_PASSWORD` | 否 | 演示账号密码 |
| `NEXUS_ADMIN_PASSWORD` | 否 | 管理员密码 |

### 生成密钥

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32
```

## 手动部署

### 构建

```bash
npm install
npx prisma generate
npm run build
```

### 启动

```bash
npm run start
```

## 数据库迁移

```bash
# 推送 schema 变更
npx prisma db push

# 填充种子数据
npx prisma db seed
```

## CI/CD

GitHub Actions 工作流 (`.github/workflows/ci.yml`) 执行：
1. ESLint 检查
2. TypeScript 类型检查
3. 单元测试
4. 生产构建

## 生产检查清单

- [ ] `npm run build` 构建成功
- [ ] `npm run lint` 零警告
- [ ] `npx tsc --noEmit` 零错误
- [ ] 所有测试通过 (`npx vitest run`)
- [ ] 环境变量已配置
- [ ] 数据库已迁移
- [ ] 安全响应头已配置 (next.config.js)
- [ ] `.env` 不在版本控制中
