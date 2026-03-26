import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import SEOMeta from '../components/SEOMeta'

const CAT_ICONS = {
  科技: '💻', 财经: '📈', 社会: '🌐', 娱乐: '🎬',
  体育: '⚽', 健康: '🏥', 生活: '🏠', 国际: '🌍', 热点: '🔥'
}

function CoverImage({ src, category }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  
  return (
    <div className="article-img">
      {src && !error ? (
        <img 
          src={src} 
          alt=""
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      ) : null}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 64, opacity: loaded && !error ? 0 : 1
      }}>
        {CAT_ICONS[category] || '📰'}
      </div>
    </div>
  )
}

export default function PostDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/posts.json')
      .then(r => r.json())
      .then(d => {
        const posts = d.posts || []
        const found = posts.find(p => p.slug === slug)
        setPost(found)
        
        if (found) {
          setRelated(
            posts
              .filter(p => p.slug !== slug && p.category === found.category)
              .slice(0, 5)
          )
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (loading) {
    return (
      <Layout>
        <div className="loading"><div className="spinner"></div></div>
      </Layout>
    )
  }

  if (!post) {
    return (
      <Layout>
        <div className="empty">
          <p>文章不存在</p>
          <Link to="/" style={{ marginTop: 16, display: 'inline-block' }}>返回首页</Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <SEOMeta 
        title={post.title}
        description={post.description}
        keywords={post.keywords || post.tags}
      />
      
      <div className="article fade">
        {/* 头部 */}
        <header className="article-header">
          <div className="article-cat">{post.category}</div>
          <h1 className="article-title">{post.title}</h1>
          <div className="article-meta">
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.views || 0} 浏览</span>
            <span>·</span>
            <span>阅读 {post.readTime || 3} 分钟</span>
          </div>
        </header>

        {/* 封面 */}
        <CoverImage src={post.coverImage} category={post.category} />

        {/* 内容 */}
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 标签 */}
        {post.tags?.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div className="tags">
              {post.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* 相关文章 */}
        {related.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <div className="sidebar">
              <div className="sidebar-title">相关推荐</div>
              {related.map(p => (
                <Link key={p.slug} to={`/posts/${p.slug}`} className="sidebar-item">
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 返回 */}
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Link to="/">← 返回首页</Link>
        </div>
      </div>
    </Layout>
  )
}
