/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - ALL-OUT ATTACK VICTORY MODAL ("THE CODE IS EXECUTED!")
 * File: src/ui/allOutAttackModal.ts
 *
 * Fullscreen All-Out Attack victory splash modal featuring:
 *  - Signature tagline: "THE CODE IS EXECUTED!"
 *  - Procedural bass drop audio integration (playAllOutAttack)
 *  - Joker finishing touch pose & dynamic comic halftone backdrop
 * ==========================================================================
 */

import { p5rAudio } from '../audio/p5rAudio';

export interface AllOutAttackDetails {
  name?: string;
  objective?: string;
  recipient?: string;
}

export class AllOutAttackModal {
  private overlay: HTMLElement | null = null;
  private closeBtn: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  public init(): void {
    if (typeof document === 'undefined') return;

    this.overlay = document.getElementById('all-out-attack-overlay');
    this.closeBtn = document.getElementById('aoa-close-btn');

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // ESC key closes modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  public show(details?: AllOutAttackDetails): void {
    p5rAudio.playAllOutAttack();

    if (this.overlay) {
      this.overlay.classList.remove('hidden');
      this.overlay.classList.add('flex', 'active');
    }

    const targetEl = document.getElementById('aoa-target-text');
    if (targetEl && details?.name) {
      targetEl.textContent = `TARGET: ${details.name.toUpperCase()} // ${details.objective || 'Full-time Studio Role'}`;
    }
  }

  public close(): void {
    if (this.overlay) {
      this.overlay.classList.remove('flex', 'active');
      this.overlay.classList.add('hidden');
    }
  }
}

export const allOutAttackModal = new AllOutAttackModal();
