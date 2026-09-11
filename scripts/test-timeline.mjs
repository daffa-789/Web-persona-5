import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_PROFILE = process.env.TEMP + '\\chrome-p5r-test-' + Date.now();

async function run() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--remote-allow-origins=*',
    '--disable-gpu',
    `--user-data-dir=${TEMP_PROFILE}`,
    'http://localhost:5173/'
  ], { stdio: 'ignore' });

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      targets = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9222/json/list', (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
      });
      if (targets && targets.length > 0) break;
    } catch {}
  }

  const page = targets.find(t => t.type === 'page');
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

  await new Promise(r => setTimeout(r, 2500));

  // Inspect the animation during tab switch
  const timeline = await evaluate(`(async () => {
    const log = [];
    const btn = document.querySelector('.p5-ribbon-btn[data-tab="tab-skills"]');
    btn.click();
    
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
  timeline.forEach(t => {
    console.log(`t=${t.time}ms: wipes=${t.wipeCount} classes=${t.wipes.map(w => w.classes.join(',')).join(' | ')}`);
  });

  ws.close();
  chrome.kill();
}
run();
