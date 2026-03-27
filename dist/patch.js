// patch.js - 一键抓取功能（分类选择弹窗）
(function() {
  var CATS = ['科技','财经','社会','娱乐','体育','健康','生活','国际','热点'];
  var CI = {'科技':'💻','财经':'📈','社会':'🏙️','娱乐':'🎬','体育':'⚽','健康':'🌿','生活':'🏠','国际':'🌍','热点':'🔥'};
  var modalOpen = false;

  function showModal() {
    if (modalOpen) return;
    modalOpen = true;
    var catsHtml = CATS.map(function(c) {
      return '<label id="cat-' + c + '" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(26,26,42,0.8);border:1px solid #2a2a45;border-radius:10px;cursor:pointer;transition:all .15s;min-width:110px" onmouseover="this.style.borderColor=\'#6366f1\'" onmouseout="this.style.borderColor=\'#2a2a45\'">' +
        '<input type="checkbox" value="' + c + '" class="cat-cb" style="width:16px;height:16px;accent-color:#6366f1;cursor:pointer">' +
        '<span style="font-size:16px">' + CI[c] + '</span>' +
        '<span style="color:#e2e8f0;font-size:13px;font-weight:500">' + c + '</span></label>';
    }).join('');

    var overlay = document.createElement('div');
    overlay.id = 'fetch-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';

    overlay.innerHTML =
      '<div style="background:#14142a;border:1px solid #2a2a45;border-radius:20px;width:100%;max-width:600px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;margin:20px;box-shadow:0 25px 50px rgba(0,0,0,0.5)">' +

      '<div style="padding:20px 24px;border-bottom:1px solid #2a2a45;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">' +
        '<div><h2 style="margin:0;font-size:17px;font-weight:700;color:white">🔥 选择抓取分类</h2><p style="margin:4px 0 0;font-size:12px;color:#6b7280">选择资讯分类，不选则抓取全部</p></div>' +
        '<button id="close-btn" style="background:none;border:none;color:#6b7280;font-size:24px;cursor:pointer;line-height:1;padding:4px">×</button>' +
      '</div>' +

      '<div style="padding:20px 24px;overflow-y:auto;flex:1">' +
        '<div style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between">' +
          '<span style="font-size:12px;color:#6b7280">可多选</span>' +
          '<button id="toggle-all-btn" style="background:none;border:none;color:#6366f1;font-size:12px;cursor:pointer">全选 / 取消</button>' +
        '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">' + catsHtml + '</div>' +
        '<div style="margin-top:14px;padding:14px;background:rgba(99,102,241,0.1);border-radius:10px;border:1px solid rgba(99,102,241,0.2)">' +
          '<label style="display:block;font-size:12px;color:#6b7280;margin-bottom:6px">每类抓取文章数量（默认10篇）</label>' +
          '<input id="fetch-num" type="number" value="10" min="1" max="30" style="background:#0f0f1c;border:1px solid #2a2a45;border-radius:8px;padding:8px 12px;color:white;width:100px;font-size:14px">' +
        '</div>' +
      '</div>' +

      '<div style="padding:14px 24px;border-top:1px solid #2a2a45;display:flex;gap:10px;justify-content:flex-end;flex-shrink:0">' +
        '<button id="cancel-btn" style="padding:9px 20px;border-radius:10px;border:1px solid #2a2a45;background:#1a1a32;color:#6b7280;cursor:pointer;font-size:14px;font-weight:500">取消</button>' +
        '<button id="go-btn" style="padding:9px 24px;border-radius:10px;border:none;background:linear-gradient(135deg,#ef4444,#f97316);color:white;cursor:pointer;font-size:14px;font-weight:500">🚀 开始抓取</button>' +
      '</div>' +
    '</div>';

    document.body.appendChild(overlay);

    document.getElementById('close-btn').onclick = hideModal;
    document.getElementById('cancel-btn').onclick = hideModal;
    document.getElementById('toggle-all-btn').onclick = function() {
      var checks = document.querySelectorAll('.cat-cb');
      var any = Array.prototype.slice.call(checks).some(function(c){ return c.checked; });
      checks.forEach(function(c){ c.checked = !any; });
    };
    document.getElementById('go-btn').onclick = doFetch;
    overlay.onclick = function(e){ if(e.target===overlay) hideModal(); };
  }

  function hideModal() {
    modalOpen = false;
    var el = document.getElementById('fetch-overlay');
    if (el) el.remove();
  }

  function doFetch() {
    var cats = Array.prototype.slice.call(document.querySelectorAll('.cat-cb:checked')).map(function(c){ return c.value; });
    var limit = parseInt(document.getElementById('fetch-num').value) || 10;
    hideModal();

    if (typeof state === 'undefined') return;
    if (state.fetching || state.syncing) return;
    state.fetching = true;
    if (typeof render === 'function') render();
    addLog('🔥 开始抓取热门话题（' + (cats.length ? cats.join(', ') : '全部分类') + '）...', 'info');
    addLog('📡 抓取中，请稍候...', 'info');

    var body = JSON.stringify({ categories: cats.length ? cats : null, limit: limit });
    fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body
    }).then(function(r){ return r.json(); }).then(function(data) {
      if (data.success) {
        addLog('✅ 生成完成！共 ' + data.count + ' 篇文章', 'success');
        addLog('☁️ 已推送 GitHub，Vercel 将自动更新', 'success');
      } else {
        addLog('❌ 失败: ' + (data.error || '未知错误'), 'error');
      }
      state.fetching = false;
      if (typeof loadData === 'function') loadData();
      if (typeof render === 'function') render();
    }).catch(function(e) {
      addLog('❌ 网络错误: ' + e.message, 'error');
      state.fetching = false;
      if (typeof render === 'function') render();
    });
  }

  function injectButton() {
    var cards = document.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) {
      var h3s = cards[i].querySelectorAll('h3');
      for (var j = 0; j < h3s.length; j++) {
        if (h3s[j].textContent.indexOf('快捷操作') >= 0 || h3s[j].textContent.indexOf('🚀') >= 0) {
          var btn = document.createElement('button');
          btn.id = 'onekey-btn';
          btn.style.cssText = 'background:linear-gradient(135deg,#ef4444,#f97316);color:white;cursor:pointer;padding:9px 18px;border-radius:10px;font-weight:500;border:none;display:inline-flex;align-items:center;gap:6px;font-size:14px';
          btn.textContent = '🔥 一键抓取';
          btn.onclick = showModal;
          var divs = cards[i].querySelectorAll('div');
          for (var k = 0; k < divs.length; k++) {
            if (divs[k].style.cssText.indexOf('flex') >= 0 && divs[k].style.cssText.indexOf('gap') >= 0) {
              var existing = divs[k].querySelector('#onekey-btn');
              if (!existing) {
                divs[k].insertBefore(btn, divs[k].firstChild);
              }
              return;
            }
          }
          return;
        }
      }
    }
    setTimeout(injectButton, 600);
  }

  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(injectButton, 600);
  });
})();
