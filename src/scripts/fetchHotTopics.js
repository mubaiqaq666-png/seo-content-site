#!/usr/bin/env node

import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============== 工具函数 ==============

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    mod.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0' }
    }, res => {
      if (res.statusCode >= 300 && res.headers.location) {
        fetchText(res.headers.location).then(resolve).catch(reject); return
      }
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => resolve(d))
    }).on('error', reject)
    .setTimeout(10000, function() { this.destroy(); reject(new Error('timeout')) })
  })
}

function generateSlug(title) {
  return title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-').replace(/-{2,}/g, '-').toLowerCase().slice(0, 80)
}

function estimateReadTime(html) {
  const text = html.replace(/<[^>]+>/g, '')
  return Math.max(1, Math.ceil(text.length / 800))
}

function cleanHtml(html) {
  return (html || '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/data-vmark="[^"]*"/g, '')
    .replace(/<[^>]+>/g, (m) => {
      if (/^<(p|br|h[1-6]|li|ul|ol|blockquote)/i.test(m)) return '\n'
      return ''
    })
    .replace(/\n{3,}/g, '\n\n')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ').trim()
}

const COVER_CATS = {
  '科技': ['https://picsum.photos/seed/tech/800/450', 'https://picsum.photos/seed/ai/800/450', 'https://picsum.photos/seed/code/800/450'],
  '财经': ['https://picsum.photos/seed/stock/800/450', 'https://picsum.photos/seed/finance/800/450'],
  '社会': ['https://picsum.photos/seed/city/800/450', 'https://picsum.photos/seed/news/800/450'],
  '娱乐': ['https://picsum.photos/seed/movie/800/450', 'https://picsum.photos/seed/game/800/450'],
  '体育': ['https://picsum.photos/seed/sport/800/450', 'https://picsum.photos/seed/football/800/450'],
  '健康': ['https://picsum.photos/seed/health/800/450'],
  '生活': ['https://picsum.photos/seed/life/800/450', 'https://picsum.photos/seed/travel/800/450'],
  '国际': ['https://picsum.photos/seed/world/800/450'],
  '热点': ['https://picsum.photos/seed/hot/800/450']
}

function getCoverImage(cat) {
  const seeds = COVER_CATS[cat] || COVER_CATS['热点']
  return seeds[Math.floor(Math.random() * seeds.length)]
}

const CAT_MAP = {
  '科技': ['AI','芯片','手机','苹果','华为','特斯拉','机器人','软件','硬件','Linux','AMD','英特尔','英伟达','Google','微软','OpenAI'],
  '财经': ['股市','基金','理财','美联储','黄金','房价','IPO'],
  '社会': ['政策','法律','教育','医疗','就业'],
  '娱乐': ['电影','综艺','音乐','游戏','明星'],
  '体育': ['足球','篮球','奥运','NBA'],
  '健康': ['养生','减肥','健身','心理'],
  '生活': ['旅游','美食','汽车','宠物'],
  '国际': ['美国','欧洲','俄罗斯','外交']
}

function detectCategory(title) {
  for (const [cat, kws] of Object.entries(CAT_MAP)) {
    if (kws.some(k => title.includes(k))) return cat
  }
  return '科技'
}

// ============== RSS 文章抓取（IT之家） ==============

async function fetchFromITHome(limit = 20) {
  console.log('\n📡 抓取 IT之家 RSS...')
  const xml = await fetchText('https://www.ithome.com/rss/')
  const items = xml.match(/<item>([\s\S]*?)<\/item>/gi) || []
  console.log(`  ✅ 获取 ${items.length} 条`)
  
  const articles = []
  for (const raw of items.slice(0, limit)) {
    const title = (raw.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1] || '').trim()
    const link = (raw.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '').trim()
    const rawDesc = raw.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/si)?.[1] || ''
    const pubDate = (raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '').trim()
    
    if (!title) continue
    
    // 描述就是文章内容
    const cleanText = cleanHtml(rawDesc)
    const category = detectCategory(title)
    const date = pubDate ? new Date(pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    const slug = generateSlug(title + '-' + date)
    
    // 构建 HTML 内容段落
    const paragraphs = cleanText.split('\n').filter(p => p.trim().length > 10)
    const content = paragraphs.map(p => `<p>${p.trim()}</p>`).join('\n')
    
    articles.push({
      title,
      slug,
      description: cleanText.slice(0, 160) + (cleanText.length > 160 ? '...' : ''),
      keywords: [title, category, 'IT之家', '科技', '2026'],
      category,
      tags: [category, 'IT之家'],
      coverImage: getCoverImage(category),
      relatedVideos: [],
      readTime: Math.max(2, Math.ceil(cleanText.length / 800)),
      views: Math.floor(Math.random() * 50000) + 5000,
      content,
      faq: [],
      date,
      source: '',
      heat: '',
      originalTitle: title
    })
  }
  return articles
}

