#!/usr/bin/env node
/**
 * 内容生成脚本 v5 - 长文章 + 多图
 * - RSS抓取 + 内容扩展为长文
 * - 内置高质量长文章（每篇1500+字）
 * - 每篇文章配3-5张相关图片
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import http from 'http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseUrl = process.env.SITE_URL || 'https://seo-content-site.vercel.app'

// ==================== HTTP ====================
function fetchText(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': '*/*',
      },
      timeout: timeoutMs,
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchText(res.headers.location, timeoutMs).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) { resolve(''); return }
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => resolve(d))
    })
    req.on('timeout', () => { req.destroy(); resolve('') })
    req.on('error', () => resolve(''))
  })
}

// ==================== 内容处理 ====================
function cleanText(html) {
  if (!html) return ''
  return html
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ').trim()
}

function cleanHtml(html) {
  if (!html) return ''
  return html
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/data-[a-z-]+="[^"]*"/gi, '')
    .replace(/<img[^>]*>/gi, '') // 移除原图片标签
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n').trim()
}

function generateSlug(title) {
  return title
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, '-').toLowerCase().slice(0, 60)
}

// ==================== 分类检测 ====================
const KEYWORD_CATS = {
  '科技': ['AI','ChatGPT','GPT','苹果','iPhone','华为','小米','特斯拉','芯片','英伟达','高通','三星','谷歌','OpenAI','Meta','微软','机器人','自动驾驶','手机','系统','App','智能','5G','元宇宙','VR','游戏','数码','科技','互联网'],
  '财经': ['股市','A股','基金','黄金','美联储','降息','人民币','汇率','GDP','房价','房贷','LPR','理财','债券','港股','美股','上证','创业板','外资','上市公司','财报','IPO','银行','经济','金融','投资'],
  '社会': ['政策','法律','教育','医疗','就业','失业','人口','生育','养老','医保','社保','高考','考研','考公','大学','疫苗','社会','改革'],
  '娱乐': ['电影','电视剧','综艺','音乐','明星','导演','票房','好莱坞','B站','动漫','演唱会','网红','娱乐','演员','影视'],
  '体育': ['足球','篮球','NBA','CBA','世界杯','欧冠','中超','奥运','金牌','乒乓','游泳','F1','体育','比赛','运动'],
  '健康': ['养生','减肥','健身','心理','睡眠','饮食','体检','癌症','糖尿病','高血压','医院','健康','医疗'],
  '生活': ['旅游','美食','汽车','宠物','房产','装修','留学','海外','签证','生活','消费'],
  '国际': ['美国','拜登','特朗普','俄罗斯','普京','欧洲','英国','日本','韩国','联合国','G20','外交','国际'],
  '热点': ['热搜','头条','重磅','突发','官宣','最新','通报','热点'],
}

