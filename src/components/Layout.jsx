import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'

const CATEGORIES = ['科技', '财经', '社会', '娱乐', '体育', '健康', '生活', '国际']

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-red-600">
              <span className="bg-red-600 text-white w-8 h-8 rounded flex items-center justify-center text-sm font-black">热</span>
              今日热点
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/" className={`px-3 py-1.5 rounded text-sm font-medium transition ${location.pathname === '/' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'}`}>
                首页
              </Link>
              {CATEGORIES.map(cat => (
                <Link key={cat} to={`/category/${cat}`}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition ${location.pathname === `/category/${cat}` ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'}`}>
                  {cat}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {/* Mobile Nav */}
          {menuOpen && (
            <div className="md:hidden py-2 border-t border-gray-100 flex flex-wrap gap-1 pb-3">
              {CATEGORIES.map(cat => (
                <Link key={cat} to={`/category/${cat}`} onClick={() => setMenuOpen(false)}
                  className="px-3 py-1.5 bg-gray-100 rounded text-sm text-gray-700 hover:bg-red-50 hover:text-red-600">
                  {cat}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <h3 className="text-white font-semibold mb-3">今日热点</h3>
              <p className="text-sm">聚合全网热门话题，智能改写，每日更新</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">热门分类</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.slice(0, 4).map(cat => (
                  <Link key={cat} to={`/category/${cat}`} className="text-sm hover:text-white transition">{cat}</Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">关于</h3>
              <ul className="space-y-1 text-sm">
                <li><Link to="/about" className="hover:text-white transition">关于我们</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">隐私政策</Link></li>
                <li><Link to="/terms" className="hover:text-white transition">使用条款</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">数据来源</h3>
              <p className="text-sm">百度热搜 · 微博热搜<br />知乎热榜 · 36氪 · IT之家</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-sm">
            © 2026 今日热点. 内容来源于公开网络，仅供参考。
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
