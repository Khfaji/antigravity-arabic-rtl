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
  // 1. Update CSS: remove unicode-bidi from contenteditable to kill the space-jump bug!
  let style = document.getElementById('antigravity-global-rtl');
  if (!style) {
    style = document.createElement('style');
    style.id = 'antigravity-global-rtl';
    document.head.appendChild(style);
  }
  style.textContent = \`
    /* Editor styling - NO unicode-bidi: plaintext to prevent space cursor jump */
    div[contenteditable="true"][dir="rtl"],
    textarea[dir="rtl"],
    input[dir="rtl"] {
      direction: rtl !important;
      text-align: right !important;
      unicode-bidi: normal !important;
    }
    div[contenteditable="true"][dir="ltr"],
    textarea[dir="ltr"],
    input[dir="ltr"] {
      direction: ltr !important;
      text-align: left !important;
      unicode-bidi: normal !important;
    }

    /* Messages and general RTL elements */
    [dir="rtl"]:not(div[contenteditable="true"]) {
      direction: rtl !important;
      text-align: right !important;
    }
    .whitespace-pre-wrap[dir="rtl"] {
      direction: rtl !important;
      text-align: right !important;
    }

    /* User message / queued message flex container alignment */
    .user-msg-rtl {
      direction: rtl !important;
      justify-content: flex-start !important;
    }
    .user-msg-rtl > div {
      text-align: right !important;
    }
  \`;

  // 2. Fix the live editor input handler without space jump
  window.__smart_bidi_input_handler = function(e) {
    const target = e.target;
    if (!target) return;
    if (target.isContentEditable || target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
      const text = target.innerText || target.value || target.textContent || '';
      if (/[\\u0600-\\u06FF]/.test(text)) {
        target.setAttribute('dir', 'rtl');
        target.style.setProperty('direction', 'rtl', 'important');
        target.style.setProperty('text-align', 'right', 'important');
        target.style.setProperty('unicode-bidi', 'normal', 'important');
      } else if (text.trim().length > 0) {
        target.setAttribute('dir', 'ltr');
        target.style.setProperty('direction', 'ltr', 'important');
        target.style.setProperty('text-align', 'left', 'important');
        target.style.setProperty('unicode-bidi', 'normal', 'important');
      } else {
        target.removeAttribute('dir');
        target.style.direction = '';
        target.style.textAlign = '';
        target.style.unicodeBidi = '';
      }
    }
  };
  document.removeEventListener('input', window.__smart_bidi_input_handler, true);
  document.removeEventListener('keyup', window.__smart_bidi_input_handler, true);
  document.addEventListener('input', window.__smart_bidi_input_handler, true);
  document.addEventListener('keyup', window.__smart_bidi_input_handler, true);

  // 3. Scan & align all Arabic messages AND their parent flex containers
  function fixAllArabic(root = document) {
    try {
      const targetRoot = root.body || (root.nodeType === 1 ? root : document.body);
      if (!targetRoot) return;
      const walker = document.createTreeWalker(targetRoot, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while (node = walker.nextNode()) {
        if (/[\\u0600-\\u06FF]/.test(node.nodeValue)) {
          const el = node.parentElement;
          if (el && !el.closest('pre, code')) {
            el.setAttribute('dir', 'rtl');
            el.style.direction = 'rtl';
            el.style.textAlign = 'right';

            const userRow = el.closest('.whitespace-pre-wrap, [class*="user-input-step"], [class*="bg-card"], [class*="flex-row"]');
            if (userRow) {
              userRow.setAttribute('dir', 'rtl');
              userRow.style.direction = 'rtl';
              userRow.classList.add('user-msg-rtl');
            }
          }
        }
      }
    } catch (e) {}
  }

  fixAllArabic(document);

  // 4. Update persistent observer
  if (window.__antigravity_rtl_observer) {
    window.__antigravity_rtl_observer.disconnect();
  }
  window.__antigravity_rtl_observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) fixAllArabic(node);
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
