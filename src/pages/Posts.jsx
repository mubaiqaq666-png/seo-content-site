import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const CI = { '科技':'💻','财经':'📈','社会':'🏙️','娱乐':'🎬','体育':'⚽','健康':'🌿','生活':'🏠','国际':'🌍','热点':'🔥' }
const CAT_COLORS = { '科技':'var(--cyan)','财经':'#fbbf24','社会':'#94a3b8','娱乐':'#ec4899','体育':'#22c55e','健康':'#14b8a6','生活':'#f97316','国际':'#6366f1','热点':'var(--red)' }

function CoverImg({ src, alt, category }) {
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState(false)
  const g = { '科技':'#0a1628','财经':'#1a1a08','社会':'#0a0a1a','娱乐':'#1a0a20','体育':'#0a1a0a','健康':'#0a1a18','生活':'#1a1008','国际':'#08081a','热点':'#1a0808' }[category]||'#0a0a1a'
  if (err||!src) return <div style={`width:100%;height:100%;background:${g};display:flex;align-items:center;justify-content:center`}><span style="font-size:1.5rem;opacity:0.2">{CI[category]||'📰'}</span></div>
  return <><div style={`position:absolute;inset:0;background:${g};opacity:${ok?0:1};transition:opacity 0.4s`} /><img src={src} alt={alt} style={`width:100%;height:100%;object-fit:cover;opacity:${ok?1:0};transition:opacity 0.4s`} onLoad={()=>setOk(true)} onError={()=>setErr(true)} /></>
}

export default function Posts() {
  const [posts, setPosts] = useState([])
  const [cats, setCats] = useState([])
  const [sel, setSel] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/posts.json').then(r=>r.json()).then(d=>{
      const s=[...d.posts].sort((a,b)=>new Date(b.date)-new Date(a.date))
      setPosts(s)
      setCats([...new Set(s.map(p=>p.category))])
      setLoading(false)
    }).catch(()=>setLoading(false))
  },[])

  const filtered = posts.filter(p => {
    const catOk = sel==='all'||p.category===sel
    const srchOk = !search||p.title.includes(search)||(p.description||'').includes(search)
    return catOk && srchOk
  })

  return (
    <div style="max-width:1280px;margin:0 auto;padding:32px 16px">
      {/* 标题 */}
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;animation:fadeUp 0.4s ease">
        <div style="width:3px;height:24px;border-radius:2px;background:'linear-gradient(180deg,var(--cyan),var(--purple))';background:'linear-gradient(180deg,#00d4ff,#8b5cf6);box-shadow:0 0 8px rgba(0,212,255,0.5)" />
        <h1 style="font-size:22px;font-weight:800;color:var(--text-primary)">📰 全部资讯</h1>
        <span style="color:var(--text-muted);font-size:13px">{filtered.length} 篇</span>
      </div>

      {/* 搜索 */}
      <div style="position:relative;margin-bottom:20px;animation:fadeUp 0.5s ease">
        <div className="cyber-search" style="width:100%;padding:0 16px;height:46px">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="搜索文章..." value={search} onChange={e=>setSearch(e.target.value)}
            style="flex:1;background:transparent;border:none;outline:none;color:var(--text-primary);font-size:14px" />
          {search && <button onClick={()=>setSearch('')} style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:16px">✕</button>}
        </div>
      </div>

      {/* 分类筛选 */}
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px;animation:fadeUp 0.6s ease">
        <button onClick={()=>setSel('all')} className={`cat-tag ${sel==='all'?'active':''}`}
          style="background:rgba(0,212,255,0.1);border-color:rgba(0,212,255,0.3);color:var(--cyan)">
          全部
        </button>
        {cats.map(c=>(
          <button key={c} onClick={()=>setSel(c)}
            className={`cat-tag ${sel===c?'active':''}`}
            style={sel===c?`background:rgba(0,212,255,0.1);border-color:rgba(0,212,255,0.3);color:var(--cyan)`:''}>
            {CI[c]} {c}
          </button>
        ))}
      </div>

      {/* 加载 */}
      {loading ? (
        <div style="display:flex;justify-content:center;padding:60px">
          <div className="cyber-spinner" />
        </div>
      ) : filtered.length===0 ? (
        <div style="text-align:center;padding:60px;color:var(--text-muted)">
          <div style="font-size:3rem;margin-bottom:12px;opacity:0.3">🔍</div>
          <p>暂无相关文章</p>
          <button onClick={()=>{setSearch('');setSel('all')}} style="margin-top:12px;background:none;border:none;color:var(--cyan);cursor:pointer;font-size:13px">清除筛选</button>
        </div>
      ) : (
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;animation:fadeUp 0.7s ease">
          {filtered.map(post=>(
            <Link key={post.slug} to={`/posts/${post.slug}`}
              className="article-card" style="text-decoration:none">
              <div style="position:relative;overflow:hidden;border-radius:12px;width:120px;min-height:80px;flex-shrink:0">
                <CoverImg src={post.coverImage} alt={post.title} category={post.category} />
              </div>
              <div style="flex:1;min-width:0;padding:12px;display:flex;flex-direction:column;justify-content:space-between">
                <h3 className="card-title" style="font-size:13px;line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">
                  {post.title}
                </h3>
                <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
                  <span className={`cat-tag cat-tag-${post.category}`} style="font-size:10px;padding:2px 8px">{post.category}</span>
                  <span style="font-size:11px;color:var(--text-muted)">{post.date}</span>
                  {post.readTime && <span style="font-size:11px;color:var(--text-muted)">{post.readTime}分钟</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
