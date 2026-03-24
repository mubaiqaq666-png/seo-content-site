import adsConfig from '../data/ads.config.js'

function AdComponent({ position }) {
  const adContent = adsConfig.ads[position]
  
  if (!adContent || !adsConfig.enabled) {
    return null
  }

  if (adsConfig.type === 'adsense') {
    return (
      <div className="my-6">
        <ins 
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adsConfig.config.publisherId}
          data-ad-slot={adContent.slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <script dangerouslySetInnerHTML={{ __html: adsConfig.script }} />
      </div>
    )
  }

  return (
    <div className="my-6 p-4 bg-gray-100 rounded-lg text-center">
      <p className="text-gray-500 text-sm">广告位 {position}</p>
      <p className="text-gray-400 text-xs mt-1">{adContent.description}</p>
    </div>
  )
}

export default AdComponent
