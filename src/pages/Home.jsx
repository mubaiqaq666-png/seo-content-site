import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const SOURCE_COLORS = {
  '百度热搜': 'bg-blue-100 text-blue-700',
  '微博热搜': 'bg-red-100 text-red-700',
  '知乎热榜': 'bg-blue-100 text-blue-600',
  '36氪': 'bg-green-100 text-green-700',
  'IT之家': 'bg-orange-100 text-orange-700',
}

const CAT_COLORS = {
  '科技': 'bg-purple-100 text-purple-700',
  '财经': 'bg-yellow-100 text-yellow-700',
  '社会': 'bg-gray-100 text-gray-700',
  '娱乐': 'bg-pink-100 text-pink-700',
  '体育': 'bg-green-100 text-green-700',
  '健康': 'bg-teal-100 text-teal-700',
  '生活': 'bg-orange-100 text-orange-700',
  '国际': 'bg-indigo-100 text-indigo-700',
  '热点': 'bg-red-100 text-red-700',
}

const CAT_GRADIENTS = {
  '科技': 'from-purple-800 to-blue-900',
  '财经': 'from-yellow-800 to-orange-900',
  '社会': 'from-gray-700 to-gray-900',
  '娱乐': 'from-pink-800 to-purple-900',
  '体育': 'from-green-800 to-teal-900',
  '健康': 'from-teal-700 to-green-900',
  '生活': 'from-orange-700 to-red-900',
  '国际': 'from-indigo-800 to-blue-900',
  '热点': 'from-red-800 to-orange-900',
}

// 图片加载失败时的渐变背景
function CoverImage({ src, category, alt, className }) {
  const [error, setError] = useState(false)
  const gradient = CAT_GRADIENTS[category] || 'from-gray-700 to-gray-900'
  if (error || !src) {
    return <div className={`bg-gradient-to-br ${gradient} ${className}`} />
  }
  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}

