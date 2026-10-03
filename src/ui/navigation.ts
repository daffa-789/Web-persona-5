/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - SLANTED COMMAND RIBBON NAVIGATION
 * File: src/ui/navigation.ts
 *
 * Owns the ribbon tabs, the Joker stance/parallax, the eye-flare cut-in and
 * the dismissal hierarchy. All motion is delegated to the Motion Director:
 *
 *  - tab switch          SLASH-CUT  (director.switchTab)
 *  - keyboard step       1-step ribbon snap + throttled menu_navigate
 *  - active tab marker   gold slash mark through the ribbon, never underline
 *  - ESC / Backspace     KINETIC-EXIT through the modal hierarchy
 *
 * Invariants kept: skewX(-12deg) rotate(-8deg) geometry, unskewed inner text,
 * translateX(18px) hover with the extended hit-area buffer, WAAPI stance pulse,
 * ARIA tablist semantics, hash routing, decoupling from the looping BGM.
 * ==========================================================================
 */

import { p5rAudio } from '../audio/p5rAudio';
import { MOTION, p5rTransitions, prefersReducedMotion, type P5RTransitionType } from '../transitions/transitions';
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
  setActiveTab(tabId: string, options?: { playAudio?: boolean; variant?: P5RTransitionType }): Promise<void>;
  getActiveTabId(): string;
  goBack(): void;
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
      shadow: 'drop-shadow(-16px 16px 0px #E60012)',
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

/** Injected as markup so the slash mark can sit behind the label without a stacking-context fight. */
const SLASH_MARKUP = '<span class="p5-tab-slash" aria-hidden="true"></span>';

const BACK_MARKUP = `
  <span class="p5-back-face">
    <img class="p5-back-icon" src="/images/p5r/ui/p5-chevron-tip.svg" alt="" />
    <span class="p5-back-label">BACK</span>
    <span class="p5-back-key">ESC</span>
  </span>`;

