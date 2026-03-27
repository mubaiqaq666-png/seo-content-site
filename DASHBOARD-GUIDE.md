# 🎛️ 本地控制面板使用指南

## 快速开始

### 启动控制面板
```bash
cd /Users/mubai/.qclaw/workspace/seo-content-site
npm run dashboard
```

### 访问地址
```
http://localhost:4000
```

**重要：** 控制面板仅本地访问，外网无法访问，保证安全性。

---

## 功能说明

### 📊 统计面板
- 查看网站流量统计
- 查看广告收入
- 各平台分布情况
- 每 30 秒自动刷新

### 💰 广告配置
- 配置百度/腾讯/穿山甲/Google AdSense
- **广告 ID 保存在本地 `.ads-config.json`，不上传代码仓库**
- 保存配置后，一键部署到线上

### 🚀 一键部署
- 自动执行：生成内容 → 构建 → 提交 → 推送
- Vercel 自动部署
- 实时查看部署日志

### 📝 内容管理
- 手动触发内容抓取
- 查看内容统计
- 查看分类分布

---

## 广告配置流程

### 第一步：启动控制面板
```bash
npm run dashboard
```

### 第二步：打开浏览器
```
http://localhost:4000
```

### 第三步：切换到"广告配置"标签
- 启用需要的广告平台
- 填写广告 ID
- 点击"保存配置"

### 第四步：切换到"部署"标签
- 点击"开始部署"
- 等待部署完成
- 访问网站验证

---

## 文件说明

| 文件 | 用途 | 是否上传 Git |
|------|------|-------------|
| `.ads-config.json` | 广告配置 | ❌ 不上传 |
| `.env.local` | 构建时环境变量 | ❌ 不上传 |
| `.stats.json` | 本地统计数据 | ❌ 不上传 |
| `public/data/ads.json` | 广告启用状态 | ✅ 上传 |

---

## 安全特性

✅ **本地访问** — 控制面板监听 127.0.0.1，外网无法访问
✅ **配置隔离** — 广告 ID 不在代码仓库中
✅ **环境变量注入** — 构建时注入，运行时不可见
✅ **无密码泄露风险** — 敏感信息不暴露

---

## 常见问题

### Q: 为什么广告 ID 不在代码里？
A: 安全考虑。广告 ID 是敏感信息，不应该暴露在公开的代码仓库中。

### Q: 广告配置如何生效？
A: 保存配置时自动生成 `.env.local`，构建时 Vite 会注入环境变量，前端从环境变量读取。

### Q: 可以在服务器上运行控制面板吗？
A: 技术上可以，但不推荐。控制面板设计为本地使用，服务器环境请使用 API 或自动化脚本。

### Q: 配置丢失怎么办？
A: 配置保存在 `.ads-config.json`，只要文件存在就不会丢失。如果丢失需要重新配置。

---

## 常用命令

```bash
# 启动控制面板
npm run dashboard

# 仅生成内容
npm run generate

# 仅构建
npm run build

# 开发模式
npm run dev

# 预览构建产物
npm run preview
```

---

## 高级用法

### 通过命令行部署
```bash
npm run generate && npm run build
git add . && git commit -m "update" && git push
```

### 自动化定时任务
```bash
# crontab -e
0 8 * * * cd /path/to/seo-content-site && npm run generate && npm run build && git add . && git commit -m "daily" && git push
```

---

**现在你可以安全地管理广告配置了！** 🎉
