(function(){
  'use strict';

  var CAPTURED = {};
  var DETAIL_URL = 'practise-detail';
  var RECORDS_URL = 'web-index/records';

  // ── Init ──
  chrome.storage.local.get('kmfCapture', function(res) {
    if (res.kmfCapture) CAPTURED = res.kmfCapture;
    createPanel();
    log('📡 Ready. ' + realCount() + ' items stored.');
    updatePanel();
  });

  function save() { chrome.storage.local.set({ kmfCapture: CAPTURED }); }
  function realCount() {
    var c = 0;
    for (var k in CAPTURED) { if (CAPTURED.hasOwnProperty(k) && CAPTURED[k] && CAPTURED[k].result) c++; }
    return c;
  }

  // ── Fetch all practise-detail for a list of exam_unique IDs ──
  var fetchQueue = [];
  var fetching = false;

  function fetchAllDetails(uids) {
    // Add new IDs to queue (avoid duplicates)
    for (var i = 0; i < uids.length; i++) {
      if (fetchQueue.indexOf(uids[i]) === -1 && !(CAPTURED[uids[i]] && CAPTURED[uids[i]].result)) {
        fetchQueue.push(uids[i]);
      }
    }
    if (!fetching) processQueue();
  }

  function processQueue() {
    if (fetchQueue.length === 0) {
      fetching = false;
      log('🎉 Done! ' + realCount() + ' items captured.');
      updatePanel();
      return;
    }
    fetching = true;
    var uid = fetchQueue.shift();
    log('[' + realCount() + '/' + (realCount() + fetchQueue.length + 1) + '] Fetching...');

    fetch('https://api.kmf.com/ielts-app/front/practise-detail?u=' + uid, { credentials: 'include' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && data.result) {
          CAPTURED[uid] = data;
          save();
        }
        updatePanel();
        setTimeout(processQueue, 400);
      })
      .catch(function() {
        log('  ⚠ Failed: ' + uid.slice(0,12) + '...');
        updatePanel();
        setTimeout(processQueue, 600);
      });
  }

  // ── Intercept fetch ──
  var origFetch = window.fetch;
  window.fetch = function() {
    var args = arguments;
    var url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url);
    var isRecords = url && url.indexOf(RECORDS_URL) !== -1;
    var isDetail = url && url.indexOf(DETAIL_URL) !== -1;

    return origFetch.apply(this, args).then(function(res) {
      if (isRecords || isDetail) {
        var clone = res.clone();
        clone.json().then(function(data) {
          if (isRecords && data && data.result && Array.isArray(data.result)) {
            var uids = data.result.map(function(r) { return r.exam_unique; }).filter(Boolean);
            if (uids.length > 0) {
              log('📋 Found ' + uids.length + ' practice IDs');
              fetchAllDetails(uids);
            }
          }
          if (isDetail && data && data.result) {
            var u = new URL(url);
            var uid = u.searchParams.get('u');
            if (uid) { CAPTURED[uid] = data; save(); updatePanel(); }
          }
        }).catch(function(){});
      }
      return res;
    });
  };

  // ── Intercept XHR ──
  var origOpen = XMLHttpRequest.prototype.open;
  var origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method, url) {
    this._kmf_url = url;
    return origOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function() {
    var self = this;
    this.addEventListener('load', function() {
      var url = self._kmf_url || '';
      if (url.indexOf(RECORDS_URL) !== -1) {
        try {
          var data = JSON.parse(self.responseText);
          if (data && data.result && Array.isArray(data.result)) {
            var uids = data.result.map(function(r) { return r.exam_unique; }).filter(Boolean);
            if (uids.length > 0) {
              log('📋 Found ' + uids.length + ' IDs (XHR)');
              fetchAllDetails(uids);
            }
          }
        } catch(e) {}
      }
      if (url.indexOf(DETAIL_URL) !== -1) {
        try {
          var data2 = JSON.parse(self.responseText);
          if (data2 && data2.result) {
            var u = new URL(url);
            var uid = u.searchParams.get('u');
            if (uid) { CAPTURED[uid] = data2; save(); updatePanel(); }
          }
        } catch(e) {}
      }
    });
    return origSend.apply(this, arguments);
  };

  // ── UI ──
  var logLines = [];
  function log(msg) {
    logLines.push(new Date().toLocaleTimeString().slice(0,5) + ' ' + msg);
    if (logLines.length > 100) logLines.shift();
    updatePanel();
  }

  function updatePanel() {
    var countEl = document.getElementById('kmf-count');
    if (!countEl) return;
    countEl.textContent = realCount();
    var listEl = document.getElementById('kmf-list');
    if (listEl) {
      var ids = [];
      for (var k in CAPTURED) { if (CAPTURED.hasOwnProperty(k) && CAPTURED[k] && CAPTURED[k].result) ids.push(k); }
      listEl.innerHTML = ids.slice(-8).map(function(id) { return '<div title="' + id + '">' + id.slice(0,15) + '...</div>'; }).join('');
    }
    var logEl = document.getElementById('kmf-log');
    if (logEl) logEl.innerHTML = logLines.slice(-12).map(function(l) { return '<div>' + l + '</div>'; }).join('');
  }

  function downloadAll() {
    var items = {};
    for (var k in CAPTURED) { if (CAPTURED.hasOwnProperty(k) && CAPTURED[k] && CAPTURED[k].result) items[k] = CAPTURED[k]; }
    var keys = Object.keys(items);
    if (keys.length === 0) { alert('No data yet. Open a KMF practice list page first.'); return; }

    var blob = new Blob([JSON.stringify(items, null, 2)], {type:'application/json'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'kmf-data-' + new Date().toISOString().slice(0,10) + '.json';
    a.click();

    setTimeout(function() {
      for (var uid in items) {
        var b = new Blob([JSON.stringify(items[uid], null, 2)], {type:'application/json'});
        var a2 = document.createElement('a');
        a2.href = URL.createObjectURL(b);
        a2.download = 'kmf_' + uid + '.json';
        a2.click();
      }
    }, 600);
  }

  function clearAll() {
    CAPTURED = {};
    fetchQueue = [];
    fetching = false;
    chrome.storage.local.remove('kmfCapture');
    log('🗑 Cleared.');
    updatePanel();
  }

  function createPanel() {
    var panel = document.createElement('div');
    panel.id = 'kmf-capture-panel';
    panel.innerHTML =
      '<style>' +
        '#kmf-capture-panel { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", monospace; }' +
        '.kmf-dl { background:#059669; color:#fff; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font:11px monospace; }' +
        '.kmf-clr { background:#475569; color:#fff; border:none; padding:5px 8px; border-radius:6px; cursor:pointer; font:11px monospace; }' +
      '</style>' +
      '<div style="position:fixed;bottom:16px;right:16px;z-index:99999;background:#1e293b;color:#fff;border-radius:12px;padding:12px 14px;font:13px monospace;box-shadow:0 8px 32px rgba(0,0,0,.3);min-width:260px;max-width:360px;">' +
        '<div style="font-weight:bold;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">' +
          '<span>📡 KMF <span id="kmf-count" style="color:#34d399;font-size:16px;">0</span></span>' +
          '<div style="display:flex;gap:4px;">' +
            '<button id="kmf-dl" class="kmf-dl">⬇ Download</button>' +
            '<button id="kmf-clr" class="kmf-clr">🗑</button>' +
          '</div>' +
        '</div>' +
        '<div id="kmf-log" style="font-size:9px;max-height:130px;overflow-y:auto;color:#94a3b8;margin-bottom:2px;line-height:1.5;"></div>' +
        '<div id="kmf-list" style="font-size:9px;max-height:50px;overflow-y:auto;color:#64748b"></div>' +
        '<div style="margin-top:2px;font-size:8px;color:#475569;">' +
          'Open any KMF practice list page — data auto-captures.' +
        '</div>' +
      '</div>';
    document.body.appendChild(panel);
    document.getElementById('kmf-dl').onclick = downloadAll;
    document.getElementById('kmf-clr').onclick = clearAll;
  }
})();
