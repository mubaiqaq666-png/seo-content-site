import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { PostCard, CoverImage, CAT_COLORS, SOURCE_COLORS, CAT_GRADIENTS } from './Home'

// Bilibili 视频嵌入组件
function VideoCard({ video }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-white">
      {playing ? (
        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://player.bilibili.com/player.html?bvid=${video.bvid}&autoplay=1&high_quality=1`}
            scrolling="no"
            frameBorder="0"
            allowFullScreen
            title={video.title}
          />
        </div>
      ) : (
        <div className="relative cursor-pointer group" onClick={() => setPlaying(true)}>
          <div className="relative h-36 overflow-hidden">
            <CoverImage src={video.cover} category="科技" alt={video.title} className="w-full h-full transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition flex items-center justify-center">
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-red-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
          <div className="p-3">
            <p className="text-sm font-medium text-gray-800 line-clamp-2">{video.title}</p>
            <p className="text-xs text-gray-400 mt-1">点击播放 · Bilibili</p>
          </div>
        </div>
      )}
    </div>
  )
}

// 图片画廊组件（文章内嵌图片）
function ArticleGallery({ category, slug }) {
  const [selected, setSelected] = useState(null)
  // 根据分类生成相关图片集
  const galleryImages = {
    '科技': [
      { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop', caption: '前沿科技探索' },
      { url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=400&fit=crop', caption: 'AI技术应用' },
      { url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=400&fit=crop', caption: '智能硬件' },
    ],
    '财经': [
      { url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop', caption: '市场行情' },
      { url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&h=400&fit=crop', caption: '金融数据' },
    ],
    '健康': [
      { url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=400&fit=crop', caption: '健康饮食' },
      { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop', caption: '运动健身' },
    ],
    '体育': [
      { url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop', caption: '赛场风采' },
      { url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=400&fit=crop', caption: '精彩瞬间' },
    ],
  }
  const imgs = galleryImages[category]
  if (!imgs) return null

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span>🖼️</span> 相关图片
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {imgs.map((img, i) => (
          <div key={i} className="relative overflow-hidden rounded-lg cursor-pointer group aspect-video"
            onClick={() => setSelected(img)}>
            <img src={img.url} alt={img.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-end">
              <p className="text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition">{img.caption}</p>
            </div>
          </div>
        ))}
      </div>
      {/* 灯箱 */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="max-w-2xl w-full">
            <img src={selected.url} alt={selected.caption} className="w-full rounded-xl shadow-2xl" />
            <p className="text-white text-center mt-3 text-sm">{selected.caption}</p>
          </div>
        </div>
      )}
    </div>
  )
}

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
  const gradient = CAT_GRADIENTS[post.category] || 'from-gray-700 to-gray-900'

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ===== 主内容 ===== */}
        <article className="lg:col-span-2">
          {/* 面包屑 */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:text-red-600">首页</Link>
            <span>/</span>
            <Link to={`/category/${post.category}`} className="hover:text-red-600">{post.category}</Link>
            <span>/</span>
            <span className="text-gray-600 truncate max-w-xs">{post.title.slice(0, 25)}...</span>
          </div>

          {/* 封面大图 */}
          <div className="relative rounded-xl overflow-hidden mb-6 shadow-md">
            <div className="relative h-64 md:h-80">
              {post.coverImage ? (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
                />
              ) : null}
              <div className={`${post.coverImage ? 'hidden' : 'flex'} w-full h-full bg-gradient-to-br ${gradient} items-center justify-center`}>
                <span className="text-6xl opacity-30">
                  {{'科技':'💻','财经':'📈','社会':'🏙️','娱乐':'🎬','体育':'⚽','健康':'🌿','生活':'🏠','国际':'🌍','热点':'🔥'}[post.category] || '📰'}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${catColor}`}>{post.category}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${srcColor}`}>{post.source}</span>
                  {post.heat && <span className="text-xs bg-orange-500 text-white px-2.5 py-1 rounded-full font-semibold">🔥 {post.heat}</span>}
                </div>
                <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">{post.title}</h1>
              </div>
            </div>
          </div>

          {/* 文章元信息 */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-5 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span>📅 {post.date}</span>
            {post.readTime && <span>📖 约{post.readTime}分钟阅读</span>}
            {post.views && <span>👁 {(post.views/1000).toFixed(1)}k 浏览</span>}
            {post.originalTitle && <span className="text-xs bg-gray-100 px-2 py-1 rounded">原话题：{post.originalTitle}</span>}
          </div>

          {/* 摘要 */}
          <div className="bg-orange-50 border-l-4 border-orange-400 rounded-r-xl p-4 mb-5">
            <p className="text-gray-700 text-sm leading-relaxed">{post.description}</p>
          </div>

          {/* 正文 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-5">
            <div
              className="prose prose-gray max-w-none
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* 相关图片画廊 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-5">
            <ArticleGallery category={post.category} slug={post.slug} />
          </div>

          {/* 相关视频 */}
          {post.relatedVideos && post.relatedVideos.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-red-500">▶</span> 相关视频
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {post.relatedVideos.map((v, i) => <VideoCard key={i} video={v} />)}
              </div>
            </div>
          )}

          {/* FAQ */}
          {post.faq && post.faq.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-500">❓</span> 常见问题
              </h2>
              <div className="space-y-4">
                {post.faq.map((item, i) => (
                  <details key={i} className="group border border-gray-100 rounded-lg overflow-hidden">
                    <summary className="flex items-center justify-between px-4 py-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition font-medium text-sm text-gray-800">
                      {item.question}
                      <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-4 py-3 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* 标签 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-red-50 hover:text-red-600 transition cursor-default">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 分享区 */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">觉得有用？分享给朋友</span>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => alert('链接已复制！'))}
                className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 transition">
                📋 复制链接
              </button>
            </div>
          </div>
        </article>

        {/* ===== 侧边栏 ===== */}
        <aside className="space-y-5">
          {/* 相关文章 */}
          {related.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-800 text-sm">📰 相关文章</h3>
              </div>
              <div className="p-3 space-y-3">
                {related.map(p => (
                  <Link key={p.slug} to={`/posts/${p.slug}`} className="flex gap-3 group">
                    <div className="w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden">
                      <CoverImage src={p.coverImage} category={p.category} alt={p.title} className="w-full h-full transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 group-hover:text-red-600 transition line-clamp-2 leading-snug font-medium">{p.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{p.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 分类导航 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-800 text-sm">📁 热门分类</h3>
            </div>
            <div className="p-3 grid grid-cols-4 gap-2">
              {Object.keys(CAT_COLORS).map(cat => (
                <Link key={cat} to={`/category/${cat}`}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition group">
                  <span className="text-xl">{{'科技':'💻','财经':'📈','社会':'🏙️','娱乐':'🎬','体育':'⚽','健康':'🌿','生活':'🏠','国际':'🌍','热点':'🔥'}[cat]}</span>
                  <span className="text-xs text-gray-600 group-hover:text-red-600 transition">{cat}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* 数据来源说明 */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="font-semibold text-blue-800 text-sm mb-2">📡 数据来源</h3>
            <p className="text-xs text-blue-600 leading-relaxed">
              本文内容基于{post.source}热搜话题智能改写生成，仅供参考。原始热度：{post.heat || '—'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default PostDetail
