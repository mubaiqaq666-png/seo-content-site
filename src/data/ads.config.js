// =============================================
// 广告配置 - 支持中国广告联盟
// Google AdSense（海外）+ 百度广告联盟/腾讯广告（国内）
// =============================================

const adsConfig = {
  // 设为 true 启用广告，false 禁用
  enabled: true,

  // 广告类型: 'adsense' | 'baidu' | 'tencent' | 'placeholder'
  type: 'baidu',

  // ============ 中国广告平台配置 ============
  // 申请地址：
  // - 百度广告联盟: https://union.baidu.com/
  // - 腾讯广告: https://e.qq.com/ads/
  // - 字节穿山甲: https://www.pangle.cn/

  china: {
    // 百度广告联盟
    baidu: {
      enabled: true,
      // 百度统计 ID（用于数据分析，非广告必需）
      tongjiId: 'xxxxxxxx',  // 替换为你的百度统计 ID
      // 广告位 ID，从百度广告联盟后台获取
      slotId: 'XXXXXXXX',    // 替换为你的百度广告位 ID
    },
    // 腾讯广告
    tencent: {
      enabled: false,
      appId: '1xxxxxxxx',    // 替换为你的腾讯广告 AppId
      posId: 'XXXXXXXX',    // 替换为你的腾讯广告广告位 ID
    },
    // 字节跳动穿山甲
    bytedance: {
      enabled: false,
      appId: '5xxxxxxxx',    // 替换为你的穿山甲 AppId
      slotId: 'XXXXXXXX',   // 替换为你的穿山甲广告位 ID
    },
  },

  // ============ 海外广告平台配置 ============
  google: {
    enabled: false,
    publisherId: 'ca-pub-XXXXXXXXXX', // 替换为你的 AdSense 发布商 ID
  },

  // 广告位尺寸配置
  slots: {
    top: { name: '顶部横幅', size: '728x90|320x100' },
    middle: { name: '文章中部', size: '300x250|336x280' },
    bottom: { name: '底部广告', size: '728x90|320x100' },
    sidebar: { name: '侧边栏', size: '300x250' },
  },

  // 加载策略：'eager' 立即加载 | 'lazy' 懒加载
  loadStrategy: 'lazy',

  // 广告加载超时（毫秒）
  loadTimeout: 5000,
}

export default adsConfig
