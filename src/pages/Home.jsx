import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AdComponent from '../components/AdComponent'

function Home() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetch('/data/posts.json')
      .then(res => res.json())
      .then(data => {
        const sortedPosts = data.posts.sort((a, b) => new Date(b.date) - new Date(a.date))
        setPosts(sortedPosts.slice(0, 6))
      })
      .catch(() => setPosts([]))
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            专业的SEO优化指南
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            帮助你掌握SEO技巧，提升网站排名
          </p>
          <Link to="/posts" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
            浏览全部文章
          </Link>
        </div>
      </section>

      <AdComponent position="top" />

      {/* Latest Posts */}
      <section className="py-12 container-custom">
        <h2 className="text-3xl font-bold mb-8">最新文章</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <Link 
              key={post.slug} 
              to={`/posts/${post.slug}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-6 block"
            >
              <span className="inline-block bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full mb-3">
                {post.category}
              </span>
              <h3 className="text-xl font-semibold mb-2 hover:text-blue-600">
                {post.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {post.description}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>{post.date}</span>
                <span className="mx-2">•</span>
                <span>{post.tags?.slice(0, 2).join(', ')}</span>
              </div>
            </Link>
          ))}
        </div>
        {posts.length > 0 && (
          <div className="text-center mt-8">
            <Link to="/posts" className="btn-primary inline-block">
              查看更多 →
            </Link>
          </div>
        )}
      </section>

      <AdComponent position="bottom" />
    </>
  )
}

export default Home
