import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { CoverImage, CAT_COLORS, CAT_GRADIENTS } from './Home'
import AdComponent from '../components/AdComponent'
import SEOMeta from '../components/SEOMeta'

// 阅读进度条
function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    function onScroll() {
      const el = document.documentElement
      const scrollTop = el.scrollTop || document.body.scrollTop
      const scrollHeight = el.scrollHeight - el.clientHeight
      setProgress(scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-100">
      <div className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-100" style={{ width: progress + '%' }} />
    </div>
  )
}

// 目录导航
function TableOfContents({ content }) {
  const [active, setActive] = useState('')
  const headings = content.match(/<h2[^>]*>([^<]+)<\/h2>/g) || []
  const items = headings.map((h, i) => {
    const text = h.replace(/<[^>]+>/g, '')
    const id = 'heading-' + i
    return { id, text }
  })
  useEffect(() => {
    if (!items.length) return
    function onScroll() {
      const els = items.map((_, i) => document.getElementById('heading-' + i)).filter(Boolean)
      const scrollY = window.scrollY + 120
      for (let i = els.length - 1; i >= 0; i--) {
        if (els[i].offsetTop <= scrollY) { setActive(els[i].id); break }
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [items.length])
  if (!items.length) return null
  return (
    <div className="sticky top-20 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">目录</p>
      <nav className="space-y-1">
        {items.map(item => (
          <a key={item.id} href={'#' + item.id}
            className={`block text-sm py-1 px-2 rounded-lg transition-colors ${active === item.id ? 'text-red-600 bg-red-50 font-medium' : 'text-gray-500 hover:text-red-500 hover:bg-gray-50'}`}>
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  )
}

function PostDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/data/posts.json')
      .then(r => r.json())
      .then(data => {
        const found = data.posts.find(p => p.slug === slug)
        setPost(found)
        if (found) {
          setRelated(data.posts.filter(p => p.slug !== slug && p.category === found.category).slice(0, 4))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (post) {
      document.title = `${post.title} — 今日热点`
      window.scrollTo(0, 0)
    }
  }, [post])

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full" />
    </div>
  )
  if (!post) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <p className="text-gray-400 text-lg mb-4">文章不存在</p>
      <Link to="/" className="text-red-600 hover:underline">← 返回首页</Link>
    </div>
  )

  // JSON-LD 结构化数据
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.description,
    image: post.coverImage,
    datePublished: post.date,
    author: { '@type': 'Organization', name: '今日热点' },
    publisher: {
      '@type': 'Organization',
      name: '今日热点',
      logo: { '@type': 'ImageObject', url: 'https://seo-content-site.vercel.app/favicon.svg' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://seo-content-site.vercel.app/posts/${post.slug}` },
  }

  const gradient = CAT_GRADIENTS[post.category] || 'from-gray-700 to-gray-900'
  const catColor = CAT_COLORS[post.category] || 'cx'

  // 为正文中的 h2 添加 id（用于目录跳转）
  const contentWithIds = post.content.replace(/<h2([^>]*)>/g, (m, attrs, offset) => {
    const match = post.content.slice(0, offset).match(/<h2[^>]*>/g)
    const id = 'heading-' + ((match && match.length) || 0)
    return `<h2${attrs} id="${id}">`
  })

  return (
    <>
      {/* SEO 结构化数据 */}
      <SEOMeta
        title={post.title}
        description={post.description}
        keywords={post.keywords}
        article={true}
        publishTime={post.date}
        ogImage={post.coverImage}
      />
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ===== 主内容 ===== */}
        <div className="flex gap-8">

          {/* 左侧：文章主体 */}
          <article className="flex-1 min-w-0">

            {/* 面包屑 */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
              <Link to="/" className="hover:text-red-500 transition">首页</Link>
              <span>/</span>
              <Link to={`/category/${post.category}`} className="hover:text-red-500 transition">{post.category}</Link>
              <span>/</span>
              <span className="text-gray-500 truncate max-w-xs">{post.title}</span>
            </div>

            {/* 封面大图 */}
            <div className="relative rounded-2xl overflow-hidden mb-6 shadow-xl">
              <div className="relative h-72 md:h-96">
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.style.display = 'none' }} />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <span className="text-7xl opacity-20">{'💻📈🏙️🎬⚽🌿🏠🌍🔥'['科技财经社会娱乐体育健康生活国际热点'.indexOf(post.category) / 4] || '📰'}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${catColor}`}>{post.category}</span>
                    {post.heat && <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-semibold">🔥 {post.heat}</span>}
                  </div>
                  <h1 className="text-white font-bold text-2xl md:text-3xl leading-tight">{post.title}</h1>
                </div>
              </div>
            </div>

            {/* 元信息条 */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5 px-1">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  {post.date}
                </span>
                {post.readTime && <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  约{post.readTime}分钟阅读
                </span>}
                {post.views && <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  {post.views >= 1000 ? (post.views / 1000).toFixed(1) + 'k' : post.views} 阅读
                </span>}
              </div>
              <button onClick={copyLink}
                className="flex items-center gap-1.5 text-sm px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition">
                {copied ? '✅ 已复制' : '📋 分享'}
              </button>
            </div>

            {/* 摘要 */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 rounded-r-xl p-5 mb-7">
              <p className="text-gray-700 leading-relaxed text-base">{post.description}</p>
            </div>

            {/* 顶部广告 */}
            <AdComponent position="top" />

            {/* 顶部广告 */}
            <AdComponent position="top" />

            {/* 正文 */}
            <div className="prose-custom mb-8">
              <div
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
                dangerouslySetInnerHTML={{ __html: contentWithIds }}
              />
            </div>

            {/* 中部广告 */}
            <AdComponent position="middle" />

            {/* FAQ 折叠 */}
            {post.faq && post.faq.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <span className="text-blue-500">❓</span> 常见问题
                </h2>
                <div className="space-y-3">
                  {post.faq.map((item, i) => (
                    <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
                      <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition font-medium text-gray-800 list-none">
                        <span>{item.question}</span>
                        <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="px-5 py-4 text-gray-600 leading-relaxed border-t border-gray-100 bg-white">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* 标签 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map(tag => (
                  <span key={tag} className="text-sm px-4 py-1.5 bg-gray-100 text-gray-500 rounded-full hover:bg-red-50 hover:text-red-500 transition cursor-default">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 导航 */}
            <div className="flex gap-4">
              <Link to="/" className="flex-1 text-center py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition text-sm font-medium">
                ← 返回首页
              </Link>
              <Link to={`/category/${post.category}`} className="flex-1 text-center py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition text-sm font-medium">
                更多{post.category} →
              </Link>
            </div>
          </article>

          {/* 右侧：目录+相关 */}
          <aside className="w-64 flex-shrink-0 hidden xl:block">
            <div className="sticky top-24 space-y-5">
              {/* 目录 */}
              <TableOfContents content={post.content} />

              {/* 相关文章 */}
              {related.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="font-semibold text-gray-800 text-sm">📰 相关推荐</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {related.map(p => (
                      <Link key={p.slug} to={`/posts/${p.slug}`} className="block px-4 py-3 hover:bg-gray-50 transition group">
                        <p className="text-sm text-gray-700 group-hover:text-red-600 line-clamp-2 leading-snug font-medium">{p.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{p.date}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .prose-custom h2 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #111827;
          margin: 2rem 0 0.875rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #f3f4f6;
          scroll-margin-top: 100px;
        }
        .prose-custom p {
          color: #374151;
          line-height: 1.8;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }
        .prose-custom strong {
          color: #111827;
          font-weight: 600;
        }
        .prose-custom ul, .prose-custom ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
          color: #374151;
        }
        .prose-custom li {
          margin-bottom: 0.5rem;
          line-height: 1.7;
        }
      `}</style>
    </>
  )
}

export default PostDetail
