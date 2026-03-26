# 🎯 广告管理后台使用指南

## 快速开始

### 1. 访问广告管理后台
```
https://seo-content-site.vercel.app/admin/ads
```

### 2. 启用广告平台

在后台面板中，选择要启用的广告平台：
- ✅ 百度广告联盟（国内推荐）
- ✅ 腾讯广告（国内）
- ✅ 字节穿山甲（国内）
- ✅ Google AdSense（海外）

### 3. 填写平台 ID

根据选择的平台，填写相应的 ID：

#### 百度广告联盟
```
申请地址：https://union.baidu.com/
必填项：
  - 广告位 ID (slotId)：从百度后台获取
可选项：
  - 百度统计 ID：用于数据分析
```

#### 腾讯广告
```
申请地址：https://e.qq.com/ads/
必填项：
  - App ID：从腾讯后台获取
  - 广告位 ID (posId)：从腾讯后台获取
```

#### 字节穿山甲
```
申请地址：https://www.pangle.cn/
必填项：
  - App ID：从穿山甲后台获取
  - 广告位 ID (slotId)：从穿山甲后台获取
```

#### Google AdSense
```
申请地址：https://adsense.google.com/
必填项：
  - 发布商 ID：格式 ca-pub-xxxxxxxxxx
```

### 4. 保存配置

点击"💾 保存配置"按钮，配置会自动保存到浏览器本地存储。

### 5. 验证效果

刷新网站，广告应该会自动加载：
- 国内用户看到百度/腾讯/穿山甲广告
- 海外用户看到 Google AdSense 广告

---

## 工作原理

### 自动地区检测
系统会根据用户的时区自动检测地区：
```javascript
// 检测逻辑
国内用户 (Shanghai/Beijing/Hong_Kong) 
  → 优先显示百度广告
  → 其次腾讯广告
  → 最后穿山甲广告

海外用户
  → 优先显示 Google AdSense
  → 备选百度广告
```

### 广告加载流程
```
用户访问网站
    ↓
检测用户地区
    ↓
读取 localStorage 中的配置
    ↓
根据地区选择广告平台
    ↓
加载对应平台的广告脚本
    ↓
广告显示在页面上
```

### 配置存储
- 配置保存在浏览器 `localStorage` 中
- 键名：`adsConfig`
- 格式：JSON
- 不会上传到服务器

---

## 获取平台 ID 的详细步骤

### 百度广告联盟

**第一步：注册账户**
1. 访问 https://union.baidu.com/
2. 使用百度账号登录
3. 完成实名认证

**第二步：创建广告位**
1. 进入"我的广告位"
2. 点击"新建广告位"
3. 选择广告类型（推荐：原生广告）
4. 填写网站信息
5. 获取 **slotId**（广告位 ID）

**第三步：获取百度统计 ID（可选）**
1. 访问 https://tongji.baidu.com/
2. 新建网站
3. 获取统计代码中的 ID

---

### 腾讯广告

**第一步：注册账户**
1. 访问 https://e.qq.com/ads/
2. 使用 QQ 或微信登录
3. 完成企业认证

**第二步：创建应用**
1. 进入"应用管理"
2. 点击"新建应用"
3. 填写应用信息
4. 获取 **App ID**

**第三步：创建广告位**
1. 进入"广告位管理"
2. 点击"新建广告位"
3. 选择应用和广告类型
4. 获取 **posId**（广告位 ID）

---

### 字节穿山甲

**第一步：注册账户**
1. 访问 https://www.pangle.cn/
2. 使用字节账号登录
3. 完成开发者认证

**第二步：创建应用**
1. 进入"应用管理"
2. 点击"创建应用"
3. 选择应用类型（Web）
4. 获取 **App ID**

**第三步：创建广告位**
1. 进入"广告位管理"
2. 点击"新建广告位"
3. 选择广告格式
4. 获取 **slotId**（广告位 ID）

---

### Google AdSense

**第一步：申请 AdSense**
1. 访问 https://adsense.google.com/
2. 使用 Google 账号登录
3. 填写网站信息
4. 等待 Google 审核（通常 1-3 天）

**第二步：获取发布商 ID**
1. 审核通过后，进入"账户"
2. 找到"账户信息"
3. 复制 **发布商 ID**（格式：ca-pub-xxxxxxxxxx）

---

## 常见问题

### Q: 广告为什么不显示？
**A:** 检查以下几点：
1. 是否启用了广告平台？
2. 是否填写了所有必填 ID？
3. 是否保存了配置？
4. 是否刷新了页面？
5. 检查浏览器控制台是否有错误

### Q: 如何同时启用多个平台？
**A:** 可以同时启用多个平台，系统会根据用户地区自动选择最优平台。

### Q: 配置会丢失吗？
**A:** 不会。配置保存在浏览器本地存储中，除非清除浏览器数据。

### Q: 如何修改配置？
**A:** 回到广告管理后台，修改相应字段，点击"保存配置"即可。

### Q: 广告收入如何结算？
**A:** 根据各平台的结算政策：
- 百度：月结，最低 100 元提现
- 腾讯：月结，最低 50 元提现
- 穿山甲：月结，最低 100 元提现
- Google AdSense：月结，最低 100 美元提现

### Q: 如何查看广告收入？
**A:** 登录各平台后台查看：
- 百度：https://union.baidu.com/
- 腾讯：https://e.qq.com/ads/
- 穿山甲：https://www.pangle.cn/
- Google：https://adsense.google.com/

---

## 优化建议

### 1. 广告位置优化
- 顶部：728x90 横幅广告
- 文章中部：300x250 方形广告
- 底部：728x90 横幅广告
- 侧边栏：300x250 方形广告

### 2. 加载策略
- 使用懒加载，不影响页面速度
- 设置 5 秒超时，防止广告卡顿
- 广告加载失败自动降级

### 3. 用户体验
- 不要过度投放广告
- 保持内容与广告的平衡
- 定期检查广告质量

### 4. 收入优化
- 优先投放高价值广告
- 根据用户地区选择平台
- 定期调整广告位置和大小

---

## 技术细节

### 配置格式
```json
{
  "enabled": true,
  "baidu": {
    "enabled": true,
    "slotId": "XXXXXXXX",
    "tongjiId": "XXXXXXXX"
  },
  "tencent": {
    "enabled": false,
    "appId": "1XXXXXXXX",
    "posId": "XXXXXXXX"
  },
  "bytedance": {
    "enabled": false,
    "appId": "5XXXXXXXX",
    "slotId": "XXXXXXXX"
  },
  "google": {
    "enabled": false,
    "publisherId": "ca-pub-XXXXXXXXXX"
  }
}
```

### 事件监听
```javascript
// 监听配置更新
window.addEventListener('adsConfigUpdated', (e) => {
  console.log('广告配置已更新:', e.detail)
})
```

### 手动加载广告
```javascript
// 从 localStorage 读取配置
const config = JSON.parse(localStorage.getItem('adsConfig'))

// 手动触发配置更新
window.dispatchEvent(new CustomEvent('adsConfigUpdated', { 
  detail: config 
}))
```

---

## 支持

如有问题，请：
1. 检查浏览器控制台错误
2. 查看各平台官方文档
3. 联系平台客服

---

## 更新日志

### v1.0 (2026-03-26)
- ✅ 新增广告管理后台
- ✅ 支持百度/腾讯/穿山甲/Google AdSense
- ✅ 自动地区检测
- ✅ 本地配置存储
- ✅ 实时配置更新

---

**祝你广告收入节节高升！** 🚀
