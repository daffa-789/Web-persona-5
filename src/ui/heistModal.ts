/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - PALACE INFILTRATION BLUEPRINT MODAL
 * File: src/ui/heistModal.ts
 *
 * Implements the authentic Persona 5 Palace target inspection dossier:
 *  - Triggered by clicking project cards in the HEISTS section
 *  - Displays target threat level, low-level architecture breakdown, and live metrics
 *  - Direct actions to launch playable prototype or inspect Git blueprints
 * ==========================================================================
 */

import { p5rAudio } from '../audio/p5rAudio';
import { PORTFOLIO_CONFIG } from '../config/portfolio';

export interface HeistModalController {
  init(): void;
  open(heistId: string): void;
  close(): void;
  isOpen(): boolean;
  destroy(): void;
}

class HeistModalControllerImpl implements HeistModalController {
  private overlayEl: HTMLElement | null = null;
  private isModalOpen: boolean = false;

  public init(): void {
    if (typeof document === 'undefined') return;

    this.createDom();
    this.bindEvents();
  }

  private createDom(): void {
    if (document.getElementById('p5-heist-dossier-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'p5-heist-dossier-modal';
    overlay.className = 'p5-modal-backdrop hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'heist-modal-title');

    overlay.innerHTML = `
      <div class="p5-heist-modal-card p5-card-frame">
        <div class="heist-modal-top-bar">
          <div class="heist-target-code" id="heist-modal-target-code">TARGET: PALACE-01</div>
          <span class="heist-clearance-badge">★ MISSION CLEARED ★</span>
        </div>

        <div class="heist-modal-content">
          <div class="heist-modal-header">
            <div class="section-tag"><span id="heist-modal-genre">GENRE</span></div>
            <h2 class="heist-modal-h2" id="heist-modal-title">PROJECT TITLE</h2>
            <div class="p5-data-strip mt-1 mb-3">◆ INFILTRATION-LOG ◆ STATUS: ACTIVE ◆ CLEARANCE: LV.99</div>
          </div>

          <p class="heist-modal-desc" id="heist-modal-desc">Detailed architecture brief...</p>

          <div class="heist-modal-metrics-grid">
            <div class="heist-metric-box">
              <span class="metric-key">FRAMERATE TARGET</span>
              <span class="metric-val" id="heist-modal-fps">120 FPS Locked</span>
            </div>
            <div class="heist-metric-box">
              <span class="metric-key">DRAW CALL BUDGET</span>
              <span class="metric-val" id="heist-modal-dc">&lt;180 DC</span>
            </div>
            <div class="heist-metric-box">
              <span class="metric-key">DYNAMIC ACTORS</span>
              <span class="metric-val" id="heist-modal-entities">4,000+ Units</span>
            </div>
            <div class="heist-metric-box">
              <span class="metric-key">WORLD SCALE</span>
              <span class="metric-val" id="heist-modal-scale">16km²</span>
            </div>
          </div>

          <div class="heist-modal-tech-section">
            <div class="tech-section-label">CONFIRMED TECH STACK ARCHITECTURE:</div>
            <div class="tech-pills-row" id="heist-modal-pills"></div>
          </div>

          <div class="heist-modal-actions">
            <a href="#" target="_blank" rel="noopener noreferrer" class="project-link-btn demo-btn" id="heist-modal-demo-link">
              <span>▶ LAUNCH PLAYABLE BUILD</span>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" class="project-link-btn github-btn" id="heist-modal-git-link">
              <span>⎇ INSPECT BLUEPRINTS (GITHUB)</span>
            </a>
            <div id="heist-modal-classified-badge" class="p5-heist-classified-badge py-2 px-3 bg-black border border-[#FFDE00]/40 text-xs font-mono text-[#FFDE00] [transform:skewX(-4deg)]">
              <span class="[transform:skewX(4deg)] inline-block">🔒 PALACE ARCHIVE // PROTOTYPE RESTRICTED (CLEARANCE LV.99)</span>
            </div>
            <button type="button" class="btn-theurgy-strike" id="btn-close-heist-modal" style="flex: 0 0 auto;">
              <span>✕ RETURN [ESC]</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlayEl = overlay;
  }

  private bindEvents(): void {
    // Backdrop click dismisses
    if (this.overlayEl) {
      this.overlayEl.addEventListener('click', (e) => {
        if (e.target === this.overlayEl) {
          this.close();
        }
      });
    }

    // Close button
    const closeBtn = document.getElementById('btn-close-heist-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.close();
      });
    }

    // ESC dismiss
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isModalOpen) {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      }
    });

    // Delegate click on project cards
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      // Don't intercept if clicking external links
      if (target.closest('a')) return;

      const card = target.closest<HTMLElement>('.project-conquest-card');
      if (card) {
        const titleText = card.querySelector('.project-title')?.textContent?.trim() || '';
        const heists = PORTFOLIO_CONFIG.heists || [];
        const match = heists.find(h => h.title.toUpperCase() === titleText.toUpperCase() || h.id === card.id);
        if (match) {
          this.open(match.id);
        }
      }
    });
  }

  public open(heistId: string): void {
    const heists = PORTFOLIO_CONFIG.heists || [];
    const item = heists.find(h => h.id === heistId) || heists[0];
    if (!item || !this.overlayEl) return;

    p5rAudio.playMenuNavigate();

    const targetCodeEl = document.getElementById('heist-modal-target-code');
    const genreEl = document.getElementById('heist-modal-genre');
    const titleEl = document.getElementById('heist-modal-title');
    const descEl = document.getElementById('heist-modal-desc');
    const fpsEl = document.getElementById('heist-modal-fps');
    const dcEl = document.getElementById('heist-modal-dc');
    const entitiesEl = document.getElementById('heist-modal-entities');
    const scaleEl = document.getElementById('heist-modal-scale');
    const pillsEl = document.getElementById('heist-modal-pills');
    const demoLink = document.getElementById('heist-modal-demo-link') as HTMLAnchorElement | null;
    const gitLink = document.getElementById('heist-modal-git-link') as HTMLAnchorElement | null;

    if (targetCodeEl) targetCodeEl.textContent = `TARGET: ${item.targetCode}`;
    if (genreEl) genreEl.textContent = item.genre.toUpperCase();
    if (titleEl) titleEl.textContent = item.title;
    if (descEl) descEl.textContent = item.summary;
    if (fpsEl) fpsEl.textContent = item.metrics?.fps || '60 FPS';
    if (dcEl) dcEl.textContent = item.metrics?.drawCalls || '<100 DC';
    if (entitiesEl) entitiesEl.textContent = item.metrics?.entityCount || '1,000+ Actors';
    if (scaleEl) scaleEl.textContent = item.metrics?.scale || 'Open Scope';

    if (pillsEl) {
      pillsEl.innerHTML = (item.techStack || []).map(t => `<span class="tech-pill">${t}</span>`).join('');
    }

    const classifiedBadge = document.getElementById('heist-modal-classified-badge');
    const hasAnyLink = !!(item.demoUrl || item.itchUrl || item.githubUrl);

    if (demoLink) {
      if (item.demoUrl || item.itchUrl) {
        demoLink.href = item.demoUrl || item.itchUrl || '#';
        demoLink.style.display = 'inline-flex';
      } else {
        demoLink.style.display = 'none';
      }
    }
    if (gitLink) {
      if (item.githubUrl) {
        gitLink.href = item.githubUrl;
        gitLink.style.display = 'inline-flex';
      } else {
        gitLink.style.display = 'none';
      }
    }
    if (classifiedBadge) {
      classifiedBadge.style.display = hasAnyLink ? 'none' : 'inline-block';
    }

    this.overlayEl.classList.remove('hidden');
    void this.overlayEl.offsetWidth;
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

export const heistModalController: HeistModalController = new HeistModalControllerImpl();
