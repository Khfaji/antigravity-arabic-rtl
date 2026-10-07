/**
 * Antigravity Arabic & RTL Auto-Fix Service
 * Zero external dependencies - Works out of the box with Node.js 18+
 */

const fs = require('fs');
const path = require('path');

const appData = process.env.APPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Roaming');
const devToolsPortFiles = [
  path.join(appData, 'Antigravity', 'DevToolsActivePort'),
  path.join(appData, 'Antigravity IDE', 'DevToolsActivePort')
];

const INJECT_CODE = `
(function() {
  // 1. Inject or update smart RTL styling
  let style = document.getElementById('antigravity-global-rtl');
  if (!style) {
    style = document.createElement('style');
    style.id = 'antigravity-global-rtl';
    document.head.appendChild(style);
  }
  style.textContent = \`
    /* Smart Bidirectional layout */
    [dir="rtl"] {
      direction: rtl !important;
      text-align: right !important;
    }
    [dir="ltr"] {
      direction: ltr !important;
      text-align: left !important;
    }
    .whitespace-pre-wrap,
    p, div[contenteditable="true"] {
      unicode-bidi: plaintext !important;
    }
  \`;

  // 2. Global smart input handler: automatically detects language as you type
  if (!window.__smart_bidi_input_handler) {
    window.__smart_bidi_input_handler = function(e) {
      const target = e.target;
      if (!target) return;
      if (target.isContentEditable || target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
        const text = target.innerText || target.value || target.textContent || '';
        if (/[\\u0600-\\u06FF]/.test(text)) {
          target.setAttribute('dir', 'rtl');
          target.style.direction = 'rtl';
          target.style.textAlign = 'right';
        } else if (text.trim().length > 0) {
          target.setAttribute('dir', 'ltr');
          target.style.direction = 'ltr';
          target.style.textAlign = 'left';
        } else {
          target.removeAttribute('dir');
          target.style.direction = '';
          target.style.textAlign = '';
        }
      }
    };
    document.addEventListener('input', window.__smart_bidi_input_handler, true);
    document.addEventListener('keyup', window.__smart_bidi_input_handler, true);
  }

  // 3. Scan & align all Arabic elements (messages, queued items, etc.)
  function scanAndAlign(root) {
    if (!root) return;
    try {
      const targetRoot = root.body || (root.nodeType === 1 ? root : document.body);
      if (!targetRoot) return;
      const walker = document.createTreeWalker(targetRoot, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while (node = walker.nextNode()) {
        if (/[\\u0600-\\u06FF]/.test(node.nodeValue)) {
          let el = node.parentElement;
          if (el) {
            const block = el.closest('div, p, span, li, [class*="step"], [class*="bubble"]');
            if (block && !block.closest('pre, code')) {
              block.setAttribute('dir', 'rtl');
              block.style.direction = 'rtl';
              block.style.textAlign = 'right';
              block.style.unicodeBidi = 'plaintext';
            }
          }
        }
      }
    } catch (e) {}
  }

  scanAndAlign(document);

  // 4. Attach persistent observer for new messages and queued items
  if (window.__antigravity_rtl_observer) {
    window.__antigravity_rtl_observer.disconnect();
  }
  window.__antigravity_rtl_observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) {
          scanAndAlign(node);
        }
      }
    }
  });
  window.__antigravity_rtl_observer.observe(document.body, { childList: true, subtree: true });
})();
`;

async function checkAndInject() {
  for (const portFile of devToolsPortFiles) {
    if (!fs.existsSync(portFile)) continue;
    try {
      const content = fs.readFileSync(portFile, 'utf8');
      const port = content.split('\n')[0].trim();
      if (!port || isNaN(Number(port))) continue;

      const res = await fetch(`http://127.0.0.1:${port}/json`).catch(() => null);
      if (!res) continue;
      const pages = await res.json().catch(() => []);
      if (!Array.isArray(pages)) continue;

      for (const page of pages) {
        if (page.type !== 'page' || !page.webSocketDebuggerUrl) continue;
        
        const ws = new WebSocket(page.webSocketDebuggerUrl);
        ws.onopen = () => {
          ws.send(JSON.stringify({
            id: 1,
            method: 'Runtime.evaluate',
            params: { expression: INJECT_CODE, returnByValue: true }
          }));
        };
        ws.onmessage = () => {
          ws.close();
        };
        ws.onerror = () => {};
      }
    } catch (err) {
      // Retry on next cycle
    }
  }
}

// Run loop every 3 seconds
setInterval(checkAndInject, 3000);
checkAndInject();
