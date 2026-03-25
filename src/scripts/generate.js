#!/usr/bin/env node

/**
 * SEO内容自动生成脚本
 * 输入关键词，自动生成SEO文章并写入 data/posts.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============== 配置区域 ==============

// 要生成的关键词列表（可自行添加更多）
const KEYWORDS = [
  { keyword: 'SEO优化', category: 'SEO基础', tags: ['SEO', '网站优化', '搜索引擎'] },
  { keyword: '关键词排名', category: 'SEO进阶', tags: ['关键词', '排名', '搜索'] },
  { keyword: '网站速度优化', category: '技术SEO', tags: ['速度', '性能', '用户体验'] },
  { keyword: '移动端优化', category: '技术SEO', tags: ['移动端', '响应式', '手机站'] },
  { keyword: '外链建设', category: '外链优化', tags: ['外链', '反向链接', '权重'] },
  { keyword: '内容营销', category: '内容策略', tags: ['内容', '营销', '流量'] },
  { keyword: '长尾关键词', category: '关键词策略', tags: ['长尾词', '精准流量', 'SEO'] },
  { keyword: '站内优化', category: 'SEO基础', tags: ['站内', '优化', '结构'] },
  { keyword: '页面标题优化', category: 'SEO技巧', tags: ['标题', 'Meta', '标签'] },
  { keyword: '图片SEO优化', category: '技术SEO', tags: ['图片', 'Alt', '优化'] }
]

// 网站名称
const SITE_NAME = 'SEO内容站'

// ============== 文章生成函数 ==============

// 生成唯一slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// 生成日期
function generateDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 根据关键词生成文章内容
function generateArticle(keywordData) {
  const { keyword, category, tags } = keywordData
  
  // 生成5个H2段落
  const sections = [
    {
      title: `什么是${keyword}？`,
      content: `${keyword}是现代网站运营中不可或缺的重要环节。随着搜索引擎算法的不断升级，掌握${keyword}的核心理念对于任何希望提升网站排名的站长来说都至关重要。本文将为您详细介绍${keyword}的基本概念、实施方法和最佳实践。`
    },
    {
      title: `${keyword}的核心要点`,
      content: `要正确实施${keyword}，需要关注以下几个核心要点：首先，确保基础设置正确无误；其次，遵循搜索引擎的官方指南；最后，持续监测和优化效果。建议每个季度进行一次全面审核，及时发现并修复可能存在的问题。`
    },
    {
      title: `${keyword}的实操步骤`,
      content: `实施${keyword}的具体步骤包括：第一步，进行全面诊断，了解当前状况；第二步，制定详细的优化计划；第三步，逐步执行各项优化措施；第四步，监测效果并进行必要的调整。在整个过程中，保持耐心和持续学习的态度非常重要。`
    },
    {
      title: `${keyword}的常见误区`,
      content: `在进行${keyword}时，很多新手容易犯一些常见错误。比如过于追求短期效果而忽视长期发展，或者盲目跟随他人的经验而忽视自身网站的特点。正确的做法是根据自己网站的实际情况，制定个性化的优化策略。`
    },
    {
      title: `${keyword}的效果评估`,
      content: `评估${keyword}效果的方法主要有：监测关键词排名变化、分析流量增长情况、查看转化率提升等。建议使用专业的SEO工具来辅助监测，如Google Analytics、Google Search Console等。同时，保持数据记录的习惯有助于分析长期趋势。`
    }
  ]

  // 生成FAQ
  const faqs = [
    {
      question: `${keyword}需要多长时间才能看到效果？`,
      answer: `通常需要2-4周开始看到初步效果，完全见效可能需要3-6个月。具体时间取决于行业竞争程度、当前网站基础和优化力度。`
    },
    {
      question: `${keyword}需要多少钱？`,
      answer: `成本取决于实施方式。自己学习实施成本最低，仅需投入时间成本；委托专业团队则根据服务范围从几千元到几万元不等。`
    },
    {
      question: `${keyword}是否必须持续进行？`,
      answer: `是的，SEO是一项持续性的工作。搜索引擎算法不断更新，竞争对手也在持续优化，需要保持定期维护和更新。`
    },
    {
      question: `${keyword}对所有网站都有效吗？`,
      answer: `理论上有搜索需求的网站都能从${keyword}中受益，但效果会因行业、竞争程度、网站质量等因素而有所不同。`
    },
    {
      question: `可以同时做多个关键词的${keyword}吗？`,
      answer: `可以，但不建议一次性优化太多关键词。建议先选择3-5个核心关键词重点突破，获得一定效果后再逐步扩展。`
    }
  ]

  // 组装完整内容
  const content = sections.map(section => `
<h2>${section.title}</h2>
<p>${section.content}</p>
  `).join('\n')

  return {
    title: `${keyword}完全指南：2026最新优化技巧与实战方法`,
    slug: generateSlug(`${keyword}-完全指南`),
    description: `全面了解${keyword}的核心技巧与实操方法。本文涵盖基础知识、实操步骤、常见误区和效果评估，助您快速提升网站排名。`,
    keywords: [keyword, ...tags, '网站优化', '搜索引擎优化', '2026'],
    category,
    tags,
    content,
    faq: faqs,
    date: generateDate()
  }
}

// 生成所有文章
function generateAllPosts() {
  console.log('🚀 开始生成SEO文章...\n')
  
  const posts = KEYWORDS.map(kw => {
    console.log(`📝 生成文章: ${kw.keyword}`)
    return generateArticle(kw)
  })

  console.log(`\n✨ 共生成 ${posts.length} 篇文章\n`)

  return posts
}

// 根据单个关键词生成文章（用于自动抓取）
function generateArticleFromKeyword(keyword, source = 'manual') {
  const categoryMap = {
    'baidu': '热门话题',
    'weibo': '热搜精选',
    'zhihu': '知识精选',
    'douyin': '抖音热点',
    'manual': 'SEO教程'
  }
  
  const category = categoryMap[source] || '精选内容'
  const tags = [keyword, '热门', '精选', category]
  
  return generateArticle({ keyword, category, tags })
}

export { generateAllPosts, generateArticleFromKeyword, generateArticle }

// 写入文件
function writePosts(posts) {
  const data = { posts }
  
  // 写入 public/data/posts.json
  const publicPath = path.join(__dirname, '../../public/data/posts.json')
  fs.writeFileSync(publicPath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`✅ 已更新: public/data/posts.json`)

  // 写入 src/data/posts.json (开发环境使用)
  const srcPath = path.join(__dirname, '../../data/posts.json')
  fs.writeFileSync(srcPath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`✅ 已更新: src/data/posts.json`)
}

// 生成 sitemap.xml
function generateSitemap(posts) {
  const baseUrl = 'https://seo-content-site.vercel.app' // 部署时替换为实际域名
  const today = new Date().toISOString().split('T')[0]

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/posts</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
`

  // 添加所有文章页面
  posts.forEach(post => {
    sitemap += `  <url>
    <loc>${baseUrl}/posts/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
  })

  sitemap += '</urlset>'

  // 写入 public/sitemap.xml
  const sitemapPath = path.join(__dirname, '../../public/sitemap.xml')
  fs.writeFileSync(sitemapPath, sitemap, 'utf-8')
  console.log(`✅ 已生成: public/sitemap.xml`)

  // 写入 src/sitemap.xml
  const srcSitemapPath = path.join(__dirname, '../../sitemap.xml')
  fs.writeFileSync(srcSitemapPath, sitemap, 'utf-8')
  console.log(`✅ 已生成: sitemap.xml`)
}

// 生成 robots.txt
function generateRobots() {
  const baseUrl = 'https://seo-content-site.vercel.app' // 部署时替换为实际域名
  
  const robots = `# robots.txt for SEO Content Site
User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin/private areas (if any)
Disallow: /admin/
Disallow: /api/
`

  const robotsPath = path.join(__dirname, '../../public/robots.txt')
  fs.writeFileSync(robotsPath, robots, 'utf-8')
  console.log(`✅ 已生成: public/robots.txt`)

  const srcRobotsPath = path.join(__dirname, '../../robots.txt')
  fs.writeFileSync(srcRobotsPath, robots, 'utf-8')
  console.log(`✅ 已生成: robots.txt`)
}

// ============== 主函数 ==============

function main() {
  console.log('='.repeat(50))
  console.log('📦 SEO内容自动生成系统')
  console.log('='.repeat(50) + '\n')

  try {
    // 1. 生成文章
    const posts = generateAllPosts()

    // 2. 写入posts.json
    writePosts(posts)

    // 3. 生成sitemap.xml
    generateSitemap(posts)

    // 4. 生成robots.txt
    generateRobots()

    console.log('\n' + '='.repeat(50))
    console.log('🎉 所有文件生成完成！')
    console.log('='.repeat(50))
    console.log('\n📌 下一步:')
    console.log('   1. 运行 npm run dev 预览网站')
    console.log('   2. 运行 npm run deploy 自动部署')
    console.log('')

  } catch (error) {
    console.error('❌ 生成失败:', error.message)
    process.exit(1)
  }
}

main()
