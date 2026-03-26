import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import AdComponent from '../components/AdComponent'

// 分类图标
const CI = { '科技':'💻','财经':'📈','社会':'🏙️','娱乐':'🎬','体育':'⚽','健康':'🌿','生活':'🏠','国际':'🌍','热点':'🔥' }

// 分类渐变
const CG = { '科技':'rgba(0,212,255,0.08)','财经':'rgba(251,191,36,0.08)','社会':'rgba(148,163,184,0.08)','娱乐':'rgba(236,72,153,0.08)','体育':'rgba(34,197,94,0.08)','健康':'rgba(20,184,166,0.08)','生活':'rgba(249,115,22,0.08)','国际':'rgba(99,102,241,0.08)','热点':'rgba(255,45,85,0.08)' }

// 滚动热点条
function NewsTicker({ posts }) {
  const [idx, setIdx] = useState(0)
  const timer = useRef(null)
  const hot = posts.slice(0, 12)
  useEffect(() => {
    timer.current = setInterval(() => setIdx(i => (i + 1) % Math.max(hot.length, 1)), 3500)
    return () => clearInterval(timer.current)
  }, [hot.length])
  if (!hot.length) return null
  return (
    <div className="cyber-ticker">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-10 gap-3">
        <span className="cyber-ticker-label flex-shrink-0">🔥 热点</span>
        <div className="flex-1 relative h-5 overflow-hidden">
          {hot.map((p, i) => (
            <Link key={p.slug} to={`/posts/${p.slug}`}
              style={`position:absolute;inset:0;display:flex;align-items:center;font-size:13px;color:var(--text-secondary);transition:opacity 0.5s;opacity:${i===idx?1:0};text-decoration:none`}>
              <span style="color:var(--red);margin-right:8px">•</span>
              <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{p.title}</span>
            </Link>
          ))}
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          {hot.slice(0, 5).map((_, i) => (
            <button key={i} onClick={() => { clearInterval(timer.current); setIdx(i); timer.current = setInterval(() => setIdx(x => (x+1)%hot.length), 3500) }}
              style={`border-radius:3px;transition:all 0.3s;height:3px;cursor:pointer;border:none;background:${i===idx?'var(--red)':'rgba(255,255,255,0.2)'};width:${i===idx?16:6}px`} />
          ))}
        </div>
      </div>
    </div>
  )
}

// 封面图（带骨架屏和降级）
function CoverImg({ src, alt, cls, category }) {
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
      <div className={`${cls} cover-placeholder`}
        style={`background:${gradient};display:flex;align-items:center;justify-content:center`}>
        <span style="font-size:2rem;opacity:0.2">{CI[category]||'📰'}</span>
      </div>
    )
  }
  return (
    <>
      <div className={`${cls} cover-placeholder`} style={`background:${gradient};position:absolute;inset:0;opacity:${ok?0:1};transition:opacity 0.4s`} />
      <img src={src} alt={alt}
        className={cls}
        style={`opacity:${ok?1:0};transition:opacity 0.4s`}
        onLoad={() => setOk(true)}
        onError={() => setErr(true)}
      />
    </>
  )
}

// Hero 大卡片
function HeroCard({ post, large, onClick }) {
  return (
    <div className="hero-card" style={large?'min-height:320px':'min-height:200px'} onClick={onClick}>
      <CoverImg src={post.coverImage} alt={post.title} cls="hero-img" category={post.category} />
      <div style="position:absolute;bottom:0;left:0;right:0;padding:20px;z-index:2">
        <div className="flex items-center gap-2 mb-2">
          <span className={`cat-tag cat-tag-${post.category}`}>{post.category}</span>
          {post.heat && <span className="heat-badge">🔥 {post.heat}</span>}
        </div>
        <h2 className="font-bold text-white leading-snug" style={`font-size:${large?'22px':'15px'};text-shadow:0 2px 8px rgba(0,0,0,0.8)`}>
          {post.title}
        </h2>
        <div className="flex items-center gap-3 mt-2 text-xs" style="color:rgba(255,255,255,0.6)">
          <span>{post.date}</span>
          {post.readTime && <><span>·</span><span>约{post.readTime}分钟</span></>}
          {post.views && <><span>·</span><span>👁 {(post.views/1000).toFixed(1)}k</span></>}
        </div>
      </div>
    </div>
  )
}

// 文章小卡片
function Card({ post }) {
  return (
    <Link to={`/posts/${post.slug}`}
      className="article-card"
      style="text-decoration:none;display:flex">
      {post.coverImage ? (
        <div className="cover-wrap flex-shrink-0" style="width:120px;min-height:80px">
          <CoverImg src={post.coverImage} alt={post.title} cls="" category={post.category}
            style="width:100%;height:100%;object-fit:cover" />
        </div>
      ) : (
        <div className="flex-shrink-0 cover-placeholder" style="width:120px;min-height:80px;display:flex;align-items:center;justify-content:center">
          <span style="font-size:1.5rem;opacity:0.2">{CI[post.category]||'📰'}</span>
        </div>
      )}
      <div className="flex-1 min-w-0" style="padding:12px;display:flex;flex-direction:column;justify-content:space-between">
        <h3 className="card-title" style="font-size:13px;line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">
          {post.title}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className={`cat-tag cat-tag-${post.category}`} style="font-size:10px;padding:2px 8px">{post.category}</span>
          <span className="card-meta">{post.date}</span>
          {post.readTime && <span className="card-meta">{post.readTime}分钟</span>}
        </div>
      </div>
    </Link>
  )
}

