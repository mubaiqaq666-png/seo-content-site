import adsConfig from '../data/ads.config.js'
import { useState, useEffect, useRef } from 'react'

// =============================================
// 统一的广告组件
// 支持：百度广告联盟 / 腾讯广告 / Google AdSense
// 使用懒加载，优化页面性能
// =============================================

function BaiduAd({ slotId, style = {}, className = '' }) {
  const ref = useRef(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!adsConfig.china.baidu.enabled || !slotId || slotId === 'XXXXXXXX') return

    let timer
    if (adsConfig.loadStrategy === 'lazy') {
      const observer = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            inject()
            observer.disconnect()
          }
        },
        { rootMargin: '200px' }
      )
      if (ref.current) observer.observe(ref.current)
      return () => observer.disconnect()
    } else {
      inject()
    }

    function inject() {
      // 设置超时
      timer = setTimeout(() => setLoaded(true), adsConfig.loadTimeout)
      try {
        window._hmt = window._hmt || []
        // 百度广告代码示例（实际需替换为百度联盟提供的代码）
        const s = document.createElement('script')
        s.src = `https://dup.mk.lxdns.com/media/?s=1&k=${slotId}&t=${Date.now()}`
        s.onload = () => { clearTimeout(timer); setLoaded(true) }
        s.onerror = () => { clearTimeout(timer); setLoaded(true) }
        document.head.appendChild(s)
      } catch {
        clearTimeout(timer)
        setLoaded(true)
      }
    }

    return () => clearTimeout(timer)
  }, [slotId])

  return (
    <div ref={ref} className={`my-6 flex justify-center ${className}`}>
      {adsConfig.china.baidu.enabled && slotId && slotId !== 'XXXXXXXX' ? (
        // 真实百度广告位
        <div className="w-full max-w-[800px] min-h-[100px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center relative overflow-hidden">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse text-gray-300 text-sm">广告加载中...</div>
            </div>
          )}
          {/* 百度广告实际渲染容器 */}
          <div id={`baidu-ad-${slotId}`} style={{ minHeight: 90, width: '100%', ...style }} />
        </div>
      ) : (
        // 占位广告（未配置时显示）
        <div className="w-full max-w-[800px] min-h-[100px] bg-gray-100 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center">
          <div className="text-gray-300 text-xs font-medium mb-1">广告位</div>
          <div className="text-gray-300 text-xs">百度广告联盟 · {style.width || '728×90'}</div>
        </div>
      )}
    </div>
  )
}

function TencentAd({ appId, posId, style = {}, className = '' }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!adsConfig.china.tencent.enabled || !posId || posId === 'XXXXXXXX') return
    // 腾讯广告 SDK 懒加载
    if (adsConfig.loadStrategy === 'lazy') {
      const observer = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            loadScript()
            observer.disconnect()
          }
        },
        { rootMargin: '200px' }
      )
      // 注意：实际使用时需要在 DOM 中有 ref
    }
  }, [posId])

  return (
    <div className={`my-6 flex justify-center ${className}`}>
      {adsConfig.china.tencent.enabled && posId && posId !== 'XXXXXXXX' ? (
        <div className="w-full max-w-[800px] min-h-[100px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
          <div className="text-gray-400 text-xs">腾讯广告 · {posId}</div>
        </div>
      ) : (
        <div className="w-full max-w-[800px] min-h-[100px] bg-gray-100 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center">
          <div className="text-gray-300 text-xs font-medium mb-1">广告位</div>
          <div className="text-gray-300 text-xs">腾讯广告联盟</div>
        </div>
      )}
    </div>
  )
}

function GoogleAd({ publisherId, slot, style = {}, className = '' }) {
  useEffect(() => {
    if (!adsConfig.google.enabled || !publisherId || publisherId === 'ca-pub-XXXXXXXXXX') return
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [publisherId, slot])

  return (
    <div className={`my-6 flex justify-center ${className}`}>
      {adsConfig.google.enabled && publisherId && publisherId !== 'ca-pub-XXXXXXXXXX' ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', maxWidth: 800, minHeight: 90, ...style }}
          data-ad-client={publisherId}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="w-full max-w-[800px] min-h-[100px] bg-gray-100 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center">
          <div className="text-gray-300 text-xs font-medium mb-1">广告位</div>
          <div className="text-gray-300 text-xs">Google AdSense</div>
        </div>
      )}
    </div>
  )
}

// 纯占位广告（调试用）
function PlaceholderAd({ position, description }) {
  return (
    <div className="my-6 flex justify-center">
      <div className="w-full max-w-[800px] min-h-[100px] bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center">
        <div className="text-gray-400 text-xs font-medium mb-1">📢 广告位</div>
        <div className="text-gray-400 text-xs">{description || position}</div>
      </div>
    </div>
  )
}

// =============================================
// 主出口：根据配置渲染对应广告
// =============================================
function AdComponent({ position = 'middle' }) {
  if (!adsConfig.enabled) return null

  const slot = adsConfig.slots?.[position]

  if (adsConfig.type === 'baidu' || adsConfig.type === 'baidu_zt') {
    return <BaiduAd slotId={adsConfig.china.baidu.slotId} />
  }

  if (adsConfig.type === 'tencent') {
    return <TencentAd
      appId={adsConfig.china.tencent.appId}
      posId={adsConfig.china.tencent.posId}
    />
  }

  if (adsConfig.type === 'adsense' && adsConfig.google.enabled) {
    return <GoogleAd
      publisherId={adsConfig.google.publisherId}
      slot={adsConfig.ads?.[position]?.slot}
    />
  }

  // 默认占位
  return <PlaceholderAd position={position} description={slot?.name} />
}

export default AdComponent
