#!/usr/bin/env node

/**
 * 每日自动生成脚本
 * 1. 抓取热门话题
 * 2. 提取关键词
 * 3. 生成文章
 * 4. 自动提交部署
 */

import { generateDailyKeywords } from './fetchHotTopics.js'
import { generateArticleFromKeyword } from './generate.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
}

function log(color, prefix, message) {
  console.log(`${color}[${prefix}]${colors.reset} ${message}`)
}

// ============== 主函数 ==============

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('🤖 SEO内容站 - 每日自动生成系统')
  console.log('='.repeat(60) + '\n')

  try {
    // 1. 抓取热门话题
    log(colors.blue, '1/4', '抓取热门话题...')
    const { topics, keywords } = await generateDailyKeywords()

    if (keywords.length === 0) {
      log(colors.yellow, '⚠️', '未获取到关键词，退出')
      process.exit(0)
    }

    // 2. 生成文章
    log(colors.blue, '2/4', `生成文章 (共 ${keywords.length} 篇)...`)
    
    const postsPath = path.join(__dirname, '../../public/data/posts.json')
    let existingData = { posts: [] }
    
    if (fs.existsSync(postsPath)) {
      existingData = JSON.parse(fs.readFileSync(postsPath, 'utf-8'))
    }

    const newPosts = []
    for (let i = 0; i < Math.min(keywords.length, 5); i++) {
      const kw = keywords[i]
      log(colors.green, '✓', `生成文章: ${kw.keyword}`)
      
      const article = generateArticleFromKeyword(kw.keyword, kw.source)
      newPosts.push(article)
    }

    // 3. 合并文章数据
    log(colors.blue, '3/4', '更新文章数据库...')
    
    const allPosts = [...newPosts, ...existingData.posts]
    const uniquePosts = Array.from(
      new Map(allPosts.map(p => [p.slug, p])).values()
    )

    fs.writeFileSync(postsPath, JSON.stringify({ posts: uniquePosts }, null, 2), 'utf-8')
    log(colors.green, '✓', `已保存 ${uniquePosts.length} 篇文章`)

    // 4. Git 提交
    log(colors.blue, '4/4', '提交代码...')
    
    try {
      execSync('git add .', { stdio: 'pipe' })
      const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      execSync(`git commit -m "daily auto update: ${newPosts.length} new articles [${timestamp}]"`, { stdio: 'pipe' })
      execSync('git push origin main', { stdio: 'inherit' })
      log(colors.green, '✓', '代码已推送')
    } catch (e) {
      log(colors.yellow, '⚠️', 'Git 操作失败（可能无远程仓库）')
    }

    console.log('\n' + '='.repeat(60))
    log(colors.green, '✅', '每日生成完成！')
    console.log('='.repeat(60) + '\n')

  } catch (error) {
    log(colors.red, '❌', `执行失败: ${error.message}`)
    process.exit(1)
  }
}

main()
