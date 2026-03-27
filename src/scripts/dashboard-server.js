#!/usr/bin/env node
/**
 * 本地控制面板服务器
 * - 广告 ID 配置（本地存储，不上传代码）
 * - 一键构建 + 部署
 * - 内容生成
 * - 实时日志
 */
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn, exec } from 'child_process'
import url from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '../..')
const CONFIG_FILE = path.join(ROOT, '.ads-config.json')
const PORT = 4000

// ==================== 工具函数 ====================
function json(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(data))
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', d => body += d)
    req.on('end', () => {
      try { resolve(JSON.parse(body)) } catch { resolve({}) }
    })
  })
}

function run(cmd, args = [], opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: ROOT, ...opts })
    const logs = []
    child.stdout?.on('data', d => logs.push(d.toString()))
    child.stderr?.on('data', d => logs.push(d.toString()))
    child.on('close', code => resolve({ code, logs: logs.join('') }))
    child.on('error', err => resolve({ code: 1, logs: err.message }))
  })
}

// ==================== 广告配置 ====================
function loadAdsConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
    }
  } catch (e) {}
  return {
    enabled: false,
    baidu: { enabled: false, slotId: '', tongjiId: '' },
    tencent: { enabled: false, appId: '', posId: '' },
    bytedance: { enabled: false, appId: '', slotId: '' },
    google: { enabled: false, publisherId: '' },
  }
}

function saveAdsConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}

// 把广告配置注入到 public/data/ads.json（供前端读取）
function injectAdsConfig(config) {
  const publicDir = path.join(ROOT, 'public/data')
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })
  // 只写入启用状态和平台类型，不写入具体 ID（ID 通过构建时注入）
  const publicConfig = {
    enabled: config.enabled,
    platforms: {
      baidu: config.baidu?.enabled || false,
      tencent: config.tencent?.enabled || false,
      bytedance: config.bytedance?.enabled || false,
      google: config.google?.enabled || false,
    }
  }
  fs.writeFileSync(path.join(publicDir, 'ads.json'), JSON.stringify(publicConfig, null, 2))
}

// 生成 .env.local（Vite 构建时注入广告 ID）
function generateEnvFile(config) {
  const lines = [
    '# 自动生成 - 请勿手动编辑',
    `VITE_ADS_ENABLED=${config.enabled}`,
    `VITE_BAIDU_ENABLED=${config.baidu?.enabled || false}`,
    `VITE_BAIDU_SLOT_ID=${config.baidu?.slotId || ''}`,
    `VITE_BAIDU_TONGJI_ID=${config.baidu?.tongjiId || ''}`,
    `VITE_TENCENT_ENABLED=${config.tencent?.enabled || false}`,
    `VITE_TENCENT_APP_ID=${config.tencent?.appId || ''}`,
    `VITE_TENCENT_POS_ID=${config.tencent?.posId || ''}`,
    `VITE_BYTEDANCE_ENABLED=${config.bytedance?.enabled || false}`,
    `VITE_BYTEDANCE_APP_ID=${config.bytedance?.appId || ''}`,
    `VITE_BYTEDANCE_SLOT_ID=${config.bytedance?.slotId || ''}`,
    `VITE_GOOGLE_ENABLED=${config.google?.enabled || false}`,
    `VITE_GOOGLE_PUBLISHER_ID=${config.google?.publisherId || ''}`,
  ]
  fs.writeFileSync(path.join(ROOT, '.env.local'), lines.join('\n'))
}

// ==================== 部署流程 ====================
let deployLog = []
let deploying = false

