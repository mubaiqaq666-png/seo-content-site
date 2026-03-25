import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function SEOMeta({ 
  title, 
  description, 
  keywords = [], 
  ogImage = '/og-image.png',
  canonical 
}) {
  const location = useLocation()
  const baseUrl = 'https://seo-content-site.vercel.app' // 部署时替换为实际域名
  
  const fullTitle = title ? `${title} | SEO内容站` : 'SEO内容站 - 专业的SEO优化指南'
  const fullDescription = description || '提供高质量的SEO优化内容和教程，帮助您提升网站排名'
  const fullUrl = `${baseUrl}${location.pathname}`

  useEffect(() => {
    // 更新 title
    document.title = fullTitle
    
    // 更新或创建 meta 标签
    const updateMeta = (name, content, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let meta = document.querySelector(selector)
      if (!meta) {
        meta = document.createElement('meta')
        if (property) {
          meta.setAttribute('property', name)
        } else {
          meta.setAttribute('name', name)
        }
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    updateMeta('description', fullDescription)
    updateMeta('keywords', keywords.join(', '))
    updateMeta('og:title', fullTitle, true)
    updateMeta('og:description', fullDescription, true)
    updateMeta('og:url', fullUrl, true)
    updateMeta('og:type', 'website', true)
    updateMeta('twitter:card', 'summary_large_image')
    updateMeta('twitter:title', fullTitle)
    updateMeta('twitter:description', fullDescription)

    // 更新 canonical
    let canonicalLink = document.querySelector('link[rel="canonical"]')
    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.setAttribute('href', canonical || fullUrl)

  }, [title, description, keywords, canonical, fullTitle, fullDescription, fullUrl])

  return null
}

export default SEOMeta
