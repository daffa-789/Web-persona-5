/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - MASTER APPLICATION BOOTSTRAP (src/main.ts)
 *
 * Orchestrates all Phantom Thief portfolio systems:
 *  - Entrance Cinematic Sequence (R1): yellow flash → slash panels → Joker slide
 *  - Web Audio API Sound & "Last Surprise" BGM Engine (src/audio/p5rAudio.ts)
 *  - Slanted Radial Command Wheel Navigation with clip-path wipe (R2)
 *  - Palace Security Alert Level Scroll Telemetry
 *  - Fullscreen All-Out Attack Cinematic Modal with flash sequence (R5)
 *  - Dynamic Game Dev CV Section Renderer (src/renderer.ts)
 *  - Calling Card: transmitting state + stamp (R6)
 *  - Vital bars counter roll-up animation (R7)
 * ==========================================================================
 */

import './styles/p5r-style.css';
import { PORTFOLIO_CONFIG } from './config/portfolio';
import { p5rAudio } from './audio/p5rAudio';
import { headerController } from './ui/header';
import { navigationController } from './ui/navigation';
import { p5rTransitions } from './transitions/transitions';
import { runEntrance } from './ui/entrance';
import { monaNavigator } from './ui/monaNavigator';
import { adviceModalController } from './ui/adviceModal';
import { helpModalController } from './ui/helpModal';
import {
  renderAppShell,
  renderAll,
  renderSocialLinks,
  renderSkillParameters,
  renderAffinities,
  renderExperience
} from './renderer';
import { p5CriticalSpark, p5RankUpCelebration, p5VictoryShower } from './utils/p5Confetti';

console.log(
  `%c[P5R]%c Phantom Thieves Terminal active for: ${PORTFOLIO_CONFIG.profile.name} // ${PORTFOLIO_CONFIG.profile.codename}`,
  'color: #FFDE00; font-weight: bold; background: #E60012; padding: 2px 8px;',
  'color: #ffffff; font-weight: bold; background: #000000; padding: 2px 6px;'
);

// ============================================================================
// AOA FLASH SEQUENCE (R5)
// ============================================================================

/** Trigger yellow flash → char-by-char title */
function triggerAoaFlash(): void {
  const flashEl = document.getElementById('aoa-flash');
  if (flashEl) {
    flashEl.classList.remove('active');
    // Force reflow
    void flashEl.offsetWidth;
    flashEl.classList.add('active');
    setTimeout(() => flashEl.classList.remove('active'), 400);
  }

  // Char-by-char title animation (R5)
  const titleEl = document.getElementById('aoa-title-main');
  if (titleEl) {
    const original = titleEl.textContent || 'THE CODE IS EXECUTED!';
    titleEl.innerHTML = '';
    const ROTS = [-3, 2, -4, 3, -2, 4, -3, 2, -4, 3, -2, 4, -3, 2, -4, 3, -2, 4, -3, 2, -4];
    original.split('').forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'aoa-char';
      span.textContent = ch === ' ' ? '\u00a0' : ch;
      const rot = ROTS[i % ROTS.length];
      span.style.setProperty('--rot', `${rot}deg`);
      // Snappy kinetic stagger (all chars slam down within ~600ms)
      span.style.animationDelay = `${0.12 + i * 0.024}s`;
      titleEl.appendChild(span);
    });
  }
}

// ============================================================================
// ALL-OUT ATTACK MODAL (R5)
// ============================================================================

function initAllOutAttack(): void {
  const overlay = document.getElementById('all-out-attack-overlay');
  const closeBtn = document.getElementById('aoa-close-btn');
  const theurgyBtn = document.getElementById('btn-trigger-theurgy-main');

  const resetFinisher = (): void => {
    const btn = document.getElementById('aoa-close-btn');
    if (btn) {
      btn.style.animation = 'none';
      void btn.offsetWidth;
      btn.style.animation = '';
    }
    const titleEl = document.getElementById('aoa-title-main');
    if (titleEl) titleEl.textContent = 'THE CODE IS EXECUTED!';
    const speakerEl = document.getElementById('aoa-speaker');
    if (speakerEl) speakerEl.textContent = '"I\'VE BEEN WAITING FOR THIS! — DAFFA // JOKER"';
  };

  const openAoa = (speakerText?: string): void => {
    if (!overlay || overlay.classList.contains('active')) return;
    void p5rTransitions.shutterBlackout({
      host: overlay,
      audio: 'aoa_start',
      staggerSelector: '.aoa-splash-content > *, #aoa-close-btn',
      onCovered: () => {
        overlay.classList.add('active');
        triggerAoaFlash();
        if (speakerText) {
          const speakerEl = document.getElementById('aoa-speaker');
          if (speakerEl) speakerEl.textContent = speakerText;
        }
      }
    });
  };

  const closeAoa = (): void => {
    if (!overlay || !overlay.classList.contains('active')) return;
    // The finisher's confetti is the payoff, so this one exit opts out of the
    // variant's default confetti suppression instead of cancelling it mid-air.
    p5VictoryShower();
    void p5rTransitions.kineticExit({
      host: overlay,
      audio: 'aoa_finish',
      suppressConfetti: false,
      onCovered: () => {
        overlay.classList.remove('active');
        resetFinisher();
      }
    });
    resetFinisher();
  };

  if (theurgyBtn) {
    theurgyBtn.addEventListener('click', () => openAoa());
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', closeAoa);
  }

  window.addEventListener('keydown', (event) => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (event.key.toLowerCase() === 't') {
      event.preventDefault();
      openAoa();
    }
  });

  // Expose openAoa globally
  (window as unknown as Record<string, unknown>)._p5rOpenAoa = openAoa;
}

