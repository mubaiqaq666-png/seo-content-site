#!/usr/bin/env node
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '../..')
const LIMIT = parseInt(process.argv[process.argv.length - 1]) || 10

async function main() {
  console.log(`\n📡 开始抓取 ${LIMIT} 篇真实文章...\n`)
  execSync(`node "${path.join(__dirname, 'fetchHotTopics.js')}" ${LIMIT}`, { cwd: ROOT, stdio: 'inherit' })
}

main().catch(e => console.error('❌ 错误:', e.message))
