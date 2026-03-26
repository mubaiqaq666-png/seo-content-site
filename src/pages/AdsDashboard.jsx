import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

const PLATFORMS = {
  baidu: { name: '百度广告联盟', url: 'https://union.baidu.com/', icon: '🔍' },
  tencent: { name: '腾讯广告', url: 'https://e.qq.com/ads/', icon: '🐧' },
  bytedance: { name: '字节穿山甲', url: 'https://www.pangle.cn/', icon: '🎵' },
  google: { name: 'Google AdSense', url: 'https://adsense.google.com/', icon: '🔵' },
}

// 从环境变量读取密码，如果没有则使用默认值
// 生产环境：设置 VITE_ADMIN_PASSWORD 环境变量
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || null

function LoginPage({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!ADMIN_PASSWORD) {
      setError('❌ 管理员密码未配置，请联系网站管理员')
    }
  }, [])

  const handleLogin = () => {
    if (!ADMIN_PASSWORD) {
      setError('密码未配置')
      return
    }
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('adsAdminToken', 'authenticated')
      localStorage.setItem('adsAdminLoginTime', Date.now().toString())
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
          请输入管理员密码以访问广告配置和统计数据
        </p>

        {!ADMIN_PASSWORD ? (
          <div style={{
            background: 'rgba(255, 68, 102, 0.1)',
            border: '1px solid rgba(255, 68, 102, 0.3)',
            borderRadius: 6,
            padding: 16,
            color: '#ff4466',
            fontSize: 12,
            lineHeight: 1.6
          }}>
            <p style={{ margin: 0, marginBottom: 8 }}>
              ⚠️ <strong>密码未配置</strong>
            </p>
            <p style={{ margin: 0 }}>
              请在 .env 文件中设置 <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px' }}>VITE_ADMIN_PASSWORD</code> 环境变量
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </Layout>
  )
}

function StatisticsPanel() {
  const [stats, setStats] = useState({
    totalViews: 0,
    todayViews: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    platformStats: {
      baidu: { views: 0, revenue: 0 },
      tencent: { views: 0, revenue: 0 },
      bytedance: { views: 0, revenue: 0 },
      google: { views: 0, revenue: 0 }
    }
  })

  useEffect(() => {
    // 从 localStorage 读取统计数据
    const stored = localStorage.getItem('adsStats')
    if (stored) {
      try {
        setStats(JSON.parse(stored))
      } catch (e) {}
    }

    // 模拟实时数据更新（实际应该从后端 API 获取）
    const interval = setInterval(() => {
      setStats(prev => {
        const newStats = JSON.parse(JSON.stringify(prev))
        // 模拟随机增长
        newStats.totalViews += Math.floor(Math.random() * 10)
        newStats.todayViews += Math.floor(Math.random() * 10)
        newStats.totalRevenue += Math.random() * 0.5
        newStats.todayRevenue += Math.random() * 0.5
        
        // 随机分配到各平台
        const platforms = ['baidu', 'tencent', 'bytedance', 'google']
        const platform = platforms[Math.floor(Math.random() * platforms.length)]
        newStats.platformStats[platform].views += Math.floor(Math.random() * 5)
        newStats.platformStats[platform].revenue += Math.random() * 0.2
        
        localStorage.setItem('adsStats', JSON.stringify(newStats))
        return newStats
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>📊 实时统计</h2>

      {/* 关键指标 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {[
          { label: '总浏览量', value: stats.totalViews, unit: '次', icon: '👁️' },
          { label: '今日浏览', value: stats.todayViews, unit: '次', icon: '📈' },
          { label: '总收入', value: stats.totalRevenue.toFixed(2), unit: '¥', icon: '💰' },
          { label: '今日收入', value: stats.todayRevenue.toFixed(2), unit: '¥', icon: '💵' }
        ].map((item, i) => (
          <div key={i} style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 16,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
              {item.value}{item.unit}
            </div>
          </div>
        ))}
      </div>

      {/* 平台统计 */}
      <h3 style={{ fontSize: 14, marginBottom: 12 }}>🎯 平台分布</h3>
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--accent)' }}>平台</th>
              <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--accent)' }}>浏览量</th>
              <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--accent)' }}>收入</th>
              <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--accent)' }}>占比</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(PLATFORMS).map(([key, { name, icon }]) => {
              const platformStat = stats.platformStats[key]
              const totalRevenue = Object.values(stats.platformStats).reduce((a, b) => a + b.revenue, 0)
              const percentage = totalRevenue > 0 ? ((platformStat.revenue / totalRevenue) * 100).toFixed(1) : 0
              
              return (
                <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 0' }}>{icon} {name}</td>
                  <td style={{ textAlign: 'right', padding: '12px 0' }}>{platformStat.views}</td>
                  <td style={{ textAlign: 'right', padding: '12px 0', color: 'var(--accent)' }}>
                    ¥{platformStat.revenue.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 0', color: 'var(--muted)' }}>
                    {percentage}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 提示 */}
      <div style={{
        background: 'rgba(0,212,255,0.05)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 6,
        padding: 12,
        fontSize: 11,
        color: 'var(--muted)',
        lineHeight: 1.6
      }}>
        <p style={{ margin: 0, marginBottom: 4 }}>
          💡 <strong>说明：</strong>
        </p>
        <p style={{ margin: 0, marginBottom: 4 }}>
          • 统计数据每 5 秒更新一次（演示模式）
        </p>
        <p style={{ margin: 0, marginBottom: 4 }}>
          • 生产环境应连接真实的后端 API 获取数据
        </p>
        <p style={{ margin: 0 }}>
          • 数据保存在浏览器本地存储，刷新页面不会丢失
        </p>
      </div>
    </div>
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
  const [activeTab, setActiveTab] = useState('stats')

  useEffect(() => {
    const stored = localStorage.getItem('adsConfig')
    if (stored) {
      try {
        setConfig(JSON.parse(stored))
      } catch (e) {}
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('adsConfig', JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
          实时查看流量和收入统计，配置各大广告平台
        </p>

        {/* 标签页 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
          {[
            { id: 'stats', label: '📊 统计数据', icon: '📊' },
            { id: 'config', label: '⚙️ 广告配置', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                color: activeTab === tab.id ? '#000' : 'var(--text)',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 统计页面 */}
        {activeTab === 'stats' && <StatisticsPanel />}

        {/* 配置页面 */}
        {activeTab === 'config' && (
          <>
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

            {/* 平台配置 */}
            {Object.entries(PLATFORMS).map(([key, { name, url }]) => (
              <div key={key} style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 24,
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, margin: 0 }}>{name}</h3>
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
                  <div style={{ display: 'grid', gap: 12 }}>
                    {key === 'baidu' && (
                      <>
                        <input
                          type="text"
                          placeholder="百度统计 ID（可选）"
                          value={config.baidu.tongjiId}
                          onChange={e => updatePlatform('baidu', 'tongjiId', e.target.value)}
                          style={{
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            padding: '10px 12px',
                            color: 'var(--text)',
                            fontSize: 13,
                            outline: 'none'
                          }}
                        />
                        <input
                          type="text"
                          placeholder="广告位 ID (slotId) *"
                          value={config.baidu.slotId}
                          onChange={e => updatePlatform('baidu', 'slotId', e.target.value)}
                          style={{
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            padding: '10px 12px',
                            color: 'var(--text)',
                            fontSize: 13,
                            outline: 'none'
                          }}
                        />
                      </>
                    )}
                    {key === 'tencent' && (
                      <>
                        <input
                          type="text"
                          placeholder="App ID *"
                          value={config.tencent.appId}
                          onChange={e => updatePlatform('tencent', 'appId', e.target.value)}
                          style={{
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            padding: '10px 12px',
                            color: 'var(--text)',
                            fontSize: 13,
                            outline: 'none'
                          }}
                        />
                        <input
                          type="text"
                          placeholder="广告位 ID (posId) *"
                          value={config.tencent.posId}
                          onChange={e => updatePlatform('tencent', 'posId', e.target.value)}
                          style={{
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            padding: '10px 12px',
                            color: 'var(--text)',
                            fontSize: 13,
                            outline: 'none'
                          }}
                        />
                      </>
                    )}
                    {key === 'bytedance' && (
                      <>
                        <input
                          type="text"
                          placeholder="App ID *"
                          value={config.bytedance.appId}
                          onChange={e => updatePlatform('bytedance', 'appId', e.target.value)}
                          style={{
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            padding: '10px 12px',
                            color: 'var(--text)',
                            fontSize: 13,
                            outline: 'none'
                          }}
                        />
                        <input
                          type="text"
                          placeholder="广告位 ID (slotId) *"
                          value={config.bytedance.slotId}
                          onChange={e => updatePlatform('bytedance', 'slotId', e.target.value)}
                          style={{
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            padding: '10px 12px',
                            color: 'var(--text)',
                            fontSize: 13,
                            outline: 'none'
                          }}
                        />
                      </>
                    )}
                    {key === 'google' && (
                      <input
                        type="text"
                        placeholder="发布商 ID (ca-pub-xxxxxxxxxx) *"
                        value={config.google.publisherId}
                        onChange={e => updatePlatform('google', 'publisherId', e.target.value)}
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          padding: '10px 12px',
                          color: 'var(--text)',
                          fontSize: 13,
                          outline: 'none'
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* 保存按钮 */}
            <div style={{ display: 'flex', gap: 12 }}>
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
          </>
        )}
      </div>
    </Layout>
  )
}

export default function AdsDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('adsAdminToken')
    const loginTime = localStorage.getItem('adsAdminLoginTime')
    
    // 检查登录状态和过期时间（24小时）
    if (token === 'authenticated' && loginTime) {
      const elapsed = Date.now() - parseInt(loginTime)
      if (elapsed < 24 * 60 * 60 * 1000) {
        setAuthenticated(true)
        return
      }
    }
    
    // 如果没有配置密码，不允许访问
    if (!import.meta.env.VITE_ADMIN_PASSWORD) {
      setAuthenticated(false)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adsAdminToken')
    localStorage.removeItem('adsAdminLoginTime')
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
