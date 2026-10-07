/**
 * Antigravity Arabic & RTL Auto-Fix & Persistent Watcher Service
 * Zero external dependencies - Works out of the box with Node.js 18+
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { INJECT_CODE } = require('./inject.js');

const appData = process.env.APPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Roaming');
const localAppData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Local');

const devToolsPortFiles = [
  path.join(appData, 'Antigravity', 'DevToolsActivePort'),
  path.join(appData, 'Antigravity IDE', 'DevToolsActivePort')
];

const asarPath = path.join(localAppData, 'Programs', 'Antigravity', 'resources', 'app.asar');
const resourcesDir = path.dirname(asarPath);

// 1. Live Window CDP Injection
async function checkAndInjectLive() {
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
      // Retry next cycle
    }
  }
}

// 2. Auto-Patch app.asar if replaced by a Google Update
function checkAndAutoPatchAsar() {
  if (!fs.existsSync(asarPath)) return;
  try {
    const asarBuffer = fs.readFileSync(asarPath);
    // Check if the current asar contains our signature
    if (asarBuffer.includes(Buffer.from('antigravity-global-rtl'))) {
      return; // Already patched
    }

    console.log('[Auto-Patch] Detected unpatched app.asar (likely after an update). Patching now...');

    const extractDir = path.join(resourcesDir, 'app_extract_temp_' + Date.now());
    if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });

    // Use global asar CLI or npm's asar
    execSync(`asar extract "${asarPath}" "${extractDir}"`);

    const preloadPath = path.join(extractDir, 'dist', 'preload.js');
    if (fs.existsSync(preloadPath)) {
      const patch = `
// ==================== ANTIGRAVITY ARABIC & RTL ====================
try {
  process.once('loaded', function() {
    ${INJECT_CODE}
  });
} catch(e) {}
// ==================================================================
`;
      fs.appendFileSync(preloadPath, patch, 'utf8');
      const tempAsar = path.join(resourcesDir, 'app.asar.patched_temp');
      execSync(`asar pack "${extractDir}" "${tempAsar}"`);
      fs.copyFileSync(tempAsar, asarPath);
      try { fs.unlinkSync(tempAsar); } catch (e) {}
      console.log('[Auto-Patch] app.asar re-patched successfully after update!');
    }

    try { fs.rmSync(extractDir, { recursive: true, force: true }); } catch (e) {}
  } catch (err) {
    // If file is locked while running, it will retry silently on next tick
  }
}

// Run loops
setInterval(checkAndInjectLive, 3000);
checkAndInjectLive();

setInterval(checkAndAutoPatchAsar, 10000);
checkAndAutoPatchAsar();
