/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - COMIC CONFETTI & CRITICAL SPARK ENGINE
 * File: src/utils/p5Confetti.ts
 *
 * Utilizes canvas-confetti to render authentic Persona 5 high-contrast
 * particle bursts (Crimson #E60012, Royal Gold #FFDE00, White, Black):
 *  - Critical Hit Slash Burst
 *  - Confidant Rank-Up Celebration
 *  - All-Out Attack Victory Shower
 *  - Subtle Interactive Star Sparks
 * ==========================================================================
 */

import confetti from 'canvas-confetti';

const P5_COLORS = ['#E60012', '#FFDE00', '#FFFFFF', '#111111'];
const GOLD_COLORS = ['#FFDE00', '#FFF380', '#FFFFFF'];
const CRIMSON_COLORS = ['#E60012', '#FF1E27', '#FFFFFF'];

/**
 * Fires a snappy Persona 5 critical hit star-spark burst from an element or coordinates
 */
export function p5CriticalSpark(originX = 0.5, originY = 0.5): void {
  try {
    confetti({
      particleCount: 35,
      spread: 60,
      startVelocity: 35,
      origin: { x: originX, y: originY },
      colors: P5_COLORS,
      shapes: ['square', 'star'],
      ticks: 120,
      gravity: 1.2,
      scalar: 0.9,
      disableForReducedMotion: true,
    });
  } catch (e) {
    console.debug('[P5R Confetti] Fallback handled:', e);
  }
}

/**
 * Confidant Rank-Up / Achievement fanfare burst
 */
export function p5RankUpCelebration(originX = 0.5, originY = 0.6): void {
  try {
    // Left burst
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: Math.max(0.1, originX - 0.15), y: originY },
      colors: GOLD_COLORS,
      shapes: ['star', 'square'],
      ticks: 140,
      gravity: 0.9,
      scalar: 1.1,
      disableForReducedMotion: true,
    });

    // Right burst
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: Math.min(0.9, originX + 0.15), y: originY },
      colors: CRIMSON_COLORS,
      shapes: ['star', 'square'],
      ticks: 140,
      gravity: 0.9,
      scalar: 1.1,
      disableForReducedMotion: true,
    });
  } catch (e) {
    console.debug('[P5R Confetti] Fallback handled:', e);
  }
}

/**
 * Epic All-Out Attack Finishing Touch victory cannon
 */
let victoryFrame = 0;

export function p5VictoryShower(): void {
  if (typeof window === 'undefined') return;
  try {
    const end = Date.now() + 800;
    const frame = () => {
      victoryFrame = 0;
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors: P5_COLORS,
        shapes: ['star', 'square'],
        scalar: 1.2,
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors: P5_COLORS,
        shapes: ['star', 'square'],
        scalar: 1.2,
        disableForReducedMotion: true,
      });

      if (Date.now() < end) {
        victoryFrame = requestAnimationFrame(frame);
      }
    };
    frame();
  } catch (e) {
    console.debug('[P5R Confetti] Fallback handled:', e);
  }
}

/**
 * Halt every burst in flight: kinetic exits and reduced-motion cues must be
 * able to clear the particle layer before the next frame is choreographed.
 */
export function p5HaltConfetti(): void {
  if (victoryFrame) {
    cancelAnimationFrame(victoryFrame);
    victoryFrame = 0;
  }
  try {
    confetti.reset();
  } catch (e) {
    console.debug('[P5R Confetti] Reset skipped:', e);
  }
}
