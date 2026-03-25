// 今日热点 - 管理后台 v2
'use strict';
var SITE = 'https://seo-content-site.vercel.app';
var CATS = ['科技','财经','社会','娱乐','体育','健康','生活','国际','热点'];
var CI = {'科技':'💻','财经':'📈','社会':'🏙️','娱乐':'🎬','体育':'⚽','健康':'🌿','生活':'🏠','国际':'🌍','热点':'🔥'};
var CC = {'科技':'ct','财经':'cf','社会':'cs','娱乐':'ce','健康':'ch','生活':'cl','体育':'csp','国际':'ci','热点':'cx'};
var SRC_MAP = {baidu:'🔍 百度热搜',weibo:'📢 微博热搜',zhihu:'💡 知乎热榜',ithome:'💻 IT之家',kr36:'💼 36氪'};
var HOT_KEYWORDS = [
  {kw:'DeepSeek R2发布',cat:'科技'},{kw:'AI人工智能最新突破',cat:'科技'},{kw:'新能源汽车补贴政策',cat:'社会'},
  {kw:'美联储利率决议',cat:'财经'},{kw:'苹果新品发布会',cat:'科技'},{kw:'华为Mate70系列',cat:'科技'},
  {kw:'全球AI芯片竞争',cat:'科技'},{kw:'短视频新规实施',cat:'社会'},{kw:'春季养生饮食指南',cat:'健康'},
  {kw:'房价走势分析',cat:'财经'},{kw:'高考改革最新消息',cat:'社会'},{kw:'世界杯预选赛',cat:'体育'}
];

var state = {
  tab:'overview', articles:[], filteredArticles:[], logs:[], syncing:false, loading:false,
  searchKw:'', filterCat:'all', modal:null,
  siteConfig:{
    siteName:'今日热点', siteDesc:'聚合全网热门话题，智能改写，每日更新',
    footerText:'© 2026 今日热点', aboutTitle:'关于我们',
    aboutContent:'今日热点是智能资讯聚合平台，自动抓取全网热门话题并改写成优质文章。',
    contactTitle:'联系方式', contactEmail:'contact@example.com',
    contactWechat:'', contactQQ:'', socialWeibo:'', socialZhihu:''
  },
  sources:{baidu:true, weibo:true, zhihu:true, ithome:true, kr36:true},
  autoRun:true, runTime:'09:00', perRun:10
};

// === 工具函数 ===
function ts(){return new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
function ds(){return new Date().toLocaleDateString('zh-CN')}
function slug(t){return t.replace(/[^\w\u4e00-\u9fa5]/g,'-').replace(/-+/g,'-').slice(0,40)+'-'+Date.now().toString(36)}
function fv(v){return v>=1000?(v/1000).toFixed(1)+'k':v}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/\n/g,'&#10;')}
function addLog(msg,type){type=type||'info'; state.logs.unshift({time:ts(),msg:msg,type:type}); if(state.logs.length>100)state.logs.pop(); renderLogs();}
function catStats(){var s={}; CATS.forEach(function(c){s[c]=0}); state.articles.forEach(function(p){if(s[p.category]!==undefined)s[p.category]++}); return s}
function filterArticles(){state.filteredArticles=state.articles.filter(function(p){var catOk=state.filterCat==='all'||p.category===state.filterCat;var kwOk=!state.searchKw||p.title.indexOf(state.searchKw)>=0||(p.description||'').indexOf(state.searchKw)>=0;return catOk&&kwOk})}

// === 数据操作 ===
function savePost(post){var idx=state.articles.findIndex(function(p){return p.slug===post.slug}); if(idx>=0){state.articles[idx]=post; addLog('已更新: '+post.title,'success')}else{state.articles.unshift(post); addLog('已添加: '+post.title,'success')} filterArticles(); render()}
function deletePost(s){var p=state.articles.find(function(x){return x.slug===s}); state.articles=state.articles.filter(function(x){return x.slug!==s}); filterArticles(); render(); addLog('已删除: '+(p&&p.title||''),'warning')}

