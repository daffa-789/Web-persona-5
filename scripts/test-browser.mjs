import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_PROFILE = process.env.TEMP + '\\chrome-p5r-test-' + Date.now();

const PORT = 9444;

async function run() {
  console.log('[Test] Launching Chrome on port ' + PORT + '...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--remote-allow-origins=*',
    '--disable-gpu',
    '--disable-extensions',
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

  if (!targets || targets.length === 0) {
    console.error('[Test] Could not connect to Chrome CDP targets');
    chrome.kill();
    process.exit(1);
  }

  const page = targets.find(t => t.type === 'page' && t.url.includes('5173')) || targets.find(t => t.type === 'page');
  console.log('[Test] Found page:', page.url);

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res) => ws.onopen = res);

  let msgId = 1;
  const pending = new Map();
  const consoleLogs = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map(a => a.value ?? a.description).join(' ');
      consoleLogs.push(`[Console] ${msg.params.type}: ${text}`);
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
    if (res.result && res.result.exceptionDetails) {
      throw new Error(JSON.stringify(res.result.exceptionDetails));
    }
    return res.result?.result?.value;
  }

  await send('Runtime.enable');
  await send('Page.enable');

  console.log('[Test] Waiting 2.5s for page load and entrance cinematic...');
  await new Promise(r => setTimeout(r, 2500));

  const overlayStatus = await evaluate(`(() => {
    const el = document.getElementById('p5r-entrance-overlay');
    return {
      exists: !!el,
      classList: el ? Array.from(el.classList) : [],
      display: el ? getComputedStyle(el).display : null,
      pointerEvents: el ? getComputedStyle(el).pointerEvents : null
    };
  })()`);
  console.log('[Test] Entrance overlay status:', overlayStatus);

  const activeTab = await evaluate(`(() => {
    const activeBtn = document.querySelector('.p5-ribbon-btn.active');
    const activePane = document.querySelector('.tab-pane.active');
    return {
      activeBtnDataTab: activeBtn?.getAttribute('data-tab'),
      activePaneId: activePane?.id,
      bodyClasses: Array.from(document.body.classList)
    };
  })()`);
  console.log('[Test] Initial tab state:', activeTab);

  // Test 1: Mouse click on Tab 2 (SKILLS)
  console.log('\n[Test 1] Simulating mouse click on SKILLS ribbon...');
  const clickResult = await evaluate(`(() => {
    const skillsBtn = document.querySelector('.p5-ribbon-btn[data-tab="tab-skills"]');
    if (!skillsBtn) return { error: 'SKILLS button not found' };
    skillsBtn.click();
    return { clicked: true };
  })()`);
  console.log('[Test 1] Click initiated:', clickResult);

  await new Promise(r => setTimeout(r, 700));

  const afterClickState = await evaluate(`(() => {
    const activeBtn = document.querySelector('.p5-ribbon-btn.active');
    const activePane = document.querySelector('.tab-pane.active');
    const allPanes = Array.from(document.querySelectorAll('.tab-pane')).map(p => ({
      id: p.id,
      active: p.classList.contains('active'),
      display: getComputedStyle(p).display
    }));
    return {
      activeBtn: activeBtn?.getAttribute('data-tab'),
      activePane: activePane?.id,
      bodyClasses: Array.from(document.body.classList),
      panes: allPanes,
      wipeOverlays: document.querySelectorAll('.p5r-wipe-layer').length
    };
  })()`);
  console.log('[Test 1] State after mouse click on SKILLS:', afterClickState);

  // Test 2: Keyboard ArrowRight
  console.log('\n[Test 2] Simulating Keyboard ArrowRight to HEISTS...');
  await evaluate(`(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  })()`);
  await new Promise(r => setTimeout(r, 700));

  const afterKeyRight = await evaluate(`(() => {
    const activeBtn = document.querySelector('.p5-ribbon-btn.active');
    const activePane = document.querySelector('.tab-pane.active');
    return {
      activeBtn: activeBtn?.getAttribute('data-tab'),
      activePane: activePane?.id,
      bodyClasses: Array.from(document.body.classList)
    };
  })()`);
  console.log('[Test 2] State after ArrowRight:', afterKeyRight);

  // Test 3: Keyboard number 4
  console.log('\n[Test 3] Simulating Keyboard "4" to CONFIDANTS...');
  await evaluate(`(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '4', bubbles: true }));
  })()`);
  await new Promise(r => setTimeout(r, 700));

  const afterKey4 = await evaluate(`(() => {
    const activeBtn = document.querySelector('.p5-ribbon-btn.active');
    const activePane = document.querySelector('.tab-pane.active');
    return {
      activeBtn: activeBtn?.getAttribute('data-tab'),
      activePane: activePane?.id,
      bodyClasses: Array.from(document.body.classList)
    };
  })()`);
  console.log('[Test 3] State after key 4:', afterKey4);

  // Test 4: Back navigation (ESC)
  console.log('\n[Test 4] Simulating ESC to go back...');
  await evaluate(`(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  })()`);
  await new Promise(r => setTimeout(r, 700));

  const afterEsc = await evaluate(`(() => {
    const activeBtn = document.querySelector('.p5-ribbon-btn.active');
    const activePane = document.querySelector('.tab-pane.active');
    return {
      activeBtn: activeBtn?.getAttribute('data-tab'),
      activePane: activePane?.id,
      bodyClasses: Array.from(document.body.classList)
    };
  })()`);
  console.log('[Test 4] State after ESC:', afterEsc);

  // Test 5: Click on Back Button
  console.log('\n[Test 5] Simulating click on Back Button (#p5-back-btn)...');
  const backBtnResult = await evaluate(`(() => {
    const btn = document.getElementById('p5-back-btn');
    if (!btn) return { error: 'Back button not found' };
    const rect = btn.getBoundingClientRect();
    btn.click();
    return { clicked: true, visible: rect.width > 0 && rect.height > 0, opacity: getComputedStyle(btn).opacity };
  })()`);
  console.log('[Test 5] Back button click:', backBtnResult);
  await new Promise(r => setTimeout(r, 700));

  const afterBackBtn = await evaluate(`(() => {
    const activeBtn = document.querySelector('.p5-ribbon-btn.active');
    const activePane = document.querySelector('.tab-pane.active');
    return {
      activeBtn: activeBtn?.getAttribute('data-tab'),
      activePane: activePane?.id,
      bodyClasses: Array.from(document.body.classList)
    };
  })()`);
  console.log('[Test 5] State after back button click:', afterBackBtn);

  console.log('\n[Test] Recent Console Logs:');
  consoleLogs.slice(-10).forEach(l => console.log(l));

  ws.close();
  chrome.kill();
  console.log('\n[Test] Test completed successfully.');
}

run().catch(err => {
  console.error('[Test Error]', err);
  process.exit(1);
});
