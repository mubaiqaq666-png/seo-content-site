import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_NAME = '今日热点'
const BASE_URL = 'https://seo-content-site.vercel.app'

function SEOMeta({
  title,
  description,
  keywords = [],
  article = false,
  publishTime,
  author,
  ogImage,
}) {
  const location = useLocation()
  const url = `${BASE_URL}${location.pathname}`

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - 实时热搜资讯平台`
    const metaDesc = description || '今日热点提供实时热搜资讯，覆盖科技、财经、社会、娱乐、体育等热门话题，每日更新。'
    const metaKeywords = keywords.length ? keywords.join(', ') : '今日热点,热搜,资讯,新闻'

    // 更新 title
    document.title = fullTitle

    const setMeta = (name, content, isProperty = false) => {
      const sel = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let el = document.querySelector(sel)
      if (!el) {
        el = document.createElement('meta')
        if (isProperty) el.setAttribute('property', name)
        else el.setAttribute('name', name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    setMeta('description', metaDesc)
    setMeta('keywords', metaKeywords)
    setMeta('og:title', fullTitle, true)
    setMeta('og:description', metaDesc, true)
    setMeta('og:url', url, true)
    setMeta('og:type', article ? 'article' : 'website', true)
    if (publishTime) setMeta('article:published_time', publishTime, true)
    if (author) setMeta('article:author', author, true)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', metaDesc)
    if (ogImage) {
      setMeta('og:image', ogImage, true)
      setMeta('twitter:image', ogImage)
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)

  }, [title, description, keywords, article, publishTime, author, ogImage, url])

  return null
}

export default SEOMeta