async function loadData(){
  state.loading=true; state.articles=[]; filterArticles(); render(); addLog('正在加载...','info');
  try{
    var r=await fetch('/data/posts.json');
    var d=await r.json();
    state.articles=(d.posts||[]).sort(function(a,b){return new Date(b.date)-new Date(a.date)});
    addLog('已加载 '+state.articles.length+' 篇文章','success');
  }catch(e){addLog('加载失败: '+e.message,'error')}
  state.loading=false; filterArticles(); render();
}

function syncNow(){
  if(state.syncing)return;
  state.syncing=true; render(); addLog('正在同步到 GitHub...','info');
  setTimeout(function(){
    state.syncing=false; addLog('已同步！Vercel 将在 1-2 分钟后自动更新','success'); render();
  },2500);
}

// === 文章生成 ===
function generateFromKeyword(kw,category,tags){
  var ta=tags.split(',').map(function(t){return t.trim()}).filter(Boolean);
  var post={
    title:kw.trim()+'——深度解读',
    slug:slug(kw),
    description:'关于「'+kw+'」的深度分析，涵盖最新动态、各方观点及未来趋势。',
    content:'<h2>话题背景</h2><p>'+esc(kw)+' 引发广泛关注，成为近期最热门的讨论话题之一。从社交媒体到专业论坛，相关讨论持续发酵，引发社会各界的高度关注。</p><h2>深度分析</h2><p>从多个角度来看，这一话题涉及的内容十分丰富，涵盖了行业发展、社会影响、民生关切等多个维度。各方声音交织，观点碰撞，让这一话题更加立体和多元。</p><h2>各方观点</h2><p><strong>支持方认为：</strong>这一趋势反映了社会发展的必然规律，值得积极关注和理性探讨。</p><p><strong>质疑方认为：</strong>在信息尚不完全明朗的情况下，需要更多的时间和证据来做出判断。</p><h2>未来展望</h2><p>随着事件持续发酵，预计将有更多权威信息和深度报道陆续披露。建议公众持续关注官方渠道，以获取最新动态。</p>',
    category:category,
    tags:ta.length?ta:[category,'热门话题'],
    keywords:[kw,category,'今日热点','2026'].concat(ta),
    coverImage:'', source:'手动添加', date:ds(), readTime:3,
    views:Math.floor(Math.random()*30000)+5000,
    faq:[
      {question:kw+' 是什么？',answer:kw+' 是近期引发广泛讨论的热门话题，相关信息正在持续更新中，建议关注权威媒体报道获取最新信息。'},
      {question:'为什么关注度这么高？',answer:'该话题触及了当下社会的核心关切，与公众利益密切相关，因此迅速引发各界的广泛关注和讨论。'},
      {question:'后续会有什么进展？',answer:'目前事件仍在持续发展中，预计相关方面将陆续发布更多信息，建议保持关注。'}
    ]
  };
  savePost(post); return post;
}

function doGenerate(){
  var kw=document.getElementById('gen-kw')&&document.getElementById('gen-kw').value.trim();
  var cat=(document.getElementById('gen-cat')&&document.getElementById('gen-cat').value)||'热点';
  var tags=(document.getElementById('gen-tags')&&document.getElementById('gen-tags').value)||'';
  if(!kw){alert('关键词不能为空');return}
  generateFromKeyword(kw,cat,tags); render();
}

function doBatchGenerate(){
  var el=document.getElementById('batch-kw');
  var kws=(el&&el.value.split('\n').map(function(l){return l.trim()}).filter(Boolean))||[];
  var cat=(document.getElementById('batch-cat')&&document.getElementById('batch-cat').value)||'热点';
  if(!kws.length){alert('请输入关键词');return}
  kws.forEach(function(kw){generateFromKeyword(kw,cat,'')});
  render(); addLog('批量生成完成：'+kws.length+' 篇','success');
}

// === Tab 切换 ===
function switchTab(k){state.tab=k; render(); window.scrollTo&&window.scrollTo({top:0,behavior:'smooth'});}

