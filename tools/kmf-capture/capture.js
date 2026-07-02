(function(){
  'use strict';

  const CAPTURED = {};
  const DETAIL_URL = 'practise-detail';
  let autoRunning = false;
  let autoQueue = [];
  let autoIndex = 0;
  let autoTotal = 0;

  // ── Intercept pushState to capture practice IDs from URL changes ──
  const origPushState = history.pushState;
  history.pushState = function(state, title, url) {
    if (url) {
      const m = String(url).match(/[?&]u=(\d{10,})/);
      if (m && m[1] && !CAPTURED[m[1]]) {
        log(`  🔗 Found u=${m[1]} from URL: ${String(url).slice(0, 60)}`);
        pushStateIds.push(m[1]);
      }
    }
    return origPushState.apply(this, arguments);
  };

  const pushStateIds = [];

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
  var origOpen = XMLHttpRequest.prototype.open;
  var origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method, url) {
    this._kmf_url = url;
    return origOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function() {
    this.addEventListener('load', function() {
      if (this._kmf_url && this._kmf_url.includes(DETAIL_URL)) {
        try {
          var data = JSON.parse(this.responseText);
          var u = new URL(this._kmf_url);
          var uid = u.searchParams.get('u');
          if (uid && data.result) {
            CAPTURED[uid] = data;
            updatePanel();
          }
        } catch(e) {}
      }
    });
    return origSend.apply(this, arguments);
  };

  // ── Direct API fetch using page's cookies ──
  async function fetchPractiseDetail(uid) {
    var apiUrl = 'https://ielts.kmf.com/ielts-app/front/practise-detail?u=' + uid;
    try {
      var res = await fetch(apiUrl, { credentials: 'include' });
      var data = await res.json();
      if (data && data.result) {
        CAPTURED[uid] = data;
        return true;
      }
    } catch(e) {
      log('  ⚠ Fetch failed: ' + e.message);
    }
    return false;
  }

  // ── Scan for "继续练习" buttons ──
  // ID is NOT in HTML — it's in Vue component data. We click to trigger navigation,
  // intercept pushState to get the u= param, then go back and fetch directly.
  function scanButtons() {
    var buttons = [];

    var allLinks = document.querySelectorAll('a');
    for (var i = 0; i < allLinks.length; i++) {
      var a = allLinks[i];
      var text = (a.textContent || '').trim();
      if (text === '继续练习' || text === '开始练习' || text === '继续刷题') {
        // Get context from parent .part-item
        var item = a.closest('.part-item');
        var label = text;
        if (item) {
          var nameEl = item.querySelector('.seq_name, a[target]');
          if (nameEl) label = (nameEl.textContent || '').trim() + ' - ' + text;
        }
        var group = a.closest('[id^="group-"]');
        if (group) {
          var groupName = group.querySelector('.part-header_title');
          if (groupName) label = (groupName.textContent || '').trim() + ' / ' + label;
        }

        buttons.push({ el: a, label: label });
      }
    }

    if (buttons.length === 0) {
      log('⚠ No "继续练习" buttons found.');
      log('  Make sure you are on a KMF test list page.');
    }

    return buttons;
  }

  // ── Auto-flow: click each button → capture ID from URL → go back → fetch API ──
  async function autoNext() {
    if (autoIndex >= autoQueue.length) {
      autoRunning = false;
      updatePanel();
      log('✅ Done! Now fetching all captured IDs via API...');
      // Fetch APIs for all captured IDs
      var ids = Object.keys(CAPTURED);
      for (var i = 0; i < ids.length; i++) {
        if (CAPTURED[ids[i]] && CAPTURED[ids[i]].result) continue; // already has full data
        await fetchPractiseDetail(ids[i]);
        updatePanel();
      }
      log('✅ All ' + ids.length + ' items captured!');
      return;
    }

    var item = autoQueue[autoIndex];
    autoIndex++;
    log('[' + autoIndex + '/' + autoTotal + '] Clicking: ' + item.label);

    // Record IDs before click
    var beforeCount = pushStateIds.length;

    // Click the button — triggers Vue navigation
    item.el.click();

    // Wait for pushState to fire
    await new Promise(function(r) { setTimeout(r, 1500); });

    // Check if a new ID was captured
    var newIds = pushStateIds.slice(beforeCount);
    if (newIds.length > 0) {
      var uid = newIds[newIds.length - 1];
      log('  ✅ Captured u=' + uid);
      // Fetch API directly (don't wait for page to load)
      await fetchPractiseDetail(uid);
    } else {
      log('  ⚠ No ID captured from navigation. Trying direct API fetch from intercepted requests...');
    }

    updatePanel();

    // Go back to list page
    window.history.back();
    await new Promise(function(r) { setTimeout(r, 2000); });

    // Next item
    autoNext();
  }

  function startAuto() {
    if (autoRunning) return;
    log('⏳ Scanning for practice buttons...');
    setTimeout(function() {
      var buttons = scanButtons();
      if (buttons.length === 0) {
        updatePanel();
        return;
      }

      autoQueue = buttons;
      autoIndex = 0;
      autoTotal = buttons.length;
      autoRunning = true;
      log('✅ Found ' + autoTotal + ' items. Auto-capturing (page will navigate briefly)...');
      updatePanel();
      autoNext();
    }, 1500);
  }

  function stopAuto() {
    autoRunning = false;
    log('Stopped.');
    updatePanel();
  }

  // ── Log ──
  var logLines = [];
  function log(msg) {
    logLines.push(msg);
    if (logLines.length > 50) logLines.shift();
    updatePanel();
  }

  function updatePanel() {
    var count = Object.keys(CAPTURED).length;
    var countEl = document.getElementById('kmf-count');
    var listEl = document.getElementById('kmf-list');
    var logEl = document.getElementById('kmf-log');
    var btnEl = document.getElementById('kmf-btn');
    if (countEl) countEl.textContent = count;
    if (listEl) listEl.innerHTML = Object.keys(CAPTURED).slice(-10).map(function(k) { return '<div>u=' + k + '</div>'; }).join('');
    if (logEl) logEl.innerHTML = logLines.slice(-10).map(function(l) { return '<div>' + l + '</div>'; }).join('');
    if (btnEl) {
      btnEl.textContent = autoRunning ? '⏹ Stop' : '🚀 Auto Scan';
      btnEl.className = autoRunning ? 'kmf-stop-btn' : 'kmf-scan-btn';
    }
  }

  function downloadAll() {
    var keys = Object.keys(CAPTURED);
    if (keys.length === 0) { alert('No data captured yet.'); return; }

    var blob = new Blob([JSON.stringify(CAPTURED, null, 2)], {type:'application/json'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'kmf-data-' + new Date().toISOString().slice(0,10) + '.json';
    a.click();

    setTimeout(function() {
      for (var uid in CAPTURED) {
        var b = new Blob([JSON.stringify(CAPTURED[uid], null, 2)], {type:'application/json'});
        var a2 = document.createElement('a');
        a2.href = URL.createObjectURL(b);
        a2.download = 'kmf_' + uid + '.json';
        a2.click();
      }
    }, 500);
  }

  function createPanel() {
    var panel = document.createElement('div');
    panel.id = 'kmf-capture-panel';
    panel.innerHTML =
      '<style>' +
        '#kmf-capture-panel { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", monospace; }' +
        '.kmf-scan-btn { background:#4f46e5; color:#fff; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font:13px monospace; font-weight:bold; }' +
        '.kmf-stop-btn { background:#dc2626; color:#fff; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font:13px monospace; font-weight:bold; }' +
        '.kmf-dl-btn { background:#059669; color:#fff; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font:12px monospace; }' +
      '</style>' +
      '<div style="position:fixed;bottom:20px;right:20px;z-index:99999;background:#1e293b;color:#fff;border-radius:12px;padding:16px;font:14px monospace;box-shadow:0 8px 32px rgba(0,0,0,.3);min-width:300px;max-width:380px;">' +
        '<div style="font-weight:bold;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">' +
          '<span>KMF Capture <span id="kmf-count" style="color:#34d399">0</span></span>' +
          '<div style="display:flex;gap:6px;">' +
            '<button id="kmf-btn" class="kmf-scan-btn" style="font-size:12px;">🚀 Auto Scan</button>' +
            '<button id="kmf-dl" class="kmf-dl-btn">⬇</button>' +
          '</div>' +
        '</div>' +
        '<div id="kmf-log" style="font-size:10px;max-height:120px;overflow-y:auto;color:#94a3b8;margin-bottom:6px;line-height:1.5;"></div>' +
        '<div id="kmf-list" style="font-size:11px;max-height:80px;overflow-y:auto;color:#64748b"></div>' +
        '<div style="margin-top:6px;font-size:10px;color:#475569;">' +
          'Clicks "继续练习" → captures u=ID from URL → goes back → fetches API.' +
        '</div>' +
      '</div>';
    document.body.appendChild(panel);

    document.getElementById('kmf-btn').onclick = function() {
      if (autoRunning) stopAuto(); else startAuto();
    };
    document.getElementById('kmf-dl').onclick = downloadAll;

    updatePanel();
    log('Ready. Click "Auto Scan" to start capturing.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPanel);
  } else {
    createPanel();
  }
})();
