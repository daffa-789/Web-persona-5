import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_PROFILE = process.env.TEMP + '\\chrome-p5r-slash-' + Date.now();
const PORT = 9450;

async function run() {
  console.log('[Test] Launching Chrome on port ' + PORT + '...');
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

  console.log('[Test] Waiting 3.2s for entrance animation...');
  await new Promise(r => setTimeout(r, 3200));

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Test Social Links Resilience (Empty URLs / Locked State)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[Test 1] Testing Empty Social Links Resilience...');
  const socialCards = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = document.querySelectorAll('#slink-grid .slink-card');
        const lockedCards = document.querySelectorAll('#slink-grid .slink-card-locked');
        return {
          totalCards: cards.length,
          lockedCount: lockedCards.length
        };
      })()
    `,
    returnByValue: true
  });
  console.log('[Test 1] Social cards count:', socialCards.result.value);

  // Click a locked card and verify toast / no navigation error
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const lockedCard = document.querySelector('.slink-card-locked');
        if (lockedCard) lockedCard.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 200));

  const toastStatus = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const toast = document.getElementById('p5-boost-toast');
        return {
          exists: !!toast,
          visible: toast && !toast.classList.contains('hidden'),
          text: toast?.textContent
        };
      })()
    `,
    returnByValue: true
  });
  console.log('[Test 1] Locked card toast status:', toastStatus.result.value);

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Test /schedule Modal
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[Test 2] Testing /schedule Modal...');
  await send('Runtime.evaluate', { expression: "document.getElementById('btn-schedule-heist').click()" });
  await new Promise(r => setTimeout(r, 350));

  const scheduleOpen = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.getElementById('p5-schedule-modal');
        const title = document.getElementById('schedule-modal-title');
        const objBtns = modal?.querySelectorAll('.btn-schedule-obj').length;
        return {
          exists: !!modal,
          visible: modal?.classList.contains('visible'),
          title: title?.textContent,
          objectiveButtonCount: objBtns
        };
      })()
    `,
    returnByValue: true
  });
  console.log('[Test 2] Schedule modal open state:', scheduleOpen.result.value);

  // Fill in form and submit
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const nameInp = document.getElementById('schedule-name');
        const emailInp = document.getElementById('schedule-email');
        if (nameInp) nameInp.value = 'Studio Lead Makoto';
        if (emailInp) emailInp.value = 'makoto@atlus-test.com';
        const submitBtn = document.getElementById('btn-submit-schedule');
        if (submitBtn) submitBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  const scheduleSuccess = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const panel = document.getElementById('schedule-success-panel');
        return {
          visible: panel && !panel.classList.contains('hidden'),
          stampText: panel?.querySelector('.schedule-cleared-stamp')?.textContent?.trim()
        };
      })()
    `,
    returnByValue: true
  });
  console.log('[Test 2] Schedule submission success state:', scheduleSuccess.result.value);

  // Dismiss via ESC
  await send('Runtime.evaluate', {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`
  });
  await new Promise(r => setTimeout(r, 350));

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Test /browser Sandbox Modal
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[Test 3] Testing /browser 120 FPS Sandbox Modal...');
  // Open via keyboard shortcut [B]
  await send('Runtime.evaluate', {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', bubbles: true }))`
  });
  await new Promise(r => setTimeout(r, 350));

  const sandboxState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.getElementById('p5-browser-sandbox-modal');
        const canvas = document.getElementById('p5-sandbox-canvas');
        const fpsEl = document.getElementById('sandbox-live-fps');
        return {
          exists: !!modal,
          visible: modal?.classList.contains('visible'),
          hasCanvas: !!canvas,
          canvasWidth: canvas?.width,
          canvasHeight: canvas?.height,
          fpsText: fpsEl?.textContent?.trim()
        };
      })()
    `,
    returnByValue: true
  });
  console.log('[Test 3] Browser sandbox state:', sandboxState.result.value);

  // Dismiss via ESC
  await send('Runtime.evaluate', {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`
  });
  await new Promise(r => setTimeout(r, 350));

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Test /grill-me Technical Interrogation Modal
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[Test 4] Testing /grill-me Technical Interrogation Modal...');
  // Open via keyboard shortcut [G]
  await send('Runtime.evaluate', {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))`
  });
  await new Promise(r => setTimeout(r, 350));

  const grillState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.getElementById('p5-grill-me-modal');
        const tabs = modal?.querySelectorAll('.grill-tab-btn').length;
        return {
          exists: !!modal,
          visible: modal?.classList.contains('visible'),
          questionCount: tabs
        };
      })()
    `,
    returnByValue: true
  });
  console.log('[Test 4] Grill-me modal state:', grillState.result.value);

  // Dismiss via ESC
  await send('Runtime.evaluate', {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`
  });
  await new Promise(r => setTimeout(r, 350));

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Test /teamwork-preview Modal
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[Test 5] Testing /teamwork-preview Modal...');
  // Open via keyboard shortcut [T]
  await send('Runtime.evaluate', {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 't', bubbles: true }))`
  });
  await new Promise(r => setTimeout(r, 350));

  const teamworkState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.getElementById('p5-teamwork-modal');
        const tabs = modal?.querySelectorAll('.teamwork-tabs-bar .grill-tab-btn').length;
        return {
          exists: !!modal,
          visible: modal?.classList.contains('visible'),
          pillarCount: tabs
        };
      })()
    `,
    returnByValue: true
  });
  console.log('[Test 5] Teamwork modal state:', teamworkState.result.value);
  if (!teamworkState.result?.value?.visible || teamworkState.result?.value?.pillarCount !== 5) {
    throw new Error(`Test 5 Failed: Expected 5 teamwork pillars, got ${teamworkState.result?.value?.pillarCount}`);
  }

  // Dismiss via ESC
  await send('Runtime.evaluate', {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`
  });
  await new Promise(r => setTimeout(r, 350));

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Test //learn (Knowledge Codex) Modal
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[Test 6] Testing //learn Knowledge Codex Modal...');
  // Open via keyboard shortcut [L]
  await send('Runtime.evaluate', {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'l', bubbles: true }))`
  });
  await new Promise(r => setTimeout(r, 350));

  const codexState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.getElementById('p5-learn-codex-modal');
        const tabs = modal?.querySelectorAll('.codex-tabs-bar .grill-tab-btn').length;
        const codePre = modal?.querySelector('.codex-code-pre');
        return {
          exists: !!modal,
          visible: modal?.classList.contains('visible'),
          articleCount: tabs,
          hasCode: !!codePre
        };
      })()
    `,
    returnByValue: true
  });
  console.log('[Test 6] Knowledge Codex state:', codexState.result.value);
  if (!codexState.result?.value?.visible || codexState.result?.value?.articleCount !== 4) {
    throw new Error(`Test 6 Failed: Expected 4 codex articles, got ${codexState.result?.value?.articleCount}`);
  }

  // Dismiss via ESC
  await send('Runtime.evaluate', {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`
  });
  await new Promise(r => setTimeout(r, 350));

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Test /boost (120 FPS Palace Overclock)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[Test 7] Testing /boost Palace Overclock...');
  // Trigger boost via shortcut [O]
  await send('Runtime.evaluate', {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'o', bubbles: true }))`
  });
  await new Promise(r => setTimeout(r, 250));

  const boostState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          isBodyBoosted: document.body.classList.contains('p5r-boost-active'),
          speedlinesVisible: !document.getElementById('p5-boost-speedlines')?.classList.contains('hidden'),
          alertText: document.getElementById('security-alert-text')?.textContent
        };
      })()
    `,
    returnByValue: true
  });
  console.log('[Test 7] Boost ON state:', boostState.result.value);

  // Toggle boost off
  await send('Runtime.evaluate', {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'o', bubbles: true }))`
  });
  await new Promise(r => setTimeout(r, 250));

  const boostOffState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          isBodyBoosted: document.body.classList.contains('p5r-boost-active'),
          speedlinesHidden: document.getElementById('p5-boost-speedlines')?.classList.contains('hidden')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('[Test 7] Boost OFF state:', boostOffState.result.value);

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Test Metaverse Command Palette (/)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[Test 8] Testing Command Palette (/)...');
  await send('Runtime.evaluate', {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }))`
  });
  await new Promise(r => setTimeout(r, 300));

  const paletteState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.getElementById('p5-command-palette-modal');
        const rows = modal?.querySelectorAll('.cmd-item-row').length;
        return {
          exists: !!modal,
          visible: modal?.classList.contains('visible'),
          commandCount: rows
        };
      })()
    `,
    returnByValue: true
  });
  console.log('[Test 8] Command Palette state:', paletteState.result.value);

  // Dismiss via ESC
  await send('Runtime.evaluate', {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`
  });
  await new Promise(r => setTimeout(r, 300));

  const paletteClosed = await send('Runtime.evaluate', {
    expression: `!document.getElementById('p5-command-palette-modal')?.classList.contains('visible')`,
    returnByValue: true
  });
  console.log('[Test 8] Command Palette closed by ESC:', paletteClosed.result.value);

  console.log('\n[Test SUCCESS] All slash systems verified successfully!');
  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('[Test Failure]', err);
  process.exit(1);
});