// 主组件
export { Card as PostCard, HeroCard, CoverImg }
export default function Home() {
  const [posts, setPosts] = useState([])
  const [byCat, setByCat] = useState({})
  const [cat, setCat] = useState('all')
  const [time, setTime] = useState('all')
  const [search, setSearch] = useState('')
  const [sr, setSr] = useState(false)
  const now = new Date()

  useEffect(() => {
    fetch('/data/posts.json').then(r => r.json()).then(d => {
      const s = [...d.posts].sort((a, b) => new Date(b.date) - new Date(a.date))
      setPosts(s)
      const c = {}
      s.forEach(p => { if (!c[p.category]) c[p.category] = []; if (c[p.category].length < 6) c[p.category].push(p) })
      setByCat(c)
    }).catch(() => {})
  }, [])

  const filtered = posts.filter(p => {
    const catOk = cat === 'all' || p.category === cat
    let timeOk = true
    if (time === '24h') timeOk = (now - new Date(p.date)) < 86400000
    else if (time === '3d') timeOk = (now - new Date(p.date)) < 259200000
    else if (time === 'week') timeOk = (now - new Date(p.date)) < 604800000
    const srchOk = !sr || !search || p.title.includes(search) || (p.description||'').includes(search)
    return catOk && timeOk && srchOk
  })

  const hero0 = filtered[0]
  const hero1 = filtered.slice(1, 4)

  return (
    <div>
      <NewsTicker posts={posts} />

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* 搜索栏 */}
        <form onSubmit={e => { e.preventDefault(); if (search.trim()) setSr(true) }}
          className="mb-6 flex gap-2 max-w-lg" style="animation:fadeUp 0.4s ease">
          <div className="cyber-search flex-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input value={search} onChange={e => { setSearch(e.target.value); if (!e.target.value) setSr(false) }}
              placeholder="搜索资讯..."
              style="color:var(--text-primary)"
            />
          </div>
          <button type="submit" className="btn-neon"><span>搜索</span></button>
        </form>

        {/* 时间筛选 */}
        <div className="flex items-center gap-2 mb-6" style="animation:fadeUp 0.5s ease">
          {[['all','全部'],['24h','24小时'],['3d','3天内'],['week','本周']].map(([v,l]) => (
            <button key={v} onClick={() => setTime(v)} className={`time-filter-btn ${time===v?'active':''}`}>{l}</button>
          ))}
          <span className="ml-auto text-xs" style="color:var(--text-muted)">{filtered.length} 篇</span>
          {sr && <button onClick={() => { setSr(false); setSearch('') }} style="font-size:12px;color:var(--cyan);background:none;border:none;cursor:pointer">清除搜索</button>}
        </div>

        {/* Hero 大图 */}
        {!sr && filtered.length > 0 && (
          <div style="margin-bottom:32px;animation:fadeUp 0.6s ease">
            <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px">
              <div>{hero0 && <HeroCard post={hero0} large onClick={() => window.location.href=`/posts/${hero0.slug}`} />}</div>
              <div style="display:flex;flex-direction:column;gap:12px">
                {hero1.map(p => <HeroCard key={p.slug} post={p} onClick={() => window.location.href=`/posts/${p.slug}`} />)}
              </div>
            </div>
          </div>
        )}

        {/* 分类文章 */}
        {!sr && Object.entries(byCat).filter(([c]) => cat==='all'||cat===c).map(([c, ps]) => (
          <div key={c} style="margin-bottom:32px;animation:fadeUp 0.6s ease">
            <div className="section-title">
              <h2>{CI[c]} {c}</h2>
              <span className="text-xs" style="color:var(--text-muted)">{ps.length}篇</span>
              <div style="flex:1;height:1px;background:var(--border);margin-left:8px" />
              <Link to={`/category/${c}`} style="font-size:12px;color:var(--cyan);white-space:nowrap;text-decoration:none">查看更多 →</Link>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              {ps.slice(0, 4).map(p => <Card key={p.slug} post={p} />)}
            </div>
          </div>
        ))}

        {/* 最新资讯 */}
        {!sr && (
          <div style="margin-bottom:32px;animation:fadeUp 0.7s ease">
            <div className="section-title">
              <h2>📰 最新资讯</h2>
              <div style="flex:1;height:1px;background:var(--border);margin-left:8px" />
              <Link to="/posts" style="font-size:12px;color:var(--cyan);text-decoration:none">全部 →</Link>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              {filtered.slice(cat==='all'?4:0, cat==='all'?12:8).map(p => <Card key={p.slug} post={p} />)}
            </div>
          </div>
        )}

        {/* 首页广告 */}
        <div style="animation:fadeUp 0.8s ease">
          <AdComponent position="middle" />
        </div>
      </div>
    </div>
  )
}
