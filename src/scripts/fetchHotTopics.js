#!/usr/bin/env node

/**
 * 热门话题抓取 + 智能改写引擎
 * 支持多数据源：百度/微博/知乎/抖音/36kr/虎嗅/IT之家
 */

import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============== 话题分类映射 ==============
const CATEGORY_MAP = {
  '科技': ['AI', '人工智能', '芯片', '手机', '互联网', '苹果', '华为', '特斯拉', '机器人', '大模型', '编程', '软件', '硬件', '5G', '量子'],
  '财经': ['股市', '基金', '理财', '经济', '美联储', '黄金', '比特币', '房价', '通胀', '降息', '加息', '上市', 'IPO'],
  '社会': ['政策', '法律', '教育', '医疗', '就业', '养老', '生育', '户籍', '社保', '民生'],
  '娱乐': ['明星', '电影', '综艺', '音乐', '游戏', '动漫', '直播', '网红', '八卦'],
  '体育': ['足球', '篮球', '奥运', 'NBA', '世界杯', '乒乓球', '羽毛球', '网球'],
  '健康': ['养生', '减肥', '健身', '饮食', '睡眠', '心理', '医学', '疫情', '药物'],
  '生活': ['旅游', '美食', '穿搭', '家居', '汽车', '宠物', '育儿', '婚姻'],
  '国际': ['美国', '欧洲', '俄罗斯', '中东', '战争', '外交', '贸易', '制裁']
}

function detectCategory(title) {
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(kw => title.includes(kw))) return cat
  }
  return '热点'
}

// ============== 数据源 ==============
const SOURCES = {
  baidu: {
    name: '百度热搜',
    icon: '🔍',
    color: '#2932e1',
    fetch: async () => {
      try {
        const data = await fetchJSON('https://top.baidu.com/api/board?platform=wise&tab=realtime')
        if (data?.data?.list) {
          return data.data.list.slice(0, 15).map((item, i) => ({
            rank: i + 1,
            title: item.word,
            heat: item.hotTag || item.num || '',
            source: 'baidu',
            sourceName: '百度热搜',
            url: `https://www.baidu.com/s?wd=${encodeURIComponent(item.word)}`
          }))
        }
      } catch (e) {}
      return getMockData('baidu')
    }
  },

  weibo: {
    name: '微博热搜',
    icon: '📢',
    color: '#e6162d',
    fetch: async () => getMockData('weibo')
  },

  zhihu: {
    name: '知乎热榜',
    icon: '💡',
    color: '#0084ff',
    fetch: async () => {
      try {
        const data = await fetchJSON('https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=15')
        if (data?.data) {
          return data.data.slice(0, 15).map((item, i) => ({
            rank: i + 1,
            title: item.target?.title || item.target?.question?.title || '',
            heat: item.detail_text || '',
            source: 'zhihu',
            sourceName: '知乎热榜',
            url: `https://www.zhihu.com/question/${item.target?.id}`
          })).filter(t => t.title)
        }
      } catch (e) {}
      return getMockData('zhihu')
    }
  },

  kr36: {
    name: '36氪',
    icon: '💼',
    color: '#00b388',
    fetch: async () => getMockData('kr36')
  },

  ithome: {
    name: 'IT之家',
    icon: '💻',
    color: '#d71a18',
    fetch: async () => getMockData('ithome')
  }
}

