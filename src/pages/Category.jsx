import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import AdComponent from '../components/AdComponent'

function Category() {
  const { category } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/data/posts.json')
      .then(res => res.json())
      .then(data => {
        const filtered = data.posts.filter(p => p.category === category)
        setPosts(filtered.sort((a, b) => new Date(b.date) - new Date(a.date)))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [category])

  return (
    <>
      <section className="bg-gray-800 text-white py-12">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-4">分类: {category}</h1>
          <p className="text-gray-300">共 {posts.length} 篇相关文章</p>
        </div>
      </section>

      <AdComponent position="top" />

      <section className="py-12 container-custom">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : posts.length > 0 ? (
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
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">该分类暂无文章</p>
        )}

        <div className="mt-8 text-center">
          <Link to="/posts" className="text-blue-600 hover:underline">
            ← 返回全部文章
          </Link>
        </div>
      </section>

      <AdComponent position="bottom" />
    </>
  )
}

export default Category
