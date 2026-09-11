/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - PALACE INFILTRATION HEIST CARDS
 * File: src/ui/heists.ts
 *
 * Renders Palace Heist game development project files:
 *  - Target framerate (60/120 FPS) & performance scale metrics
 *  - Blood-red angled "MISSION CLEARED" stamps on completed heist cards
 *  - Playable demo & source code links
 * ==========================================================================
 */

import { PORTFOLIO_CONFIG, PalaceHeist } from '../config/portfolio';

export class HeistsController {
  private container: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  public init(): void {
    if (typeof document === 'undefined') return;
    this.container = document.getElementById('projects-operations-grid');
    this.render();
  }

  public render(): void {
    if (!this.container) return;
    const heists = PORTFOLIO_CONFIG.heists || [];

    const html = heists.map((heist: PalaceHeist) => {
      const metricsStr = typeof heist.metrics === 'object' && heist.metrics !== null
        ? `${heist.metrics.fps} // ${heist.metrics.scale}`
        : String(heist.metrics || '');

      return `
        <div class="project-conquest-card p5-card-frame relative overflow-hidden" id="heist-${heist.id}">
          ${heist.missionCleared ? `
            <div class="mission-cleared-stamp absolute top-4 right-4 z-20 pointer-events-none">
              ★ MISSION CLEARED ★
            </div>
          ` : ''}
          <div class="project-card-inner">
            <div class="project-code-badge">${heist.targetCode} // ${heist.genre}</div>
            <h3 class="project-title">${heist.title}</h3>
            <p class="project-summary">${heist.summary}</p>
            <div class="project-metrics-bar">
              <span>📊 ${metricsStr}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.container.innerHTML = html;
  }
}

export const heistsController = new HeistsController();
