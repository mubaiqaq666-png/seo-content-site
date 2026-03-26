import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const CI = { '科技':'💻','财经':'📈','社会':'🏙️','娱乐':'🎬','体育':'⚽','健康':'🌿','生活':'🏠','国际':'🌍','热点':'🔥' }

const CAT_GRAD = {
  '科技':'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(0,50,100,0.3))',
  '财经':'linear-gradient(135deg,rgba(251,191,36,0.15),rgba(100,60,0,0.3))',
  '社会':'linear-gradient(135deg,rgba(148,163,184,0.12),rgba(50,50,80,0.3))',
  '娱乐':'linear-gradient(135deg,rgba(236,72,153,0.15),rgba(100,20,80,0.3))',
  '体育':'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(0,80,40,0.3))',
  '健康':'linear-gradient(135deg,rgba(20,184,166,0.15),rgba(0,80,70,0.3))',
  '生活':'linear-gradient(135deg,rgba(249,115,22,0.15),rgba(100,50,0,0.3))',
  '国际':'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(30,30,120,0.3))',
  '热点':'linear-gradient(135deg,rgba(255,45,85,0.15),rgba(100,20,40,0.3))',
}

function CoverImg({ src, alt, category }) {
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState(false)
  const g = { '科技':'#0a1628','财经':'#1a1a08','社会':'#0a0a1a','娱乐':'#1a0a20','体育':'#0a1a0a','健康':'#0a1a18','生活':'#1a1008','国际':'#08081a','热点':'#1a0808' }[category]||'#0a0a1a'
  if (err||!src) return <div style={`position:absolute;inset:0;background:${g};display:flex;align-items:center;justify-content:center`}><span style="font-size:2rem;opacity:0.15">{CI[category]||'📰'}</span></div>
  return <><div style={`position:absolute;inset:0;background:${g};opacity:${ok?0:1};transition:opacity 0.4s`} /><img src={src} alt={alt} style={`width:100%;height:100%;object-fit:cover;opacity:${ok?1:0};transition:opacity 0.4s`} onLoad={()=>setOk(true)} onError={()=>setErr(true)} /></>
}

function HeroCard({ post }) {
  return (
    <Link to={`/posts/${post.slug}`} style="text-decoration:none;display:block">
      <div className="hero-card" style="min-height:220px">
        <CoverImg src={post.coverImage} alt={post.title} category={post.category} />
        <div style="position:absolute;bottom:0;left:0;right:0;padding:16px;z-index:2">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span className={`cat-tag cat-tag-${post.category}`}>{CI[post.category]} {post.category}</span>
            {post.heat && <span className="heat-badge">🔥 {post.heat}</span>}
          </div>
          <h3 style="font-size:14px;font-weight:700;color:#fff;line-height:1.4;text-shadow:0 2px 8px rgba(0,0,0,0.8)">{post.title}</h3>
          <div style="display:flex;gap:12px;margin-top:6px;font-size:11px;color:rgba(255,255,255,0.5)">
            <span>{post.date}</span>
            {post.readTime && <span>{post.readTime}分钟</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}

function Card({ post }) {
  return (
    <Link to={`/posts/${post.slug}`} className="article-card" style="text-decoration:none">
      <div style="position:relative;overflow:hidden;border-radius:10px;width:120px;min-height:76px;flex-shrink:0">
        <CoverImg src={post.coverImage} alt={post.title} category={post.category} />
      </div>
      <div style="flex:1;min-width:0;padding:10px;display:flex;flex-direction:column;justify-content:space-between">
        <h3 style="font-size:13px;font-weight:600;color:var(--text-secondary);line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">{post.title}</h3>
        <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
          <span className={`cat-tag cat-tag-${post.category}`} style="font-size:10px;padding:2px 8px">{post.category}</span>
          <span style="font-size:11px;color:var(--text-muted)">{post.date}</span>
        </div>
      </div>
    </Link>
  )
}

export default function Category() {
  const { category } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/data/posts.json').then(r=>r.json()).then(d=>{
      const filtered = d.posts.filter(p=>p.category===category).sort((a,b)=>new Date(b.date)-new Date(a.date))
      setPosts(filtered)
      setLoading(false)
    }).catch(()=>setLoading(false))
  },[category])

  const grad = CAT_GRAD[category] || CAT_GRAD['热点']

  return (
    <div>
      {/* Banner */}
      <div className="cat-banner" style="padding:36px 0">
        <div style="max-width:1280px;margin:0 auto;padding:0 16px;display:flex;align-items:center;gap:20px">
          <span style={`font-size:3.5rem;filter:drop-shadow(0 0 20px ${category==='热点'?'rgba(255,45,85,0.5)':category==='科技'?'rgba(0,212,255,0.5)':'rgba(139,92,246,0.5)'})`}>{CI[category]||'📰'}</span>
          <div>
            <h1 style="font-size:28px;font-weight:900;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,0.5)">{category}</h1>
            <p style="color:rgba(255,255,255,0.6);font-size:13px;margin-top:4px">共 {posts.length} 篇资讯 · 每日更新</p>
          </div>
          <Link to="/" style="margin-left:auto;color:rgba(255,255,255,0.5);text-decoration:none;font-size:13px">← 返回首页</Link>
        </div>
      </div>

      {/* 内容 */}
      <div style="max-width:1280px;margin:0 auto;padding:28px 16px">
        {loading ? (
          <div style="display:flex;justify-content:center;padding:60px"><div className="cyber-spinner" /></div>
        ) : posts.length===0 ? (
          <div style="text-align:center;padding:60px;color:var(--text-muted)">
            <div style="font-size:3rem;opacity:0.2;margin-bottom:12px">📭</div>
            <p>该分类暂无文章</p>
            <Link to="/" style="color:var(--cyan);text-decoration:none;margin-top:12px;display:inline-block">返回首页</Link>
          </div>
        ) : (
          <>
            {posts.length >= 3 && (
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:28px">
                {posts.slice(0,3).map(p=><HeroCard key={p.slug} post={p} />)}
              </div>
            )}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              {posts.slice(3).map(p=><Card key={p.slug} post={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
