# 国内外访问优化指南

## 当前部署架构

```
┌─────────────────────────────────────────────────────────┐
│                    用户访问                              │
├─────────────────────────────────────────────────────────┤
│  国内用户 ──→ 国内 CDN 镜像 (推荐)                      │
│  海外用户 ──→ Vercel Edge Network (自动)               │
└─────────────────────────────────────────────────────────┘
```

## 方案一：Vercel 官方（已配置）

**优点：**
- ✅ 自动全球 CDN 加速
- ✅ 无需额外配置
- ✅ 支持 Edge Functions
- ✅ 自动 HTTPS

**国内访问速度：** 中等（通过香港/新加坡节点）

**访问地址：** https://seo-content-site.vercel.app

---

## 方案二：国内 CDN 镜像（推荐用于国内用户）

### 选项 A：阿里云 CDN + OSS

```bash
# 1. 创建 OSS Bucket
# 访问：https://oss.aliyun.com/
# 创建 bucket: seo-content-site
# 设置为公开读

# 2. 上传构建产物
# 从 dist/ 目录上传所有文件到 OSS

# 3. 配置 CDN
# 源站：seo-content-site.oss-cn-hangzhou.aliyuncs.com
# CDN 域名：cdn.example.com (自定义域名)

# 4. 配置回源规则
# 缓存规则：
# - /assets/* → 1年强缓存
# - /data/* → 1小时缓存
# - /* → 1小时缓存
```

**成本：** ¥0.2-0.5/GB（取决于流量）

---

### 选项 B：腾讯云 CDN + COS

```bash
# 1. 创建 COS Bucket
# 访问：https://console.cloud.tencent.com/cos
# 创建 bucket: seo-content-site
# 地域：北京/上海/广州

# 2. 上传构建产物
# 从 dist/ 目录上传所有文件

# 3. 配置 CDN
# 源站：seo-content-site.cos.ap-beijing.myqcloud.com
# CDN 域名：cdn.example.com

# 4. 配置缓存策略
# 同上
```

**成本：** ¥0.15-0.4/GB

---

### 选项 C：七牛云 CDN

```bash
# 1. 创建存储空间
# 访问：https://portal.qiniu.com/
# 创建空间：seo-content-site

# 2. 上传文件
# 使用七牛云 SDK 或 Web 界面上传

# 3. 配置 CDN
# 自动生成 CDN 域名
# 或绑定自定义域名

# 4. 缓存配置
# 同上
```

**成本：** ¥0.1-0.3/GB（最便宜）

---

## 方案三：自建 CDN 节点（高级）

### 使用 Cloudflare Workers + R2

```javascript
// wrangler.toml
name = "seo-content-site"
type = "javascript"
account_id = "your-account-id"
workers_dev = true
route = "cdn.example.com/*"
zone_id = "your-zone-id"

[env.production]
vars = { BUCKET = "seo-content-site" }

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "seo-content-site"
```

**优点：**
- ✅ 全球 200+ 节点
- ✅ 国内访问快速
- ✅ 免费额度充足
- ✅ 支持 Workers 脚本

**成本：** 免费（小流量）或 $0.015/GB

---

## 方案四：双源部署（最优）

```
┌──────────────────────────────────────────────────────┐
│              DNS 智能解析                             │
├──────────────────────────────────────────────────────┤
│  国内用户 ──→ 国内 CDN (阿里/腾讯/七牛)             │
│  海外用户 ──→ Vercel Edge Network                   │
│  其他地区 ──→ Cloudflare CDN                        │
└──────────────────────────────────────────────────────┘
```

### 配置步骤

**1. 购买域名**
```bash
# 推荐：阿里云域名、腾讯云域名
# 域名：example.com
```

**2. 配置 DNS 解析**
```
# 使用 DNSPod 或阿里云 DNS

# 记录 1：国内用户
# 类型：CNAME
# 名称：www
# 值：seo-content-site.oss-cn-hangzhou.aliyuncs.com
# 线路：国内

# 记录 2：海外用户
# 类型：CNAME
# 名称：www
# 值：cname.vercel-dns.com
# 线路：海外

# 记录 3：其他
# 类型：CNAME
# 名称：www
# 值：cname.cloudflare.com
# 线路：默认
```

**3. 配置 SSL 证书**
```bash
# 使用 Let's Encrypt 免费证书
# 或购买 SSL 证书
```

