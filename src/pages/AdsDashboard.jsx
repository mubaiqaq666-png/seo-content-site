import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

const PLATFORMS = {
  baidu: { name: '百度广告联盟', url: 'https://union.baidu.com/', icon: '🔍' },
  tencent: { name: '腾讯广告', url: 'https://e.qq.com/ads/', icon: '🐧' },
  bytedance: { name: '字节穿山甲', url: 'https://www.pangle.cn/', icon: '🎵' },
  google: { name: 'Google AdSense', url: 'https://adsense.google.com/', icon: '🔵' },
}

const SLOTS = {
  top: '顶部横幅 (728x90)',
  middle: '文章中部 (300x250)',
  bottom: '底部广告 (728x90)',
  sidebar: '侧边栏 (300x250)',
}

// 简单的密码验证（生产环境应使用更强的认证）
const ADMIN_PASSWORD = 'admin@2026'

function LoginPage({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('adsAdminToken', 'authenticated')
      onLogin()
    } else {
      setError('密码错误，请重试')
      setPassword('')
    }
  }

  return (
    <Layout>
      <div style={{
        maxWidth: 400,
        margin: '60px auto',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 32,
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>🔐 广告管理后台</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 13 }}>
          请输入管理员密码以访问广告配置
        </p>

        <div style={{ marginBottom: 16 }}>
          <input
            type="password"
            placeholder="输入管理员密码"
            value={password}
            onChange={e => {
              setPassword(e.target.value)
              setError('')
            }}
            onKeyPress={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%',
              background: 'var(--bg)',
              border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
              borderRadius: 6,
              padding: '12px 16px',
              color: 'var(--text)',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {error && (
          <p style={{ color: '#ff4466', fontSize: 12, marginBottom: 16 }}>
            ❌ {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            background: 'var(--accent)',
            color: '#000',
            border: 'none',
            borderRadius: 6,
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.target.style.opacity = '0.8'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          🔓 登录
        </button>

        <div style={{
          marginTop: 24,
          padding: 16,
          background: 'rgba(0,212,255,0.05)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 6,
          fontSize: 11,
          color: 'var(--muted)',
          lineHeight: 1.6
        }}>
          <p style={{ margin: 0, marginBottom: 8 }}>
            <strong>💡 提示：</strong>
          </p>
          <p style={{ margin: 0, marginBottom: 4 }}>
            默认密码：<code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: 3 }}>admin@2026</code>
          </p>
          <p style={{ margin: 0 }}>
            生产环境建议修改密码或使用更强的认证方式
          </p>
        </div>
      </div>
    </Layout>
  )
}

function DashboardContent() {
  const [config, setConfig] = useState({
    enabled: true,
    baidu: { enabled: false, slotId: '', tongjiId: '' },
    tencent: { enabled: false, appId: '', posId: '' },
    bytedance: { enabled: false, appId: '', slotId: '' },
    google: { enabled: false, publisherId: '' },
  })
  
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('baidu')

  // 从 localStorage 加载配置
  useEffect(() => {
    const stored = localStorage.getItem('adsConfig')
    if (stored) {
      try {
        setConfig(JSON.parse(stored))
      } catch (e) {}
    }
  }, [])

  // 保存配置
  const handleSave = () => {
    localStorage.setItem('adsConfig', JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    
    // 通知应用重新加载广告配置
    window.dispatchEvent(new CustomEvent('adsConfigUpdated', { detail: config }))
  }

  const updatePlatform = (platform, field, value) => {
    setConfig(prev => ({
      ...prev,
      [platform]: { ...prev[platform], [field]: value }
    }))
  }

  const togglePlatform = (platform) => {
    setConfig(prev => ({
      ...prev,
      [platform]: { ...prev[platform], enabled: !prev[platform].enabled }
    }))
  }

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>📊 广告管理后台</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
          配置各大广告平台，填写 token 和 ID 即可自动对接
        </p>

        {/* 全局开关 */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 16,
          marginBottom: 24
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={config.enabled}
              onChange={e => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
              style={{ width: 20, height: 20 }}
            />
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              {config.enabled ? '✅ 广告已启用' : '❌ 广告已禁用'}
            </span>
          </label>
        </div>

        {/* 平台标签 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {Object.entries(PLATFORMS).map(([key, { name, icon }]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                background: activeTab === key ? 'var(--accent)' : 'var(--card)',
                border: `1px solid ${activeTab === key ? 'var(--accent)' : 'var(--border)'}`,
                color: activeTab === key ? '#000' : 'var(--text)',
                borderRadius: 6,
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              {icon} {name}
            </button>
          ))}
        </div>

        {/* 平台配置面板 */}
        {Object.entries(PLATFORMS).map(([key, { name, url }]) => (
          activeTab === key && (
            <div key={key} style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 24,
              marginBottom: 24
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, margin: 0 }}>{name}</h2>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    checked={config[key].enabled}
                    onChange={() => togglePlatform(key)}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontSize: 13 }}>启用</span>
                </label>
              </div>

              {config[key].enabled && (
                <div style={{ display: 'grid', gap: 16 }}>
                  {/* 百度 */}
                  {key === 'baidu' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--accent)' }}>
                          百度统计 ID
                        </label>
                        <input
                          type="text"
                          placeholder="从百度统计后台获取"
                          value={config.baidu.tongjiId}
                          onChange={e => updatePlatform('baidu', 'tongjiId', e.target.value)}
                          style={{
                            width: '100%',
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            padding: '10px 12px',
                            color: 'var(--text)',
                            fontSize: 13,
                            outline: 'none'
                          }}
                        />
                        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                          用于数据分析，非广告必需
                        </p>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--accent)' }}>
                          广告位 ID (slotId) *
                        </label>
                        <input
                          type="text"
                          placeholder="从百度广告联盟后台获取"
                          value={config.baidu.slotId}
                          onChange={e => updatePlatform('baidu', 'slotId', e.target.value)}
                          style={{
                            width: '100%',
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            padding: '10px 12px',
                            color: 'var(--text)',
                            fontSize: 13,
                            outline: 'none'
                          }}
                        />
                        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                          必填项，广告才能正常显示
                        </p>
                      </div>
                    </>
                  )}

                  {/* 腾讯 */}
                  {key === 'tencent' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--accent)' }}>
                          App ID *
                        </label>
                        <input
                          type="text"
                          placeholder="从腾讯广告后台获取"
                          value={config.tencent.appId}
                          onChange={e => updatePlatform('tencent', 'appId', e.target.value)}
                          style={{
                            width: '100%',
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            padding: '10px 12px',
                            color: 'var(--text)',
                            fontSize: 13,
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--accent)' }}>
                          广告位 ID (posId) *
                        </label>
                        <input
                          type="text"
                          placeholder="从腾讯广告后台获取"
                          value={config.tencent.posId}
                          onChange={e => updatePlatform('tencent', 'posId', e.target.value)}
                          style={{
                            width: '100%',
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            padding: '10px 12px',
                            color: 'var(--text)',
                            fontSize: 13,
                            outline: 'none'
                          }}
                        />
                      </div>
                    </>
                  )}

                  {/* 字节穿山甲 */}
                  {key === 'bytedance' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--accent)' }}>
                          App ID *
                        </label>
                        <input
                          type="text"
                          placeholder="从穿山甲后台获取"
                          value={config.bytedance.appId}
                          onChange={e => updatePlatform('bytedance', 'appId', e.target.value)}
                          style={{
                            width: '100%',
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            padding: '10px 12px',
                            color: 'var(--text)',
                            fontSize: 13,
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--accent)' }}>
                          广告位 ID (slotId) *
                        </label>
                        <input
                          type="text"
                          placeholder="从穿山甲后台获取"
                          value={config.bytedance.slotId}
                          onChange={e => updatePlatform('bytedance', 'slotId', e.target.value)}
                          style={{
                            width: '100%',
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            padding: '10px 12px',
                            color: 'var(--text)',
                            fontSize: 13,
                            outline: 'none'
                          }}
                        />
                      </div>
                    </>
                  )}

                  {/* Google AdSense */}
                  {key === 'google' && (
                    <div>
                      <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--accent)' }}>
                        发布商 ID (Publisher ID) *
                      </label>
                      <input
                        type="text"
                        placeholder="ca-pub-xxxxxxxxxx"
                        value={config.google.publisherId}
                        onChange={e => updatePlatform('google', 'publisherId', e.target.value)}
                        style={{
                          width: '100%',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          padding: '10px 12px',
                          color: 'var(--text)',
                          fontSize: 13,
                          outline: 'none'
                        }}
                      />
                      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                        从 AdSense 账户获取，格式：ca-pub-xxxxxxxxxx
                      </p>
                    </div>
                  )}

                  {/* 帮助链接 */}
                  <div style={{
                    background: 'rgba(0,212,255,0.05)',
                    border: '1px solid rgba(0,212,255,0.2)',
                    borderRadius: 6,
                    padding: 12,
                    marginTop: 12
                  }}>
                    <p style={{ fontSize: 12, margin: 0, marginBottom: 8 }}>
                      📖 <strong>获取 ID 步骤：</strong>
                    </p>
                    <ol style={{ fontSize: 11, margin: 0, paddingLeft: 20, color: 'var(--muted)' }}>
                      <li>访问 <a href={url} target="_blank" rel="noopener noreferrer">{name}</a></li>
                      <li>登录账户，进入后台管理</li>
                      <li>找到"广告位"或"应用"设置</li>
                      <li>复制相应的 ID 粘贴到上方输入框</li>
                    </ol>
                  </div>
                </div>
              )}

              {!config[key].enabled && (
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
                  此平台已禁用，启用后可配置
                </p>
              )}
            </div>
          )
        ))}

        {/* 保存按钮 */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <button
            onClick={handleSave}
            style={{
              background: 'var(--accent)',
              color: '#000',
              border: 'none',
              borderRadius: 6,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={e => e.target.style.opacity = '0.8'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            💾 保存配置
          </button>
          {saved && (
            <span style={{ color: 'var(--accent)', fontSize: 13, display: 'flex', alignItems: 'center' }}>
              ✅ 配置已保存
            </span>
          )}
        </div>

        {/* 说明 */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 16,
          marginBottom: 24
        }}>
          <h3 style={{ fontSize: 14, marginTop: 0, marginBottom: 12 }}>📝 使用说明</h3>
          <ul style={{ fontSize: 12, color: 'var(--muted)', margin: 0, paddingLeft: 20 }}>
            <li>配置保存在浏览器本地存储，刷新页面不会丢失</li>
            <li>启用多个平台时，系统会根据用户地区自动选择最合适的广告源</li>
            <li>国内用户优先显示百度/腾讯/穿山甲广告</li>
            <li>海外用户优先显示 Google AdSense 广告</li>
            <li>所有 ID 都是必填项，缺少任何一个都会导致广告无法显示</li>
            <li>配置修改后，刷新页面即可看到效果</li>
          </ul>
        </div>

        {/* 测试面板 */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 16
        }}>
          <h3 style={{ fontSize: 14, marginTop: 0, marginBottom: 12 }}>🧪 测试</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, marginBottom: 12 }}>
            当前配置状态：
          </p>
          <pre style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: 12,
            fontSize: 11,
            overflow: 'auto',
            margin: 0,
            color: 'var(--accent)'
          }}>
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </div>
    </Layout>
  )
}

export default function AdsDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // 检查是否已登录
    const token = localStorage.getItem('adsAdminToken')
    if (token === 'authenticated') {
      setAuthenticated(true)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adsAdminToken')
    setAuthenticated(false)
    navigate('/')
  }

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />
  }

  return (
    <>
      <DashboardContent />
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '8px 12px',
        fontSize: 12,
        color: 'var(--muted)'
      }}>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--accent)',
            cursor: 'pointer',
            fontSize: 12,
            textDecoration: 'underline'
          }}
        >
          🔓 退出登录
        </button>
      </div>
    </>
  )
}
