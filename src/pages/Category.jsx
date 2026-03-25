import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { PostCard } from './Home'

function Category() {
  const { category } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/data/posts.json')
      .then(r => r.json())
      .then(data => {
        const filtered = data.posts
          .filter(p => p.category === category)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
        setPosts(filtered)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [category])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-red-500 rounded"></div>
        <h1 className="text-xl font-bold text-gray-900">{category}</h1>
        <span className="text-sm text-gray-400">共 {posts.length} 篇</span>
        <div className="flex-1 h-px bg-gray-200"></div>
        <Link to="/" className="text-sm text-gray-400 hover:text-red-600">← 返回首页</Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {posts.map(post => <PostCard key={post.slug} post={post} />)}
          {posts.length === 0 && (
            <div className="col-span-3 text-center py-20 text-gray-400">该分类暂无文章</div>
          )}
        </div>
      )}
    </div>
  )
}

export default Category
