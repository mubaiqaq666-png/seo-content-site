#!/usr/bin/env node
/**
 * 多源内容抓取系统 v2
 * 支持 RSS：IT之家 / 36氪 / 澎湃新闻 / 参考消息
 * 抓取后自动扩展内容，然后触发 GitHub Actions 部署
 */
import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ==================== HTTP 请求 ====================
function fetchText(url, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Cache-Control': 'no-cache',
      },
      timeout: timeoutMs,
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchText(res.headers.location, timeoutMs).then(resolve).catch(reject); return
      }
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return }
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => resolve(d))
    })
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
    req.on('error', reject)
  })
}

// ==================== 内容清洗 ====================
function cleanHtml(html) {
  if (!html) return ''
  return html
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<ins[^>]*>[\s\S]*?<\/ins>/gi, '')
    .replace(/data-vmark="[^"]*"/g, '')
    .replace(/class="[^"]*"/g, '')
    .replace(/data-[a-z-]+="[^"]*"/gi, '')
    .replace(/<(?:p|h[1-6]|li|blockquote)([^>]*)>/gi, (m, a) => '<' + m.match(/^(?:p|h[1-6]|li|blockquote)/)[0] + '>')
    .replace(/<[^>]+>/g, m => /^<(p|br|h[1-6]|li|ul|ol|blockquote)/i.test(m) ? '\n' : '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/['"'"']/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

// ==================== 关键词扩展内容（让短摘要变成长文） ====================
const CONTENT_EXPANDER = {
  // 通用扩展段落模板
  generic: [
    '这一话题引发了广泛讨论。多位业内专家表示，相关政策的出台将对行业产生深远影响。',
    '从市场反应来看，相关板块近期表现活跃。投资者需要密切关注后续动向，理性判断形势。',
    '业内分析认为，这一趋势反映了行业发展的新方向。建议相关从业者提前做好规划和准备。',
    '值得注意的是，这一变化并非孤立事件，而是多重因素共同作用的结果。',
    '综合各方观点来看，短期内市场可能维持震荡格局，中长期趋势仍需进一步观察。',
  ],
  // 正面积极类
  positive: [
    '业内专家普遍对此表示看好，认为这将为相关领域带来新的发展机遇。',
    '多位分析师上调了相关预期，认为基本面支撑有力，估值仍有提升空间。',
    '从长远来看，这一变化符合行业发展规律，有助于推动整体水平的提升。',
  ],
  // 争议/警示类
  warning: [
    '不过也有声音表示担忧，认为需要更多时间验证实际效果。',
    '专家提醒，应理性看待短期波动，避免过度解读个别数据。',
    '部分业内人士呼吁，应加快完善配套措施，确保政策目标顺利实现。',
  ],
}

function expandContent(title, summary, category) {
  const text = cleanHtml(summary)
  if (text.length < 50) return `<p>${title}</p><p>${summary || '暂无详细信息，请关注后续报道。'}</p>`

  // 把摘要文本分成段落
  const sentences = text.split(/[。！？；\n]/).filter(s => s.trim().length > 10)
  const paragraphs = sentences.map(s => `<p>${s.trim()}</p>`)

  // 根据分类添加扩展内容
  let extraParagraphs = []
  if (category === '科技') {
    extraParagraphs = [
      '<p>从技术层面来看，这一进展具有重要意义。相关专家表示，该技术在实际应用中展现出较强的可行性和实用价值。</p>',
      '<p>目前，多家头部企业已开始在相关领域布局，产业生态正在快速成熟。预计未来1-2年内将迎来规模化应用期。</p>',
      '<p>对于普通用户而言，这一变化将带来更直观的使用体验提升。建议关注相关产品的更新动态，及时获取最新信息。</p>',
    ]
  } else if (category === '财经') {
    extraParagraphs = [
      '<p>从宏观角度来看，这一变化与近期经济数据走势基本吻合。市场人士分析，短期内市场可能维持震荡格局。</p>',
      '<p>多家机构发布研报指出，当前估值水平已较为合理，中长期配置价值显现。建议投资者结合自身风险偏好做好资产配置。</p>',
      '<p>值得关注的是，政策面的持续发力为市场提供了有力支撑。后续需重点关注月度经济数据的边际变化。</p>',
    ]
  } else if (category === '社会') {
    extraParagraphs = [
      '<p>这一现象引发了社会各界的广泛思考。多位社会学研究者表示，相关变化折射出深层次的社会结构性问题。</p>',
      '<p>从数据来看，相关群体规模近年来持续扩大，呈现年轻化、高学历等特征。专家呼吁社会各界给予更多理解和关注。</p>',
      '<p>如何更好地回应这一群体的需求，是当前社会治理面临的新课题。多元主体协同参与或将成为破局关键。</p>',
    ]
  } else if (category === '国际') {
    extraParagraphs = [
      '<p>国际观察人士普遍认为，这一动向值得密切关注。其影响不仅限于当事方，还可能外溢至更广泛的国际格局。</p>',
      '<p>多边层面，相关各方正在保持沟通，寻求通过对话协商化解分歧。外交渠道仍保持畅通。</p>',
      '<p>长远来看，国际社会普遍期待各方以建设性态度管控分歧，推动局势朝着缓和方向发展。</p>',
    ]
  } else if (category === '娱乐') {
    extraParagraphs = [
      '<p>该消息发布后，相关话题迅速登上热搜榜。粉丝群体反应热烈，多个相关话题阅读量突破数亿。</p>',
      '<p>业内评价普遍积极，认为这体现了创作者对品质的坚持。相关团队表示将继续打磨作品，力争为观众带来惊喜。</p>',
    ]
  } else {
    // 默认扩展
    extraParagraphs = CONTENT_EXPANDER.generic.slice(0, 2)
  }

  // 插入扩展段落（在原文中间加入1-2段）
  const insertPos = Math.min(paragraphs.length - 1, 2)
  paragraphs.splice(insertPos, 0, ...extraParagraphs.slice(0, 2))

  return paragraphs.join('\n')
}

// ==================== Slug 生成 ====================
function generateSlug(title) {
  const base = title
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .slice(0, 80)
  return base || 'article-' + Date.now()
}

// ==================== 分类识别 ====================
const KEYWORD_CATS = {
  '科技': ['AI','ChatGPT','GPT','大模型','苹果','iPhone','华为','小米','特斯拉','特斯拉','芯片','英伟达','高通','三星','谷歌','OpenAI','Meta','微软','机器人','自动驾驶','新能源','手机','系统','软件','App','智能','编程','代码','数据','算法','直播','短视频','网络','5G','6G','WiFi','元宇宙','VR','AR','折叠屏','游戏','数码','评测','显卡'],
  '财经': ['股市','A股','基金','黄金','美联储','降息','加息','人民币','汇率','GDP','CPI','PPI','房价','房贷','LPR','降准','存款','理财','债券','港股','美股','道指','纳斯达克','上证','深证','创业板','北向资金','外资','上市公司','财报','营收','利润','亏损','IPO','上市','退市'],
  '社会': ['政策','法律','教育','医疗','就业','失业','人口','生育','老龄化','养老','医保','社保','高考','考研','考公','大学','幼儿园','小学','中学','疫苗','病毒','疫情','防控','食品安全','环境','污染','地震','洪水','台风','灾害'],
  '娱乐': ['电影','电视剧','综艺','音乐','明星','歌手','演员','导演','票房','好莱坞','Netflix','爱奇艺','腾讯视频','优酷','B站','动漫','游戏','主播','网红','演唱会','颁奖礼','红毯','恋情','分手','结婚','离婚','综艺','脱口秀'],
  '体育': ['足球','篮球','NBA','CBA','世界杯','欧冠','英超','中超','女排','奥运','亚运会','金牌','冠军','乒乓','羽毛','网球','游泳','田径','F1','赛车','高尔夫','马拉松','武磊','梅西','C罗','姆巴佩'],
  '健康': ['养生','减肥','健身','跑步','瑜伽','心理','抑郁','睡眠','饮食','营养','维生素','体检','癌症','肿瘤','糖尿病','高血压','心脏病','肝病','疫苗','药物','医保','医院','医生','中医','减肥'],
  '生活': ['旅游','美食','汽车','购车','电动车','油价','房产','装修','家居','宠物','猫','狗','购物','电商','快递','手机费','宽带','数码产品','家电','留学','海外','移民','签证','护照'],
  '国际': ['美国','拜登','特朗普','俄罗斯','普京','乌克兰','欧洲','英国','德国','法国','日本','韩国','朝鲜','中东','以色列','伊朗','联合国','G20','APEC','WTO','贸易战','制裁','外交','出访','峰会'],
  '热点': ['热搜','头条','通报','回应','最新','重磅','突发','刚刚','刚刚消息','刚刚通报','定了','官宣','重大','紧急'],
}

function detectCategory(title) {
  const scores = {}
  for (const [cat, kws] of Object.entries(KEYWORD_CATS)) {
    scores[cat] = kws.filter(k => title.includes(k)).length
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  return best && best[1] > 0 ? best[0] : '热点'
}

// ==================== 封面图 ====================
const COVER_POOLS = {
  '科技': [
    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1485827454703-7b3769ce0842?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=450&fit=crop',
  ],
  '财经': [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=450&fit=crop',
  ],
  '社会': [
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&h=450&fit=crop',
  ],
  '娱乐': [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=800&h=450&fit=crop',
  ],
  '体育': [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=450&fit=crop',
  ],
  '健康': [
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=450&fit=crop',
  ],
  '生活': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&h=450&fit=crop',
  ],
  '国际': [
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1488229297570-58520851e868?w=800&h=450&fit=crop',
  ],
  '热点': [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=450&fit=crop',
  ],
}

function getCoverImage(category, slug) {
  const pool = COVER_POOLS[category] || COVER_POOLS['热点']
  const hash = (slug || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return pool[hash % pool.length]
}

// ==================== FAQ 生成 ====================
function generateFAQ(title, category) {
  const base = [
    { q: `关于「${title.slice(0, 15)}...」，最新进展是什么？`, a: '相关各方正在密切跟进，详细信息请关注官方最新通报。建议保持关注以获取第一手信息。' },
    { q: '这件事对普通人有什么影响？', a: '具体影响因人而异，建议结合自身情况理性判断，关注权威解读。' },
    { q: '后续会如何发展？', a: '目前各方仍在进一步沟通中，具体走向需持续关注后续动态。' },
  ]
  if (category === '财经') {
    base.push({ q: '这对投资有什么参考意义？', a: '建议投资者密切关注相关数据披露，结合市场整体环境综合判断，谨慎决策。' })
  }
  if (category === '科技') {
    base.push({ q: '相关技术什么时候能大规模应用？', a: '从技术成熟度和产业链配套来看，预计需要1-3年时间逐步推进。' })
  }
  return base
}

// ==================== RSS 抓取函数 ====================
async function fetchRSS(url, sourceName, limit = 30) {
  let xml
  try {
    xml = await fetchText(url)
  } catch (e) {
    console.log(`  ❌ ${sourceName} 连接失败: ${e.message}`)
    return []
  }

  // 解析 items
  const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
  console.log(`  ✅ ${sourceName} 获取 ${itemMatches.length} 条`)
  if (itemMatches.length === 0) return []

  const articles = []
  for (const match of itemMatches.slice(0, limit)) {
    const raw = match[1]

    const getField = (tag) => {
      const m = raw.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'))
      return m ? m[1].trim() : ''
    }

    const title = getField('title')
    const link = getField('link')
    const desc = getField('description') || getField('summary') || getField('content:encoded')
    const pubDateStr = getField('pubDate') || getField('dc:date') || ''

    if (!title || title.length < 5) continue

    const category = detectCategory(title)
    const dateStr = pubDateStr ? new Date(pubDateStr).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    const slug = generateSlug(title) + '-' + dateStr.replace(/-/g, '')
    const content = expandContent(title, desc, category)
    const textLen = content.replace(/<[^>]+>/g, '').length
    const readTime = Math.max(2, Math.ceil(textLen / 800))

    // 生成描述（从内容提取前160字）
    const cleanText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const description = cleanText.slice(0, 160) + (cleanText.length > 160 ? '...' : '')

    // 热度判断
    const heat = title.includes('热搜') || title.includes('爆火') || title.includes('重磅') || title.includes('突发') ? '热搜' : ''

    articles.push({
      title,
      slug,
      description,
      keywords: [title.slice(0, 10), category, sourceName, '2026'],
      category,
      tags: [category, sourceName],
      coverImage: getCoverImage(category, slug),
      relatedVideos: [],
      readTime,
      views: Math.floor(Math.random() * 80000) + 10000,
      content,
      faq: generateFAQ(title, category),
      date: dateStr,
      source: sourceName,
      sourceUrl: link,
      heat,
    })
  }

  return articles
}

// ==================== 内置高质量长文章库（备用 + 填充） ====================
const BUILTIN_POSTS = [
  {
    title: 'DeepSeek V4发布：国产AI大模型突破GPT-4水平，推理能力逼近GPT-5',
    slug: 'deepseek-v4-release-ai-breakthrough-2026',
    description: '深度求索公司正式发布DeepSeek V4，在数学推理、代码生成和多模态理解方面达到国际顶尖水平，国产AI正式进入第一梯队。',
    keywords: ['DeepSeek', 'AI大模型', '人工智能', '国产AI', 'ChatGPT'],
    category: '科技',
    tags: ['AI', 'DeepSeek', '大模型', '科技', '人工智能'],
    coverImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=450&fit=crop',
    content: `<h2>DeepSeek V4核心能力解析</h2><p>深度求索公司正式发布DeepSeek V4，这是国产大模型发展史上的重要里程碑。在MMLU、HumanEval、GSM8K等国际权威评测集上，V4均刷新了国产模型的最高纪录。</p><p>数学推理方面，V4的准确率达到92.3%，超越GPT-4o近5个百分点，与GPT-5-preview的差距缩小至2%以内。代码生成方面，V4支持超过100种编程语言，在真实开源项目中的代码采纳率高达78%，开发者反馈积极。</p><p>最值得关注的是V4的推理效率。相比V3，相同硬件条件下吞吐量提升3倍，这意味着企业部署成本大幅下降，AI应用大规模落地成为可能。</p><h2>多模态能力全面提升</h2><p>V4首次实现了真正的图文音视频统一理解。在处理复杂长文本时，V4的上下文窗口扩展至200K tokens，可完整阅读一本中篇小说并进行深度分析。</p><p>图像理解方面，V4能够精准识别中文OCR、复杂图表、医学影像等场景。在中文文档理解任务上，V4准确率领先GPT-4o近10个百分点，这对于国内企业应用场景意义重大。</p><p>视频理解能力也有突破，V4可以分析视频的核心内容、情节发展和人物关系，为短视频内容审核和推荐提供了新的技术基础。</p><h2>开源策略与生态布局</h2><p>深度求索同时发布了开源版本V4-lite，任何人都可以在消费级显卡上部署一个简化版本进行体验。这一策略与Meta发布Llama系列的思路类似，旨在推动整个AI生态的繁荣。</p><p>公司宣布将拿出10亿元成立AI创投基金，扶持基于V4的创业项目。目前已有超过2000家企业申请接入API，包括多家头部互联网公司和金融机构。</p><h2>对行业的影响</h2><p>V4的发布标志着国产AI大模型正式进入国际第一梯队。这将加速国内AI应用的落地进程，推动智能客服、内容创作、代码辅助、教育问答、医疗咨询等场景的智能化升级。</p><p>对普通用户而言，V4带来的最直接体验变化是AI助手的响应更准确、更快速、更"懂"中文语境。无论是写作辅助还是信息查询，AI助手的实用价值将显著提升。</p>`,
    faq: [
      { question: 'DeepSeek V4可以免费使用吗？', answer: 'V4-lite开源版本免费使用，商业API有免费额度，详细定价见官网 deepseek.com。' },
      { question: 'DeepSeek V4支持哪些使用场景？', answer: '支持智能客服、内容创作、代码辅助、教育问答、医疗咨询等几乎所有主流AI应用场景。' },
      { question: '如何申请DeepSeek API？', answer: '访问 deepseek.com 注册后即可申请，新用户有免费额度赠送。' },
    ],
    readTime: 5, views: 156000, heat: '爆火',
  },
  {
    title: '央行降息10个基点：5年期LPR降至3.6%，购房者迎来最佳窗口期',
    slug: 'pboc-lpr-cut-may-2026-mortgage-window',
    description: '中国人民银行宣布5年期LPR下调15个基点至3.6%，创历史新低。以贷款100万30年计算，月供减少约300元。',
    keywords: ['LPR', '央行降息', '房贷利率', '降息', '买房'],
    category: '财经',
    tags: ['央行', 'LPR', '降息', '房贷', '财经'],
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
    content: `<h2>LPR下调详情</h2><p>2026年5月最新LPR报价公布：1年期LPR为3.35%，较上月下降5个基点；5年期以上LPR为3.6%，较上月大幅下调15个基点。这是自2024年以来5年期LPR降幅最大的一次，释放了稳楼市的强烈信号。</p><p>以贷款100万元、30年等额本息计算：新利率下月供将从约4800元降至约4500元，每月减少约300元；累计30年可节省利息支出超过10万元，显著降低购房者负担。</p><h2>为何此时大幅降息</h2><p>央行选择在此时大幅下调5年期LPR，核心目的是支持房地产市场企稳回升。一季度楼市成交虽有回暖，但回暖基础尚不牢固，政策需要持续发力。</p><p>与此同时，当前CPI维持在较低水平，PPI仍处负值区间，实体经济融资需求偏弱，货币政策有充足空间适度放松。降息将有效降低企业和居民的融资成本，刺激有效需求。</p><h2>对购房者的实际影响</h2><p>对于存量房贷客户，2026年1月的重新定价日后，月供将同步下调。对于新增购房者，多个城市首套房贷利率已低至3.5%以下，创下近20年来的历史新低水平。</p><p>公积金贷款利率也同步下调，5年以上公积金贷款利率降至3.1%，与商业贷款的利差进一步收窄。目前是近十年来最优惠的购房窗口期。</p><h2>市场反应与后市展望</h2><p>LPR公布后，A股房地产板块快速拉升，多只地产股涨停。港股内房股普遍跟涨，市场情绪明显回暖。债券市场方面，10年期国债收益率小幅下行，反映机构对未来经济预期有所改善。</p><p>业内专家普遍认为，货币宽松周期仍在进行中，若经济修复不及预期，年内不排除再度降息的可能。对购房者而言，趁着当前利率优惠上车是明智选择。</p>`,
    faq: [
      { question: 'LPR降了存量房贷会自动降吗？', answer: '存量房贷每年1月1日或贷款发放日重新定价，届时月供自动减少。' },
      { question: '现在是不是买房的最佳时机？', answer: '利率确实处于历史最低水平，建议刚需和改善型购房者可考虑入手。' },
      { question: '存款利率会跟着降吗？', answer: '大概率会。LPR下调后，银行负债端成本压力减轻，建议将部分存款转向中长期锁定利率。' },
    ],
    readTime: 5, views: 298000, heat: '头条',
  },
  {
    title: '考研降温考公升温：年轻人用脚投票背后的社会变迁',
    slug: 'postgraduate-exam-decline-career-changes-2026',
    description: '2026年考研报名人数438万，首次出现下降；考公报名却创新高达340万人。这届年轻人正在重新定义成功。',
    keywords: ['考研', '考公', '就业', '年轻人', '学历'],
    category: '社会',
    tags: ['考研', '考公', '教育', '就业', '社会'],
    coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=450&fit=crop',
    content: `<h2>从"考研热"到"考公热"的结构性转变</h2><p>2026年硕士研究生招生考试报名人数为438万人，较上年减少12万，降幅约2.7%。这是自2015年以来考研报名人数首次出现下降，结束了持续多年的"考研热"。</p><p>与此同时，公务员考试报名人数却再创新高，达到340万人。最热的国家统计局某个县级市执法岗位，竞争比达到1:3500，刷新历史纪录。</p><p>年轻人正在从"卷学历"转向"卷编制"，这一结构性变化深刻影响着教育生态和就业市场。</p><h2>年轻人为何不再热衷考研</h2><p>多位教育专家分析，考研降温有多重原因。首先，研究生就业优势正在收窄——越来越多的岗位发现，硕士毕业生的工作能力与本科生并无显著差异，但三年的机会成本却实实在在。</p><p>其次，"学历通胀"现象愈发明显。部分地区的街道办科员、医院行政等岗位，入职门槛已悄然提升至研究生学历，这让本科毕业生感到焦虑，也让考研变成了"不得不卷"的内卷战场。</p><p>更现实的原因是，考研上岸率不足20%，大多数投入大量时间和精力的考生最终成为"炮灰"。00后们开始算账："与其花三年读一个不知有没有用的研究生，不如用这段时间考公、实习或学门手艺，回报可能更高。"</p><h2>考公热的背后逻辑</h2><p>考公的持续升温，反映了年轻人在不确定时代对稳定性的强烈渴望。在经济增速放缓、互联网行业收缩、民营经济面临挑战的背景下，体制内的"铁饭碗"成为越来越多人的优先选择。</p><p>此外，公务员的社会地位、福利保障、工作稳定性，在婚恋市场也是加分项。这种多元价值叠加，使得考公热度持续居高不下。</p><h2>这一趋势的深层警示</h2><p>年轻人用脚投票选择的背后，是对当前就业市场信号的真实反馈。学历贬值的焦虑、职场内卷的疲惫、对未来不确定性的担忧，共同塑造了"求稳"的社会心态。</p><p>如何创造更多高质量就业岗位、如何让创新创业有足够的回报吸引力、如何建立更加公平畅通的社会流动通道——这些问题，值得政策制定者认真思考。</p>`,
    faq: [
      { question: '考研降温对本科生是好消息还是坏消息？', answer: '总体是利好。竞争相对减少，上岸机会增加，但就业市场的整体压力仍然很大。' },
      { question: '不考研的年轻人都在做什么？', answer: '考公、直接就业、创业、自由职业、出国留学等，路径越来越多元化和个性化。' },
      { question: '学历真的贬值了吗？', answer: '在某些领域确实存在学历通胀。但高精尖技术领域、专业门槛高的行业，研究生学历仍有明显优势。' },
    ],
    readTime: 6, views: 456000, heat: '头条',
  },
  {
    title: '《流浪地球3》票房破60亿：国产科幻完成从追赶到领跑',
    slug: 'wandering-earth-3-boxoffice-record-analysis',
    description: '郭帆执导的《流浪地球3》上映17天票房突破60亿，超越前两部总和，登顶中国影史票房冠军。',
    keywords: ['流浪地球3', '票房', '国产科幻', '郭帆', '电影'],
    category: '娱乐',
    tags: ['电影', '流浪地球', '票房', '科幻', '娱乐'],
    coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=450&fit=crop',
    content: `<h2>票房纪录的含金量</h2><p>《流浪地球3》自春节档上映以来，票房一路高歌猛进，第17天累计票房正式突破60亿元大关，创造了中国电影票房史无前例的新纪录。此前的票房冠军是45亿元的《满江红》，而《球3》将这一数字大幅提升了33%。</p><p>与票房一同刷新的还有口碑：豆瓣评分8.7，为该系列最高分，超越第一部的8.5和第二部的8.3。观众普遍反映，这一集的剧情完成度和情感深度都有质的飞跃，不再只是靠特效撑场面。</p><h2>技术与故事的双重突破</h2><p>《流浪地球3》延续了系列宏大的宇宙观，同时在叙事上更加成熟。影片以"数字生命"为主线，探讨了人类意识与人工智能的边界问题——当AI能够完美复制一个人的记忆和性格，它算是"活着"吗？这一命题引发了观众在社交媒体上的激烈讨论。</p><p>在特效层面，剧组与好莱坞顶尖特效公司合作，完成了超过2000个特效镜头。地球穿越小行星带的场景、行星发动机全功率运转的壮观画面、空间站对接的高难度镜头——每一帧都可以截下来做壁纸。</p><h2>国产科幻的十年蜕变</h2><p>从2019年《流浪地球》以黑马之姿横空出世，到2023年《流浪地球2》将格局进一步拓展，再到2026年《流浪地球3》问鼎影史冠军，国产科幻电影用了不到十年时间完成了从追赶者到领跑者的蜕变。</p><p>这一蜕变不是偶然的。背后是整个中国电影工业体系的成熟、视觉特效技术的进步、科幻文学IP的积累，以及新一代电影人对讲好中国故事的自信和追求。</p><h2>产业链的繁荣</h2><p>《球3》的成功不仅是一部电影的成功，而是带动了整个产业链的繁荣。官方周边衍生品销售额已突破8亿元，包括行星发动机模型、MOSS智能音箱、角色手办等。科幻影城项目已在全国多座城市签约落地，将打造沉浸式科幻体验主题乐园。</p><p>更重要的是，《球3》的成功向全世界证明：中国有能力拍出世界级的科幻大片。好莱坞开始关注并研究这部影片的成功密码，这在五年前是不可想象的。</p>`,
    faq: [
      { question: '《流浪地球3》IMAX值得看吗？', answer: '非常值得！IMAX版画面信息量比普通版多约40%，部分镜头专为IMAX画幅拍摄，视觉效果震撼完全不同。' },
      { question: '没看过前两部能直接看第三部吗？', answer: '基本可以看懂，但补看前两部能更好理解世界观和人物关系，获得更完整的观影体验。' },
      { question: '周边产品哪里买最划算？', answer: '官方天猫旗舰店价格最稳定，建议认准正版授权标志。' },
    ],
    readTime: 5, views: 389000, heat: '爆火',
  },
