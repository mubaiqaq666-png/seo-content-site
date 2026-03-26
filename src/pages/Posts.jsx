import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const CAT_ICONS = {
  科技: '💻', 财经: '📈', 社会: '🌐', 娱乐: '🎬',
  体育: '⚽', 健康: '🏥', 生活: '🏠', 国际: '🌍', 热点: '🔥'
}

function PostCard({ post }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  
  return (
    <Link to={`/posts/${post.slug}`} className="card fade">
      <div className="card-img">
        {post.coverImage && !error ? (
          <img 
            src={post.coverImage}
            alt={post.title}
            className={loaded ? 'loaded' : ''}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        ) : null}
        <div className="icon" style={{ opacity: loaded || error || !post.coverImage ? 1 : 0 }}>
          {CAT_ICONS[post.category] || '📰'}
        </div>
      </div>
      <div className="card-body">
        <div className="card-cat">{post.category}</div>
        <div className="card-title">{post.title}</div>
        <div className="card-meta">{post.date}</div>
      </div>
    </Link>
  )
}

export default function Posts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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
    if (!search.trim()) return posts
    const q = search.toLowerCase()
    return posts.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
  }, [posts, search])

  if (loading) {
    return (
      <Layout>
        <div className="loading"><div className="spinner"></div></div>
      </Layout>
    )
  }

  return (
    <Layout>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>全部文章</h1>
      
      <div className="search">
        <input 
          placeholder="搜索文章..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <p style={{ marginBottom: 16, color: 'var(--muted)', fontSize: 13 }}>
        共 {filtered.length} 篇文章
      </p>

      {filtered.length > 0 ? (
        <div className="posts">
          {filtered.map(p => <PostCard key={p.slug} post={p} />)}
        </div>
      ) : (
        <div className="empty">
          <p>暂无相关文章</p>
        </div>
      )}
    </Layout>
  )
}
