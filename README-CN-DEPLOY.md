# 国内部署指南

## 方式一：Vercel + 国内镜像（推荐）

Vercel 在中国有合作节点，配合 CDN 镜像可获得较好访问速度：

1. **部署到 Vercel**（自动）
   ```bash
   npm run deploy
   # 或手动：
   vercel --prod
   ```

2. **接入国内 CDN**
   推荐使用以下服务（无需备案）：
   - **Cloudflare China** (cloudflare.com/zh-cn)
   - **Netlify + 镜像域名**
   - **阿里云 OSS + CDN**（需要备案域名）
   - **腾讯云 COS + CDN**（需要备案域名）

## 方式二：部署到国内服务器（需备案域名）

如果使用国内服务器（如阿里云、腾讯云、华为云）：

### 1. 构建产物
```bash
npm run build
# 产物在 dist/ 目录
```

### 2. Nginx 配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/seo-site/dist;
    index index.html;

    # 启用 gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Vite 构建产物 - 强缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 文章数据 - 短期缓存
    location /data/ {
        expires 1h;
        add_header Cache-Control "public";
    }

    # SPA 路由 fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 禁止访问敏感目录
    location ~ /\. {
        deny all;
    }
}
```

### 3. SSL（HTTPS）
```bash
# 使用 Let's Encrypt 免费证书
sudo certbot --nginx -d your-domain.com
```

## 国内广告联盟申请

### 百度广告联盟
1. 访问 https://union.baidu.com/
2. 注册账号并提交网站审核
3. 审核通过后获取：
   - 百度统计 ID（可选）
   - 广告位 ID（必需）
4. 配置到 `src/data/ads.config.js`：
```javascript
china: {
  baidu: {
    enabled: true,
    tongjiId: '你的百度统计ID',
    slotId: '你的广告位ID',
  }
}
```

### 腾讯广告（原广点通）
1. 访问 https://e.qq.com/ads/
2. 申请成为广告主或流量主
3. 获取 AppId 和广告位 ID

### 字节穿山甲
1. 访问 https://www.pangle.cn/
2. 注册并申请 appId
3. 配置到 `ads.config.js`

## 部署检查清单

- [ ] 生成文章：`npm run generate`
- [ ] 构建：`npm run build`
- [ ] 部署到服务器或 Vercel
- [ ] 配置广告 ID（`ads.config.js`）
- [ ] 配置域名解析
- [ ] 验证 HTTPS 生效
- [ ] 提交搜索引擎收录（百度站长、Google Search Console）
- [ ] 提交 sitemap（百度支持 https://ziyuan.baidu.com/）
