(function(){
  'use strict';

  const CAPTURED = {};
  const DETAIL_URL = 'practise-detail';

  // ── Intercept fetch ──
  const origFetch = window.fetch;
  window.fetch = async function(...args) {
    const res = await origFetch.apply(this, args);
    const url = typeof args[0] === 'string' ? args[0] : args[0].url;
    if (url.includes(DETAIL_URL)) {
      const clone = res.clone();
      clone.json().then(data => {
        const u = new URL(url);
        const uid = u.searchParams.get('u');
        if (uid && data.result) {
          CAPTURED[uid] = data;
          updateBadge();
        }
      }).catch(()=>{});
    }
    return res;
  };

  // ── Intercept XMLHttpRequest ──
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method, url) {
    this._kmf_url = url;
    return origOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function() {
    this.addEventListener('load', function() {
      if (this._kmf_url && this._kmf_url.includes(DETAIL_URL)) {
        try {
          const data = JSON.parse(this.responseText);
          const u = new URL(this._kmf_url);
          const uid = u.searchParams.get('u');
          if (uid && data.result) {
            CAPTURED[uid] = data;
            updateBadge();
          }
        } catch(e) {}
      }
    });
    return origSend.apply(this, arguments);
  };

  function updateBadge() {
    const count = Object.keys(CAPTURED).length;
    document.title = `[${count}] ${document.title.replace(/^\[\d+\]\s*/, '')}`;
  }

  // ── Floating panel ──
  function createPanel() {
    const panel = document.createElement('div');
    panel.id = 'kmf-capture-panel';
    panel.innerHTML = `
      <div style="position:fixed;bottom:20px;right:20px;z-index:99999;background:#1e293b;color:#fff;border-radius:12px;padding:16px;font:14px monospace;box-shadow:0 8px 32px rgba(0,0,0,.3);min-width:200px">
        <div style="font-weight:bold;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
          <span>KMF Capture <span id="kmf-count" style="color:#34d399">0</span></span>
          <button id="kmf-dl" style="background:#4f46e5;color:#fff;border:none;padding:4px 12px;border-radius:6px;cursor:pointer;font:12px monospace">⬇ Download</button>
        </div>
        <div id="kmf-list" style="font-size:11px;max-height:120px;overflow-y:auto;color:#94a3b8"></div>
        <div style="margin-top:8px;font-size:10px;color:#64748b">Click through tests → auto-saves</div>
      </div>
    `;
    document.body.appendChild(panel);

    document.getElementById('kmf-dl').onclick = function() {
      const keys = Object.keys(CAPTURED);
      if (keys.length === 0) return alert('No data captured yet. Open some practise pages first.');

      // Download as single JSON
      const blob = new Blob([JSON.stringify(CAPTURED, null, 2)], {type:'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `kmf-data-${new Date().toISOString().slice(0,10)}.json`;
      a.click();

      // Also download individual files
      setTimeout(() => {
        for (const [uid, data] of Object.entries(CAPTURED)) {
          const b = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
          const a2 = document.createElement('a');
          a2.href = URL.createObjectURL(b);
          a2.download = `kmf_${uid}.json`;
          a2.click();
        }
      }, 500);
    };

    // Update every 2s
    setInterval(() => {
      const keys = Object.keys(CAPTURED);
      document.getElementById('kmf-count').textContent = keys.length;
      document.getElementById('kmf-list').innerHTML = keys.slice(-10).map(k => `<div>u=${k}</div>`).join('');
    }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPanel);
  } else {
    createPanel();
  }
})();
