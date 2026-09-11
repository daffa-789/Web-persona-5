/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - PALACE OVERCLOCK / 120 FPS BOOST MODE (/boost)
 * File: src/ui/boostMode.ts
 *
 * Implements an interactive Turbo Overclock Hyperdrive state:
 *  - Triggered by clicking #btn-boost-toggle, pressing [O] / [X], or typing /boost
 *  - Overdrives visual rendering: speed-line aura, CRT scanlines, hyper-kinetic stagger
 *  - Drives Palace Security Alert to 99% with flashing OVERCLOCKED telemetry badge
 *  - Contextual Morgana dialogue surge
 *  - Snappy audio chimes and full toggle resilience
 * ==========================================================================
 */

import { p5rAudio } from '../audio/p5rAudio';

export interface BoostModeController {
  init(): void;
  toggle(): boolean;
  enable(): void;
  disable(): void;
  isActive(): boolean;
}

class BoostModeControllerImpl implements BoostModeController {
  private isBoosted: boolean = false;
  private speedLinesEl: HTMLElement | null = null;
  private toastEl: HTMLElement | null = null;

  public init(): void {
    if (typeof document === 'undefined') return;
    this.createDom();
    this.bindEvents();
  }

  private createDom(): void {
    // 1. Create dynamic comic speed lines element
    if (!document.getElementById('p5-boost-speedlines')) {
      const speedLines = document.createElement('div');
      speedLines.id = 'p5-boost-speedlines';
      speedLines.className = 'p5-boost-speedlines pointer-events-none hidden';
      document.body.appendChild(speedLines);
      this.speedLinesEl = speedLines;
    }

    // 2. Create Overclock Floating Toast
    if (!document.getElementById('p5-boost-toast')) {
      const toast = document.createElement('div');
      toast.id = 'p5-boost-toast';
      toast.className = 'p5-boost-toast pointer-events-none hidden';
      document.body.appendChild(toast);
      this.toastEl = toast;
    }
  }

  private bindEvents(): void {
    // Toggle button in header / HUD
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('#btn-boost-toggle, .btn-boost-toggle, [data-trigger="boost"]')) {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  public toggle(): boolean {
    if (this.isBoosted) {
      this.disable();
    } else {
      this.enable();
    }
    return this.isBoosted;
  }

  public enable(): void {
    this.isBoosted = true;
    document.body.classList.add('p5r-boost-active');
    p5rAudio.playAoaStart();

    if (this.speedLinesEl) {
      this.speedLinesEl.classList.remove('hidden');
      this.speedLinesEl.classList.add('active');
    }

    // Update Boost Toggle buttons
    const btns = document.querySelectorAll<HTMLElement>('#btn-boost-toggle, .btn-boost-toggle');
    btns.forEach(btn => {
      btn.classList.add('active');
      const label = btn.querySelector('span');
      if (label) label.textContent = '⚡ BOOST: 120 FPS ON';
    });

    // Update Security Alert Meter to Overclocked 99%
    const alertBar = document.getElementById('security-alert-bar');
    const alertText = document.getElementById('security-alert-text');
    if (alertBar) {
      alertBar.style.width = '99%';
      alertBar.classList.add('overclocked');
    }
    if (alertText) {
      alertText.textContent = '99% OVERCLOCKED';
      alertText.classList.add('text-[#FF1B2D]', 'animate-pulse');
    }

    // Show stylish Persona 5 floating toast
    this.showToast('⚡ ENGINE OVERCLOCKED: 120 FPS HYPERDRIVE ENGAGED!');

    // Dispatch global event for Morgana and telemetry
    window.dispatchEvent(new CustomEvent('p5r:boost', { detail: { active: true } }));
  }

  public disable(): void {
    this.isBoosted = false;
    document.body.classList.remove('p5r-boost-active');
    p5rAudio.playConfirm();

    if (this.speedLinesEl) {
      this.speedLinesEl.classList.remove('active');
      this.speedLinesEl.classList.add('hidden');
    }

    // Update Boost Toggle buttons
    const btns = document.querySelectorAll<HTMLElement>('#btn-boost-toggle, .btn-boost-toggle');
    btns.forEach(btn => {
      btn.classList.remove('active');
      const label = btn.querySelector('span');
      if (label) label.textContent = '⚡ BOOST: 120 FPS';
    });

    // Restore Security Alert Meter
    const alertBar = document.getElementById('security-alert-bar');
    const alertText = document.getElementById('security-alert-text');
    if (alertBar) {
      alertBar.style.width = '15%';
      alertBar.classList.remove('overclocked');
    }
    if (alertText) {
      alertText.textContent = '15% ALERT';
      alertText.classList.remove('text-[#FF1B2D]', 'animate-pulse');
    }

    this.showToast('OVERCLOCK DISENGAGED // CRUISE: 60 FPS');
    window.dispatchEvent(new CustomEvent('p5r:boost', { detail: { active: false } }));
  }

  private showToast(msg: string): void {
    if (!this.toastEl) return;
    this.toastEl.innerHTML = `
      <div class="p5-boost-toast-inner">
        <span class="toast-tag">OVERCLOCK STATUS</span>
        <span class="toast-msg">${msg}</span>
      </div>
    `;
    this.toastEl.classList.remove('hidden');
    this.toastEl.classList.remove('toast-exit');
    this.toastEl.classList.add('toast-enter', 'active');

    setTimeout(() => {
      if (this.toastEl) {
        this.toastEl.classList.remove('toast-enter');
        this.toastEl.classList.add('toast-exit');
        setTimeout(() => {
          if (this.toastEl && !this.isBoosted) this.toastEl.classList.add('hidden');
        }, 300);
      }
    }, 2400);
  }

  public isActive(): boolean {
    return this.isBoosted;
  }
}

export const boostModeController: BoostModeController = new BoostModeControllerImpl();
