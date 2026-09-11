import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_PROFILE = process.env.TEMP + '\\chrome-p5r-allsys-' + Date.now();
const PORT = 9452;

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
    console.error('Failed to connect to Chrome CDP');
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

  await send('Runtime.enable');
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('[Browser Console]', msg.params.type, msg.params.args?.map(a => a.value ?? a.description ?? '').join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('[Browser Exception]', JSON.stringify(msg.params.exceptionDetails, null, 2));
    }
  });

  const evaluate = async (expression) => {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res?.result?.value;
  };

  // Wait for app mount and entrance to finish
  console.log('[All Systems Test] Waiting for app mounting & entrance sequence...');
  await new Promise(r => setTimeout(r, 2000));
  await evaluate(`(() => new Promise((res) => {
    const start = Date.now();
    const check = () => {
      const ribbon = document.getElementById('p5-goal-ribbon');
      const overlay = document.getElementById('p5r-entrance-overlay');
      if (ribbon && !overlay) {
        res({ ready: true });
      } else if (Date.now() - start > 8000) {
        res({ timeout: true, hasRibbon: !!ribbon, hasOverlay: !!overlay });
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  }))()`);

  // 1. Test /goal
  console.log('\n--- 1. Testing /goal (Mission Directive Modal) ---');
  // Trigger via click on #p5-goal-ribbon
  await evaluate("document.getElementById('p5-goal-ribbon').click()");
  await new Promise(r => setTimeout(r, 300));
  const goalState = await evaluate(`(() => {
    const m = document.getElementById('p5-goal-modal');
    return {
      exists: !!m,
      visible: m?.classList.contains('visible'),
      title: document.getElementById('goal-modal-title')?.textContent?.trim()
    };
  })()`);
  console.log('Goal Modal Opened via Ribbon Click:', goalState);
  if (!goalState.visible) throw new Error('Goal modal failed to open via ribbon click');

  // Dismiss via ESC
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))");
  await new Promise(r => setTimeout(r, 300));
  const goalClosed = await evaluate("!document.getElementById('p5-goal-modal')?.classList.contains('visible')");
  console.log('Goal Modal Closed via ESC:', goalClosed);
  if (!goalClosed) throw new Error('Goal modal failed to close via ESC');

  // Trigger via keyboard shortcut [M]
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', bubbles: true }))");
  await new Promise(r => setTimeout(r, 300));
  const goalViaKey = await evaluate("document.getElementById('p5-goal-modal')?.classList.contains('visible')");
  console.log('Goal Modal Opened via Key [M]:', goalViaKey);
  if (!goalViaKey) throw new Error('Goal modal failed to open via key [M]');

  // Close via button
  await evaluate("document.getElementById('btn-close-goal-modal')?.click()");
  await new Promise(r => setTimeout(r, 300));

  // 2. Test /schedule
  console.log('\n--- 2. Testing /schedule (Briefing Scheduler Modal) ---');
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }))");
  await new Promise(r => setTimeout(r, 300));
  const schedState = await evaluate(`(() => {
    const m = document.getElementById('p5-schedule-modal');
    return {
      visible: m?.classList.contains('visible'),
      title: document.getElementById('schedule-modal-title')?.textContent?.trim()
    };
  })()`);
  console.log('Schedule Modal Opened via Key [S]:', schedState);
  if (!schedState.visible) throw new Error('Schedule modal failed to open');
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))");
  await new Promise(r => setTimeout(r, 300));

  // 3. Test /browser
  console.log('\n--- 3. Testing /browser (Playable 120 FPS Sandbox) ---');
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', bubbles: true }))");
  await new Promise(r => setTimeout(r, 350));
  const browserState = await evaluate(`(() => {
    const m = document.getElementById('p5-browser-sandbox-modal');
    const canvas = document.getElementById('sandbox-canvas');
    const fps = document.getElementById('sandbox-fps');
    return {
      visible: m?.classList.contains('visible'),
      canvasWidth: canvas?.width,
      canvasHeight: canvas?.height,
      fpsText: fps?.textContent
    };
  })()`);
  console.log('Browser Sandbox Opened via Key [B]:', browserState);
  if (!browserState.visible) throw new Error('Browser sandbox failed to open');
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))");
  await new Promise(r => setTimeout(r, 300));

  // 4. Test /grill-me
  console.log('\n--- 4. Testing /grill-me (Technical Due Diligence) ---');
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))");
  await new Promise(r => setTimeout(r, 300));
  const grillState = await evaluate(`(() => {
    const m = document.getElementById('p5-grill-me-modal');
    const title = document.getElementById('grill-me-title');
    const qCount = document.querySelectorAll('#p5-grill-me-modal .grill-tab-btn').length;
    return {
      visible: m?.classList.contains('visible'),
      title: title?.textContent?.trim(),
      questionCount: qCount
    };
  })()`);
  console.log('Grill-Me Modal Opened via Key [G]:', grillState);
  if (!grillState.visible || grillState.questionCount !== 4) throw new Error('Grill-Me modal failed');
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))");
  await new Promise(r => setTimeout(r, 300));

  // 5. Test /teamwork-preview
  console.log('\n--- 5. Testing /teamwork-preview (Studio Agile Cooperation) ---');
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 't', bubbles: true }))");
  await new Promise(r => setTimeout(r, 300));
  const teamState = await evaluate(`(() => {
    const m = document.getElementById('p5-teamwork-modal');
    const pillars = document.querySelectorAll('.teamwork-tab-btn').length;
    return {
      visible: m?.classList.contains('visible'),
      pillarCount: pillars
    };
  })()`);
  console.log('Teamwork Modal Opened via Key [T]:', teamState);
  if (!teamState.visible || teamState.pillarCount !== 5) throw new Error('Teamwork modal failed');
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))");
  await new Promise(r => setTimeout(r, 300));

  // 6. Test /learn
  console.log('\n--- 6. Testing /learn (Knowledge Codex) ---');
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'l', bubbles: true }))");
  await new Promise(r => setTimeout(r, 300));
  const learnState = await evaluate(`(() => {
    const m = document.getElementById('p5-learn-codex-modal');
    const articles = document.querySelectorAll('.codex-tab-btn').length;
    return {
      visible: m?.classList.contains('visible'),
      articleCount: articles
    };
  })()`);
  console.log('Learn Codex Modal Opened via Key [L]:', learnState);
  if (!learnState.visible || learnState.articleCount !== 4) throw new Error('Learn Codex modal failed');
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))");
  await new Promise(r => setTimeout(r, 300));

  // 7. Test /boost
  console.log('\n--- 7. Testing /boost (Palace Overclock Mode) ---');
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'o', bubbles: true }))");
  await new Promise(r => setTimeout(r, 300));
  const boostState = await evaluate(`(() => {
    const lines = document.getElementById('p5-boost-speedlines');
    const toast = document.getElementById('p5-boost-toast');
    return {
      linesActive: lines?.classList.contains('active'),
      toastActive: toast?.classList.contains('active')
    };
  })()`);
  console.log('Boost Overclock Activated via Key [O]:', boostState);
  if (!boostState.linesActive) throw new Error('Boost mode failed to activate');

  // Toggle off
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'o', bubbles: true }))");
  await new Promise(r => setTimeout(r, 300));
  const boostOff = await evaluate("!document.getElementById('p5-boost-speedlines')?.classList.contains('active')");
  console.log('Boost Mode Toggled Off:', boostOff);
  if (!boostOff) throw new Error('Boost mode failed to deactivate');

  // 8. Test Command Palette
  console.log('\n--- 8. Testing Command Palette (/) ---');
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }))");
  await new Promise(r => setTimeout(r, 300));
  const paletteState = await evaluate(`(() => {
    const m = document.getElementById('p5-command-palette-modal') || document.getElementById('metaverse-cmd-palette');
    const items = document.querySelectorAll('.cmd-item-row, .cmd-item').length;
    return {
      visible: m?.classList.contains('visible'),
      itemCount: items
    };
  })()`);
  console.log('Command Palette Opened via [/]:', paletteState);
  if (!paletteState.visible || paletteState.itemCount < 6) throw new Error('Command palette failed');
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))");
  await new Promise(r => setTimeout(r, 300));

  // 9. Test Locked Social Links
  console.log('\n--- 9. Testing Locked Social Links ---');
  const lockedSocials = await evaluate(`(() => {
    const cards = Array.from(document.querySelectorAll('.slink-card-locked'));
    return {
      count: cards.length,
      names: cards.map(c => c.getAttribute('data-social-name'))
    };
  })()`);
  console.log('Locked Social Links found:', lockedSocials);
  if (lockedSocials.count !== 5) throw new Error('Expected 5 locked social cards for empty links');

  // Click first locked card and verify Mona dialogue
  await evaluate("document.querySelector('.slink-card-locked').click()");
  await new Promise(r => setTimeout(r, 200));
  const monaReaction = await evaluate("document.getElementById('mona-speech-text')?.textContent");
  console.log('Mona reaction after clicking locked social card:', monaReaction);
  if (!monaReaction || !monaReaction.includes('unlinked')) throw new Error('Mona reaction missing for locked social click');

  // 10. Test /advice (Strategic Career Advice for Daffa)
  console.log('\n--- 10. Testing /advice (/sarannya) ---');
  await evaluate("window.location.hash = '#advice'");
  await new Promise(r => setTimeout(r, 350));
  const adviceState = await evaluate(`(() => {
    const m = document.getElementById('p5-advice-modal');
    const tabs = document.querySelectorAll('.advice-tab-btn').length;
    return {
      visible: m?.classList.contains('visible'),
      tabCount: tabs
    };
  })()`);
  console.log('Advice Modal Opened via Hash #advice:', adviceState);
  if (!adviceState.visible || adviceState.tabCount !== 5) throw new Error('Advice modal failed to open');
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))");
  await new Promise(r => setTimeout(r, 300));

  console.log('\n=============================================================');
  console.log('ALL 10 CORE PHANTOM THIEVES SYSTEMS VERIFIED 100% SUCCESSFULLY!');
  console.log('=============================================================');

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('[Test All Systems Error]', err);
  process.exit(1);
});
