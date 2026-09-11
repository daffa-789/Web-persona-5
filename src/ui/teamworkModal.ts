/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - STUDIO TEAMWORK & AGILE COOPERATION MODAL
 * File: src/ui/teamworkModal.ts
 *
 * Implements the authentic Persona 5 "Baton Pass" Teamwork & Agile Studio
 * Cooperation Blueprint:
 *  - Triggered by clicking #btn-teamwork-preview, pressing [T], or typing /teamwork-preview
 *  - Displays Daffa's proven cross-discipline teamwork methodologies:
 *      1. Baton Pass Code Reviews (Strict, empathetic, high-velocity)
 *      2. Cross-Discipline Synergy (Engine <-> Tech Art <-> Level Design)
 *      3. Version Control & CI/CD Pipelines (Perforce / Git LFS / Automated Packaging)
 *      4. Agile Sprint Cadence & Zero-Blocker Policy
 *      5. Engineering Mentorship & Architecture RFCs (TDDs)
 *  - Full ESC / click-backdrop dismiss with menu_back audio
 * ==========================================================================
 */

import { p5rAudio } from '../audio/p5rAudio';

export interface TeamworkPillar {
  id: string;
  tabLabel: string;
  codename: string;
  headline: string;
  summary: string;
  metrics: { label: string; value: string }[];
  rules: string[];
  deliverables: string[];
}