export class P5RNavigationController {
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
  private backButton: HTMLElement | null = null;
  private isInitialized: boolean = false;
  /** Elements whose listeners are already installed (init runs more than once). */
  private readonly bound = new WeakSet<Element>();
  private hashListener: (() => void) | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init(), { once: true });
      } else {
        this.init();
      }
    }
  }

  public init(forceRequery: boolean = false): void {
    if (typeof document === 'undefined') return;
    if (this.isInitialized && !forceRequery && this.tabButtons.length > 0) return;

    this.queryElements();
    if (this.tabButtons.length === 0) {
      return;
    }
    if (this.isInitialized) this.unbindListeners();
    this.isInitialized = true;

    this.decorateRibbons();
    this.ensureCutinBanner();
    this.ensureControllerHelper();
    this.ensureBackButton();
    this.bindMouseEvents();
    this.bindKeyboardShortcuts();
    this.bindJokerParallax();
    this.bindMobileDrawer();
    this.applyAriaAttributes();
    this.updateJokerStance(this.activeTabId, false);
    this.bindUrlHashRouting();
  }

  /** Discovers and binds DOM elements */
  private queryElements(): void {
    this.tabButtons = Array.from(
      document.querySelectorAll<HTMLElement>('.p5-ribbon-btn, .p3r-ribbon-btn, [data-tab]')
    );
    this.tabPanes = Array.from(document.querySelectorAll<HTMLElement>('.tab-pane'));
    this.jokerElement = document.getElementById('joker-silhouette');
    this.navWheelContainer = document.querySelector('.p5r-nav-section, #p5r-nav-wheel');
    this.mobileNavToggle = document.getElementById('btn-mobile-nav');
  }

  /**
   * Adds the gold slash mark that marks the active tab. An underline is not a
   * Persona 5 affordance: the marker has to cut *through* the ribbon.
   */
  private decorateRibbons(): void {
    this.tabButtons.forEach((btn) => {
      if (btn.querySelector('.p5-tab-slash')) return;
      btn.insertAdjacentHTML('afterbegin', SLASH_MARKUP);
    });
  }

  /** Ensures the dynamic eye-flare cut-in banner DOM node exists */
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

  /** Injects the authentic Persona 5 Back Button if the shell omitted it */
  private ensureBackButton(): void {
    let btn = document.getElementById('p5-back-btn') as HTMLButtonElement | null;
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'p5-back-btn';
      btn.type = 'button';
      btn.className = 'p5-back-btn';
      btn.setAttribute('aria-label', 'Back');
      btn.innerHTML = BACK_MARKUP;
      document.body.appendChild(btn);
    }
    if (!this.bound.has(btn)) {
      this.bound.add(btn);
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.goBack();
      });
    }
    this.backButton = btn;
  }

  /** Injects the controller prompt strip (also the Field Manual launcher) */
  private ensureControllerHelper(): void {
    let helper = document.getElementById('p5-controller-hud');
    if (!helper) {
      helper = document.createElement('div');
      helper.id = 'p5-controller-hud';
      helper.className = 'p5-controller-hud';
      helper.setAttribute('role', 'note');
      helper.innerHTML = `
        <div class="p5-hud-chip" id="hud-nav-chip"><span class="p5-chip-key">&#9668; &#9658; / &#9650; &#9660;</span><span class="p5-chip-txt">SELECT</span></div>
        <div class="p5-hud-chip"><span class="p5-chip-key">1 - 3</span><span class="p5-chip-txt">DIRECT</span></div>
        <div class="p5-hud-chip p5-hud-back-chip"><span class="p5-chip-key red">ESC</span><span class="p5-chip-txt">BACK</span></div>
      `;
      document.body.appendChild(helper);

      helper.querySelectorAll<HTMLElement>('.p5-hud-chip').forEach((chip) => {
        chip.addEventListener('mouseenter', () => p5rAudio.playMenuNavigate());
      });
    }
    this.controllerHelper = helper;
  }

  /** Binds mouse click and hover microinteractions.
   *  init() runs from both the constructor and bootstrap's forced requery, so
   *  every per-element listener is guarded: a double-bound click starts two
   *  transitions and the second one preempts the first mid-wipe. */
  private bindMouseEvents(): void {
    this.tabButtons.forEach((btn) => {
      if (this.bound.has(btn)) return;
      this.bound.add(btn);

      const tabId = btn.getAttribute('data-tab') || '';
      const tabConfig = P5R_TABS.find((t) => t.id === tabId);

      btn.addEventListener('mouseenter', () => {
        if (this.isTransitioning) return;
        p5rAudio.playMenuNavigate();
        if (tabConfig) this.showEyeCutin(tabConfig);
      });

      btn.addEventListener('mouseleave', () => this.scheduleHideCutin(300));

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = btn.getAttribute('data-tab');
        if (!targetTab) return;
        if (this.activeTabId === targetTab || this.isTransitioning) return;
        void this.setActiveTab(targetTab);
      });
    });
  }

  /** Displays the dynamic Joker eye-flare cut-in banner */
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

  /** Schedules the cut-in banner's kinetic retraction */
  private scheduleHideCutin(delayMs: number = 750): void {
    if (this.cutinHideTimeout) clearTimeout(this.cutinHideTimeout);
    this.cutinHideTimeout = setTimeout(() => {
      this.cutinContainer?.classList.remove('cutin-active');
    }, delayMs);
  }

  /**
   * Keyboard + controller navigation. Ribbon steps snap one position at a time
   * with a throttled navigate cue; ESC/Backspace runs the dismissal hierarchy.
   */
  private bindKeyboardShortcuts(): void {
    this.keydownListener = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        if (e.key === 'Escape') {
          e.preventDefault();
          (document.activeElement as HTMLElement)?.blur();
          this.goBack();
        }
        return;
      }

      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        this.goBack();
        return;
      }

      const tabNum = parseInt(e.key, 10);
      if (tabNum >= 1 && tabNum <= this.tabButtons.length) {
        e.preventDefault();
        const targetBtn = this.tabButtons[tabNum - 1];
        if (targetBtn) this.triggerButton(targetBtn);
        return;
      }

      const key = e.key.toLowerCase();
      const isNext = e.key === 'ArrowRight' || e.key === 'ArrowDown' || key === 'd' || key === 's';
      const isPrev = e.key === 'ArrowLeft' || e.key === 'ArrowUp' || key === 'a' || key === 'w';

      if (!isNext && !isPrev && e.key !== 'Home' && e.key !== 'End') return;
      if (this.isTransitioning) return;

      const currentIdx = this.tabButtons.findIndex((b) => b.getAttribute('data-tab') === this.activeTabId);
      if (currentIdx === -1) return;

      let nextIdx = currentIdx;
      if (isNext) nextIdx = (currentIdx + 1) % this.tabButtons.length;
      else if (isPrev) nextIdx = (currentIdx - 1 + this.tabButtons.length) % this.tabButtons.length;
      else if (e.key === 'Home') nextIdx = 0;
      else if (e.key === 'End') nextIdx = this.tabButtons.length - 1;

      e.preventDefault();
      const targetBtn = this.tabButtons[nextIdx];
      if (!targetBtn) return;

      // A keyboard step always moves focus, and the ribbon snaps one step even
      // when the target is already the active tab.
      targetBtn.focus({ preventScroll: true });
      p5rTransitions.snap(targetBtn, isNext ? 1 : -1);
      p5rAudio.playMenuNavigate();
      if (nextIdx !== currentIdx) this.triggerButton(targetBtn);
    };

    window.addEventListener('keydown', this.keydownListener);
  }

  private triggerButton(btn: HTMLElement): void {
    const tabId = btn.getAttribute('data-tab');
    if (!tabId || tabId === this.activeTabId) return;
    void this.setActiveTab(tabId);
  }

  /** Binds desktop mouse parallax to the full Joker silhouette */
  private bindJokerParallax(): void {
    this.mouseMoveListener = (e: MouseEvent) => {
      if (window.innerWidth < 1024 || !this.jokerElement) return;
      if (prefersReducedMotion()) return;

      if (this.rafId) cancelAnimationFrame(this.rafId);

      this.rafId = requestAnimationFrame(() => {
        if (!this.jokerElement) return;
        const tabConfig = P5R_TABS.find((t) => t.id === this.activeTabId);
        const base = tabConfig ? tabConfig.jokerStance.transform : 'translateY(0px) scale(1)';
        const normX = (e.clientX / window.innerWidth - 0.5) * 2;
        const normY = (e.clientY / window.innerHeight - 0.5) * 2;
        // Parallax is skipped while the stance pulse owns the transform.
        if (this.jokerElement.getAnimations().length > 0) return;
        this.jokerElement.style.transform = `${base} translate3d(${normX * 12}px, ${normY * 8}px, 0)`;
      });
    };

    window.addEventListener('mousemove', this.mouseMoveListener, { passive: true });
  }

  /**
   * Joker stance. Driven by element.animate() so the committed rotation and
   * offset survive: a CSS keyframe here would reset the transform.
   */
  private updateJokerStance(tabId: string, pulse: boolean = true): void {
    if (!this.jokerElement) this.jokerElement = document.getElementById('joker-silhouette');
    if (!this.jokerElement) return;

    const tabConfig = P5R_TABS.find((t) => t.id === tabId);
    if (!tabConfig) return;

    this.jokerElement.style.transform = tabConfig.jokerStance.transform;
    this.jokerElement.style.filter = tabConfig.jokerStance.shadow;

    if (!pulse || prefersReducedMotion() || typeof this.jokerElement.animate !== 'function') return;

    this.jokerElement
      .animate(
        [
          {
            transform: `${tabConfig.jokerStance.transform} scale(1.03)`,
            filter: `${tabConfig.jokerStance.shadow} brightness(1.3)`
          },
          { transform: tabConfig.jokerStance.transform, filter: tabConfig.jokerStance.shadow }
        ],
        { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'none' }
      )
      .finished.catch(() => undefined);
  }

  /** Binds mobile navigation drawer toggle button if present */
  private bindMobileDrawer(): void {
    if (!this.mobileNavToggle || this.bound.has(this.mobileNavToggle)) return;
    this.bound.add(this.mobileNavToggle);
    this.mobileNavToggle.addEventListener('click', () => {
      this.isMobileDrawerOpen = !this.isMobileDrawerOpen;
      this.navWheelContainer?.classList.toggle('drawer-open', this.isMobileDrawerOpen);
      p5rAudio.playGunCock();
    });
  }

  /** Applies complete WAI-ARIA tab semantics */
  private applyAriaAttributes(): void {
    this.navWheelContainer?.setAttribute('role', 'tablist');
    this.navWheelContainer?.setAttribute('aria-label', 'Phantom Thieves Command Menu');

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

  /** Switches active navigation ribbon through the Motion Director */
  public async setActiveTab(
    tabId: string,
    options: { playAudio?: boolean; variant?: P5RTransitionType } = {}
  ): Promise<void> {
    if (this.activeTabId === tabId) return;

    if (this.isTransitioning) {
      p5rTransitions.cancelActiveTransitions();
      this.isTransitioning = false;
    }

    this.isTransitioning = true;
    document.body.classList.add('transitioning-lock');

    try {
      this.tabButtons.forEach((btn) => {
        const matches = btn.getAttribute('data-tab') === tabId;
        btn.classList.toggle('active', matches);
        btn.setAttribute('aria-selected', matches ? 'true' : 'false');
        btn.setAttribute('tabindex', matches ? '0' : '-1');
        if (!matches) btn.blur();
      });

      this.updateJokerStance(tabId, true);

      const tabConfig = P5R_TABS.find((t) => t.id === tabId);
      if (tabConfig) {
        this.showEyeCutin(tabConfig);
        this.scheduleHideCutin();
      }

      const currentPane = document.querySelector<HTMLElement>('.tab-pane.active');
      const nextPane = document.getElementById(tabId);
      if (nextPane) {
        await p5rTransitions.switchTab(currentPane, nextPane, options.variant ?? 'slash-cut', {
          playAudio: options.playAudio ?? true
        });
      } else {
        this.tabPanes.forEach((pane) => {
          const matches = pane.id === tabId;
          pane.classList.toggle('active', matches);
          pane.style.display = matches ? 'block' : 'none';
        });
      }

      this.activeTabId = tabId;
      this.syncBackButton();
      if (this.tabHistory[this.tabHistory.length - 1] !== tabId) this.tabHistory.push(tabId);

      window.dispatchEvent(new CustomEvent('p5r:tabchange', { detail: { tabId } }));
    } finally {
      this.isTransitioning = false;
      document.body.classList.remove('transitioning-lock');
    }
  }

  /**
   * Dismissal hierarchy: AOA -> advice -> field manual -> tab history -> DOSSIER.
   * Each level closes through KINETIC-EXIT so the reverse wipe and menu_back
   * always line up, and the tab return reuses the same variant.
   */
  public goBack(): void {
    const aoa = document.getElementById('all-out-attack-overlay');
    if (aoa?.classList.contains('active')) {
      const closeBtn = document.getElementById('aoa-close-btn');
      if (closeBtn) {
        closeBtn.click();
      } else {
        void p5rTransitions.kineticExit({
          host: aoa,
          audio: 'aoa_finish',
          onCovered: () => aoa.classList.remove('active')
        });
      }
      return;
    }

    if (adviceModalController.isOpen()) {
      adviceModalController.close();
      return;
    }

    if (helpModalController.isOpen()) {
      helpModalController.close();
      return;
    }

    if (this.tabHistory.length > 1) {
      this.tabHistory.pop();
      const prev = this.tabHistory[this.tabHistory.length - 1] || 'tab-profile';
      void this.returnTo(prev);
    } else if (this.activeTabId !== 'tab-profile') {
      void this.returnTo('tab-profile');
    }
  }

  private async returnTo(tabId: string): Promise<void> {
    p5rAudio.playMenuBack();
    await this.setActiveTab(tabId, { playAudio: false, variant: 'slash-cut' });
  }

  private syncBackButton(): void {
    this.backButton?.classList.toggle('active-subpage', this.activeTabId !== 'tab-profile');
  }

  private unbindListeners(): void {
    if (this.keydownListener) {
      window.removeEventListener('keydown', this.keydownListener);
      this.keydownListener = null;
    }
    if (this.mouseMoveListener) {
      window.removeEventListener('mousemove', this.mouseMoveListener);
      this.mouseMoveListener = null;
    }
    if (this.hashListener) {
      window.removeEventListener('hashchange', this.hashListener);
      window.removeEventListener('popstate', this.hashListener);
      this.hashListener = null;
    }
  }

  /** Binds URL hash changes to tabs and modals (once per page) */
  private bindUrlHashRouting(): void {
    if (this.hashListener) return;
    const handleHash = (): void => {
      const rawHash = (window.location.hash || '')
        .toLowerCase()
        .replace(/^#\/*/, '')
        .replace(/\/+$/, '')
        .trim();
      const rawPath = (window.location.pathname || '')
        .toLowerCase()
        .replace(/^\/+/, '')
        .replace(/\/+$/, '')
        .trim();
      const route = rawHash || rawPath;
      if (!route) return;

      if (route === 'advice' || route === 'sarannya' || route === 'saran' || route === 'tips') {
        adviceModalController.open();
      } else if (route === 'help' || route === 'manual') {
        helpModalController.open();
      } else if (route === 'profile' || route === 'dossier' || route === 'tab-profile') {
        void this.setActiveTab('tab-profile');
      } else if (route === 'skills' || route === 'tab-skills') {
        void this.setActiveTab('tab-skills');
      } else if (route === 'confidants' || route === 'tab-experience') {
        void this.setActiveTab('tab-experience');
      }
    };

    this.hashListener = handleHash;
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);
    window.setTimeout(handleHash, MOTION.slashCut);
  }

  public getActiveTabId(): string {
    return this.activeTabId;
  }

  public destroy(): void {
    this.unbindListeners();
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.cutinHideTimeout) {
      clearTimeout(this.cutinHideTimeout);
      this.cutinHideTimeout = null;
    }
    this.cutinContainer?.remove();
    this.cutinContainer = null;
    this.controllerHelper?.remove();
    this.controllerHelper = null;
    this.backButton?.remove();
    this.backButton = null;
    this.tabButtons.forEach((btn) => btn.querySelector('.p5-tab-slash')?.remove());
    this.isInitialized = false;
  }
}

export const navigationController = new P5RNavigationController();
export { P5RNavigationController as P3RNavigationController };
