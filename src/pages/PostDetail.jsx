import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AdComponent from '../components/AdComponent'
import SEOMeta from '../components/SEOMeta'

const CI = { '科技':'💻','财经':'📈','社会':'🏙️','娱乐':'🎬','体育':'⚽','健康':'🌿','生活':'🏠','国际':'🌍','热点':'🔥' }

// 阅读进度条
function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    function onScroll() {
      const el = document.documentElement
      const top = el.scrollTop || document.body.scrollTop
      const height = el.scrollHeight - el.clientHeight
      setProgress(height > 0 ? Math.round((top / height) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{ position:'fixed', top:0, left:0, height:3, zIndex:9999, transition:'width 0.1s', width:progress+'%', background:'linear-gradient(90deg,var(--cyan),var(--purple),var(--red))', boxShadow:'0 0 10px var(--cyan)' }} />
  )
}

// 目录
function TOC({ content }) {
  const [active, setActive] = useState('')
  const headings = (content||'').match(/<h2[^>]*>([^<]+)<\/h2>/g) || []
  const items = headings.map((h,i) => ({ id:'heading-'+i, text:h.replace(/<[^>]+>/g,'') }))

  useEffect(() => {
    if (!items.length) return
    const fn = () => {
      const scrollY = window.scrollY + 130
      for (let i = items.length-1; i >= 0; i--) {
        const el = document.getElementById(items[i].id)
        if (el && el.offsetTop <= scrollY) { setActive(items[i].id); break }
      }
    }
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [items.length])

  if (!items.length) return null
  return (
    <div style={{ position:'sticky', top:'88px', background:'rgba(8,8,24,0.9)', border:'1px solid var(--border)', borderRadius:'12px', padding:'16px', backdropFilter:'blur(12px)' }}>
      <div style={{ fontSize:'11px', fontWeight:700, color:'var(--text-muted)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>目录</div>
      <nav>
        {items.map(item => {
          const isActive = active === item.id
          return (
            <a key={item.id} href={'#'+item.id} style={{
              display:'block', fontSize:'13px', padding:'6px 10px', borderRadius:'8px', marginBottom:'4px',
              textDecoration:'none', transition:'all 0.2s',
              background: isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
              color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
              borderLeft: isActive ? '2px solid var(--cyan)' : '2px solid transparent',
            }}>
              {item.text}
            </a>
          )
        })}
      </nav>
    </div>
  )
}

function CoverImg({ src, alt, category }) {
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState(false)
  const gradient = {
    '科技':'linear-gradient(135deg,#0a1628,#1a3a5c)',
    '财经':'linear-gradient(135deg,#1a1a08,#3a3a10)',
    '社会':'linear-gradient(135deg,#0a0a1a,#1a1a3a)',
    '娱乐':'linear-gradient(135deg,#1a0a20,#3a1050)',
    '体育':'linear-gradient(135deg,#0a1a0a,#1a3a1a)',
    '健康':'linear-gradient(135deg,#0a1a18,#1a3a30)',
    '生活':'linear-gradient(135deg,#1a1008,#3a2010)',
    '国际':'linear-gradient(135deg,#08081a,#10103a)',
    '热点':'linear-gradient(135deg,#1a0808,#3a1010)',
  }[category] || 'linear-gradient(135deg,#0a0a1a,#1a1a3a)'

  if (err || !src) {
    return (
      <div style={{ width:'100%', height:'100%', background:gradient, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'inherit' }}>
        <span style={{ fontSize:'4rem', opacity:0.15 }}>{CI[category]||'📰'}</span>
      </div>
    )
  }
  return (
    <>
      <div style={{ position:'absolute', inset:0, background:gradient, opacity: ok ? 0 : 1, transition:'opacity 0.4s', borderRadius:'inherit' }} />
      <img src={src} alt={alt}
        style={{ width:'100%', height:'100%', objectFit:'cover', opacity: ok ? 1 : 0, transition:'opacity 0.4s', borderRadius:'inherit' }}
        onLoad={() => setOk(true)} onError={() => setErr(true)}
      />
    </>
  )
}

export default function PostDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/data/posts.json')
      .then(r => r.json())
      .then(data => {
        const found = data.posts.find(p => p.slug === slug)
        setPost(found)
        if (found) {
          setRelated(data.posts.filter(p => p.slug !== slug && p.category === found.category).slice(0, 4))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | 今日热点`
      window.scrollTo(0, 0)
    }
  }, [post])

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
      <div className="cyber-spinner" />
    </div>
  )

  if (!post) return (
    <div style="max-width:800px;margin:0 auto;padding:80px 20px;text-align:center">
      <div style="font-size:4rem;margin-bottom:16px;opacity:0.2">🔍</div>
      <p style="color:var(--text-muted);margin-bottom:16px;font-size:16px">文章不存在或已被删除</p>
      <Link to="/" style="color:var(--cyan);text-decoration:none;font-size:14px">← 返回首页</Link>
    </div>
  )

  // 为正文 h2 添加 id
  let headingIdx = 0
  const contentWithIds = post.content.replace(/<h2([^>]*)>/g, () => {
    return `<h2${headingIdx++} id="heading-${headingIdx}">`
  })

  return (
    <>
      <SEOMeta
        title={post.title}
        description={post.description}
        keywords={post.keywords}
        article={true}
        publishTime={post.date}
        ogImage={post.coverImage}
      />
      <ReadingProgress />

      <div style="max-width:1280px;margin:0 auto;padding:32px 16px;animation:fadeUp 0.5s ease">
        <div style="display:flex;gap:40px">

          {/* 左侧：文章 */}
          <article style="flex:1;min-width:0">

            {/* 面包屑 */}
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;font-size:13px;color:var(--text-muted)">
              <Link to="/" style="color:var(--cyan);text-decoration:none">首页</Link>
              <span>›</span>
              <Link to={`/category/${post.category}`} style="color:var(--cyan);text-decoration:none">{post.category}</Link>
              <span>›</span>
              <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;color:var(--text-secondary)">{post.title}</span>
            </div>

            {/* 封面 */}
            <div style="position:relative;border-radius:18px;overflow:hidden;height:360px;margin-bottom:24px;border:1px solid var(--border);box-shadow:0 8px 40px rgba(0,0,0,0.5)">
              <CoverImg src={post.coverImage} alt={post.title} category={post.category} />
              <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(4,4,15,0.95) 0%,rgba(4,4,15,0.5) 50%,transparent 80%)" />
              <div style="position:absolute;bottom:0;left:0;right:0;padding:24px;z-index:2">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`cat-tag cat-tag-${post.category}`}>{CI[post.category]} {post.category}</span>
                  {post.heat && <span className="heat-badge">🔥 {post.heat}</span>}
                </div>
                <h1 style="font-size:24px;font-weight:800;color:#fff;line-height:1.4;text-shadow:0 2px 10px rgba(0,0,0,0.8)">{post.title}</h1>
              </div>
            </div>

            {/* 元信息 */}
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:12px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:24px">
              <div style="display:flex;align-items:center;gap:16px;font-size:13px;color:var(--text-muted)">
                <span style="display:flex;align-items:center;gap:6px">📅 {post.date}</span>
                {post.readTime && <span style="display:flex;align-items:center;gap:6px">📖 约{post.readTime}分钟阅读</span>}
                {post.views && <span style="display:flex;align-items:center;gap:6px">👁 {(post.views/1000).toFixed(1)}k 阅读</span>}
              </div>
              <button onClick={copyLink}
                style="display:flex;align-items:center;gap:6px;font-size:13px;padding:6px 14px;border-radius:8px;border:1px solid var(--border);background:rgba(0,0,0,0.2);color:var(--text-secondary);cursor:pointer;transition:all 0.2s">
                {copied ? '✅ 已复制' : '📋 分享链接'}
              </button>
            </div>

            {/* 摘要 */}
            <div style="background:linear-gradient(135deg,rgba(0,212,255,0.06),rgba(139,92,246,0.06));border-left:3px solid var(--cyan);border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:24px">
              <p style="color:var(--text-secondary);line-height:1.8;font-size:15px">{post.description}</p>
            </div>

            {/* 顶部广告 */}
            <AdComponent position="top" />

            {/* 正文 */}
            <div style="margin-bottom:32px">
              <div
                className="prose-cyber"
                style="background:rgba(8,8,24,0.6);border:1px solid var(--border);border-radius:16px;padding:28px 32px;backdrop-filter:blur(8px)"
                dangerouslySetInnerHTML={{ __html: contentWithIds }}
              />
            </div>

            {/* 中部广告 */}
            <AdComponent position="middle" />

            {/* FAQ */}
            {post.faq && post.faq.length > 0 && (
              <div style="margin:32px 0;background:rgba(8,8,24,0.6);border:1px solid var(--border);border-radius:16px;padding:24px;backdrop-filter:blur(8px)">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;font-size:16px;font-weight:700;color:var(--cyan)">
                  <span>❓</span> 常见问题
                </div>
                <div style="display:flex;flex-direction:column;gap:8px">
                  {post.faq.map((item, i) => (
                    <details key={i} className="cyber-details">
                      <summary>{item.question || item.q}</summary>
                      <div className="cyber-answer">{item.answer || item.a}</div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* 标签 */}
            {post.tags && post.tags.length > 0 && (
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:32px">
                {post.tags.map(tag => (
                  <span key={tag} className="cyber-tag">#{tag}</span>
                ))}
              </div>
            )}

            {/* 导航按钮 */}
            <div style="display:flex;gap:12px">
              <Link to="/" className="btn-neon" style="flex:1;text-align:center;text-decoration:none">
                ← 返回首页
              </Link>
              <Link to={`/category/${post.category}`} className="btn-neon-red" style="flex:1;text-align:center;text-decoration:none">
                更多{post.category} →
              </Link>
            </div>
          </article>

          {/* 右侧：目录+相关 */}
          <aside style="width:240px;flex-shrink:0;display:none;@media(min-width:1024px){display:block}">
            <div style="position:sticky;top:88px;display:flex;flex-direction:column;gap:20px">
              <TOC content={post.content} />

              {/* 相关文章 */}
              {related.length > 0 && (
                <div style="background:rgba(8,8,24,0.8);border:1px solid var(--border);border-radius:14px;overflow:hidden;backdrop-filter:blur(12px)">
                  <div style="padding:12px 16px;background:rgba(0,212,255,0.05);border-bottom:1px solid var(--border);font-size:13px;font-weight:700;color:var(--cyan)">📰 相关推荐</div>
                  {related.map(p => (
                    <Link key={p.slug} to={`/posts/${p.slug}`}
                      style="display:block;padding:12px 16px;border-bottom:1px solid var(--border);text-decoration:none;transition:background 0.2s"
                      className="related-item"
                      >
                      <div style={{ fontSize:"13px", color:"var(--text-secondary)", lineHeight:"1.5", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", marginBottom:"4px" }}>{p.title}</div>
                      <div style={{ fontSize:11, color:"var(--text-muted)" }}>{p.date}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .prose-cyber h2 {
          font-size: 18px;
          font-weight: 700;
          color: #00d4ff;
          margin: 28px 0 14px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(26,26,64,0.8);
          letter-spacing: 0.3px;
          scroll-margin-top: 100px;
        }
        .prose-cyber p {
          color: #8888bb;
          line-height: 1.9;
          margin-bottom: 14px;
          font-size: 15px;
        }
        .prose-cyber strong { color: #f0f0ff; font-weight: 700; }
      `}</style>
    </>
  )
}
