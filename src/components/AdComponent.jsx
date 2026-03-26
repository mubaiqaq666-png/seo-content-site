import { useEffect, useState } from 'react'

export default function AdComponent({ position = 'middle' }) {
  const [config, setConfig] = useState(null)
  const [adType, setAdType] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // 从 localStorage 读取配置
    const stored = localStorage.getItem('adsConfig')
    if (stored) {
      try {
        const cfg = JSON.parse(stored)
        setConfig(cfg)
        
        // 根据用户地区选择广告源
        if (cfg.enabled) {
          const isChina = detectChina()
          if (isChina) {
            // 国内优先级：百度 > 腾讯 > 穿山甲
            if (cfg.baidu?.enabled && cfg.baidu?.slotId) setAdType('baidu')
            else if (cfg.tencent?.enabled && cfg.tencent?.appId) setAdType('tencent')
            else if (cfg.bytedance?.enabled && cfg.bytedance?.appId) setAdType('bytedance')
          } else {
            // 海外优先级：Google AdSense
            if (cfg.google?.enabled && cfg.google?.publisherId) setAdType('google')
            else if (cfg.baidu?.enabled && cfg.baidu?.slotId) setAdType('baidu')
          }
        }
      } catch (e) {}
    }

    // 监听配置更新事件
    const handleUpdate = (e) => {
      setConfig(e.detail)
      setLoaded(false)
    }
    window.addEventListener('adsConfigUpdated', handleUpdate)
    return () => window.removeEventListener('adsConfigUpdated', handleUpdate)
  }, [])

  // 检测是否在中国
  function detectChina() {
    try {
      // 简单检测：根据时区或其他方式
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      return tz.includes('Shanghai') || tz.includes('Beijing') || tz.includes('Hong_Kong')
    } catch {
      return false
    }
  }

  // 加载百度广告
  function loadBaiduAd() {
    if (!config?.baidu?.slotId) return
    
    const script = document.createElement('script')
    script.src = 'https://cpro.baidustatic.com/cpro/ui/c.js'
    script.async = true
    script.onload = () => {
      if (window.BAIDU_CPM_PUSH) {
        window.BAIDU_CPM_PUSH(function() {
          window._cpro = window._cpro || []
          window._cpro.push({
            id: config.baidu.slotId,
            tn: 'baiduCustNativeAd'
          })
        })
      }
      setLoaded(true)
    }
    script.onerror = () => setLoaded(true)
    document.body.appendChild(script)
  }

  // 加载腾讯广告
  function loadTencentAd() {
    if (!config?.tencent?.appId) return
    
    const script = document.createElement('script')
    script.src = 'https://e.qq.com/ads/ad.js'
    script.async = true
    script.onload = () => {
      if (window.tencent_ad) {
        window.tencent_ad.show({
          appId: config.tencent.appId,
          posId: config.tencent.posId
        })
      }
      setLoaded(true)
    }
    script.onerror = () => setLoaded(true)
    document.body.appendChild(script)
  }

  // 加载穿山甲广告
  function loadBytedanceAd() {
    if (!config?.bytedance?.appId) return
    
    const script = document.createElement('script')
    script.src = 'https://ad.oceanengine.com/union/openapi/ad.js'
    script.async = true
    script.onload = () => {
      if (window.pangle) {
        window.pangle.show({
          appId: config.bytedance.appId,
          slotId: config.bytedance.slotId
        })
      }
      setLoaded(true)
    }
    script.onerror = () => setLoaded(true)
    document.body.appendChild(script)
  }

  // 加载 Google AdSense
  function loadGoogleAd() {
    if (!config?.google?.publisherId) return
    
    const script = document.createElement('script')
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.onload = () => {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({})
      }
      setLoaded(true)
    }
    script.onerror = () => setLoaded(true)
    document.body.appendChild(script)
  }

  // 根据类型加载广告
  useEffect(() => {
    if (!adType || loaded) return
    
    const timeout = setTimeout(() => {
      switch (adType) {
        case 'baidu':
          loadBaiduAd()
          break
        case 'tencent':
          loadTencentAd()
          break
        case 'bytedance':
          loadBytedanceAd()
          break
        case 'google':
          loadGoogleAd()
          break
        default:
          setLoaded(true)
      }
    }, 100)
    
    return () => clearTimeout(timeout)
  }, [adType, loaded])

  if (!config?.enabled || !adType) {
    return null
  }

  // 广告容器
  const containerStyle = {
    margin: '16px 0',
    padding: '8px',
    background: 'rgba(0,0,0,0.02)',
    borderRadius: '4px',
    minHeight: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--muted)',
    fontSize: '12px'
  }

  return (
    <div style={containerStyle}>
      {adType === 'baidu' && (
        <div id={`baidu-ad-${position}`} style={{ width: '100%' }}>
          {!loaded && <span>加载百度广告中...</span>}
        </div>
      )}
      
      {adType === 'tencent' && (
        <div id={`tencent-ad-${position}`} style={{ width: '100%' }}>
          {!loaded && <span>加载腾讯广告中...</span>}
        </div>
      )}
      
      {adType === 'bytedance' && (
        <div id={`bytedance-ad-${position}`} style={{ width: '100%' }}>
          {!loaded && <span>加载穿山甲广告中...</span>}
        </div>
      )}
      
      {adType === 'google' && (
        <ins 
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={config.google.publisherId}
          data-ad-slot={position === 'top' ? '1234567890' : '0987654321'}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  )
}