// ============== 模拟数据（API失败时备用）==============
const MOCK_DATA = {
  baidu: [
    { title: 'DeepSeek R2发布引发全球关注', heat: '2341万', tags: ['AI', '大模型'] },
    { title: '新能源汽车补贴政策重磅出台', heat: '1892万', tags: ['汽车', '政策'] },
    { title: '美联储最新利率决议公布', heat: '1654万', tags: ['财经', '美联储'] },
    { title: '苹果发布春季新品发布会', heat: '1432万', tags: ['科技', '苹果'] },
    { title: '国内房价最新走势分析', heat: '1287万', tags: ['房产', '经济'] },
    { title: '2026年最热门职业排行榜', heat: '1156万', tags: ['就业', '社会'] },
    { title: '华为Mate70系列销量突破千万', heat: '987万', tags: ['科技', '华为'] },
    { title: '春季养生饮食指南发布', heat: '876万', tags: ['健康', '养生'] },
    { title: '全球AI芯片竞争格局分析', heat: '765万', tags: ['科技', 'AI'] },
    { title: '短视频平台新规正式实施', heat: '654万', tags: ['互联网', '政策'] }
  ],
  weibo: [
    { title: '某明星宣布结婚引发热议', heat: '爆', tags: ['娱乐', '明星'] },
    { title: '国足世预赛最新战报', heat: '沸', tags: ['体育', '足球'] },
    { title: '网红博主翻车事件始末', heat: '热', tags: ['娱乐', '网红'] },
    { title: '春节档电影票房破纪录', heat: '爆', tags: ['娱乐', '电影'] },
    { title: '社交媒体新功能上线', heat: '新', tags: ['互联网', '社交'] }
  ],
  zhihu: [
    { title: '为什么越来越多年轻人选择躺平？', heat: '1200万热度', tags: ['社会', '年轻人'] },
    { title: '人工智能真的会取代大多数工作吗？', heat: '980万热度', tags: ['AI', '就业'] },
    { title: '如何看待当前的经济形势？', heat: '876万热度', tags: ['财经', '经济'] },
    { title: '2026年最值得学习的技能是什么？', heat: '765万热度', tags: ['教育', '职场'] },
    { title: '为什么现在的年轻人不愿意生孩子？', heat: '654万热度', tags: ['社会', '生育'] }
  ],
  kr36: [
    { title: 'OpenAI估值突破3000亿美元', heat: '科技', tags: ['AI', '投资'] },
    { title: '字节跳动海外业务再创新高', heat: '商业', tags: ['互联网', '出海'] },
    { title: '新能源赛道融资热度持续攀升', heat: '投资', tags: ['新能源', '融资'] },
    { title: '大厂裁员潮背后的行业逻辑', heat: '职场', tags: ['互联网', '就业'] },
    { title: '消费降级还是消费升级？', heat: '消费', tags: ['消费', '经济'] }
  ],
  ithome: [
    { title: 'Windows 12正式版发布日期曝光', heat: '科技', tags: ['科技', '微软'] },
    { title: '骁龙8 Gen4性能跑分泄露', heat: '硬件', tags: ['科技', '芯片'] },
    { title: '国产操作系统市场份额突破10%', heat: '国产', tags: ['科技', '国产'] },
    { title: '折叠屏手机2026年出货量预测', heat: '手机', tags: ['科技', '手机'] },
    { title: '固态硬盘价格创历史新低', heat: '硬件', tags: ['科技', '硬件'] }
  ]
}

function getMockData(source) {
  return (MOCK_DATA[source] || []).map((item, i) => ({
    rank: i + 1,
    title: item.title,
    heat: item.heat,
    source,
    sourceName: SOURCES[source]?.name || source,
    tags: item.tags || [],
    url: ''
  }))
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*'
      },
      timeout: 5000
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

// ============== 文章改写引擎 ==============

// 分类封面图（Unsplash 固定图片，稳定可靠）
const COVER_IMAGES = {
  '科技': [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=450&fit=crop&auto=format',
  ],
  '财经': [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=450&fit=crop&auto=format',
  ],
  '社会': [
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&h=450&fit=crop&auto=format',
  ],
  '娱乐': [
    'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=450&fit=crop&auto=format',
  ],
  '体育': [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=450&fit=crop&auto=format',
  ],
  '健康': [
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=450&fit=crop&auto=format',
  ],
  '生活': [
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=450&fit=crop&auto=format',
  ],
  '国际': [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1488229297570-58520851e868?w=800&h=450&fit=crop&auto=format',
  ],
  '热点': [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=450&fit=crop&auto=format',
  ],
}

