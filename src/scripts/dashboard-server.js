#!/usr/bin/env node

/**
 * Dashboard 静态文件服务器
 * 支持: dashboard 前端 + articles API
 */

import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '../..')

const PORT = 3001

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
}

function sendFile(res, filePath, customType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
      return
    }
    const ext = path.extname(filePath).toLowerCase()
    res.writeHead(200, { 'Content-Type': customType || TYPES[ext] || 'application/octet-stream' })
    res.end(data)
  })
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return }

  const url = req.url.split('?')[0]

  // API: /data/posts.json → 映射到 public/data/posts.json
  if (url === '/data/posts.json' || url === '/api/posts') {
    sendFile(res, path.join(ROOT, 'public/data/posts.json'), 'application/json')
    return
  }

  // 静态文件
  let dashDir = path.join(ROOT, 'src/dashboard')
  if (!fs.existsSync(path.join(dashDir, 'index.html'))) {
    dashDir = path.join(ROOT, 'public')
  }

  let filePath = path.join(dashDir, url === '/' ? 'index.html' : url)

  // 如果文件不存在，返回 dashboard 的 index.html（SPA）
  if (!fs.existsSync(filePath)) {
    filePath = path.join(dashDir, 'index.html')
  }

  sendFile(res, filePath)
})

server.listen(PORT, () => {
  console.log('\n' + '═'.repeat(50))
  console.log('🖥️  今日热点 - 管理后台')
  console.log('═'.repeat(50))
  console.log(`\n✅ 服务器已启动`)
  console.log(`📍 控制面板: http://localhost:${PORT}`)
  console.log(`📍 文章数据: http://localhost:${PORT}/data/posts.json`)
  console.log(`\n💡 按 Ctrl+C 停止\n`)

  exec(`open http://localhost:${PORT}`)
})

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 端口 ${PORT} 已被占用，请先关闭`)
  }
})
