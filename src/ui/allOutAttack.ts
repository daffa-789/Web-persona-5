/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - ALL-OUT ATTACK OVERLAY
 * File: src/ui/allOutAttack.ts
 *
 * Fullscreen "THE CODE IS EXECUTED!" victory splash modal.
 * ==========================================================================
 */

import { p5rAudio } from '../audio/p5rAudio';

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

export function closeAllOutAttack(): void {
  const overlay = document.getElementById('all-out-attack-overlay');
  if (overlay) {
    overlay.classList.remove('flex', 'active');
    overlay.classList.add('hidden');
  }
}
