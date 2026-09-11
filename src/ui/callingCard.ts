/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - CALLING CARD FORM & DISPATCH SYSTEM
 * File: src/ui/callingCard.ts
 *
 * Manages studio hire & contact calling card submissions:
 *  - Mission Objective selector buttons (Full-time Studio Role, Game Jam / Indie Collab, etc.)
 *  - Form validation: whitespace trimming (.trim()), email format (@), objective enforcement
 *  - Submission debouncing & double-click protection (disabled / isSubmitting state)
 *  - Direct invocation of All-Out Attack victory splash modal ("THE CODE IS EXECUTED!")
 *  - Procedural bass drop audio integration (playAllOutAttack)
 * ==========================================================================
 */

import { PORTFOLIO_CONFIG } from '../config/portfolio';
import { p5rAudio } from '../audio/p5rAudio';

export interface CallingCardPayload {
  name: string;
  email: string;
  objective: string;
  message: string;
  recipient: string;
}

export class CallingCardController {
  private form: HTMLFormElement | null = null;
  private submitBtn: HTMLButtonElement | null = null;
  private objectiveButtons: NodeListOf<HTMLButtonElement> | null = null;
  private selectedObjective: string = 'Full-time Studio Role';
  private isSubmitting: boolean = false;
  public defaultRecipient: string = PORTFOLIO_CONFIG.callingCard?.defaultRecipient || 'daffa.joker.dev@gmail.com';

  constructor() {
    this.init();
  }

  public init(): void {
    if (typeof document === 'undefined') return;

    this.form = document.getElementById('calling-card-form') as HTMLFormElement;
    this.submitBtn = document.getElementById('calling-card-submit-btn') as HTMLButtonElement;
    this.objectiveButtons = document.querySelectorAll('.objective-select-btn');

    this.bindObjectiveButtons();
    this.bindFormSubmission();
  }

  private bindObjectiveButtons(): void {
    if (!this.objectiveButtons) return;

    this.objectiveButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        p5rAudio.playGunCock();
        this.objectiveButtons?.forEach((b) => b.classList.remove('active', 'selected'));
        btn.classList.add('active', 'selected');
        this.selectedObjective = btn.getAttribute('data-objective') || btn.innerText.trim();
      });
    });
  }

  private bindFormSubmission(): void {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  public validate(name: string, email: string, message: string, objective: string): { valid: boolean; reason?: string } {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length === 0) {
      return { valid: false, reason: 'Target operative name is required' };
    }

    if (trimmedEmail.length === 0 || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return { valid: false, reason: 'Valid producer email format (@) is required' };
    }

    if (!objective || objective.trim().length === 0) {
      return { valid: false, reason: 'Please select a mission objective' };
    }

    if (trimmedMessage.length === 0) {
      return { valid: false, reason: 'Calling card message declaration is required' };
    }

    return { valid: true };
  }

  public async handleSubmit(): Promise<boolean> {
    if (this.isSubmitting) return false;

    const nameInput = document.getElementById('input-sender-name') as HTMLInputElement;
    const emailInput = document.getElementById('input-sender-email') as HTMLInputElement;
    const messageInput = document.getElementById('input-sender-message') as HTMLTextAreaElement;

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';
    const objective = this.selectedObjective;

    const validation = this.validate(name, email, message, objective);
    if (!validation.valid) {
      alert(`[CALLING CARD WARNING] ${validation.reason}`);
      return false;
    }

    // Debounce & lock submit button
    this.isSubmitting = true;
    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.classList.add('busy', 'opacity-50');
      this.submitBtn.innerText = 'DISPATCHING NOTICE...';
    }

    try {
      // Simulate dispatch
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Play All-Out Attack bass drop & reveal victory modal
      showAllOutAttack({
        name,
        objective: objective || 'Full-time Studio Role',
        recipient: this.defaultRecipient,
      });

      // Reset form fields
      if (this.form) this.form.reset();
      return true;
    } finally {
      this.isSubmitting = false;
      if (this.submitBtn) {
        this.submitBtn.disabled = false;
        this.submitBtn.classList.remove('busy', 'opacity-50');
        this.submitBtn.innerText = '★ SEND CALLING CARD ★';
      }
    }
  }
}

/**
 * Triggers the fullscreen All-Out Attack splash modal with signature bass drop
 */
export function showAllOutAttack(details?: { name?: string; objective?: string; recipient?: string }): void {
  p5rAudio.playAllOutAttack();

  const overlay = document.getElementById('all-out-attack-overlay');
  const targetText = document.getElementById('aoa-target-text');

  if (targetText && details?.name) {
    targetText.textContent = `TARGET: ${details.name.toUpperCase()} // ${details.objective || 'Full-time Studio Role'}`;
  }

  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.classList.add('flex', 'active');
  }
}

export const callingCardController = new CallingCardController();
