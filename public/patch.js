// patch.js - 一键抓取功能补丁
// 追加到 dashboard.bundle.js 后自动生效

// 新增 fetching 状态
if (typeof state !== 'undefined' && state.fetching === undefined) {
  state.fetching = false;
}

// 一键抓取函数
async function oneKeyFetch() {
  if (typeof state === 'undefined') return;
  if (state.fetching || state.syncing) return;
  state.fetching = true;
  if (typeof render === 'function') render();
  addLog('🔥 开始一键抓取热门话题...', 'info');
  try {
    addLog('📡 正在抓取热搜数据...', 'info');
    var resp = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    });
    var data = await resp.json();
    if (data.success) {
      addLog('✅ 生成完成！共 ' + data.count + ' 篇文章', 'success');
      addLog('☁️ 已推送到 GitHub，Vercel 将自动更新', 'success');
      if (typeof loadData === 'function') await loadData();
    } else {
      addLog('❌ 生成失败: ' + (data.error || '未知错误'), 'error');
    }
  } catch(e) {
    addLog('❌ 网络错误: ' + e.message, 'error');
  }
  state.fetching = false;
  if (typeof render === 'function') render();
}

// 注入按钮 HTML
document.addEventListener('DOMContentLoaded', function() {
  // 等待主脚本加载完成
  setTimeout(function() {
    patchButtons();
  }, 500);
});

function patchButtons() {
  // 在快捷操作区添加一键抓取按钮
  var quickBtns = document.querySelector('.card');
  if (quickBtns && !document.getElementById('onekey-btn')) {
    var btn = document.createElement('button');
    btn.id = 'onekey-btn';
    btn.className = 'btn';
    btn.style.cssText = 'background:linear-gradient(135deg,#ef4444,#f97316);color:white;cursor:pointer';
    btn.textContent = '🔥 一键抓取';
    btn.onclick = oneKeyFetch;

    // 找到快捷操作区的按钮容器
    var cards = document.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) {
      var h3 = cards[i].querySelector('h3');
      if (h3 && h3.textContent.includes('快捷操作')) {
        var btnRow = cards[i].querySelector('div');
        if (btnRow) {
          // 在第一个按钮前插入
          btnRow.insertBefore(btn, btnRow.firstChild);
          break;
        }
      }
    }
  }
}
