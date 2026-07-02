(function(){
  'use strict';

  var CAPTURED = {};
  var DETAIL_URL = 'practise-detail';
  var RECORDS_URL = 'web-index/records';  // Also capture this API!

  // ── Init: restore data + check state ──
  function init() {
    chrome.storage.local.get(['kmfCapture', 'kmfState'], function(res) {
      if (res.kmfCapture) CAPTURED = res.kmfCapture;
      var state = res.kmfState || {};
      createPanel();
      updatePanel();

      // Auto-dismiss popups (继续练习/重新练习)
      watchForPopup();

      var isPractice = location.href.indexOf('ielts-practices') !== -1;
      var isList = !isPractice;

      if (state.phase === 'scanning') {
        if (isPractice) {
          // Arrived on practice page — wait for API
          handlePracticePage(state);
        } else {
          // Back on list page — click next
          handleListPage(state);
        }
      } else {
        var count = realCount();
        log('📡 Ready. ' + count + ' items stored.');
        if (isList) {
          var btns = countButtons();
          if (btns.length > 0) {
            log('💡 Found ' + btns.length + ' practice items. Click 🚀 to auto-scan.');
          }
        }
      }
    });
  }

  // ── Intercept fetch ──
  var origFetch = window.fetch;
  window.fetch = async function() {
    var args = arguments;
    var res = await origFetch.apply(this, args);
    var url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url);
    if (url && (url.indexOf(DETAIL_URL) !== -1 || url.indexOf(RECORDS_URL) !== -1)) {
      var clone = res.clone();
      clone.json().then(function(data) {
        if (data && (data.result || data.data)) {
          if (url.indexOf(RECORDS_URL) !== -1) {
            // web-index/records — extract exam_unique IDs and fetch practise-detail for each
            var records = data.result || data.data || [];
            if (Array.isArray(records) && records.length > 0) {
              var uids = records.map(function(r) { return r.exam_unique; }).filter(Boolean);
              log('📋 Found ' + uids.length + ' practice IDs. Fetching all...');
              save();
              updatePanel();
              // Fetch practise-detail for all IDs (with delay to avoid rate limit)
              fetchAllDetails(uids, 0);
            }
          } else {
            var u2 = new URL(url);
            var uid = u2.searchParams.get('u');
            if (uid) {
              CAPTURED[uid] = data;
              save();
              updatePanel();
              log('✅ u=' + uid.slice(0,12) + '... (' + realCount() + ' total)');
            }
          }
        }
      }).catch(function(){});
    }
    return res;
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
      if (self._kmf_url && (self._kmf_url.indexOf(DETAIL_URL) !== -1 || self._kmf_url.indexOf(RECORDS_URL) !== -1)) {
        try {
          var data = JSON.parse(self.responseText);
          if (data && (data.result || data.data)) {
            if (self._kmf_url.indexOf(RECORDS_URL) !== -1) {
              var records = data.result || data.data || [];
              if (Array.isArray(records) && records.length > 0) {
                var uids = records.map(function(r) { return r.exam_unique; }).filter(Boolean);
                log('📋 Found ' + uids.length + ' IDs via XHR. Fetching...');
                save();
                updatePanel();
                fetchAllDetails(uids, 0);
              }
            } else {
              var u2 = new URL(self._kmf_url);
              var uid = u2.searchParams.get('u');
              if (uid) CAPTURED[uid] = data;
            }
            save();
            updatePanel();
          }
        } catch(e) {}
      }
    });
    return origSend.apply(this, arguments);
  };

  // ── Popup auto-dismiss ──
  function watchForPopup() {
    var observer = new MutationObserver(function() {
      // Try common modal selectors
      var containers = document.querySelectorAll('[class*="modal"], [class*="dialog"], [class*="popup"], [class*="drawer"], [role="dialog"]');
      for (var i = 0; i < containers.length; i++) {
        var btns = containers[i].querySelectorAll('button, a, span[class*="btn"]');
        for (var j = 0; j < btns.length; j++) {
          var t = (btns[j].textContent || '').trim();
          if (t === '继续练习') {
            btns[j].click();
            log('🤖 Dismissed popup: ' + t);
            return;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ── Batch fetch all practise-detail APIs ──
  function fetchAllDetails(uids, startIdx) {
    if (startIdx >= uids.length) {
      log('🎉 All ' + uids.length + ' items captured!');
      updatePanel();
      return;
    }

    var uid = uids[startIdx];
    if (CAPTURED[uid] && CAPTURED[uid].result) {
      // Already have it
      log('[' + (startIdx+1) + '/' + uids.length + '] Already have u=' + uid.slice(0,12) + '...');
      setTimeout(function() { fetchAllDetails(uids, startIdx + 1); }, 100);
      return;
    }

    log('[' + (startIdx+1) + '/' + uids.length + '] Fetching u=' + uid.slice(0,12) + '...');
    var apiUrl = 'https://api.kmf.com/ielts-app/front/practise-detail?u=' + uid;
    fetch(apiUrl, { credentials: 'include' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && data.result) {
          CAPTURED[uid] = data;
          save();
          log('  ✅ Saved (' + realCount() + ' total)');
        } else {
          log('  ⚠ No data');
        }
        updatePanel();
        setTimeout(function() { fetchAllDetails(uids, startIdx + 1); }, 500);
      })
      .catch(function(e) {
        log('  ❌ ' + e.message);
        setTimeout(function() { fetchAllDetails(uids, startIdx + 1); }, 500);
      });
  }
  function handlePracticePage(state) {
    log('📍 Practice page [' + (state.idx + 1) + '/' + state.total + ']');
    log('   Waiting for API capture...');
    updatePanel();

    var prevCount = realCount();
    var waited = 0;
    var maxWait = 25; // ~12 seconds max

    function check() {
      waited++;
      chrome.storage.local.get('kmfCapture', function(r) {
        var newData = r.kmfCapture || {};
        var newCount = 0;
        for (var k in newData) { if (newData.hasOwnProperty(k) && newData[k].result) newCount++; }

        if (newCount > prevCount || waited >= maxWait) {
          if (newCount > prevCount) {
            CAPTURED = newData;
            log('   ✅ Captured!');
          } else {
            log('   ⚠ Timeout — proceeding anyway');
          }

          var nextIdx = state.idx + 1;
          if (nextIdx >= state.total) {
            // ALL DONE!
            chrome.storage.local.remove('kmfState');
            log('🎉 ALL DONE! ' + newCount + ' items total.');
            updatePanel();
            // Navigate back to list
            setTimeout(function() { history.go(-(state.total - state.idx + 1)); }, 300);
          } else {
            chrome.storage.local.set({ kmfState: { phase: 'scanning', idx: nextIdx, total: state.total, listUrl: state.listUrl } });
            setTimeout(function() { history.back(); }, 300);
          }
        } else {
          setTimeout(check, 600);
        }
      });
    }

    setTimeout(check, 1500); // Wait for redirect + API to fire
  }

  function handleListPage(state) {
    log('📍 List page — clicking item [' + (state.idx + 1) + '/' + state.total + ']');
    updatePanel();

    // Find the nth button
    var allLinks = document.querySelectorAll('a');
    var count = 0;
    var found = false;

    for (var i = 0; i < allLinks.length; i++) {
      var text = (allLinks[i].textContent || '').trim();
      if (text === '继续练习' || text === '开始练习' || text === '继续刷题') {
        if (count === state.idx) {
          var label = text;
          var item = allLinks[i].closest('.part-item');
          if (item) {
            var nameEl = item.querySelector('.seq_name, a[target]');
            if (nameEl) label = (nameEl.textContent || '').trim();
          }
          log('   Clicking: ' + label);
          // Save state BEFORE clicking (page will navigate away)
          chrome.storage.local.set({ kmfState: { phase: 'scanning', idx: state.idx, total: state.total, listUrl: state.listUrl } });
          setTimeout(function() { allLinks[i].click(); }, 200);
          found = true;
          break;
        }
        count++;
      }
    }

    if (!found) {
      log('   ⚠ Button not found at index ' + state.idx + ' — retrying...');
      setTimeout(function() { handleListPage(state); }, 1000);
    }
  }

  // ── Start scan ──
  function startScan() {
    var btns = countButtons();
    if (btns === 0) {
      log('⚠ No practice buttons found on this page.');
      return;
    }

    log('🚀 Auto-scanning ' + btns + ' items...');
    log('   Page will navigate automatically. Please wait.');

    handleListPage({ phase: 'scanning', idx: 0, total: btns, listUrl: location.href });
  }

  function countButtons() {
    var count = 0;
    var allLinks = document.querySelectorAll('a');
    for (var i = 0; i < allLinks.length; i++) {
      var text = (allLinks[i].textContent || '').trim();
      if (text === '继续练习' || text === '开始练习' || text === '继续刷题') count++;
    }
    return count;
  }

  function realCount() {
    var c = 0;
    for (var k in CAPTURED) { if (CAPTURED.hasOwnProperty(k) && CAPTURED[k] && CAPTURED[k].result) c++; }
    return c;
  }

  function save() { chrome.storage.local.set({ kmfCapture: CAPTURED }); }

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
      listEl.innerHTML = ids.slice(-10).map(function(id) { return '<div>u=' + id + '</div>'; }).join('');
    }

    var logEl = document.getElementById('kmf-log');
    if (logEl) logEl.innerHTML = logLines.slice(-10).map(function(l) { return '<div>' + l + '</div>'; }).join('');
  }

  function downloadAll() {
    var items = {};
    for (var k in CAPTURED) { if (CAPTURED.hasOwnProperty(k) && CAPTURED[k] && CAPTURED[k].result) items[k] = CAPTURED[k]; }
    var keys = Object.keys(items);
    if (keys.length === 0) { alert('No data yet.'); return; }

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

  function debugIds() {
    // Search for IDs in page
    log('🔍 Searching for IDs...');

    // 1. Check all elements for data attributes with numeric values
    var found = [];
    document.querySelectorAll('*').forEach(function(el) {
      if (el.attributes) {
        for (var i = 0; i < el.attributes.length; i++) {
          var val = el.attributes[i].value;
          if (val && /^\d{2,8}$/.test(val.trim())) {
            found.push(el.attributes[i].name + '=' + val + ' on <' + el.tagName.toLowerCase() + '>');
          }
        }
      }
      // Check Vue data
      if (el.__vue__) {
        try {
          var vue = el.__vue__;
          for (var k in vue) {
            if (vue.hasOwnProperty(k)) {
              var sv = String(vue[k]);
              if (sv.length >= 2 && sv.length <= 8 && /^\d+$/.test(sv) && parseInt(sv) > 100) {
                found.push('Vue.' + k + '=' + sv + ' on <' + el.tagName.toLowerCase() + '>');
              }
            }
          }
        } catch(e) {}
      }
    });

    if (found.length === 0) {
      log('  No numeric data attributes found.');
    } else {
      log('  Found ' + found.length + ' numeric data attrs (showing unique):');
      var seen = {};
      for (var j = 0; j < found.length; j++) {
        if (!seen[found[j]]) {
          seen[found[j]] = true;
          log('  ' + found[j]);
        }
      }
    }

    // 2. Also search for all <script> tags with embedded data
    var scripts = document.querySelectorAll('script');
    log('  Scripts on page: ' + scripts.length);
    scripts.forEach(function(s, idx) {
      var text = (s.textContent || s.innerText || '').slice(0, 200);
      if (text.indexOf('sheet_id') !== -1 || text.indexOf('record') !== -1 || text.indexOf('ids') !== -1) {
        log('  Script[' + idx + ']: contains sheet_id/record/ids — ' + text.slice(0, 100));
      }
    });

    updatePanel();
  }
    CAPTURED = {};
    chrome.storage.local.remove('kmfCapture');
    chrome.storage.local.remove('kmfState');
    log('🗑 Cleared.');
    updatePanel();
  }

  function createPanel() {
    var panel = document.createElement('div');
    panel.id = 'kmf-capture-panel';
    panel.innerHTML =
      '<style>' +
        '#kmf-capture-panel { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", monospace; }' +
        '.kmf-scan { background:#4f46e5; color:#fff; border:none; padding:5px 14px; border-radius:6px; cursor:pointer; font:12px monospace; font-weight:bold; }' +
        '.kmf-dl { background:#059669; color:#fff; border:none; padding:5px 10px; border-radius:6px; cursor:pointer; font:11px monospace; }' +
        '.kmf-clr { background:#475569; color:#fff; border:none; padding:5px 8px; border-radius:6px; cursor:pointer; font:11px monospace; }' +
      '</style>' +
      '<div style="position:fixed;bottom:16px;right:16px;z-index:99999;background:#1e293b;color:#fff;border-radius:12px;padding:12px 14px;font:13px monospace;box-shadow:0 8px 32px rgba(0,0,0,.3);min-width:280px;max-width:380px;">' +
        '<div style="font-weight:bold;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">' +
          '<span>📡 KMF <span id="kmf-count" style="color:#34d399;font-size:16px;">0</span></span>' +
          '<div style="display:flex;gap:4px;">' +
            '<button id="kmf-scan" class="kmf-scan">🚀 Start</button>' +
            '<button id="kmf-dl" class="kmf-dl">⬇</button>' +
            '<button id="kmf-dbg" class="kmf-clr" style="font-size:9px;">🔍</button>' +
            '<button id="kmf-clr" class="kmf-clr">🗑</button>' +
          '</div>' +
        '</div>' +
        '<div id="kmf-log" style="font-size:9px;max-height:130px;overflow-y:auto;color:#94a3b8;margin-bottom:2px;line-height:1.5;"></div>' +
        '<div id="kmf-list" style="font-size:9px;max-height:50px;overflow-y:auto;color:#64748b"></div>' +
        '<div style="margin-top:2px;font-size:8px;color:#475569;">' +
          'Click 🚀 on list page. Extension auto-navigates all items. Come back to download.' +
        '</div>' +
      '</div>';
    document.body.appendChild(panel);

    document.getElementById('kmf-scan').onclick = startScan;
    document.getElementById('kmf-dl').onclick = downloadAll;
    document.getElementById('kmf-dbg').onclick = debugIds;
    document.getElementById('kmf-clr').onclick = clearAll;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
