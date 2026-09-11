/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - PALACE HEIST & TECHNICAL INTERVIEW SCHEDULER
 * File: src/ui/scheduleModal.ts
 *
 * Implements the authentic Persona 5 schedule / briefing request modal:
 *  - Triggered by clicking #btn-schedule-heist, pressing [S], or typing /schedule
 *  - Lets recruiters, producers, and engineering leads schedule briefings:
 *    - Full-time Studio Role, Engine Architecture, 120 FPS Profiling, etc.
 *    - Timezone selection (WIB, JST, PST, EST, UTC) & preferred platform
 *  - Displays authentic Phantom Thief confirmation stamp & sound effects
 *  - Full ESC / click-backdrop dismiss with menu_back audio
 * ==========================================================================
 */

import { p5rAudio } from '../audio/p5rAudio';

export interface ScheduleModalController {
  init(): void;
  open(): void;
  close(): void;
  isOpen(): boolean;
  destroy(): void;
}

class ScheduleModalControllerImpl implements ScheduleModalController {
  private overlayEl: HTMLElement | null = null;
  private isModalOpen: boolean = false;

  public init(): void {
    if (typeof document === 'undefined') return;
    this.createDom();
    this.bindEvents();
  }

  private createDom(): void {
    if (document.getElementById('p5-schedule-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'p5-schedule-modal';
    overlay.className = 'p5-modal-backdrop hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'schedule-modal-title');

    overlay.innerHTML = `
      <div class="p5-manual-card p5-schedule-card p5-card-frame">
        <div class="manual-header">
          <div class="section-tag"><span>METAVERSE INFILTRATION // DISPATCH</span></div>
          <h2 class="manual-title" id="schedule-modal-title">
            SCHEDULE PALACE HEIST BRIEFING
          </h2>
          <div class="manual-subtitle">
            REQUEST DIRECT TECHNICAL CONSULTATION OR STUDIO INTERVIEW WITH JOKER
          </div>
        </div>

        <div class="manual-body schedule-modal-body">
          <form id="schedule-briefing-form" class="space-y-4">
            <!-- Objective Type -->
            <div>
              <label class="schedule-form-label">
                🎯 MISSION OBJECTIVE / INTERVIEW TOPIC:
              </label>
              <div class="schedule-objective-grid">
                <button type="button" class="btn-schedule-obj selected" data-obj="FULL-TIME STUDIO ROLE">
                  <span>🎮 FULL-TIME STUDIO ROLE (LEAD/SENIOR)</span>
                </button>
                <button type="button" class="btn-schedule-obj" data-obj="ENGINE ARCHITECTURE CONSULTING">
                  <span>⚙️ ENGINE & SHADER ARCHITECTURE</span>
                </button>
                <button type="button" class="btn-schedule-obj" data-obj="120 FPS PERFORMANCE AUDIT">
                  <span>⚡ 120 FPS PERFORMANCE & PROFILING AUDIT</span>
                </button>
                <button type="button" class="btn-schedule-obj" data-obj="TECHNICAL DUE DILIGENCE">
                  <span>🔍 TECHNICAL DUE DILIGENCE / CODE REVIEW</span>
                </button>
              </div>
            </div>

            <!-- Platform & Timezone -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="schedule-form-label" for="schedule-platform">
                  📡 COMMUNICATIONS PLATFORM:
                </label>
                <select id="schedule-platform" class="schedule-input-select">
                  <option value="Google Meet">Google Meet (Recommended)</option>
                  <option value="Discord Dev Call">Discord Video / Screenshare</option>
                  <option value="Zoom">Zoom Conference</option>
                  <option value="Studio DevKit Call">Studio Dedicated DevKit Call</option>
                </select>
              </div>

              <div>
                <label class="schedule-form-label" for="schedule-timezone">
                  🌐 TIMEZONE COORDINATES:
                </label>
                <select id="schedule-timezone" class="schedule-input-select">
                  <option value="WIB (UTC+7 - Jakarta)">WIB (UTC+7 - Jakarta / Bangkok)</option>
                  <option value="JST (UTC+9 - Tokyo)">JST (UTC+9 - Tokyo / Seoul)</option>
                  <option value="PST (UTC-8 - US West)">PST (UTC-8 - San Francisco / LA)</option>
                  <option value="EST (UTC-5 - US East)">EST (UTC-5 - New York / Montreal)</option>
                  <option value="UTC (GMT - London)">UTC / GMT (London / Western Europe)</option>
                </select>
              </div>
            </div>

            <!-- Date & Duration -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="schedule-form-label" for="schedule-date">
                  📅 PROPOSED HEIST DATE:
                </label>
                <input type="date" id="schedule-date" class="schedule-input-field" required />
              </div>

              <div>
                <label class="schedule-form-label" for="schedule-duration">
                  ⏱️ ESTIMATED MISSION WINDOW:
                </label>
                <select id="schedule-duration" class="schedule-input-select">
                  <option value="30 mins">30-Min Fast-Track Briefing</option>
                  <option value="45 mins">45-Min Technical Q&A</option>
                  <option value="60 mins">60-Min In-Depth Architecture Deep Dive</option>
                </select>
              </div>
            </div>

            <!-- Recruiter / Studio Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="schedule-form-label" for="schedule-name">
                  👤 OPERATIVE NAME / STUDIO:
                </label>
                <input type="text" id="schedule-name" class="schedule-input-field" placeholder="e.g. Makoto Niijima // Atlus Studios" required />
              </div>

              <div>
                <label class="schedule-form-label" for="schedule-email">
                  📨 TRANSMISSION FREQUENCY (EMAIL):
                </label>
                <input type="email" id="schedule-email" class="schedule-input-field" placeholder="producer@gamestudio.com" required />
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="schedule-form-label" for="schedule-notes">
                📝 HEIST BRIEFING DETAILS / REPOSITORY CONTEXT:
              </label>
              <textarea id="schedule-notes" class="schedule-input-field h-20 resize-none" placeholder="Share your game engine stack, target platforms (PC/Console/Mobile), or role requirements..."></textarea>
            </div>

            <!-- Feedback Message -->
            <div id="schedule-feedback" class="hidden"></div>

            <!-- Submit Button -->
            <div class="pt-2 flex flex-wrap justify-between items-center gap-3">
              <div class="text-[11px] font-mono text-[#FFDE00]">
                "WE WILL STEAL YOUR TECHNICAL BOTTLENECKS!"
              </div>
              <button type="submit" id="btn-submit-schedule" class="btn-theurgy-strike">
                <span>⚡ DISPATCH HEIST INVITATION ▶</span>
              </button>
            </div>
          </form>

          <!-- Success State -->
          <div id="schedule-success-panel" class="hidden text-center py-6">
            <div class="schedule-cleared-stamp">
              ★ HEIST BRIEFING SCHEDULED ★
            </div>
            <h3 class="text-xl font-title font-black text-white mt-4 uppercase">
              TRANSMISSION RECEIVED BY JOKER
            </h3>
            <div class="text-xs font-mono text-zinc-300 max-w-md mx-auto mt-2 leading-relaxed" id="schedule-success-details">
              Your briefing coordinates have been logged into the Metaverse infiltration register. Daffa will confirm your calendar slot within 24 hours.
            </div>
            <div class="mt-6 flex justify-center gap-4">
              <button type="button" id="btn-schedule-another" class="project-link-btn demo-btn">
                <span>SCHEDULE ANOTHER SESSION</span>
              </button>
              <button type="button" id="btn-schedule-done" class="btn-theurgy-strike">
                <span>RETURN TO PALACE [ESC]</span>
              </button>
            </div>
          </div>
        </div>

        <div class="manual-footer flex justify-between items-center mt-4">
          <div class="text-xs font-mono text-[#FFDE00] hidden sm:block">
            DIRECT CALENDAR FREQUENCY: DAFFA // LEAD SYSTEMS ARCHITECT
          </div>
          <button type="button" class="project-link-btn github-btn" id="btn-close-schedule-modal">
            <span>DISMISS ▶ [ESC]</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlayEl = overlay;

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = overlay.querySelector<HTMLInputElement>('#schedule-date');
    if (dateInput) {
      dateInput.value = tomorrow.toISOString().split('T')[0];
    }
  }

  private bindEvents(): void {
    if (!this.overlayEl) return;

    // Close button
    const closeBtn = document.getElementById('btn-close-schedule-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Done button in success state
    const doneBtn = document.getElementById('btn-schedule-done');
    if (doneBtn) {
      doneBtn.addEventListener('click', () => this.close());
    }

    // Reset button
    const resetBtn = document.getElementById('btn-schedule-another');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        p5rAudio.playConfirm();
        const form = document.getElementById('schedule-briefing-form') as HTMLFormElement;
        const success = document.getElementById('schedule-success-panel');
        if (form) {
          form.reset();
          form.classList.remove('hidden');
        }
        if (success) success.classList.add('hidden');
      });
    }

    // Backdrop click dismiss
    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) {
        this.close();
      }
    });

    // Objective buttons toggle
    const objBtns = this.overlayEl.querySelectorAll<HTMLElement>('.btn-schedule-obj');
    objBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        p5rAudio.playMenuNavigate();
        objBtns.forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    // Form submission
    const form = document.getElementById('schedule-briefing-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit(form);
      });
    }

    // Global triggers (buttons with #btn-schedule-heist or data-schedule-trigger)
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('#btn-schedule-heist, .btn-schedule-heist, [data-trigger="schedule"]')) {
        e.preventDefault();
        this.open();
      }
    });
  }

  private handleSubmit(form: HTMLFormElement): void {
    const nameInput = document.getElementById('schedule-name') as HTMLInputElement;
    const emailInput = document.getElementById('schedule-email') as HTMLInputElement;
    const dateInput = document.getElementById('schedule-date') as HTMLInputElement;
    const tzSelect = document.getElementById('schedule-timezone') as HTMLSelectElement;
    const platformSelect = document.getElementById('schedule-platform') as HTMLSelectElement;
    const durationSelect = document.getElementById('schedule-duration') as HTMLSelectElement;
    const submitBtn = document.getElementById('btn-submit-schedule') as HTMLButtonElement;
    const feedback = document.getElementById('schedule-feedback');
    const successPanel = document.getElementById('schedule-success-panel');
    const successDetails = document.getElementById('schedule-success-details');

    const name = nameInput?.value.trim() || '';
    const email = emailInput?.value.trim() || '';

    if (!name || !email) {
      if (feedback) {
        feedback.className = 'p-2 bg-black border border-[#E60012] text-xs font-mono text-[#FFDE00]';
        feedback.textContent = '⚠️ REQUIRED: Enter your name/studio and direct email address!';
        feedback.classList.remove('hidden');
      }
      p5rAudio.playMenuBack();
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      if (feedback) {
        feedback.className = 'p-2 bg-black border border-[#E60012] text-xs font-mono text-[#FFDE00]';
        feedback.textContent = '⚠️ FREQUENCY ERROR: Invalid email address format!';
        feedback.classList.remove('hidden');
      }
      p5rAudio.playMenuBack();
      return;
    }

    if (feedback) feedback.classList.add('hidden');

    // Transmitting state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⚡ TRANSMITTING COORDINATES...</span>';
    }
    p5rAudio.playConfirm();

    setTimeout(() => {
      p5rAudio.playAoaFinish();
      form.classList.add('hidden');
      if (successPanel) {
        successPanel.classList.remove('hidden');
      }
      if (successDetails) {
        const selectedObj = this.overlayEl?.querySelector('.btn-schedule-obj.selected span')?.textContent || 'Studio Briefing';
        successDetails.innerHTML = `
          <strong>TARGET:</strong> ${name.toUpperCase()}<br/>
          <strong>OBJECTIVE:</strong> ${selectedObj}<br/>
          <strong>TIMEZONE:</strong> ${tzSelect?.value || 'WIB'}<br/>
          <strong>WINDOW:</strong> ${dateInput?.value || 'Tomorrow'} (${durationSelect?.value || '30 mins'}) via ${platformSelect?.value || 'Google Meet'}<br/>
          <span class="text-[#FFDE00]">Confirmation dispatched to ${email}.</span>
        `;
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>⚡ DISPATCH HEIST INVITATION ▶</span>';
      }
    }, 900);
  }

  public open(): void {
    if (!this.overlayEl) this.createDom();
    if (!this.overlayEl) return;

    p5rAudio.playMenuOpen();
    this.overlayEl.classList.remove('hidden');
    requestAnimationFrame(() => {
      this.overlayEl?.classList.add('visible');
      document.body.classList.add('modal-open');
      this.isModalOpen = true;
    });
  }

  public close(): void {
    if (!this.overlayEl || !this.isModalOpen) return;

    p5rAudio.playMenuBack();
    this.overlayEl.classList.remove('visible');
    setTimeout(() => {
      this.overlayEl?.classList.add('hidden');
      document.body.classList.remove('modal-open');
      this.isModalOpen = false;
    }, 250);
  }

  public isOpen(): boolean {
    return this.isModalOpen;
  }

  public destroy(): void {
    if (this.overlayEl && this.overlayEl.parentNode) {
      this.overlayEl.parentNode.removeChild(this.overlayEl);
    }
    this.overlayEl = null;
    this.isModalOpen = false;
  }
}

export const scheduleModalController: ScheduleModalController = new ScheduleModalControllerImpl();
