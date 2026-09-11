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
    title: 'Setup Profil Publik: GitHub, Itch.io & LinkedIn Bertema Game Dev',
    subtitle: 'Saat ini semua link diset kosongan (offline). Berikut roadmap saat Daffa siap meluncurkannya:',
    recommendation: 'Recruiter game AAA mencari 3 pilar: Kode Bersih (GitHub), Bukti Game Bisa Dimainkan (Itch.io), dan Rekam Jejak Profesional (LinkedIn). Jangan biarkan profil kosong terlalu lama saat melamar kerja.',
    actionItems: [
      'GitHub: Pinned 2-3 repo inti C++20 / Unreal Engine 5 dengan README visual kaya GIF/Video gameplay, diagram arsitektur memory, dan benchmark profiling.',
      'Itch.io: Upload 1-2 prototype game playable langsung di browser via HTML5 / WebGL export. Recruiter lebih suka klik 1 detik daripada download zip .exe yang discan antivirus.',
      'LinkedIn: Gunakan headline tajam: "Lead Gameplay & Engine Systems Engineer | C++20, UE5, HLSL Compute, 120 FPS Profiling".',
      'ArtStation: Jika membuat custom shader, PBR materials, atau VFX Niagara, pajang screenshot RenderDoc & video breakdown material nodes.'
    ],
    impactLevel: 'CRITICAL'
  },
  {
    id: 'web-showcase',
    tag: '02. PLAYABLE TECH PROTOTYPE',
    title: 'Integrasi WebGL / WebGPU WASM Live Playable Demos',
    subtitle: 'Maksimalkan fitur /browser yang sudah kita sediakan dengan build game riil:',
    recommendation: 'Porting potongan prototype sistem (misal: 10,000 particle compute simulation atau boids flocking) ke WebAssembly via Emscripten atau WebGPU. Ini membuktikan Daffa tidak hanya mengerti teori, tapi bisa mengeksekusi engine logic langsung di tangan pengunjung.',
    actionItems: [
      'Ekspor demo C++ ECS ke WebAssembly menggunakan raylib / Emscripten.',
      'Sematkan canvas WebGL langsung ke modal Heists atau /browser sandbox.',
      'Sertakan live telemetry (FPS graph, draw call counter, dynamic entity count) agar recruiter teknis terkesan.'
    ],
    impactLevel: 'HIGH-PRIORITY'
  },
  {
    id: 'calling-card-webhook',
    tag: '03. REAL-TIME CONTACT PIPELINE',
    title: 'Hubungkan Calling Card Form ke Discord / Formspree Webhook',
    subtitle: 'Jadikan formulir kontak interaktif mengirim pesan riil ke HP/Discord Daffa:',
    recommendation: 'Formulir Calling Card (#tactics-contact-form) saat ini sudah memiliki validasi dan animasi All-Out Attack yang sangat keren. Tambahkan 1 URL endpoint Formspree atau Discord Webhook agar pesan recruiter langsung masuk ke Discord server pribadi Daffa secara gratis.',
    actionItems: [
      'Daftar akun gratis di formspree.io atau buat Webhook channel di Discord pribadi.',
      'Di src/ui/callingCard.ts, lakukan fetch POST payload JSON { name, email, message } ke URL webhook.',
      'Daffa akan langsung menerima notifikasi push instan di HP begitu recruiter Atlus/Sony/Indie mengirim Calling Card!'
    ],
    impactLevel: 'HIGH-PRIORITY'
  },
  {
    id: 'profiling-proof',
    tag: '04. PROFILING & BENCHMARKING VIDEO',
    title: 'Sertakan Bukti Video Profiling Superluminal / Unreal Insights',
    subtitle: 'Ubah klaim 120 FPS menjadi fakta teknis yang tak terbantahkan:',
    recommendation: 'Semua programmer bisa mengaku bisa 120 FPS, namun Lead Systems Engineer yang kredibel menyertakan visual CPU/GPU trace budget (<8.33ms) di bawah beban stress test ribuan aktor.',
    actionItems: [
      'Rekam clip 30-45 detik Unreal Insights / Tracy Profiler yang menunjukkan frame time 8.3ms stabil tanpa GC stall.',
      'Tampilkan visual CPU thread worker graph yang mendistribusikan physics & animation evaluation.',
      'Tautkan video YouTube unlisted atau video pendek di modal heist project.'
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
