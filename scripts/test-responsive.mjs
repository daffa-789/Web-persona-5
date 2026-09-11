import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_PROFILE = process.env.TEMP + '\\chrome-p5r-resp-' + Date.now();
const PORT = 9446;

async function run() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--remote-allow-origins=*',
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=375,667',
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
    console.error('Failed to connect to CDP');
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
  await new Promise(r => setTimeout(r, 2400));

  async function checkViewport(w, h, label) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      deviceScaleFactor: 2,
      mobile: w <= 768
    });
    await send('Emulation.setVisibleSize', { width: w, height: h });
    await new Promise(r => setTimeout(r, 600));

    const check = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const docEl = document.documentElement;
          const body = document.body;
          const winW = window.innerWidth;
          const scrollW = docEl.scrollWidth;
          const bodyScrollW = body.scrollWidth;

          // Find overflowing elements
          const overflowing = [];
          const all = document.querySelectorAll('*');
          all.forEach(el => {
            const rect = el.getBoundingClientRect();
            // Allow fixed background decorations and full-width overlays
            if (el.classList.contains('p5-halftone-overlay') ||
                el.classList.contains('p5r-slash-beam-overlay') ||
                el.classList.contains('aoa-diagonal-slash') ||
                el.id === 'aoa-flash' ||
                el.classList.contains('all-out-attack-overlay') ||
                el.classList.contains('joker-silhouette-container') ||
                el.classList.contains('p5r-slash-cutline')) {
              return;
            }
            if (rect.right > winW + 2) {
              overflowing.push({
                tag: el.tagName,
                cls: (el.className || '').toString().slice(0, 50),
                id: el.id,
                right: Math.round(rect.right),
                width: Math.round(rect.width)
              });
            }
          });

          return {
            winW,
            scrollW,
            bodyScrollW,
            hasDocOverflow: scrollW > winW,
            overflowCount: overflowing.length,
            sampleOverflow: overflowing.slice(0, 5)
          };
        })()
      `,
      returnByValue: true
    });

    console.log(`[Viewport ${label} (${w}x${h})] Result:`, check.result.value);
    return check.result.value;
  }

  console.log('Testing Mobile (375px)...');
  const res375 = await checkViewport(375, 667, 'iPhone SE 375px');

  console.log('Testing Tablet (768px)...');
  const res768 = await checkViewport(768, 1024, 'iPad 768px');

  console.log('Testing Desktop (1440px)...');
  const res1440 = await checkViewport(1440, 900, 'Desktop 1440px');

  // Test tabs on 375px
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 400));

  console.log('Testing tab navigation on 375px mobile...');
  const tabs = ['tab-skills', 'tab-projects', 'tab-experience', 'tab-contact', 'tab-profile'];
  for (const t of tabs) {
    await send('Runtime.evaluate', { expression: `document.querySelector('[data-tab="${t}"]').click()` });
    await new Promise(r => setTimeout(r, 550));
    const active = await send('Runtime.evaluate', {
      expression: `document.querySelector('.tab-pane.active')?.id`,
      returnByValue: true
    });
    console.log(`Mobile switched to: ${active.result.value}`);
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(console.error);
