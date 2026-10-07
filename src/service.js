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
  // 1. Inject or update RTL styling
  let style = document.getElementById('antigravity-global-rtl');
  if (!style) {
    style = document.createElement('style');
    style.id = 'antigravity-global-rtl';
    document.head.appendChild(style);
  }
  style.textContent = \`
    /* Automatic RTL detection for Arabic texts, messages, and queued inputs */
    .whitespace-pre-wrap,
    [class*="message"],
    [class*="step"],
    [class*="queue"],
    [class*="steer"],
    [class*="bubble"],
    textarea,
    input,
    div[contenteditable="true"] {
      unicode-bidi: plaintext !important;
      text-align: start !important;
    }
  \`;

  // 2. Fix elements direction including Queued messages and all Arabic elements
  function fixElements(root = document) {
    if (!root) return;

    // Fix chat input editor box
    const editors = root.querySelectorAll ? root.querySelectorAll('div[contenteditable="true"], .cursor-text') : [];
    editors.forEach(el => {
      if (el.getAttribute('dir') !== 'auto') {
        el.setAttribute('dir', 'auto');
        el.style.textAlign = 'start';
        el.style.unicodeBidi = 'plaintext';
      }
    });

    // Fix all Arabic text nodes and their containers (Queued, user, assistant)
    try {
      const targetRoot = root.body || (root.nodeType === 1 ? root : document.body);
      if (!targetRoot) return;
      const walker = document.createTreeWalker(targetRoot, NodeFilter.SHOW_TEXT, null, false);
      const elementsToFix = new Set();
      let node;
      while (node = walker.nextNode()) {
        if (/[\\u0600-\\u06FF]/.test(node.nodeValue)) {
          if (node.parentElement) {
            elementsToFix.add(node.parentElement);
            const block = node.parentElement.closest('div, p, li, span');
            if (block) elementsToFix.add(block);
          }
        }
      }
      elementsToFix.forEach(el => {
        if (el.getAttribute('dir') !== 'auto') {
          el.setAttribute('dir', 'auto');
          el.style.unicodeBidi = 'plaintext';
          el.style.textAlign = 'start';
        }
      });
    } catch (e) {}
  }

  fixElements(document);

  // 3. Persistent MutationObserver for newly added messages, queued items, and tabs
  if (!window.__antigravity_rtl_observer) {
    window.__antigravity_rtl_observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          for (const node of m.addedNodes) {
            if (node.nodeType === 1) {
              fixElements(node);
            }
          }
        } else if (m.type === 'attributes' && m.attributeName === 'dir') {
          if (m.target && m.target.getAttribute('dir') === 'ltr' && 
              (m.target.getAttribute('contenteditable') === 'true' || m.target.classList.contains('cursor-text'))) {
            m.target.setAttribute('dir', 'auto');
          }
        }
      }
    });

    window.__antigravity_rtl_observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['dir']
    });
  }
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
