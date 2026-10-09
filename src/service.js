/**
 * Antigravity Arabic & RTL Auto-Fix & Persistent Watcher Service
 * Hardened with full crash-guards, auto-reconnect, and error isolation
 */

const fs = require('fs');
const path = require('path');

// Ensure uncaught exceptions never terminate the background process
process.on('uncaughtException', (err) => {
  try {
    fs.appendFileSync(path.join(__dirname, 'service.log'), `[${new Date().toISOString()}] UncaughtException: ${err.message}\n`);
  } catch (e) {}
});

process.on('unhandledRejection', (reason) => {
  try {
    fs.appendFileSync(path.join(__dirname, 'service.log'), `[${new Date().toISOString()}] UnhandledRejection: ${reason}\n`);
  } catch (e) {}
});

const appData = process.env.APPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Roaming');

const devToolsPortFiles = [
  path.join(appData, 'Antigravity', 'DevToolsActivePort'),
  path.join(appData, 'Antigravity IDE', 'DevToolsActivePort')
];

function getInjectCode() {
  try {
    delete require.cache[require.resolve('./inject.js')];
    const { INJECT_CODE } = require('./inject.js');
    return INJECT_CODE;
  } catch (e) {
    return null;
  }
}

async function checkAndInjectLive() {
  const injectCode = getInjectCode();
  if (!injectCode) return;

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
            try {
              ws.send(JSON.stringify({
                id: 1,
                method: 'Runtime.evaluate',
                params: { expression: injectCode, returnByValue: true }
              }));
            } catch (e) {}
          };
          ws.onmessage = () => {
            try { ws.close(); } catch (e) {}
          };
          ws.onerror = () => {
            try { ws.close(); } catch (e) {}
          };
        } catch (e) {}
      }
    } catch (err) {}
  }
}

try {
  fs.writeFileSync(path.join(__dirname, 'service.log'), `[${new Date().toISOString()}] Service started and hardened successfully.\n`);
} catch (e) {}

// Continuous check every 2 seconds
setInterval(checkAndInjectLive, 2000);
checkAndInjectLive();
