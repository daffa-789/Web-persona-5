/**
 * ==========================================================================
 * PERSONA 5 ROYAL — PAGE-LOAD ENTRANCE CINEMATIC (R1)
 * File: src/ui/entrance.ts
 *
 * Hard cut, never a fade. Budget 1.9s, every phase is a snap:
 *
 *   0ms     black frame + menu_open
 *   60ms    4 comic blades cut in on steps(), 45ms apart, scanline sweeping
 *   220ms   name assembles through the RANSOM-ASSEMBLE cue (seeded rotation)
 *   560ms   Joker slides in from the right on skewX(-12deg)
 *   820ms   subtitle slams onto the frame
 *   1.5s    reverse wipe hands the viewport to the live shell
 *
 * prefers-reduced-motion: no overlay is built at all; the shell is revealed
 * instantly. Keyboard input during the cinematic is captured so a "1" both
 * skips the cinematic and nothing else.
 * ==========================================================================
 */

import { PORTFOLIO_CONFIG } from '../config/portfolio';
import { p5rAudio } from '../audio/p5rAudio';
import { MOTION, p5rTransitions, prefersReducedMotion } from '../transitions/transitions';

const BLADES = 4;
const BLADE_STAGGER = 45;
const BLADE_RUN = 250;
const SNAP = 'cubic-bezier(.16,1,.3,1)';
const CHOP = 'steps(4, end)';

const PHASE = {
  shutter: MOTION.blackout,
  title: 220,
  joker: 560,
  subtitle: 820,
  release: 1500
} as const;

/** Hard ceiling so a stalled cue can never hold the viewport. Nominal length is
 *  PHASE.release + the final band sweep = 1.89s, inside the 2.4s budget. */
const BUDGET = PHASE.release + BLADE_RUN + (BLADES - 1) * BLADE_STAGGER + 400;

