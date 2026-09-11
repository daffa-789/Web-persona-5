import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_PROFILE = process.env.TEMP + '\\chrome-p5r-test-' + Date.now();

const PORT = 9448;

async function run() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--remote-allow-origins=*',
    '--disable-gpu',
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

  if (!targets) {
    console.error('Failed to connect to Chrome CDP');
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

  console.log('[Test] Waiting for app mounting & entrance sequence...');
  await new Promise(r => setTimeout(r, 2000));
  await evaluate(`(() => new Promise((res) => {
    const start = Date.now();
    const check = () => {
      const btn = document.querySelector('.p5-ribbon-btn[data-tab="tab-skills"]');
      const overlay = document.getElementById('p5r-entrance-overlay');
      if (btn && !overlay) {
        res({ ready: true });
      } else if (Date.now() - start > 8000) {
        res({ timeout: true, hasBtn: !!btn, hasOverlay: !!overlay });
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  }))()`);

  // Check elementFromPoint for SKILLS button
  const hitTest = await evaluate(`(() => {
    const btn = document.querySelector('.p5-ribbon-btn[data-tab="tab-skills"]');
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const topEl = document.elementFromPoint(cx, cy);
    return {
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      center: { x: cx, y: cy },
      topElement: {
        tagName: topEl?.tagName,
        className: topEl?.className,
        id: topEl?.id,
        isInsideBtn: btn.contains(topEl)
      }
    };
  })()`);
  console.log('[HitTest on SKILLS button]:', JSON.stringify(hitTest, null, 2));

  // Real mouse click via CDP Input domain
  console.log('[Test] Dispatching REAL mouse click at', hitTest.center);
  await send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: hitTest.center.x,
    y: hitTest.center.y,
    button: 'left',
    clickCount: 1
  });
  await send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: hitTest.center.x,
    y: hitTest.center.y,
    button: 'left',
    clickCount: 1
  });

  await new Promise(r => setTimeout(r, 800));

  const afterRealClick = await evaluate(`(() => {
    const activeBtn = document.querySelector('.p5-ribbon-btn.active');
    const activePane = document.querySelector('.tab-pane.active');
    return {
      activeBtn: activeBtn?.getAttribute('data-tab'),
      activePane: activePane?.id
    };
  })()`);
  console.log('[After REAL CDP Mouse Click]:', afterRealClick);

  ws.close();
  chrome.kill();
  process.exit(0);
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});
