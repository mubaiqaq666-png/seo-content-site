import { Link } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <>
      <header>
        <div className="container header-inner">
          <Link to="/" className="logo">今日热点</Link>
          <nav>
            <Link to="/">首页</Link>
            <Link to="/posts">全部</Link>
            <Link to="/about">关于</Link>
          </nav>
        </div>
      </header>

      <main className="container" style={{ paddingTop: 24, minHeight: '60vh' }}>
        {children}
      </main>

      <footer>
        <div className="container">
          <div style={{ marginBottom: 8 }}>
            <Link to="/privacy">隐私政策</Link>
            <Link to="/terms">服务条款</Link>
          </div>
          <p>© {new Date().getFullYear()} 今日热点 - 实时资讯平台</p>
        </div>
      </footer>
    </>
  )
}
