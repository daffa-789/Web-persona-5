/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - CONFIDANT COOPERATION CAREER TIMELINE
 * File: src/ui/confidants.ts
 *
 * Renders Game Dev career & studio milestones styled as Confidant Arcana:
 *  - Rank progression badges (Rank 1 to MAX)
 *  - Tarot Arcana association (Fool, Magician, Emperor, etc.)
 *  - Studio roles, timelines, and unlocked engine deliverables
 * ==========================================================================
 */

import { PORTFOLIO_CONFIG, ConfidantArcana } from '../config/portfolio';

export class ConfidantsController {
  private container: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  public init(): void {
    if (typeof document === 'undefined') return;
    this.container = document.getElementById('experience-timeline');
    this.render();
  }

  public render(): void {
    if (!this.container) return;
    const confidants = PORTFOLIO_CONFIG.confidants || [];

    const html = confidants.map((item: ConfidantArcana) => {
      const displayRank = String(item.rank) === '10' || item.rank === 'MAX' ? 'MAX' : item.rank;
      return `
        <div class="timeline-milestone-card p5-card-frame flex gap-4 p-4 border-l-4 border-l-[#E60012] bg-black/70 mb-4">
          <div class="timeline-rank-col text-center min-w-[70px]">
            <div class="confidant-rank-label text-xs font-mono text-[#FFDE00]">RANK</div>
            <div class="confidant-rank-num text-2xl font-black text-white">${displayRank}</div>
            <div class="text-[9px] font-mono text-zinc-400 mt-1">${item.arcana}</div>
          </div>
          <div class="timeline-body flex-1">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="timeline-role font-black text-white text-base">${item.role}</h3>
                <div class="timeline-company text-sm text-[#FFDE00] font-bold">${item.company}</div>
              </div>
              <div class="timeline-meta text-xs font-mono text-zinc-400">${item.period}</div>
            </div>
            <p class="timeline-desc text-xs text-zinc-300 mt-2 leading-relaxed">${item.description}</p>
          </div>
        </div>
      `;
    }).join('');

    this.container.innerHTML = html;
  }
}

export const confidantsController = new ConfidantsController();
