/**
 * ==========================================================================
 * PERSONA 5 ROYAL — PAGE-LOAD ENTRANCE CINEMATIC SEQUENCE (R1)
 * Authentic: yellow flash → diagonal slash panels → Joker slide-in → DAFFA char-by-char
 * ==========================================================================
 */

const ROTATIONS = [-4, 3, -2, 4, -3, 2, -4, 3];

function buildEntranceOverlay(): HTMLElement {
  const existing = document.getElementById('p5r-entrance-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'p5r-entrance-overlay';

  // Yellow flash
  const flash = document.createElement('div');
  flash.id = 'entrance-flash';

  // Diagonal slash panels
  const slashes = [1, 2, 3, 4].map((n) => {
    const s = document.createElement('div');
    s.className = `entrance-slash entrance-slash-${n}`;
    return s;
  });

  // Content: Joker + title + subtitle
  const content = document.createElement('div');
  content.id = 'entrance-content';

  const joker = document.createElement('img');
  joker.id = 'entrance-joker';
  joker.src = '/images/p5r/joker_render.png';
  joker.alt = 'Joker';

  const titleEl = document.createElement('div');
  titleEl.id = 'entrance-title';
  const name = 'DAFFA';
  name.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'echar';
    span.textContent = char;
    const rot = ROTATIONS[i % ROTATIONS.length];
    span.style.setProperty('--rot', `${rot}deg`);
    // stagger: char appears after content fades in
    span.style.animationDelay = `${0.82 + i * 0.1}s`;
    titleEl.appendChild(span);
  });

  const subtitle = document.createElement('div');
  subtitle.id = 'entrance-subtitle';
  subtitle.textContent = 'LEAD GAMEPLAY & ENGINE PROGRAMMER';

  content.appendChild(joker);
  content.appendChild(titleEl);
  content.appendChild(subtitle);

  overlay.appendChild(flash);
  slashes.forEach((s) => overlay.appendChild(s));
  overlay.appendChild(content);

  document.body.prepend(overlay);
  return overlay;
}

export function runEntrance(): Promise<void> {
  return new Promise((resolve) => {
    const overlay = buildEntranceOverlay();
    let resolved = false;

    const finish = () => {
      if (resolved) return;
      resolved = true;
      overlay.style.pointerEvents = 'none';
      overlay.style.transition = 'opacity 0.25s ease';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.classList.add('done');
        overlay.remove();
        resolve();
      }, 250);
    };

    overlay.addEventListener('click', finish, { once: true });
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ' || (e.key >= '1' && e.key <= '5')) {
        window.removeEventListener('keydown', keyHandler);
        finish();
      }
    };
    window.addEventListener('keydown', keyHandler);

    // Total cinematic duration: ~1.8s, then remove overlay
    setTimeout(() => {
      window.removeEventListener('keydown', keyHandler);
      finish();
    }, 1800);
  });
}
