import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AdComponent from '../components/AdComponent'

function Posts() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetch('/data/posts.json')
      .then(res => res.json())
      .then(data => {
        const sortedPosts = data.posts.sort((a, b) => new Date(b.date) - new Date(a.date))
        setPosts(sortedPosts)
        const cats = [...new Set(data.posts.map(p => p.category))]
        setCategories(cats)
      })
      .catch(() => setPosts([]))
  }, [])

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(p => p.category === selectedCategory)

  return (
    <>
      <section className="bg-gray-800 text-white py-12">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-4">全部文章</h1>
          <p className="text-gray-300">探索我们的所有SEO优化内容</p>
        </div>
      </section>

      <AdComponent position="top" />

      <section className="py-8 container-custom">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            全部
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <Link
              key={post.slug}
              to={`/posts/${post.slug}`}
              className="block bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-sm">{post.date}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 hover:text-blue-600">
                    {post.title}
                  </h3>
                  <p className="text-gray-600">{post.description}</p>
                  <div className="flex gap-2 mt-3">
                    {post.tags?.slice(0, 4).map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-blue-600 font-medium">阅读更多 →</div>
              </div>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <p className="text-center text-gray-500 py-12">暂无文章</p>
        )}
      </section>

      <AdComponent position="bottom" />
    </>
  )
}

export default Posts
