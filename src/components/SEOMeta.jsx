import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function SEOMeta({ title, description, keywords }) {
  const location = useLocation()

  useEffect(() => {
    const fullTitle = title ? `${title} | NOVA资讯` : 'NOVA资讯 - 实时热搜'
    document.title = fullTitle

    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('name', name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    if (description) setMeta('description', description)
    if (keywords) setMeta('keywords', keywords)
  }, [title, description, keywords, location])

  return null
}
