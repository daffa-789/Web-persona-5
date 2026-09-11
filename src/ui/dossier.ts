/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - OPERATIVE DOSSIER & SECURITY ALERT TELEMETRY
 * File: src/ui/dossier.ts
 *
 * Manages hero operative profile, vitals bars, and Palace Security Alert meter:
 *  - Clamps security alert meter between 0% minimum and 99% maximum
 *  - Handles zero-height / equal-height viewports (scrollHeight, innerHeight, scrollTop)
 *  - Uses requestAnimationFrame and passive: true scroll listener for 60fps telemetry
 *  - Updates isolated meter elements (style.width, textContent) without modifying vitals
 * ==========================================================================
 */

import { PORTFOLIO_CONFIG } from '../config/portfolio';

export interface VitalsTelemetry {
  hpPercent: number;
  spPercent: number;
  batonPassPercent: number;
}

export class DossierController {
  private alertBar: HTMLElement | null = null;
  private alertText: HTMLElement | null = null;
  private alertLevel: number = 0;
  private ticking: boolean = false;

  constructor() {
    this.init();
  }

  public init(): void {
    if (typeof document === 'undefined') return;

    this.alertBar = document.getElementById('security-alert-bar');
    this.alertText = document.getElementById('security-alert-text');

    this.bindScrollTelemetry();
    this.updateVitals();
  }

  public updateVitals(): void {
    const profile = PORTFOLIO_CONFIG.profile;
    if (!profile) return;

    // Vitals bars display in dossier HUD
    const hpBar = document.getElementById('hp-bar');
    const spBar = document.getElementById('sp-bar');
    const theurgyBar = document.getElementById('theurgy-bar');

    if (hpBar) hpBar.style.width = `${profile.vitals.hpPercent}%`;
    if (spBar) spBar.style.width = `${profile.vitals.spPercent}%`;
    if (theurgyBar) theurgyBar.style.width = `${profile.vitals.batonPassPercent}%`;
  }

  public calculateAlertLevel(scrollTop: number, scrollHeight: number, innerHeight: number): number {
    const maxScroll = scrollHeight - innerHeight;
    if (maxScroll <= 0) {
      return 99; // Graceful fallback for zero/equal height viewports
    }
    const ratio = scrollTop / maxScroll;
    const computed = Math.round(ratio * 99);
    // Strict clamp between 0% minimum and 99% maximum
    return Math.max(0, Math.min(99, computed));
  }

  private bindScrollTelemetry(): void {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const scrollHeight = document.documentElement.scrollHeight || 0;
      const innerHeight = window.innerHeight || 1;

      this.alertLevel = this.calculateAlertLevel(scrollTop, scrollHeight, innerHeight);

      if (this.alertBar) {
        this.alertBar.style.width = `${this.alertLevel}%`;
      }
      if (this.alertText) {
        this.alertText.textContent = `${this.alertLevel}% ${this.alertLevel >= 90 ? 'MAX' : 'ALERT'}`;
      }
      this.ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!this.ticking) {
          window.requestAnimationFrame(handleScroll);
          this.ticking = true;
        }
      },
      { passive: true }
    );

    // Initial telemetry check
    handleScroll();
  }

  public getAlertLevel(): number {
    return this.alertLevel;
  }
}

export const dossierController = new DossierController();
