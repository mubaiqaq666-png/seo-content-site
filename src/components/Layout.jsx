import { Link, Outlet } from 'react-router-dom'

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container-custom py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              SEO内容站
            </Link>
            <div className="flex gap-6">
              <Link to="/" className="hover:text-blue-600 transition">首页</Link>
              <Link to="/posts" className="hover:text-blue-600 transition">文章</Link>
              <Link to="/about" className="hover:text-blue-600 transition">关于我们</Link>
              <Link to="/privacy" className="hover:text-blue-600 transition">隐私政策</Link>
              <Link to="/terms" className="hover:text-blue-600 transition">使用条款</Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">关于我们</h3>
              <p className="text-gray-400">提供高质量的SEO优化内容和教程</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">快速链接</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/posts" className="hover:text-white">文章列表</Link></li>
                <li><Link to="/about" className="hover:text-white">关于我们</Link></li>
                <li><Link to="/privacy" className="hover:text-white">隐私政策</Link></li>
                <li><Link to="/terms" className="hover:text-white">使用条款</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">联系方式</h3>
              <p className="text-gray-400">Email: contact@example.com</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            © 2026 SEO内容站. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
