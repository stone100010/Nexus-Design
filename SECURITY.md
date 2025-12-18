# 安全指南

## 🔒 安全最佳实践

### 1. 环境变量管理

**必须创建以下文件（不会被提交到 git）：**

根目录 `.env`：
```bash
# 数据库
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="openssl rand -base64 32 生成的随机字符串"

# OpenAI (可选，用于AI功能)
OPENAI_API_KEY="sk-..."
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL="gpt-4-turbo-preview"

# 演示账号（仅开发环境，生产环境应禁用）
NEXUS_DEMO_PASSWORD="安全的随机密码"
NEXUS_ADMIN_PASSWORD="安全的随机密码"

# OAuth (可选)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

**环境变量原则：**
- ✅ 敏感信息永远使用环境变量
- ✅ 不要在代码中硬编码密钥
- ✅ 不要提交 `.env` 文件
- ✅ 使用 `.env.example` 提供模板

### 2. 密钥生成

```bash
# 生成安全的 NEXTAUTH_SECRET
openssl rand -base64 32

# 生成安全的密码
openssl rand -base64 24
```

### 3. 数据库安全

- 使用 Prisma ORM 防止 SQL 注入
- 密码使用 bcrypt 加密存储
- 数据库连接字符串使用环境变量
- 生产环境启用 SSL 连接
- 限制数据库用户权限

### 4. 认证安全

- 使用 NextAuth.js 进行安全认证
- JWT 策略配置过期时间
- 密码使用 bcrypt 加密
- 生产环境禁用演示账号
- 强烈建议启用邮件验证

### 5. API 安全

- NextAuth 会话验证
- API 路由保护
- 输入验证（Zod）
- 建议实现速率限制
- 配置 CORS 策略

### 6. 依赖安全

- 定期运行 `npm audit`
- 使用 Dependabot 或 Renovate 自动更新
- 检查依赖许可证

### 7. 生产环境配置

```bash
# 必须设置
NODE_ENV=production
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourapp.com"
NEXTAUTH_SECRET="强随机字符串"
OPENAI_API_KEY="sk-..."  # 如需AI功能
```

**安全配置：**
- 禁用 Next.js 开发模式
- 配置 HTTPS
- 设置安全的 HTTP 头
- 启用 CSP（内容安全策略）

## 🚨 紧急响应

如果发现密钥泄露：

1. **立即轮换密钥**
   - OpenAI API 密钥（如使用）
   - 数据库密码
   - OAuth 凭证
   - NextAuth 密钥

2. **清理 Git 历史**
```bash
# 从历史中移除文件
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch apps/web/.env.local' \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送
git push origin --force --all
```

3. **监控滥用**
   - 检查 API 使用日志
   - 监控数据库访问
   - 设置告警

## 🔗 安全工具推荐

- [GitGuardian](https://www.gitguardian.com/) - 监控代码泄露
- [Snyk](https://snyk.io/) - 依赖安全扫描
- [Dependabot](https://docs.github.com/en/code-security/dependabot) - 自动更新依赖
- [TruffleHog](https://github.com/trufflesecurity/trufflehog) - 扫描密钥泄露

---

**最后更新**: 2025-12-18
**版本**: 1.0.0