// 大卡片（首页 Hero 区）
function HeroCard({ post }) {
  const catColor = CAT_COLORS[post.category] || 'bg-gray-100 text-gray-700'
  return (
    <Link to={`/posts/${post.slug}`} className="block group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
      <div className="relative h-52 overflow-hidden">
        <CoverImage src={post.coverImage} category={post.category} alt={post.title} className="w-full h-full transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColor}`}>{post.category}</span>
          {post.heat && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-medium">🔥 {post.heat}</span>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-white font-bold text-base leading-snug line-clamp-2 group-hover:text-orange-200 transition">{post.title}</h2>
          <div className="flex items-center gap-3 mt-2 text-xs text-white/70">
            <span>{post.source}</span>
            <span>·</span>
            <span>{post.date}</span>
            {post.readTime && <><span>·</span><span>约{post.readTime}分钟</span></>}
          </div>
        </div>
      </div>
    </Link>
  )
}

// 普通列表卡片
function PostCard({ post, size = 'normal' }) {
  const catColor = CAT_COLORS[post.category] || 'bg-gray-100 text-gray-700'
  const srcColor = SOURCE_COLORS[post.source] || 'bg-gray-100 text-gray-600'

  if (size === 'large') {
    return (
      <Link to={`/posts/${post.slug}`} className="block group">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
          <div className="relative h-40 overflow-hidden">
            <CoverImage src={post.coverImage} category={post.category} alt={post.title} className="w-full h-full transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${catColor}`}>{post.category}</span>
          </div>
          <div className="p-4">
            <h2 className="font-bold text-base text-gray-900 group-hover:text-red-600 transition line-clamp-2 mb-2">{post.title}</h2>
            <p className="text-gray-500 text-sm line-clamp-2 mb-3">{post.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className={`px-2 py-0.5 rounded-full ${srcColor}`}>{post.source}</span>
              <div className="flex items-center gap-2">
                {post.readTime && <span>📖 {post.readTime}min</span>}
                <span>{post.date}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/posts/${post.slug}`} className="block group">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 flex gap-0">
        {/* 缩略图 */}
        <div className="relative w-28 h-20 flex-shrink-0 overflow-hidden">
          <CoverImage src={post.coverImage} category={post.category} alt={post.title} className="w-full h-full transition-transform duration-300 group-hover:scale-105" />
        </div>
        {/* 内容 */}
        <div className="flex-1 min-w-0 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${catColor}`}>{post.category}</span>
            {post.heat && <span className="text-xs text-orange-500 font-medium">🔥</span>}
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition line-clamp-2 text-sm leading-snug">{post.title}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1.5">
            <span className={`px-1.5 py-0.5 rounded ${srcColor}`}>{post.source}</span>
            <span>{post.date}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function Home() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/posts.json')
      .then(r => r.json())
      .then(data => {
        const sorted = [...data.posts].sort((a, b) => new Date(b.date) - new Date(a.date))
        setPosts(sorted)
        const cats = {}
        sorted.forEach(p => {
          if (!cats[p.category]) cats[p.category] = []
          if (cats[p.category].length < 6) cats[p.category].push(p)
        })
        setCategories(cats)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center min-h-96">
      <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
    </div>
  )

  const latest = posts.slice(0, 20)
  const hero = latest.slice(0, 5)       // 顶部 Hero 区
  const listPosts = latest.slice(5, 17) // 列表区

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* ===== Hero 区：大图卡片 ===== */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">今日热点</span>
          <span className="text-gray-500 text-sm">{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} 更新</span>
          <div className="flex-1 h-px bg-gray-200"></div>
          <Link to="/posts" className="text-sm text-red-600 hover:underline">查看全部 →</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 主推大图 */}
          {hero[0] && (
            <Link to={`/posts/${hero[0].slug}`} className="lg:col-span-2 block group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
              <div className="relative h-72 overflow-hidden">
                <CoverImage src={hero[0].coverImage} category={hero[0].category} alt={hero[0].title} className="w-full h-full transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${CAT_COLORS[hero[0].category] || 'bg-gray-100 text-gray-700'}`}>{hero[0].category}</span>
                  {hero[0].heat && <span className="text-xs bg-orange-500 text-white px-2.5 py-1 rounded-full font-semibold">🔥 {hero[0].heat}</span>}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h2 className="text-white font-bold text-xl leading-snug line-clamp-2 group-hover:text-orange-200 transition mb-2">{hero[0].title}</h2>
                  <p className="text-white/70 text-sm line-clamp-2 mb-3">{hero[0].description}</p>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span>{hero[0].source}</span><span>·</span>
                    <span>{hero[0].date}</span>
                    {hero[0].readTime && <><span>·</span><span>约{hero[0].readTime}分钟阅读</span></>}
                    {hero[0].views && <><span>·</span><span>👁 {(hero[0].views/1000).toFixed(1)}k</span></>}
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* 右侧小图堆叠 */}
          <div className="flex flex-col gap-3">
            {hero.slice(1, 4).map(post => (
              <HeroCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </div>

      {/* ===== 主内容 + 侧边栏 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

        {/* 左侧：最新资讯列表 */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-red-500 rounded"></div>
            <h2 className="font-bold text-gray-900">最新资讯</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {listPosts.map(post => <PostCard key={post.slug} post={post} />)}
          </div>
          <div className="mt-4 text-center">
            <Link to="/posts" className="inline-block px-6 py-2 border border-red-500 text-red-600 rounded-full text-sm hover:bg-red-50 transition">
              加载更多 →
            </Link>
          </div>
        </div>

        {/* 右侧边栏 */}
        <div className="space-y-5">
          {/* 热点排行 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-red-500">🔥</span>
              <span className="font-semibold text-gray-800 text-sm">热点排行</span>
            </div>
            <div className="divide-y divide-gray-50">
              {posts.slice(0, 10).map((post, i) => (
                <Link key={post.slug} to={`/posts/${post.slug}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition group">
                  <span className={`w-5 h-5 rounded text-xs font-bold flex items-center justify-center flex-shrink-0 ${i < 3 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700 group-hover:text-red-600 transition line-clamp-1 flex-1">{post.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* 分类导航 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <span className="font-semibold text-gray-800 text-sm">📁 热门分类</span>
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
        </div>
      </div>

      {/* ===== 分类专区 ===== */}
      {Object.entries(categories).slice(0, 4).map(([cat, catPosts]) => (
        <div key={cat} className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-red-500 rounded"></div>
              <h2 className="font-bold text-gray-900">{cat}</h2>
              <span className="text-xs text-gray-400">({catPosts.length} 篇)</span>
            </div>
            <Link to={`/category/${cat}`} className="text-sm text-red-600 hover:underline">更多 →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {catPosts.slice(0, 3).map(post => <PostCard key={post.slug} post={post} size="large" />)}
          </div>
        </div>
      ))}
    </div>
  )
}

export { PostCard, HeroCard, CoverImage, CAT_COLORS, SOURCE_COLORS, CAT_GRADIENTS }
export default Home
