import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import AdComponent from '../components/AdComponent'

function PostDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/data/posts.json')
      .then(res => res.json())
      .then(data => {
        const found = data.posts.find(p => p.slug === slug)
        setPost(found)
        if (found) {
          const related = data.posts
            .filter(p => p.slug !== slug && p.category === found.category)
            .slice(0, 3)
          setRelatedPosts(related)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">文章未找到</h1>
        <Link to="/posts" className="text-blue-600 hover:underline">返回文章列表</Link>
      </div>
    )
  }

  // 渲染文章内容（支持HTML或Markdown格式）
  const renderContent = (content) => {
    if (typeof content === 'string') {
      // 如果是HTML内容
      if (content.includes('<')) {
        return <div dangerouslySetInnerHTML={{ __html: content }} />
      }
      // 如果是纯文本，按换行符分段
      return content.split('\n\n').map((para, i) => <p key={i} className="mb-4">{para}</p>)
    }
    return null
  }

  return (
    <>
      {/* Article Header */}
      <article className="bg-white">
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container-custom">
            <div className="flex items-center gap-2 text-blue-200 text-sm mb-4">
              <Link to="/" className="hover:text-white">首页</Link>
              <span>/</span>
              <Link to="/posts" className="hover:text-white">文章</Link>
              <span>/</span>
              <span>{post.category}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <p className="text-xl text-blue-100 mb-6">{post.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">{post.category}</span>
              <span>发布日期: {post.date}</span>
              <div className="flex gap-2">
                {post.tags?.map(tag => (
                  <span key={tag} className="bg-white/10 px-2 py-1 rounded text-xs">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </header>

        <AdComponent position="top" />

        {/* Article Content */}
        <div className="container-custom py-12">
          <div className="max-w-3xl mx-auto">
            {/* SEO Meta */}
            <meta name="description" content={post.description} />
            <meta name="keywords" content={post.keywords?.join(', ')} />

            {/* Main Content */}
            <div className="prose prose-lg max-w-none">
              {renderContent(post.content)}
            </div>

            {/* FAQ Section */}
            {post.faq && post.faq.length > 0 && (
              <div className="mt-12 p-6 bg-gray-50 rounded-xl">
                <h2 className="text-2xl font-bold mb-6">常见问题解答</h2>
                <div className="space-y-4">
                  {post.faq.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                      <h3 className="font-semibold text-lg mb-2">Q: {item.question}</h3>
                      <p className="text-gray-600">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AdComponent position="middle" />
          </div>
        </div>

        <AdComponent position="bottom" />
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="container-custom">
            <h2 className="text-2xl font-bold mb-6">相关文章</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(related => (
                <Link
                  key={related.slug}
                  to={`/posts/${related.slug}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-4 block"
                >
                  <h3 className="font-semibold mb-2 hover:text-blue-600">{related.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{related.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default PostDetail
