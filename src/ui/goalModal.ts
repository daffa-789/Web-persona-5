/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - PALACE INFILTRATION GOAL & MISSION OBJECTIVE (/goal)
 * File: src/ui/goalModal.ts
 *
 * Implements the authentic Persona 5 Mission Directive modal:
 *  - Triggered by clicking .p5-goal-ribbon, typing /goal, or pressing [M]
 *  - Displays Palace target, route clearance status (100%), and infiltration timeline
 *  - Phantom Thieves operative assignment matrix
 *  - Direct links to dispatch calling card, view 120 FPS benchmark, or question Joker
 *  - Full ESC / click-backdrop dismiss with menu_back audio
 * ==========================================================================
 */

import { p5rAudio } from '../audio/p5rAudio';

export interface GoalModalController {
  init(): void;
  open(): void;
  close(): void;
  isOpen(): boolean;
  destroy(): void;
}

class GoalModalControllerImpl implements GoalModalController {
  private overlayEl: HTMLElement | null = null;
  private isModalOpen: boolean = false;

  public init(): void {
    if (typeof document === 'undefined') return;
    this.createDom();
    this.bindEvents();
  }

  private createDom(): void {
    if (document.getElementById('p5-goal-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'p5-goal-modal';
    overlay.className = 'p5-modal-backdrop hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'goal-modal-title');

    overlay.innerHTML = `
      <div class="p5-manual-card p5-goal-card p5-card-frame">
        <!-- Header -->
        <div class="manual-header">
          <div class="section-tag"><span>METAVERSE MISSION DIRECTIVE // THE TREASURE (/goal)</span></div>
          <h2 class="manual-title" id="goal-modal-title">
            PALACE INFILTRATION: SECURE THE TREASURE
          </h2>
          <div class="manual-subtitle">
            OPERATION: LIBERATE 120 FPS GAMEPLAY ARCHITECTURE // SECURE LEAD STUDIO ROLE
          </div>
        </div>

        <!-- Body -->
        <div class="manual-body space-y-4 max-h-[68vh] overflow-y-auto pr-1">
          <!-- Status Banner -->
          <div class="bg-black/80 border-2 border-[#E60012] p-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="text-[11px] font-mono text-[#FFDE00] font-black uppercase tracking-wider">
                PALACE INFILTRATION ROUTE STATUS
              </div>
              <div class="text-lg font-black text-white font-mono flex items-center gap-2">
                <span class="text-[#E60012]">100% ROUTE SECURED</span>
                <span class="text-xs bg-[#E60012] text-white px-2 py-0.5 uppercase tracking-widest font-bold">READY TO STRIKE</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-[11px] font-mono text-zinc-400 uppercase">TIME UNTIL CHANGE OF HEART</div>
              <div class="text-lg font-black text-[#FFDE00] font-mono">11 DAYS REMAINING</div>
            </div>
          </div>

          <!-- Target Card -->
          <div class="border border-zinc-700 bg-zinc-950/90 p-3">
            <div class="text-[11px] font-mono text-[#FFDE00] font-bold uppercase tracking-widest mb-1">
              ★ PRIMARY TARGET & TREASURE:
            </div>
            <div class="text-sm font-bold text-white font-mono leading-relaxed">
              Target: Lead Gameplay & Engine Systems Engineer at a World-Class AAA / High-Impact Game Studio.
            </div>
            <p class="text-xs text-zinc-300 font-mono mt-1 leading-relaxed">
              Treasure: Architecting immersive 120 FPS combat loops, robust rollback netcode, and zero-defect runtime systems that captivate millions of players worldwide.
            </p>
          </div>

          <!-- Strategic Directives -->
          <div class="space-y-2">
            <div class="text-[11px] font-mono text-white font-black uppercase tracking-widest flex items-center gap-2">
              <span class="text-[#E60012]">◆</span> STRATEGIC INFILTRATION DIRECTIVES:
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div class="bg-black/60 border border-zinc-800 p-2.5">
                <div class="text-[11px] font-mono text-[#FFDE00] font-black">01. 120 FPS LOCK</div>
                <div class="text-xs text-zinc-300 font-mono mt-1">
                  Enforce an 8.33ms frame budget across all rendering and gameplay threads with Tracy/Insights profiling.
                </div>
              </div>
              <div class="bg-black/60 border border-zinc-800 p-2.5">
                <div class="text-[11px] font-mono text-[#FFDE00] font-black">02. MEMORY & ECS</div>
                <div class="text-xs text-zinc-300 font-mono mt-1">
                  Zero heap allocation during combat loops via Frame-Transient Linear Allocators and SoA SIMD vectorization.
                </div>
              </div>
              <div class="bg-black/60 border border-zinc-800 p-2.5">
                <div class="text-[11px] font-mono text-[#FFDE00] font-black">03. BATON PASS TEAM</div>
                <div class="text-xs text-zinc-300 font-mono mt-1">
                  Lead empathetic, high-velocity code reviews (&lt;4h turnaround) and empower tech art, audio, and design.
                </div>
              </div>
            </div>
          </div>

          <!-- Operative Assignment Matrix -->
          <div class="border border-zinc-800 bg-black/40 p-3">
            <div class="text-[11px] font-mono text-[#FFDE00] font-bold uppercase tracking-widest mb-2">
              🎭 PHANTOM THIEVES TACTICAL ROSTER:
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div class="bg-zinc-900/80 p-2 border-l-2 border-[#E60012]">
                <span class="text-white font-bold block">JOKER (DAFFA)</span>
                <span class="text-zinc-400 text-[10px]">Lead Architecture</span>
              </div>
              <div class="bg-zinc-900/80 p-2 border-l-2 border-[#FFDE00]">
                <span class="text-white font-bold block">MORGANA</span>
                <span class="text-zinc-400 text-[10px]">Field Telemetry &amp; QA</span>
              </div>
              <div class="bg-zinc-900/80 p-2 border-l-2 border-[#E60012]">
                <span class="text-white font-bold block">SKULL</span>
                <span class="text-zinc-400 text-[10px]">Impact Combat &amp; Physics</span>
              </div>
              <div class="bg-zinc-900/80 p-2 border-l-2 border-[#FFDE00]">
                <span class="text-white font-bold block">PANTHER</span>
                <span class="text-zinc-400 text-[10px]">HLSL Compute Shaders</span>
              </div>
              <div class="bg-zinc-900/80 p-2 border-l-2 border-[#00F0FF]">
                <span class="text-white font-bold block">FOX</span>
                <span class="text-zinc-400 text-[10px]">Stylized PBR &amp; Art</span>
              </div>
              <div class="bg-zinc-900/80 p-2 border-l-2 border-[#E60012]">
                <span class="text-white font-bold block">QUEEN</span>
                <span class="text-zinc-400 text-[10px]">Rollback Netcode</span>
              </div>
              <div class="bg-zinc-900/80 p-2 border-l-2 border-[#FFDE00]">
                <span class="text-white font-bold block">ORACLE</span>
                <span class="text-zinc-400 text-[10px]">CI/CD &amp; Automation</span>
              </div>
              <div class="bg-zinc-900/80 p-2 border-l-2 border-[#E60012]">
                <span class="text-white font-bold block">NOIR</span>
                <span class="text-zinc-400 text-[10px]">Memory Allocators</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="manual-footer mt-4 pt-3 border-t border-zinc-800 flex flex-wrap justify-between items-center gap-2">
          <div class="text-[11px] font-mono text-zinc-400">
            SHORTCUT: <span class="text-[#FFDE00] font-bold">[M]</span> OR TYPE <span class="text-[#FFDE00] font-bold">/goal</span>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="btn-theurgy-strike" id="btn-goal-dispatch-card" style="background:#E60012; color:#fff; font-size:0.75rem; padding:0.4rem 0.8rem;">
              <span>⚡ DISPATCH CALLING CARD</span>
            </button>
            <button type="button" class="btn-theurgy-strike" id="btn-close-goal-modal" style="background:#000; border-color:#fff; color:#fff; font-size:0.75rem; padding:0.4rem 0.8rem;">
              <span>CLOSE [ESC]</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlayEl = overlay;
  }

  private bindEvents(): void {
    const closeBtn = document.getElementById('btn-close-goal-modal');
    const dispatchBtn = document.getElementById('btn-goal-dispatch-card');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    if (dispatchBtn) {
      dispatchBtn.addEventListener('click', () => {
        this.close();
        // Switch to calling card contact tab
        const contactBtn = document.querySelector<HTMLElement>('[data-tab="tab-contact"]');
        if (contactBtn) contactBtn.click();
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

    // Trigger on .p5-goal-ribbon or buttons with class .btn-trigger-goal
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.p5-goal-ribbon, .btn-trigger-goal, #btn-trigger-goal')) {
        this.open();
      }
    });
  }

  public open(): void {
    if (!this.overlayEl) this.createDom();
    if (!this.overlayEl) return;

    this.overlayEl.classList.remove('hidden');
    // Force reflow for animation
    void this.overlayEl.offsetWidth;
    this.overlayEl.classList.add('visible');
    this.isModalOpen = true;
    p5rAudio.playMenuOpen();
  }

  public close(): void {
    if (!this.overlayEl || !this.isModalOpen) return;

    this.overlayEl.classList.remove('visible');
    p5rAudio.playMenuBack();
    setTimeout(() => {
      if (this.overlayEl && !this.isModalOpen) {
        this.overlayEl.classList.add('hidden');
      }
    }, 220);
    this.isModalOpen = false;
  }

  public isOpen(): boolean {
    return this.isModalOpen;
  }

  public destroy(): void {
    if (this.overlayEl) {
      this.overlayEl.remove();
      this.overlayEl = null;
    }
    this.isModalOpen = false;
  }
}

export const goalModalController: GoalModalController = new GoalModalControllerImpl();