export const TEAMWORK_PILLARS: TeamworkPillar[] = [
  {
    id: 'code-reviews',
    tabLabel: '01. BATON PASS CODE REVIEWS',
    codename: 'PROTOCOL: ZERO DEFECT PASS',
    headline: 'High-Velocity, Empathetic & Architecturally Rigorous Code Reviews',
    summary: 'Just like a seamless Baton Pass in combat, code handoffs must amplify team momentum without introducing technical debt. I champion peer reviews that focus on cache alignment, thread safety, memory leak prevention, and maintainability—delivered with constructive kindness and turnaround under 4 hours.',
    metrics: [
      { label: 'AVERAGE PR TURNAROUND', value: '< 4 Hours' },
      { label: 'CI STATIC ANALYSIS', value: '100% Automated' },
      { label: 'REGRESSION PREVENTION', value: 'Zero P0 Leaks' }
    ],
    rules: [
      'Automated Clang-Tidy, SonarQube, and AddressSanitizer (ASan) CI gates must be green before human review',
      'Architecture First: Verify memory layout (SoA vs AoS) and cache-line alignment on performance-critical loops',
      'Blameless Collaboration: Frame all critique around code behavior, platform targets, and team conventions',
      'Small, atomic pull requests (<350 lines) enabling rapid validation without cognitive fatigue'
    ],
    deliverables: [
      'Established studio-wide C++20 and Unreal Engine 5 coding standard guidelines',
      'Integrated automated CI pre-merge benchmarks tracking frame budget deviations',
      'Created standardized PR templates with profiling captures and video gameplay proofs'
    ]
  },
  {
    id: 'cross-discipline',
    tabLabel: '02. CROSS-DISCIPLINE SYNERGY',
    codename: 'PROTOCOL: TECHNICAL ALLIANCE',
    headline: 'Bridging Engine Architecture with Art, Animation & Design Workflows',
    summary: 'A game engine is only as good as the creative freedom it unlocks. I bridge the gap between low-level native systems and creative team members—building custom Dear ImGui visual editors, HLSL shader graph nodes, and artist-friendly validation tools that eliminate friction.',
    metrics: [
      { label: 'DESIGNER WORKFLOW VELOCITY', value: '3x Faster' },
      { label: 'TOOL CRASH RATE', value: '< 0.01%' },
      { label: 'ARTIST ASSET VALIDATION', value: 'Automated' }
    ],
    rules: [
      'Empower Technical Artists: Build custom HLSL material functions and Niagara GPU data interfaces',
      'Designer Autonomy: Expose deterministic gameplay parameters via node graphs without hardcoding',
      'Immediate Feedback: Provide in-editor telemetry showing live draw calls, polygon counts, and shader instruction counts',
      'Weekly cross-discipline syncs to identify tooling bottlenecks before production milestones'
    ],
    deliverables: [
      'Developed node-based behavior tree editor in Dear ImGui boosting designer iteration velocity',
      'Created automated asset import sanitizers verifying texture power-of-two and vertex bounds',
      'Architected customizable gameplay ability system (GAS) data tables for rapid weapon balancing'
    ]
  },
  {
    id: 'cicd-vcs',
    tabLabel: '03. VERSION CONTROL & CI/CD',
    codename: 'PROTOCOL: PERFORCE & PIPELINES',
    headline: 'Trunk-Based Development, Automated Packaging & Nightly Builds',
    summary: 'Seamless version control and build automation prevent team paralysis. Experienced in Perforce (P4) and Git LFS binary pipelines, managing multi-gigabyte AAA asset dependencies, and orchestrating automated nightly console (PS5, Xbox, PC) test builds.',
    metrics: [
      { label: 'NIGHTLY BUILD RELIABILITY', value: '99.4% Green' },
      { label: 'BINARY LOCKING CONFLICTS', value: '0 P4 Clashes' },
      { label: 'DEPLOYMENT TIME', value: '18 Mins to DevKits' }
    ],
    rules: [
      'Trunk-based development with short-lived feature branches and granular feature toggles',
      'Strict exclusive checkout locks on binary assets (uasset, fbx, blend, psd) in Perforce',
      'Automated nightly smoke tests playing back simulated gameplay recording deterministic replays',
      'Instant Slack/Discord webhook alerts with build logs when broken compilation occurs'
    ],
    deliverables: [
      'Built multi-platform CI/CD packaging pipeline using Unreal Automation Tool (UAT) and Jenkins',
      'Configured Git LFS and Perforce Helix Core sync caching saving 45 minutes of daily engineer sync time',
      'Authored automated crash-dump triage system linking callstacks directly to source revision'
    ]
  },
  {
    id: 'agile-velocity',
    tabLabel: '04. AGILE SPRINT VELOCITY',
    codename: 'PROTOCOL: SHADOW RESILIENCE',
    headline: 'Transparent Sprint Cadences, Spike Investigations & Blameless Culture',
    summary: 'Agile in game development requires flexibility for creative discovery while honoring firm release milestones. I facilitate structured 2-week sprints, proactive technical spikes to derisk high-risk features, and blameless retrospectives that turn bugs into institutional knowledge.',
    metrics: [
      { label: 'SPRINT BURNDOWN ACCURACY', value: '94% Predictable' },
      { label: 'BLOCKER RESOLUTION TIME', value: '< 2 Hours' },
      { label: 'TECHNICAL SPIKE SUCCESS', value: '100% De-risked' }
    ],
    rules: [
      'Proactive Technical Spikes: Spend 1-2 days prototyping engine unknowns before committing to roadmap',
      'Zero Blocker Policy: Swarm on production-blocking engine or tool failures immediately',
      'Actionable Retrospectives: Every post-mortem concludes with concrete preventative CI/tooling steps',
      'Transparent Burndown: Maintain clean Jira/Linear boards with realistic estimation based on velocity'
    ],
    deliverables: [
      'Led 12-member engineering & tech-art sprint team through 6 consecutive on-time milestone deliverables',
      'Authored comprehensive post-mortem documentation for high-profile physics desync fixes',
      'Mentored sprint planners on estimating low-level native engine tasks accurately'
    ]
  },
  {
    id: 'mentorship',
    tabLabel: '05. MENTORSHIP & ARCHITECTURE RFCS',
    codename: 'PROTOCOL: WILD CARD KNOWLEDGE',
    headline: 'Cultivating Talent & Authoring Collaborative Architecture RFCs',
    summary: 'A lead engineer multiplies team capability. I invest heavily in mentoring junior and mid-level programmers through pair programming, architectural design document (RFC) authoring, and fostering a psychologically safe learning environment where questions are celebrated.',
    metrics: [
      { label: 'ENGINEERS MENTORED', value: '15+ Programmers' },
      { label: 'ARCHITECTURE RFCS PASSED', value: '24+ Approved' },
      { label: 'RETENTION / PROMOTION', value: '100% Rate' }
    ],
    rules: [
      'Design Before Code: Author a 2-page Technical Design Document (RFC) for any system touching >3 files',
      'Dedicated Pair Programming: Weekly 1-on-1 code walkthroughs with junior gameplay engineers',
      'Encourage Wild Card Thinking: Support experimental prototypes and performance exploration days',
      'Champion Documentation: Ensure every system has inline Doxygen architecture summaries and flowcharts'
    ],
    deliverables: [
      'Created "Junior to Mid-Level Game Systems Engineer" onboarding roadmap and tutorial suite',
      'Chaired weekly Studio Architecture Forum reviewing engine design proposals and new tech evaluations',
      'Conducted 40+ technical interview loops assessing native systems candidates'
    ]
  }
];

export interface TeamworkModalController {
  init(): void;
  open(): void;
  close(): void;
  isOpen(): boolean;
  destroy(): void;
}

class TeamworkModalControllerImpl implements TeamworkModalController {
  private overlayEl: HTMLElement | null = null;
  private isModalOpen: boolean = false;
  private currentPillarId: string = TEAMWORK_PILLARS[0].id;

  public init(): void {
    if (typeof document === 'undefined') return;
    this.createDom();
    this.bindEvents();
  }