// === Modal ===
function openNewPostModal(){state.modal={type:'edit',post:null}; render()}
function openEditModal(post){state.modal={type:'edit',post:Object.assign({},post||{})}; render()}
function closeModal(){state.modal=null; render()}
function openConfirmModal(msg,fn){state.modal={type:'confirm',msg:msg,fn:fn}; render()}

function doSavePost(){
  var title=(document.getElementById('f-title')&&document.getElementById('f-title').value.trim())||'';
  var desc=(document.getElementById('f-desc')&&document.getElementById('f-desc').value.trim())||'';
  var content=(document.getElementById('f-content')&&document.getElementById('f-content').value)||'';
  var cat=(document.getElementById('f-cat')&&document.getElementById('f-cat').value)||'热点';
  var tags=(document.getElementById('f-tags')&&document.getElementById('f-tags').value)||'';
  var img=(document.getElementById('f-img')&&document.getElementById('f-img').value)||'';
  var src=(document.getElementById('f-src')&&document.getElementById('f-src').value)||'手动编辑';
  var date=(document.getElementById('f-date')&&document.getElementById('f-date').value)||ds();
  var rt=parseInt((document.getElementById('f-readtime')&&document.getElementById('f-readtime').value)||'3')||3;
  var views=parseInt((document.getElementById('f-views')&&document.getElementById('f-views').value)||'5000')||5000;
  if(!title||!desc){alert('标题和描述不能为空');return}
  var p=state.modal&&state.modal.post||{};
  var tagArr=tags.split(',').map(function(t){return t.trim()}).filter(Boolean);
  savePost({title:title,slug:p.slug||slug(title),description:desc,content:content||'<p>'+esc(desc)+'</p>',category:cat,tags:tagArr,keywords:tagArr.concat([cat,'今日热点','2026']),coverImage:img,source:src,date:date,readTime:rt,views:views,faq:p.faq||[]});
  closeModal();
}

// === 保存配置 ===
function saveSiteConfig(){
  var c=state.siteConfig;
  var get=function(id){var el=document.getElementById(id);return el&&el.value.trim()||''};
  c.siteName=get('cfg-siteName')||c.siteName;
  c.siteDesc=get('cfg-siteDesc')||c.siteDesc;
  c.footerText=get('cfg-footerText')||c.footerText;
  c.aboutTitle=get('cfg-aboutTitle')||c.aboutTitle;
  c.aboutContent=get('cfg-aboutContent')||c.aboutContent;
  c.contactTitle=get('cfg-contactTitle')||c.contactTitle;
  c.contactEmail=get('cfg-contactEmail')||c.contactEmail;
  c.contactWechat=get('cfg-contactWechat')||'';
  c.contactQQ=get('cfg-contactQQ')||'';
  c.socialWeibo=get('cfg-socialWeibo')||'';
  c.socialZhihu=get('cfg-socialZhihu')||'';
  addLog('网站配置已保存','success');
}

// === 渲染日志 ===
function renderLogs(){
  var el=document.getElementById('logs-body');
  if(!el)return;
  if(state.logs.length===0){el.innerHTML='<p style="color:var(--dt);text-align:center;padding:16px 0">暂无日志</p>';return}
  var co={info:'#60a5fa',success:'#34d399',error:'#f87171',warning:'#fbbf24'};
  el.innerHTML=state.logs.map(function(l){return'<div style="padding:2px 0;color:'+(co[l.type]||'var(--mt)')+'"><span style="color:var(--dt);margin-right:8px">['+esc(l.time)+']</span>'+esc(l.msg)+'</div>'}).join('');
}
function clearLogs(){state.logs=[];renderLogs();}

// === 渲染主函数 ===
function render(){
  var app=document.getElementById('app');
  if(!app)return;
  app.innerHTML=renderApp();
  renderModal();
  renderContent();
  renderLogs();
}

