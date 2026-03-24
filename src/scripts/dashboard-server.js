#!/usr/bin/env node

/**
 * 简单的静态文件服务器
 * 用于运行控制面板
 */

import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = 3001

// 找到 dashboard 目录
let dashboardDir = path.join(__dirname, '../dashboard')
if (!fs.existsSync(path.join(dashboardDir, 'index.html'))) {
  // 尝试从项目根目录查找
  dashboardDir = path.join(__dirname, '../../src/dashboard')
}
if (!fs.existsSync(path.join(dashboardDir, 'index.html'))) {
  // 尝试从 workspace 查找
  dashboardDir = path.join(process.env.HOME, '.qclaw/workspace/seo-content-site/src/dashboard')
}

console.log('📁 Dashboard directory:', dashboardDir)

const server = http.createServer((req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // 默认路由到 index.html
  let filePath = req.url === '/' ? '/index.html' : req.url
  filePath = path.join(dashboardDir, filePath)

  // 安全检查：防止目录遍历
  if (!filePath.startsWith(dashboardDir)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  // 读取文件
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // 文件不存在，尝试返回 index.html
        fs.readFile(path.join(dashboardDir, 'index.html'), (err, data) => {
          if (err) {
            res.writeHead(404)
            res.end('Not Found')
            return
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
          res.end(data)
        })
      } else {
        res.writeHead(500)
        res.end('Server Error')
      }
      return
    }

    // 根据文件扩展名设置 Content-Type
    const ext = path.extname(filePath).toLowerCase()
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.ico': 'image/x-icon'
    }

    const contentType = contentTypes[ext] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(data)
  })
})

server.listen(PORT, () => {
  console.log('\n' + '='.repeat(50))
  console.log('🖥️  SEO内容站 - 控制面板')
  console.log('='.repeat(50))
  console.log(`\n✅ 服务器已启动`)
  console.log(`📍 访问地址: http://localhost:${PORT}`)
  console.log(`\n💡 按 Ctrl+C 停止服务\n`)
  
  // 自动打开浏览器
  const openCmd = process.platform === 'darwin' ? 'open' : 'xdg-open'
  exec(`${openCmd} http://localhost:${PORT}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 端口 ${PORT} 已被占用`)
    console.error(`💡 请先关闭占用该端口的程序`)
  } else {
    console.error('❌ 服务器错误:', err)
  }
  process.exit(1)
})
