#!/usr/bin/env node
/**
 * 每日自动内容更新脚本
 * 设置 crontab 每天早上 7:00 和晚上 20:00 各运行一次
 *
 * Crontab 设置:
 *   0 7,20 * * * cd /path/to/seo-content-site && /usr/local/bin/node src/scripts/dailyGenerate.js >> logs/daily.log 2>&1
 */
import { execSync } from 'child_process'
import { existsSync, mkdirSync, appendFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '../..')
const LOG_DIR = path.join(ROOT, 'logs')
const LIMIT = parseInt(process.argv[process.argv.length - 1]) || 30

function log(msg) {
  const ts = new Date().toISOString()
  const line = `[${ts}] ${msg}`
  console.log(line)
  try {
    if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true })
    appendFileSync(path.join(LOG_DIR, 'daily.log'), line + '\n')
  } catch {}
}

async function main() {
  log('======== 每日内容更新开始 ========')

  try {
    // 1. 运行 RSS 抓取（获取最新文章）
    log(`📡 开始抓取 ${LIMIT} 篇新文章...`)
    execSync(`node "${path.join(__dirname, 'fetchHotTopics.js')}" ${LIMIT}`, {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=512' }
    })

    // 2. 运行内容生成（RSS抓取+内置文章合并）
    log('🔄 运行内容生成合并...')
    execSync(`node "${path.join(__dirname, 'generate.js')}"`, {
      cwd: ROOT,
      stdio: 'inherit'
    })

    // 3. 提交并推送（触发 Vercel 部署）
    log('🚀 提交并推送触发部署...')
    const date = new Date().toISOString().slice(0, 16).replace('T', ' ')
    try {
      execSync('git add . && git commit -m "auto: daily content update [' + date + ']"', { cwd: ROOT })
      execSync('git push origin main', { cwd: ROOT })
      log('✅ 推送成功，Vercel 部署将自动触发')
    } catch (e) {
      if (e.message.includes('nothing to commit')) {
        log('ℹ️  无新内容，跳过推送')
      } else {
        throw e
      }
    }

    log('✅ 每日更新完成')
  } catch (err) {
    log(`❌ 更新失败: ${err.message}`)
    process.exit(1)
  }
}

main()
