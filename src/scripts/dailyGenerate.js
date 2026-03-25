#!/usr/bin/env node

/**
 * 每日自动生成 - 抓取热门话题改写成文章
 */

import { fetchAllTopics, generateArticlesFromTopics } from './fetchHotTopics.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '../..')
const POSTS_FILE = path.join(ROOT, 'public/data/posts.json')

async function main() {
  console.log('\n' + '='.repeat(55))
  console.log('🤖 智能资讯站 - 每日自动生成')
  console.log('='.repeat(55))

  // 1. 抓取热门话题
  const topicsData = await fetchAllTopics()
  const totalTopics = topicsData.reduce((sum, d) => sum + d.topics.length, 0)
  console.log(`\n📊 共抓取 ${totalTopics} 条热门话题`)

  // 2. 生成文章
  console.log('\n✍️  改写文章中...')
  const cats = process.env.FETCH_CATS ? process.env.FETCH_CATS.split(',').filter(Boolean) : null
  const limit = parseInt(process.env.FETCH_LIMIT) || 10
  const newArticles = await generateArticlesFromTopics(topicsData, limit, cats)
  newArticles.forEach(a => console.log(`  ✅ ${a.title} [${a.category}]`))

  // 3. 合并到现有数据
  let existingData = { posts: [] }
  if (fs.existsSync(POSTS_FILE)) {
    existingData = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'))
  }

  // 去重合并（按 slug）
  const slugSet = new Set(newArticles.map(a => a.slug))
  const oldPosts = existingData.posts.filter(p => !slugSet.has(p.slug))
  const allPosts = [...newArticles, ...oldPosts].slice(0, 200) // 最多保留200篇

  fs.writeFileSync(POSTS_FILE, JSON.stringify({ posts: allPosts }, null, 2))
  fs.writeFileSync(path.join(ROOT, 'data/posts.json'), JSON.stringify({ posts: allPosts }, null, 2))

  console.log(`\n📦 文章库更新: 新增 ${newArticles.length} 篇，共 ${allPosts.length} 篇`)

  // 4. 生成 sitemap
  generateSitemap(allPosts)

  // 5. Git 提交推送
  console.log('\n☁️  同步到云端...')
  try {
    execSync('git add .', { cwd: ROOT, stdio: 'pipe' })
    const ts = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    execSync(`git commit -m "daily: ${newArticles.length} new articles [${ts}]"`, { cwd: ROOT, stdio: 'pipe' })
    execSync('git push origin main', { cwd: ROOT, stdio: 'inherit' })
    console.log('✅ 同步成功！Vercel 将在 1-2 分钟内自动更新')
    console.log('🌐 https://seo-content-site.vercel.app/')
  } catch (e) {
    if (e.message.includes('nothing to commit')) {
      console.log('⚠️  没有新内容需要同步')
    } else {
      console.log('❌ 同步失败:', e.message)
    }
  }

  console.log('\n' + '='.repeat(55))
  console.log('🎉 每日生成完成！')
  console.log('='.repeat(55) + '\n')
}

function generateSitemap(posts) {
  const base = 'https://seo-content-site.vercel.app'
  const today = new Date().toISOString().split('T')[0]
  const urls = [
    `<url><loc>${base}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    `<url><loc>${base}/posts</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`,
    ...posts.map(p => `<url><loc>${base}/posts/${p.slug}</loc><lastmod>${p.date}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`)
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`
  fs.writeFileSync(path.join(ROOT, 'public/sitemap.xml'), xml)
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })
