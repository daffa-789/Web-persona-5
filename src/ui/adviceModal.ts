/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - STRATEGIC PORTFOLIO ADVICE & RECOMMENDATIONS (/advice, /sarannya)
 * File: src/ui/adviceModal.ts
 *
 * Implements the authentic Persona 5 Strategic Counsel modal answering
 * the user's request ("kamu buatkan sarannya"):
 *  - 5 High-Impact, Actionable Game Developer Career & Portfolio Recommendations
 *  - Full ESC / click-backdrop dismiss with menu_back audio
 * ==========================================================================
 */

import { p5rAudio } from '../audio/p5rAudio';

export interface AdviceItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  recommendation: string;
  actionItems: string[];
  impactLevel: 'CRITICAL' | 'HIGH-PRIORITY' | 'EXCELLENT';
}

export const STRATEGIC_ADVICE: AdviceItem[] = [
  {
    id: 'social-beacon',
    tag: '01. DEVELOPER BEACON // SOCIALS',
    title: 'Setup Profil Publik: GitHub, Itch.io & ArtStation (Unity & Blender)',
    subtitle: 'Saat ini semua link diset kosongan (offline). Berikut roadmap saat Daffa siap meluncurkannya:',
    recommendation: 'Recruiter game studio mencari 3 pilar: Kode Bersih Unity C# (GitHub), Bukti Game Bisa Dimainkan (Itch.io WebGL), dan Portofolio Model 3D Stylized (ArtStation). Tampilkan perpaduan programming dan 3D art yang solid.',
    actionItems: [
      'GitHub: Pinned 2-3 repo inti Unity 3D / C# dengan README visual kaya GIF gameplay, diagram arsitektur State Machine, dan zero-GC allocation benchmark.',
      'Itch.io: Upload 1-2 prototype game playable langsung di browser via Unity WebGL export. Recruiter lebih suka klik 1 detik daripada download zip .exe.',
      'LinkedIn: Gunakan headline tajam: "Lead Unity Developer & 3D Technical Artist | C# Gameplay, Blender Modeling, URP Shaders".',
      'ArtStation: Pajang model 3D Blender (wireframe quad topology, texture maps PBR, dan turntable render) untuk membuktikan kemampuan asset pipeline.'
    ],
    impactLevel: 'CRITICAL'
  },
  {
    id: 'web-showcase',
    tag: '02. PLAYABLE TECH PROTOTYPE',
    title: 'Integrasi Unity WebGL Live Playable Demos',
    subtitle: 'Maksimalkan fitur live demo dengan build Unity WebGL riil:',
    recommendation: 'Porting potongan prototype gameplay (misal: 3D character controller, combat combo system, atau particle VFX) langsung ke Unity WebGL. Ini membuktikan Daffa bisa memadukan modeling Blender dan programming Unity secara langsung di browser.',
    actionItems: [
      'Ekspor demo Unity C# ke WebGL dengan kompresi Brotli/Gzip optimal.',
      'Sematkan canvas WebGL langsung ke tab portofolio atau modal showcase.',
      'Sertakan live telemetry (FPS counter, draw call counter, batching metrics) agar recruiter teknis terkesan.'
    ],
    impactLevel: 'HIGH-PRIORITY'
  },
  {
    id: 'contact-pipeline',
    tag: '03. DIRECT DISPATCH // RECRUITER CONTACT',
    title: 'Hubungkan Direct Email Dispatch & Social Beacon',
    subtitle: 'Permudah recruiter studio game menghubungi Daffa secara instan:',
    recommendation: 'Recruiter game dev menyukai akses cepat 1-klik untuk menghubungi kandidat. Siapkan email langsung atau mailto dispatch di social beacon agar pesan lowongan dan tawaran kontrak bisa langsung diterima Daffa.',
    actionItems: [
      'Gunakan email profesional khusus game development (misal: contact@daffadev.com atau daffa.joker.dev@gmail.com).',
      'Tautkan akun LinkedIn, GitHub, dan ArtStation aktif di grid Confidant Repositories.',
      'Daffa akan menerima penawaran interview langsung dari studio game AAA maupun indie ternama!'
    ],
    impactLevel: 'HIGH-PRIORITY'
  },
  {
    id: 'profiling-proof',
    tag: '04. PROFILING & RETOPOLOGY SHOWCASE',
    title: 'Sertakan Bukti Video Unity Profiler & Blender Wireframe',
    subtitle: 'Ubah klaim kemampuan teknis menjadi bukti visual konkret:',
    recommendation: 'Lead Unity Developer & Technical Artist yang kredibel menyertakan visual frame time profiling (<16.6ms / 60 FPS) dan wireframe topology yang rapi tanpa non-manifold geometry.',
    actionItems: [
      'Rekam clip 30-45 detik Unity Profiler yang menunjukkan frame rate 60 FPS stabil tanpa Garbage Collection stall.',
      'Tampilkan visual Blender wireframe turntable yang memperlihatkan edge flow dan topology quad yang rapi.',
      'Tautkan video YouTube unlisted atau showcase visual di repository GitHub & ArtStation.'
    ],
    impactLevel: 'CRITICAL'
  },
  {
    id: 'audio-persistence',
    tag: '05. UX ACCESSIBILITY & AUDIO SETTINGS',
    title: 'Simpan Preferensi Audio & BGM di LocalStorage Browser',
    subtitle: 'Menjaga kenyamanan recruiter saat mengunjungi portfolio berulang kali:',
    recommendation: 'BGM "Last Surprise" dan audio SFX adalah jiwa dari portfolio Persona 5 ini. Untuk recruiter yang membuka tab di kantor, pastikan tombol mute/unmute mengingat preferensi mereka di LocalStorage agar tidak mengagetkan saat membuka ulang tab di pertemuan meeting.',
    actionItems: [
      'Simpan status p5rAudio.isMuted di localStorage.setItem("p5r_audio_muted", ...).',
      'Saat user mematikan suara sekali, jangan nyalakan kembali otomatis saat refresh browser.'
    ],
    impactLevel: 'EXCELLENT'
  }
];

