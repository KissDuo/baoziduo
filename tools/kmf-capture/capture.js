(function(){
  'use strict';

  var CAPTURED = {};
  var DETAIL_URL = 'practise-detail';
  var autoRunning = false;
  var autoQueue = [];
  var autoIndex = 0;
  var autoTotal = 0;

  // ── Restore captured data from storage ──
  chrome.storage.local.get('kmfCapture', function(res) {
    if (res.kmfCapture) {
      CAPTURED = res.kmfCapture;
      log('📦 Restored ' + Object.keys(CAPTURED).length + ' saved items');
      updatePanel();
    }
  });

  function saveToStorage() {
    chrome.storage.local.set({ kmfCapture: CAPTURED });
  }

  // ── Intercept pushState to capture practice IDs from URL changes ──
  var pushStateIds = [];
  function captureIdFromUrl(url) {
    if (!url) return null;
    var s = String(url);
    var m = s.match(/\/start\/(\d{15,20})/);
    if (m) return m[1];
    m = s.match(/[?&]u=(\d{10,})/);
    if (m) return m[1];
    m = s.match(/\/claw\/(\d{15,20})/);
    if (m) return m[1];
    return null;
  }

  var origPushState = history.pushState;
  history.pushState = function(state, title, url) {
    var id = captureIdFromUrl(url);
    if (id && pushStateIds.indexOf(id) === -1) pushStateIds.push(id);
    return origPushState.apply(this, arguments);
  };

  // ── Intercept fetch ──
  var origFetch = window.fetch;
  window.fetch = async function() {
    var args = arguments;
    var res = await origFetch.apply(this, args);
    var url = typeof args[0] === 'string' ? args[0] : args[0].url;
    if (url.indexOf(DETAIL_URL) !== -1) {
      var clone = res.clone();
      clone.json().then(function(data) {
        var u = new URL(url);
        var uid = u.searchParams.get('u');
        if (uid && data.result) {
          CAPTURED[uid] = data;
          saveToStorage();
          updatePanel();
        }
      }).catch(function(){});
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
    var self = this;
    this.addEventListener('load', function() {
      if (self._kmf_url && self._kmf_url.indexOf(DETAIL_URL) !== -1) {
        try {
          var data = JSON.parse(self.responseText);
          var u = new URL(self._kmf_url);
          var uid = u.searchParams.get('u');
          if (uid && data.result) {
            CAPTURED[uid] = data;
            saveToStorage();
            updatePanel();
          }
        } catch(e) {}
      }
    });
    return origSend.apply(this, arguments);
  };

  // ── Direct API fetch ──
  async function fetchPractiseDetail(uid) {
    var apiUrl = 'https://ielts.kmf.com/ielts-app/front/practise-detail?u=' + uid;
    try {
      var res = await fetch(apiUrl, { credentials: 'include' });
      var data = await res.json();
      if (data && data.result) {
        CAPTURED[uid] = data;
        saveToStorage();
        updatePanel();
        return true;
      }
    } catch(e) {}
    return false;
  }

  // ── Extract practice ID from Vue component ──
  function extractVueId(el) {
    var p = el;
    while (p && p !== document.body) {
      if (p.__vue__) {
        try {
          var vue = p.__vue__;
          for (var k in vue) {
            if (vue.hasOwnProperty(k)) {
              var sv = String(vue[k]);
              if (/^\d{15,20}$/.test(sv)) return sv;
            }
          }
        } catch(e) {}
      }
      p = p.parentElement;
    }
    return null;
  }

  // ── Also check current page URL for the ID ──
  function idFromCurrentPage() {
    return captureIdFromUrl(window.location.href);
  }

  // ── Scan for "继续练习" buttons ──
  function scanButtons() {
    var buttons = [];
    var allLinks = document.querySelectorAll('a');
    for (var i = 0; i < allLinks.length; i++) {
      var a = allLinks[i];
      var text = (a.textContent || '').trim();
      if (text === '继续练习' || text === '开始练习' || text === '继续刷题') {
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
        buttons.push({ el: a, label: label, id: extractVueId(a) });
      }
    }

    if (buttons.length === 0) {
      log('⚠ No buttons found. Try on KMF test list page.');
    } else {
      var withId = buttons.filter(function(b) { return b.id; }).length;
      log('Found ' + buttons.length + ' buttons (' + withId + ' with Vue IDs)');
    }
    return buttons;
  }

  // ── Auto-flow: open each button's link in new tab ──
  async function autoNext() {
    if (autoIndex >= autoQueue.length) {
      autoRunning = false;
      updatePanel();
      log('✅ Done scanning. Fetching all API data...');
      var allIds = Object.keys(CAPTURED);
      for (var j = 0; j < pushStateIds.length; j++) {
        if (allIds.indexOf(pushStateIds[j]) === -1) allIds.push(pushStateIds[j]);
      }
      for (var k = 0; k < allIds.length; k++) {
        if (!CAPTURED[allIds[k]] || !CAPTURED[allIds[k]].result) {
          log('  Fetching u=' + allIds[k] + '...');
          await fetchPractiseDetail(allIds[k]);
          updatePanel();
        }
      }
      log('✅ Complete! ' + Object.keys(CAPTURED).length + ' items total.');
      updatePanel();
      return;
    }

    var item = autoQueue[autoIndex];
    autoIndex++;
    updatePanel();

    if (item.id) {
      // Already have ID from Vue — fetch directly
      log('[' + autoIndex + '/' + autoTotal + '] ' + item.label + ' (ID: ' + item.id + ')');
      var ok = await fetchPractiseDetail(item.id);
      log(ok ? '  ✅ Saved' : '  ⚠ Failed');
      setTimeout(function() { autoNext(); }, 500);
    } else {
      // No ID — open in new tab to trigger API capture
      log('[' + autoIndex + '/' + autoTotal + '] Opening in new tab: ' + item.label);
      // Simulate ctrl+click to open in new tab
      var evt = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true, metaKey: true });
      item.el.dispatchEvent(evt);

      // Wait for the new tab to load and API to fire
      await new Promise(function(r) { setTimeout(r, 3000); });

      // Check if any new data was captured from the API interceptor in the new tab
      // (chrome.storage is shared across tabs!)
      var stored = await new Promise(function(resolve) {
        chrome.storage.local.get('kmfCapture', function(r) { resolve(r.kmfCapture || {}); });
      });
      var newCount = Object.keys(stored).length - Object.keys(CAPTURED).length;
      if (newCount > 0) {
        CAPTURED = stored;
        log('  ✅ ' + newCount + ' new item(s) captured from tab');
      } else {
        log('  ⚠ No new data from tab yet');
      }

      setTimeout(function() { autoNext(); }, 800);
    }
  }

  function startAuto() {
    if (autoRunning) return;
    log('⏳ Scanning...');
    setTimeout(function() {
      var buttons = scanButtons();
      if (buttons.length === 0) { updatePanel(); return; }
      autoQueue = buttons;
      autoIndex = 0;
      autoTotal = buttons.length;
      autoRunning = true;
      log('Starting auto-capture for ' + autoTotal + ' items...');
      updatePanel();
      autoNext();
    }, 1000);
  }

  function stopAuto() {
    autoRunning = false;
    log('Stopped.');
    updatePanel();
  }

  // ── Capture current page (for when you're on a practice page) ──
  function captureCurrent() {
    var id = idFromCurrentPage();
    if (id) {
      log('Current page ID: ' + id);
      fetchPractiseDetail(id).then(function(ok) {
        log(ok ? '✅ Captured!' : '⚠ Failed');
      });
    } else {
      log('No ID found in current URL. Manually navigate a practice page first.');
    }
  }

  // ── Log ──
  var logLines = [];
  function log(msg) {
    logLines.push(msg);
    if (logLines.length > 100) logLines.shift();
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
    if (logEl) logEl.innerHTML = logLines.slice(-12).map(function(l) { return '<div>' + l + '</div>'; }).join('');
    if (btnEl) {
      btnEl.textContent = autoRunning ? '⏹ Stop' : '🚀 Auto Scan';
      btnEl.className = autoRunning ? 'kmf-stop-btn' : 'kmf-scan-btn';
    }
  }

  function clearAll() {
    CAPTURED = {};
    chrome.storage.local.remove('kmfCapture');
    log('Cleared all data.');
    updatePanel();
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
        '.kmf-dl-btn { background:#059669; color:#fff; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; font:12px monospace; }' +
        '.kmf-clr-btn { background:#64748b; color:#fff; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; font:12px monospace; }' +
      '</style>' +
      '<div style="position:fixed;bottom:20px;right:20px;z-index:99999;background:#1e293b;color:#fff;border-radius:12px;padding:14px;font:14px monospace;box-shadow:0 8px 32px rgba(0,0,0,.3);min-width:300px;max-width:400px;">' +
        '<div style="font-weight:bold;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">' +
          '<span>KMF Capture <span id="kmf-count" style="color:#34d399">0</span></span>' +
          '<div style="display:flex;gap:4px;">' +
            '<button id="kmf-btn" class="kmf-scan-btn" style="font-size:11px;">🚀 Scan</button>' +
            '<button id="kmf-cap" class="kmf-dl-btn" style="font-size:11px;">📡 Capture</button>' +
            '<button id="kmf-dl" class="kmf-dl-btn">⬇</button>' +
            '<button id="kmf-clr" class="kmf-clr-btn">🗑</button>' +
          '</div>' +
        '</div>' +
        '<div id="kmf-log" style="font-size:10px;max-height:140px;overflow-y:auto;color:#94a3b8;margin-bottom:4px;line-height:1.5;"></div>' +
        '<div id="kmf-list" style="font-size:10px;max-height:60px;overflow-y:auto;color:#64748b"></div>' +
        '<div style="margin-top:4px;font-size:9px;color:#475569;">' +
          'Scan: auto-detect on list page | Capture: grab current practice page | Data persists across tabs' +
        '</div>' +
      '</div>';
    document.body.appendChild(panel);

    document.getElementById('kmf-btn').onclick = function() { if (autoRunning) stopAuto(); else startAuto(); };
    document.getElementById('kmf-cap').onclick = captureCurrent;
    document.getElementById('kmf-dl').onclick = downloadAll;
    document.getElementById('kmf-clr').onclick = clearAll;

    updatePanel();
    log('Ready. Use "Scan" on list page, or "Capture" on practice page.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPanel);
  } else {
    createPanel();
  }
})();
