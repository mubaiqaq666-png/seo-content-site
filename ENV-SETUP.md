# 🔐 广告后台密码配置指南

## 密码安全说明

**重要：** 广告后台密码不再硬编码在代码中，而是通过环境变量管理。

### 为什么这样做？
- ✅ 密码不会暴露在代码库中
- ✅ 不同环境可以使用不同密码
- ✅ 更容易更新密码
- ✅ 符合安全最佳实践

---

## 本地开发环境配置

### 第一步：创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件：

```bash
cp .env.example .env.local
```

### 第二步：设置密码

编辑 `.env.local`，设置你的管理员密码：

```
VITE_ADMIN_PASSWORD=你的密码
```

**密码建议：**
- ✅ 至少 12 个字符
- ✅ 包含大小写字母、数字、特殊符号
- ✅ 不要使用常见单词或生日
- ✅ 例如：`Admin@2026#Secure!`

### 第三步：启动开发服务器

```bash
npm run dev
```

现在访问 `/admin/ads` 时需要输入密码。

---

## 生产环境配置（Vercel）

### 第一步：设置环境变量

在 Vercel 项目设置中添加环境变量：

1. 访问 https://vercel.com/dashboard
2. 选择项目 `seo-content-site`
3. 进入 Settings → Environment Variables
4. 添加新变量：
   - **Name:** `VITE_ADMIN_PASSWORD`
   - **Value:** 你的强密码
   - **Environments:** Production, Preview, Development

### 第二步：重新部署

```bash
git push origin main
```

Vercel 会自动使用新的环境变量重新部署。

### 第三步：验证

部署完成后，访问 `/admin/ads` 输入密码验证。

---

## 密码更新

### 本地更新
编辑 `.env.local`，修改 `VITE_ADMIN_PASSWORD` 的值，重启开发服务器。

### 生产环境更新
1. 在 Vercel 项目设置中修改环境变量
2. 点击"Save"
3. 自动重新部署（或手动触发）

---

## 忘记密码怎么办？

### 本地开发
- 编辑 `.env.local` 重新设置密码
- 重启开发服务器

### 生产环境
- 在 Vercel 项目设置中修改环境变量
- 重新部署

---

## 安全最佳实践

### ✅ 应该做
- 使用强密码（20+ 字符）
- 定期更新密码（每 3 个月）
- 不要在代码中硬编码密码
- 不要在 Git 中提交 `.env.local`
- 使用 `.gitignore` 排除 `.env.local`

### ❌ 不应该做
- 使用简单密码（如 `123456`、`admin`）
- 在代码中写密码
- 在 Git 中提交密码
- 与他人共享密码
- 在浏览器历史中保存密码

---

## 高级安全选项（可选）

### 选项 1：使用 OAuth 登录
```javascript
// 集成 GitHub/Google 登录
// 比密码更安全
```

### 选项 2：IP 白名单
```javascript
// 只允许特定 IP 访问后台
// 在 Vercel 或 CDN 层配置
```

### 选项 3：双因素认证
```javascript
// 除了密码，还需要输入验证码
// 使用 TOTP（如 Google Authenticator）
```

### 选项 4：后端认证
```javascript
// 创建 API 端点验证密码
// 返回 JWT token
// 前端存储 token
```

---

## 故障排查

### 问题：登录页面显示"密码未配置"

**原因：** 环境变量未设置

**解决：**
1. 检查 `.env.local` 是否存在
2. 检查 `VITE_ADMIN_PASSWORD` 是否设置
3. 重启开发服务器
4. 清除浏览器缓存

### 问题：输入密码后仍然无法登录

**原因：** 密码不匹配或环境变量未正确加载

**解决：**
1. 检查密码是否正确
2. 检查 `.env.local` 中是否有多余空格
3. 重启开发服务器
4. 尝试清除浏览器 localStorage：
   ```javascript
   localStorage.clear()
   ```

### 问题：生产环境无法登录

**原因：** Vercel 环境变量未正确设置

**解决：**
1. 检查 Vercel 项目设置中的环境变量
2. 确保变量名称完全匹配：`VITE_ADMIN_PASSWORD`
3. 重新部署
4. 等待部署完成后再测试

---

## 环境变量文件说明

### `.env.example`
- 模板文件，包含所有可用的环境变量
- 可以提交到 Git
- 用于文档和参考

### `.env.local`
- 本地开发环境配置
- **不要提交到 Git**
- 已在 `.gitignore` 中排除

### `.env.production`
- 生产环境配置（可选）
- 通常在 Vercel 项目设置中配置
- 不需要本地文件

---

## 总结

| 环境 | 配置方式 | 文件 |
|------|--------|------|
| 本地开发 | `.env.local` | 创建本地文件 |
| Vercel 生产 | 项目设置 | 在 Vercel 控制台设置 |
| 其他部署 | 系统环境变量 | 根据部署平台设置 |

---

**现在你的广告后台已经安全了！** 🔐
