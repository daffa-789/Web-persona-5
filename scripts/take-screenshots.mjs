import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_PROFILE = process.env.TEMP + '\\chrome-p5r-test-' + Date.now();

const PORT = 9444;

async function run() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--remote-allow-origins=*',
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,900',
    `--user-data-dir=${TEMP_PROFILE}`,
    'http://localhost:5173/'
  ], { stdio: 'ignore' });

  let targets = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      targets = await new Promise((resolve) => {
        const req = http.get(`http://127.0.0.1:${PORT}/json/list`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve(null);
            }
          });
        });
        req.on('error', () => resolve(null));
      });
      if (targets && targets.length > 0 && targets.some(t => t.type === 'page' && t.url.includes('5173'))) break;
    } catch {}
  }

  const page = targets.find(t => t.type === 'page' && t.url.includes('5173')) || targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res) => ws.onopen = res);

  let msgId = 1;
  const pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result?.result?.value;
  }

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  async function capture(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filename, Buffer.from(res.result.data, 'base64'));
    console.log(`[Capture] Saved: ${filename}`);
  }

  console.log('[Capture] Waiting for entrance overlay completion...');
  for (let i = 0; i < 40; i++) {
    const isDone = await evaluate(`document.getElementById('p5r-entrance-overlay')?.classList.contains('done')`);
    if (isDone) break;
    await new Promise(r => setTimeout(r, 200));
  }
  // Allow systems to mount and Mona greeting to animate
  await new Promise(r => setTimeout(r, 1200));

  // 1. Dossier Tab with Mona speaking
  await capture('scripts/screenshot-dossier.png');

  // 2. Switch to Skills via keyboard ArrowRight
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))`);
  await new Promise(r => setTimeout(r, 600));
  await capture('scripts/screenshot-skills.png');

  // 3. Switch to Heists via keyboard 3
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true }))`);
  await new Promise(r => setTimeout(r, 700));
  await capture('scripts/screenshot-heists.png');

  // 4. Switch to Confidants via keyboard 4
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: '4', bubbles: true }))`);
  await new Promise(r => setTimeout(r, 700));
  await capture('scripts/screenshot-confidants.png');

  // 5. Switch to Calling Card via keyboard 5
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: '5', bubbles: true }))`);
  await new Promise(r => setTimeout(r, 700));
  await capture('scripts/screenshot-callingcard.png');

  // 6. Return to Dossier and trigger All-Out Attack modal
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }))`);
  await new Promise(r => setTimeout(r, 700));
  await evaluate(`document.getElementById('btn-trigger-theurgy-main')?.click()`);
  await new Promise(r => setTimeout(r, 800));
  await capture('scripts/screenshot-aoa.png');
  // Close AOA
  await evaluate(`document.getElementById('aoa-close-btn')?.click()`);
  await new Promise(r => setTimeout(r, 400));

  // 7. Open Field Manual Modal via '?'
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }))`);
  await new Promise(r => setTimeout(r, 400));
  await capture('scripts/screenshot-manual.png');
  await evaluate(`document.getElementById('btn-close-manual')?.click()`);
  await new Promise(r => setTimeout(r, 400));

  // 8. Open Palace Infiltration Blueprint Modal
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true }))`);
  await new Promise(r => setTimeout(r, 600));
  await evaluate(`document.querySelector('.project-conquest-card')?.click()`);
  await new Promise(r => setTimeout(r, 400));
  await capture('scripts/screenshot-heist-modal.png');
  await evaluate(`document.getElementById('btn-close-heist-modal')?.click()`);
  await new Promise(r => setTimeout(r, 400));

  ws.close();
  chrome.kill();
  console.log('[Capture] All screenshots captured successfully.');
}
run();
