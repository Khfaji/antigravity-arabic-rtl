/**
 * Antigravity Arabic & RTL Auto-Fix Service
 * Zero external dependencies - Works out of the box with Node.js 18+
 */

const fs = require('fs');
const path = require('path');
const { INJECT_CODE } = require('./inject.js');

const appData = process.env.APPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Roaming');
const devToolsPortFiles = [
  path.join(appData, 'Antigravity', 'DevToolsActivePort'),
  path.join(appData, 'Antigravity IDE', 'DevToolsActivePort')
];

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

        try {
          const ws = new WebSocket(page.webSocketDebuggerUrl);
          ws.onopen = () => {
            ws.send(JSON.stringify({
              id: 1,
              method: 'Runtime.evaluate',
              params: { expression: INJECT_CODE, returnByValue: true }
            }));
          };
          ws.onmessage = () => {
            try { ws.close(); } catch (e) {}
          };
          ws.onerror = () => {};
        } catch (e) {}
      }
    } catch (err) {
      // Retry on next cycle
    }
  }
}

// Run loop every 3 seconds
setInterval(checkAndInject, 3000);
checkAndInject();
