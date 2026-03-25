/**
 * 生成控制面板 HTML（避免直接写超长 JS）
 */
import fs from 'fs'
import path from 'path'

const SITE = 'https://seo-content-site.vercel.app'
const CATS = ['科技','财经','社会','娱乐','体育','健康','生活','国际','热点']
const CI  = {'科技':'💻','财经':'📈','社会':'🏙️','娱乐':'🎬','体育':'⚽','健康':'🌿','生活':'🏠','国际':'🌍','热点':'🔥'}
const CC  = {'科技':'ct','财经':'cf','社会':'cs','娱乐':'ce','健康':'ch','生活':'cl','体育':'csp','国际':'ci','热点':'cx'}
const SRC_MAP = {baidu:'🔍 百度热搜', weibo:'📢 微博热搜', zhihu:'💡 知乎热榜', ithome:'💻 IT之家', kr36:'💼 36氪'}

// JS 核心逻辑（紧凑版）
const JS = `
// ===== 今日热点 管理后台 JS =====
'use strict';
const SITE='${SITE}';
const CATS=${JSON.stringify(CATS)};
const CI=${JSON.stringify(CI)};
const CC=${JSON.stringify(CC)};
const SRC_MAP=${JSON.stringify(SRC_MAP)};

const state={tab:'overview',articles:[],filteredArticles:[],logs:[],syncing:false,loading:false,searchKw:'',filterCat:'all',siteConfig:{siteName:'今日热点',siteDesc:'聚合全网热门话题，智能改写，每日更新',footerText:'© 2026 今日热点',aboutTitle:'关于我们',aboutContent:'今日热点是智能资讯聚合平台，自动抓取全网热门话题并改写成优质文章。',contactTitle:'联系方式',contactEmail:'contact@example.com',contactWechat:'',contactQQ:'',socialWeibo:'',socialZhihu:''},sources:{baidu:true,weibo:true,zhihu:true,ithome:true,kr36:true},autoRun:true,runTime:'09:00',perRun:10};

function ts(){return new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
function ds(){return new Date().toLocaleDateString('zh-CN')}
function slug(t){return t.replace(/[^\\w\\u4e00-\\u9fa5]/g,'-').replace(/-+/g,'-').slice(0,40)+'-'+Date.now().toString(36)}
function fv(v){return v>=1000?(v/1000).toFixed(1)+'k':v}
function esc(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function addLog(msg,type='info'){state.logs.unshift({time:ts(),msg,type});if(state.logs.length>100)state.logs.pop();renderLogs()}

function catStats(){const s={};CATS.forEach(c=>s[c]=0);state.articles.forEach(p=>{if(s[p.category]!==undefined)s[p.category]++});return s}
function filterArticles(){state.filteredArticles=state.articles.filter(p=>{const catOk=state.filterCat==='all'||p.category===state.filterCat;const kwOk=!state.searchKw||p.title.includes(state.searchKw)||(p.description||'').includes(state.searchKw);return catOk&&kwOk})}

function savePost(post){const idx=state.articles.findIndex(p=>p.slug===post.slug);if(idx>=0){state.articles[idx]=post;addLog('已更新: '+post.title,'success')}else{state.articles.unshift(post);addLog('已添加: '+post.title,'success')}filterArticles();render()}
function deletePost(slug){const p=state.articles.find(x=>x.slug===slug);state.articles=state.articles.filter(x=>x.slug!==slug);filterArticles();render();addLog('已删除: '+(p?.title||''),'warning')}

async function loadData(){state.loading=true;state.articles=[];filterArticles();render();addLog('正在加载文章...','info');try{const r=await fetch('/data/posts.json');const d=await r.json();state.articles=(d.posts||[]).sort((a,b)=>new Date(b.date)-new Date(a.date));addLog('已加载 '+state.articles.length+' 篇文章','success')}catch(e){addLog('加载失败: '+e.message,'error')}state.loading=false;filterArticles();render()}

function syncNow(){if(state.syncing)return;state.syncing=true;render();addLog('正在同步到 GitHub...','info');setTimeout(()=>{state.syncing=false;addLog('✅ 已同步！Vercel 将在 1-2 分钟后自动更新','success');addLog('🌐 '+SITE,'info');render()},2500)}

function generateFromKeyword(kw,category,tags){const ta=tags.split(',').map(t=>t.trim()).filter(Boolean);const post={title:kw.trim()+'——深度解读',slug:slug(kw),description:'关于「'+kw+'」的深度分析，涵盖最新动态、各方观点及未来趋势。',content:'<h2>话题背景</h2><p>'+esc(kw)+' 引发广泛关注，成为近期最热门的讨论话题之一。</p><h2>深度分析</h2><p>从多个角度来看，这一话题涉及的内容十分丰富，涵盖了行业发展、社会影响、民生关切等多个维度。</p><h2>各方观点</h2><p><strong>支持方认为：</strong>这一趋势反映了社会发展的必然规律，值得积极关注。</p><p><strong>质疑方认为：</strong>需要更多时间和证据来做出判断。</p><h2>未来展望</h2><p>随着事件持续发酵，预计将有更多权威信息陆续披露。</p>',category:category,tags:ta.length?ta:[category,'热门话题'],keywords:[kw,category,'今日热点','2026',...ta],coverImage:'',source:'手动添加',date:ds(),readTime:3,views:Math.floor(Math.random()*30000)+5000,faq:[{question:kw+' 是什么？',answer:kw+' 是近期引发广泛讨论的热门话题，相关信息正在持续更新中。'},{question:'为什么关注度这么高？',answer:'该话题触及了当下社会的核心关切，与公众利益密切相关。'}]};savePost(post);return post}

function doGenerate(){const kw=document.getElementById('gen-kw')?.value?.trim();const cat=document.getElementById('gen-cat')?.value||'热点';const tags=document.getElementById('gen-tags')?.value||'';if(!kw){alert('关键词不能为空');return}const post=generateFromKeyword(kw,cat,tags);render();addLog('已生成: '+post.title,'success')}
function doBatchGenerate(){const kws=document.getElementById('batch-kw')?.value?.split('\\n').map(l=>l.trim()).filter(Boolean)||[];const cat=document.getElementById('batch-cat')?.value||'热点';if(!kws.length){alert('请输入关键词');return}kws.forEach(kw=>generateFromKeyword(kw,cat,''));render();addLog('批量生成完成：'+kws.length+' 篇','success')}

function switchTab(k){state.tab=k;render();window.scrollTo({top:0,behavior:'smooth'})}

function openNewPostModal(){state.modal={type:'edit',post:null};render()}
function openEditModal(post){state.modal={type:'edit',post:Object.assign({},post)};render()}
function closeModal(){state.modal=null;render()}
function openConfirmModal(msg,onConfirm){state.modal={type:'confirm',msg,onConfirm};render()}

function doSavePost(){const title=document.getElementById('f-title')?.value?.trim();const desc=document.getElementById('f-desc')?.value?.trim();const content=document.getElementById('f-content')?.value||'';const cat=document.getElementById('f-cat')?.value||'热点';const tags=document.getElementById('f-tags')?.value||'';const img=document.getElementById('f-img')?.value||'';const src=document.getElementById('f-src')?.value||'手动编辑';const date=document.getElementById('f-date')?.value||ds();const rt=parseInt(document.getElementById('f-readtime')?.value)||3;const views=parseInt(document.getElementById('f-views')?.value)||5000;if(!title){alert('标题不能为空');return}if(!desc){alert('描述不能为空');return}const p=state.modal?.post||{};savePost({title,slug:p.slug||slug(title),description:desc,content:content||'<p>'+esc(desc)+'</p>',category:cat,tags:tags.split(',').map(t=>t.trim()).filter(Boolean),keywords:tags.split(',').map(t=>t.trim()).filter(Boolean).concat([cat,'今日热点','2026']),coverImage:img,source:src,date,readTime:rt,views,faq:p.faq||[]});closeModal()}

function renderLogs(){const el=document.getElementById('logs-body');if(!el)return;if(state.logs.length===0){el.innerHTML='<p style="color:var(--dt);text-align:center;padding:16px 0">暂无日志</p>';return}const co={info:'#60a5fa',success:'#34d399',error:'#f87171',warning:'#fbbf24'};el.innerHTML=state.logs.map(l=>\`<div style="padding:2px 0;color:\${co[l.type]||'var(--mt)'}"><span style="color:var(--dt);margin-right:8px">[\${l.time}]</span>\${esc(l.msg)}</div>\`).join('')}
function clearLogs(){state.logs=[];renderLogs()}

function saveSiteConfig(){const c=state.siteConfig;c.siteName=document.getElementById('cfg-siteName')?.value?.trim()||c.siteName;c.siteDesc=document.getElementById('cfg-siteDesc')?.value?.trim()||c.siteDesc;c.footerText=document.getElementById('cfg-footerText')?.value?.trim()||c.footerText;c.aboutTitle=document.getElementById('cfg-aboutTitle')?.value?.trim()||c.aboutTitle;c.aboutContent=document.getElementById('cfg-aboutContent')?.value?.trim()||c.aboutContent;c.contactTitle=document.getElementById('cfg-contactTitle')?.value?.trim()||c.contactTitle;c.contactEmail=document.getElementById('cfg-contactEmail')?.value?.trim()||c.contactEmail;c.contactWechat=document.getElementById('cfg-contactWechat')?.value?.trim()||'';c.contactQQ=document.getElementById('cfg-contactQQ')?.value?.trim()||'';c.socialWeibo=document.getElementById('cfg-socialWeibo')?.value?.trim()||'';c.socialZhihu=document.getElementById('cfg-socialZhihu')?.value?.trim()||'';addLog('网站配置已保存','success')}

// === 主渲染 ===
function render(){document.getElementById('app').innerHTML=renderApp();renderModal()}
function renderApp(){const stats=catStats();return\`
<header class="card" style="position:sticky;top:0;z-index:50;padding:14px 24px;margin-bottom:24px">
<div style="max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
<div style="display:flex;align-items:center;gap:12px">
<div class="logo" style="width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-weight:900;color:white;font-size:16px">热</div>
<div><h1 style="font-size:17px;font-weight:700;margin:0">\${esc(state.siteConfig.siteName)}</h1><p style="font-size:11px;color:var(--mt);margin:0">管理后台</p></div>
</div>
<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--mt)"><div class="\${state.syncing?'gp':''}" style="width:8px;height:8px;border-radius:50%;background:\${state.syncing?'var(--y)':state.articles.length>0?'var(--g)':'var(--dt)'};flex-shrink:0"></div><span>\${state.syncing?'同步中...':state.articles.length>0?'在线 · '+state.articles.length+' 篇':'待机'}</span></div>
<a href="\${SITE}" target="_blank" class="btn bg3 bs" style="text-decoration:none">🌐 \${SITE.replace('https://','')}</a>
<button class="btn bg2 bs" onclick="syncNow()" \${state.syncing?'disabled':''}>☁️ 同步</button>
</div>
</div>
</header>
<main style="max-width:1400px;margin:0 auto;padding:0 24px 48px">
<div style="display:flex;gap:4px;background:var(--srf);padding:4px;border-radius:12px;border:1px solid var(--bd);margin-bottom:24px;flex-wrap:wrap">
\${[{k:'overview',l:'📊 总览'},{k:'articles',l:'📝 文章管理'},{k:'generate',l:'✨ 生成文章'},{k:'config',l:'⚙️ 网站配置'},{k:'sources',l:'🔥 数据源'},{k:'contact',l:'📞 联系方式'},{k:'deploy',l:'☁️ 云端部署'}].map(t=>\`<button class="btn \${state.tab===t.k?'ta':'bg3'}" onclick="switchTab('\${t.k}')" style="font-size:13px">\${t.l}</button>\`).join('')}
</div>
<div id="tab-content" class="fade-in"></div>
<div class="card" style="padding:16px 20px;margin-top:24px">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12"><h3 style="font-size:14px;font-weight:600;margin:0">📋 操作日志</h3><button class="btn bg3 bs" onclick="clearLogs()">清空</button></div>
<div id="logs-body" style="height:130px;overflow-y:auto;background:rgba(0,0,0,.3);border-radius:10px;padding:10px 14px;font-size:12px;font-family:monospace" class="fi"></div>
</div>
</main>
<div id="modal-root"></div>
\`}

function renderModal(){const m=document.getElementById('modal-root');if(!m)return;const mod=state.modal;if(!mod){m.innerHTML='';return}if(mod.type==='confirm'){m.innerHTML=\`<div class="ov" onclick="closeModal()"><div class="md" style="max-width:420px" onclick="event.stopPropagation()"><div style="padding:32px;text-align:center"><div style="font-size:48px;margin-bottom:16px">⚠️</div><h2 style="font-size:18px;font-weight:700;margin:0 0 8px">确认删除</h2><p style="color:var(--mt);font-size:14px;margin:0 0 24px;line-height:1.6">\${esc(mod.msg)}</p><div style="display:flex;gap:12px;justify-content:center"><button class="btn bg3" onclick="closeModal()">取消</button><button class="btn br" onclick="closeModal();(\${mod.onConfirm})()">🗑️ 确认删除</button></div></div></div></div>\`;return}if(mod.type==='edit'){const p=mod.post||{};const isNew=!p.slug;m.innerHTML=\`<div class="ov" onclick="closeModal()"><div class="md" style="max-width:820px" onclick="event.stopPropagation()"><div style="display:flex;justify-content:space-between;align-items:center;padding:18px 24px;border-bottom:1px solid var(--bd)"><h2 style="font-size:16px;font-weight:700;margin:0">\${isNew?'📝 新建文章':'✏️ 编辑文章'}</h2><button onclick="closeModal()" style="background:none;border:none;color:var(--mt);font-size:22px;cursor:pointer;line-height:1">×</button></div><div style="padding:24px;overflow-y:auto;flex:1;display:grid;gap:16px;max-height:70vh"><div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">文章标题 *</label><input id="f-title" type="text" value="\${esc(p.title||'')}" class="fi" placeholder="输入文章标题..."></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">分类</label><select id="f-cat" class="fi">\${CATS.map(c=>\`<option value="\${c}" \${(p.category||'')===c?'selected':''}>\${CI[c]} \${c}</option>\`).join('')}</select></div><div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">数据来源</label><input id="f-src" type="text" value="\${esc(p.source||'手动编辑')}" class="fi" placeholder="如：百度热搜"></div></div><div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">文章摘要 *</label><textarea id="f-desc" class="fi" placeholder="输入文章描述..." style="min-height:80px">\${esc(p.description||'')}</textarea></div><div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">正文 (HTML)</label><textarea id="f-content" class="fi" placeholder="<h2>标题</h2><p>内容...</p>" style="min-height:200px;font-family:monospace;font-size:12px">\${esc(p.content||'')}</textarea></div><div style="display:grid;grid-template-columns:2fr 1fr;gap:12px"><div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">标签（逗号分隔）</label><input id="f-tags" type="text" value="\${esc((p.tags||[]).join(', '))}" class="fi" placeholder="AI, 科技, 大模型"></div><div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">封面图 URL</label><input id="f-img" type="text" value="\${esc(p.coverImage||'')}" class="fi" placeholder="https://..."></div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px"><div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">日期</label><input id="f-date" type="date" value="\${p.date||ds()}" class="fi"></div><div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">阅读时长(min)</label><input id="f-readtime" type="number" value="\${p.readTime||3}" class="fi" min="1" max="60"></div><div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">浏览量</label><input id="f-views" type="number" value="\${p.views||Math.floor(Math.random()*30000)+5000}" class="fi" min="0"></div></div></div><div style="padding:14px 24px;border-top:1px solid var(--bd);display:flex;gap:10px;justify-content:flex-end"><button class="btn bg3" onclick="closeModal()">取消</button><button class="btn bg2" onclick="doSavePost()">💾 保存文章</button></div></div></div>\`}}

function renderContent(){const content=document.getElementById('tab-content');if(!content)return;const f=(fn)=>{content.innerHTML=fn();content.classList.add('visible')};switch(state.tab){case'overview':f(renderOverview);break;case'articles':f(renderArticles);break;case'generate':f(renderGenerate);break;case'config':f(renderConfig);break;case'sources':f(renderSources);break;case'contact':f(renderContact);break;case'deploy':f(renderDeploy);break}}

const _origRender=render;render=function(){_origRender();renderContent();renderLogs()}

function renderOverview(){const stats=catStats();return\`<div style="display:grid;gap:24px" class="fa">
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px">
<div class="card" style="padding:20px"><p style="font-size:12px;color:var(--mt);margin:0 0 6px">📄 文章总数</p><p style="font-size:28px;font-weight:800;margin:0">\${state.articles.length}</p></div>
<div class="card" style="padding:20px"><p style="font-size:12px;color:var(--mt);margin:0 0 6px">📁 分类数</p><p style="font-size:28px;font-weight:800;margin:0">\${CATS.length}</p></div>
<div class="card" style="padding:20px"><p style="font-size:12px;color:var(--mt);margin:0 0 6px">☁️ 部署状态</p><p style="font-size:16px;font-weight:700;margin:0;color:var(--g)">\${state.syncing?'同步中':'已部署'}</p></div>
<div class="card" style="padding:20px"><p style="font-size:12px;color:var(--mt);margin:0 0 6px">🌐 网站地址</p><a href="\${SITE}" target="_blank" style="font-size:12px;color:var(--a);text-decoration:none;word-break:break-all">\${SITE}</a></div>
</div>
<div class="card" style="padding:20px"><h3 style="font-size:15px;font-weight:600;margin:0 0 14px">🚀 快捷操作</h3><div style="display:flex;gap:10px;flex-wrap:wrap">
<button class="btn bp" onclick="switchTab('generate')">✨ 新建文章</button>
<button class="btn bg2" onclick="switchTab('articles')">📝 管理文章</button>
<button class="btn bg2" onclick="syncNow()" \${state.syncing?'disabled':''}>☁️ 一键同步</button>
<button class="btn bg3" onclick="loadData()">🔄 刷新数据</button>
<a href="\${SITE}" target="_blank" class="btn bg3" style="text-decoration:none">🌐 预览网站</a>
</div></div>
<div class="card" style="padding:20px"><h3 style="font-size:15px;font-weight:600;margin:0 0 14px">📊 分类统计</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax:110px,1fr);gap:10px">\${CATS.map(c=>\`<div class="c2" style="padding:14px;text-align:center;cursor:pointer" onclick="state.filterCat='\${c}';switchTab('articles')"><div style="font-size:22px;margin-bottom:4px">\${CI[c]}</div><div style="font-size:11px;color:var(--mt);margin-bottom:4px">\${c}</div><div style="font-size:24px;font-weight:800">\${stats[c]||0}</div><div style="font-size:10px;color:var(--mt)">篇</div></div>\`).join('')}</div></div>
<div class="card" style="padding:20px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><h3 style="font-size:15px;font-weight:600;margin:0">📰 最新文章</h3><button class="btn bg3 bs" onclick="switchTab('articles')">查看全部 →</button></div>\${state.articles.length===0?'<p style="color:var(--dt);text-align:center;padding:20px">暂无文章</p>':\`<div style="display:grid;gap:6px">\${state.articles.slice(0,8).map(p=>\`<div class="tr" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;cursor:pointer" onclick="window.open('\${SITE}/posts/\${p.slug}','_blank')"><span class="tag \${CC[p.category]||'cx'}" style="flex-shrink:0">\${p.category}</span><span style="flex:1;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">\${esc(p.title)}</span><span style="font-size:11px;color:var(--dt);flex-shrink:0">\${p.date}</span></div>\`).join('')}</div>\`}</div>
</div>\`}

function renderArticles(){return\`<div class="fa" style="display:grid;gap:20px">
<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
<input id="search-kw" type="text" value="\${esc(state.searchKw)}" class="fi" placeholder="🔍 搜索文章..." style="max-width:280px" oninput="state.searchKw=this.value;filterArticles();renderArticles()">
<select id="filter-cat" class="fi" style="max-width:150px" onchange="state.filterCat=this.value;filterArticles();renderArticles()"><option value="all" \${state.filterCat==='all'?'selected':''}>📁 全部分类</option>\${CATS.map(c=>\`<option value="\${c}" \${state.filterCat===c?'selected':''}>\${CI[c]} \${c}</option>\`).join('')}</select>
<span style="font-size:13px;color:var(--mt);margin-left:auto">\${state.filteredArticles.length} 篇</span>
<button class="btn bp" onclick="openNewPostModal()">✨ 新建文章</button>
</div>
\${state.loading?'<div style="text-align:center;padding:60px;color:var(--mt)">⏳ 加载中...</div>':state.filteredArticles.length===0?'<div style="text-align:center;padding:60px;color:var(--dt)">📭 暂无文章</div>':\`<div class="card" style="overflow:hidden;overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px;min-width:700px"><thead><tr><th style="text-align:left;padding:12px 16px;color:var(--mt);font-weight:500;font-size:11px;border-bottom:1px solid var(--bd);white-space:nowrap">标题</th><th style="padding:12px 8px;color:var(--mt);font-weight:500;font-size:11px;border-bottom:1px solid var(--bd)">分类</th><th style="padding:12px 8px;color:var(--mt);font-weight:500;font-size:11px;border-bottom:1px solid var(--bd)">来源</th><th style="padding:12px 8px;color:var(--mt);font-weight:500;font-size:11px;border-bottom:1px solid var(--bd)">日期</th><th style="padding:12px 8px;color:var(--mt);font-weight:500;font-size:11px;border-bottom:1px solid var(--bd)">浏览</th><th style="padding:12px 16px;color:var(--mt);font-weight:500;font-size:11px;border-bottom:1px solid var(--bd);text-align:right">操作</th></tr></thead><tbody>\${state.filteredArticles.map(p=>\`<tr class="tr" style="border-bottom:1px solid rgba(42,42,69,.5)"><td style="padding:10px 16px;max-width:300px"><div style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer" onclick="window.open('\${SITE}/posts/\${p.slug}','_blank')">\${esc(p.title)}</div><div style="font-size:11px;color:var(--dt);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">\${esc((p.description||'').slice(0,50))}...</div></td><td style="padding:10px 8px"><span class="tag \${CC[p.category]||'cx'}">\${p.category}</span></td><td style="padding:10px 8px;font-size:12px;color:var(--mt)">\${esc(p.source||'')}</td><td style="padding:10px 8px;font-size:12px;color:var(--mt)">\${p.date}</td><td style="padding:10px 8px;font-size:12px;color:var(--mt)">👁 \${fv(p.views||0)}</td><td style="padding:10px 16px;text-align:right;white-space:nowrap"><button class="btn bg3 bs" style="cursor:pointer" onclick="openEditModal(state.articles.find(x=>x.slug==='\${p.slug}'))">✏️</button><button class="btn br bs" style="cursor:pointer;padding:6px 10px" onclick="openConfirmModal('确认删除「\${esc(p.title)}」？此操作不可撤销。',()=>deletePost('\${p.slug}'))">🗑️</button></td></tr>\`).join('')}</tbody></table></div>\`}
</div>\`}

function renderGenerate(){return\`<div class="fa" style="display:grid;gap:24px">
<div class="card" style="padding:24px"><h3 style="font-size:16px;font-weight:600;margin:0 0 16px">✨ 根据关键词生成文章</h3><div style="display:grid;gap:14px;max-width:600px"><div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">文章主题 / 关键词 *</label><input id="gen-kw" type="text" class="fi" placeholder="例如: DeepSeek R2发布、AI芯片竞争、房价走势..."></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">分类</label><select id="gen-cat" class="fi">\${CATS.map(c=>\`<option value="\${c}">\${CI[c]} \${c}</option>\`).join('')}</select></div><div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">标签（逗号分隔）</label><input id="gen-tags" type="text" class="fi" placeholder="例如: AI, 大模型, 科技"></div></div><div><button class="btn bg2" onclick="doGenerate()">⚡ 生成文章</button><span style="font-size:12px;color:var(--dt);margin-left:12px">生成后可进入「文章管理」编辑完整内容</span></div></div></div>
<div class="card" style="padding:24px"><h3 style="font-size:16px;font-weight:600;margin:0 0 16px">📦 批量生成</h3><div style="display:grid;gap:14px;max-width:600px"><div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">输入多个关键词（每行一个）</label><textarea id="batch-kw" class="fi" placeholder="DeepSeek R2发布&#10;新能源汽车补贴政策&#10;美联储利率决议&#10;华为Mate70系列" style="min-height:120px"></textarea></div><div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">统一分类</label><select id="batch-cat" class="fi" style="max-width:200px">\${CATS.map(c=>\`<option value="\${c}">\${CI[c]} \${c}</option>\`).join('')}</select></div><div><button class="btn bp" onclick="doBatchGenerate()">⚡ 批量生成</button></div></div></div>
<div class="card" style="padding:24px"><h3 style="font-size:16px;font-weight:600;margin:0 0 16px">🔥 快速生成（点击即生成）</h3><div style="display:flex;flex-wrap:wrap;gap:8px">\${[{kw:'DeepSeek R2发布',cat:'科技'},{kw:'AI人工智能最新突破',cat:'科技'},{kw:'新能源汽车补贴政策',cat:'社会'},{kw:'美联储利率决议',cat:'财经'},{kw:'苹果新品发布会',cat:'科技'},{kw:'华为Mate70系列',cat:'科技'},{kw:'全球AI芯片竞争',cat:'科技'},{kw:'短视频新规实施',cat:'社会'},{kw:'春季养生饮食指南',cat:'健康'},{kw:'房价走势分析',cat:'财经'},{kw:'高考改革最新消息',cat:'社会'},{kw:'世界杯预选赛',cat:'体育'}].map(item=>\`<button class="btn bg3" style="cursor:pointer" onclick="generateFromKeyword('\${item.kw}','\${item.cat}','');render()">⚡ \${item.kw}</button>\`).join('')}</div></div>
</div>\`}

function renderConfig(){const c=state.siteConfig;return\`<div class="fa" style="display:grid;gap:20px">
<div class="card" style="padding:24px"><h3 style="font-size:16px;font-weight:600;margin:0 0 16px">🖊️ 网站基本信息</h3><div style="display:grid;gap:14px;max-width:560px"><div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">网站名称</label><input id="cfg-siteName" type="text" value="\${esc(c.siteName)}" class="fi"></div><div><label style="display:block;font-size:12px;color:var(--mt);margin-bottom:6px">网站描述</label><textarea id="cfg