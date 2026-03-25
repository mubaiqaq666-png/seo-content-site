import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
      {/* 搜索栏 */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="搜索文章..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400"
        />
        <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-500">共 {filtered.length} 篇</span>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setSelected('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${selected === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          全部
        </button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelected(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${selected === cat ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* 文章列表 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(post => <PostCard key={post.slug} post={post} />)}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-20 text-gray-400">暂无相关文章</div>
          )}
        </div>
      )}
    </div>
  )
}

export default Posts
