#!/usr/bin/env node

import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec, spawn } from 'child_process'
import url from 'url'

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
}

function sendJSON(res, data, status) {
  status = status || 200
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify(data))
}

function sendFile(res, filePath, contentType) {
  contentType = contentType || 'text/plain'
  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
      return
    }
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(data)
  })
}

function runScript(scriptPath) {
  return new Promise(function(resolve, reject) {
    var logs = []
    var child = spawn('node', [scriptPath], { cwd: ROOT })
    child.stdout.on('data', function(d) { logs.push(d.toString()) })
    child.stderr.on('data', function(d) { logs.push(d.toString()) })
    child.on('close', function(code) { resolve({ code: code, logs: logs.join('') }) })
    child.on('error', reject)
  })
}

function runGitPush() {
  return new Promise(function(resolve, reject) {
    exec('git add . && git commit -m "daily: update articles [auto]" && git push origin main', { cwd: ROOT }, function(err, stdout, stderr) {
      if (err) {
        if (err.message.includes('nothing to commit')) {
          resolve({ success: true, pushed: false })
        } else {
          reject(new Error('Git push failed'))
        }
      } else {
        resolve({ success: true, pushed: true })
      }
    })
  })
}

var server = http.createServer(function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return }

  var pathname = url.parse(req.url).pathname

  // API: GET /api/posts 或 /data/posts.json
  if (pathname === '/api/posts' || pathname === '/data/posts.json') {
    sendFile(res, path.join(ROOT, 'public/data/posts.json'), 'application/json')
    return
  }

  // API: POST /api/generate
  if (pathname === '/api/generate' && req.method === 'POST') {
    var body = ''
    req.on('data', function(chunk) { body += chunk })
    req.on('end', function() {
      console.log('[API] 一键抓取生成请求')
      ;(async function() {
        try {
          // 1. 抓取话题
          console.log('[1/3] 抓取热门话题...')
          await runScript(path.join(ROOT, 'src/scripts/fetchHotTopics.js'))

          // 2. 生成文章
          console.log('[2/3] 生成文章...')
          await runScript(path.join(ROOT, 'src/scripts/dailyGenerate.js'))

          // 3. 推送
          console.log('[3/3] 推送到 GitHub...')
          await runGitPush()

          // 返回结果
          var posts = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/posts.json'), 'utf-8'))
          console.log('[OK] 完成，共 ' + posts.posts.length + ' 篇文章')
          sendJSON(res, { success: true, count: posts.posts.length })
        } catch(e) {
          console.error('[ERROR]', e.message)
          sendJSON(res, { success: false, error: e.message }, 500)
        }
      })()
    })
    return
  }

  // API: GET /api/stats
  if (pathname === '/api/stats') {
    try {
      var posts = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/posts.json'), 'utf-8'))
      sendJSON(res, { total: posts.posts.length })
    } catch(e) {
      sendJSON(res, { total: 0 })
    }
    return
  }

  // 静态文件
  var dashDir = path.join(ROOT, 'src/dashboard')
  if (!fs.existsSync(path.join(dashDir, 'index.html'))) {
    dashDir = path.join(ROOT, 'public')
  }

  var filePath = path.join(dashDir, pathname === '/' ? 'index.html' : pathname)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(dashDir, 'index.html')
  }

  var ext = path.extname(filePath).toLowerCase()
  sendFile(res, filePath, TYPES[ext] || 'text/plain')
})

server.listen(PORT, function() {
  console.log('')
  console.log('═'.repeat(50))
  console.log('  🖥️  今日热点 - 管理后台')
  console.log('═'.repeat(50))
  console.log('  ✅ http://localhost:' + PORT)
  console.log('  🔥 POST http://localhost:' + PORT + '/api/generate')
  console.log('')

  exec('open http://localhost:' + PORT)
})

server.on('error', function(err) {
  if (err.code === 'EADDRINUSE') {
    console.error('❌ 端口 ' + PORT + ' 已被占用')
  }
})