async function runDeploy(onLog) {
  if (deploying) return { ok: false, msg: '正在部署中，请稍候' }
  deploying = true
  deployLog = []

  const log = (msg) => {
    deployLog.push({ time: new Date().toISOString(), msg })
    onLog?.(msg)
  }

  try {
    log('🔧 [1/4] 生成内容...')
    const gen = await run('node', ['src/scripts/generate.js'])
    log(gen.logs.split('\n').filter(l => l.trim()).slice(-3).join('\n'))

    log('🏗️  [2/4] 构建项目...')
    const build = await run('node', ['node_modules/.bin/vite', 'build'])
    if (build.code !== 0) throw new Error('构建失败:\n' + build.logs.slice(-500))
    log('✅ 构建成功')

    log('📦 [3/4] 提交代码...')
    const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    const commit = await run('git', ['add', '-A'])
    const commitMsg = await run('git', ['commit', '-m', `deploy: ${now} [auto]`])
    log(commitMsg.logs.trim() || '无新变更')

    log('🚀 [4/4] 推送到 GitHub...')
    const push = await run('git', ['push', 'origin', 'main'])
    if (push.code !== 0) throw new Error('推送失败:\n' + push.logs)
    log('✅ 推送成功，Vercel 将自动部署')
    log('🎉 部署完成！')

    return { ok: true }
  } catch (e) {
    log('❌ 错误: ' + e.message)
    return { ok: false, msg: e.message }
  } finally {
    deploying = false
  }
}

// ==================== HTTP 服务器 ====================
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true)
  const pathname = parsed.pathname

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    res.end()
    return
  }

  // API 路由
  if (pathname === '/api/ads/config' && req.method === 'GET') {
    json(res, loadAdsConfig())
    return
  }

  if (pathname === '/api/ads/config' && req.method === 'POST') {
    const body = await readBody(req)
    saveAdsConfig(body)
    generateEnvFile(body)
    injectAdsConfig(body)
    json(res, { ok: true, msg: '配置已保存，下次部署时生效' })
    return
  }

  if (pathname === '/api/deploy' && req.method === 'POST') {
    // 异步部署，立即返回
    runDeploy()
    json(res, { ok: true, msg: '部署已启动' })
    return
  }

  if (pathname === '/api/deploy/status' && req.method === 'GET') {
    json(res, { deploying, logs: deployLog.slice(-50) })
    return
  }

  if (pathname === '/api/generate' && req.method === 'POST') {
    const result = await run('node', ['src/scripts/generate.js'])
    json(res, { ok: result.code === 0, logs: result.logs })
    return
  }

  if (pathname === '/api/stats' && req.method === 'GET') {
    // 读取本地统计数据
    const statsFile = path.join(ROOT, '.stats.json')
    let stats = { totalViews: 0, todayViews: 0, totalRevenue: 0, todayRevenue: 0 }
    try {
      if (fs.existsSync(statsFile)) stats = JSON.parse(fs.readFileSync(statsFile, 'utf-8'))
    } catch (e) {}
    json(res, stats)
    return
  }

  // 前端页面
  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(getDashboardHTML())
    return
  }

  res.writeHead(404)
  res.end('Not Found')
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🎛️  本地控制面板已启动`)
  console.log(`📍 地址: http://localhost:${PORT}`)
  console.log(`🔒 仅本地访问，外网无法访问`)
  console.log(`\n按 Ctrl+C 停止\n`)
})

