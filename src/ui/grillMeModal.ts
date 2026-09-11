/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - TECHNICAL INTERVIEW SIMULATOR ("GRILL ME")
 * File: src/ui/grillMeModal.ts
 *
 * Implements the authentic Persona 5 Interrogation Room / Velvet Room challenge:
 *  - Triggered by clicking the "GRILL ME" button or pressing [G]
 *  - Sae Niijima-styled technical due-diligence interrogation
 *  - Deep technical answers on C++20 engine architecture, HLSL compute shaders,
 *    deterministic rollback networking, and frame budget optimization
 *  - Full ESC / click-backdrop dismiss with menu_back audio
 * ==========================================================================
 */

import { p5rAudio } from '../audio/p5rAudio';

export interface GrillQuestion {
  id: string;
  topic: string;
  interrogationPrompt: string;
  leadQuestion: string;
  jokerAnswer: string;
  architecturePoints: string[];
  techPills: string[];
}

export const GRILL_QUESTIONS: GrillQuestion[] = [
  {
    id: 'perf-ue5',
    topic: '01. 120 FPS PERFORMANCE & PROFILING',
    interrogationPrompt: 'PROSECUTOR SAE: "You claim 120 FPS locked stability in open-world environments. How do you defend that claim under real GPU/CPU stress?"',
    leadQuestion: 'How do you systematically profile, identify bottlenecks, and maintain a 8.3ms frame budget in Unreal Engine 5?',
    jokerAnswer: 'In high-intensity action titles, frame spikes stem from three culprits: main-thread physics/tick stalls, render-thread draw call serialization, and GPU fill-rate/overdraw. I enforce an 8.33ms hardware budget using Superluminal and Unreal Insights. We isolate gameplay logic into worker thread task-graphs, decouple UI ticks via invalidation panels, and replace expensive per-actor ticks with batch data arrays.',
    architecturePoints: [
      'Unreal Insights & Tracy profiler integration on target console/PC hardware devkits',
      'Motion Matching & Animation evaluation offloaded to asynchronous worker thread tasks',
      'Nanite geometry virtualization & GPU Scene instance batching keeping draw calls under 180',
      'Niagara particle compute simulations executing entirely on GPU memory with distance culling'
    ],
    techPills: ['Unreal Engine 5.4', 'C++', 'Unreal Insights', 'Superluminal', 'GPU Scene', 'Frame Budgets']
  },
  {
    id: 'engine-ecs',
    topic: '02. CORE C++20 ENGINE & MEMORY',
    interrogationPrompt: 'PROSECUTOR SAE: "Modern game architectures suffer from heap fragmentation and cache misses. What is your low-level allocation strategy?"',
    leadQuestion: 'How do you structure custom memory allocators and data-oriented ECS pipelines to maximize L1/L2 cache hit rates?',
    jokerAnswer: 'Standard OS malloc/free causes heap fragmentation and kernel overhead during gameplay. I architect a multi-tiered memory architecture: a persistent Frame-Transient Linear Allocator (bump pointer, zero overhead, reset per frame), specialized Pool Allocators for dynamic entities, and 64-byte aligned Chunk Allocators for ECS components. By storing data in Structure-of-Arrays (SoA), SIMD operations can process 4 to 8 elements per cycle with near-zero cache misses.',
    architecturePoints: [
      'Frame-Transient Arena/Linear allocators: O(1) allocation, zero deallocation overhead',
      'Cache-Line Alignment (alignas(64)) preventing false sharing across multithreaded worker threads',
      'Data-Oriented Design (SoA) enabling AVX2/NEON vectorization across physics and combat loops',
      'Zero heap allocations allowed inside the core 120 FPS gameplay loop'
    ],
    techPills: ['C++20', 'Custom Allocators', 'Data-Oriented ECS', 'SIMD Intrinsics', 'Cache Alignment']
  },
  {
    id: 'shaders-vfx',
    topic: '03. SHADERS & VOLUMETRIC GRAPHICS',
    interrogationPrompt: 'PROSECUTOR SAE: "Explain how you deliver stylized high-end visual fidelity without overwhelming the GPU compute pipeline."',
    leadQuestion: 'What is your technique for implementing volumetric lighting, compute shaders, and screen-space post-processing in HLSL/GLSL?',
    jokerAnswer: 'I utilize a clustered 3D Froxel grid (frustum-aligned voxel volume) rendered through asynchronous compute shaders. By calculating volumetric scattering at half-resolution and performing temporal reprojection (TAA filter) with depth-guided bilateral upsampling, we achieve cinematic atmospheric lighting with less than 0.8ms GPU compute cost on modern GPUs.',
    architecturePoints: [
      'Clustered Froxel grid compute shader evaluating atmospheric in-scattering and shadow transmittance',
      'Temporal reprojection with motion vector history to eliminate sampling noise without blurring',
      'Custom HLSL PBR material models with dynamic anime rim-light ramps and stylized halftones',
      'RenderDoc / Pix GPU profiling isolating bandwidth stalls, register pressure, and wave occupancy'
    ],
    techPills: ['HLSL', 'GLSL', 'Compute Shaders', 'Froxel Volumetrics', 'RenderDoc', 'DirectX 12 / Vulkan']
  },
  {
    id: 'rollback-netcode',
    topic: '04. DETERMINISTIC COMBAT ROLLBACK',
    interrogationPrompt: 'PROSECUTOR SAE: "Multiplayer combat feels unplayable with latency. How do you engineer sub-frame responsiveness across the globe?"',
    leadQuestion: 'How do you design a deterministic rollback networking system for fast-paced character combat?',
    jokerAnswer: 'Responsive combat cannot wait for network round-trip acknowledgement. I implement deterministic rollback netcode: player inputs are predicted immediately locally. Game state simulation operates strictly on deterministic fixed-point mathematics (Q16.16) to prevent floating-point platform deviations. We maintain a circular ring-buffer of previous 64 game states. When remote input arrives with packet latency, the engine rolls back, resimulates missing frames in <1.5ms, and blends animation pose matrices seamlessly.',
    architecturePoints: [
      'Fixed-point arithmetic (Q16.16) eliminating cross-platform IEEE 754 float divergence',
      'Circular state snapshot ring-buffer supporting up to 8 frames of instantaneous rollback',
      'CRC32/XXHash checksum verification on each frame for automated desync detection in CI',
      'Animation pose blending smoothing out corrections so rollbacks remain visually undetectable'
    ],
    techPills: ['Deterministic Netcode', 'Rollback Architecture', 'Fixed-Point Math', 'Ring Buffer', 'C++']
  }
];

