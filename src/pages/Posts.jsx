import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PostCard, CAT_COLORS } from './Home'

function Posts() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [selected, setSelected] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/posts.json')
      .then(r => r.json())
      .then(data => {
        const sorted = [...data.posts].sort((a, b) => new Date(b.date) - new Date(a.date))
        setPosts(sorted)
        setCategories([...new Set(sorted.map(p => p.category))])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = posts.filter(p => {
    const matchCat = selected === 'all' || p.category === selected
    const matchSearch = !search || p.title.includes(search) || p.description?.includes(search)
    return matchCat && matchSearch
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 页头 */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 bg-red-500 rounded"></div>
        <h1 className="text-xl font-bold text-gray-900">全部资讯</h1>
        <span className="text-sm text-gray-400">共 {filtered.length} 篇</span>
      </div>

      {/* 搜索栏 */}
      <div className="relative mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="搜索文章标题或内容..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 bg-white"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
        )}
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setSelected('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${selected === 'all' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-600'}`}>
          全部
        </button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelected(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${selected === cat ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-600'}`}>
            {{'科技':'💻','财经':'📈','社会':'🏙️','娱乐':'🎬','体育':'⚽','健康':'🌿','生活':'🏠','国际':'🌍','热点':'🔥'}[cat]} {cat}
          </button>
        ))}
      </div>

      {/* 文章列表 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(post => <PostCard key={post.slug} post={post} />)}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-2">暂无相关文章</p>
              <button onClick={() => { setSearch(''); setSelected('all') }} className="text-red-600 text-sm hover:underline">清除筛选</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Posts