// ==================== 控制面板 HTML ====================
function getDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>本地控制面板</title>
<style>
  :root {
    --bg: #080810;
    --card: #0f0f1a;
    --border: #1a1a2e;
    --accent: #00d4ff;
    --text: #e0e0ec;
    --muted: #606080;
    --success: #00ff88;
    --danger: #ff4466;
    --warn: #ffaa00;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); line-height: 1.5; }
  .container { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
  header { background: var(--card); border-bottom: 1px solid var(--border); padding: 16px 0; margin-bottom: 32px; }
  header .inner { max-width: 960px; margin: 0 auto; padding: 0 16px; display: flex; justify-content: space-between; align-items: center; }
  .logo { font-size: 18px; font-weight: 700; color: var(--accent); }
  .badge { background: rgba(0,255,136,0.1); border: 1px solid var(--success); color: var(--success); font-size: 11px; padding: 3px 10px; border-radius: 12px; }
  .tabs { display: flex; gap: 4px; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 0; }
  .tab { background: transparent; border: none; color: var(--muted); padding: 10px 20px; cursor: pointer; font-size: 14px; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.2s; }
  .tab.active { color: var(--accent); border-color: var(--accent); }
  .tab:hover { color: var(--text); }
  .panel { display: none; }
  .panel.active { display: block; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 20px; margin-bottom: 16px; }
  .card h3 { font-size: 14px; color: var(--accent); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
  .form-row { margin-bottom: 12px; }
  .form-row label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 4px; }
  .form-row input { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 9px 12px; color: var(--text); font-size: 13px; outline: none; transition: border-color 0.2s; }
  .form-row input:focus { border-color: var(--accent); }
  .form-row input::placeholder { color: var(--muted); }
  .toggle { display: flex; align-items: center; gap: 10px; cursor: pointer; margin-bottom: 16px; }
  .toggle input { width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent); }
  .toggle span { font-size: 14px; font-weight: 500; }
  .btn { border: none; border-radius: 6px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-primary { background: var(--accent); color: #000; }
  .btn-primary:hover { opacity: 0.85; }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-danger { background: var(--danger); color: #fff; }
  .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text); }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
  .btn-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px; }
  .stat-card { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 16px; text-align: center; }
  .stat-card .icon { font-size: 24px; margin-bottom: 8px; }
  .stat-card .label { font-size: 11px; color: var(--muted); margin-bottom: 6px; }
  .stat-card .value { font-size: 22px; font-weight: 700; color: var(--accent); }
  .log-box { background: #000; border: 1px solid var(--border); border-radius: 6px; padding: 12px; font-family: monospace; font-size: 12px; line-height: 1.6; max-height: 300px; overflow-y: auto; color: #aaffaa; white-space: pre-wrap; }
  .log-box .err { color: #ff6666; }
  .log-box .warn { color: #ffaa44; }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }
  .status-dot.ok { background: var(--success); }
  .status-dot.err { background: var(--danger); }
  .status-dot.running { background: var(--warn); animation: pulse 1s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  .platform-section { border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 12px; }
  .platform-section.enabled { border-color: rgba(0,212,255,0.3); background: rgba(0,212,255,0.03); }
  .platform-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .platform-name { font-size: 14px; font-weight: 600; }
  .msg { padding: 8px 12px; border-radius: 6px; font-size: 12px; margin-top: 8px; }
  .msg.ok { background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.3); color: var(--success); }
  .msg.err { background: rgba(255,68,102,0.1); border: 1px solid rgba(255,68,102,0.3); color: var(--danger); }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 8px 0; color: var(--accent); font-size: 12px; border-bottom: 1px solid var(--border); }
  td { padding: 10px 0; border-bottom: 1px solid var(--border); }
  tr:last-child td { border: none; }
</style>
</head>
<body>
<header>
  <div class="inner">
    <div class="logo">🎛️ 本地控制面板</div>
    <span class="badge">🔒 仅本地访问</span>
  </div>
</header>

<div class="container">
  <div class="tabs">
    <button class="tab active" onclick="switchTab('stats')">📊 统计</button>
    <button class="tab" onclick="switchTab('ads')">💰 广告配置</button>
    <button class="tab" onclick="switchTab('deploy')">🚀 部署</button>
    <button class="tab" onclick="switchTab('content')">📝 内容</button>
  </div>

  <!-- 统计面板 -->
  <div id="panel-stats" class="panel active">
    <div class="stat-grid" id="stat-grid">
      <div class="stat-card"><div class="icon">👁️</div><div class="label">总浏览量</div><div class="value" id="s-views">-</div></div>
      <div class="stat-card"><div class="icon">📈</div><div class="label">今日浏览</div><div class="value" id="s-today">-</div></div>
      <div class="stat-card"><div class="icon">💰</div><div class="label">总收入</div><div class="value" id="s-revenue">-</div></div>
      <div class="stat-card"><div class="icon">💵</div><div class="label">今日收入</div><div class="value" id="s-today-rev">-</div></div>
    </div>

    <div class="card">
      <h3>🎯 平台分布</h3>
      <table>
        <thead><tr><th>平台</th><th>浏览量</th><th>收入</th><th>占比</th></tr></thead>
        <tbody id="platform-table"></tbody>
      </table>
    </div>

    <div class="card">
      <h3>ℹ️ 说明</h3>
      <p style="font-size:12px;color:var(--muted);line-height:1.8">
        统计数据来自本地 <code>.stats.json</code> 文件。<br>
        生产环境可通过各广告平台 API 同步真实数据。<br>
        数据每 30 秒自动刷新。
      </p>
    </div>
  </div>

  <!-- 广告配置面板 -->
  <div id="panel-ads" class="panel">
    <div class="card">
      <h3>⚙️ 全局设置</h3>
      <label class="toggle">
        <input type="checkbox" id="ads-enabled">
        <span id="ads-enabled-label">广告已禁用</span>
      </label>
      <p style="font-size:12px;color:var(--muted)">
        广告 ID 保存在本地 <code>.ads-config.json</code>，不会上传到代码仓库。<br>
        保存配置后，点击"部署"标签页一键发布到线上。
      </p>
    </div>

    <!-- 百度 -->
    <div class="platform-section" id="section-baidu">
      <div class="platform-header">
        <span class="platform-name">🔍 百度广告联盟</span>
        <label class="toggle" style="margin:0">
          <input type="checkbox" id="baidu-enabled" onchange="toggleSection('baidu')">
          <span style="font-size:12px">启用</span>
        </label>
      </div>
      <div id="fields-baidu">
        <div class="form-row">
          <label>广告位 ID (slotId) *</label>
          <input type="text" id="baidu-slotId" placeholder="从百度广告联盟后台获取">
        </div>
        <div class="form-row">
          <label>百度统计 ID（可选）</label>
          <input type="text" id="baidu-tongjiId" placeholder="从百度统计后台获取">
        </div>
        <p style="font-size:11px;color:var(--muted)">申请地址：<a href="https://union.baidu.com/" target="_blank" style="color:var(--accent)">union.baidu.com</a></p>
      </div>
    </div>

    <!-- 腾讯 -->
    <div class="platform-section" id="section-tencent">
      <div class="platform-header">
        <span class="platform-name">🐧 腾讯广告</span>
        <label class="toggle" style="margin:0">
          <input type="checkbox" id="tencent-enabled" onchange="toggleSection('tencent')">
          <span style="font-size:12px">启用</span>
        </label>
      </div>
      <div id="fields-tencent">
        <div class="form-row">
          <label>App ID *</label>
          <input type="text" id="tencent-appId" placeholder="从腾讯广告后台获取">
        </div>
        <div class="form-row">
          <label>广告位 ID (posId) *</label>
          <input type="text" id="tencent-posId" placeholder="从腾讯广告后台获取">
        </div>
        <p style="font-size:11px;color:var(--muted)">申请地址：<a href="https://e.qq.com/ads/" target="_blank" style="color:var(--accent)">e.qq.com/ads</a></p>
      </div>
    </div>

    <!-- 穿山甲 -->
    <div class="platform-section" id="section-bytedance">
      <div class="platform-header">
        <span class="platform-name">🎵 字节穿山甲</span>
        <label class="toggle" style="margin:0">
          <input type="checkbox" id="bytedance-enabled" onchange="toggleSection('bytedance')">
          <span style="font-size:12px">启用</span>
        </label>
      </div>
      <div id="fields-bytedance">
        <div class="form-row">
          <label>App ID *</label>
          <input type="text" id="bytedance-appId" placeholder="从穿山甲后台获取">
        </div>
        <div class="form-row">
          <label>广告位 ID (slotId) *</label>
          <input type="text" id="bytedance-slotId" placeholder="从穿山甲后台获取">
        </div>
        <p style="font-size:11px;color:var(--muted)">申请地址：<a href="https://www.pangle.cn/" target="_blank" style="color:var(--accent)">pangle.cn</a></p>
      </div>
    </div>

    <!-- Google -->
    <div class="platform-section" id="section-google">
      <div class="platform-header">
        <span class="platform-name">🔵 Google AdSense</span>
        <label class="toggle" style="margin:0">
          <input type="checkbox" id="google-enabled" onchange="toggleSection('google')">
          <span style="font-size:12px">启用</span>
        </label>
      </div>
      <div id="fields-google">
        <div class="form-row">
          <label>发布商 ID (Publisher ID) *</label>
          <input type="text" id="google-publisherId" placeholder="ca-pub-xxxxxxxxxx">
        </div>
        <p style="font-size:11px;color:var(--muted)">申请地址：<a href="https://adsense.google.com/" target="_blank" style="color:var(--accent)">adsense.google.com</a></p>
      </div>
    </div>

    <div class="btn-row" style="margin-top:20px">
      <button class="btn btn-primary" onclick="saveAdsConfig()">💾 保存配置</button>
      <button class="btn btn-ghost" onclick="switchTab('deploy')">🚀 去部署</button>
      <span id="save-msg"></span>
    </div>
  </div>

  <!-- 部署面板 -->
  <div id="panel-deploy" class="panel">
    <div class="card">
      <h3>🚀 一键部署</h3>
      <p style="font-size:13px;color:var(--muted);margin-bottom:16px;line-height:1.8">
        部署流程：生成内容 → 构建项目 → 提交代码 → 推送 GitHub → Vercel 自动部署
      </p>
      <div class="btn-row">
        <button class="btn btn-primary" id="deploy-btn" onclick="startDeploy()">🚀 开始部署</button>
        <span id="deploy-status"></span>
      </div>
    </div>

    <div class="card">
      <h3>📋 部署日志</h3>
      <div class="log-box" id="deploy-log">等待部署...</div>
    </div>

    <div class="card">
      <h3>🔗 快速链接</h3>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <a href="https://seo-content-site.vercel.app" target="_blank" class="btn btn-ghost">🌐 查看网站</a>
        <a href="https://github.com/mubaiqaq666-png/seo-content-site/actions" target="_blank" class="btn btn-ghost">⚙️ GitHub Actions</a>
        <a href="https://vercel.com/mubais-projects-55754664/seo-content-site" target="_blank" class="btn btn-ghost">▲ Vercel 面板</a>
      </div>
    </div>
  </div>

  <!-- 内容面板 -->
  <div id="panel-content" class="panel">
    <div class="card">
      <h3>📝 内容管理</h3>
      <div class="btn-row" style="margin-bottom:16px">
        <button class="btn btn-primary" onclick="generateContent()">🔄 立即抓取更新</button>
        <span id="gen-status"></span>
      </div>
      <div class="log-box" id="gen-log" style="display:none"></div>
    </div>

    <div class="card">
      <h3>📊 内容统计</h3>
      <div id="content-stats" style="font-size:13px;color:var(--muted)">加载中...</div>
    </div>
  </div>
</div>

<script>
// ==================== 标签页切换 ====================
function switchTab(id) {
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', ['stats','ads','deploy','content'][i] === id)
  })
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'))
  document.getElementById('panel-' + id).classList.add('active')
  if (id === 'stats') loadStats()
  if (id === 'content') loadContentStats()
}

// ==================== 广告配置 ====================
async function loadAdsConfig() {
  const r = await fetch('/api/ads/config')
  const cfg = await r.json()
  
  document.getElementById('ads-enabled').checked = cfg.enabled
  updateEnabledLabel(cfg.enabled)
  
  const platforms = ['baidu', 'tencent', 'bytedance', 'google']
  platforms.forEach(p => {
    const enabled = cfg[p]?.enabled || false
    document.getElementById(p + '-enabled').checked = enabled
    toggleSection(p, enabled)
  })
  
  if (cfg.baidu) {
    document.getElementById('baidu-slotId').value = cfg.baidu.slotId || ''
    document.getElementById('baidu-tongjiId').value = cfg.baidu.tongjiId || ''
  }
  if (cfg.tencent) {
    document.getElementById('tencent-appId').value = cfg.tencent.appId || ''
    document.getElementById('tencent-posId').value = cfg.tencent.posId || ''
  }
  if (cfg.bytedance) {
    document.getElementById('bytedance-appId').value = cfg.bytedance.appId || ''
    document.getElementById('bytedance-slotId').value = cfg.bytedance.slotId || ''
  }
  if (cfg.google) {
    document.getElementById('google-publisherId').value = cfg.google.publisherId || ''
  }
}

function updateEnabledLabel(enabled) {
  document.getElementById('ads-enabled-label').textContent = enabled ? '✅ 广告已启用' : '❌ 广告已禁用'
}

document.getElementById('ads-enabled').addEventListener('change', function() {
  updateEnabledLabel(this.checked)
})

function toggleSection(platform, force) {
  const enabled = force !== undefined ? force : document.getElementById(platform + '-enabled').checked
  const section = document.getElementById('section-' + platform)
  const fields = document.getElementById('fields-' + platform)
  section.classList.toggle('enabled', enabled)
  fields.style.display = enabled ? 'block' : 'none'
}

async function saveAdsConfig() {
  const config = {
    enabled: document.getElementById('ads-enabled').checked,
    baidu: {
      enabled: document.getElementById('baidu-enabled').checked,
      slotId: document.getElementById('baidu-slotId').value.trim(),
      tongjiId: document.getElementById('baidu-tongjiId').value.trim(),
    },
    tencent: {
      enabled: document.getElementById('tencent-enabled').checked,
      appId: document.getElementById('tencent-appId').value.trim(),
      posId: document.getElementById('tencent-posId').value.trim(),
    },
    bytedance: {
      enabled: document.getElementById('bytedance-enabled').checked,
      appId: document.getElementById('bytedance-appId').value.trim(),
      slotId: document.getElementById('bytedance-slotId').value.trim(),
    },
    google: {
      enabled: document.getElementById('google-enabled').checked,
      publisherId: document.getElementById('google-publisherId').value.trim(),
    }
  }
  
  const r = await fetch('/api/ads/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  })
  const result = await r.json()
  
  const msg = document.getElementById('save-msg')
  msg.className = 'msg ' + (result.ok ? 'ok' : 'err')
  msg.textContent = result.ok ? '✅ ' + result.msg : '❌ ' + result.msg
  setTimeout(() => msg.textContent = '', 4000)
}

// ==================== 部署 ====================
let deployPolling = null

async function startDeploy() {
  const btn = document.getElementById('deploy-btn')
  btn.disabled = true
  btn.textContent = '⏳ 部署中...'
  document.getElementById('deploy-log').textContent = '启动部署...'
  
  await fetch('/api/deploy', { method: 'POST' })
  
  deployPolling = setInterval(pollDeployStatus, 1500)
}

async function pollDeployStatus() {
  const r = await fetch('/api/deploy/status')
  const data = await r.json()
  
  const logEl = document.getElementById('deploy-log')
  logEl.textContent = data.logs.map(l => l.msg).join('\n')
  logEl.scrollTop = logEl.scrollHeight
  
  const statusEl = document.getElementById('deploy-status')
  if (data.deploying) {
    statusEl.innerHTML = '<span class="status-dot running"></span>部署中...'
  } else {
    const lastLog = data.logs[data.logs.length - 1]?.msg || ''
    const ok = lastLog.includes('完成') || lastLog.includes('成功')
    statusEl.innerHTML = ok
      ? '<span class="status-dot ok"></span>部署完成'
      : '<span class="status-dot err"></span>部署结束'
    
    const btn = document.getElementById('deploy-btn')
    btn.disabled = false
    btn.textContent = '🚀 重新部署'
    
    clearInterval(deployPolling)
  }
}

// ==================== 统计 ====================
async function loadStats() {
  const r = await fetch('/api/stats')
  const stats = await r.json()
  
  document.getElementById('s-views').textContent = (stats.totalViews || 0).toLocaleString()
  document.getElementById('s-today').textContent = (stats.todayViews || 0).toLocaleString()
  document.getElementById('s-revenue').textContent = '¥' + (stats.totalRevenue || 0).toFixed(2)
  document.getElementById('s-today-rev').textContent = '¥' + (stats.todayRevenue || 0).toFixed(2)
  
  const platforms = [
    { key: 'baidu', name: '🔍 百度' },
    { key: 'tencent', name: '🐧 腾讯' },
    { key: 'bytedance', name: '🎵 穿山甲' },
    { key: 'google', name: '🔵 Google' },
  ]
  const tbody = document.getElementById('platform-table')
  const platformStats = stats.platformStats || {}
  const totalRev = Object.values(platformStats).reduce((a, b) => a + (b.revenue || 0), 0)
  
  tbody.innerHTML = platforms.map(({ key, name }) => {
    const s = platformStats[key] || { views: 0, revenue: 0 }
    const pct = totalRev > 0 ? ((s.revenue / totalRev) * 100).toFixed(1) : '0.0'
    return \`<tr>
      <td>\${name}</td>
      <td>\${(s.views || 0).toLocaleString()}</td>
      <td style="color:var(--accent)">¥\${(s.revenue || 0).toFixed(2)}</td>
      <td style="color:var(--muted)">\${pct}%</td>
    </tr>\`
  }).join('')
}

// ==================== 内容 ====================
async function generateContent() {
  const btn = event.target
  btn.disabled = true
  btn.textContent = '⏳ 抓取中...'
  
  const logEl = document.getElementById('gen-log')
  logEl.style.display = 'block'
  logEl.textContent = '正在抓取...'
  
  const statusEl = document.getElementById('gen-status')
  statusEl.textContent = ''
  
  const r = await fetch('/api/generate', { method: 'POST' })
  const result = await r.json()
  
  logEl.textContent = result.logs
  logEl.scrollTop = logEl.scrollHeight
  
  statusEl.className = 'msg ' + (result.ok ? 'ok' : 'err')
  statusEl.textContent = result.ok ? '✅ 抓取完成' : '❌ 抓取失败'
  
  btn.disabled = false
  btn.textContent = '🔄 立即抓取更新'
  
  loadContentStats()
}

async function loadContentStats() {
  try {
    const r = await fetch('/data/posts.json')
    const data = await r.json()
    const posts = data.posts || []
    
    const cats = {}
    posts.forEach(p => cats[p.category] = (cats[p.category] || 0) + 1)
    
    const words = posts.map(p => p.content?.length || 0)
    const avg = words.length ? Math.round(words.reduce((a,b) => a+b, 0) / words.length) : 0
    
    document.getElementById('content-stats').innerHTML = \`
      <p style="margin-bottom:8px">📚 总文章数：<strong style="color:var(--accent)">\${posts.length} 篇</strong></p>
      <p style="margin-bottom:8px">📏 平均字数：<strong style="color:var(--accent)">\${avg} 字</strong></p>
      <p style="margin-bottom:12px">🏷️ 分类分布：</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        \${Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([cat,count]) =>
          \`<span style="background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.2);border-radius:12px;padding:3px 10px;font-size:12px">\${cat}: \${count}</span>\`
        ).join('')}
      </div>
    \`
  } catch (e) {
    document.getElementById('content-stats').textContent = '无法加载内容统计'
  }
}

// ==================== 初始化 ====================
loadAdsConfig()
loadStats()
setInterval(loadStats, 30000)
</script>
</body>
</html>`
}