  private createDom(): void {
    if (document.getElementById('p5-teamwork-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'p5-teamwork-modal';
    overlay.className = 'p5-modal-backdrop hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'teamwork-modal-title');

    overlay.innerHTML = `
      <div class="p5-manual-card p5-teamwork-card p5-card-frame">
        <div class="manual-header">
          <div class="section-tag"><span>STUDIO COOPERATION // BATON PASS</span></div>
          <h2 class="manual-title" id="teamwork-modal-title">
            TEAMWORK & STUDIO COOPERATION BLUEPRINT
          </h2>
          <div class="manual-subtitle">
            CROSS-DISCIPLINE SYNERGY, BATON PASS CODE REVIEWS & AGILE VELOCITY
          </div>
        </div>

        <!-- Pillar Navigation Tabs -->
        <div class="grill-tabs-bar teamwork-tabs-bar">
          ${TEAMWORK_PILLARS.map((p, i) => `
            <button type="button" class="grill-tab-btn teamwork-tab-btn ${i === 0 ? 'active' : ''}" data-pid="${p.id}">
              <span>${p.tabLabel}</span>
            </button>
          `).join('')}
        </div>

        <!-- Dynamic Content Body -->
        <div class="grill-content-area" id="teamwork-content-body">
          <!-- Dynamically populated -->
        </div>

        <div class="manual-footer flex justify-between items-center mt-4">
          <div class="text-xs font-mono text-[#FFDE00] hidden sm:block">
            "A TRUE PHANTOM THIEF NEVER FIGHTS ALONE. BATON PASS TO VICTORY!"
          </div>
          <button type="button" class="btn-theurgy-strike" id="btn-close-teamwork-modal">
            <span>RETURN TO OPERATIONS ▶ [ESC]</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlayEl = overlay;
    this.renderPillar(this.currentPillarId);
  }

  private renderPillar(pillarId: string): void {
    const container = document.getElementById('teamwork-content-body');
    if (!container) return;

    const pillar = TEAMWORK_PILLARS.find(p => p.id === pillarId) || TEAMWORK_PILLARS[0];
    this.currentPillarId = pillar.id;

    container.innerHTML = `
      <div class="p5-teamwork-panel">
        <!-- Codename & Headline Banner -->
        <div class="teamwork-headline-box">
          <div class="font-mono text-xs font-black text-[#E60012] tracking-widest uppercase mb-1">
            ${pillar.codename}
          </div>
          <h3 class="text-xl font-title font-black text-white uppercase leading-tight">
            ${pillar.headline}
          </h3>
          <p class="text-xs font-mono text-zinc-300 mt-2 leading-relaxed">
            ${pillar.summary}
          </p>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          ${pillar.metrics.map(m => `
            <div class="teamwork-metric-box">
              <span class="text-[10px] font-mono text-[#888] uppercase font-black">${m.label}</span>
              <span class="text-lg font-title font-black text-[#FFDE00] mt-1">${m.value}</span>
            </div>
          `).join('')}
        </div>

        <!-- Two Column: Principles & Deliverables -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <!-- Principles -->
          <div class="bg-black/80 border border-zinc-800 p-3 [transform:skewX(-4deg)]">
            <div class="[transform:skewX(4deg)]">
              <div class="text-xs font-mono text-[#FFDE00] font-black uppercase mb-2 flex items-center gap-1">
                <span>⚡ OPERATIONAL PRINCIPLES:</span>
              </div>
              <ul class="space-y-2 text-xs text-zinc-300">
                ${pillar.rules.map(r => `
                  <li class="flex items-start gap-2">
                    <span class="text-[#E60012] font-black">▶</span>
                    <span>${r}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>

          <!-- Deliverables -->
          <div class="bg-black/80 border border-zinc-800 p-3 [transform:skewX(-4deg)]">
            <div class="[transform:skewX(4deg)]">
              <div class="text-xs font-mono text-[#E60012] font-black uppercase mb-2 flex items-center gap-1">
                <span>★ PROVEN DELIVERABLES & IMPACT:</span>
              </div>
              <ul class="space-y-2 text-xs text-zinc-300">
                ${pillar.deliverables.map(d => `
                  <li class="flex items-start gap-2">
                    <span class="text-[#FFDE00] font-black">◆</span>
                    <span>${d}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    if (!this.overlayEl) return;

    // Close button
    const closeBtn = document.getElementById('btn-close-teamwork-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Backdrop dismiss
    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) {
        this.close();
      }
    });

    // Tab buttons
    this.overlayEl.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('.teamwork-tabs-bar .teamwork-tab-btn');
      if (btn) {
        p5rAudio.playMenuNavigate();
        const pid = btn.getAttribute('data-pid');
        if (pid) {
          this.overlayEl?.querySelectorAll('.teamwork-tabs-bar .teamwork-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.renderPillar(pid);
        }
      }
    });

    // Global triggers
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('#btn-teamwork-preview, .btn-teamwork-preview, [data-trigger="teamwork"]')) {
        e.preventDefault();
        this.open();
      }
    });
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

export const teamworkModalController: TeamworkModalController = new TeamworkModalControllerImpl();