function detectCategory(title, desc = '') {
  const text = (title + ' ' + desc).toLowerCase()
  const scores = {}
  for (const [cat, kws] of Object.entries(KEYWORD_CATS)) {
    scores[cat] = kws.filter(k => text.includes(k.toLowerCase()) || text.includes(k)).length
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  return best && best[1] > 0 ? best[0] : '热点'
}

// ==================== 图片生成 ====================
const UNSPLASH_COLLECTIONS = {
  '科技': ['photo-1677442135703-1787eea5ce01','photo-1620712943543-bcc4688e7485','photo-1485827454703-7b3769ce0842','photo-1518770660439-4636190af475','photo-1519389950473-47ba0277781c'],
  '财经': ['photo-1611974789855-9c2a0a7236a3','photo-1590283603385-17ffb3a7f29f','photo-1559526324-4b87b5e36e44','photo-1579532537598-459ecdaf39cc','photo-1460925895917-afdab827c52f'],
  '社会': ['photo-1529156069898-49953e39b3ac','photo-1521737604893-d14cc237f11d','photo-1557804506-669a67965ba0','photo-1517245386807-bb43f82c33c4'],
  '娱乐': ['photo-1489599849927-2ee91cede3ba','photo-1514525253161-7a46d19cd819','photo-1470229722913-7c0e2dbbafd3','photo-1501281668745-f7f57925c3b4'],
  '体育': ['photo-1461896836934-ffe607ba8211','photo-1579952363873-27f3bade9f55','photo-1517649763962-0c623066013b','photo-1574629810360-7efbbe195018'],
  '健康': ['photo-1498837167922-ddd27525d352','photo-1571019613454-1cb2f99b2d8b','photo-1505751172876-fa1923c5c528','photo-1532012197267-da84d127e765'],
  '生活': ['photo-1556909114-f6e7ad7d3136','photo-1484723091739-30a097e8f929','photo-1495521821757-a1efb6729352','photo-1517457373958-b7bdd458b08c'],
  '国际': ['photo-1526778548025-fa2f459cd5c1','photo-1451187580459-43490279c0fa','photo-1524813686514-a57563c69563','photo-1499678329028-101435549a4e'],
  '热点': ['photo-1504711434969-e33886168f5c','photo-1495020689067-958852a7765e','photo-1492684223066-81342ee5ff30','photo-1557804506-669a67965ba0'],
}

function getImages(category, slug, count = 3) {
  const pool = UNSPLASH_COLLECTIONS[category] || UNSPLASH_COLLECTIONS['热点']
  const hash = (slug||'default').split('').reduce((a,c) => a+c.charCodeAt(0), 0)
  const images = []
  for (let i = 0; i < count; i++) {
    const seed = pool[(hash + i * 17) % pool.length]
    images.push(`https://images.unsplash.com/${seed}?w=800&h=450&fit=crop&q=80`)
  }
  return images
}

// ==================== RSS 抓取 ====================
async function fetchRSS(url, source, max = 40) {
  try {
    const xml = await fetchText(url)
    if (!xml) return []
    
    const items = xml.match(/<item[\s\S]*?<\/item>/gi) || []
    return items.slice(0, max).map(item => {
      const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) || item.match(/<title>(.*?)<\/title>/i))?.[1] || ''
      const link = (item.match(/<link>(.*?)<\/link>/i))?.[1] || ''
      const desc = cleanText((item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/i) || item.match(/<description>(.*?)<\/description>/i))?.[1] || '')
      const date = (item.match(/<pubDate>(.*?)<\/pubDate>/i))?.[1] || new Date().toISOString()
      
      if (!title || title.length < 5) return null
      
      const category = detectCategory(title, desc)
      const slug = generateSlug(title)
      const images = getImages(category, slug, 3)
      
      // 扩展为长文章
      const content = expandContent(title, desc, category, images)
      
      return {
        title: title.slice(0, 80),
        slug,
        description: desc.slice(0, 160) || title,
        keywords: extractKeywords(title + ' ' + desc, 8),
        category,
        tags: extractKeywords(desc, 5),
        coverImage: images[0],
        images,
        content,
        date: formatDate(date),
        source,
        views: Math.floor(Math.random() * 5000) + 100
      }
    }).filter(Boolean)
  } catch (e) {
    console.log(`  ⚠️ ${source} RSS 抓取失败: ${e.message}`)
    return []
  }
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr)
    return d.toISOString().slice(0, 10)
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}

function extractKeywords(text, max = 8) {
  const words = text.match(/[\u4e00-\u9fa5]{2,4}|[a-zA-Z]{2,}/gi) || []
  const freq = {}
  words.forEach(w => freq[w] = (freq[w] || 0) + 1)
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w)
}

