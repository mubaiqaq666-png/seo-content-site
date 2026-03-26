import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
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

export default function Category() {
  const { category } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

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
    return posts.filter(p => p.category === category)
  }, [posts, category])

  if (loading) {
    return (
      <Layout>
        <div className="loading"><div className="spinner"></div></div>
      </Layout>
    )
  }

  return (
    <Layout>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>
        {CAT_ICONS[category] || '📁'} {category}
      </h1>
      <p style={{ marginBottom: 24, color: 'var(--muted)', fontSize: 14 }}>
        共 {filtered.length} 篇文章
      </p>

      {filtered.length > 0 ? (
        <div className="posts">
          {filtered.map(p => <PostCard key={p.slug} post={p} />)}
        </div>
      ) : (
        <div className="empty">
          <p>该分类暂无文章</p>
          <Link to="/" style={{ marginTop: 16, display: 'inline-block' }}>返回首页</Link>
        </div>
      )}
    </Layout>
  )
}
