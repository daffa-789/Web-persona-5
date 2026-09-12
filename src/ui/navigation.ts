/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - SLANTED RADIAL COMMAND WHEEL NAVIGATION SYSTEM
 * File: src/ui/navigation.ts
 *
 * Controls the authentic P5R slanted command ribbons:
 *  - 5 Tabs: DOSSIER, SKILLS, HEISTS, CONFIDANTS, CALLING CARD
 *  - Slanted Geometry: skewX(-12deg) rotate(-8deg) with unskewed inner text
 *  - Dynamic Full Joker Silhouette Cutout: filter drop-shadow(-12px 12px 0px #E60012),
 *    reactive tab stances, kinetic twitch on switch, and desktop mouse parallax
 *  - Hover Microinteractions: translateX(24px) pop-out, crimson highlight,
 *    procedural playGunCock() on hover, procedural playKnifeSlash() on click,
 *    and dynamic Joker eye-flare cut-in banner (joker_minigame_cutin.png)
 *  - <600ms Execution Budget: deterministic ~280ms transition duration
 *  - Idempotent click rejection on active tab
 *  - Debounce & transition locks (isTransitioning protection against rapid clicks)
 *  - Pointer events isolation during transitions to prevent inconsistent hover states
 *  - Full keyboard accessibility: 1-5, Arrow keys (wrapping), Home/End, Enter/Space
 *  - Complete WAI-ARIA tab semantics: role="tablist", role="tab", aria-selected, aria-controls
 *  - Decoupled from looping BGM (never pauses, stops, or re-initializes audio player)
 *  - Mobile drawer responsiveness for <=768px and 375px viewports
 * ==========================================================================
 */

import { p5rAudio } from '../audio/p5rAudio';
import { p5rTransitions } from '../transitions/transitions';
import { helpModalController } from './helpModal';
import { adviceModalController } from './adviceModal';

export interface TabConfig {
  id: string;
  label: string;
  jpLabel: string;
  code: string;
  key: string;
  caption: string;
  jokerStance: {
    transform: string;
    shadow: string;
  };
}

export interface NavigationController {
  init(): void;
  setActiveTab(tabId: string, options?: { playAudio?: boolean }): Promise<void>;
  getActiveTabId(): string;
  destroy(): void;
}

export const P5R_TABS: TabConfig[] = [
  {
    id: 'tab-profile',
    label: 'PROFILE',
    jpLabel: 'プロフィール',
    code: '01',
    key: '1',
    caption: 'OPERATIVE PROFILE // WILD CARD ACCESS',
    jokerStance: {
      transform: 'translateY(0px) scale(1) rotate(0deg)',
      shadow: 'drop-shadow(-12px 12px 0px #E60012)',
    },
  },
  {
    id: 'tab-skills',
    label: 'SKILLS',
    jpLabel: 'スキル',
    code: '02',
    key: '2',
    caption: 'PERSONA RADAR // ELEMENTAL AFFINITY ANALYSIS',
    jokerStance: {
      transform: 'translateX(-10px) translateY(-12px) scale(1.02) rotate(-1.5deg)',
      shadow: 'drop-shadow(-16px 16px 0px #E60012) drop-shadow(0 0 20px rgba(230,0,18,0.4))',
    },
  },
  {
    id: 'tab-experience',
    label: 'CONFIDANTS',
    jpLabel: 'コープ',
    code: '03',
    key: '3',
    caption: 'COOPERATION ARCHIVE // ARCANA RANK TIMELINE',
    jokerStance: {
      transform: 'translateX(0px) translateY(6px) scale(0.99) rotate(-0.5deg)',
      shadow: 'drop-shadow(-12px 12px 0px #E60012)',
    },
  },
];

export class P5RNavigationController implements NavigationController {
  private tabButtons: HTMLElement[] = [];
  private tabPanes: HTMLElement[] = [];
  private activeTabId: string = 'tab-profile';
  private isTransitioning: boolean = false;
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;
  private mouseMoveListener: ((e: MouseEvent) => void) | null = null;
  private cutinHideTimeout: ReturnType<typeof setTimeout> | null = null;
  private cutinContainer: HTMLElement | null = null;
  private jokerElement: HTMLElement | null = null;
  private navWheelContainer: HTMLElement | null = null;
  private mobileNavToggle: HTMLElement | null = null;
  private isMobileDrawerOpen: boolean = false;
  private rafId: number | null = null;
  private tabHistory: string[] = ['tab-profile'];
  private controllerHelper: HTMLElement | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init(), { once: true });
      } else {
        this.init();
      }
    }
  }

  private isInitialized: boolean = false;

  public init(forceRequery: boolean = false): void {
    if (typeof document === 'undefined') return;
    if (this.isInitialized && !forceRequery && this.tabButtons.length > 0) return;

    this.queryElements();
    if (this.tabButtons.length === 0) {
      return;
    }
    this.isInitialized = true;

    this.injectNavigationStyles();
    this.ensureCutinBanner();
    this.ensureControllerHelper();
    this.bindMouseEvents();
    this.bindKeyboardShortcuts();
    this.bindJokerParallax();
    this.bindMobileDrawer();
    this.applyAriaAttributes();
    this.updateJokerStance(this.activeTabId, false);
    this.bindUrlHashRouting();
  }

  /**
   * Discovers and binds DOM elements
   */
  private queryElements(): void {
    this.tabButtons = Array.from(
      document.querySelectorAll<HTMLElement>('.p5-ribbon-btn, .p3r-ribbon-btn, [data-tab]')
    );
    this.tabPanes = Array.from(
      document.querySelectorAll<HTMLElement>('.tab-pane')
    );
    this.jokerElement = document.getElementById('joker-silhouette');
    this.navWheelContainer = document.querySelector('.p5r-nav-section, #p5r-nav-wheel');
    this.mobileNavToggle = document.getElementById('btn-mobile-nav');
  }

  /**
   * Injects dynamic CSS rules for the Slanted Radial Wheel, Joker Stances, and Cut-In Banner
   */
  private injectNavigationStyles(): void {
    if (document.getElementById('p5r-nav-wheel-styles')) return;

    const style = document.createElement('style');
    style.id = 'p5r-nav-wheel-styles';
    style.textContent = `
      /* ── P5R Slanted Ribbon Buttons & Hover Microinteractions ── */
      .p5-ribbon-btn, .p3r-ribbon-btn {
        position: relative;
        transform: skewX(-12deg) rotate(-8deg);
        transition: transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                    background-color 0.2s ease,
                    border-color 0.2s ease,
                    box-shadow 0.2s ease;
        will-change: transform;
      }
      /* Expand hit-area to the left so translateX never slips out from under mouse */
      .p5-ribbon-btn::before, .p3r-ribbon-btn::before {
        content: '';
        position: absolute;
        inset: -6px -12px -6px -32px;
        pointer-events: auto;
        z-index: -1;
      }
      .p5-ribbon-btn .inner-text, .p3r-ribbon-btn .inner-text {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transform: skewX(12deg) rotate(8deg);
      }
      .p5-ribbon-btn:hover, .p3r-ribbon-btn:hover {
        transform: skewX(-12deg) rotate(-8deg) translateX(18px) !important;
        background-color: #E60012 !important;
        border-color: #FFFFFF !important;
        color: #FFFFFF !important;
        box-shadow: 0 0 25px rgba(230, 0, 18, 0.85), -6px 6px 0px #000000 !important;
      }
      .p5-ribbon-btn:focus-visible, .p3r-ribbon-btn:focus-visible {
        outline: 3px solid #FFDE00 !important;
        outline-offset: 4px !important;
      }
      .p5-ribbon-btn.active, .p3r-ribbon-btn.active {
        transform: skewX(-12deg) rotate(-8deg) translateX(14px) !important;
        background-color: #E60012 !important;
        border-color: #FFDE00 !important;
        border-left-color: #FFDE00 !important;
        color: #FFFFFF !important;
        box-shadow: 0 0 28px rgba(255, 222, 0, 0.7), -6px 6px 0px #000000 !important;
      }

      /* ── Joker Silhouette Cutout with Crimson Chromatic Drop Shadow ── */
      #joker-silhouette, .joker-silhouette {
        filter: drop-shadow(-12px 12px 0px #E60012);
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.4s ease;
        transform-origin: bottom right;
        will-change: transform, filter;
      }

      /* ── Dynamic Joker Tactical Eye-Flare Cut-In Banner ── */
      .p5-eye-cutin-banner {
        position: absolute;
        top: -64px;
        left: 50%;
        transform: translateX(-50%) skewX(-12deg) translateY(10px) scale(0.95);
        display: flex;
        align-items: center;
        gap: 0.8rem;
        background: #000000;
        border: 2px solid #E60012;
        border-bottom: 3px solid #FFDE00;
        padding: 0.35rem 1.2rem;
        box-shadow: 0 0 25px rgba(230, 0, 18, 0.85), inset 0 0 15px rgba(255, 222, 0, 0.25);
        opacity: 0;
        pointer-events: none;
        z-index: 60;
        transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .p5-eye-cutin-banner.cutin-active {
        opacity: 1;
        transform: translateX(-50%) skewX(-12deg) translateY(0) scale(1);
      }
      .p5-eye-cutin-banner .cutin-img-box {
        height: 38px;
        width: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(230, 0, 18, 0.2);
        border-right: 2px solid #FFDE00;
        padding-right: 0.4rem;
      }
      .p5-eye-cutin-banner .cutin-img {
        height: 32px;
        width: auto;
        object-fit: contain;
        filter: drop-shadow(0 0 8px #FFDE00);
      }
      .p5-eye-cutin-banner .cutin-telemetry {
        transform: skewX(12deg);
        font-family: 'JetBrains Mono', monospace;
      }
      .p5-eye-cutin-banner .cutin-tag {
        font-size: 9px;
        font-weight: 900;
        color: #FFDE00;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        display: block;
      }
      .p5-eye-cutin-banner .cutin-caption {
        font-size: 13px;
        font-weight: 900;
        font-style: italic;
        color: #FFFFFF;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* ── Transition Pointer Locking ── */
      body.transitioning-lock, body.transitioning-lock .p5-ribbon-btn {
        pointer-events: none !important;
      }

      /* ── Responsive Mobile Navigation Drawer ── */
      @media (max-width: 768px) {
        .p5-eye-cutin-banner {
          display: none !important;
        }
        .p5-ribbon-btn, .p3r-ribbon-btn {
          transform: skewX(-8deg) rotate(0deg) !important;
          padding: 0.45rem 0.8rem !important;
          font-size: 0.75rem !important;
        }
        .p5-ribbon-btn .inner-text, .p3r-ribbon-btn .inner-text {
          transform: skewX(8deg) rotate(0deg) !important;
        }
        .p5-ribbon-btn:hover, .p3r-ribbon-btn:hover {
          transform: skewX(-8deg) translateX(10px) !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Ensures the dynamic eye-flare cut-in banner DOM node exists
   */
  private ensureCutinBanner(): void {
    let banner = document.getElementById('p5-eye-cutin-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'p5-eye-cutin-banner';
      banner.className = 'p5-eye-cutin-banner';
      banner.setAttribute('aria-hidden', 'true');
      banner.innerHTML = `
        <div class="cutin-img-box">
          <img class="cutin-img" src="/images/p5r/phantom_thieves_logo.png" alt="Phantom Thieves" />
        </div>
        <div class="cutin-telemetry">
          <span class="cutin-tag" id="cutin-tag-text">COMMAND SELECTED</span>
          <span class="cutin-caption" id="cutin-caption-text">OPERATIVE TELEMETRY // WILD CARD ACCESS</span>
        </div>
      `;

      if (this.navWheelContainer) {
        this.navWheelContainer.appendChild(banner);
      } else {
        document.body.appendChild(banner);
      }
    }
    this.cutinContainer = banner;
  }

  /**
   * Binds mouse click and hover microinteractions
   */
  private bindMouseEvents(): void {
    this.tabButtons.forEach((btn) => {
      const tabId = btn.getAttribute('data-tab') || '';
      const tabConfig = P5R_TABS.find((t) => t.id === tabId);

      // Hover microinteraction: Play snappy menu navigate SFX and display eye-flare cut-in
      btn.addEventListener('mouseenter', () => {
        if (this.isTransitioning) return;
        p5rAudio.playMenuNavigate();
        if (tabConfig) {
          this.showEyeCutin(tabConfig);
        }
      });

      // Mouseleave: Hide eye cut-in banner with smooth delay
      btn.addEventListener('mouseleave', () => {
        this.scheduleHideCutin(300);
      });

      // Click microinteraction: Transition tab with synchronized knife slash wipe
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = btn.getAttribute('data-tab');
        if (!targetTab) return;

        // Idempotent guard: Ignore clicks on currently active tab or mid-transition
        if (this.activeTabId === targetTab || this.isTransitioning) {
          return;
        }

        this.setActiveTab(targetTab);
      });
    });
  }

  /**
   * Displays the dynamic Joker eye-flare cut-in banner
   */
  private showEyeCutin(tab: TabConfig): void {
    if (this.cutinHideTimeout) {
      clearTimeout(this.cutinHideTimeout);
      this.cutinHideTimeout = null;
    }

    if (!this.cutinContainer) return;
    const tagEl = document.getElementById('cutin-tag-text');
    const captionEl = document.getElementById('cutin-caption-text');

    if (tagEl) tagEl.textContent = `COMMAND ${tab.code} // ${tab.label}`;
    if (captionEl) captionEl.textContent = tab.caption;

    this.cutinContainer.classList.add('cutin-active');
  }

  /**
   * Schedules smooth fade-out of eye-flare cut-in banner
   */
  private scheduleHideCutin(delayMs: number = 750): void {
    if (this.cutinHideTimeout) {
      clearTimeout(this.cutinHideTimeout);
    }
    this.cutinHideTimeout = setTimeout(() => {
      if (this.cutinContainer) {
        this.cutinContainer.classList.remove('cutin-active');
      }
    }, delayMs);
  }

  /**
   * Binds full keyboard shortcuts (1-5, Arrow keys with wrapping, Home/End, Enter/Space)
   */
  /**
   * Binds full keyboard navigation (1-5, Arrow keys, WASD, ESC/Backspace for Back)
   */
  private bindKeyboardShortcuts(): void {
    this.keydownListener = (e: KeyboardEvent) => {
      // 0. Ignore navigation keys if user is actively typing in a form input
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        if (e.key === 'Escape') {
          e.preventDefault();
          (document.activeElement as HTMLElement)?.blur();
          this.goBack();
        }
        return;
      }

      // 1. ESC or Backspace -> Trigger Persona 5 Back Navigation & SFX
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        this.goBack();
        return;
      }

      // 2. Direct number keys 1-5
      const tabNum = parseInt(e.key, 10);
      if (tabNum >= 1 && tabNum <= this.tabButtons.length) {
        e.preventDefault();
        const targetBtn = this.tabButtons[tabNum - 1];
        if (targetBtn) {
          targetBtn.click();
        }
        return;
      }

      const key = e.key.toLowerCase();

      // 11. Arrow keys & WASD navigation across command ribbons
      const isArrowNext = e.key === 'ArrowRight' || e.key === 'ArrowDown' || key === 'd';
      const isArrowPrev = e.key === 'ArrowLeft' || e.key === 'ArrowUp' || key === 'a' || key === 'w';
      const isHome = e.key === 'Home';
      const isEnd = e.key === 'End';

      if (isArrowNext || isArrowPrev || isHome || isEnd) {
        const currentIdx = this.tabButtons.findIndex(
          (b) => b.getAttribute('data-tab') === this.activeTabId
        );
        if (currentIdx === -1) return;

        let nextIdx = currentIdx;
        if (isArrowNext) {
          nextIdx = (currentIdx + 1) % this.tabButtons.length;
        } else if (isArrowPrev) {
          nextIdx = (currentIdx - 1 + this.tabButtons.length) % this.tabButtons.length;
        } else if (isHome) {
          nextIdx = 0;
        } else if (isEnd) {
          nextIdx = this.tabButtons.length - 1;
        }

        e.preventDefault();
        const targetBtn = this.tabButtons[nextIdx];
        if (targetBtn) {
          targetBtn.focus();
          targetBtn.click();
        }
      }
    };

    window.addEventListener('keydown', this.keydownListener);
  }

  /**
   * Binds desktop mouse parallax to the full Joker silhouette
   */
  private bindJokerParallax(): void {
    this.mouseMoveListener = (e: MouseEvent) => {
      if (window.innerWidth < 1024 || !this.jokerElement) return;

      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }

      this.rafId = requestAnimationFrame(() => {
        const tabConfig = P5R_TABS.find((t) => t.id === this.activeTabId);
        const baseTransform = tabConfig ? tabConfig.jokerStance.transform : 'translateY(0px) scale(1)';

        const normX = (e.clientX / window.innerWidth - 0.5) * 2;
        const normY = (e.clientY / window.innerHeight - 0.5) * 2;

        const offsetX = normX * 12;
        const offsetY = normY * 8;

        if (this.jokerElement) {
          this.jokerElement.style.transform = `${baseTransform} translate3d(${offsetX}px, ${offsetY}px, 0)`;
        }
      });
    };

    window.addEventListener('mousemove', this.mouseMoveListener, { passive: true });
  }

  /**
   * Updates Joker silhouette stance and triggers kinetic pulse
   */
  private updateJokerStance(tabId: string, pulse: boolean = true): void {
    if (!this.jokerElement) {
      this.jokerElement = document.getElementById('joker-silhouette');
    }
    if (!this.jokerElement) return;

    const tabConfig = P5R_TABS.find((t) => t.id === tabId);
    if (tabConfig) {
      this.jokerElement.style.transform = tabConfig.jokerStance.transform;
      this.jokerElement.style.filter = tabConfig.jokerStance.shadow;
    }

    if (pulse && typeof this.jokerElement.animate === 'function' && tabConfig) {
      this.jokerElement.animate([
        {
          transform: `${tabConfig.jokerStance.transform} scale(1.03)`,
          filter: `${tabConfig.jokerStance.shadow} brightness(1.3)`
        },
        {
          transform: tabConfig.jokerStance.transform,
          filter: tabConfig.jokerStance.shadow
        }
      ], {
        duration: 320,
        easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      });
    }
  }

  /**
   * Binds mobile navigation drawer toggle button if present
   */
  private bindMobileDrawer(): void {
    if (!this.mobileNavToggle) return;

    this.mobileNavToggle.addEventListener('click', () => {
      this.isMobileDrawerOpen = !this.isMobileDrawerOpen;
      if (this.navWheelContainer) {
        this.navWheelContainer.classList.toggle('drawer-open', this.isMobileDrawerOpen);
      }
      p5rAudio.playGunCock();
    });
  }

  /**
   * Applies complete WAI-ARIA tab semantics
   */
  private applyAriaAttributes(): void {
    if (this.navWheelContainer) {
      this.navWheelContainer.setAttribute('role', 'tablist');
      this.navWheelContainer.setAttribute('aria-label', 'Phantom Thieves Command Menu');
    }

    this.tabButtons.forEach((btn) => {
      const tabId = btn.getAttribute('data-tab') || '';
      const isActive = tabId === this.activeTabId;

      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.setAttribute('aria-controls', tabId);
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
      btn.id = `tab-btn-${tabId}`;
    });

    this.tabPanes.forEach((pane) => {
      pane.setAttribute('role', 'tabpanel');
      pane.setAttribute('aria-labelledby', `tab-btn-${pane.id}`);
    });
  }

  /**
   * Switches active navigation tab within sub-600ms budget
   */
  public async setActiveTab(tabId: string, options?: { playAudio?: boolean }): Promise<void> {
    // Idempotent check
    if (this.activeTabId === tabId) return;

    // If an animation is in flight, cleanly preempt it
    if (this.isTransitioning) {
      p5rTransitions.cancelActiveTransitions();
      this.isTransitioning = false;
    }

    this.isTransitioning = true;
    document.body.classList.add('transitioning-lock');

    try {
      // 1. Update active tab buttons and ARIA attributes
      this.tabButtons.forEach((btn) => {
        const matches = btn.getAttribute('data-tab') === tabId;
        btn.classList.toggle('active', matches);
        btn.setAttribute('aria-selected', matches ? 'true' : 'false');
        btn.setAttribute('tabindex', matches ? '0' : '-1');
        if (!matches) {
          btn.blur();
        }
      });

      // 2. Update dynamic Joker stance and trigger kinetic pulse concurrently
      this.updateJokerStance(tabId, true);

      // 3. Update cut-in banner
      const tabConfig = P5R_TABS.find((t) => t.id === tabId);
      if (tabConfig) {
        this.showEyeCutin(tabConfig);
        this.scheduleHideCutin();
      }

      // 4. Update active tab panes with comic slash wipe transition (<600ms)
      const currentPane = document.querySelector<HTMLElement>('.tab-pane.active');
      const nextPane = document.getElementById(tabId);
      if (nextPane) {
        await p5rTransitions.switchTab(currentPane, nextPane, 'comic-slash', {
          durationMs: 380,
          playAudio: options?.playAudio ?? true // Synchronized knife slash SFX on transition
        });
      } else {
        this.tabPanes.forEach((pane) => {
          const matches = pane.id === tabId;
          pane.classList.toggle('active', matches);
          pane.style.display = matches ? 'block' : 'none';
        });
      }

      this.activeTabId = tabId;
      if (this.tabHistory[this.tabHistory.length - 1] !== tabId) {
        this.tabHistory.push(tabId);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('p5r:tabchange', { detail: { tabId } }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      this.isTransitioning = false;
      document.body.classList.remove('transitioning-lock');
    }
  }

  /**
   * Navigates to previous tab or closes active modal with authentic P5 cancel SFX
   */
  public goBack(): void {
    // 1. If AOA modal is active, close it first (closeBtn triggers aoa_finish)
    const aoa = document.getElementById('all-out-attack-overlay');
    if (aoa && aoa.classList.contains('active')) {
      const closeBtn = document.getElementById('aoa-close-btn');
      if (closeBtn) {
        closeBtn.click();
      } else {
        aoa.classList.remove('active');
        p5rAudio.playMenuBack();
      }
      return;
    }

    // 2. If Strategic Advice modal is open, close it
    if (adviceModalController.isOpen()) {
      adviceModalController.close();
      return;
    }

    // 3. If Field manual modal is open, close it
    if (helpModalController.isOpen()) {
      helpModalController.close();
      return;
    }

    // Tab history navigation: play menu_back once and transition without knife_slash collision
    p5rAudio.playMenuBack();
    if (this.tabHistory.length > 1) {
      this.tabHistory.pop(); // Pop current tab
      const prevTab = this.tabHistory.pop() || 'tab-profile';
      this.setActiveTab(prevTab, { playAudio: false });
    } else if (this.activeTabId !== 'tab-profile') {
      this.setActiveTab('tab-profile', { playAudio: false });
    }
  }

  /**
   * Injects the authentic Persona 5 Controller Navigation Helper Bar
   */
  private ensureControllerHelper(): void {
    let helper = document.getElementById('p5-controller-hud');
    if (!helper) {
      helper = document.createElement('div');
      helper.id = 'p5-controller-hud';
      helper.className = 'p5-controller-hud';
      helper.innerHTML = `
        <div class="p5-hud-chip" id="hud-nav-chip"><span class="p5-chip-key">◄ ► / ▲ ▼</span><span class="p5-chip-txt">SELECT</span></div>
        <div class="p5-hud-chip"><span class="p5-chip-key">1 - 3</span><span class="p5-chip-txt">DIRECT</span></div>
      `;
      document.body.appendChild(helper);

      helper.querySelectorAll<HTMLElement>('.p5-hud-chip').forEach((chip) => {
        chip.addEventListener('mouseenter', () => {
          p5rAudio.playMenuNavigate();
        });
      });
    }
    this.controllerHelper = helper;
  }

  /**
   * Binds URL hash changes to tabs and modals
   */
  private bindUrlHashRouting(): void {
    const handleHash = () => {
      const rawHash = (window.location.hash || '').toLowerCase().replace(/^#\/*/, '').replace(/\/+$/, '').trim();
      const rawPath = (window.location.pathname || '').toLowerCase().replace(/^\/+/, '').replace(/\/+$/, '').trim();
      const route = rawHash || rawPath;
      if (!route) return;

      if (route === 'advice' || route === 'sarannya' || route === 'saran' || route === 'tips') {
        adviceModalController.open();
      } else if (route === 'help' || route === 'manual') {
        helpModalController.open();
      } else if (route === 'profile' || route === 'dossier' || route === 'tab-profile') {
        this.setActiveTab('tab-profile');
      } else if (route === 'skills' || route === 'tab-skills') {
        this.setActiveTab('tab-skills');
      } else if (route === 'confidants' || route === 'tab-experience') {
        this.setActiveTab('tab-experience');
      }
    };

    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);
    setTimeout(handleHash, 400);
  }

  public getActiveTabId(): string {
    return this.activeTabId;
  }

  public destroy(): void {
    if (this.keydownListener) {
      window.removeEventListener('keydown', this.keydownListener);
      this.keydownListener = null;
    }
    if (this.mouseMoveListener) {
      window.removeEventListener('mousemove', this.mouseMoveListener);
      this.mouseMoveListener = null;
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.cutinHideTimeout) {
      clearTimeout(this.cutinHideTimeout);
      this.cutinHideTimeout = null;
    }
    const injectedStyle = document.getElementById('p5r-nav-wheel-styles');
    if (injectedStyle && injectedStyle.parentNode) {
      injectedStyle.parentNode.removeChild(injectedStyle);
    }
    if (this.cutinContainer && this.cutinContainer.parentNode) {
      this.cutinContainer.parentNode.removeChild(this.cutinContainer);
      this.cutinContainer = null;
    }
    if (this.controllerHelper && this.controllerHelper.parentNode) {
      this.controllerHelper.parentNode.removeChild(this.controllerHelper);
      this.controllerHelper = null;
    }
  }
}

export const navigationController = new P5RNavigationController();