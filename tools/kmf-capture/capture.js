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
    // Check data attributes first (most common)
    for (const attr of ['data-u', 'data-id', 'data-paper-id', 'data-question-id', 'data-sheet-id', 'data-exam-id', 'data-practise-id']) {
      const v = el.getAttribute(attr);
      if (v && /^\d{10,}$/.test(v.trim())) return v.trim();
    }
    // Check href for u= param
    const href = el.getAttribute('href') || (el.closest('a') && el.closest('a').getAttribute('href'));
    if (href && href !== '#') {
      const m = href.match(/[?&]u=(\d{10,})/);
      if (m) return m[1];
      // Check for IDs in URL paths
      const pm = href.match(/\/(\d{15,20})(?:\?|$|\/|\.)/);
      if (pm) return pm[1];
    }
    // Walk up the DOM tree looking for ANY data attribute with a long numeric value
    let p = el;
    let depth = 0;
    while (p && p !== document.body && depth < 10) {
      if (p.attributes) {
        for (const attr of p.attributes) {
          if (attr.name.startsWith('data-') && /^\d{10,}$/.test(attr.value.trim())) {
            return attr.value.trim();
          }
        }
      }
      // Also check Vue component instance properties
      if (p.__vue__ || p.__vueParentComponent) {
        try {
          const vue = p.__vue__ || p.__vueParentComponent;
          if (vue && vue.props) {
            for (const [k, v] of Object.entries(vue.props)) {
              const sv = String(v);
              if (/^\d{10,}$/.test(sv)) return sv;
            }
          }
        } catch(e) {}
      }
      p = p.parentElement;
      depth++;
    }
    // Check onclick handlers
    const onclick = el.getAttribute('onclick') || '';
    const vm = onclick.match(/\d{10,}/);
    if (vm) return vm[0];
    return null;
  }

  // ── Scan page for practice buttons ──
  function scanButtons() {
    const buttons = [];
    const seen = new Set();

    // Strategy 1: Find ALL elements containing a long numeric ID (u param)
    // Search href attributes first (most reliable)
    const allWithHref = document.querySelectorAll('[href*="u="]');
    for (const el of allWithHref) {
      const href = el.getAttribute('href') || '';
      const m = href.match(/[?&]u=(\d{10,})/);
      if (m && !seen.has(m[1])) {
        seen.add(m[1]);
        buttons.push({ el, id: m[1], text: (el.textContent || '').trim().slice(0, 40) || href.slice(0, 40) });
      }
    }

    // Strategy 2: Search ALL elements for text "练习"/"practise"/"practice"/"开始"/"继续"
    const keywords = /(开始练习|继续练习|继续刷题|practise|practice|开始答题|进入练习|开始|继续)/i;
    const unmatchedButtons = []; // For debug: buttons found but no ID extracted

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
      acceptNode: node => {
        if (node.children.length > 0) return NodeFilter.FILTER_SKIP; // Only leaf nodes
        const text = (node.textContent || '').trim();
        if (text.length < 3 || text.length > 50) return NodeFilter.FILTER_REJECT;
        if (keywords.test(text)) return NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_REJECT;
      }
    });

    let node;
    while (node = walker.nextNode()) {
      // Navigate up to the nearest clickable ancestor (<a>, <button>, or element with click handler)
      let clickable = node;
      while (clickable && clickable.tagName !== 'A' && clickable.tagName !== 'BUTTON'
        && !clickable.getAttribute('onclick')
        && !clickable.getAttribute('href')) {
        clickable = clickable.parentElement;
        if (!clickable || clickable === document.body) break;
      }
      if (!clickable || clickable === document.body) clickable = node;

      const id = extractId(clickable);
      if (id && !seen.has(id)) {
        seen.add(id);
        buttons.push({ el: clickable, id, text: (node.textContent || '').trim().slice(0, 40) });
      } else if (!id) {
        // Log unmatched for debugging
        const parentAttrs = [];
        let p = clickable;
        for (let i = 0; i < 5 && p && p !== document.body; i++) {
          const tag = p.tagName.toLowerCase();
          const attrs = [];
          if (p.attributes) {
            for (const a of p.attributes) {
              if (a.name.startsWith('data-') || a.name === 'href' || a.name === 'id' || a.name === 'class') {
                attrs.push(`${a.name}="${String(a.value).slice(0, 40)}"`);
              }
            }
          }
          parentAttrs.push(`  ${tag}[${attrs.join(' ')}]`);
          p = p.parentElement;
        }
        unmatchedButtons.push({
          text: (node.textContent || '').trim().slice(0, 30),
          tag: clickable.tagName,
          tree: parentAttrs.join('\n')
        });
      }
    }

    // Debug: show unmatched buttons with their parent tree
    if (buttons.length === 0 && unmatchedButtons.length > 0) {
      log(`🔍 Found ${unmatchedButtons.length} button(s) but no ID extracted:`);
      unmatchedButtons.slice(0, 5).forEach(b => {
        log(`  <${b.tag}> "${b.text}"`);
        log(b.tree);
      });
      log('  Checking page URL for IDs...');
      log(`  URL: ${window.location.href.slice(0, 100)}`);
    }

    // Strategy 3: Search for any Vue/React data with long numeric IDs in the DOM
    const allEls = document.querySelectorAll('[data-u], [data-paper-id], [data-question-id], [data-sheet-id]');
    for (const el of allEls) {
      const id = extractId(el);
      if (id && !seen.has(id)) {
        seen.add(id);
        buttons.push({ el, id, text: (el.textContent || '').trim().slice(0, 40) || `(data attr: ${id})` });
      }
    }

    // Strategy 4: Scan ALL <a> tags with any numeric parameter
    if (buttons.length === 0) {
      const allLinks = document.querySelectorAll('a');
      for (const a of allLinks) {
        const href = a.getAttribute('href') || '';
        const m = href.match(/(\d{15,20})/); // 15-20 digit IDs
        if (m && !seen.has(m[1])) {
          seen.add(m[1]);
          buttons.push({ el: a, id: m[1], text: (a.textContent || '').trim().slice(0, 40) || `(ID: ${m[1].slice(0,10)}...)` });
        }
      }
    }

    // Debug: log what we found
    if (buttons.length === 0) {
      log('🔍 Debug: Scanning page structure...');
      // Log all unique link patterns
      const hrefPatterns = new Set();
      document.querySelectorAll('a').forEach(a => {
        const h = a.getAttribute('href') || '';
        if (h && h.length > 5) hrefPatterns.add(h.slice(0, 80));
      });
      log(`  Found ${hrefPatterns.size} unique links on page`);
      const samples = [...hrefPatterns].slice(0, 10);
      samples.forEach(h => log(`  href: ${h}`));

      // Log all elements with text containing key words
      const textMatches = [];
      document.querySelectorAll('*').forEach(el => {
        if (el.children.length === 0) {
          const t = (el.textContent || '').trim();
          if (t.length >= 3 && t.length <= 100 && /(练习|practise|practice|开始|继续|start|begin|enter|go)/i.test(t)) {
            textMatches.push(`<${el.tagName.toLowerCase()}> "${t.slice(0,50)}"`);
          }
        }
      });
      if (textMatches.length > 0) {
        log(`  Text matches (${textMatches.length}):`);
        textMatches.slice(0, 15).forEach(t => log(`  ${t}`));
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

    // Wait 1s for dynamic content to render, then scan
    log('⏳ Waiting for page to fully render...');
    setTimeout(() => {
      const buttons = scanButtons();
      if (buttons.length === 0) {
        log('⚠ No practice buttons found. Check debug info above.');
        log('💡 Try: navigate to a KMF page with a list of tests (e.g. C18 listening), then click Auto Scan.');
        updatePanel();
        return;
      }

      autoQueue = buttons;
      autoIndex = 0;
      autoTotal = buttons.length;
      autoRunning = true;
      log(`✅ Found ${autoTotal} practice items. Starting auto-capture...`);
      log(`   Each click triggers API call → captured automatically.`);
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
