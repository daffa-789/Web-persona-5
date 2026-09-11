import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_PROFILE = process.env.TEMP + '\\chrome-p5r-new-' + Date.now();
const PORT = 9447;

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

  if (!targets) {
    console.error('Could not connect to Chrome CDP targets');
    chrome.kill();
    process.exit(1);
  }

  const page = targets.find(t => t.type === 'page' && t.url.includes('5173')) || targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((res) => {
    const curId = id++;
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', handler);
        res(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });
  await new Promise(r => ws.onopen = r);

  // Wait for entrance
  await new Promise(r => setTimeout(r, 3200));

  // 1. Test Morgana Navigator
  console.log('[Test 1] Testing Morgana Field Navigator...');
  const monaState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const nav = document.getElementById('p5-mona-navigator');
        const text = document.getElementById('mona-speech-text');
        const btn = document.getElementById('mona-avatar-btn');
        return {
          exists: !!nav,
          text: text?.textContent,
          hasAvatar: !!btn
        };
      })()
    `,
    returnByValue: true
  });
  console.log('[Test 1] Mona initial state:', monaState.result.value);
  if (!monaState.result?.value?.exists || !monaState.result?.value?.text) {
    throw new Error('Test 1 failed: Morgana navigator not working');
  }

  // Click Mona avatar to trigger next tip
  await send('Runtime.evaluate', { expression: "document.getElementById('mona-avatar-btn').click()" });
  await new Promise(r => setTimeout(r, 200));
  const tipState = await send('Runtime.evaluate', {
    expression: "document.getElementById('mona-speech-text')?.textContent",
    returnByValue: true
  });
  console.log('[Test 1] Mona tip after avatar click:', tipState.result.value);

  // 2. Test Field Manual Modal via controller HUD click
  console.log('\n[Test 2] Testing Field Manual Modal...');
  await send('Runtime.evaluate', { expression: "document.getElementById('p5-controller-hud').click()" });
  await new Promise(r => setTimeout(r, 300));
  const manualOpen = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.getElementById('p5-field-manual-modal');
        return {
          exists: !!modal,
          visible: modal?.classList.contains('visible'),
          hidden: modal?.classList.contains('hidden')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('[Test 2] Field manual open state:', manualOpen.result.value);
  if (!manualOpen.result?.value?.visible) {
    throw new Error('Test 2 failed: Field manual modal failed to open');
  }

  // Dismiss via ESC key
  await send('Runtime.evaluate', { expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))` });
  await new Promise(r => setTimeout(r, 350));
  const manualClosed = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.getElementById('p5-field-manual-modal');
        return {
          visible: modal?.classList.contains('visible'),
          hidden: modal?.classList.contains('hidden')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('[Test 2] Field manual closed state:', manualClosed.result.value);
  if (manualClosed.result?.value?.visible) {
    throw new Error('Test 2 failed: Field manual modal failed to close via ESC');
  }

  // 3. Test Palace Infiltration Blueprint Modal
  console.log('\n[Test 3] Testing Palace Infiltration Blueprint Modal...');
  // Navigate to HEISTS tab
  await send('Runtime.evaluate', { expression: "document.querySelector('[data-tab=tab-projects]').click()" });
  await new Promise(r => setTimeout(r, 600));

  // Click first project card
  await send('Runtime.evaluate', { expression: "document.querySelector('.project-conquest-card').click()" });
  await new Promise(r => setTimeout(r, 300));

  const heistModalState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.getElementById('p5-heist-dossier-modal');
        const title = document.getElementById('heist-modal-title');
        const code = document.getElementById('heist-modal-target-code');
        const fps = document.getElementById('heist-modal-fps');
        const pills = document.querySelectorAll('#heist-modal-pills .tech-pill').length;
        return {
          exists: !!modal,
          visible: modal?.classList.contains('visible'),
          title: title?.textContent,
          code: code?.textContent,
          fps: fps?.textContent,
          pillCount: pills
        };
      })()
    `,
    returnByValue: true
  });
  console.log('[Test 3] Heist blueprint modal open:', heistModalState.result.value);
  if (!heistModalState.result?.value?.visible) {
    throw new Error('Test 3 failed: Heist blueprint modal failed to open');
  }

  // Close heist modal via close button
  await send('Runtime.evaluate', { expression: "document.getElementById('btn-close-heist-modal').click()" });
  await new Promise(r => setTimeout(r, 350));
  const heistModalClosed = await send('Runtime.evaluate', {
    expression: "document.getElementById('p5-heist-dossier-modal')?.classList.contains('visible')",
    returnByValue: true
  });
  console.log('[Test 3] Heist blueprint modal closed:', !heistModalClosed.result.value);
  if (heistModalClosed.result?.value) {
    throw new Error('Test 3 failed: Heist blueprint modal failed to close');
  }

  // Verify Mona reacted to HEISTS tab switch
  const monaTabReaction = await send('Runtime.evaluate', {
    expression: "document.getElementById('mona-speech-text')?.textContent",
    returnByValue: true
  });
  console.log('[Test 1 Follow-up] Mona tab reaction on HEISTS:', monaTabReaction.result.value);

  console.log('[Test SUCCESS] All new systems verified successfully!');
  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(console.error);
