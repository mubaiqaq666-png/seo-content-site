import { useEffect, useRef } from 'react'

// 从构建时注入的环境变量读取广告配置
const ADS_CONFIG = {
  enabled: import.meta.env.VITE_ADS_ENABLED === 'true',
  baidu: {
    enabled: import.meta.env.VITE_BAIDU_ENABLED === 'true',
    slotId: import.meta.env.VITE_BAIDU_SLOT_ID || '',
    tongjiId: import.meta.env.VITE_BAIDU_TONGJI_ID || '',
  },
  tencent: {
    enabled: import.meta.env.VITE_TENCENT_ENABLED === 'true',
    appId: import.meta.env.VITE_TENCENT_APP_ID || '',
    posId: import.meta.env.VITE_TENCENT_POS_ID || '',
  },
  bytedance: {
    enabled: import.meta.env.VITE_BYTEDANCE_ENABLED === 'true',
    appId: import.meta.env.VITE_BYTEDANCE_APP_ID || '',
    slotId: import.meta.env.VITE_BYTEDANCE_SLOT_ID || '',
  },
  google: {
    enabled: import.meta.env.VITE_GOOGLE_ENABLED === 'true',
    publisherId: import.meta.env.VITE_GOOGLE_PUBLISHER_ID || '',
  },
}

// 检测用户地区（根据时区）
function isChina() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return tz.includes('Shanghai') || tz.includes('Beijing') || tz.includes('Chongqing') || tz.includes('Hong_Kong')
  } catch {
    return false
  }
}

// 选择最优广告平台
function selectPlatform() {
  if (!ADS_CONFIG.enabled) return null
  const china = isChina()
  if (china) {
    if (ADS_CONFIG.baidu.enabled && ADS_CONFIG.baidu.slotId) return 'baidu'
    if (ADS_CONFIG.tencent.enabled && ADS_CONFIG.tencent.appId) return 'tencent'
    if (ADS_CONFIG.bytedance.enabled && ADS_CONFIG.bytedance.appId) return 'bytedance'
  }
  if (ADS_CONFIG.google.enabled && ADS_CONFIG.google.publisherId) return 'google'
  return null
}

export default function AdComponent({ position = 'middle' }) {
  const containerRef = useRef(null)
  const platform = selectPlatform()

  useEffect(() => {
    if (!platform || !containerRef.current) return
    const el = containerRef.current

    if (platform === 'baidu' && ADS_CONFIG.baidu.slotId) {
      const script = document.createElement('script')
      script.src = 'https://cpro.baidustatic.com/cpro/ui/c.js'
      script.async = true
      script.onload = () => {
        window._cpro = window._cpro || []
        window._cpro.push({ id: ADS_CONFIG.baidu.slotId })
      }
      el.appendChild(script)
    }

    if (platform === 'google' && ADS_CONFIG.google.publisherId) {
      const script = document.createElement('script')
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.google.publisherId}`
      script.async = true
      script.crossOrigin = 'anonymous'
      el.appendChild(script)
      const ins = document.createElement('ins')
      ins.className = 'adsbygoogle'
      ins.style.display = 'block'
      ins.dataset.adClient = ADS_CONFIG.google.publisherId
      ins.dataset.adFormat = 'auto'
      ins.dataset.fullWidthResponsive = 'true'
      el.appendChild(ins)
      setTimeout(() => { try { (window.adsbygoogle = window.adsbygoogle || []).push({}) } catch (e) {} }, 500)
    }
  }, [platform])

  if (!platform) return null

  return (
    <div
      ref={containerRef}
      style={{
        margin: '16px 0',
        minHeight: 90,
        background: 'rgba(0,0,0,0.02)',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    />
  )
}
