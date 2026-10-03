/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - MORGANA (MONA) TACTICAL FIELD NAVIGATOR
 * File: src/ui/monaNavigator.ts
 *
 * Implements the authentic Morgana companion dialogue box:
 *  - Persistent, non-intrusive tactical field advisor in bottom corner
 *  - Reactive dialogue responding to tab transitions, security alert, audio toggles
 *  - Interactive click tips cycling Phantom Thief lore and keyboard shortcuts
 *  - Collapsible/expandable with memory
 * ==========================================================================
 */

import { p5rAudio } from '../audio/p5rAudio';
import { p5CriticalSpark } from '../utils/p5Confetti';

export interface MonaNavigator {
  init(): void;
  say(message: string, priority?: boolean): void;
  onTabChange(tabId: string): void;
  onAlertChange(level: number): void;
  onAudioChange(muted: boolean): void;
  destroy(): void;
}

const TAB_MESSAGES: Record<string, string> = {
  'tab-profile': "Looking cool, Joker! Lead Unity Developer & 3D Technical Artist profile ready!",
  'tab-skills': "Check out those combat parameters! ST: 98 in Unity C# and AG: 99 in Blender Rigging... unstoppable synergy!",
  'tab-experience': "Rank 10 MAX Judgement with Sae! Your Unity & Blender production track record is formidable!"
};

const RANDOM_TIPS: string[] = [
  "Press [1-3] on your keyboard to instantly jump between sectors!",
  "Press [◄ / ►] or [A / D] to cycle command ribbons smoothly!",
  "Press [▲ / ▼] or [W / S] to explore the portfolio vertically!",
  "Press [T] to unleash Showtime All-Out Attack!",
  "Press [ESC] to quickly dismiss active modals and return through tabs!"
];

class MonaNavigatorImpl implements MonaNavigator {
  private containerEl: HTMLElement | null = null;
  private bubbleTextEl: HTMLElement | null = null;
  private bubbleWrapEl: HTMLElement | null = null;
  private avatarEl: HTMLElement | null = null;
  private breath: Animation | null = null;
  private isMinimized: boolean = false;
  private currentTipIndex: number = 0;
  private autoHideTimer: number | null = null;
  private initialGreetingTimer: number | null = null;

  public init(): void {
    if (typeof document === 'undefined') return;

    this.createDom();
    this.bindEvents();
    this.startIdleBreath();

    // Initial greeting after the entrance cinematic has released the viewport
    this.initialGreetingTimer = window.setTimeout(() => {
      this.say(TAB_MESSAGES['tab-profile']);
      this.initialGreetingTimer = null;
    }, 2800);
  }

  /**
   * Morgana idles on the Web Animations API rather than a CSS animation: the
   * badge keeps its hover rotation, and an infinite CSS keyframe on transform
   * would win the cascade and freeze hover feedback out.
   */
  private startIdleBreath(): void {
    const thumb = this.avatarEl?.querySelector<HTMLElement>('.mona-avatar-icon');
    if (!thumb || typeof thumb.animate !== 'function') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    this.breath = thumb.animate(
      [
        { transform: 'scale(1) translateY(0)' },
        { transform: 'scale(1.035) translateY(-1.5px)' },
        { transform: 'scale(1) translateY(0)' }
      ],
      { duration: 3000, iterations: Infinity, easing: 'cubic-bezier(.4,0,.6,1)' }
    );
    this.breath.finished.catch(() => undefined);

    document.addEventListener('visibilitychange', () => {
      if (!this.breath) return;
      if (document.hidden) this.breath.pause();
      else this.breath.play();
    });
  }

