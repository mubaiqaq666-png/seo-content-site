import AdComponent from '../components/AdComponent'

function About() {
  return (
    <>
      <section className="bg-gray-800 text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-4">关于我们</h1>
          <p className="text-xl text-gray-300">致力于提供最专业的SEO优化内容</p>
        </div>
      </section>

      <AdComponent position="top" />

      <section className="py-12 container-custom">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg">
            <h2>我们的使命</h2>
            <p>
              我们致力于为网站管理员、数字营销人员和内容创作者提供最实用、最新的SEO优化指南。
              通过深入浅出的教程和实战技巧，帮助您在搜索引擎中获得更好的排名。
            </p>

            <h2>我们提供什么</h2>
            <ul>
              <li>全面的SEO教程和指南</li>
              <li>最新的搜索引擎算法更新解读</li>
              <li>实战案例分析和最佳实践</li>
              <li>工具推荐和资源分享</li>
            </ul>

            <h2>联系方式</h2>
            <p>
              如有任何问题或建议，欢迎通过以下方式联系我们：<br />
              邮箱：contact@example.com
            </p>
          </div>
        </div>
      </section>

      <AdComponent position="bottom" />
    </>
  )
}

export default About