// ============== RSS 补充源（36氪） ==============

async function fetchFrom36Kr(limit = 10) {
  try {
    console.log('\n📡 抓取 36氪 RSS...')
    const xml = await fetchText('https://36kr.com/feed')
    const items = xml.match(/<item>([\s\S]*?)<\/item>/gi) || []
    console.log(`  ✅ 获取 ${items.length} 条`)
    
    const articles = []
    for (const raw of items.slice(0, limit)) {
      const title = (raw.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1] || '').trim()
      const rawDesc = raw.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/si)?.[1] || ''
      const pubDate = (raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '').trim()
      if (!title) continue
      
      const cleanText = cleanHtml(rawDesc)
      const category = detectCategory(title)
      const date = pubDate ? new Date(pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      const slug = generateSlug(title + '-' + date)
      const paragraphs = cleanText.split('\n').filter(p => p.trim().length > 10)
      const content = paragraphs.map(p => `<p>${p.trim()}</p>`).join('\n')
      
      articles.push({
        title, slug,
        description: cleanText.slice(0, 160) + (cleanText.length > 160 ? '...' : ''),
        keywords: [title, category, '36氪', '科技'],
        category, tags: [category, '36氪'],
        coverImage: getCoverImage(category),
        relatedVideos: [], readTime: Math.max(2, Math.ceil(cleanText.length / 800)),
        views: Math.floor(Math.random() * 50000) + 5000,
        content, faq: [], date, source: '', heat: '', originalTitle: title
      })
    }
    return articles
  } catch(e) {
    console.log(`  ❌ 36氪失败: ${e.message}`)
    return []
  }
}

// ============== 直接运行 ==============

async function main() {
  const limit = parseInt(process.argv[process.argv.length - 1]) || 20
  const postsFile = path.join(__dirname, '../../public/data/posts.json')
  
  // 读取已有文章
  let existing = []
  try {
    const raw = fs.readFileSync(postsFile, 'utf-8')
    const data = JSON.parse(raw)
    existing = data.posts || []
    console.log(`📂 现有 ${existing.length} 篇文章`)
  } catch(e) {}
  
  // 抓取新文章
  const [ithome, kr36] = await Promise.all([
    fetchFromITHome(limit),
    fetchFrom36Kr(5)
  ])
  
  const newArticles = [...ithome, ...kr36]
  console.log(`\n🆕 新文章: ${newArticles.length} 篇`)
  
  // 去重（按 slug）
  const existingSlugs = new Set(existing.map(p => p.slug))
  const unique = newArticles.filter(a => !existingSlugs.has(a.slug))
  console.log(`✨ 去重后新增: ${unique.length} 篇`)
  
  if (unique.length === 0) {
    console.log('\n⚠️  无新文章，跳过写入')
    return
  }
  
  // 合并（新的在前）
  const all = [...unique, ...existing].slice(0, 200)
  
  fs.writeFileSync(postsFile, JSON.stringify({ posts: all }, null, 2), 'utf-8')
  console.log(`\n✅ 写入完成，共 ${all.length} 篇文章`)
  
  // 自动推送
  const { execSync } = await import('child_process')
  try {
    execSync('git add . && git commit -m "auto: fetch real articles [' + new Date().toISOString().slice(0,16).replace('T',' ') + ']" && git push origin main', { cwd: path.join(__dirname, '../..') })
    console.log('✅ 已推送到 GitHub')
  } catch(e) {
    if (!e.message.includes('nothing to commit')) console.log('⚠️ 推送:', e.message.trim())
  }
}

main().catch(e => console.error('\n❌ 错误:', e.message))