  private createDom(): void {
    if (document.getElementById('p5-mona-navigator')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'p5-mona-navigator';
    wrapper.className = 'p5-mona-container';
    wrapper.setAttribute('role', 'complementary');
    wrapper.setAttribute('aria-label', 'Morgana Tactical Field Navigator');

    wrapper.innerHTML = `
      <div class="mona-bubble-wrap" id="mona-bubble-wrap">
        <div class="mona-speaker-badge">
          <div class="mona-badge-identity">
            <img src="/images/p5r/morgana.png" alt="Mona" class="mona-badge-thumb" />
            <span class="mona-badge-name">MORGANA // NAVIGATOR</span>
          </div>
          <button class="mona-minimize-btn" id="mona-minimize-btn" title="Toggle Advisor">_</button>
        </div>
        <div class="mona-bubble-body">
          <p class="mona-text" id="mona-speech-text">Scanning Metaverse telemetry...</p>
        </div>
        <div class="mona-bubble-tail"></div>
      </div>

      <button class="mona-avatar-badge" id="mona-avatar-btn" title="Click for Mona's Tactical Advice" aria-label="Mona Tactical Advice">
        <div class="mona-avatar-icon">
          <img src="/images/p5r/morgana.png" alt="Morgana Field Navigator" class="mona-avatar-img" />
        </div>
        <span class="mona-status-dot"></span>
      </button>
    `;

    document.body.appendChild(wrapper);
    this.containerEl = wrapper;
    this.bubbleTextEl = document.getElementById('mona-speech-text');
    this.bubbleWrapEl = document.getElementById('mona-bubble-wrap');
    this.avatarEl = document.getElementById('mona-avatar-btn');
  }

  private bindEvents(): void {
    const avatarBtn = document.getElementById('mona-avatar-btn');
    const minBtn = document.getElementById('mona-minimize-btn');
    const bubbleWrap = document.getElementById('mona-bubble-wrap');

    if (avatarBtn) {
      avatarBtn.addEventListener('click', () => {
        p5rAudio.playMenuNavigate();
        p5CriticalSpark(0.12, 0.88);
        if (this.isMinimized) {
          this.setMinimized(false);
        } else {
          this.nextRandomTip();
        }
      });
    }

    if (minBtn) {
      minBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        p5rAudio.playMenuNavigate();
        this.setMinimized(!this.isMinimized);
      });
    }

    if (bubbleWrap) {
      bubbleWrap.addEventListener('click', () => {
        p5rAudio.playMenuNavigate();
        this.nextRandomTip();
      });
    }

    window.addEventListener('p5r:tabchange', (e: Event) => {
      const custom = e as CustomEvent<{ tabId: string }>;
      if (custom.detail?.tabId) {
        this.onTabChange(custom.detail.tabId);
      }
    });
  }

  public say(message: string, priority: boolean = false): void {
    if (!this.bubbleTextEl || !this.containerEl) return;

    if (this.isMinimized && !priority) return;
    if (this.isMinimized && priority) {
      this.setMinimized(false);
    }

    if (this.autoHideTimer !== null) {
      window.clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }

    // Comic tail snap: the bubble is thrown onto the screen from the avatar's
    // corner, it never fades. WAAPI so the skewed resting transform survives.
    this.bubbleTextEl.textContent = message;
    this.containerEl.classList.add('mona-speaking');
    this.snapIn(this.bubbleWrapEl);

    if (this.autoHideTimer !== null) window.clearTimeout(this.autoHideTimer);

    // Auto-settle after 7 seconds
    this.autoHideTimer = window.setTimeout(() => {
      this.containerEl?.classList.remove('mona-speaking');
    }, 7000);
  }

  private snapIn(target: HTMLElement | null): void {
    if (!target || typeof target.animate !== 'function') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    target
      .animate(
        [
          { opacity: 0, transform: 'skewX(-6deg) translate(-22px, 16px) scale(.86)' },
          { opacity: 1, transform: 'skewX(-6deg) translate(3px, -2px) scale(1.03)', offset: 0.6 },
          { opacity: 1, transform: 'skewX(-6deg) translate(0, 0) scale(1)' }
        ],
        { duration: 190, easing: 'steps(3, end)', fill: 'none' }
      )
      .finished.catch(() => undefined);
  }

  public onTabChange(tabId: string): void {
    if (this.initialGreetingTimer !== null) {
      window.clearTimeout(this.initialGreetingTimer);
      this.initialGreetingTimer = null;
    }
    const msg = TAB_MESSAGES[tabId];
    if (msg) {
      this.say(msg);
    }
  }

  public onAlertChange(level: number): void {
    if (level >= 80) {
      this.say("Security Alert is critical, Joker! The Palace Shadows are converging!", true);
    }
  }

  public onAudioChange(muted: boolean): void {
    if (muted) {
      this.say("Stealth mode engaged. Moving quietly through the Metaverse...");
    } else {
      this.say("Turn up the acid jazz! Let's show 'em true Phantom Thief style!");
    }
  }

  private nextRandomTip(): void {
    const tip = RANDOM_TIPS[this.currentTipIndex % RANDOM_TIPS.length];
    this.currentTipIndex++;
    this.say(`💡 TIP: ${tip}`, true);
  }

  private setMinimized(minimized: boolean): void {
    this.isMinimized = minimized;
    this.containerEl?.classList.toggle('minimized', minimized);
    if (!minimized) this.snapIn(this.bubbleWrapEl);
  }

  public destroy(): void {
    if (this.autoHideTimer !== null) {
      window.clearTimeout(this.autoHideTimer);
    }
    try {
      this.breath?.cancel();
    } catch {
      /* already detached */
    }
    this.breath = null;
    this.containerEl?.remove();
    this.containerEl = null;
    this.bubbleWrapEl = null;
    this.avatarEl = null;
  }
}

export const monaNavigator: MonaNavigator = new MonaNavigatorImpl();
