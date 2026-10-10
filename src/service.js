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

const injectedPageIds = new Set();

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

      // Clean up dead pages from our set
      const currentPageIds = new Set(pages.map(p => p.id));
      for (const id of injectedPageIds) {
        if (!currentPageIds.has(id)) {
          injectedPageIds.delete(id);
        }
      }

      for (const page of pages) {
        if (page.type !== 'page' || !page.webSocketDebuggerUrl) continue;

        try {
          const ws = new WebSocket(page.webSocketDebuggerUrl);
          ws.onopen = () => {
            try {
              // Check if our widget/capsule is currently alive in DOM
              ws.send(JSON.stringify({
                id: 1,
                method: 'Runtime.evaluate',
                params: {
                  expression: `!!(document.querySelector('#antigravity-model-quota-widget') || document.querySelector('#antigravity-update-capsule'))`,
                  returnByValue: true
                }
              }));
            } catch (e) {}
          };
          ws.onmessage = (msg) => {
            try {
              const data = JSON.parse(msg.data || msg);
              if (data.id === 1) {
                const isAlive = data.result && data.result.result && data.result.result.value;
                if (!isAlive) {
                  // Not alive or freshly opened/refreshed, inject!
                  ws.send(JSON.stringify({
                    id: 2,
                    method: 'Runtime.evaluate',
                    params: { expression: injectCode, returnByValue: true }
                  }));
                  injectedPageIds.add(page.id);
                } else {
                  injectedPageIds.add(page.id);
                  ws.close();
                }
              } else if (data.id === 2) {
                ws.close();
              }
            } catch (e) {
              try { ws.close(); } catch (err) {}
            }
          };
          ws.onerror = () => {
            try { ws.close(); } catch (e) {}
          };
        } catch (e) {}
      }
    } catch (err) {}
  }
}

// Check remote update and keep local files up to date every 30 minutes
async function syncRemoteFiles() {
  try {
    const vRes = await fetch('https://raw.githubusercontent.com/Khfaji/antigravity-arabic-suite/main/version.json?t=' + Date.now()).catch(() => null);
    if (!vRes || !vRes.ok) return;
    const vData = await vRes.json().catch(() => null);
    if (!vData || !vData.version) return;

    const localVersionPath = fs.existsSync(path.join(__dirname, 'version.json'))
      ? path.join(__dirname, 'version.json')
      : path.join(__dirname, '..', 'version.json');
    let localVersion = '1.0.0';
    if (fs.existsSync(localVersionPath)) {
      try {
        localVersion = JSON.parse(fs.readFileSync(localVersionPath, 'utf8')).version || localVersion;
      } catch (e) {}
    }

    if (vData.version !== localVersion) {
      const codeRes = await fetch('https://raw.githubusercontent.com/Khfaji/antigravity-arabic-suite/main/src/inject.js?t=' + Date.now()).catch(() => null);
      if (codeRes && codeRes.ok) {
        const newCode = await codeRes.text();
        fs.writeFileSync(path.join(__dirname, 'inject.js'), newCode, 'utf8');
        fs.writeFileSync(localVersionPath, JSON.stringify(vData, null, 2), 'utf8');
        // Force reinjection to all connected pages
        injectedPageIds.clear();
        checkAndInjectLive();
      }
    }
  } catch (e) {}
}

// If invoked with --inject-only, run once and exit
if (process.argv.includes('--inject-only')) {
  checkAndInjectLive().then(() => {
    setTimeout(() => process.exit(0), 1200);
  }).catch(() => process.exit(0));
} else {
  try {
    fs.writeFileSync(path.join(__dirname, 'service.log'), `[${new Date().toISOString()}] Service started and hardened successfully.\n`);
  } catch (e) {}

  // Continuous check every 2 seconds
  setInterval(checkAndInjectLive, 2000);
  checkAndInjectLive();

  // Sync remote files every 30 minutes
  setInterval(syncRemoteFiles, 30 * 60 * 1000);
  setTimeout(syncRemoteFiles, 5000);
}
