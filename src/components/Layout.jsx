import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AdComponent from './AdComponent'

const CAT_ICONS = { '科技':'💻','财经':'📈','社会':'🏙️','娱乐':'🎬','体育':'⚽','健康':'🌿','生活':'🏠','国际':'🌍','热点':'🔥' }

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchVal, setSearchVal] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    if (searchVal.trim()) {
      navigate(`/posts?q=${encodeURIComponent(searchVal)}`)
    }
  }

  return (
    <header className="cyber-header">
      <div className="max-w-7xl mx-auto px-4">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between h-14 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg flex-shrink-0"
              style="background: linear-gradient(135deg, #00d4ff, #8b5cf6); box-shadow: 0 0 16px rgba(0,212,255,0.4);">
              热
            </div>
            <div>
              <div className="font-black text-base leading-tight tracking-wide" style="color: var(--text-primary)">
                今日<span className="text-glow-cyan">热点</span>
              </div>
              <div className="text-xs leading-tight" style="color: var(--text-muted)">
                {new Date().toLocaleDateString('zh-CN', {month:'long', day:'numeric'})}
              </div>
            </div>
          </Link>

          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg flex">
            <div className="cyber-search flex-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="搜索资讯、话题..."
                style="color: var(--text-primary)"
              />
            </div>
            <button type="submit" className="ml-2 btn-neon flex-shrink-0">
              <span>搜索</span>
            </button>
          </form>

          {/* 右侧 */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to="/posts" className="text-sm font-medium transition" style="color:var(--text-secondary)" onMouseOver={e=>e.target.style.color='var(--cyan)'} onMouseOut={e=>e.target.style.color='var(--text-secondary)'}>
              全部文章
            </Link>
          </div>
        </div>

        {/* 分类标签栏 */}
        <div className="flex items-center gap-1.5 py-2 overflow-x-auto" style="-ms-overflow-style:none; scrollbar-width:none;">
          <style>{`::-webkit-scrollbar{display:none}`}</style>
          <Link to="/" className={`cat-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            🏠 首页
          </Link>
          {Object.entries(CAT_ICONS).map(([cat, icon]) => (
            <Link
              key={cat}
              to={`/category/${cat}`}
              className={`cat-nav-item ${location.pathname === `/category/${cat}` ? 'active' : ''}`}
            >
              <span>{icon}</span><span>{cat}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="cyber-footer">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* 底部广告 */}
          <div className="mb-6">
            <AdComponent position="bottom" />
          </div>
          {/* 链接 */}
          <div className="flex flex-wrap justify-center gap-5 mb-4 text-sm" style="color: var(--text-muted)">
            {Object.entries(CAT_ICONS).map(([cat, icon]) => (
              <Link key={cat} to={`/category/${cat}`}
                className="hover:underline transition" style="color:var(--text-secondary)">
                {icon} {cat}
              </Link>
            ))}
          </div>
          <div className="text-center text-sm" style="color:var(--text-muted)">
            <div style="color:var(--text-muted)">© {new Date().getFullYear()} 今日热点 · 内容来源于公开网络，仅供参考</div>
            <div className="mt-1 flex justify-center gap-4 text-xs" style="color:var(--text-muted)">
              <Link to="/privacy" className="hover:underline">隐私政策</Link>
              <Link to="/terms" className="hover:underline">使用条款</Link>
              <Link to="/about" className="hover:underline">关于我们</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