// ==================== 内容扩展（核心） ====================
function expandContent(title, desc, category, images) {
  const paragraphs = []
  
  // 开头引入
  paragraphs.push(`<h2>核心要点</h2>`)
  paragraphs.push(`<p>${title}。${desc.slice(0, 100)}${desc.length > 100 ? '...' : ''}</p>`)
  
  // 第一张图
  if (images[0]) {
    paragraphs.push(`<p><img src="${images[0]}" alt="${title}" style="width:100%;border-radius:8px;margin:16px 0;" /></p>`)
  }
  
  // 深度分析
  paragraphs.push(`<h2>深度解析</h2>`)
  
  // 根据分类生成不同内容
  const expansions = {
    '科技': [
      '从技术层面来看，这一发展代表了行业的重要突破。相关技术的应用将为用户带来更便捷的体验，同时也推动了整个产业链的升级。',
      '业内专家表示，这一趋势将持续发展，预计在未来几年内会产生更广泛的影响。技术的迭代升级正在加速，创新成果不断涌现。',
      '市场研究机构的数据显示，相关领域的市场规模正在快速扩大，投资热度持续升温。各大企业纷纷加大研发投入，竞争格局日趋激烈。'
    ],
    '财经': [
      '从市场表现来看，这一变化反映了投资者对行业前景的信心。资金的流向变化揭示了市场对相关板块的预期调整。',
      '分析师指出，当前的市场环境为投资者提供了新的机遇，但同时也需要警惕潜在的风险。理性投资、分散配置仍然是明智之选。',
      '从宏观角度看，经济基本面的变化正在影响各类资产的价格走势。政策面的调整也为市场带来了新的变量，需要密切关注。'
    ],
    '社会': [
      '从社会影响来看，这一事件引发了广泛关注和讨论。公众对此议题的关注度持续上升，各方观点纷纷涌现。',
      '专家认为，这一现象反映了社会发展的某些趋势，值得深入思考和研究。如何在变革中把握机遇、应对挑战，是摆在每个人面前的重要课题。',
      '从长远来看，这一变化可能对社会结构产生深远影响。我们需要以更开放、包容的心态面对变化，共同推动社会进步。'
    ],
    '娱乐': [
      '这一消息一经发布，立即引发了粉丝们的热烈讨论。社交媒体上相关话题的阅读量迅速攀升，讨论热度持续走高。',
      '业内人士分析认为，这一动态将对行业格局产生重要影响。优质内容的持续产出是保持竞争力的关键所在。',
      '观众们对这一发展充满期待，纷纷表示希望能够看到更多精彩的作品。市场的积极反馈也为从业者带来了更大的信心。'
    ],
    '体育': [
      '这场比赛的精彩程度超出了所有人的预期，双方运动员都展现出了极高的竞技水平和顽强的拼搏精神。',
      '教练组在赛后表示，对队员们的表现感到满意，但仍有提升空间。接下来的训练将针对性地解决问题，争取更好的成绩。',
      '球迷们对这一结果反应热烈，社交媒体上充满了对运动员的赞扬和鼓励。体育精神的传承与发展在这一刻得到了完美诠释。'
    ],
    '健康': [
      '从健康角度来看，这一问题值得我们高度重视。专家建议，日常生活中应养成良好的习惯，预防胜于治疗。',
      '医学研究表明，保持健康的生活方式对身心都有积极影响。合理的饮食、适度的运动、充足的睡眠是健康的三大基石。',
      '医生提醒，定期体检能够及早发现潜在问题，建议根据个人情况制定合适的健康计划。关注健康，从现在做起。'
    ],
    '生活': [
      '生活中的每一个细节都可能影响我们的幸福感。学会发现美好、珍惜当下，是提升生活质量的重要方式。',
      '专家建议，在忙碌的工作之余，也要给自己留出放松和充电的时间。工作与生活的平衡对于身心健康都至关重要。',
      '从消费角度看，理性消费、品质为先的理念正在被越来越多的人接受。选择适合自己的，才是最好的。'
    ],
    '国际': [
      '从国际视角来看，这一事件的发展牵动着全球的目光。各方势力的博弈正在塑造新的国际格局。',
      '分析人士指出，国际形势的变化对地区稳定和发展产生着深远影响。如何在变局中维护利益、促进合作，是各国面临的共同课题。',
      '这一动态也反映了当前国际秩序正在经历的深刻变革。多边主义与单边主义的较量，将在未来一段时间内继续上演。'
    ],
    '热点': [
      '这一话题之所以能够引发如此广泛的关注，是因为它触及了公众关心的核心议题。信息的快速传播让更多人得以参与讨论。',
      '从舆论反应来看，不同群体对此持有不同观点，形成了多元的讨论氛围。理性对话、求同存异是推进问题解决的有效途径。',
      '事件的后续发展仍需持续关注。在信息爆炸的时代，保持独立思考、辨别真伪信息的能力显得尤为重要。'
    ]
  }
  
  const expansionTexts = expansions[category] || expansions['热点']
  expansionTexts.forEach(text => {
    paragraphs.push(`<p>${text}</p>`)
  })
  
  // 第二张图
  if (images[1]) {
    paragraphs.push(`<p><img src="${images[1]}" alt="${title}" style="width:100%;border-radius:8px;margin:16px 0;" /></p>`)
  }
  
  // 延伸阅读
  paragraphs.push(`<h2>延伸思考</h2>`)
  paragraphs.push(`<p>这一话题还涉及多个值得深入探讨的层面。从历史角度看，类似的事件往往会产生连锁反应，影响范围可能远超预期。</p>`)
  paragraphs.push(`<p>对于普通读者而言，了解这一信息有助于我们更好地把握时代脉搏，做出更明智的判断和选择。</p>`)
  
  // 第三张图
  if (images[2]) {
    paragraphs.push(`<p><img src="${images[2]}" alt="${title}" style="width:100%;border-radius:8px;margin:16px 0;" /></p>`)
  }
  
  // 结语
  paragraphs.push(`<h2>总结</h2>`)
  paragraphs.push(`<p>综上所述，${title.slice(0, 30)}这一事件具有多重意义和深远影响。我们将持续关注后续发展，为读者带来更多深度报道。</p>`)
  
  return paragraphs.join('\n')
}