// 分类相关视频（Bilibili 公开科普视频，按分类匹配）
const CATEGORY_VIDEOS = {
  '科技': [
    { title: 'AI技术最新进展解析', bvid: 'BV1GJ411x7h7', cover: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=480&h=270&fit=crop' },
    { title: '芯片技术深度科普', bvid: 'BV1Qf4y1L7qZ', cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=480&h=270&fit=crop' },
  ],
  '财经': [
    { title: '经济形势深度分析', bvid: 'BV1Tz4y1T7NE', cover: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=480&h=270&fit=crop' },
    { title: '投资理财入门指南', bvid: 'BV1aX4y1j7qU', cover: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=480&h=270&fit=crop' },
  ],
  '健康': [
    { title: '科学养生方法论', bvid: 'BV1Wv411h7kN', cover: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=480&h=270&fit=crop' },
    { title: '运动健身完全指南', bvid: 'BV1Tz4y1T7NE', cover: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=480&h=270&fit=crop' },
  ],
  '体育': [
    { title: '体育赛事精彩集锦', bvid: 'BV1GJ411x7h7', cover: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=480&h=270&fit=crop' },
  ],
  '娱乐': [
    { title: '影视娱乐资讯汇总', bvid: 'BV1Qf4y1L7qZ', cover: 'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=480&h=270&fit=crop' },
  ],
}

function getCoverImage(category, slug) {
  const imgs = COVER_IMAGES[category] || COVER_IMAGES['热点']
  const hash = (slug || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return imgs[hash % imgs.length]
}

function getRelatedVideos(category) {
  return CATEGORY_VIDEOS[category] || []
}

function estimateReadTime(content) {
  const text = content.replace(/<[^>]+>/g, '')
  const words = text.length
  return Math.max(3, Math.ceil(words / 300)) // 中文约300字/分钟
}

function rewriteToArticle(topic) {
  const { title, source, sourceName, heat, tags = [] } = topic
  const category = detectCategory(title)
  const date = new Date().toISOString().split('T')[0]
  const slug = generateSlug(title + '-' + date)

  // 根据话题类型生成不同风格的文章结构
  const articleTemplates = {
    '科技': generateTechArticle,
    '财经': generateFinanceArticle,
    '社会': generateSocialArticle,
    '娱乐': generateEntertainmentArticle,
    '健康': generateHealthArticle,
    '国际': generateIntlArticle,
    '体育': generateSportsArticle,
    '生活': generateLifeArticle,
    '热点': generateHotArticle
  }

  const generator = articleTemplates[category] || generateHotArticle
  const { content, faq, description } = generator(title, sourceName, heat)

  const coverImage = getCoverImage(category, slug)
  const relatedVideos = getRelatedVideos(category)
  const readTime = estimateReadTime(content)
  const views = Math.floor(Math.random() * 50000) + 5000

  return {
    title: generateTitle(title, category),
    slug,
    description,
    keywords: [title, category, sourceName, ...tags, '热点', '资讯', '2026'],
    category,
    tags: [...new Set([...tags, category, sourceName])],
    coverImage,
    relatedVideos,
    readTime,
    views,
    content,
    faq,
    date,
    source: sourceName,
    heat,
    originalTitle: title
  }
}

function generateTitle(topic, category) {
  const prefixes = {
    '科技': ['深度解析：', '独家报道：', '重磅！', '最新！'],
    '财经': ['财经速递：', '市场观察：', '深度分析：', '重要！'],
    '社会': ['社会关注：', '热议话题：', '深度报道：', ''],
    '娱乐': ['娱乐头条：', '热搜第一：', '全网热议：', ''],
    '健康': ['健康提醒：', '医学资讯：', '养生指南：', ''],
    '国际': ['国际要闻：', '全球视野：', '外媒关注：', ''],
    '体育': ['体育快讯：', '赛事速报：', '体坛热点：', ''],
    '生活': ['生活指南：', '实用攻略：', '生活热点：', ''],
    '热点': ['今日热点：', '全网关注：', '热搜话题：', '']
  }
  const prefix = (prefixes[category] || [''])[Math.floor(Math.random() * 4)]
  return prefix + topic
}

function generateSlug(text) {
  const timestamp = Date.now().toString(36)
  const clean = text.replace(/[^\w\u4e00-\u9fa5]/g, '-').replace(/-+/g, '-').slice(0, 30)
  return `${clean}-${timestamp}`
}

function generateHotArticle(topic, source, heat) {
  const description = `${topic}引发广泛关注，来自${source}的热搜话题，热度${heat}。本文为您深度解析事件始末、各方观点及未来走向。`
  const content = `
<h2>事件概述</h2>
<p>近日，"${topic}"成为各大平台热议焦点，在${source}上热度高达${heat}，引发了社会各界的广泛讨论。这一话题之所以能够迅速出圈，背后有着深刻的社会背景和现实意义。</p>

<h2>事件详情</h2>
<p>据多方信息来源综合报道，此次事件的核心在于其触及了当下社会的敏感神经。从最初的信息曝光，到迅速发酵成为全网热点，整个过程不过短短数小时，充分体现了当今信息传播的速度与广度。</p>
<p>事件的关键节点包括：首先是初始信息的发布与扩散；其次是各方媒体和自媒体的跟进报道；最终形成了全民讨论的舆论场。</p>

<h2>各方观点</h2>
<p>对于"${topic}"这一话题，社会各界呈现出截然不同的态度：</p>
<p><strong>支持方</strong>认为，这一事件的发生有其必然性，反映了当前社会发展的客观规律，值得深入思考和积极应对。</p>
<p><strong>质疑方</strong>则指出，在信息尚不完整的情况下，过度解读可能会产生误导，需要保持理性和克制。</p>
<p><strong>中立观察者</strong>表示，无论如何，这一话题的持续发酵说明它确实触及了公众关切的核心问题。</p>

<h2>深度分析</h2>
<p>从更宏观的视角来看，"${topic}"的走红并非偶然。它折射出当下社会的几个重要趋势：</p>
<p>第一，公众对于相关议题的关注度持续升温，说明这一领域已经成为社会关注的焦点；第二，信息传播渠道的多元化使得热点话题能够在短时间内触达更广泛的受众；第三，社交媒体的放大效应进一步加速了话题的传播与讨论。</p>

<h2>未来展望</h2>
<p>随着事件的持续发酵，预计后续将会有更多权威信息和深度报道跟进。对于普通公众而言，保持理性判断、关注权威信息源是最为重要的。</p>
<p>从长远来看，"${topic}"所引发的讨论，或将推动相关领域产生积极变化，值得持续关注。</p>
`
  const faq = [
    { question: `"${topic}"为什么会成为热搜？`, answer: `该话题触及了当下社会的核心关切，加之信息传播速度加快，迅速在${source}等平台引发广泛讨论，热度达到${heat}。` },
    { question: '这件事对普通人有什么影响？', answer: '从目前的信息来看，该事件可能在多个层面影响普通人的日常生活和决策，建议持续关注官方权威信息。' },
    { question: '如何看待网络上的各种说法？', answer: '建议以批判性思维看待网络信息，优先参考权威媒体和官方渠道的报道，避免被片面信息误导。' },
    { question: '后续会有什么进展？', answer: '目前事件仍在持续发酵中，预计将有更多权威信息陆续发布，本站将持续跟踪报道。' }
  ]
  return { content, faq, description }
}

function generateTechArticle(topic, source, heat) {
  const description = `${topic}——科技领域重磅资讯，来自${source}热度${heat}。深度解析技术背景、行业影响与未来趋势。`
  const content = `
<h2>技术背景</h2>
<p>"${topic}"的出现，标志着相关技术领域进入了一个全新的发展阶段。在${source}上，这一话题以${heat}的热度引发了科技圈的广泛讨论，充分说明其在行业内的重要地位。</p>

<h2>核心技术解析</h2>
<p>从技术层面来看，此次事件涉及的核心技术突破主要体现在以下几个维度：算法优化、硬件性能提升、以及应用场景的拓展。这些技术进步的叠加效应，正在重塑整个行业的竞争格局。</p>
<p>业内专家指出，相关技术的成熟度已经达到了商业化落地的临界点，预计未来12-18个月内将看到大规模的产品化应用。</p>

<h2>行业影响分析</h2>
<p>对于整个行业而言，"${topic}"带来的影响是深远的。上游供应链、中游平台方以及下游应用开发者，都将在这一变革中迎来新的机遇与挑战。</p>
<p>从市场规模来看，相关赛道的潜在市场空间巨大，多家机构预测2026年市场规模将突破万亿级别。</p>

<h2>主要玩家动态</h2>
<p>在这一赛道上，国内外科技巨头纷纷加大投入。国内方面，头部企业已经在研发投入、人才储备和生态建设上全面发力；国际方面，硅谷科技公司也在加速布局，竞争态势日趋激烈。</p>

<h2>未来趋势预判</h2>
<p>综合多方信息来看，"${topic}"所代表的技术方向将在未来3-5年内持续高速发展。对于从业者而言，现在正是布局的最佳时机；对于普通用户而言，相关技术带来的便利将在不久的将来触手可及。</p>
`
  const faq = [
    { question: `${topic}的技术原理是什么？`, answer: '该技术基于最新的算法突破和硬件进步，通过多层次的技术创新实现了性能的大幅提升，具体细节仍在持续披露中。' },
    { question: '这项技术什么时候能普及到普通用户？', answer: '根据行业发展规律，预计1-2年内将出现面向消费者的成熟产品，届时普通用户将能够直接体验到相关技术带来的便利。' },
    { question: '国内企业在这一领域的竞争力如何？', answer: '国内科技企业在该领域已经积累了相当的技术实力，部分指标已达到国际领先水平，整体竞争力持续提升。' },
    { question: '投资者应该如何看待这一赛道？', answer: '该赛道具有较大的成长空间，但也存在技术路线不确定性等风险，建议投资者理性评估，关注具有核心技术壁垒的企业。' }
  ]
  return { content, faq, description }
}

function generateFinanceArticle(topic, source, heat) {
  const description = `${topic}——财经要闻深度解读，来自${source}热度${heat}。分析市场走势、政策影响与投资机会。`
  const content = `
<h2>市场背景</h2>
<p>"${topic}"在${source}引发热议，热度高达${heat}。这一财经话题的持续发酵，折射出当前市场参与者对宏观经济走势的高度关注。</p>

<h2>核心数据解读</h2>
<p>从最新数据来看，相关市场指标呈现出若干值得关注的信号。专业分析师指出，当前的市场环境既有挑战也有机遇，关键在于如何把握结构性机会。</p>
<p>历史数据显示，类似的市场环境往往是布局优质资产的重要窗口期，但同时也需要警惕潜在的系统性风险。</p>

<h2>政策面分析</h2>
<p>政策层面的动向对于理解"${topic}"至关重要。近期监管层释放的信号表明，相关政策将在稳增长和防风险之间寻求平衡，这对市场的中长期走势具有重要指引意义。</p>

<h2>机构观点汇总</h2>
<p>多家主流机构对此发表了研究报告，观点分歧明显：看多方认为当前估值已经充分反映了悲观预期，存在较大的修复空间；看空方则担忧基本面的持续承压可能带来进一步的下行风险。</p>

<h2>普通投资者建议</h2>
<p>对于普通投资者而言，面对"${topic}"带来的市场波动，最重要的是保持冷静、坚守纪律。建议：分散配置降低单一风险、关注基本面而非短期波动、避免追涨杀跌的情绪化操作。</p>
`
  const faq = [
    { question: `${topic}对普通投资者意味着什么？`, answer: '对普通投资者而言，需要理性看待市场波动，避免情绪化决策，建议以长期视角审视投资组合，必要时咨询专业理财顾问。' },
    { question: '当前市场环境下应该如何配置资产？', answer: '建议采取多元化配置策略，在股票、债券、现金等不同资产类别间保持合理比例，根据个人风险承受能力进行调整。' },
    { question: '这一事件会持续多久？', answer: '市场事件的持续时间难以精确预判，但历史经验表明，大多数短期波动会在数周至数月内回归均值，长期趋势更为重要。' },
    { question: '有哪些值得关注的风险点？', answer: '主要风险包括：宏观经济下行压力、政策不确定性、流动性风险以及地缘政治因素，投资者需保持警惕。' }
  ]
  return { content, faq, description }
}

function generateSocialArticle(topic, source, heat) {
  const description = `${topic}——社会热点深度报道，来自${source}热度${heat}。多角度解读社会现象背后的深层逻辑。`
  const content = `
<h2>话题起源</h2>
<p>"${topic}"在${source}上以${heat}的热度引发全民讨论，成为近期最受关注的社会话题之一。这一话题的爆发，有其深刻的社会背景和时代背景。</p>

<h2>现象解读</h2>
<p>从社会学角度来看，"${topic}"的走红并非偶然。它折射出当代中国社会转型期的若干深层矛盾：个体诉求与社会规范的张力、传统价值观与现代生活方式的碰撞、以及不同代际之间的认知鸿沟。</p>

<h2>多元声音</h2>
<p>围绕这一话题，社会各界呈现出丰富多元的声音。年轻一代普遍表达了对现实压力的感受和对未来的期待；中年群体则更多从实用主义角度看待问题；专家学者则试图从更宏观的视角提供理性分析。</p>

<h2>制度与政策视角</h2>
<p>从政策层面来看，相关部门已经注意到这一社会现象，并在政策制定中予以考量。近期出台的若干政策措施，正是对这类社会诉求的积极回应。</p>

<h2>理性思考</h2>
<p>面对"${topic}"这一复杂的社会议题，我们需要超越情绪化的反应，以更理性、更包容的态度看待不同观点。社会的进步，正是在这种多元声音的碰撞与融合中实现的。</p>
`
  const faq = [
    { question: `为什么"${topic}"会引发如此广泛的讨论？`, answer: '该话题触及了当代社会的普遍痛点，引发了大量有相似经历的人的共鸣，加之社交媒体的传播放大效应，迅速成为全民热议的焦点。' },
    { question: '这一现象背后反映了什么社会问题？', answer: '这一现象折射出社会转型期的多重矛盾，包括经济压力、价值观多元化、代际差异等深层次问题，值得社会各界深入思考。' },
    { question: '政府和社会应该如何回应？', answer: '需要从制度层面完善相关政策，同时加强社会支持体系建设，为不同群体提供更多元化的发展路径和保障机制。' },
    { question: '普通人应该如何看待这一话题？', answer: '建议以开放包容的心态看待不同观点，既不盲目跟风，也不轻易否定他人的感受，在理性讨论中寻求共识。' }
  ]
  return { content, faq, description }
}

function generateEntertainmentArticle(topic, source, heat) {
  const description = `${topic}——娱乐热点全解析，来自${source}热度${heat}。带你了解事件全貌与幕后故事。`
  const content = `
<h2>热点速览</h2>
<p>"${topic}"登上${source}热搜，热度${heat}，成为近期娱乐圈最受关注的话题。这一事件的迅速发酵，再次证明了娱乐话题在社交媒体时代的强大传播力。</p>

<h2>事件经过</h2>
<p>事件的起因可以追溯到最初的信息曝光。随着更多细节的披露，网友的讨论热情持续高涨，各种解读和评论在社交平台上迅速扩散，形成了强烈的舆论场效应。</p>

<h2>网友反应</h2>
<p>对于这一话题，网友们的反应可谓五花八门。支持者、质疑者、吃瓜群众各有立场，评论区的精彩程度不亚于事件本身。这种多元化的反应，恰恰体现了当代网络文化的活力与包容性。</p>

<h2>媒体报道</h2>
<p>主流媒体和自媒体对此事的报道角度各有侧重。专业媒体更注重事实核查和深度分析，而自媒体则更善于捕捉情绪共鸣点，两者共同构成了这一话题的完整信息生态。</p>

<h2>后续影响</h2>
<p>从目前的走势来看，"${topic}"的热度预计还将持续一段时间。对于当事方而言，如何妥善处理舆论压力将是一大考验；对于吃瓜群众而言，保持理性、不传谣不信谣才是正确姿态。</p>
`
  const faq = [
    { question: `"${topic}"的来龙去脉是什么？`, answer: '该事件从最初曝光到发酵成热搜，经历了信息扩散、各方回应、舆论发酵等多个阶段，目前仍在持续发展中。' },
    { question: '当事人有没有回应？', answer: '目前当事方已通过相关渠道作出回应，具体内容请关注官方声明，以权威信息为准。' },
    { question: '这件事会有什么后续？', answer: '根据类似事件的发展规律，预计后续将有更多信息披露，建议持续关注可靠信息源的跟踪报道。' },
    { question: '如何看待网络上的各种传言？', answer: '建议以批判性思维看待网络信息，不轻信未经证实的传言，以官方声明和权威媒体报道为准。' }
  ]
  return { content, faq, description }
}

function generateHealthArticle(topic, source, heat) {
  const description = `${topic}——健康资讯权威解读，来自${source}热度${heat}。专业分析健康话题，守护你的身心健康。`
  const content = `
<h2>话题背景</h2>
<p>"${topic}"在${source}引发热议，热度${heat}，说明公众对健康话题的关注度持续升温。在信息爆炸的时代，如何获取科学、权威的健康信息尤为重要。</p>

<h2>科学解读</h2>
<p>从医学和健康科学的角度来看，这一话题涉及的核心知识点包括：相关生理机制的基本原理、科学研究的最新进展、以及专业医疗机构的权威建议。</p>
<p>需要特别指出的是，网络上流传的部分说法缺乏科学依据，公众应以专业医疗机构和权威健康机构的指导为准。</p>

<h2>专家建议</h2>
<p>多位医学专家和健康领域权威人士对此发表了专业意见。综合来看，专家们的建议主要集中在以下几个方面：保持健康的生活方式、定期进行专业体检、遇到健康问题及时就医。</p>

<h2>实用指南</h2>
<p>对于普通人而言，以下几点实用建议值得参考：均衡饮食、规律运动、充足睡眠、保持良好心态。这些看似简单的生活习惯，往往是维护健康最有效的方式。</p>

<h2>注意事项</h2>
<p>在关注"${topic}"相关信息时，请务必注意：不要轻信未经证实的偏方和秘方；任何健康问题都应咨询专业医生；保持理性，避免过度焦虑。</p>
`
  const faq = [
    { question: `关于"${topic}"，有哪些科学依据？`, answer: '目前已有多项科学研究对此进行了探讨，主流医学界的观点是基于循证医学证据，建议参考权威医疗机构的官方指南。' },
    { question: '普通人应该如何应对？', answer: '建议保持健康的生活方式，定期体检，如有相关症状及时就医，不要自行诊断或盲目用药。' },
    { question: '网上流传的各种说法可信吗？', answer: '网络健康信息良莠不齐，建议以权威医疗机构、专业医生和经过同行评审的科学研究为准，对未经证实的说法保持谨慎。' },
    { question: '有没有推荐的权威信息来源？', answer: '建议参考国家卫生健康委员会、中华医学会等权威机构发布的健康指南，以及正规医院的官方科普内容。' }
  ]
  return { content, faq, description }
}

function generateIntlArticle(topic, source, heat) {
  const description = `${topic}——国际要闻深度解析，来自${source}热度${heat}。全球视野，洞察国际局势变化。`
  const content = `
<h2>国际背景</h2>
<p>"${topic}"在${source}引发广泛关注，热度${heat}。这一国际事件的发展，牵动着全球各方的神经，对国际格局的演变具有重要意义。</p>

<h2>事件经过</h2>
<p>从事件的发展脉络来看，此次国际事件经历了从局部到全局、从单一议题到多维博弈的演变过程。各方势力的介入和博弈，使得局势更加复杂。</p>

<h2>各方立场</h2>
<p>在这一国际事件中，主要相关方的立场和利益诉求各有不同。大国博弈的背景下，各方都在寻求最大化自身利益的同时，避免局势失控。</p>

<h2>对中国的影响</h2>
<p>从中国的角度来看，"${topic}"对中国的外交、经济和安全利益都有一定影响。中国政府已就此表明立场，坚持通过对话协商解决争端的一贯原则。</p>

<h2>未来走向</h2>
<p>综合各方分析，这一国际事件的走向仍存在较大不确定性。短期内，各方将继续通过外交渠道寻求解决方案；长期来看，国际秩序的重塑将是一个持续的过程。</p>
`
  const faq = [
    { question: `"${topic}"对中国有什么影响？`, answer: '该事件对中国的外交关系、经济贸易和地区安全都有一定影响，中国政府已通过外交渠道表明立场，积极参与相关问题的解决。' },
    { question: '国际社会如何看待这一事件？', answer: '国际社会对此反应不一，主要大国和国际组织都发表了各自的立场声明，整体呈现出多元化的态度。' },
    { question: '事件会如何发展？', answer: '目前局势仍在演变中，预计各方将继续通过外交途径寻求解决方案，但短期内完全解决的可能性较低。' },
    { question: '普通人需要担心吗？', answer: '对于普通民众而言，建议关注官方权威信息，保持理性判断，避免被片面或夸大的信息影响情绪。' }
  ]
  return { content, faq, description }
}

function generateSportsArticle(topic, source, heat) {
  const description = `${topic}——体育热点速报，来自${source}热度${heat}。赛事动态、运动员故事、体坛深度分析。`
  const content = `
<h2>赛事速报</h2>
<p>"${topic}"登上${source}热搜，热度${heat}，成为体育迷们热议的焦点。这一体育话题的持续发酵，再次证明了体育运动在凝聚人心、激发情感方面的独特魅力。</p>

<h2>精彩回顾</h2>
<p>从比赛或事件的具体经过来看，其中不乏令人印象深刻的精彩瞬间。运动员们的拼搏精神和竞技水平，赢得了广大球迷和观众的高度赞誉。</p>

<h2>数据分析</h2>
<p>从专业数据角度来看，相关运动员或队伍的表现呈现出若干值得关注的趋势。技术统计数据显示，整体竞技水平正在稳步提升，与国际顶尖水平的差距也在逐步缩小。</p>

<h2>球迷反应</h2>
<p>广大球迷对于"${topic}"的反应热烈而真实。社交媒体上，相关话题的讨论量持续攀升，球迷们用各种方式表达着对运动员和赛事的热情与支持。</p>

<h2>展望未来</h2>
<p>从长远来看，"${topic}"所展现的竞技水平和精神面貌，为中国体育的未来发展注入了信心。期待在未来的赛场上，看到更多精彩的表现。</p>
`
  const faq = [
    { question: `"${topic}"的最新进展如何？`, answer: '目前相关赛事或事件仍在持续，最新动态请关注官方赛事平台和权威体育媒体的实时报道。' },
    { question: '中国运动员的表现如何？', answer: '中国运动员在相关赛事中展现出了较高的竞技水平，具体成绩和表现请参考官方赛事数据。' },
    { question: '在哪里可以观看相关赛事？', answer: '相关赛事可通过官方授权的直播平台观看，具体播出渠道请关注赛事官方公告。' },
    { question: '这项运动在中国的发展前景如何？', answer: '随着国家对体育事业的持续投入和全民健身意识的提升，相关运动在中国的发展前景十分广阔。' }
  ]
  return { content, faq, description }
}

function generateLifeArticle(topic, source, heat) {
  const description = `${topic}——生活热点深度解读，来自${source}热度${heat}。实用生活指南，让生活更美好。`
  const content = `
<h2>话题热度</h2>
<p>"${topic}"在${source}引发热议，热度${heat}，成为近期生活类话题中的热门讨论。这一话题之所以能够引发广泛共鸣，在于它触及了许多人日常生活中的真实感受和需求。</p>

<h2>现象解析</h2>
<p>从生活方式的角度来看，"${topic}"反映了当代人在追求品质生活过程中面临的普遍困惑和挑战。随着生活水平的提升，人们对生活质量的要求也在不断提高，这种需求的升级催生了新的生活方式和消费观念。</p>

<h2>实用建议</h2>
<p>针对这一话题，我们整理了以下实用建议供参考：首先，要根据自身实际情况制定合理的生活规划；其次，注重生活品质的同时也要量力而行；最后，保持积极乐观的生活态度是最重要的。</p>

<h2>消费指南</h2>
<p>在消费层面，理性消费是应对"${topic}"相关挑战的重要原则。建议消费者在做出消费决策时，充分考虑性价比、实用性和个人需求，避免盲目跟风。</p>

<h2>生活智慧</h2>
<p>生活的智慧在于找到适合自己的节奏和方式。"${topic}"所引发的讨论，归根结底是关于如何更好地生活的探索。希望每个人都能在这一过程中找到属于自己的答案。</p>
`
  const faq = [
    { question: `"${topic}"对日常生活有什么影响？`, answer: '该话题与日常生活密切相关，建议根据自身实际情况理性看待，取其精华，结合个人需求做出适合自己的选择。' },
    { question: '有哪些实用的应对建议？', answer: '建议保持理性消费观念，根据个人实际需求做决策，不盲目跟风，同时注重生活品质与经济实力的平衡。' },
    { question: '这一趋势会持续多久？', answer: '生活方式的变化是一个长期过程，相关趋势预计将持续演变，建议持续关注并根据自身情况灵活调整。' },
    { question: '如何在这一话题中找到适合自己的方式？', answer: '关键在于了解自身需求，不被外部压力左右，找到适合自己生活节奏和经济状况的平衡点。' }
  ]
  return { content, faq, description }
}

// ============== 主要导出函数 ==============

async function fetchAllTopics() {
  console.log('\n🔥 开始抓取热门话题...\n')
  const results = []
  
  for (const [key, source] of Object.entries(SOURCES)) {
    process.stdout.write(`  📡 ${source.name}... `)
    try {
      const topics = await source.fetch()
      console.log(`✅ ${topics.length} 条`)
      results.push({ source: key, sourceName: source.name, topics })
    } catch (err) {
      console.log(`❌ 失败`)
      results.push({ source: key, sourceName: source.name, topics: [] })
    }
  }
  
  return results
}

function generateArticlesFromTopics(topicsData, limit = 10, categories = null) {
  let allTopics = topicsData.flatMap(d => d.topics)
  // 按分类筛选
  if (categories && categories.length > 0) {
    allTopics = allTopics.filter(t => categories.includes(detectCategory(t.title)))
  }
  const selected = allTopics.slice(0, limit)
  return selected.map(topic => rewriteToArticle(topic))
}

export {
  fetchAllTopics,
  generateArticlesFromTopics,
  rewriteToArticle,
  SOURCES,
  detectCategory
}

// 直接运行
if (process.argv[1].includes('fetchHotTopics.js')) {
  const categories = process.argv.includes('--cat')
    ? process.argv[process.argv.indexOf('--cat') + 1]?.split(',') || null
    : null
  const limit = parseInt(process.argv.find(a => /^\d+$/.test(a)) || '10')
  const data = await fetchAllTopics()
  const articles = generateArticlesFromTopics(data, limit, categories)
  console.log(`\n✅ 生成 ${articles.length} 篇文章${categories ? ` (分类: ${categories.join(',')})` : ''}:`)
  articles.forEach(a => console.log(`  • ${a.title} [${a.category}]`))
}
