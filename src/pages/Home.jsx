import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

const CI = { '科技':'💻','财经':'📈','社会':'🏙️','娱乐':'🎬','体育':'⚽','健康':'🌿','生活':'🏠','国际':'🌍','热点':'🔥' }
const CC = { '科技':'bg-purple-100 text-purple-700','财经':'bg-yellow-100 text-yellow-700','社会':'bg-gray-100 text-gray-700','娱乐':'bg-pink-100 text-pink-700','体育':'bg-green-100 text-green-700','健康':'bg-teal-100 text-teal-700','生活':'bg-orange-100 text-orange-700','国际':'bg-indigo-100 text-indigo-700','热点':'bg-red-100 text-red-700' }
const CGRAD = { '科技':'from-purple-800 to-blue-900','财经':'from-yellow-800 to-orange-900','社会':'from-gray-700 to-gray-900','娱乐':'from-pink-800 to-purple-900','体育':'from-green-800 to-teal-900','健康':'from-teal-700 to-green-900','生活':'from-orange-700 to-red-900','国际':'from-indigo-800 to-blue-900','热点':'from-red-800 to-orange-900' }

// 滚动热点条
function NewsTicker({ posts }) {
  const [idx, setIdx] = useState(0)
  const timer = useRef(null)
  const hot = posts.slice(0, 12)
  useEffect(() => {
    timer.current = setInterval(() => setIdx(i => (i + 1) % hot.length), 4000)
    return () => clearInterval(timer.current)
  }, [hot.length])
  if (!hot.length) return null
  return (
    <div className="bg-red-600 text-white">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-9 gap-3">
        <span className="flex-shrink-0 bg-white/20 px-2.5 py-0.5 rounded font-bold text-xs">🔥 热点</span>
        <div className="flex-1 relative h-5 overflow-hidden">
          {hot.map((p, i) => (
            <Link key={p.slug} to={`/posts/${p.slug}`}
              className={`absolute inset-0 flex items-center text-sm transition-opacity duration-500 ${i === idx ? 'opacity-100' : 'opacity-0'}`}>
              <span className="mr-2 text-red-200">•</span>
              <span className="truncate hover:text-red-200">{p.title}</span>
            </Link>
          ))}
        </div>
        <div className="flex-shrink-0 flex gap-1">
          {hot.slice(0, 5).map((_, i) => (
            <button key={i} onClick={() => { clearInterval(timer.current); setIdx(i); timer.current = setInterval(() => setIdx(x => (x+1)%hot.length), 4000) }}
              className={`rounded-full transition-all ${i === idx ? 'bg-white w-4 h-1.5' : 'bg-white/40 w-1.5 h-1.5'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

// 图片（带错误降级）
function Img({ src, cat, alt, cls }) {
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState(false)
  if (err || !src) return <div className={`bg-gradient-to-br ${CGRAD[cat]||'from-gray-700 to-gray-900'} ${cls}`} />
  return <img src={src} alt={alt} className={`${cls} ${ok ? '' : 'opacity-0'}`} style={{transition:'opacity 0.4s'}}
    onLoad={() => setOk(true)} onError={() => setErr(true)} />
}

// Hero 大卡片
function HeroCard({ post, large, onClick }) {
  return (
    <div className={`group relative overflow-hidden rounded-xl cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 ${large?'h-80':'h-52'}`} onClick={onClick}>
      <div className="absolute inset-0">
        <Img src={post.coverImage} cat={post.category} alt={post.title} cls="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${CC[post.category]||'bg-red-100 text-red-700'}`}>{post.category}</span>
          {post.heat && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-semibold">🔥 {post.heat}</span>}
        </div>
        <h2 className={`font-bold text-white leading-snug group-hover:text-red-200 transition ${large?'text-xl md:text-2xl':'text-base'} line-clamp-2 mb-2`}>{post.title}</h2>
        <div className="flex items-center gap-3 text-xs text-white/60">
          {post.date && <span>{post.date}</span>}
          {post.readTime && <><span>·</span><span>约{post.readTime}分钟</span></>}
          {post.views && <><span>·</span><span>👁 {(post.views/1000).toFixed(1)}k</span></>}
        </div>
      </div>
    </div>
  )
}

// 普通文章卡片
function Card({ post }) {
  return (
    <div className="group flex gap-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer overflow-hidden p-3"
      onClick={() => window.location.href = `/posts/${post.slug}`}>
      {post.coverImage && (
        <div className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden">
          <Img src={post.coverImage} cat={post.category} alt={post.title} cls="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
      )}
      {!post.coverImage && (
        <div className={`flex-shrink-0 w-24 h-16 rounded-lg bg-gradient-to-br ${CGRAD[post.category]||'from-gray-700 to-gray-900'} flex items-center justify-center`}>
          <span className="text-2xl opacity-30">{CI[post.category]||'📰'}</span>
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition line-clamp-2 leading-snug text-sm">{post.title}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1.5">
          <span className={`px-1.5 py-0.5 rounded ${CC[post.category]||'bg-gray-100 text-gray-600'}`}>{post.category}</span>
          {post.readTime && <span>{post.readTime}分钟</span>}
          {post.views && <><span>·</span><span>👁 {(post.views/1000).toFixed(1)}k</span></>}
          <span>·</span><span>{post.date}</span>
        </div>
      </div>
    </div>
  )
}

// 分类小标签按钮
function CatBtn({ cat, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${active?'bg-red-500 text-white shadow-sm':'bg-white text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-500'}`}>
      <span>{CI[cat]}</span><span>{cat}</span>
    </button>
  )
}

// 主组件
export { Card as PostCard, CC as CAT_COLORS, CGRAD as CAT_GRADIENTS, CI as CAT_ICONS, HeroCard, Img as CoverImage }
export default function Home() {
  const [posts, setPosts] = useState([])
  const [byCat, setByCat] = useState({})
  const [cat, setCat] = useState('all')
  const [time, setTime] = useState('all')  // all / 24h / 3d / week
  const [search, setSearch] = useState('')
  const [sr, setSr] = useState(false)  // search result mode
  const now = new Date()

  useEffect(() => {
    fetch('/data/posts.json').then(r => r.json()).then(d => {
      const s = [...d.posts].sort((a, b) => new Date(b.date) - new Date(a.date))
      setPosts(s)
      const c = {}
      s.forEach(p => { if (!c[p.category]) c[p.category] = []; if (c[p.category].length < 6) c[p.category].push(p) })
      setByCat(c)
    })
  }, [])

  function hoursAgo(h) { return now - new Date(now) < h * 3600000 }

  const filtered = posts.filter(p => {
    let catOk = cat === 'all' || p.category === cat
    let timeOk = true
    if (time === '24h') timeOk = (now - new Date(p.date)) < 86400000
    else if (time === '3d') timeOk = (now - new Date(p.date)) < 259200000
    else if (time === 'week') timeOk = (now - new Date(p.date)) < 604800000
    let srchOk = !sr || !search || p.title.includes(search) || (p.description||'').includes(search)
    return catOk && timeOk && srchOk
  })

  const hero0 = filtered[0]
  const hero1 = filtered.slice(1, 4)

  function doSearch(e) {
    e.preventDefault()
    if (search.trim()) setSr(true)
  }

  return (
    <div className="bg-gray-50">
      <NewsTicker posts={posts} />

      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* 搜索栏 */}
        <form onSubmit={doSearch} className="mb-5 flex gap-2 max-w-lg">
          <div className="flex-1 flex items-center bg-white rounded-xl px-4 h-10 border border-gray-200 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-50 transition-all">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => { setSearch(e.target.value); if (!e.target.value) setSr(false) }}
              placeholder="搜索资讯..." className="flex-1 bg-transparent outline-none text-sm text-gray-700 ml-2.5" />
          </div>
          <button type="submit" className="px-6 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors">搜索</button>
        </form>

        {/* 时间筛选 */}
        <div className="flex items-center gap-2 mb-5">
          {[['all','全部'],['24h','24小时'],['3d','3天内'],['week','本周']].map(([v,l]) => (
            <button key={v} onClick={() => setTime(v)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${time===v?'bg-red-50 text-red-600 border border-red-200':'text-gray-500 hover:bg-gray-100'}`}>{l}</button>
          ))}
          <span className="ml-auto text-xs text-gray-400">{filtered.length} 篇</span>
          {sr && <button onClick={() => { setSr(false); setSearch('') } } className="text-xs text-red-500 hover:underline">清除搜索</button>}
        </div>

        {/* 搜索结果 */}
        {sr && (
          <div className="mb-5 p-4 bg-white rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">搜索 "<span className="font-semibold text-gray-800">{search}</span>" · {filtered.length} 条结果</p>
          </div>
        )}

        {/* Hero 大图 */}
        {!sr && filtered.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">{hero0 && <HeroCard post={hero0} large onClick={() => window.location.href = `/posts/${hero0.slug}`} />}</div>
              <div className="flex flex-col gap-3">{hero1.map(p => <HeroCard key={p.slug} post={p} onClick={() => window.location.href = `/posts/${p.slug}`} />)}</div>
            </div>
          </div>
        )}

        {/* 分类文章 */}
        {!sr && Object.entries(byCat).filter(([c]) => cat === 'all' || cat === c).map(([c, ps]) => (
          <div key={c} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-red-500 rounded-full"></div>
              <h2 className="font-bold text-gray-900 text-lg">{CI[c]} {c}</h2>
              <span className="text-xs text-gray-400">{ps.length}篇</span>
              <div className="flex-1 h-px bg-gray-100"></div>
              <Link to={`/category/${c}`} className="text-xs text-red-500 hover:underline">查看更多 →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ps.slice(0, 4).map(p => <Card key={p.slug} post={p} />)}
            </div>
          </div>
        ))}

        {/* 最新资讯 */}
        {!sr && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-red-500 rounded-full"></div>
              <h2 className="font-bold text-gray-900 text-lg">📰 最新资讯</h2>
              <div className="flex-1 h-px bg-gray-100"></div>
              <Link to="/posts" className="text-xs text-red-500 hover:underline">全部 →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.slice(cat==='all'?4:0, cat==='all'?12:8).map(p => <Card key={p.slug} post={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
