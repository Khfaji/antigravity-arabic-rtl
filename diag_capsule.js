const fs = require('fs');
const path = require('path');
const appData = process.env.APPDATA;
const devToolsPortFile = path.join(appData, 'Antigravity', 'DevToolsActivePort');
const port = fs.readFileSync(devToolsPortFile, 'utf8').split('\n')[0].trim();

fetch('http://127.0.0.1:' + port + '/json')
  .then(r => r.json())
  .then(pages => {
    const page = pages.find(p => p.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `(() => {
            const capsule = document.getElementById("antigravity-update-capsule");
            const modal = document.getElementById("antigravity-update-modal");
            const suiteModal = document.getElementById("antigravity-suite-info-modal");
            return {
              capsuleExists: !!capsule,
              capsuleMode: capsule?.getAttribute("data-mode"),
              capsuleText: capsule?.innerText?.trim(),
              modalExists: !!modal,
              modalDisplay: modal?.style?.display,
              suiteModalExists: !!suiteModal,
              windowUpdate: window.__antigravity_available_update
            };
          })()`,
          returnByValue: true
        }
      }));
    };
    ws.onmessage = (msg) => {
      console.log('Capsule check:', JSON.stringify(JSON.parse(msg.data)?.result?.result?.value, null, 2));
      ws.close();
    };
  });
