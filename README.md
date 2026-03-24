# SEO内容站系统 - 完整指南

## 🎯 项目概述

全自动SEO内容生成与部署系统，支持：
- ✅ 一键生成SEO文章
- ✅ 每日自动抓取热门话题
- ✅ 可视化配置面板
- ✅ 自动部署到Vercel

---

## 🚀 快速开始

### Mac一键运行

```bash
./start.sh
```

启动后会显示菜单：
```
1) 🎯 快速生成 (生成预设文章并部署)
2) 🔥 每日自动 (抓取热搜生成文章)
3) 🖥️  打开控制面板 (可视化配置)
4) 📊 查看状态
5) 🚀 完整部署 (生成+Git+推送)
```

### 手动命令

```bash
# 本地预览网站
npm run dev

# 快速生成文章
npm run generate

# 每日自动生成（抓取热搜）
npm run daily

# 打开控制面板
npm run dashboard

# 完整部署
npm run deploy
```

---

## 🖥️ 可视化控制面板

运行 `npm run dashboard` 或在启动菜单选择 `3)`，打开控制面板：

**功能：**
- 📊 实时统计（文章数、今日生成、运行状态）
- 🔥 热门话题监控（百度/微博/知乎/抖音）
- ⚙️ 系统配置（网站名称、域名、数据源）
- 🤖 一键生成/部署
- 📋 运行日志

---

## ⏰ 设置每日自动运行

### 方法1: 使用 crontab

```bash
# 编辑 crontab
crontab -e

# 添加以下内容（每天9点自动运行）
0 9 * * * cd /你的项目路径/seo-content-site && /usr/local/bin/node src/scripts/dailyGenerate.js >> logs/daily.log 2>&1
```

### 方法2: 使用 launchd (Mac推荐)

创建 `~/Library/LaunchAgents/com.seosite.daily.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.seosite.daily</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/你的项目路径/seo-content-site/src/scripts/dailyGenerate.js</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
</dict>
</plist>
```

加载任务：
```bash
launchctl load ~/Library/LaunchAgents/com.seosite.daily.plist
```

---

## 📁 项目结构

```
seo-content-site/
├── start.sh                    # 一键启动脚本
├── src/
│   ├── scripts/
│   │   ├── generate.js         # 文章生成
│   │   ├── dailyGenerate.js    # 每日自动生成
│   │   ├── fetchHotTopics.js   # 热门话题抓取
│   │   └── deploy.js           # 部署脚本
│   ├── dashboard/
│   │   └── index.html          # 可视化控制面板
│   ├── pages/                  # 前端页面
│   └── components/             # 组件
├── public/
│   ├── data/posts.json         # 文章数据
│   ├── sitemap.xml
│   └── robots.txt
└── data/posts.json             # 备份数据
```

---

## ⚙️ 配置说明

### 数据源配置

编辑 `src/scripts/fetchHotTopics.js`:

```javascript
const DATA_SOURCES = {
  baidu: { name: '百度热搜', enabled: true },
  weibo: { name: '微博热搜', enabled: true },
  zhihu: { name: '知乎热榜', enabled: true },
  douyin: { name: '抖音热点', enabled: false }
}
```

### 关键词配置

编辑 `src/scripts/generate.js` 顶部的 `KEYWORDS` 数组。

### 广告配置

编辑 `src/data/ads.config.js`:

```javascript
const adsConfig = {
  enabled: true,
  type: 'adsense',
  config: { publisherId: 'ca-pub-你的ID' }
}
```

---

## 🚀 部署到 Vercel

1. 推送代码到 GitHub
2. 访问 [vercel.com](https://vercel.com)
3. Import 你的仓库
4. Framework 选择 **Vite**
5. Deploy

之后每次 `git push` 自动触发重新部署。

---

## 📝 常见问题

**Q: 热门话题抓取失败？**
A: 部分网站有反爬机制，脚本会自动使用模拟数据备用。

**Q: 如何修改生成文章的质量？**
A: 编辑 `src/scripts/generate.js` 中的 `generateArticle` 函数。

**Q: 如何添加新的数据源？**
A: 在 `fetchHotTopics.js` 的 `DATA_SOURCES` 中添加新的配置。

---

## 📄 许可证

MIT License