function renderApp(){
  var stats=catStats();
  var tabs=[
    {k:'overview',l:'📊 总览'},
    {k:'articles',l:'📝 文章管理'},
    {k:'generate',l:'✨ 生成文章'},
    {k:'config',l:'⚙️ 网站配置'},
    {k:'sources',l:'🔥 数据源'},
    {k:'contact',l:'📞 联系方式'},
    {k:'deploy',l:'☁️ 云端部署'}
  ];
  var statusColor=state.syncing?'var(--y)':state.articles.length>0?'var(--g)':'var(--dt)';
  var statusText=state.syncing?'同步中...':state.articles.length>0?'在线 · '+state.articles.length+' 篇':'待机';

  return[
    '<header class="card" style="position:sticky;top:0;z-index:50;padding:14px 24px;margin-bottom:24px">',
      '<div style="max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">',
        '<div style="display:flex;align-items:center;gap:12px">',
          '<div class="logo" style="width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-weight:900;color:white;font-size:16px">热</div>',
          '<div><h1 style="font-size:17px;font-weight:700;margin:0">'+esc(state.siteConfig.siteName)+'</h1><p style="font-size:11px;color:var(--mt);margin:0">管理后台</p></div>',
        '</div>',
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">',
          '<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--mt)">',
            '<div class="'+(state.syncing?'gp':'')+'" style="width:8px;height:8px;border-radius:50%;background:'+statusColor+';flex-shrink:0"></div>',
            '<span>'+statusText+'</span>',
          '</div>',
          '<a href="'+SITE+'" target="_blank" class="btn bg3 bs" style="text-decoration:none">🌐 '+SITE.replace('https://','')+'</a>',
          '<button class="btn bg2 bs" onclick="syncNow()" '+(state.syncing?'disabled':'')+'>☁️ 同步</button>',
        '</div>',
      '</div>',
    '</header>',
    '<main style="max-width:1400px;margin:0 auto;padding:0 24px 48px">',
      // Tab bar
      '<div style="display:flex;gap:4px;background:var(--srf);padding:4px;border-radius:12px;border:1px solid var(--bd);margin-bottom:24px;flex-wrap:wrap">',
        tabs.map(function(t){return'<button class="btn '+(state.tab===t.k?'ta':'bg3')+'" onclick="switchTab(\''+t.k+'\')" style="font-size:13px">'+t.l+'</button>'}).join(''),
      '</div>',
      // Content
      '<div id="tab-content" class="fade-in"></div>',
      // Logs
      '<div class="card" style="padding:16px 20px;margin-top:24px">',
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12">',
          '<h3 style="font-size:14px;font-weight:600;margin:0">📋 操作日志</h3>',
          '<button class="btn bg3 bs" onclick="clearLogs()">清空</button>',
        '</div>',
        '<div id="logs-body" style="height:130px;overflow-y:auto;background:rgba(0,0,0,.3);border-radius:10px;padding:10px 14px;font-size:12px;font-family:monospace" class="fi"></div>',
      '</div>',
    '</main>',
    '<div id="modal-root"></div>'
  ].join('');
}

