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
import { helpModalController } from './ui/helpModal';
import { heistModalController } from './ui/heistModal';
import { grillMeModalController } from './ui/grillMeModal';
import { browserSandboxController } from './ui/browserSandboxModal';
import { scheduleModalController } from './ui/scheduleModal';
import { teamworkModalController } from './ui/teamworkModal';
import { learnCodexController } from './ui/learnCodexModal';
import { boostModeController } from './ui/boostMode';
import { commandPaletteController } from './ui/commandPalette';
import { goalModalController } from './ui/goalModal';
import {
  renderAppShell,
  renderAll,
  renderSocialLinks,
  renderSkillParameters,
  renderAffinities,
  renderProjects,
  renderExperience,
  initSecurityAlert
} from './renderer';

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

  const openAoa = (speakerText?: string) => {
    if (!overlay || overlay.classList.contains('active')) return;
    // Trigger flash first
    triggerAoaFlash();
    // Then show overlay and trigger dramatic AOA initiation sound
    setTimeout(() => {
      p5rAudio.playAoaStart();
      overlay.classList.add('active');
      if (speakerText) {
        const speakerEl = document.getElementById('aoa-speaker');
        if (speakerEl) speakerEl.textContent = speakerText;
      }
    }, 180);
  };

  const closeAoa = () => {
    if (!overlay || !overlay.classList.contains('active')) return;
    p5rAudio.playAoaFinish();
    overlay.classList.remove('active');
    // Reset aoa-close-btn animation so it re-triggers next open
    const btn = document.getElementById('aoa-close-btn');
    if (btn) {
      btn.style.animation = 'none';
      void btn.offsetWidth;
      btn.style.animation = '';
    }
    // Reset title chars
    const titleEl = document.getElementById('aoa-title-main');
    if (titleEl) titleEl.textContent = 'THE CODE IS EXECUTED!';
    const speakerEl = document.getElementById('aoa-speaker');
    if (speakerEl) speakerEl.textContent = '"I\'VE BEEN WAITING FOR THIS! — DAFFA // JOKER"';
  };

  if (theurgyBtn) {
    theurgyBtn.addEventListener('click', () => openAoa());
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', closeAoa);
  }

  // Expose openAoa globally for callingCard
  (window as unknown as Record<string, unknown>)._p5rOpenAoa = openAoa;
}

// ============================================================================
// CALLING CARD: TRANSMITTING + STAMP (R6)
// ============================================================================

