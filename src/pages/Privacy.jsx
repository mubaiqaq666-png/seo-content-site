import AdComponent from '../components/AdComponent'

function Privacy() {
  return (
    <>
      <section className="bg-gray-800 text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-4">隐私政策</h1>
          <p className="text-xl text-gray-300">最后更新: 2026年3月</p>
        </div>
      </section>

      <AdComponent position="top" />

      <section className="py-12 container-custom">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg">
            <h2>信息收集</h2>
            <p>
              我们重视您的隐私。本网站可能会收集以下类型的信息：
            </p>
            <ul>
              <li><strong>自动收集的信息：</strong>包括您的IP地址、浏览器类型、访问时间等基本日志信息</li>
              <li><strong>Cookie信息：</strong>我们使用cookies来改善用户体验和分析网站流量</li>
              <li><strong>用户提供的信息：</strong>当您订阅我们的通讯或联系我们时提供的电子邮件地址等信息</li>
            </ul>

            <h2>信息使用</h2>
            <p>我们收集的信息将用于以下目的：</p>
            <ul>
              <li>提供、维护和改进我们的服务</li>
              <li>发送您请求的更新和通讯</li>
              <li>分析网站使用情况以优化用户体验</li>
              <li>遵守法律义务</li>
            </ul>

            <h2>信息共享</h2>
            <p>
              我们不会出售、交易或以其他方式转让您的个人信息。我们可能会与可信赖的第三方服务提供商共享信息，
              以帮助我们运营网站、开展业务或为您提供服务，但这些第三方同意对此信息保密。
            </p>

            <h2>第三方服务</h2>
            <p>
              本网站可能使用第三方服务，如Google Analytics（用于流量分析）和Google AdSense（用于展示广告）。
              这些服务可能会根据其各自的隐私政策收集和使用您的信息。
            </p>

            <h2>数据安全</h2>
            <p>
              我们采取适当的安全措施来保护您的个人信息。但是，请注意，通过互联网传输的数据无法保证100%安全。
            </p>

            <h2>您的权利</h2>
            <p>
              根据适用的数据保护法律，您可能有权：
            </p>
            <ul>
              <li>访问我们持有的关于您的个人信息</li>
              <li>要求更正不准确的个人信息</li>
              <li>要求删除您的个人信息</li>
              <li>反对或限制某些类型的处理</li>
            </ul>

            <h2>儿童隐私</h2>
            <p>
              我们的网站不面向13岁以下的儿童，我们不会故意收集13岁以下儿童的个人信息。
            </p>

            <h2>隐私政策更新</h2>
            <p>
              我们可能会不时更新本隐私政策。我们将通过在本页面上发布新的隐私政策来通知您任何更改。
              请定期查看此页面以了解最新信息。
            </p>

            <h2>联系我们</h2>
            <p>
              如果您对本隐私政策有任何疑问，请通过以下方式联系我们：<br />
              邮箱：contact@example.com
            </p>
          </div>
        </div>
      </section>

      <AdComponent position="bottom" />
    </>
  )
}

export default Privacy
