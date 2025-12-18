# 安全指南

## ⚠️ 开源前必须检查清单

在将此项目开源之前，请务必执行以下安全检查：

### 1. 环境变量管理

#### ✅ 已完成
- [x] 移除所有硬编码的敏感信息
- [x] 创建 `.env.example` 模板文件
- [x] 更新 `.gitignore` 排除环境文件
- [x] 使用环境变量替代硬编码值

#### 🔧 需要手动配置

创建以下文件（不会被提交到 git）：

**根目录 `.env`**
```bash
# 数据库
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="openssl rand -base64 32 生成的随机字符串"

# 演示账号密码（可选，仅开发环境）
NEXUS_DEMO_PASSWORD="安全的随机密码"
NEXUS_ADMIN_PASSWORD="安全的随机密码"

# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL="gpt-4-turbo-preview"

# OAuth（可选）
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# AWS/Cloudinary（可选）
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
CLOUDINARY_API_SECRET=""
```

### 2. 数据库安全

#### ✅ 已完成
- [x] 使用 Prisma ORM（防止 SQL 注入）
- [x] 密码使用 bcrypt 加密存储
- [x] 数据库连接字符串使用环境变量

#### 🔧 需要手动配置
- [ ] 使用强密码的数据库用户
- [ ] 限制数据库用户权限（仅必要权限）
- [ ] 启用 SSL 连接（生产环境）
- [ ] 配置数据库防火墙规则

### 3. 认证安全

#### ✅ 已完成
- [x] NextAuth.js 4.24.5（安全认证库）
- [x] JWT 策略（30天过期）
- [x] 密码使用 bcrypt 加密
- [x] 邮箱验证支持
- [x] OAuth 集成准备

#### 🔧 需要手动配置
- [ ] 禁用演示账号（生产环境）
- [ ] 设置强 `NEXTAUTH_SECRET`
- [ ] 配置 OAuth 凭证（生产环境）
- [ ] 启用邮件验证（使用 Resend/SendGrid）

### 4. API 安全

#### ✅ 已完成
- [x] NextAuth 会话验证
- [x] API 路由保护
- [x] 输入验证（Zod）
- [x] OpenAI API 密钥使用环境变量

#### 🔧 建议增强
- [ ] 实现速率限制（Rate Limiting）
- [ ] 添加 CSRF 保护
- [ ] 配置 CORS 策略
- [ ] 启用 API 日志监控

### 5. AI API 密钥安全

#### ⚠️ 警告
你的 OpenAI API 密钥在之前的提交中可能已泄露！

**必须执行：**
1. 在 OpenAI 仪表板中**立即轮换 API 密钥**
2. 将新密钥添加到 `.env` 文件
3. 使用 `NEXT_PUBLIC_` 前缀时要小心（不要暴露私有密钥）

```bash
# ✅ 正确
OPENAI_API_KEY="sk-..."

# ❌ 错误 - 不要使用 NEXT_PUBLIC_ 前缀
NEXT_PUBLIC_OPENAI_API_KEY="sk-..."
```

### 6. 文件安全

#### ✅ 已完成
- [x] `.env.local` 从 git 移除
- [x] `.gitignore` 更新
- [x] 环境变量模板创建

#### 🔧 需要检查
- [ ] 检查是否有其他敏感文件被提交
- [ ] 检查日志文件是否包含敏感信息
- [ ] 检查备份文件

### 7. 演示账号安全

#### ⚠️ 重要提示
演示账号密码现在使用环境变量：

```bash
# 开发环境 .env
NEXUS_DEMO_PASSWORD="demo123_secure"
NEXUS_ADMIN_PASSWORD="admin123_secure"
```

**生产环境建议：**
- [ ] 禁用演示账号
- [ ] 移除 `apps/web/app/lib/auth.ts` 中的演示账号逻辑
- [ ] 仅允许真实用户注册

### 8. 依赖安全

#### ✅ 已完成
- [x] 使用最新稳定版本
- [x] 依赖已锁定（package-lock.json）

#### 🔧 建议
- [ ] 定期运行 `npm audit`
- [ ] 使用 Dependabot 或 Renovate
- [ ] 检查依赖的许可证

### 9. 数据库暴露风险

#### ⚠️ 警告
之前的配置中包含了内部网络数据库连接：
```
postgresql://openaigc:nestai123@192.168.40.2:5432/...
```

**必须：**
- [ ] 更改数据库密码
- [ ] 限制数据库访问（仅允许应用服务器 IP）
- [ ] 使用云数据库服务（如 Supabase、Neon、Railway）
- [ ] 启用连接加密

### 10. 生产环境部署检查

#### 环境变量
```bash
# 生产环境必须设置
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourapp.com"
NEXTAUTH_SECRET="强随机字符串"
OPENAI_API_KEY="sk-..."
```

#### 安全配置
- [ ] 设置 `NODE_ENV=production`
- [ ] 禁用 Next.js 开发模式
- [ ] 配置 HTTPS
- [ ] 设置安全的 HTTP 头
- [ ] 启用 CSP（内容安全策略）

## 🔒 安全最佳实践

### 1. 密钥管理
```bash
# 生成安全的 NEXTAUTH_SECRET
openssl rand -base64 32

# 生成安全的演示密码
openssl rand -base64 24
```

### 2. 环境变量原则
- ✅ 敏感信息永远使用环境变量
- ✅ 不要在代码中硬编码密钥
- ✅ 不要提交 `.env` 文件
- ✅ 使用 `.env.example` 提供模板

### 3. Git 历史清理
如果已经提交了敏感信息：

```bash
# 1. 从历史中移除文件
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch apps/web/.env.local' \
  --prune-empty --tag-name-filter cat -- --all

# 2. 强制推送
git push origin --force --all

# 3. 轮换所有暴露的密钥
```

### 4. 定期安全检查
```bash
# 检查代码中的密钥
grep -r "sk-" .
grep -r "password" .
grep -r "secret" .

# 检查 npm 漏洞
npm audit

# 检查过时依赖
npm outdated
```

## 🚨 紧急响应

如果发现密钥泄露：

1. **立即轮换密钥**
   - OpenAI API 密钥
   - 数据库密码
   - OAuth 凭证
   - NextAuth 密钥

2. **清理 Git 历史**
   - 使用 `git filter-branch` 或 `BFG Repo-Cleaner`
   - 强制推送

3. **监控滥用**
   - 检查 API 使用日志
   - 监控数据库访问
   - 设置告警

## 📝 开源建议

在 README 中添加：
- 明确的安装说明
- 环境变量配置指南
- 安全警告
- 贡献指南
- 许可证信息

## 🔗 安全工具推荐

- [GitGuardian](https://www.gitguardian.com/) - 监控代码泄露
- [Snyk](https://snyk.io/) - 依赖安全扫描
- [Dependabot](https://docs.github.com/en/code-security/dependabot) - 自动更新依赖
- [TruffleHog](https://github.com/trufflesecurity/trufflehog) - 扫描密钥泄露

---

**最后更新**: 2025-12-18
**版本**: 1.0.0
