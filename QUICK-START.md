# 🚀 快速参考

## 网站地址
- **主站**：https://seo-content-site.vercel.app
- **广告后台**：https://seo-content-site.vercel.app/admin/ads
- **GitHub**：https://github.com/mubaiqaq666-png/seo-content-site

---

## 广告平台 ID 获取

| 平台 | 申请地址 | 必填项 | 获取方式 |
|------|--------|--------|--------|
| **百度** | https://union.baidu.com/ | slotId | 后台 → 我的广告位 → 新建 |
| **腾讯** | https://e.qq.com/ads/ | appId, posId | 后台 → 应用管理 → 新建 |
| **穿山甲** | https://www.pangle.cn/ | appId, slotId | 后台 → 应用管理 → 新建 |
| **Google** | https://adsense.google.com/ | publisherId | 账户 → 账户信息 |

---

## 配置步骤

```
1. 访问 /admin/ads
2. 选择要启用的平台
3. 填写平台 ID
4. 点击"保存配置"
5. 刷新网站查看效果
```

---

## 国内外访问优化

### 当前状态
- ✅ Vercel 全球 CDN（自动）
- ✅ 国内访问可用（通过香港/新加坡节点）

### 进一步优化（可选）
- 配置国内 CDN 镜像（七牛/阿里/腾讯）
- 参考：`CDN-DEPLOYMENT.md`

---

## 广告收入结算

| 平台 | 结算周期 | 最低提现 | 结算地址 |
|------|--------|--------|--------|
| 百度 | 月结 | ¥100 | https://union.baidu.com/ |
| 腾讯 | 月结 | ¥50 | https://e.qq.com/ads/ |
| 穿山甲 | 月结 | ¥100 | https://www.pangle.cn/ |
| Google | 月结 | $100 | https://adsense.google.com/ |

---

## 常用命令

```bash
# 本地开发
npm run dev

# 构建
npm run build

# 预览生产版本
npm run preview

# 生成内容
node src/scripts/generate.js

# 部署
git push origin main
```

---

## 文件结构

```
seo-content-site/
├── src/
│   ├── pages/
│   │   ├── Home.jsx              # 首页
│   │   ├── PostDetail.jsx        # 文章详情
│   │   ├── AdsDashboard.jsx      # 广告后台 ⭐
│   │   └── ...
│   ├── components/
│   │   ├── AdComponent.jsx       # 广告组件 ⭐
│   │   └── ...
│   ├── scripts/
│   │   └── generate.js           # 内容生成
│   └── index.css                 # 样式
├── public/
│   └── data/
│       └── posts.json            # 文章数据
├── ADS-GUIDE.md                  # 广告使用指南 ⭐
├── CDN-DEPLOYMENT.md             # CDN 部署指南 ⭐
└── vercel.json                   # Vercel 配置
```

---

## 关键特性

### ✅ 内容
- 150 篇文章
- 平均 1160 字/篇
- 每篇 3-5 张图片
- 自动 RSS 更新

### ✅ 广告
- 4 大平台支持
- 自动地区检测
- 本地配置存储
- 实时生效

### ✅ 访问
- 全球 CDN 加速
- 国内可访问
- 支持国内 CDN 镜像
- 双源部署方案

### ✅ 性能
- CSS 4.6KB (gzip 1.4KB)
- JS 183KB (gzip 58KB)
- 首屏加载 < 2s
- 移动端优化

---

## 下一步

1. **配置广告**
   - 申请各平台账户
   - 获取 ID
   - 填入后台
   - 开始赚钱 💰

2. **优化国内访问**
   - 选择国内 CDN（可选）
   - 参考 CDN-DEPLOYMENT.md
   - 配置双源部署

3. **提交搜索引擎**
   - 百度站长：https://ziyuan.baidu.com/
   - Google Search Console：https://search.google.com/search-console
   - 提交 sitemap.xml

4. **监控数据**
   - 广告收入：各平台后台
   - 网站流量：Vercel Analytics
   - 用户行为：百度统计

---

## 支持

- 📖 详细指南：`ADS-GUIDE.md`
- 🌐 CDN 部署：`CDN-DEPLOYMENT.md`
- 💬 GitHub Issues：https://github.com/mubaiqaq666-png/seo-content-site/issues
- 📧 联系方式：见 About 页面

---

**祝你网站运营顺利！** 🎉
