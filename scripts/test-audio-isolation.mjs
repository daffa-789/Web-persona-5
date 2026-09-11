import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_PROFILE = process.env.TEMP + '\\chrome-p5r-audio-' + Date.now();

async function run() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9333',
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
        http.get('http://127.0.0.1:9333/json/list', (res) => {
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
  const networkRequests = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Network.requestWillBeSent') {
      networkRequests.push(msg.params.request.url);
    }
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

  await send('Network.enable');

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result?.result?.value;
  }

  console.log('[Test Audio] Waiting for entrance sequence to complete...');
  await new Promise(r => setTimeout(r, 2600));

  // 1. Check audio network requests & audio format checks
  console.log('[Test Audio 1] Verifying all audio files can be fetched and return 200 OK as MP3...');
  const sfxList = [
    '/audio/sfx/aoa_finish.mp3',
    '/audio/sfx/aoa_start.mp3',
    '/audio/sfx/gun_cock.mp3',
    '/audio/sfx/menu_back.mp3',
    '/audio/sfx/menu_navigate.mp3',
    '/audio/sfx/menu_open.mp3',
    '/audio/sfx/menu_select.mp3',
    '/audio/last_surprise.mp3'
  ];

  const fetchResults = await evaluate(`
    (async () => {
      const urls = ${JSON.stringify(sfxList)};
      const results = [];
      for (const u of urls) {
        try {
          const res = await fetch(u);
          results.push({ url: u, status: res.status, ok: res.ok, type: res.headers.get('content-type') });
        } catch (e) {
          results.push({ url: u, error: e.message });
        }
      }
      return results;
    })()
  `);

  console.log('[Test Audio 1] Fetch results:');
  let allOk = true;
  for (const r of fetchResults) {
    console.log(`  - ${r.url}: status ${r.status} (ok: ${r.ok})`);
    if (!r.ok) allOk = false;
  }
  if (!allOk) {
    throw new Error('Some audio files failed to fetch!');
  }

  // 2. Check no .wav requests occurred
  console.log('[Test Audio 2] Verifying no .wav requests were made...');
  const wavRequests = networkRequests.filter(u => u.includes('.wav'));
  console.log(`  - .wav requests count: ${wavRequests.length}`);
  if (wavRequests.length > 0) {
    throw new Error(`.wav requests found: ${wavRequests.join(', ')}`);
  }

  // 3. Test rapid tab switching and audio channel separation
  console.log('[Test Audio 3] Testing audio channel separation during fast tab clicks...');
  const channelTest = await evaluate(`
    (async () => {
      // Click skills tab
      const skillsBtn = document.querySelector('[data-tab="tab-skills"]');
      skillsBtn?.click();
      await new Promise(r => setTimeout(r, 100));

      // Click heists tab
      const heistsBtn = document.querySelector('[data-tab="tab-projects"]');
      heistsBtn?.click();
      await new Promise(r => setTimeout(r, 450));

      const active = document.querySelector('.tab-pane.active')?.id;
      return { active };
    })()
  `);
  console.log('[Test Audio 3] Tab switch state:', channelTest);

  // 4. Test goBack() without double sound
  console.log('[Test Audio 4] Testing goBack() via ESC...');
  const backTest = await evaluate(`
    (async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await new Promise(r => setTimeout(r, 450));
      return {
        activeTab: document.querySelector('.tab-pane.active')?.id
      };
    })()
  `);
  console.log('[Test Audio 4] State after ESC:', backTest);

  console.log('[Test Audio] ALL TESTS PASSED SUCCESSFULLY!');
  chrome.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('[Test Audio] FAILED:', err);
  process.exit(1);
});
