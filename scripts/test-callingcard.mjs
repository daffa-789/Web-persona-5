import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_PROFILE = process.env.TEMP + '\\chrome-p5r-cc-' + Date.now();
const PORT = 9445;

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

  // Wait for entrance to complete
  await new Promise(r => setTimeout(r, 2200));

  // Switch to contact tab
  await send('Runtime.evaluate', { expression: "document.querySelector('[data-tab=tab-contact]').click()" });
  await new Promise(r => setTimeout(r, 600));

  // Fill and submit form
  const submitEval = await send('Runtime.evaluate', { expression: `
    (() => {
      const name = document.getElementById('contact-name');
      const email = document.getElementById('contact-email');
      const msg = document.getElementById('contact-msg');
      const btn = document.getElementById('btn-submit-calling-card');
      const form = document.getElementById('tactics-contact-form');
      name.value = 'Atlus Studios';
      email.value = 'tanaka@atlus.co.jp';
      msg.value = 'We require your 120 FPS high-performance engine systems.';
      const clickRes = btn.click();
      return {
        nameVal: name.value,
        emailVal: email.value,
        btnDisabled: btn.disabled,
        btnHTML: btn.innerHTML,
        formValid: form.checkValidity()
      };
    })()
  `, returnByValue: true });
  console.log('[E2E Calling Card] Submit Eval:', submitEval.result.value);

  console.log('[E2E Calling Card] Form submitted, waiting for transmission & AOA trigger...');
  await new Promise(r => setTimeout(r, 2600));

  // Check stamp and close AOA if open
  await send('Runtime.evaluate', { expression: `
    const aoaBtn = document.getElementById('aoa-close-btn');
    if (aoaBtn) aoaBtn.click();
  ` });
  await new Promise(r => setTimeout(r, 400));

  const stampState = await send('Runtime.evaluate', { expression: `
    (() => {
      const stamp = document.getElementById('calling-card-success');
      const form = document.getElementById('tactics-contact-form');
      const resetBtn = document.getElementById('btn-reset-calling-card');
      return {
        stampVisible: stamp?.classList.contains('visible'),
        formDisplay: form?.style.display,
        resetBtnFound: !!resetBtn
      };
    })()
  `, returnByValue: true });
  console.log('[E2E Calling Card] Stamp State:', stampState.result.value);

  // Click reset button
  await send('Runtime.evaluate', { expression: "document.getElementById('btn-reset-calling-card').click()" });
  await new Promise(r => setTimeout(r, 300));

  const resetState = await send('Runtime.evaluate', { expression: `
    (() => {
      const stamp = document.getElementById('calling-card-success');
      const form = document.getElementById('tactics-contact-form');
      return {
        stampVisible: stamp?.classList.contains('visible'),
        formDisplay: form?.style.display,
        nameVal: document.getElementById('contact-name').value
      };
    })()
  `, returnByValue: true });
  console.log('[E2E Calling Card] Reset State:', resetState.result.value);

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(console.error);
