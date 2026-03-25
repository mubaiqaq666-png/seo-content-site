/**
 * 图片资源配置
 * 使用 Unsplash Source（免费，无需 API Key，按关键词返回图片）
 * 格式: https://source.unsplash.com/featured/800x450?keyword
 * 备用: Picsum（纯随机占位图）
 */

// 每个分类对应的封面图关键词（英文，Unsplash 效果更好）
export const CATEGORY_IMAGES = {
  '科技': [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=450&fit=crop',
  ],
  '财经': [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=450&fit=crop',
  ],
  '社会': [
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&h=450&fit=crop',
  ],
  '娱乐': [
    'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=450&fit=crop',
  ],
  '体育': [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=450&fit=crop',
  ],
  '健康': [
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=450&fit=crop',
  ],
  '生活': [
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=450&fit=crop',
  ],
  '国际': [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1488229297570-58520851e868?w=800&h=450&fit=crop',
  ],
  '热点': [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=450&fit=crop',
  ],
}

// 根据分类和 slug 确定性地选一张图（同一文章每次显示相同图片）
export function getCoverImage(category, slug = '') {
  const imgs = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['热点']
  // 用 slug 的字符码之和取模，保证同一文章图片固定
  const hash = slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return imgs[hash % imgs.length]
}

// 小尺寸缩略图（列表用）
export function getThumbnail(category, slug = '') {
  const url = getCoverImage(category, slug)
  return url.replace('w=800&h=450', 'w=400&h=225')
}

// 分类图标 emoji
export const CATEGORY_ICONS = {
  '科技': '💻',
  '财经': '📈',
  '社会': '🏙️',
  '娱乐': '🎬',
  '体育': '⚽',
  '健康': '🌿',
  '生活': '🏠',
  '国际': '🌍',
  '热点': '🔥',
}

// 分类渐变色（用于封面背景）
export const CATEGORY_GRADIENTS = {
  '科技': 'from-purple-900 to-blue-900',
  '财经': 'from-yellow-900 to-orange-900',
  '社会': 'from-gray-800 to-gray-900',
  '娱乐': 'from-pink-900 to-purple-900',
  '体育': 'from-green-900 to-teal-900',
  '健康': 'from-teal-900 to-green-900',
  '生活': 'from-orange-900 to-red-900',
  '国际': 'from-indigo-900 to-blue-900',
  '热点': 'from-red-900 to-orange-900',
}
