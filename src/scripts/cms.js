#!/usr/bin/env node

/**
 * 内容管理器 - 快速修改文章、关键词、网站配置
 * 修改完成后一键同步到 Vercel
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '../..')
const POSTS_FILE = path.join(ROOT, 'public/data/posts.json')
const GENERATE_FILE = path.join(ROOT, 'src/scripts/generate.js')

// 颜色
const C = {
  reset: '\x1b[0m', green: '\x1b[32m', blue: '\x1b[34m',
  yellow: '\x1b[33m', red: '\x1b[31m', cyan: '\x1b[36m', bold: '\x1b[1m'
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(resolve => rl.question(q, resolve))

function log(color, icon, msg) { console.log(`${color}${icon}${C.reset} ${msg}`) }
function title(msg) { console.log(`\n${C.bold}${C.cyan}${msg}${C.reset}\n`) }
function divider() { console.log(C.blue + '─'.repeat(50) + C.reset) }

// 读取文章数据
function readPosts() {
  return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'))
}

// 写入文章数据
function writePosts(data) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(data, null, 2), 'utf-8')
  // 同步到 src/data
  const srcPath = path.join(ROOT, 'data/posts.json')
  fs.writeFileSync(srcPath, JSON.stringify(data, null, 2), 'utf-8')
}

// 一键同步到 Vercel
function syncToCloud(message) {
  log(C.blue, '☁️', '同步到云端...')
  try {
    execSync('git add .', { cwd: ROOT, stdio: 'pipe' })
    const msg = message || `content update [${new Date().toLocaleString('zh-CN')}]`
    execSync(`git commit -m "${msg}"`, { cwd: ROOT, stdio: 'pipe' })
    execSync('git push origin main', { cwd: ROOT, stdio: 'inherit' })
    log(C.green, '✅', '同步成功！Vercel 将在 1-2 分钟内自动更新')
    log(C.cyan, '🌐', 'https://seo-content-site.vercel.app/')
  } catch (err) {
    if (err.message.includes('nothing to commit')) {
      log(C.yellow, '⚠️', '没有新内容需要同步')
    } else {
      log(C.red, '❌', '同步失败: ' + err.message)
    }
  }
}

// ============== 功能模块 ==============

// 1. 查看所有文章
async function listPosts() {
  const data = readPosts()
  title(`📄 当前文章列表（共 ${data.posts.length} 篇）`)
  divider()
  data.posts.forEach((p, i) => {
    console.log(`${C.yellow}${String(i+1).padStart(2)}.${C.reset} ${p.title}`)
    console.log(`    ${C.blue}分类: ${p.category}${C.reset} | ${C.cyan}日期: ${p.date}${C.reset}`)
    console.log(`    ${C.reset}${p.description.slice(0, 60)}...`)
    console.log()
  })
  divider()
}

// 2. 编辑文章
async function editPost() {
  const data = readPosts()
  title('✏️  编辑文章')
  
  data.posts.forEach((p, i) => {
    console.log(`${C.yellow}${String(i+1).padStart(2)}.${C.reset} ${p.title}`)
  })
  
  const idx = parseInt(await ask('\n请输入文章编号: ')) - 1
  if (isNaN(idx) || idx < 0 || idx >= data.posts.length) {
    log(C.red, '❌', '无效编号')
    return
  }
  
  const post = data.posts[idx]
  console.log(`\n当前标题: ${C.cyan}${post.title}${C.reset}`)
  const newTitle = await ask('新标题（回车跳过）: ')
  if (newTitle.trim()) post.title = newTitle.trim()
  
  console.log(`\n当前描述: ${C.cyan}${post.description}${C.reset}`)
  const newDesc = await ask('新描述（回车跳过）: ')
  if (newDesc.trim()) post.description = newDesc.trim()
  
  console.log(`\n当前分类: ${C.cyan}${post.category}${C.reset}`)
  const newCat = await ask('新分类（回车跳过）: ')
  if (newCat.trim()) post.category = newCat.trim()
  
  writePosts(data)
  log(C.green, '✅', '文章已更新')
  
  const sync = await ask('\n是否立即同步到云端？(y/n): ')
  if (sync.toLowerCase() === 'y') syncToCloud(`edit: update article "${post.title}"`)
}

// 3. 删除文章
async function deletePost() {
  const data = readPosts()
  title('🗑️  删除文章')
  
  data.posts.forEach((p, i) => {
    console.log(`${C.yellow}${String(i+1).padStart(2)}.${C.reset} ${p.title}`)
  })
  
  const idx = parseInt(await ask('\n请输入要删除的文章编号: ')) - 1
  if (isNaN(idx) || idx < 0 || idx >= data.posts.length) {
    log(C.red, '❌', '无效编号')
    return
  }
  
  const post = data.posts[idx]
  const confirm = await ask(`确认删除「${post.title}」? (y/n): `)
  if (confirm.toLowerCase() !== 'y') {
    log(C.yellow, '⚠️', '已取消')
    return
  }
  
  data.posts.splice(idx, 1)
  writePosts(data)
  log(C.green, '✅', `已删除: ${post.title}`)
  
  const sync = await ask('\n是否立即同步到云端？(y/n): ')
  if (sync.toLowerCase() === 'y') syncToCloud(`delete: remove article "${post.title}"`)
}

// 4. 添加新关键词并生成文章
async function addKeyword() {
  title('➕ 添加关键词并生成文章')
  
  const keyword = await ask('请输入关键词: ')
  if (!keyword.trim()) { log(C.red, '❌', '关键词不能为空'); return }
  
  const category = await ask('请输入分类（默认: 精选内容）: ') || '精选内容'
  const tagsInput = await ask('请输入标签（逗号分隔，默认: 热门,精选）: ')
  const tags = tagsInput.trim() ? tagsInput.split(',').map(t => t.trim()) : ['热门', '精选']
  
  log(C.blue, '⏳', `正在生成文章: ${keyword}...`)
  
  // 动态导入 generate.js
  const { generateArticleFromKeyword } = await import('./generate.js')
  const article = generateArticleFromKeyword(keyword.trim(), 'manual')
  article.category = category
  article.tags = tags
  
  const data = readPosts()
  // 检查是否已存在
  const exists = data.posts.find(p => p.slug === article.slug)
  if (exists) {
    log(C.yellow, '⚠️', '该关键词文章已存在，将更新内容')
    const idx = data.posts.findIndex(p => p.slug === article.slug)
    data.posts[idx] = article
  } else {
    data.posts.unshift(article) // 插入到最前面
  }
  
  writePosts(data)
  log(C.green, '✅', `文章已生成: ${article.title}`)
  
  const sync = await ask('\n是否立即同步到云端？(y/n): ')
  if (sync.toLowerCase() === 'y') syncToCloud(`add: new article "${article.title}"`)
}

// 5. 批量添加关键词
async function batchAddKeywords() {
  title('📦 批量添加关键词')
  console.log('请输入关键词（每行一个，输入空行结束）:')
  
  const keywords = []
  while (true) {
    const kw = await ask('')
    if (!kw.trim()) break
    keywords.push(kw.trim())
  }
  
  if (keywords.length === 0) { log(C.yellow, '⚠️', '未输入关键词'); return }
  
  log(C.blue, '⏳', `正在生成 ${keywords.length} 篇文章...`)
  
  const { generateArticleFromKeyword } = await import('./generate.js')
  const data = readPosts()
  
  for (const kw of keywords) {
    const article = generateArticleFromKeyword(kw, 'manual')
    const exists = data.posts.findIndex(p => p.slug === article.slug)
    if (exists >= 0) {
      data.posts[exists] = article
    } else {
      data.posts.unshift(article)
    }
    log(C.green, '✓', `已生成: ${article.title}`)
  }
  
  writePosts(data)
  log(C.green, '✅', `共生成 ${keywords.length} 篇文章，总计 ${data.posts.length} 篇`)
  
  const sync = await ask('\n是否立即同步到云端？(y/n): ')
  if (sync.toLowerCase() === 'y') syncToCloud(`batch add: ${keywords.length} new articles`)
}

// 6. 修改网站配置
async function editSiteConfig() {
  title('⚙️  修改网站配置')
  
  const layoutPath = path.join(ROOT, 'src/components/Layout.jsx')
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8')
  
  const currentName = layoutContent.match(/SEO内容站|[^"]+(?=<\/Link>)/)?.[0] || 'SEO内容站'
  console.log(`当前网站名称: ${C.cyan}SEO内容站${C.reset}`)
  const newName = await ask('新网站名称（回车跳过）: ')
  
  if (newName.trim()) {
    const updated = layoutContent.replace(/SEO内容站/g, newName.trim())
    fs.writeFileSync(layoutPath, updated, 'utf-8')
    log(C.green, '✅', `网站名称已更新为: ${newName.trim()}`)
  }
  
  const sync = await ask('\n是否立即同步到云端？(y/n): ')
  if (sync.toLowerCase() === 'y') syncToCloud(`config: update site name`)
}

// 7. 直接同步（不修改内容）
async function directSync() {
  title('☁️  直接同步到云端')
  const msg = await ask('提交说明（回车使用默认）: ')
  syncToCloud(msg.trim() || null)
}

// 8. 查看网站状态
async function showStatus() {
  title('📊 网站状态')
  divider()
  
  const data = readPosts()
  const categories = [...new Set(data.posts.map(p => p.category))]
  
  log(C.green, '🌐', 'https://seo-content-site.vercel.app/')
  log(C.blue, '📄', `文章总数: ${data.posts.length} 篇`)
  log(C.blue, '📁', `分类数量: ${categories.length} 个`)
  console.log(`\n分类列表:`)
  categories.forEach(cat => {
    const count = data.posts.filter(p => p.category === cat).length
    console.log(`  ${C.yellow}• ${cat}${C.reset} (${count} 篇)`)
  })
  
  console.log(`\n最新 5 篇文章:`)
  data.posts.slice(0, 5).forEach(p => {
    console.log(`  ${C.cyan}• ${p.title}${C.reset}`)
  })
  
  divider()
  
  try {
    const gitLog = execSync('git log --oneline -5', { cwd: ROOT, encoding: 'utf-8' })
    console.log(`\n最近提交记录:`)
    gitLog.trim().split('\n').forEach(line => {
      console.log(`  ${C.blue}${line}${C.reset}`)
    })
  } catch(e) {}
}

// ============== 主菜单 ==============

async function main() {
  console.clear()
  console.log(`
${C.bold}${C.cyan}╔══════════════════════════════════════════════╗
║     🚀 SEO内容站 - 内容管理器               ║
║     网站: seo-content-site.vercel.app       ║
╚══════════════════════════════════════════════╝${C.reset}
`)
  
  while (true) {
    console.log(`${C.bold}请选择操作:${C.reset}`)
    console.log(`  ${C.yellow}1${C.reset}) 📄 查看所有文章`)
    console.log(`  ${C.yellow}2${C.reset}) ✏️  编辑文章`)
    console.log(`  ${C.yellow}3${C.reset}) 🗑️  删除文章`)
    console.log(`  ${C.yellow}4${C.reset}) ➕ 添加关键词（生成新文章）`)
    console.log(`  ${C.yellow}5${C.reset}) 📦 批量添加关键词`)
    console.log(`  ${C.yellow}6${C.reset}) ⚙️  修改网站配置`)
    console.log(`  ${C.yellow}7${C.reset}) ☁️  直接同步到云端`)
    console.log(`  ${C.yellow}8${C.reset}) 📊 查看网站状态`)
    console.log(`  ${C.yellow}0${C.reset}) 退出`)
    console.log()
    
    const choice = await ask('请输入选项: ')
    console.log()
    
    switch (choice.trim()) {
      case '1': await listPosts(); break
      case '2': await editPost(); break
      case '3': await deletePost(); break
      case '4': await addKeyword(); break
      case '5': await batchAddKeywords(); break
      case '6': await editSiteConfig(); break
      case '7': await directSync(); break
      case '8': await showStatus(); break
      case '0':
        log(C.green, '👋', '再见！')
        rl.close()
        process.exit(0)
      default:
        log(C.yellow, '⚠️', '无效选项，请重新输入')
    }
    console.log()
  }
}

main().catch(err => {
  console.error('错误:', err.message)
  rl.close()
  process.exit(1)
})