export interface AdviceModalController {
  init(): void;
  open(): void;
  close(): void;
  isOpen(): boolean;
  destroy(): void;
}

class AdviceModalControllerImpl implements AdviceModalController {
  private overlayEl: HTMLElement | null = null;
  private isModalOpen: boolean = false;
  private activeAdviceId: string = STRATEGIC_ADVICE[0].id;

  public init(): void {
    if (typeof document === 'undefined') return;
    this.createDom();
    this.bindEvents();
  }

  private createDom(): void {
    const existing = document.getElementById('p5-advice-modal');
    if (existing) {
      this.overlayEl = existing;
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'p5-advice-modal';
    overlay.className = 'p5-modal-backdrop hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'advice-modal-title');

    overlay.innerHTML = `
      <div class="p5-manual-card p5-advice-card p5-card-frame">
        <!-- Header -->
        <div class="manual-header">
          <div class="section-tag"><span>PHANTOM THIEVES STRATEGIC COUNSEL // REKOMENDASI UNTUK DAFFA (/advice)</span></div>
          <h2 class="manual-title" id="advice-modal-title">
            REKOMENDASI &amp; SARAN STRATEGIS PORTFOLIO
          </h2>
          <div class="manual-subtitle">
            PANDUAN TAKTIS MEMAKSIMALKAN POTENSI KARIR LEAD GAMEPLAY &amp; ENGINE SYSTEMS PROGRAMMER
          </div>
        </div>

        <!-- Advice Tabs Bar -->
        <div class="grill-tabs-bar advice-tabs-bar">
          ${STRATEGIC_ADVICE.map((item, i) => `
            <button type="button" class="advice-tab-btn ${i === 0 ? 'active' : ''}" data-aid="${item.id}">
              <span>${item.tag.split('//')[0].trim()}</span>
            </button>
          `).join('')}
        </div>

        <!-- Dynamic Content Body -->
        <div class="grill-content-area" id="advice-content-body">
          <!-- Dynamically populated -->
        </div>

        <!-- Footer -->
        <div class="manual-footer mt-4 pt-3 border-t border-zinc-800 flex flex-wrap justify-between items-center gap-2">
          <div class="text-[11px] font-mono text-zinc-400">
            PERINTAH CEPAT: <span class="text-[#FFDE00] font-bold">/advice</span> ATAU <span class="text-[#FFDE00] font-bold">/sarannya</span>
          </div>
          <button type="button" class="btn-theurgy-strike" id="btn-close-advice-modal" style="background:#000; border-color:#fff; color:#fff; font-size:0.75rem; padding:0.4rem 0.8rem;">
            <span>TUTUP NASIHAT [ESC]</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlayEl = overlay;
    this.renderAdvice(this.activeAdviceId);
  }

  private renderAdvice(aid: string): void {
    const item = STRATEGIC_ADVICE.find(a => a.id === aid) || STRATEGIC_ADVICE[0];
    const contentArea = document.getElementById('advice-content-body');
    if (!contentArea) return;

    const badgeColor = item.impactLevel === 'CRITICAL' ? 'bg-[#E60012] text-white' : 'bg-[#FFDE00] text-black';

    contentArea.innerHTML = `
      <div class="border-2 border-[#E60012] bg-black/80 p-3 mb-3">
        <div class="flex flex-wrap justify-between items-center gap-2 mb-1">
          <span class="text-[11px] font-mono text-[#FFDE00] font-bold uppercase tracking-wider">${item.tag}</span>
          <span class="text-[10px] font-mono font-black px-2 py-0.5 uppercase tracking-widest ${badgeColor}">
            ${item.impactLevel}
          </span>
        </div>
        <h3 class="text-base font-title font-black text-white uppercase tracking-wide">
          ${item.title}
        </h3>
        <p class="text-xs font-mono text-zinc-400 mt-1">
          ${item.subtitle}
        </p>
      </div>

      <div class="border border-zinc-700 bg-zinc-950/90 p-3 mb-3">
        <div class="text-[11px] font-mono text-[#FFDE00] font-black uppercase tracking-wider mb-1">
          💡 ANALISIS STRATEGIS &amp; MENGAPA INI PENTING:
        </div>
        <p class="text-xs font-mono text-zinc-200 leading-relaxed">
          ${item.recommendation}
        </p>
      </div>

      <div class="border border-zinc-800 bg-black/60 p-3">
        <div class="text-[11px] font-mono text-white font-black uppercase tracking-widest mb-2 flex items-center gap-2">
          <span class="text-[#E60012]">◆</span> LANGKAH AKSI KONKRET UNTUK DAFFA:
        </div>
        <ul class="space-y-1.5 text-xs font-mono text-zinc-300">
          ${item.actionItems.map(act => `
            <li class="flex items-start gap-2">
              <span class="text-[#FFDE00] font-bold">▶</span>
              <span class="leading-relaxed">${act}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    // Update active tabs
    const tabs = this.overlayEl?.querySelectorAll<HTMLElement>('.advice-tab-btn');
    tabs?.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-aid') === item.id);
    });
  }

  private bindEvents(): void {
    if (!this.overlayEl) return;

    // Close button
    const closeBtn = document.getElementById('btn-close-advice-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Backdrop click dismisses
    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) {
        this.close();
      }
    });

    // Tab buttons
    this.overlayEl.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('.advice-tab-btn');
      if (btn) {
        p5rAudio.playMenuNavigate();
        const aid = btn.getAttribute('data-aid');
        if (aid) {
          this.activeAdviceId = aid;
          this.renderAdvice(aid);
        }
      }
    });

    // Global triggers
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('#btn-advice-trigger, .btn-advice-trigger, [data-trigger="advice"]')) {
        e.preventDefault();
        this.open();
      }
    });
  }

  public open(): void {
    if (!this.overlayEl) this.createDom();
    if (!this.overlayEl) return;

    this.overlayEl.classList.remove('hidden');
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
    this.overlayEl?.remove();
    this.overlayEl = null;
    this.isModalOpen = false;
  }
}

export const adviceModalController: AdviceModalController = new AdviceModalControllerImpl();
