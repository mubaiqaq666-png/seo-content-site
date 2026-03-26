import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const CAT_ICONS = {
  科技: '💻', 财经: '📈', 社会: '🌐', 娱乐: '🎬',
  体育: '⚽', 健康: '🏥', 生活: '🏠', 国际: '🌍', 热点: '🔥'
}

const CATEGORIES = ['全部', '科技', '财经', '社会', '娱乐', '体育', '健康', '生活', '国际', '热点']

function CoverImage({ post, className = '' }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const src = post.coverImage || ''
  
  return (
    <div className={`card-img ${className}`}>
      {src && !error ? (
        <img 
          src={src} 
          alt={post.title}
          className={loaded ? 'loaded' : ''}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      ) : null}
      <div className="icon" style={{ opacity: loaded || error || !src ? 1 : 0 }}>
        {CAT_ICONS[post.category] || '📰'}
      </div>
    </div>
  )
}

function PostCard({ post }) {
  return (
    <Link to={`/posts/${post.slug}`} className="card fade">
      <CoverImage post={post} />
      <div className="card-body">
        <div className="card-cat">{post.category}</div>
        <div className="card-title">{post.title}</div>
        <div className="card-meta">{post.date} · {post.views || 0} 浏览</div>
      </div>
    </Link>
  )
}

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('全部')
  const [timeFilter, setTimeFilter] = useState('全部')

  useEffect(() => {
    fetch('/data/posts.json')
      .then(r => r.json())
      .then(d => {
        setPosts(d.posts || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let result = posts
    
    if (category !== '全部') {
      result = result.filter(p => p.category === category)
    }
    
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    }
    
    if (timeFilter !== '全部') {
      const now = Date.now()
      const day = 24 * 60 * 60 * 1000
      const limits = { '24小时': day, '3天内': 3 * day, '本周': 7 * day }
      const limit = limits[timeFilter] || 0
      result = result.filter(p => {
        const t = new Date(p.date).getTime()
        return now - t < limit
      })
    }
    
    return result
  }, [posts, category, search, timeFilter])

  if (loading) {
    return (
      <Layout>
        <div className="loading"><div className="spinner"></div></div>
      </Layout>
    )
  }

  const featured = filtered.slice(0, 3)
  const rest = filtered.slice(3)

  return (
    <Layout>
      {/* 搜索 */}
      <div className="search">
        <input 
          placeholder="搜索文章..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* 分类标签 */}
      <div className="tags">
        {CATEGORIES.map(cat => (
          <span 
            key={cat}
            className={`tag ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* 时间筛选 */}
      <div className="tags" style={{ marginBottom: 24 }}>
        {['全部', '24小时', '3天内', '本周'].map(t => (
          <span 
            key={t}
            className={`tag ${timeFilter === t ? 'active' : ''}`}
            onClick={() => setTimeFilter(t)}
          >
            {t}
          </span>
        ))}
      </div>

      {/* 特色文章 */}
      {featured.length > 0 && (
        <div className="featured">
          <PostCard post={featured[0]} />
          {featured.slice(1).map(p => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      )}

      {/* 文章列表 */}
      {rest.length > 0 && (
        <div className="posts">
          {rest.map(p => <PostCard key={p.slug} post={p} />)}
        </div>
      )}

      {/* 空状态 */}
      {filtered.length === 0 && (
        <div className="empty">
          <p>暂无相关文章</p>
        </div>
      )}

      {/* 统计 */}
      <p style={{ textAlign: 'center', marginTop: 32, color: 'var(--muted)', fontSize: 13 }}>
        共 {filtered.length} 篇文章
      </p>
    </Layout>
  )
}