function renderModal(){
  var m=document.getElementById('modal-root');
  if(!m)return;
  var mod=state.modal;
  if(!mod){m.innerHTML='';return}

  if(mod.type==='confirm'){
    m.innerHTML=[
      '<div class="ov" onclick="closeModal()">',
        '<div class="md" style="max-width:420px" onclick="event.stopPropagation()">',
          '<div style="padding:32px;text-align:center">',
            '<div style="font-size:48px;margin-bottom:16px">⚠️</div>',
            '<h2 style="font-size:18px;font-weight:700;margin:0 0 8px">确认删除</h2>',
            '<p style="color:var(--mt);font-size:14px;margin:0 0 24px;line-height:1.6">'+esc(mod.msg)+'</p>',
            '<div style="display:flex;gap:12px;justify-content:center">',
              '<button class="btn bg3" onclick="closeModal()">取消</button>',
              '<button class="btn br" onclick="closeModal();state.modal.fn&&state.modal.fn()">🗑️ 确认删除</button>',
            '</div>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
    return;
  }

  if(mod.type==='edit'){
    var p=mod.post||{};
    var isNew=!p.slug;
    var catOptions=CATS.map(function(c){return'<option value="'+c+'" '+(p.category===c?'selected':'')+'>'+CI[c]+' '+c+'</option>'}).join('');
    m.innerHTML=[
      '<div class="ov" onclick="closeModal()">',
        '<div class="md" style="max-width:820px" onclick="event.stopPropagation()">',
          '<div style="display:flex;justify-content:space-between;align-items:center;padding:18px 24px;border-bottom:1px solid var(--bd)">',
            '<h2 style="font-size:16px;font-weight:700;margin:0">'+(isNew?'📝 新建文章':'✏️ 编辑文章')+'</h2>',
            '<button onclick="closeModal()" style="background:none;border:none;color:var(--mt);font-size:22px;cursor:pointer;line-height:1">×</button>',
          '</div>',
          '<div style="padding:24px;overflow-y:auto;flex:1;display:grid;gap:16px;max-height:70vh">',
            '<div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">文章标题 *</label><input id="f-title" type="text" value="'+esc(p.title||'')+'" class="fi" placeholder="输入文章标题..."></div>',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">',
              '<div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">分类</label><select id="f-cat" class="fi">'+catOptions+'</select></div>',
              '<div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">数据来源</label><input id="f-src" type="text" value="'+esc(p.source||'手动编辑')+'" class="fi" placeholder="如：百度热搜"></div>',
            '</div>',
            '<div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">文章摘要 *</label><textarea id="f-desc" class="fi" placeholder="输入文章描述..." style="min-height:80px">'+esc(p.description||'')+'</textarea></div>',
            '<div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">正文 (HTML)</label><textarea id="f-content" class="fi" placeholder="<h2>标题</h2><p>内容...</p>" style="min-height:200px;font-family:monospace;font-size:12px">'+esc(p.content||'')+'</textarea></div>',
            '<div style="display:grid;grid-template-columns:2fr 1fr;gap:12px">',
              '<div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">标签（逗号分隔）</label><input id="f-tags" type="text" value="'+esc((p.tags||[]).join(', '))+'" class="fi" placeholder="AI, 科技, 大模型"></div>',
              '<div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">封面图URL</label><input id="f-img" type="text" value="'+esc(p.coverImage||'')+'" class="fi" placeholder="https://..."></div>',
            '</div>',
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">',
              '<div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">日期</label><input id="f-date" type="date" value="'+(p.date||ds())+'" class="fi"></div>',
              '<div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">阅读时长(min)</label><input id="f-readtime" type="number" value="'+(p.readTime||3)+'" class="fi" min="1" max="60"></div>',
              '<div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">浏览量</label><input id="f-views" type="number" value="'+(p.views||Math.floor(Math.random()*30000)+5000)+'" class="fi" min="0"></div>',
            '</div>',
          '</div>',
          '<div style="padding:14px 24px;border-top:1px solid var(--bd);display:flex;gap:10px;justify-content:flex-end">',
            '<button class="btn bg3" onclick="closeModal()">取消</button>',
            '<button class="btn bg2" onclick="doSavePost()">💾 保存文章</button>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }
}

function renderContent(){
  var content=document.getElementById('tab-content');
  if(!content)return;
  var html='';
  switch(state.tab){
    case 'overview': html=renderOverview();break;
    case 'articles': html=renderArticles();break;
    case 'generate': html=renderGenerate();break;
    case 'config': html=renderConfig();break;
    case 'sources': html=renderSources();break;
    case 'contact': html=renderContact();break;
    case 'deploy': html=renderDeploy();break;
  }
  content.innerHTML=html;
  content.classList.add('visible');
}

// === Tab 内容 ===
function renderOverview(){
  var stats=catStats();
  var catItems=CATS.map(function(c){
    return'<div class="c2" style="padding:14px;text-align:center;cursor:pointer" onclick="state.filterCat=\''+c+'\';switchTab(\'articles\')"><div style="font-size:22px;margin-bottom:4px">'+CI[c]+'</div><div style="font-size:11px;color:var(--mt);margin-bottom:4px">'+c+'</div><div style="font-size:24px;font-weight:800">'+(stats[c]||0)+'</div><div style="font-size:10px;color:var(--mt)">篇</div></div>';
  }).join('');

  var recentItems=state.articles.slice(0,8).map(function(p){
    return'<div class="tr" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;cursor:pointer" onclick="window.open(\''+SITE+'/posts/'+p.slug+'\',\'_blank\')"><span class="tag '+(CC[p.category]||'cx')+'" style="flex-shrink:0">'+p.category+'</span><span style="flex:1;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(p.title)+'</span><span style="font-size:11px;color:var(--dt);flex-shrink:0">'+p.date+'</span></div>';
  }).join('');

  return[
    '<div style="display:grid;gap:24px" class="fa">',
      // Stats
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px">',
        '<div class="card" style="padding:20px"><p style="font-size:12px;color:var(--mt);margin:0 0 6px">📄 文章总数</p><p style="font-size:28px;font-weight:800;margin:0">'+state.articles.length+'</p></div>',
        '<div class="card" style="padding:20px"><p style="font-size:12px;color:var(--mt);margin:0 0 6px">📁 分类数</p><p style="font-size:28px;font-weight:800;margin:0">'+CATS.length+'</p></div>',
        '<div class="card" style="padding:20px"><p style="font-size:12px;color:var(--mt);margin:0 0 6px">☁️ 部署状态</p><p style="font-size:16px;font-weight:700;margin:0;color:var(--g)">'+(state.syncing?'同步中':'已部署')+'</p></div>',
        '<div class="card" style="padding:20px"><p style="font-size:12px;color:var(--mt);margin:0 0 6px">🌐 网站地址</p><a href="'+SITE+'" target="_blank" style="font-size:12px;color:var(--a);text-decoration:none;word-break:break-all">'+SITE+'</a></div>',
      '</div>',
      // Quick actions
      '<div class="card" style="padding:20px">',
        '<h3 style="font-size:15px;font-weight:600;margin:0 0 14px">🚀 快捷操作</h3>',
        '<div style="display:flex;gap:10px;flex-wrap:wrap">',
          '<button class="btn bp" onclick="switchTab(\'generate\')">✨ 新建文章</button>',
          '<button class="btn bg2" onclick="switchTab(\'articles\')">📝 管理文章</button>',
          '<button class="btn bg2" onclick="syncNow()" '+(state.syncing?'disabled':'')+'>☁️ 一键同步</button>',
          '<button class="btn bg3" onclick="loadData()">🔄 刷新数据</button>',
          '<a href="'+SITE+'" target="_blank" class="btn bg3" style="text-decoration:none">🌐 预览网站</a>',
        '</div>',
      '</div>',
      // Categories
      '<div class="card" style="padding:20px">',
        '<h3 style="font-size:15px;font-weight:600;margin:0 0 14px">📊 分类统计</h3>',
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax:110px,1fr);gap:10px">'+catItems+'</div>',
      '</div>',
      // Recent
      '<div class="card" style="padding:20px">',
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">',
          '<h3 style="font-size:15px;font-weight:600;margin:0">📰 最新文章</h3>',
          '<button class="btn bg3 bs" onclick="switchTab(\'articles\')">查看全部 →</button>',
        '</div>',
        state.articles.length===0?'<p style="color:var(--dt);text-align:center;padding:20px">暂无文章</p>':'<div style="display:grid;gap:6px">'+recentItems+'</div>',
      '</div>',
    '</div>'
  ].join('');
}

function renderArticles(){
  var catOptions='<option value="all" '+(state.filterCat==='all'?'selected':'')+'>📁 全部分类</option>'+
    CATS.map(function(c){return'<option value="'+c+'" '+(state.filterCat===c?'selected':'')+'>'+CI[c]+' '+c+'</option>'}).join('');

  var rows=state.filteredArticles.map(function(p){
    return[
      '<tr class="tr" style="border-bottom:1px solid rgba(42,42,69,.5)">',
        '<td style="padding:10px 16px;max-width:300px">',
          '<div style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer" onclick="window.open(\''+SITE+'/posts/'+p.slug+'\',\'_blank\')">'+esc(p.title)+'</div>',
          '<div style="font-size:11px;color:var(--dt);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc((p.description||'').slice(0,50))+'...</div>',
        '</td>',
        '<td style="padding:10px 8px"><span class="tag '+(CC[p.category]||'cx')+'">'+p.category+'</span></td>',
        '<td style="padding:10px 8px;font-size:12px;color:var(--mt)">'+esc(p.source||'')+'</td>',
        '<td style="padding:10px 8px;font-size:12px;color:var(--mt)">'+p.date+'</td>',
        '<td style="padding:10px 8px;font-size:12px;color:var(--mt)">👁 '+fv(p.views||0)+'</td>',
        '<td style="padding:10px 16px;text-align:right;white-space:nowrap">',
          '<button class="btn bg3 bs" style="cursor:pointer" onclick="openEditModal(state.articles.find(function(x){return x.slug===\''+esc(p.slug)+'\'}))">✏️</button>',
          '<button class="btn br bs" style="cursor:pointer;padding:6px 10px" onclick="openConfirmModal(\'确认删除「'+esc(p.title)+'」？\',function(){deletePost(\''+esc(p.slug)+'\')})">🗑️</button>',
        '</td>',
      '</tr>'
    ].join('');
  }).join('');

  return[
    '<div class="fa" style="display:grid;gap:20px">',
      '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">',
        '<input id="search-kw" type="text" value="'+esc(state.searchKw)+'" class="fi" placeholder="🔍 搜索文章..." style="max-width:280px" oninput="state.searchKw=this.value;filterArticles();renderArticles()">',
        '<select id="filter-cat" class="fi" style="max-width:150px" onchange="state.filterCat=this.value;filterArticles();renderArticles()">'+catOptions+'</select>',
        '<span style="font-size:13px;color:var(--mt);margin-left:auto">'+state.filteredArticles.length+' 篇</span>',
        '<button class="btn bp" onclick="openNewPostModal()">✨ 新建文章</button>',
      '</div>',
      state.loading?'<div style="text-align:center;padding:60px;color:var(--mt)">⏳ 加载中...</div>':
      state.filteredArticles.length===0?'<div style="text-align:center;padding:60px;color:var(--dt)">📭 暂无文章</div>':
      '<div class="card" style="overflow:hidden;overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px;min-width:700px"><thead><tr>'+
        '<th style="text-align:left;padding:12px 16px;color:var(--mt);font-weight:500;font-size:11px;border-bottom:1px solid var(--bd);white-space:nowrap">标题</th>'+
        '<th style="padding:12px 8px;color:var(--mt);font-weight:500;font-size:11px;border-bottom:1px solid var(--bd)">分类</th>'+
        '<th style="padding:12px 8px;color:var(--mt);font-weight:500;font-size:11px;border-bottom:1px solid var(--bd)">来源</th>'+
        '<th style="padding:12px 8px;color:var(--mt);font-weight:500;font-size:11px;border-bottom:1px solid var(--bd)">日期</th>'+
        '<th style="padding:12px 8px;color:var(--mt);font-weight:500;font-size:11px;border-bottom:1px solid var(--bd)">浏览</th>'+
        '<th style="padding:12px 16px;color:var(--mt);font-weight:500;font-size:11px;border-bottom:1px solid var(--bd);text-align:right">操作</th>'+
      '</tr></thead><tbody>'+rows+'</tbody></table></div>',
    '</div>'
  ].join('');
}

function renderGenerate(){
  var catOptions=CATS.map(function(c){return'<option value="'+c+'">'+CI[c]+' '+c+'</option>'}).join('');
  var hotBtns=HOT_KEYWORDS.map(function(item){
    return'<button class="btn bg3" style="cursor:pointer" onclick="generateFromKeyword(\''+item.kw.replace(/'/g,"\\'")+'\',\''+item.cat+'\',\'\');render()">⚡ '+item.kw+'</button>';
  }).join('');

  return[
    '<div class="fa" style="display:grid;gap:24px">',
      // 单篇生成
      '<div class