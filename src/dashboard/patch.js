// patch.js - 一键抓取功能（DOM注入方式）
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(injectOneKeyButton, 600);
});

function injectOneKeyButton() {
  // 在快捷操作卡片中查找按钮容器
  var cards = document.querySelectorAll('.card');
  for (var i = 0; i < cards.length; i++) {
    var h3 = cards[i].querySelector('h3, [style*="font-size:15px"]');
    if (!h3) continue;
    var text = h3.textContent || '';
    if (text.indexOf('快捷操作') >= 0 || text.indexOf('🚀') >= 0) {
      var btnContainer = cards[i].querySelector('div[style*="flex"], div[class*="flex"]');
      if (!btnContainer) btnContainer = cards[i].querySelector('div');
      if (btnContainer) {
        // 检查是否已注入
        if (document.getElementById('onekey-btn')) return;

        var btn = document.createElement('button');
        btn.id = 'onekey-btn';
        btn.className = 'btn';
        btn.style.cssText = 'background:linear-gradient(135deg,#ef4444,#f97316);color:white;cursor:pointer;font-size:14px;padding:9px 18px;border-radius:10px;font-weight:500;border:none;display:inline-flex;align-items:center;gap:6px';
        btn.textContent = '🔥 一键抓取';
        btn.onclick = function() {
          // 调用 dashboard.bundle.js 中的 oneKeyFetch（通过全局 state 间接触发）
          if (typeof state !== 'undefined') {
            if (state.fetching || state.syncing) return;
            state.fetching = true;
            if (typeof render === 'function') render();
            addLog('🔥 开始一键抓取热门话题...', 'info');
            fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
              .then(function(r){ return r.json() })
              .then(function(data) {
                if (data.success) {
                  addLog('✅ 生成完成！共 ' + data.count + ' 篇文章', 'success');
                  addLog('☁️ 已推送 GitHub，Vercel 将自动更新', 'success');
                } else {
                  addLog('❌ 失败: ' + (data.error || '未知错误'), 'error');
                }
                state.fetching = false;
                if (typeof loadData === 'function') loadData();
                if (typeof render === 'function') render();
              })
              .catch(function(e) {
                addLog('❌ 网络错误: ' + e.message, 'error');
                state.fetching = false;
                if (typeof render === 'function') render();
              });
          }
        };
        btnContainer.insertBefore(btn, btnContainer.firstChild);
        return;
      }
    }
  }
  // 再次尝试（延迟加载）
  if (!document.getElementById('onekey-btn')) {
    setTimeout(injectOneKeyButton, 1000);
  }
}
