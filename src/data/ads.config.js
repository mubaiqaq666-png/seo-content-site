const adsConfig = {
  // 设置为 true 启用广告，false 禁用
  enabled: false,
  
  // 广告类型: 'adsense' | 'placeholder'
  type: 'placeholder',
  
  // Google AdSense 配置
  config: {
    publisherId: 'ca-pub-XXXXXXXXXX', // 替换为你的 AdSense 发布商 ID
  },
  
  // 广告位配置
  ads: {
    top: {
      slot: 'XXXXXXXXXX', // 替换为你的广告位 ID
      description: '顶部横幅广告'
    },
    middle: {
      slot: 'XXXXXXXXXX',
      description: '文章中部广告'
    },
    bottom: {
      slot: 'XXXXXXXXXX',
      description: '底部广告'
    }
  },
  
  // AdSense 全局脚本
  script: `
    (adsbygoogle = window.adsbygoogle || []).push({});
  `
}

export default adsConfig
