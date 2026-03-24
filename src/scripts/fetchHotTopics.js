/**
 * 热门文章抓取服务
 * 支持多个数据源的热门话题抓取
 */

import https from 'https'
import http from 'http'

// ============== 数据源配置 ==============

const DATA_SOURCES = {
  // 百度热搜（每日更新）
  baidu: {
    name: '百度热搜',
    enabled: true,
    fetch: async () => {
      try {
        const data = await fetchJSON('https://top.baidu.com/api/board?platform=wise&tab=realtime')
        if (data?.data?.list) {
          return data.data.list.slice(0, 20).map(item => ({
            title: item.word,
            heat: item.hotTag || '',
            source: 'baidu'
          }))
        }
      } catch (e) {
        console.log('百度热搜获取失败，使用模拟数据')
      }
      // 模拟数据作为备用
      return getMockBaiduData()
    }
  },

  // 微博热搜
  weibo: {
    name: '微博热搜',
    enabled: true,
    fetch: async () => {
      // 微博API限制较多，使用模拟数据
      return getMockWeiboData()
    }
  },

  // 知乎热榜
  zhihu: {
    name: '知乎热榜',
    enabled: true,
    fetch: async () => {
      try {
        const data = await fetchJSON('https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total')
        if (data?.data) {
          return data.data.slice(0, 20).map(item => ({
            title: item.target?.title || item.target?.question?.title,
            heat: item.detail_text || '',
            source: 'zhihu'
          }))
        }
      } catch (e) {
        console.log('知乎热榜获取失败，使用模拟数据')
      }
      return getMockZhihuData()
    }
  },

  // 抖音热点
  douyin: {
    name: '抖音热点',
    enabled: true,
    fetch: async () => {
      return getMockDouyinData()
    }
  }
}

// ============== 模拟数据（API失败时备用）==============

function getMockBaiduData() {
  const topics = [
    { title: '2026年AI发展趋势', heat: '999万' },
    { title: '新能源汽车最新政策', heat: '888万' },
    { title: '春季养生小技巧', heat: '777万' },
    { title: '远程办公效率提升', heat: '666万' },
    { title: '健康饮食指南', heat: '555万' },
    { title: '智能家居推荐', heat: '444万' },
    { title: '2026投资理财策略', heat: '333万' },
    { title: '编程学习路线', heat: '222万' },
    { title: '育儿教育方法', heat: '111万' },
    { title: '旅游攻略推荐', heat: '99万' }
  ]
  return topics.map(t => ({ ...t, source: 'baidu' }))
}

function getMockWeiboData() {
  const topics = [
    { title: '科技改变生活', heat: '热议' },
    { title: '明星八卦新闻', heat: '爆' },
    { title: '社会热点事件', heat: '热' },
    { title: '体育赛事直播', heat: '沸' },
    { title: '美食推荐分享', heat: '新' }
  ]
  return topics.map(t => ({ ...t, source: 'weibo' }))
}

function getMockZhihuData() {
  const topics = [
    { title: '如何高效学习编程', heat: '1000万热度' },
    { title: '人工智能会取代人类吗', heat: '900万热度' },
    { title: '职场新人如何快速成长', heat: '800万热度' },
    { title: '健康生活方式推荐', heat: '700万热度' },
    { title: '理财入门基础知识', heat: '600万热度' }
  ]
  return topics.map(t => ({ ...t, source: 'zhihu' }))
}

function getMockDouyinData() {
  const topics = [
    { title: '爆款短视频制作技巧', heat: '1000万播放' },
    { title: '网红打卡地点推荐', heat: '900万播放' },
    { title: '热门音乐分享', heat: '800万播放' },
    { title: '搞笑段子合集', heat: '700万播放' },
    { title: '生活小妙招', heat: '600万播放' }
  ]
  return topics.map(t => ({ ...t, source: 'douyin' }))
}

// ============== 工具函数 ==============

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          reject(e)
        }
      })
    }).on('error', reject)
  })
}

// ============== 主要功能 ==============

/**
 * 获取所有启用的数据源的热门话题
 */
async function fetchAllHotTopics() {
  console.log('\n🔥 开始抓取热门话题...\n')
  
  const results = []
  const enabledSources = Object.entries(DATA_SOURCES).filter(([_, config]) => config.enabled)

  for (const [key, config] of enabledSources) {
    console.log(`📡 正在获取 ${config.name}...`)
    try {
      const topics = await config.fetch()
      console.log(`   ✅ 获取到 ${topics.length} 条热门话题`)
      results.push({
        source: key,
        sourceName: config.name,
        topics,
        fetchedAt: new Date().toISOString()
      })
    } catch (error) {
      console.log(`   ❌ 获取失败: ${error.message}`)
      results.push({
        source: key,
        sourceName: config.name,
        topics: [],
        error: error.message
      })
    }
  }

  return results
}

/**
 * 从热门话题中提取关键词
 */
function extractKeywords(topics) {
  const allTopics = topics.flatMap(t => t.topics)
  
  // 去重并提取关键词
  const keywordSet = new Set()
  const keywords = []

  for (const topic of allTopics) {
    // 清理标题，提取关键词
    const words = topic.title
      .replace(/[0-9]+年|最新|攻略|指南|推荐|技巧|方法/g, '')
      .trim()
    
    if (words && !keywordSet.has(words) && words.length >= 2 && words.length <= 10) {
      keywordSet.add(words)
      keywords.push({
        keyword: words,
        originalTitle: topic.title,
        heat: topic.heat,
        source: topic.source
      })
    }
  }

  return keywords.slice(0, 30) // 返回前30个
}

/**
 * 生成每日关键词配置
 */
async function generateDailyKeywords() {
  const topics = await fetchAllHotTopics()
  const keywords = extractKeywords(topics)

  console.log(`\n✨ 提取到 ${keywords.length} 个关键词\n`)

  // 打印关键词列表
  console.log('📋 今日关键词列表:')
  console.log('-'.repeat(50))
  keywords.slice(0, 15).forEach((k, i) => {
    console.log(`${i + 1}. ${k.keyword} (来源: ${k.source}, 热度: ${k.heat || 'N/A'})`)
  })
  console.log('-'.repeat(50))

  return { topics, keywords }
}

// ============== 导出 ==============

export {
  fetchAllHotTopics,
  extractKeywords,
  generateDailyKeywords,
  DATA_SOURCES
}

// 直接运行时执行
if (process.argv[1].includes('fetchHotTopics.js')) {
  generateDailyKeywords()
}
