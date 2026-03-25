import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { PostCard, HeroCard, CAT_COLORS, CAT_GRADIENTS } from './Home'

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

  const gradient = CAT_GRADIENTS[category] || 'from-gray-700 to-gray-900'
  const icon = {'科技':'💻','财经':'📈','社会':'🏙️','娱乐':'🎬','体育':'⚽','健康':'🌿','生活':'🏠','国际':'🌍','热点':'🔥'}[category] || '📰'

  return (
    <div>
      {/* 分类 Banner */}
      <div className={`bg-gradient-to-r ${gradient} py-10 px-4 mb-6`}>
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <span className="text-5xl">{icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-white">{category}</h1>
            <p className="text-white/70 text-sm mt-1">共 {posts.length} 篇资讯 · 每日更新</p>
          </div>
          <div className="ml-auto">
            <Link to="/" className="text-white/70 hover:text-white text-sm transition">← 返回首页</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">该分类暂无文章</div>
        ) : (
          <>
            {/* 顶部大图展示 */}
            {posts.length >= 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {posts.slice(0, 3).map(post => <HeroCard key={post.slug} post={post} />)}
              </div>
            )}
            {/* 列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {posts.slice(3).map(post => <PostCard key={post.slug} post={post} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Category