---

## 快速部署脚本

### 部署到阿里云 OSS

```bash
#!/bin/bash

# 配置
OSS_BUCKET="seo-content-site"
OSS_REGION="oss-cn-hangzhou"
OSS_ENDPOINT="https://${OSS_BUCKET}.${OSS_REGION}.aliyuncs.com"

# 1. 构建
npm run build

# 2. 安装 ossutil
# brew install ossutil (macOS)
# 或从 https://github.com/aliyun/ossutil 下载

# 3. 配置 ossutil
ossutil config -i YOUR_ACCESS_KEY_ID -k YOUR_ACCESS_KEY_SECRET -e ${OSS_ENDPOINT}

# 4. 上传
ossutil cp -r dist/ oss://${OSS_BUCKET}/

# 5. 设置缓存头
ossutil set-meta oss://${OSS_BUCKET}/assets/ Cache-Control:max-age=31536000
ossutil set-meta oss://${OSS_BUCKET}/data/ Cache-Control:max-age=3600
```

### 部署到腾讯云 COS

```bash
#!/bin/bash

# 配置
COS_BUCKET="seo-content-site-1234567890"
COS_REGION="ap-beijing"

# 1. 构建
npm run build

# 2. 安装 coscmd
pip install coscmd

# 3. 配置 coscmd
coscmd config -a YOUR_SECRET_ID -s YOUR_SECRET_KEY -b ${COS_BUCKET} -r ${COS_REGION}

# 4. 上传
coscmd upload -r dist/ /

# 5. 设置缓存
coscmd set-meta / Cache-Control:max-age=3600
```

---

## 性能对比

| 方案 | 国内速度 | 海外速度 | 成本 | 配置难度 |
|------|--------|--------|------|--------|
| Vercel 官方 | 中 | 快 | 免费 | 简单 |
| 阿里云 CDN | 快 | 中 | ¥0.2-0.5/GB | 中等 |
| 腾讯云 CDN | 快 | 中 | ¥0.15-0.4/GB | 中等 |
| 七牛云 CDN | 快 | 中 | ¥0.1-0.3/GB | 简单 |
| Cloudflare | 快 | 快 | 免费-$0.015/GB | 中等 |
| 双源部署 | 快 | 快 | ¥0.1-0.5/GB | 复杂 |

---

## 推荐方案

### 对于国内用户
**推荐：七牛云 CDN**
- 成本最低
- 配置简单
- 国内访问快速

### 对于全球用户
**推荐：Vercel + Cloudflare**
- 无需额外成本
- 全球加速
- 自动故障转移

### 对于大流量网站
**推荐：双源部署**
- 国内用户走国内 CDN
- 海外用户走 Vercel
- 最优性能和成本

---

## 监控和优化

### 1. 性能监控
```bash
# 使用 Vercel Analytics
# 访问：https://vercel.com/analytics

# 使用 CDN 厂商的监控面板
# 阿里云：https://console.aliyun.com/
# 腾讯云：https://console.cloud.tencent.com/
```

### 2. 缓存优化
```
# 静态资源（1年）
/assets/index-*.js
/assets/index-*.css
/favicon.svg

# 数据文件（1小时）
/data/posts.json
/sitemap.xml
/robots.txt

# HTML（1小时）
/index.html
/posts/*
/category/*
```

### 3. 压缩优化
```bash
# 启用 Gzip 压缩
# 启用 Brotli 压缩（更优）
# 图片优化（WebP 格式）
```

---

## 故障排查

### 国内访问慢
1. 检查 DNS 解析是否正确
2. 检查 CDN 缓存是否命中
3. 检查源站是否正常
4. 尝试切换 CDN 厂商

### 海外访问慢
1. 检查 Vercel 部署是否成功
2. 检查网络连接
3. 尝试使用 Cloudflare 加速

### 广告无法加载
1. 检查广告配置是否正确
2. 检查浏览器控制台错误
3. 检查广告平台是否支持该地区

---

## 总结

- **当前状态**：Vercel 官方部署，全球可访问
- **国内优化**：可选配置国内 CDN 镜像
- **推荐方案**：七牛云 CDN（国内）+ Vercel（海外）
- **成本**：¥0.1-0.5/GB（取决于流量）
- **配置时间**：30 分钟内完成

需要帮助配置国内 CDN 吗？告诉我你选择的方案！
