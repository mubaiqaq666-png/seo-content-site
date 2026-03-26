import Layout from '../components/Layout'

export default function About() {
  return (
    <Layout>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>关于我们</h1>
      
      <div style={{ 
        background: 'var(--card)', 
        border: '1px solid var(--border)', 
        borderRadius: 8, 
        padding: 24,
        lineHeight: 1.8
      }}>
        <p style={{ marginBottom: 16 }}>
          <strong>今日热点</strong> 是一个实时资讯聚合平台，为您提供最新、最热的新闻资讯。
        </p>
        
        <h2 style={{ fontSize: 18, margin: '24px 0 12px' }}>我们的特点</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>实时更新：每日自动抓取最新资讯</li>
          <li>分类清晰：科技、财经、社会、娱乐等热门分类</li>
          <li>内容优质：精选高质量文章，拒绝低质内容</li>
          <li>访问快速：全球 CDN 加速，秒开无压力</li>
        </ul>
        
        <h2 style={{ fontSize: 18, margin: '24px 0 12px' }}>技术栈</h2>
        <p>React + Vite + Tailwind CSS，部署于 Vercel Edge Network。</p>
        
        <h2 style={{ fontSize: 18, margin: '24px 0 12px' }}>联系方式</h2>
        <p>如有问题或建议，欢迎通过以下方式联系我们：</p>
        <p style={{ marginTop: 8 }}>
          <a href="mailto:contact@example.com">contact@example.com</a>
        </p>
      </div>
    </Layout>
  )
}