function snap(
  el: HTMLElement,
  frames: Keyframe[],
  duration: number,
  options: { easing?: string; delay?: number; fill?: FillMode } = {}
): void {
  if (typeof el.animate !== 'function') return;
  const delay = options.delay ?? 0;
  const anim = el.animate(frames, {
    duration,
    easing: options.easing ?? SNAP,
    delay,
    // 'backwards' holds the first keyframe through a stagger delay so an
    // element never flashes its resting style first; one-shot reveals commit
    // with 'forwards' because their resting style is the hidden state.
    fill: options.fill ?? (delay > 0 ? 'backwards' : 'none')
  });
  anim.finished.catch(() => undefined);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function nameChars(): string[] {
  const raw = PORTFOLIO_CONFIG.profile.name || 'DAFFA';
  return raw.trim().toUpperCase().split('').slice(0, 10);
}

function buildOverlay(): HTMLElement {
  document.getElementById('p5r-entrance-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'p5r-entrance-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const scanline = document.createElement('div');
  scanline.className = 'p5-entrance-scanline';

  const titleRow = document.createElement('h2');
  titleRow.className = 'section-title';
  const note = document.createElement('span');
  note.className = 'ransom-note';
  nameChars().forEach((char) => {
    const span = document.createElement('span');
    // Armed from the first frame: the RANSOM-ASSEMBLE cue disarms per glyph.
    span.className = 'ransom-char p5-ransom-arm';
    span.textContent = char;
    note.appendChild(span);
  });
  titleRow.appendChild(note);

  const header = document.createElement('div');
  header.className = 'section-header';
  header.id = 'entrance-header';
  header.appendChild(titleRow);

  const joker = document.createElement('img');
  joker.id = 'entrance-joker';
  joker.src = '/images/p5r/joker_render.png';
  joker.alt = '';

  const subtitle = document.createElement('div');
  subtitle.id = 'entrance-subtitle';
  subtitle.textContent = (PORTFOLIO_CONFIG.profile.title || 'LEAD GAME SYSTEMS ENGINEER')
    .toUpperCase();

  const content = document.createElement('div');
  content.id = 'entrance-content';
  content.appendChild(joker);
  content.appendChild(header);
  content.appendChild(subtitle);

  overlay.appendChild(scanline);
  for (let i = 1; i <= BLADES; i += 1) {
    const blade = document.createElement('div');
    blade.className = `entrance-blade entrance-blade-${i}`;
    overlay.appendChild(blade);
  }
  overlay.appendChild(content);

  document.body.prepend(overlay);
  return overlay;
}

/**
 * Sheets sweep horizontally through their own skew. `translate` is animated
 * rather than `transform` so each band keeps the tear angle the stylesheet
 * gave it — writing transform here would flatten them all to one angle.
 */
function sweepBands(blades: HTMLElement[], reverse: boolean): void {
  blades.forEach((blade, i) => {
    snap(
      blade,
      [
        { translate: `${reverse ? 0 : -118}% 0` },
        { translate: `${reverse ? 118 : 0}% 0` }
      ],
      BLADE_RUN,
      { easing: reverse ? 'steps(3, end)' : CHOP, delay: i * BLADE_STAGGER, fill: 'forwards' }
    );
  });
}

async function playCinematic(overlay: HTMLElement): Promise<void> {
  const blades = Array.from(overlay.querySelectorAll<HTMLElement>('.entrance-blade'));
  const joker = overlay.querySelector<HTMLElement>('#entrance-joker');
  const subtitle = overlay.querySelector<HTMLElement>('#entrance-subtitle');
  const header = overlay.querySelector<HTMLElement>('#entrance-header');
  const scan = overlay.querySelector<HTMLElement>('.p5-entrance-scanline');

  p5rAudio.playMotionAudio('menu_open');
  await wait(PHASE.shutter);

  scan?.classList.add('p5-scan-run');
  sweepBands(blades, false);
  p5rAudio.playKnifeSlash();

  await wait(PHASE.title - PHASE.shutter);
  if (header) void p5rTransitions.ransomAssemble({ header, seed: 'entrance' });

  await wait(PHASE.joker - PHASE.title);
  if (joker) {
    snap(
      joker,
      [
        { opacity: 0, transform: 'translateX(46vw) skewX(-12deg) scale(1.08)' },
        { opacity: 1, transform: 'translateX(0) skewX(-12deg) scale(1)' }
      ],
      260,
      { fill: 'forwards' }
    );
  }

  await wait(PHASE.subtitle - PHASE.joker);
  if (subtitle) {
    snap(
      subtitle,
      [
        { opacity: 0, transform: 'translateX(-26px) skewX(-12deg)' },
        { opacity: 1, transform: 'translateX(0) skewX(-12deg)' }
      ],
      120,
      { easing: 'steps(2, end)', fill: 'forwards' }
    );
  }

  await wait(PHASE.release - PHASE.subtitle);
  sweepBands(blades, true);
  await wait(BLADE_RUN + (BLADES - 1) * BLADE_STAGGER);
}

export function runEntrance(): Promise<void> {
  if (typeof document === 'undefined' || prefersReducedMotion()) {
    p5rTransitions.revealRibbons();
    return Promise.resolve();
  }

  const overlay = buildOverlay();
  let settled = false;

  return new Promise<void>((resolve) => {
    const finish = (): void => {
      if (settled) return;
      settled = true;
      window.removeEventListener('keydown', onKey, { capture: true });
      overlay.remove();
      p5rTransitions.revealRibbons(MOTION.stagger);
      resolve();
    };

    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ' || /^[1-9]$/.test(event.key)) {
        event.preventDefault();
        event.stopPropagation();
        finish();
      }
    };

    window.addEventListener('keydown', onKey, { capture: true });
    overlay.addEventListener('click', finish, { once: true });
    window.setTimeout(finish, BUDGET);

    void playCinematic(overlay).catch(() => finish());
  });
}
