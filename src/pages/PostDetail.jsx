import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { PostCard, CAT_COLORS, SOURCE_COLORS } from './Home'

function PostDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

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
      document.title = `${post.title} - 今日热点`
      window.scrollTo(0, 0)
    }
  }, [post])

  if (loading) return (
    <div className="flex justify-center items-center min-h-96">
      <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
    </div>
  )

  if (!post) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-400 text-lg mb-4">文章不存在</p>
      <Link to="/" className="text-red-600 hover:underline">← 返回首页</Link>
    </div>
  )

  const catColor = CAT_COLORS[post.category] || 'bg-gray-100 text-gray-700'
  const srcColor = SOURCE_COLORS[post.source] || 'bg-gray-100 text-gray-600'

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 主内容 */}
        <article className="lg:col-span-2">
          {/* 面包屑 */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:text-red-600">首页</Link>
            <span>/</span>
            <Link to={`/category/${post.category}`} className="hover:text-red-600">{post.category}</Link>
            <span>/</span>
            <span className="text-gray-600 truncate">{post.title.slice(0, 20)}...</span>
          </div>

          {/* 标题区 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${catColor}`}>{post.category}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${srcColor}`}>{post.source}</span>
              {post.heat && <span className="text-xs text-orange-500 font-medium">🔥 {post.heat}</span>}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-3">{post.title}</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">{post.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
              <span>📅 {post.date}</span>
              {post.originalTitle && <span>📌 原话题：{post.originalTitle}</span>}
            </div>
          </div>

          {/* 正文 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div
              className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* FAQ */}
          {post.faq && post.faq.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-500">❓</span> 常见问题
              </h2>
              <div className="space-y-4">
                {post.faq.map((item, i) => (
                  <div key={i} className="border-l-4 border-blue-200 pl-4">
                    <p className="font-semibold text-gray-800 mb-1 text-sm">Q: {item.question}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">A: {item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 标签 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full">#{tag}</span>
              ))}
            </div>
          )}
        </article>

        {/* 侧边栏 */}
        <aside className="space-y-6">
          {/* 相关文章 */}
          {related.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-800 text-sm">相关文章</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {related.map(p => (
                  <Link key={p.slug} to={`/posts/${p.slug}`}
                    className="block px-4 py-3 hover:bg-gray-50 transition group">
                    <p className="text-sm text-gray-700 group-hover:text-red-600 transition line-clamp-2 leading-snug">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{p.date}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 分类导航 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-800 text-sm">热门分类</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {Object.keys(CAT_COLORS).map(cat => (
                <Link key={cat} to={`/category/${cat}`}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition hover:opacity-80 ${CAT_COLORS[cat]}`}>
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default PostDetail
