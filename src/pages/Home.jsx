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

function PostCard({ post, size = 'normal' }) {
  const catColor = CAT_COLORS[post.category] || 'bg-gray-100 text-gray-700'
  const srcColor = SOURCE_COLORS[post.source] || 'bg-gray-100 text-gray-600'

  if (size === 'large') {
    return (
      <Link to={`/posts/${post.slug}`} className="block group">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 h-40 flex items-end p-4">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColor}`}>{post.category}</span>
          </div>
          <div className="p-4">
            <h2 className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition line-clamp-2 mb-2">{post.title}</h2>
            <p className="text-gray-500 text-sm line-clamp-2 mb-3">{post.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className={`px-2 py-0.5 rounded-full ${srcColor}`}>{post.source}</span>
              <span>{post.date}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/posts/${post.slug}`} className="block group">
      <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 flex gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColor}`}>{post.category}</span>
            {post.heat && <span className="text-xs text-orange-500 font-medium">🔥 {post.heat}</span>}
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition line-clamp-2 text-sm leading-snug mb-1">{post.title}</h3>
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
        // 按分类分组
        const cats = {}
        sorted.forEach(p => {
          if (!cats[p.category]) cats[p.category] = []
          if (cats[p.category].length < 5) cats[p.category].push(p)
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

  const latest = posts.slice(0, 12)
  const top3 = latest.slice(0, 3)
  const rest = latest.slice(3)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 今日热点 Banner */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">今日热点</span>
          <span className="text-gray-500 text-sm">{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} 更新</span>
        </div>
        <div className="flex-1 h-px bg-gray-200"></div>
        <Link to="/posts" className="text-sm text-red-600 hover:underline">查看全部 →</Link>
      </div>

      {/* 主要内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* 左侧：大卡片 */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {top3.map(post => (
            <PostCard key={post.slug} post={post} size="large" />
          ))}
        </div>

        {/* 右侧：热榜列表 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-red-500">🔥</span>
            <span className="font-semibold text-gray-800">热点排行</span>
          </div>
          <div className="divide-y divide-gray-50">
            {posts.slice(0, 10).map((post, i) => (
              <Link key={post.slug} to={`/posts/${post.slug}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group">
                <span className={`w-5 h-5 rounded text-xs font-bold flex items-center justify-center flex-shrink-0 ${i < 3 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700 group-hover:text-red-600 transition line-clamp-1 flex-1">{post.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 最新资讯列表 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-bold text-gray-900">最新资讯</h2>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rest.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>

      {/* 分类专区 */}
      {Object.entries(categories).slice(0, 4).map(([cat, catPosts]) => (
        <div key={cat} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-red-500 rounded"></div>
              <h2 className="font-bold text-gray-900">{cat}</h2>
            </div>
            <Link to={`/category/${cat}`} className="text-sm text-red-600 hover:underline">更多 →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {catPosts.slice(0, 3).map(post => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export { PostCard, CAT_COLORS, SOURCE_COLORS }
export default Home
