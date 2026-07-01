(function(){
  'use strict';

  const CAPTURED = {};
  const DETAIL_URL = 'practise-detail';
  let autoRunning = false;
  let autoQueue = [];
  let autoIndex = 0;
  let autoTotal = 0;

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
          updatePanel();
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
            updatePanel();
          }
        } catch(e) {}
      }
    });
    return origSend.apply(this, arguments);
  };

  // ── Extract practice ID from an element ──
  function extractId(el) {
    // Check data attributes first
    for (const attr of ['data-u', 'data-id', 'data-paper-id', 'data-question-id', 'data-sheet-id']) {
      const v = el.getAttribute(attr);
      if (v && /^\d{10,}$/.test(v.trim())) return v.trim();
    }
    // Check href
    const href = el.getAttribute('href') || (el.closest('a') && el.closest('a').getAttribute('href'));
    if (href) {
      const m = href.match(/[?&]u=(\d+)/);
      if (m) return m[1];
    }
    // Check parent tree for data attributes
    let p = el.parentElement;
    while (p && p !== document.body) {
      for (const attr of ['data-u', 'data-paper-id', 'data-question-id']) {
        const v = p.getAttribute(attr);
        if (v && /^\d{10,}$/.test(v.trim())) return v.trim();
      }
      p = p.parentElement;
    }
    // Check onclick / vue handlers
    const onclick = el.getAttribute('onclick') || '';
    const vm = onclick.match(/\d{10,}/);
    if (vm) return vm[0];
    return null;
  }

  // ── Scan page for practice buttons ──
  function scanButtons() {
    const buttons = [];
    // Look for links and buttons containing "开始练习" or "继续练习"
    const selectors = 'a, button, div[class*="btn"], span[class*="btn"], div[class*="button"], div[role="button"]';
    const all = document.querySelectorAll(selectors);

    for (const el of all) {
      const text = (el.textContent || '').trim();
      if (text.includes('开始练习') || text.includes('继续练习') || text.includes('继续刷题')) {
        const id = extractId(el);
        if (id) {
          buttons.push({ el, id, text: text.slice(0, 30) });
        }
      }
    }

    // Also check for any link with practise-detail in href
    const links = document.querySelectorAll('a[href*="practise-detail"], a[href*="practyse-detail"]');
    for (const a of links) {
      const m = (a.getAttribute('href') || '').match(/[?&]u=(\d+)/);
      if (m) {
        // Avoid duplicates
        if (!buttons.find(b => b.id === m[1])) {
          buttons.push({ el: a, id: m[1], text: (a.textContent || '').trim().slice(0, 30) || '(link)' });
        }
      }
    }

    return buttons;
  }

  // ── Auto-click next in queue ──
  async function autoNext() {
    if (autoIndex >= autoQueue.length) {
      autoRunning = false;
      updatePanel();
      log('✅ All done! ' + autoTotal + ' items scanned.');
      return;
    }

    const item = autoQueue[autoIndex];
    log(`[${autoIndex + 1}/${autoTotal}] Clicking: ${item.text} (u=${item.id})`);

    try {
      item.el.click();
    } catch(e) {
      log(`  ⚠ Click failed: ${e.message}`);
    }

    autoIndex++;

    // Wait for API response to be captured (the page navigates and API fires)
    // Then go back and click next
    setTimeout(() => {
      if (window.history && autoIndex < autoQueue.length) {
        window.history.back();
        setTimeout(() => autoNext(), 2000);
      } else {
        autoNext();
      }
    }, 3000);
  }

  function startAuto() {
    if (autoRunning) return;
    const buttons = scanButtons();
    if (buttons.length === 0) {
      log('⚠ No practice buttons found on this page.');
      return;
    }

    autoQueue = buttons;
    autoIndex = 0;
    autoTotal = buttons.length;
    autoRunning = true;
    log(`Found ${autoTotal} practice buttons. Starting auto-capture...`);
    updatePanel();
    autoNext();
  }

  function stopAuto() {
    autoRunning = false;
    log('Stopped.');
    updatePanel();
  }

  // ── Log ──
  const logLines = [];
  function log(msg) {
    logLines.push(msg);
    if (logLines.length > 50) logLines.shift();
    updatePanel();
  }

  // ── Floating panel ──
  function updatePanel() {
    const count = Object.keys(CAPTURED).length;
    const countEl = document.getElementById('kmf-count');
    const listEl = document.getElementById('kmf-list');
    const logEl = document.getElementById('kmf-log');
    const btnEl = document.getElementById('kmf-btn');
    if (countEl) countEl.textContent = count;
    if (listEl) listEl.innerHTML = Object.keys(CAPTURED).slice(-10).map(k => `<div>u=${k}</div>`).join('');
    if (logEl) logEl.innerHTML = logLines.slice(-10).map(l => `<div>${l}</div>`).join('');
    if (btnEl) {
      btnEl.textContent = autoRunning ? '⏹ Stop' : '🚀 Auto Scan';
      btnEl.className = autoRunning ? 'kmf-stop-btn' : 'kmf-scan-btn';
    }
  }

  function downloadAll() {
    const keys = Object.keys(CAPTURED);
    if (keys.length === 0) { alert('No data captured yet.'); return; }

    // Single combined JSON
    const blob = new Blob([JSON.stringify(CAPTURED, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `kmf-data-${new Date().toISOString().slice(0,10)}.json`;
    a.click();

    // Individual files (delayed)
    setTimeout(() => {
      for (const [uid, data] of Object.entries(CAPTURED)) {
        const b = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
        const a2 = document.createElement('a');
        a2.href = URL.createObjectURL(b);
        a2.download = `kmf_${uid}.json`;
        a2.click();
      }
    }, 500);
  }

  function createPanel() {
    const panel = document.createElement('div');
    panel.id = 'kmf-capture-panel';
    panel.innerHTML = `
      <style>
        #kmf-capture-panel { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace; }
        .kmf-scan-btn { background:#4f46e5; color:#fff; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font:13px monospace; font-weight:bold; }
        .kmf-stop-btn { background:#dc2626; color:#fff; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font:13px monospace; font-weight:bold; }
        .kmf-dl-btn { background:#059669; color:#fff; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font:12px monospace; }
      </style>
      <div style="position:fixed;bottom:20px;right:20px;z-index:99999;background:#1e293b;color:#fff;border-radius:12px;padding:16px;font:14px monospace;box-shadow:0 8px 32px rgba(0,0,0,.3);min-width:280px;max-width:360px;">
        <div style="font-weight:bold;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
          <span>KMF Capture <span id="kmf-count" style="color:#34d399">0</span></span>
          <div style="display:flex;gap:6px;">
            <button id="kmf-btn" class="kmf-scan-btn" style="font-size:12px;">🚀 Auto Scan</button>
            <button id="kmf-dl" class="kmf-dl-btn">⬇</button>
          </div>
        </div>
        <div id="kmf-log" style="font-size:10px;max-height:100px;overflow-y:auto;color:#94a3b8;margin-bottom:6px;line-height:1.5;"></div>
        <div id="kmf-list" style="font-size:11px;max-height:80px;overflow-y:auto;color:#64748b"></div>
        <div style="margin-top:6px;font-size:10px;color:#475569;">
          Auto-scan finds "开始练习"/"继续练习" buttons and clicks them to capture API data.
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    document.getElementById('kmf-btn').onclick = () => {
      if (autoRunning) stopAuto(); else startAuto();
    };
    document.getElementById('kmf-dl').onclick = downloadAll;

    updatePanel();
    log('Ready. Click "Auto Scan" to start, or navigate manually.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPanel);
  } else {
    createPanel();
  }
})();