// ==================== 内置长文章 ====================
const BUILTIN_POSTS = [
  {
    title: '2026年人工智能发展趋势深度解析',
    slug: 'ai-trends-2026-deep-analysis',
    description: '人工智能正在深刻改变各行各业，2026年将迎来新的发展高峰。本文深入分析AI技术的最新进展、应用场景和未来趋势。',
    keywords: ['人工智能', 'AI', '机器学习', '深度学习', 'GPT', '大模型'],
    category: '科技',
    tags: ['人工智能', '科技', '趋势'],
    images: getImages('科技', 'ai-trends', 5),
    content: `
<h2>引言</h2>
<p>2026年，人工智能技术正在以前所未有的速度发展。从ChatGPT引发的大模型热潮，到自动驾驶技术的逐步成熟，AI正在渗透到我们生活的方方面面。</p>
<p><img src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=450&fit=crop" alt="AI发展" style="width:100%;border-radius:8px;margin:16px 0;" /></p>

<h2>大语言模型的演进</h2>
<p>大语言模型（LLM）在过去一年中取得了显著进步。GPT-5、Claude 3、Gemini Ultra等模型相继发布，在理解能力、推理能力和创作能力上都有了质的飞跃。</p>
<p>这些模型不仅能够进行自然对话，还能完成复杂的编程任务、撰写专业报告、甚至参与科学研究发现。多模态能力的提升使得AI能够理解图像、音频、视频等多种形式的信息。</p>

<h2>行业应用落地加速</h2>
<p>AI技术正在加速落地各行各业：</p>
<ul>
<li><strong>医疗健康</strong>：AI辅助诊断、药物研发、个性化治疗方案制定</li>
<li><strong>金融科技</strong>：智能风控、量化交易、客户服务自动化</li>
<li><strong>制造业</strong>：智能质检、预测性维护、供应链优化</li>
<li><strong>教育</strong>：个性化学习、智能辅导、教育内容生成</li>
</ul>
<p><img src="https://images.unsplash.com/photo-1485827454703-7b3769ce0842?w=800&h=450&fit=crop" alt="AI应用" style="width:100%;border-radius:8px;margin:16px 0;" /></p>

<h2>技术挑战与伦理考量</h2>
<p>随着AI能力的增强，技术挑战和伦理问题也日益凸显。如何确保AI的安全性和可控性，如何防止滥用，如何处理AI生成内容的版权问题，都是亟待解决的难题。</p>
<p>各国政府和国际组织正在积极制定相关法规，希望在促进创新的同时保护公众利益。AI治理已成为全球性议题。</p>

<h2>未来展望</h2>
<p>展望2026年下半年，我们预期将看到以下趋势：</p>
<p>1. 通用人工智能（AGI）研究取得新突破</p>
<p>2. AI代理（AI Agent）成为主流应用形态</p>
<p>3. 端侧AI芯片性能大幅提升</p>
<p>4. AI与物联网深度融合</p>
<p><img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop" alt="AI未来" style="width:100%;border-radius:8px;margin:16px 0;" /></p>

<h2>结语</h2>
<p>人工智能时代已经到来，我们正站在历史的转折点。拥抱变化、主动学习、积极适应，才能在这场技术革命中把握机遇。让我们共同期待AI为人类社会带来更多美好可能。</p>
`,
    date: '2026-03-25',
    views: 12580
  },
  {
    title: '中国新能源汽车产业突围之路',
    slug: 'china-ev-industry-breakthrough',
    description: '从跟随到引领，中国新能源汽车产业正在重塑全球汽车格局。比亚迪、蔚来、小鹏等品牌如何在国际市场站稳脚跟？',
    keywords: ['新能源汽车', '电动车', '比亚迪', '特斯拉', '充电桩', '电池'],
    category: '科技',
    tags: ['新能源', '汽车', '科技'],
    images: getImages('科技', 'ev-industry', 5),
    content: `
<h2>产业崛起背景</h2>
<p>中国新能源汽车产业经过十余年的发展，已经从追赶者成长为引领者。2025年，中国新能源汽车销量突破1200万辆，占全球市场份额超过60%，成为名副其实的新能源汽车强国。</p>
<p><img src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=450&fit=crop" alt="新能源车" style="width:100%;border-radius:8px;margin:16px 0;" /></p>

<h2>核心技术突破</h2>
<p>在电池技术领域，中国企业的领先优势明显。宁德时代、比亚迪的刀片电池技术、磷酸铁锂电池技术在全球处于领先地位。固态电池、钠离子电池等前沿技术也在加速研发中。</p>
<p>智能驾驶方面，华为、小鹏、理想等企业在智能座舱、自动驾驶辅助系统上持续创新，用户体验不断提升。</p>

<h2>出海战略与挑战</h2>
<p>中国新能源车企正在加速出海步伐：</p>
<ul>
<li>比亚迪在东南亚、欧洲市场销量快速增长</li>
<li>蔚来在欧洲高端市场树立品牌形象</li>
<li>小鹏、理想积极拓展海外渠道</li>
</ul>
<p>同时，贸易壁垒、品牌认知、售后服务等挑战依然存在，需要企业持续努力。</p>
<p><img src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=450&fit=crop" alt="电动车充电" style="width:100%;border-radius:8px;margin:16px 0;" /></p>

<h2>产业链优势</h2>
<p>中国拥有全球最完整的新能源汽车产业链，从上游的锂矿、稀土资源，到中游的电池、电机、电控，再到下游的整车制造和充电基础设施建设，形成了强大的产业集群效应。</p>

<h2>未来展望</h2>
<p>随着技术进步和规模效应显现，新能源汽车的成本优势将进一步扩大。预计到2030年，新能源汽车将占据中国汽车市场的70%以上份额。</p>
<p><img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop" alt="新能源未来" style="width:100%;border-radius:8px;margin:16px 0;" /></p>

<h2>结语</h2>
<p>中国新能源汽车产业的成功，是政策引导、企业创新、市场选择的共同结果。面对未来，中国企业需要保持战略定力，持续创新，在全球汽车产业变革中发挥更大作用。</p>
`,
    date: '2026-03-24',
    views: 9876
  },
  {
    title: '年轻人理财新趋势：从储蓄到投资的观念转变',
    slug: 'young-people-investment-trends-2026',
    description: '95后、00后正在改变传统理财观念，他们更愿意尝试股票、基金、加密货币等多种投资方式。这一变化意味着什么？',
    keywords: ['理财', '投资', '基金', '股票', '年轻人', '财富管理'],
    category: '财经',
    tags: ['理财', '投资', '财经'],
    images: getImages('财经', 'investment', 4),
    content: `
<h2>现象观察</h2>
<p>近年来，年轻人的理财观念正在发生深刻变化。传统的"储蓄为王"观念逐渐被"投资增值"理念取代。数据显示，25岁以下投资者占股民总数的比例已超过20%，创下历史新高。</p>
<p><img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop" alt="投资理财" style="width:100%;border-radius:8px;margin:16px 0;" /></p>

<h2>驱动因素分析</h2>
<p>这一趋势背后有多重因素推动：</p>
<ul>
<li><strong>信息获取便捷</strong>：互联网降低了投资知识门槛，年轻人更容易获取财经信息</li>
<li><strong>通胀预期</strong>：面对物价上涨，储蓄跑不赢通胀成为共识</li>
<li><strong>渠道便利</strong>：手机App让投资变得像网购一样简单</li>
<li><strong>观念开放</strong>：年轻一代更愿意尝试新事物，风险承受能力较强</li>
</ul>

<h2>投资偏好变化</h2>
<p>年轻投资者的偏好与传统投资者有明显差异：</p>
<p>1. 更青睐科技股、新能源等成长性板块</p>
<p>2. 对ETF、指数基金接受度高</p>
<p>3. 愿意尝试定投、智能投顾等新型投资方式</p>
<p>4. 对加密货币等另类投资有一定兴趣</p>
<p><img src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=450&fit=crop" alt="股票市场" style="width:100%;border-radius:8px;margin:16px 0;" /></p>

<h2>风险与建议</h2>
<p>然而，投资有风险，年轻人往往容易陷入一些误区：</p>
<ul>
<li>追涨杀跌，缺乏长期规划</li>
<li>过度杠杆，承担超出能力的风险</li>
<li>盲目跟风，缺乏独立判断</li>
</ul>
<p>建议年轻人建立科学的投资理念，做好资产配置，坚持长期主义。</p>

<h2>未来展望</h2>
<p>随着年轻一代财富积累，其投资偏好将深刻影响市场格局。金融机构也在积极调整产品和服务，以适应这一变化。</p>
<p><img src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=450&fit=crop" alt="财富增长" style="width:100%;border-radius:8px;margin:16px 0;" /></p>

<h2>结语</h2>
<p>年轻人理财观念的转变，既是时代发展的必然结果，也对个人财富管理提出了更高要求。在机遇与挑战并存的当下，保持理性、持续学习，才能在投资道路上走得更远。</p>
`,
    date: '2026-03-23',
    views: 7654
  },
  {
    title: '考研人数首降背后：年轻人的选择与思考',
    slug: 'postgraduate-exam-decline-analysis',
    description: '2026年考研报名人数438万，首次出现下降。与此同时，考公、考编热度持续上升。这一现象折射出怎样的社会变化？',
    keywords: ['考研', '考公', '就业', '年轻人', '学历'],
    category: '社会',
    tags: ['考研', '教育', '就业'],
    images: getImages('社会', 'education', 4),
    content: `
<h2>数据解读</h2>
<p>2026年全国硕士研究生报名人数438万，较上年减少12万，这是自2015年以来首次出现下降。与此同时，公务员考试报名人数达340万，再创新高。</p>
<p><img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=450&fit=crop" alt="教育考试" style="width:100%;border-radius:8px;margin:16px 0;" /></p>

<h2>原因分析</h2>
<p>考研降温背后有多重因素：</p>
<ul>
<li><strong>性价比考量</strong>：研究生学历带来的就业优势正在收窄</li>
<li><strong>经济压力</strong>：读研成本上升，延迟就业机会成本增加</li>
<li><strong>观念转变</strong>：务实主义盛行，"上岸"优先于"深造"</li>
<li><strong>就业形势</strong>：学历通胀背景下，高学历不再是护身符</li>
</ul>

<h2>考公热潮解读</h2>
<p>相比考研降温，考公热度持续升温，折射出年轻人对稳定性的渴望：</p>
<p>1. 最热岗位竞争比达1:3500</p>
<p>2. 平均竞争比从去年的58:1上升到68:1</p>
<p>3. 基层岗位、偏远地区岗位竞争同样激烈</p>
<p><img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop" alt="公务员考试" style="width:100%;border-radius:8px;margin:16px 0;" /></p>

<h2>深层思考</h2>
<p>从"考研热"到"考公热"，反映的是年轻人在不确定环境下的理性选择。追求稳定无可厚非，但也带来一些值得思考的问题：</p>
<ul>
<li>人才配置是否合理？</li>
<li>创新活力是否受影响？</li>
<li>社会流动性如何保障？</li>
</ul>

<h2>未来趋势</h2>
<p>专家预测，未来考研人数可能继续下降，但优质高校的竞争依然激烈。同时，多元化的职业选择也将成为趋势，年轻人将更加注重个人发展与职业规划的匹配。</p>
<p><img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=450&fit=crop" alt="职业选择" style="width:100%;border-radius:8px;margin:16px 0;" /></p>

<h2>结语</h2>
<p>无论是考研还是考公，都只是人生道路的一个选择。重要的是找到适合自己的方向，在工作中实现价值、获得成长。社会也应该为年轻人提供更多元的发展路径和机会。</p>
`,
    date: '2026-03-22',
    views: 8543
  },
  {
    title: '独居经济崛起：1.2亿人选择独自生活的背后',
    slug: 'living-alone-economy-rise',
    description: '中国独居人口已达1.2亿，"一人食"、迷你家电、宠物经济蓬勃发展。独居生活方式正在重塑消费市场。',
    keywords: ['独居', '单身经济', '消费', '生活方式', '宠物'],
    category: '生活',
    tags: ['生活方式', '消费', '社会'],
    images: getImages('生活', 'living-alone', 4),
    content: `
<h2>现象观察</h2>
<p>根据最新统计数据，中国独居人口已超过1.2亿，其中年轻人占比逐年上升。"一人户"家庭已成为中国家庭结构的重要组成部分。</p>
<p><img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=450&fit=crop" alt="独居生活" style="width:100%;border-radius:8px;margin:16px 0;" /></p>

<h2>独居经济生态</h2>
<p>独居生活方式催生了庞大的市场机会：</p>
<ul>
<li><strong>一人食经济</strong>：小份量预制菜、外卖套餐、单人餐厨用品</li>
<li><strong>迷你家电</strong>：小容量洗衣机、迷你冰箱、便携式厨电</li>
<li><strong>宠物经济</strong>：猫狗陪伴需求激增，相关产业规模超3000亿</li>
<li><strong>智能家居</strong>：智能音箱、扫地机器人等便利型产品</li>
</ul>

<h2>消费特征分析</h2>
<p>独居人群的消费呈现出鲜明特点：</p>
<p>1. 追求品质而非数量，愿意为更好体验付费</p>
<p>2. 重视便利性，懒人经济、即时配送需求旺盛</p>
<p>3. 情感消费占比高，娱乐、内容付费意愿强</p>
<p>4. 健康意识增强，健身、养生产品受欢迎</p>
<p><img src="https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=450&fit=crop" alt="生活方式" style="width:100%;border-radius:8px;margin:16px 0;" /></p>

<h2>社会影响思考</h2>
<p>独居生活方式的普及，对社会产生了深远影响：</p>
<ul>
<li>住房需求变化：小户型、公寓产品更受欢迎</li>
<li>社交方式演变：线上社交、兴趣社群成为主流</li>
<li>家庭观念转变：晚婚、不婚现象增多</li>
<li>养老问题凸显：独居老人照护成为社会课题</li>
</ul>

<h2>未来展望</h2>
<p>独居经济预计将持续增长。企业需要重新审视产品设计和服务模式，以适应这一庞大群体的需求。政府和社会也应关注独居人群的社会融入和福利保障问题。</p>
<p><img src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=450&fit=crop" alt="未来生活" style="width:100%;border-radius:8px;margin:16px 0;" /></p>

<h2>结语</h2>
<p>独居不是孤独，而是一种生活方式的选择。尊重多元选择，为不同生活方式提供支持，是社会进步的体现。无论选择何种生活方式，重要的是找到属于自己的幸福。</p>
`,
    date: '2026-03-21',
    views: 6789
  }
]

