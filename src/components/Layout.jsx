import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const CAT_ICONS = { '科技':'💻','财经':'📈','社会':'🏙️','娱乐':'🎬','体育':'⚽','健康':'🌿','生活':'🏠','国际':'🌍','热点':'🔥' }
const CAT_COLORS = {
  '科技':'bg-purple-100 text-purple-700','财经':'bg-yellow-100 text-yellow-700',
  '社会':'bg-gray-100 text-gray-700','娱乐':'bg-pink-100 text-pink-700',
  '体育':'bg-green-100 text-green-700','健康':'bg-teal-100 text-teal-700',
  '生活':'bg-orange-100 text-orange-700','国际':'bg-indigo-100 text-indigo-700',
  '热点':'bg-red-100 text-red-700'
}

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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">热</div>
            <div>
              <div className="font-bold text-gray-900 leading-tight">今日热点</div>
              <div className="text-xs text-gray-400 leading-tight">{new Date().toLocaleDateString('zh-CN', {month:'long', day:'numeric'})}</div>
            </div>
          </Link>

          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg flex">
            <div className="flex-1 flex items-center bg-gray-100 rounded-xl px-4 h-10 border border-transparent focus-within:border-red-400 focus-within:bg-white transition-all">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={searchVal} onChange={e => setSearchVal(e.target.value)}
                placeholder="搜索资讯..." className="flex-1 bg-transparent outline-none text-sm text-gray-700 ml-2.5 placeholder-gray-400" />
            </div>
            <button type="submit" className="ml-2 px-5 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors flex-shrink-0">
              搜索
            </button>
          </form>

          {/* 右侧 */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to="/posts" className="text-sm text-gray-500 hover:text-red-500 transition hidden sm:block">全部</Link>
          </div>
        </div>

        {/* 分类标签栏 */}
        <div className="flex items-center gap-1.5 py-2 overflow-x-auto scrollbar-thin -mx-1 px-1">
          {Object.entries(CAT_ICONS).map(([cat, icon]) => (
            <Link key={cat} to={`/category/${cat}`}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0
                ${location.pathname === `/category/${cat}` ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-red-500'}`}>
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-gray-400 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <div className="flex justify-center gap-6 mb-3 flex-wrap">
            {Object.entries(CAT_ICONS).map(([cat, icon]) => (
              <Link key={cat} to={`/category/${cat}`} className="hover:text-white transition">{icon} {cat}</Link>
            ))}
          </div>
          <div>© 2026 今日热点 · 内容来源于公开网络，仅供参考</div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
