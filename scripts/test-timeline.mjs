import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_PROFILE = process.env.TEMP + '\\chrome-p5r-test-' + Date.now();

const PORT = 9449;

async function run() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--remote-allow-origins=*',
    '--disable-gpu',
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
            try { resolve(JSON.parse(data)); } catch { resolve(null); }
          });
        });
        req.on('error', () => resolve(null));
      });
      if (targets && targets.length > 0 && targets.some(t => t.type === 'page' && t.url.includes('5173'))) break;
    } catch {}
  }

  if (!targets) {
    console.error('Failed to connect to Chrome CDP on port', PORT);
    chrome.kill();
    process.exit(1);
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
    if (res?.result?.exceptionDetails) {
      console.error('CDP Evaluation Exception:', JSON.stringify(res.result.exceptionDetails, null, 2));
    }
    return res?.result?.result?.value ?? res?.result?.value;
  }

  await send('Runtime.enable');
  await send('Page.enable');

  console.log('[Test Timeline] Waiting for app mounting & entrance sequence...');
  await new Promise(r => setTimeout(r, 2000));
  await evaluate(`(() => new Promise((res) => {
    const start = Date.now();
    const check = () => {
      const btn = document.querySelector('.p5-ribbon-btn[data-tab="tab-skills"]');
      const overlay = document.getElementById('p5r-entrance-overlay');
      if (btn && !overlay) {
        res({ ready: true });
      } else if (Date.now() - start > 8000) {
        res({ timeout: true });
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  }))()`);

  // Inspect the animation during tab switch
  const timeline = await evaluate(`(async () => {
    const log = [];
    const btn = document.querySelector('.p5-ribbon-btn[data-tab="tab-skills"]');
    if (btn) btn.click();
    
    // Sample every 30ms for 500ms
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 30));
      const wipes = Array.from(document.querySelectorAll('.p5r-wipe-layer')).map(w => ({
        classes: Array.from(w.classList),
        clipPath: getComputedStyle(w).clipPath,
        opacity: getComputedStyle(w).opacity
      }));
      const joker = document.getElementById('joker-silhouette');
      log.push({
        time: (i + 1) * 30,
        wipeCount: wipes.length,
        wipes,
        jokerTransform: joker ? getComputedStyle(joker).transform : null,
        jokerClasses: joker ? Array.from(joker.classList) : []
      });
    }
    return log;
  })()`);

  console.log('[Transition Timeline Samples]:');
  if (Array.isArray(timeline)) {
    timeline.forEach(t => {
      console.log(`t=${t.time}ms: wipes=${t.wipeCount} classes=${t.wipes.map(w => w.classes.join(',')).join(' | ')}`);
    });
  } else {
    console.log('Timeline result:', timeline);
  }

  ws.close();
  chrome.kill();
  console.log('[Test Timeline] Completed successfully.');
  process.exit(0);
}
run().catch((err) => {
  console.error('[Test Timeline Error]', err);
  process.exit(1);
});