function initCallingCard(): void {
  const form = document.getElementById('tactics-contact-form') as HTMLFormElement | null;
  const submitBtn = document.getElementById('btn-submit-calling-card') as HTMLButtonElement | null;
  const successDiv = document.getElementById('calling-card-success');
  const feedbackDiv = document.getElementById('form-submit-feedback');
  const objBtns = document.querySelectorAll<HTMLElement>('.btn-action-type');
  const openAoa = (window as unknown as Record<string, unknown>)._p5rOpenAoa as ((text?: string) => void) | undefined;

  let activeObjective = 'FULL-TIME STUDIO ROLE';

  objBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      p5rAudio.playConfirm();
      objBtns.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      const text = btn.querySelector('span')?.textContent?.replace(/^[^\w]+/, '').trim();
      activeObjective = text || btn.textContent?.trim() || 'FULL-TIME STUDIO ROLE';
    });
  });

  if (!form || !submitBtn) return;

  // Audio feedback when focusing inputs
  const inputs = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
  inputs.forEach((inp) => {
    inp.addEventListener('focus', () => {
      p5rAudio.playMenuNavigate();
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contact-name') as HTMLInputElement | null;
    const emailInput = document.getElementById('contact-email') as HTMLInputElement | null;
    const msgInput = document.getElementById('contact-msg') as HTMLTextAreaElement | null;

    const nameVal = nameInput?.value.trim() || '';
    const emailVal = emailInput?.value.trim() || '';
    const msgVal = msgInput?.value.trim() || '';

    // Input validation
    if (!nameVal || !emailVal || !msgVal) {
      if (feedbackDiv) {
        feedbackDiv.className = 'mt-4 p-3 bg-black/90 border-2 border-[#E60012] text-xs font-mono text-[#FFDE00] [transform:skewX(-6deg)]';
        feedbackDiv.innerHTML = '<div class="[transform:skewX(6deg)]">⚠️ INCOMPLETE DISPATCH: ALL FIELDS ARE REQUIRED BY THE PHANTOM THIEVES!</div>';
        feedbackDiv.classList.remove('hidden');
      }
      p5rAudio.playMenuBack();
      return;
    }

    if (!emailVal.includes('@') || !emailVal.includes('.')) {
      if (feedbackDiv) {
        feedbackDiv.className = 'mt-4 p-3 bg-black/90 border-2 border-[#E60012] text-xs font-mono text-[#FFDE00] [transform:skewX(-6deg)]';
        feedbackDiv.innerHTML = '<div class="[transform:skewX(6deg)]">⚠️ FREQUENCY ERROR: DIRECT EMAIL ADDRESS FORMAT INVALID!</div>';
        feedbackDiv.classList.remove('hidden');
      }
      p5rAudio.playMenuBack();
      return;
    }

    if (feedbackDiv) feedbackDiv.classList.add('hidden');

    // R6: Transmitting state
    submitBtn.classList.add('transmitting');
    submitBtn.disabled = true;
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>⚡ TRANSMITTING CALLING CARD...</span>';
    p5rAudio.playConfirm();

    setTimeout(() => {
      // Trigger AOA with personalized quote
      if (typeof openAoa === 'function') {
        openAoa(`"CALLING CARD RECEIVED FROM ${nameVal.toUpperCase()} // OBJECTIVE: ${activeObjective.toUpperCase()}"`);
      }

      // Show success stamp (R6)
      setTimeout(() => {
        form.style.display = 'none';
        if (feedbackDiv) feedbackDiv.classList.add('hidden');
        if (successDiv) successDiv.classList.add('visible');
      }, 800);

      // Reset button state
      submitBtn.classList.remove('transmitting');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }, 1200);
  });

  // Ensure programmatic clicks on submitBtn trigger form submit
  submitBtn.addEventListener('click', () => {
    if (form.checkValidity() && !submitBtn.disabled && !submitBtn.classList.contains('transmitting')) {
      if (typeof form.requestSubmit === 'function') {
        form.requestSubmit();
      } else {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  });

  const resetBtn = document.getElementById('btn-reset-calling-card');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      p5rAudio.playMenuBack();
      if (successDiv) successDiv.classList.remove('visible');
      form.reset();
      form.style.display = '';
      if (feedbackDiv) feedbackDiv.classList.add('hidden');
      // Reset selected objective button to the first one
      objBtns.forEach((b, i) => b.classList.toggle('selected', i === 0));
      activeObjective = 'FULL-TIME STUDIO ROLE';
    });
  }
}

// ============================================================================
// BATON PASS OVERDRIVE BOOSTER (/BOOST)
// ============================================================================