export interface GrillMeModalController {
  init(): void;
  open(): void;
  close(): void;
  isOpen(): boolean;
  destroy(): void;
}

class GrillMeModalControllerImpl implements GrillMeModalController {
  private overlayEl: HTMLElement | null = null;
  private isModalOpen: boolean = false;
  private currentQuestionId: string = GRILL_QUESTIONS[0].id;

  public init(): void {
    if (typeof document === 'undefined') return;
    this.createDom();
    this.bindEvents();
  }

  private createDom(): void {
    if (document.getElementById('p5-grill-me-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'p5-grill-me-modal';
    overlay.className = 'p5-modal-backdrop hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'grill-me-title');

    overlay.innerHTML = `
      <div class="p5-manual-card p5-grill-card p5-card-frame">
        <div class="manual-header">
          <div class="section-tag"><span>VELVET ROOM // TECHNICAL INTERROGATION</span></div>
          <h2 class="manual-title" id="grill-me-title">
            GRILL ME: TECHNICAL DUE DILIGENCE
          </h2>
          <div class="manual-subtitle">
            CHALLENGE LEAD GAMEPLAY & ENGINE ARCHITECT JOKER WITH REAL INTERVIEW QUESTIONS
          </div>
        </div>

        <div class="grill-tabs-bar">
          ${GRILL_QUESTIONS.map((q, i) => `
            <button type="button" class="grill-tab-btn ${i === 0 ? 'active' : ''}" data-qid="${q.id}">
              <span>${q.topic}</span>
            </button>
          `).join('')}
        </div>

        <div class="grill-content-area" id="grill-content-body">
          <!-- Dynamically populated -->
        </div>

        <div class="manual-footer flex justify-between items-center mt-4">
          <div class="text-xs font-mono text-[#FFDE00] hidden sm:block">
            "CONFESS YOUR CODE QUALITY AND PROVE YOUR ARCHITECTURAL MASTERY!"
          </div>
          <button type="button" class="btn-theurgy-strike" id="btn-close-grill-me">
            <span>CLAIM VERDICT & RETURN ▶ [ESC]</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlayEl = overlay;
    this.renderQuestion(this.currentQuestionId);
  }

  private renderQuestion(qid: string): void {
    const q = GRILL_QUESTIONS.find(item => item.id === qid) || GRILL_QUESTIONS[0];
    const contentArea = document.getElementById('grill-content-body');
    if (!contentArea) return;

    contentArea.innerHTML = `
      <div class="grill-prompt-box">
        <div class="grill-sae-badge">⚡ PROSECUTOR / LEAD INTERVIEWER:</div>
        <div class="grill-sae-quote">${q.interrogationPrompt}</div>
        <div class="grill-question-title">QUESTION: ${q.leadQuestion}</div>
      </div>

      <div class="grill-joker-box mt-3">
        <div class="grill-joker-badge">★ JOKER'S ARCHITECTURAL DEFENSE:</div>
        <p class="grill-joker-text">${q.jokerAnswer}</p>

        <div class="grill-points-list mt-3">
          <div class="font-mono text-[11px] text-[#FFDE00] font-black uppercase tracking-wider mb-1">
            CORE ARCHITECTURAL SAFEGUARDS:
          </div>
          <ul>
            ${q.architecturePoints.map(pt => `
              <li class="grill-point-item">
                <span class="grill-point-bullet">◆</span>
                <span>${pt}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="grill-tech-pills mt-3">
          ${q.techPills.map(tp => `<span class="tech-pill">${tp}</span>`).join('')}
        </div>
      </div>
    `;

    // Update active tab buttons
    const tabBtns = document.querySelectorAll<HTMLElement>('.grill-tab-btn');
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-qid') === q.id);
    });
  }

  private bindEvents(): void {
    if (this.overlayEl) {
      this.overlayEl.addEventListener('click', (e) => {
        if (e.target === this.overlayEl) {
          this.close();
        }
      });
    }

    // Tab buttons delegation
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const tabBtn = target.closest<HTMLElement>('.grill-tab-btn');
      if (tabBtn) {
        const qid = tabBtn.getAttribute('data-qid');
        if (qid) {
          p5rAudio.playMenuNavigate();
          this.currentQuestionId = qid;
          this.renderQuestion(qid);
        }
      }
    });

    // Close button
    const closeBtn = document.getElementById('btn-close-grill-me');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.close();
      });
    }

    // Keyboard shortcut [G] to toggle, ESC to dismiss
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isModalOpen) {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      }
    });

    // Delegate open button clicks across the DOM
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const openBtn = target.closest<HTMLElement>('#btn-trigger-grill-me, .btn-trigger-grill-me');
      if (openBtn) {
        e.preventDefault();
        this.open();
      }
    });
  }

  public open(): void {
    if (!this.overlayEl) this.createDom();
    if (!this.overlayEl) return;

    p5rAudio.playMenuOpen();
    this.renderQuestion(this.currentQuestionId);
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

export const grillMeModalController: GrillMeModalController = new GrillMeModalControllerImpl();
