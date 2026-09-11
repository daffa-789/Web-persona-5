/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - FIELD MANUAL & SYSTEM SHORTCUTS MODAL
 * File: src/ui/helpModal.ts
 *
 * Implements the authentic Persona 5 system tutorial / controller layout modal:
 *  - Triggered by clicking #p5-controller-hud or pressing '?' / 'H'
 *  - Cleanly displays dual input scheme (Keyboard + Mouse + Gamepad)
 *  - Supports ESC / click overlay to dismiss with menu_back audio
 * ==========================================================================
 */

import { p5rAudio } from '../audio/p5rAudio';

export interface HelpModalController {
  init(): void;
  open(): void;
  close(): void;
  isOpen(): boolean;
  destroy(): void;
}

class HelpModalControllerImpl implements HelpModalController {
  private overlayEl: HTMLElement | null = null;
  private isModalOpen: boolean = false;

  public init(): void {
    if (typeof document === 'undefined') return;

    this.createDom();
    this.bindEvents();
  }

  private createDom(): void {
    if (document.getElementById('p5-field-manual-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'p5-field-manual-modal';
    overlay.className = 'p5-modal-backdrop hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'manual-modal-title');

    overlay.innerHTML = `
      <div class="p5-manual-card p5-card-frame">
        <!-- Corner Brackets are handled by p5-card-frame -->
        
        <div class="manual-header">
          <div class="section-tag"><span>SYSTEM GUIDE // MANUAL</span></div>
          <h2 class="manual-title" id="manual-modal-title">
            PHANTOM THIEVES FIELD MANUAL
          </h2>
          <div class="manual-subtitle">
            METAVERSE NAVIGATION & KEYBOARD SHORTCUT TELEMETRY
          </div>
        </div>

        <div class="manual-body">
          <div class="manual-grid">
            
            <div class="manual-key-row">
              <div class="key-caps">
                <span class="p5-keycap">1</span>
                <span class="p5-keycap">2</span>
                <span class="p5-keycap">3</span>
                <span class="p5-keycap">4</span>
                <span class="p5-keycap">5</span>
              </div>
              <div class="key-desc">
                <strong>SECTOR DIRECT TELEPORT</strong>
                <span>Jump directly to Dossier, Skills, Heists, Confidants, or Calling Card</span>
              </div>
            </div>

            <div class="manual-key-row">
              <div class="key-caps">
                <span class="p5-keycap">◀</span>
                <span class="p5-keycap">▶</span>
                <span class="key-sep">/</span>
                <span class="p5-keycap">A</span>
                <span class="p5-keycap">D</span>
              </div>
              <div class="key-desc">
                <strong>SECTOR CYCLING</strong>
                <span>Cycle previous / next command ribbons</span>
              </div>
            </div>

            <div class="manual-key-row">
              <div class="key-caps">
                <span class="p5-keycap">▲</span>
                <span class="p5-keycap">▼</span>
                <span class="key-sep">/</span>
                <span class="p5-keycap">W</span>
                <span class="p5-keycap">S</span>
              </div>
              <div class="key-desc">
                <strong>VERTICAL EXPLORATION</strong>
                <span>Scroll smoothly through the Palace territory</span>
              </div>
            </div>

            <div class="manual-key-row">
              <div class="key-caps">
                <span class="p5-keycap gold">T</span>
              </div>
              <div class="key-desc">
                <strong>SHOWTIME // ALL-OUT ATTACK</strong>
                <span>Unleash Joker's signature finishing touch cinematic modal</span>
              </div>
            </div>

            <div class="manual-key-row">
              <div class="key-caps">
                <span class="p5-keycap">B</span>
                <span class="key-sep">+</span>
                <span class="p5-keycap">M</span>
              </div>
              <div class="key-desc">
                <strong>AUDIO CHANNELS</strong>
                <span>[B] Toggle Last Surprise BGM &bull; [M] Master Sound Mute</span>
              </div>
            </div>

            <div class="manual-key-row">
              <div class="key-caps">
                <span class="p5-keycap red">ESC</span>
                <span class="key-sep">/</span>
                <span class="p5-keycap red">⌫</span>
              </div>
              <div class="key-desc">
                <strong>CANCEL // RETURN</strong>
                <span>Close active modals first, then navigate back through tab history</span>
              </div>
            </div>

          </div>
        </div>

        <div class="manual-footer">
          <button type="button" class="btn-theurgy-strike" id="btn-close-manual">
            <span>CLAIM INTEL & RETURN ▶ [ESC]</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlayEl = overlay;
  }

  private bindEvents(): void {
    // Controller prompt bar click opens manual
    const controllerHud = document.getElementById('p5-controller-hud');
    if (controllerHud) {
      controllerHud.style.cursor = 'pointer';
      controllerHud.setAttribute('title', 'Click to open Field Manual & Keyboard Shortcuts [?]');
      controllerHud.addEventListener('click', () => {
        this.open();
      });
    }

    // Close button
    const closeBtn = document.getElementById('btn-close-manual');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.close();
      });
    }

    // Backdrop click dismisses
    if (this.overlayEl) {
      this.overlayEl.addEventListener('click', (e) => {
        if (e.target === this.overlayEl) {
          this.close();
        }
      });
    }

    // Keyboard shortcut listener: '?' or 'H'
    window.addEventListener('keydown', (e) => {
      // Don't intercept when user is typing in inputs
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === '?' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        if (this.isModalOpen) {
          this.close();
        } else {
          this.open();
        }
      } else if (e.key === 'Escape' && this.isModalOpen) {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      }
    });
  }

  public open(): void {
    if (!this.overlayEl || this.isModalOpen) return;
    p5rAudio.playGunCock();
    this.overlayEl.classList.remove('hidden');
    void this.overlayEl.offsetWidth; // Force reflow
    this.overlayEl.classList.add('visible');
    this.isModalOpen = true;
  }

  public close(): void {
    if (!this.overlayEl || !this.isModalOpen) return;
    p5rAudio.playMenuBack();
    this.overlayEl.classList.remove('visible');
    setTimeout(() => {
      if (!this.isModalOpen && this.overlayEl) {
        this.overlayEl.classList.add('hidden');
      }
    }, 250);
    this.isModalOpen = false;
  }

  public isOpen(): boolean {
    return this.isModalOpen;
  }

  public destroy(): void {
    this.overlayEl?.remove();
    this.overlayEl = null;
    this.isModalOpen = false;
  }
}

export const helpModalController: HelpModalController = new HelpModalControllerImpl();
