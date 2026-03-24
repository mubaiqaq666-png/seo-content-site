# 🚀 SEO内容站 - 完整使用指南

## 📱 桌面快捷方式

已在桌面创建 4 个快捷方式，双击即可使用：

| 图标 | 名称 | 功能 | 说明 |
|------|------|------|------|
| 📱 | **SEO内容站** | 主菜单 | 交互式菜单，选择不同功能 |
| 🖥️ | **SEO控制面板** | 可视化配置 | 打开浏览器访问 http://localhost:3001 |
| ✨ | **快速生成文章** | 一键生成 | 立即生成新文章 |
| 🌐 | **本地预览网站** | 启动服务器 | 启动开发服务器并打开浏览器 |

---

## 🖥️ 控制面板功能

访问 **http://localhost:3001** 可以看到：

### 📊 实时统计
- 📄 总文章数
- ✨ 今日生成数量
- ⏰ 上次运行时间
- 📅 下次运行时间

### 🔥 热门话题
- 🔍 百度热搜
- 📢 微博热搜
- 💡 知乎热榜
- 🎵 抖音热点

每个话题可以点击"选用"按钮快速生成相关文章。

### ⚙️ 系统配置
- 网站名称
- 网站域名
- 每日生成文章数
- 自动运行开关
- 运行时间设置
- 数据源选择

### 🤖 操作按钮
- **刷新** - 重新获取热门话题
- **保存配置** - 保存系统设置
- **立即生成** - 手动触发文章生成

### 📋 运行日志
实时显示系统运行日志，可以清空日志。

---

## 📝 命令行使用

### 快速命令

```bash
# 进入项目目录
cd ~/.qclaw/workspace/seo-content-site

# 打开控制面板
npm run dashboard

# 快速生成文章
npm run generate

# 每日自动生成（抓取热搜）
npm run daily

# 本地预览网站
npm run dev

# 完整部署
npm run deploy

# 查看热门话题
npm run fetch
```

### 启动菜单

```bash
./start.sh
```

选择菜单选项：
```
1) 🎯 快速生成
2) 🔥 每日自动
3) 🖥️  打开控制面板
4) 📊 查看状态
5) 🚀 完整部署
```

---

## ⏰ 设置每日自动运行

### 方法1: crontab（推荐）

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每天9点自动运行）
0 9 * * * cd ~/.qclaw/workspace/seo-content-site && node src/scripts/dailyGenerate.js >> logs/daily.log 2>&1
```

### 方法2: launchd（Mac）

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
        <string>~/.qclaw/workspace/seo-content-site/src/scripts/dailyGenerate.js</string>
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

## 🔧 配置文件

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

## 📁 项目结构

```
seo-content-site/
├── start.sh                    # 一键启动脚本
├── start-dashboard.sh          # 控制面板启动脚本
├── launcher.sh                 # 菜单启动器
├── create-desktop-shortcut.sh  # 创建桌面快捷方式
├── src/
│   ├── scripts/
│   │   ├── generate.js         # 文章生成
│   │   ├── dailyGenerate.js    # 每日自动生成
│   │   ├── fetchHotTopics.js   # 热门话题抓取
│   │   ├── deploy.js           # 部署脚本
│   │   └── dashboard-server.js # 控制面板服务器
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

## 🐛 常见问题

**Q: 控制面板打不开？**
A: 确保没有其他程序占用 3001 端口。运行 `lsof -i :3001` 查看。

**Q: 热门话题抓取失败？**
A: 部分网站有反爬机制，脚本会自动使用模拟数据。

**Q: 如何修改生成文章的质量？**
A: 编辑 `src/scripts/generate.js` 中的 `generateArticle` 函数。

**Q: 如何添加新的数据源？**
A: 在 `fetchHotTopics.js` 的 `DATA_SOURCES` 中添加新配置。

---

## 📄 许可证

MIT License