function initBatonPassBoost(): void {
  const boostBtn = document.getElementById('btn-boost-vitals');
  const hpBar = document.querySelector<HTMLElement>('.bar-fill.hp');
  const spBar = document.querySelector<HTMLElement>('.bar-fill.sp');
  const bpBar = document.getElementById('vital-baton-pass-bar');
  const bpText = document.getElementById('vital-baton-pass-text');
  let isBoosted = false;

  if (!boostBtn) return;

  boostBtn.addEventListener('click', () => {
    isBoosted = !isBoosted;
    if (isBoosted) {
      p5rAudio.playAoaStart();
      triggerAoaFlash();
      boostBtn.classList.add('boosted');
      boostBtn.innerHTML = '<span>⚡ BOOSTED // 120% OVERDRIVE ACTIVE</span>';
      if (hpBar) hpBar.style.width = '100%';
      if (spBar) spBar.style.width = '100%';
      if (bpBar) bpBar.style.width = '100%';
      if (bpText) bpText.textContent = '120% OVERDRIVE ACTIVE';
      monaNavigator.say('BATON PASS MAX OVERDRIVE! All combat parameters overclocked to 120%!', true);
    } else {
      p5rAudio.playMenuBack();
      boostBtn.classList.remove('boosted');
      boostBtn.innerHTML = '<span>⚡ BATON PASS: OVERDRIVE BOOST (120%)</span>';
      if (hpBar) hpBar.style.width = `${PORTFOLIO_CONFIG.profile.vitals.hpPercent}%`;
      if (spBar) spBar.style.width = `${PORTFOLIO_CONFIG.profile.vitals.spPercent}%`;
      if (bpBar) bpBar.style.width = `${PORTFOLIO_CONFIG.profile.vitals.batonPassPercent}%`;
      if (bpText) bpText.textContent = `${PORTFOLIO_CONFIG.profile.vitals.batonPassPercent}% MAX READY`;
    }
  });
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
// INTERACTIVE HOVER SFX
// ============================================================================

function attachInteractiveSfx(): void {
  const hoverSelectors = 'button:not(.p5-ribbon-btn), a, .slink-card, .project-conquest-card, .timeline-milestone-card';
  let lastHovered: HTMLElement | null = null;

  document.addEventListener('mouseover', (e) => {
    const target = (e.target as HTMLElement)?.closest<HTMLElement>(hoverSelectors);
    if (target && target !== lastHovered) {
      lastHovered = target;
      p5rAudio.playMenuNavigate();
    }
  }, { passive: true });
}

// ============================================================================
// RENDERER: inject palace-access-overlay into project cards
// ============================================================================

function injectPalaceOverlays(): void {
  const cards = document.querySelectorAll<HTMLElement>('.project-conquest-card');
  cards.forEach((card) => {
    if (!card.querySelector('.palace-access-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'palace-access-overlay';
      overlay.textContent = '⚡ ACCESSING PALACE DATA...';
      card.appendChild(overlay);
    }
  });
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
      monaNavigator.say(`🔒 ${name} transmission frequency is currently unlinked! Dispatch a direct Calling Card below to contact Joker!`, true);
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
    renderProjects();
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

  // 5. Alert telemetry
  initSecurityAlert();

  // 6. Calling Card (R6)
  initCallingCard();

  // 7. Baton Pass Overdrive Booster (/boost)
  initBatonPassBoost();

  // 8. Hover SFX
  attachInteractiveSfx();

  // 9. Morgana Tactical Field Navigator
  monaNavigator.init();

  // 10. Field Manual / Keyboard Guide Modal
  helpModalController.init();

  // 11. Palace Infiltration Blueprint Dossier Modal
  heistModalController.init();

  // 12. Technical Due Diligence Interrogation Modal (/grill-me)
  grillMeModalController.init();

  // 13. In-Browser 120 FPS Engine Benchmark Sandbox Modal (/browser)
  browserSandboxController.init();

  // 14. Palace Heist & Interview Scheduler Modal (/schedule)
  scheduleModalController.init();

  // 15. Studio Teamwork & Agile Cooperation Modal (/teamwork-preview)
  teamworkModalController.init();

  // 16. Phantom Thieves Knowledge Codex Modal (//learn)
  learnCodexController.init();

  // 17. Palace Overclock 120 FPS Boost Mode (/boost)
  boostModeController.init();

  // 18. Metaverse Command Palette (/ quick launcher)
  commandPaletteController.init();

  // 19. Palace Infiltration Goal Directive Modal (/goal)
  goalModalController.init();

  // 20. Post-render: inject overlays & upgrade cards
  injectPalaceOverlays();
  upgradeSocialLinks();

  // 14. Run entrance cinematic smoothly on top
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
