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

export interface MonaNavigator {
  init(): void;
  say(message: string, priority?: boolean): void;
  onTabChange(tabId: string): void;
  onAlertChange(level: number): void;
  onAudioChange(muted: boolean): void;
  destroy(): void;
}

const TAB_MESSAGES: Record<string, string> = {
  'tab-profile': "Looking cool, Joker! Level 99 Game Systems Architect with zero memory leaks!",
  'tab-skills': "Check out those combat parameters! ST: 98 and AG: 99... unstoppable in C++ and shaders!",
  'tab-projects': "Four Palace contracts infiltrated! Let's examine the target architectures and steal their heart!",
  'tab-experience': "Rank 10 MAX Judgement with Sae! Your network of industry allies is formidable!",
  'tab-contact': "Time to dispatch the Calling Card, Joker! Let's steal their studio project offer!"
};

const RANDOM_TIPS: string[] = [
  "Press [1-5] on your keyboard to instantly warp between Metaverse sectors!",
  "Type [/] anytime to open the Metaverse Command Palette with all quick tools!",
  "Press [S] to schedule a direct studio interview or engine briefing with Joker!",
  "Press [B] to test Daffa's live 120 FPS in-browser particle physics engine!",
  "Press [G] to challenge Joker with Sae's technical interrogation challenges!",
  "Press [T] to review Daffa's proven studio teamwork & Baton Pass code reviews!",
  "Press [L] to study the C++20 and shader guides in the Knowledge Codex!",
  "Press [O] to trigger the 120 FPS Palace Overclock Boost Mode!",
  "Press [ESC] to quickly dismiss active modals and return through tabs!",
  "Looking for the Field Manual? Click the bottom prompt bar or press [?]!"
];

class MonaNavigatorImpl implements MonaNavigator {
  private containerEl: HTMLElement | null = null;
  private bubbleTextEl: HTMLElement | null = null;
  private isMinimized: boolean = false;
  private currentTipIndex: number = 0;
  private autoHideTimer: number | null = null;
  private initialGreetingTimer: number | null = null;

  public init(): void {
    if (typeof document === 'undefined') return;

    this.createDom();
    this.bindEvents();

    // Initial greeting after entrance
    this.initialGreetingTimer = window.setTimeout(() => {
      this.say(TAB_MESSAGES['tab-profile']);
      this.initialGreetingTimer = null;
    }, 2800);
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
          <span class="mona-badge-icon">🐱</span>
          <span class="mona-badge-name">MORGANA // NAVIGATOR</span>
          <button class="mona-minimize-btn" id="mona-minimize-btn" title="Toggle Advisor">_</button>
        </div>
        <div class="mona-bubble-body">
          <p class="mona-text" id="mona-speech-text">Scanning Metaverse telemetry...</p>
        </div>
        <div class="mona-bubble-tail"></div>
      </div>

      <button class="mona-avatar-badge" id="mona-avatar-btn" title="Click for Mona's Tactical Advice">
        <div class="mona-avatar-icon">
          <svg viewBox="0 0 48 48" class="mona-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="22" fill="#000000" stroke="#FFDE00" stroke-width="2.5" />
            <!-- Cat Ears -->
            <polygon points="12,18 7,4 20,12" fill="#000000" stroke="#E60012" stroke-width="2" />
            <polygon points="36,18 41,4 28,12" fill="#000000" stroke="#E60012" stroke-width="2" />
            <!-- Yellow Bandana collar -->
            <path d="M12,36 Q24,44 36,36 L30,44 Q24,46 18,44 Z" fill="#FFDE00" />
            <!-- Blue Eyes -->
            <ellipse cx="17" cy="22" rx="4.5" ry="6" fill="#00F0FF" />
            <ellipse cx="31" cy="22" rx="4.5" ry="6" fill="#00F0FF" />
            <circle cx="17" cy="22" r="2" fill="#000000" />
            <circle cx="31" cy="22" r="2" fill="#000000" />
            <circle cx="18.5" cy="20.5" r="1" fill="#FFFFFF" />
            <circle cx="32.5" cy="20.5" r="1" fill="#FFFFFF" />
            <!-- White Snout -->
            <ellipse cx="24" cy="29" rx="6" ry="4" fill="#FFFFFF" />
            <polygon points="23,27 25,27 24,29" fill="#E60012" />
          </svg>
        </div>
        <span class="mona-status-dot"></span>
      </button>
    `;

    document.body.appendChild(wrapper);
    this.containerEl = wrapper;
    this.bubbleTextEl = document.getElementById('mona-speech-text');
  }

  private bindEvents(): void {
    const avatarBtn = document.getElementById('mona-avatar-btn');
    const minBtn = document.getElementById('mona-minimize-btn');
    const bubbleWrap = document.getElementById('mona-bubble-wrap');

    if (avatarBtn) {
      avatarBtn.addEventListener('click', () => {
        p5rAudio.playMenuNavigate();
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

    // Comic typing animation
    this.bubbleTextEl.textContent = message;
    this.containerEl.classList.remove('mona-speaking');
    void this.containerEl.offsetWidth; // Force reflow
    this.containerEl.classList.add('mona-speaking');

    // Auto-settle after 7 seconds
    this.autoHideTimer = window.setTimeout(() => {
      if (this.containerEl) {
        this.containerEl.classList.remove('mona-speaking');
      }
    }, 7000);
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
    if (this.containerEl) {
      this.containerEl.classList.toggle('minimized', minimized);
    }
  }

  public destroy(): void {
    if (this.autoHideTimer !== null) {
      window.clearTimeout(this.autoHideTimer);
    }
    this.containerEl?.remove();
    this.containerEl = null;
  }
}

export const monaNavigator: MonaNavigator = new MonaNavigatorImpl();
