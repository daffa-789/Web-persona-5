import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_PROFILE = process.env.TEMP + '\\chrome-p5r-audit-' + Date.now();
const PORT = 9446;

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
            try { resolve(JSON.parse(data)); } catch { resolve(null); }
          });
        });
        req.on('error', () => resolve(null));
      });
      if (targets && targets.length > 0 && targets.some(t => t.type === 'page' && t.url.includes('5173'))) break;
    } catch {}
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
    return res.result?.result?.value;
  }

  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 2600));

  const result = await evaluate(`(() => {
    const el = document.querySelector('.section-tag');
    const cs = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const topEl = document.elementFromPoint(rect.left + 5, rect.top + 5);

    const backBtn = document.getElementById('p5-back-btn');
    const backCs = backBtn ? window.getComputedStyle(backBtn) : null;

    // Check data strip scrollWidth vs clientWidth
    const strips = Array.from(document.querySelectorAll('.p5-data-strip')).map(s => ({
      text: s.textContent,
      clientWidth: s.clientWidth,
      scrollWidth: s.scrollWidth,
      isTruncated: s.scrollWidth > s.clientWidth
    }));

    return {
      sectionTag: {
        bg: cs.backgroundColor,
        color: cs.color,
        opacity: cs.opacity,
        topEl: topEl ? { tag: topEl.tagName, id: topEl.id, class: topEl.className, html: topEl.outerHTML.slice(0, 150) } : null,
        rect: { top: rect.top, bottom: rect.bottom, left: rect.left, height: rect.height },
        navBox: (() => { const nr = document.querySelector('.p5r-nav-section')?.getBoundingClientRect(); return nr ? { top: nr.top, bottom: nr.bottom, height: nr.height } : null; })()
      },
      backBtn: backCs ? {
        opacity: backCs.opacity,
        pointerEvents: backCs.pointerEvents,
        display: backCs.display,
        classList: Array.from(backBtn.classList)
      } : null,
      layoutTree: (() => {
        const header = document.querySelector('.p5r-header')?.getBoundingClientRect();
        const nav = document.querySelector('.p5r-nav-section')?.getBoundingClientRect();
        const main = document.querySelector('.main-content')?.getBoundingClientRect();
        const hdr = document.querySelector('.section-header')?.getBoundingClientRect();
        const tag = document.querySelector('.section-tag')?.getBoundingClientRect();
        const mainEl = document.querySelector('.main-content');
        return {
          header: header ? { top: header.top, bottom: header.bottom, height: header.height } : null,
          nav: nav ? { top: nav.top, bottom: nav.bottom, height: nav.height } : null,
          main: main ? { top: main.top, bottom: main.bottom, height: main.height } : null,
          sectionHeader: hdr ? { top: hdr.top, bottom: hdr.bottom, height: hdr.height } : null,
          tag: tag ? { top: tag.top, bottom: tag.bottom, height: tag.height } : null,
          mainComputed: mainEl ? {
            marginTop: getComputedStyle(mainEl).marginTop,
            paddingTop: getComputedStyle(mainEl).paddingTop
          } : null,
          navComputed: (() => {
            const navEl = document.querySelector('.p5r-nav-section');
            if (!navEl) return null;
            const cs = getComputedStyle(navEl);
            return {
              position: cs.position,
              top: cs.top,
              display: cs.display,
              float: cs.float,
              height: cs.height,
              zIndex: cs.zIndex
            };
          })()
        };
      })(),
      strips
    };
  })()`);

  console.log('Audit Result:', JSON.stringify(result, null, 2));
  chrome.kill();
  process.exit(0);
}

run();