// ============================================================================
// VITAL BARS COUNTER ROLL-UP (R7)
// ============================================================================

function animateVitalBars(): void {
  const bars = document.querySelectorAll<HTMLElement>('.bar-fill');
  bars.forEach((bar) => {
    const targetWidth = bar.style.width || bar.getAttribute('data-width') || '100%';
    // Set to 0 first, then transition to target
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.width = targetWidth;
      });
    });
  });
}

// ============================================================================
// INTERACTIVE HOVER SFX & COMIC CONFETTI SPARKS
// ============================================================================

function attachInteractiveSfx(): void {
  const hoverSelectors = 'button, a, .slink-card, .timeline-milestone-card, .p5-hud-chip, .p5-btn-pill, .affinity-badge, .radar-stat-pill, .p5-tech-chip, .spec-ribbon';
  let lastHovered: HTMLElement | null = null;

  document.addEventListener('mouseover', (e) => {
    const target = (e.target as HTMLElement)?.closest<HTMLElement>(hoverSelectors);
    if (target && target !== lastHovered) {
      lastHovered = target;
      p5rAudio.playMenuNavigate();
    }
  }, { passive: true });

  // Universal crisp click SFX + comic particle effects
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement)?.closest<HTMLElement>('button, a, .btn-action-type, .p5-hud-chip, .timeline-milestone-card, .slink-card, .affinity-badge, .p5-tech-chip, .spec-ribbon');
    if (target && !target.classList.contains('p5-ribbon-btn')) {
      p5rAudio.playMenuSelect();

      // Confidant card click: rank up fanfare burst
      if (target.closest('.timeline-milestone-card')) {
        const rect = target.getBoundingClientRect();
        p5RankUpCelebration((rect.left + rect.width / 2) / window.innerWidth, (rect.top + rect.height / 2) / window.innerHeight);
      }
      // Active social link, skill badge, tech chip, or spec ribbon click: critical star spark
      else if (target.closest('.slink-card:not(.slink-card-locked)') || target.closest('.affinity-badge') || target.closest('.p5-tech-chip') || target.closest('.spec-ribbon')) {
        const rect = target.getBoundingClientRect();
        p5CriticalSpark((rect.left + rect.width / 2) / window.innerWidth, (rect.top + rect.height / 2) / window.innerHeight);
      }
    }
  }, { passive: true });
}

// ============================================================================
// RENDERER: rebuild social link cards with flip structure
// ============================================================================

function upgradeSocialLinks(): void {
  const grid = document.getElementById('slink-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll<HTMLElement>('.slink-card');
  cards.forEach((card) => {
    // Skip if already upgraded
    if (card.querySelector('.slink-card-inner')) return;
    const inner = card.innerHTML;
    const label = card.querySelector<HTMLElement>('.slink-name')?.textContent || 'CONNECT';
    const icon = card.querySelector<HTMLElement>('.slink-icon')?.textContent || '🔗';

    const isLocked = card.classList.contains('slink-card-locked');
    const actionText = isLocked ? 'FREQUENCY OFFLINE 🔒' : 'CONNECT ▶';

    card.innerHTML = `
      <div class="slink-card-inner">
        <div class="slink-face slink-inner">${inner}</div>
        <div class="slink-back ${isLocked ? 'slink-back-locked' : ''}">
          <span style="font-size:1.4rem">${icon}</span>
          <span>${label}</span>
          <span style="font-size:0.65rem;color:${isLocked ? '#888' : '#ffde00'}">${actionText}</span>
        </div>
      </div>`;
  });

  // Helpful in-universe advice when clicking offline social beacons
  grid.addEventListener('click', (e) => {
    const lockedCard = (e.target as HTMLElement).closest<HTMLElement>('.slink-card-locked');
    if (lockedCard) {
      const name = lockedCard.getAttribute('data-social-name') || 'Social Beacon';
      p5rAudio.playMenuBack();
      monaNavigator.say(`🔒 ${name} transmission frequency is currently unlinked! Joker will link this channel soon!`, true);
    }
  });
}

// ============================================================================
// MAIN INIT
// ============================================================================

function mountApp(): void {
  const root = document.getElementById('app') || document.body;
  if (!root.querySelector('.p5r-app-wrapper')) {
    renderAppShell(root);
    renderSocialLinks();
    renderSkillParameters();
    renderAffinities();
    renderExperience();
  }
}

// Immediately mount DOM if #app is present
if (typeof document !== 'undefined') {
  mountApp();
}

function bootstrap(): void {
  mountApp();
  console.log('[P5R] DOM Content Loaded. Initializing systems & running entrance...');

  // 1. Audio Engine
  p5rAudio.init();

  // 2. Header HUD
  headerController.init();

  // 3. Navigation (force requery to bind all newly rendered ribbon buttons)
  navigationController.init(true);

  // 4. All-Out Attack Modal (R5)
  initAllOutAttack();

  // 5. Hover SFX
  attachInteractiveSfx();

  // 6. Morgana Tactical Field Navigator
  monaNavigator.init();

  // 7. Strategic Career Advice Modal (/advice, /sarannya)
  adviceModalController.init();

  // 8. Field Manual (? / H) — must run after navigation so the controller HUD
  //    it binds to already exists.
  helpModalController.init();

  // 9. Post-render: upgrade social links
  upgradeSocialLinks();

  // 10. Entrance cinematic owns the viewport until it hands back to the shell
  runEntrance().then(() => {
    animateVitalBars();
    console.log('[P5R] Persona 5 Royal Game Developer Portfolio — ALL SYSTEMS ACTIVE.');
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  } else {
    bootstrap();
  }
}

export { headerController, navigationController, p5rTransitions, renderAll };