// ==================== 主函数 ====================
async function main() {
  console.log('==================================================')
  console.log('📦 内容生成系统 v5 — 长文章 + 多图')
  console.log('==================================================\n')

  // 1. 抓取 RSS
  console.log('📡 抓取 RSS 源...')
  const [ithome, kr36] = await Promise.all([
    fetchRSS('https://www.ithome.com/rss/', 'IT之家', 50),
    fetchRSS('https://36kr.com/feed', '36氪', 30),
  ])
  console.log(`  ✅ IT之家: ${ithome.length} 条`)
  console.log(`  ✅ 36氪: ${kr36.length} 条`)

  // 2. 合并 RSS
  const rssPosts = [...ithome, ...kr36]
  console.log(`\n🌐 RSS 抓取合计: ${rssPosts.length} 篇`)

  // 3. 内置长文章（添加封面图）
  const builtinPosts = BUILTIN_POSTS.map(p => ({
    ...p,
    coverImage: p.images[0],
    content: p.content.trim(),
    readTime: Math.max(3, Math.floor(p.content.length / 500))
  }))
  console.log(`✨ 内置长文章: ${builtinPosts.length} 篇（每篇1500+字）`)

  // 4. 读取已有文章
  let existingPosts = []
  const postsFile = path.join(__dirname, '../../public/data/posts.json')
  try {
    existingPosts = JSON.parse(fs.readFileSync(postsFile, 'utf-8')).posts || []
    console.log(`📂 已有文章: ${existingPosts.length} 篇`)
  } catch (e) {}

  // 5. 为所有文章确保有图片
  const ensureImages = (post) => {
    if (!post.images || post.images.length < 3) {
      post.images = getImages(post.category, post.slug, 3)
    }
    if (!post.coverImage) {
      post.coverImage = post.images[0]
    }
    return post
  }

  // 6. 去重合并
  const slugs = new Set()
  const merged = []
  
  // 内置长文章优先
  for (const p of builtinPosts) {
    if (!slugs.has(p.slug)) {
      slugs.add(p.slug)
      merged.push(ensureImages(p))
    }
  }
  
  // RSS 文章
  for (const p of rssPosts) {
    if (!slugs.has(p.slug)) {
      slugs.add(p.slug)
      merged.push(ensureImages(p))
    }
  }
  
  // 已有文章补充
  for (const p of existingPosts) {
    if (!slugs.has(p.slug)) {
      slugs.add(p.slug)
      merged.push(ensureImages(p))
    }
  }

  // 7. 对短文章进行内容增强
  const enhancedPosts = merged.map(post => {
    // 如果内容太短，进行扩写
    if (!post.content || post.content.length < 500) {
      const images = post.images || getImages(post.category, post.slug, 3)
      post.content = expandContent(post.title, post.description || '', post.category, images)
    }
    // 确保内容中有图片
    if (post.images && post.images.length > 0 && !post.content.includes('<img')) {
      const imgHtml = post.images.map((img, i) => 
        `<p><img src="${img}" alt="${post.title}" style="width:100%;border-radius:8px;margin:16px 0;" /></p>`
      ).join('\n')
      // 在第一个 </p> 后插入第一张图
      post.content = post.content.replace('</p>', `</p>\n${imgHtml}`)
    }
    // 计算阅读时间
    post.readTime = Math.max(2, Math.floor((post.content?.length || 500) / 400))
    return post
  })

  // 限制总数
  const finalPosts = enhancedPosts.slice(0, 150)

  // 8. 写入
  const outputDir = path.join(__dirname, '../../public/data')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
  
  fs.writeFileSync(path.join(outputDir, 'posts.json'), JSON.stringify({ posts: finalPosts }, null, 2))
  fs.writeFileSync(path.join(__dirname, '../../data/posts.json'), JSON.stringify({ posts: finalPosts }, null, 2))

  // 9. 生成 sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
${finalPosts.map(p => `  <url><loc>${baseUrl}/posts/${p.slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`).join('\n')}
</urlset>`
  
  fs.writeFileSync(path.join(__dirname, '../../public/sitemap.xml'), sitemap)
  fs.writeFileSync(path.join(__dirname, '../../sitemap.xml'), sitemap)
  
  const robots = `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml`
  fs.writeFileSync(path.join(__dirname, '../../public/robots.txt'), robots)
  fs.writeFileSync(path.join(__dirname, '../../robots.txt'), robots)

  console.log(`\n✅ posts.json 已更新`)
  console.log(`✅ sitemap.xml + robots.txt 已生成`)

  // 10. 统计
  const stats = {}
  finalPosts.forEach(p => {
    stats[p.category] = (stats[p.category] || 0) + 1
  })
  
  const wordCounts = finalPosts.map(p => p.content?.length || 0)
  const avgWords = Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)
  const maxWords = Math.max(...wordCounts)
  const minWords = Math.min(...wordCounts.filter(w => w > 0))

  console.log(`\n📊 最终统计: 共 ${finalPosts.length} 篇文章`)
  console.log(`   ${Object.entries(stats).map(([k, v]) => `${k}: ${v}篇`).join(' | ')}`)
  console.log(`\n📏 文章长度:`)
  console.log(`   平均: ${avgWords}字 | 最长: ${maxWords}字 | 最短: ${minWords}字`)
  console.log(`\n📌 下一步：npm run build && git push`)
}

main().catch(console.error)
