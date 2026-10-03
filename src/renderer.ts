/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - MASTER APPLICATION & SECTION RENDERER (src/renderer.ts)
 *
 * Fully dynamic TypeScript SPA Architecture:
 *  - Master App Shell Generator (renders HTML layout, HUD, Ribbons, Sections & Modals)
 *  - Social / Confidant Quick-Links with empty-url resilience
 *  - 5-Axis SVG Combat Parameters Radar Chart (ST, MA, EN, AG, LU)
 *  - 10 Elemental Game Engine Affinities Table (Null, Drain, Repel)
 *  - Palace Infiltration Heist Cards with "MISSION CLEARED" Stamps & empty-url resilience
 *  - Confidants Arcana Career Timeline (Rank 1 to MAX)
 *  - Palace Security Alert Level scroll telemetry
 * ==========================================================================
 */

import { PORTFOLIO_CONFIG } from './config/portfolio';

// ──────────────────────────────────────────────────────────────────────────────
// 0. Master Application Layout Shell (Dynamically Mounts Complete P5R SPA)
// ──────────────────────────────────────────────────────────────────────────────
export function renderAppShell(root: HTMLElement = document.getElementById('app') || document.body): void {
  const profile = PORTFOLIO_CONFIG.profile;

  root.innerHTML = `
  <!-- Comic Halftone Texture Overlay -->
  <div class="p5-halftone-overlay"></div>

  <!-- Film Grain / feTurbulence Texture -->
  <div class="p5-grain" aria-hidden="true"></div>

  <!-- Screen Blackout Shutter Flash for Transitions -->
  <div id="section-blackout"></div>

  <!-- App Wrapper -->
  <div class="p5r-app-wrapper relative z-10 flex flex-col min-h-screen">

    <!-- Top Hazard Barcode Tape -->
    <div class="p5-hazard-barcode"></div>

    <!-- ====================================================================
         TOP HUD / HEADER
         ==================================================================== -->
    <header class="p5r-header">
      <div class="header-inner">
        <!-- Brand & Phantom Thieves Logo -->
        <div class="brand-group">
          <img src="/images/p5r/phantom_thieves_logo.png" alt="Phantom Thieves Logo" class="pt-logo-img" />
          <div>
            <div class="brand-title">PERSONA 5 ROYAL PORTFOLIO</div>
            <div class="text-[10px] font-mono text-zinc-400 mt-0.5">
              SECTOR: GAME SYSTEMS ARCHITECTURE // CODENAME: ${profile.codename || 'JOKER'}
            </div>
          </div>
        </div>

        <!-- Audio & BGM Controls -->
        <div class="audio-ctrl-group">
          <div class="volume-slider-group" title="Master Volume Control">
            <span class="vol-icon">VOL</span>
            <input type="range" id="master-volume-slider" min="0" max="1" step="0.02" value="0.85" class="p5-volume-slider" aria-label="Master Volume" />
          </div>
          <button class="p5-btn-pill" id="btn-bgm-toggle" title="Toggle Last Surprise BGM">
            <span>🎵 BGM: LAST SURPRISE</span>
          </button>
          <button class="p5-btn-pill" id="btn-mute-toggle" title="Toggle Sound">
            <span id="mute-icon">🔊 SOUND ON</span>
          </button>
        </div>
      </div>
    </header>

    <!-- ====================================================================
         SLANTED RADIAL COMMAND WHEEL NAVIGATION
         ==================================================================== -->
    <nav class="p5r-nav-section">
      <div class="nav-ribbons">
        <button class="p5-ribbon-btn p3r-ribbon-btn active" data-tab="tab-profile">
          <div class="inner-text">
            <span class="num-badge">01</span>
            <span>PROFILE</span>
          </div>
        </button>

        <button class="p5-ribbon-btn p3r-ribbon-btn" data-tab="tab-skills">
          <div class="inner-text">
            <span class="num-badge">02</span>
            <span>SKILLS</span>
          </div>
        </button>

        <button class="p5-ribbon-btn p3r-ribbon-btn" data-tab="tab-experience">
          <div class="inner-text">
            <span class="num-badge">03</span>
            <span>CONFIDANTS</span>
          </div>
        </button>

        <button
          class="p5-aoa-trigger"
          id="btn-trigger-theurgy-main"
          type="button"
          title="Unleash All-Out Attack [T]"
        >
          <img class="p5-aoa-pip" src="/images/p5r/ui/p5-pointer-asterisk.svg" alt="" />
          <span class="aoa-trigger-label">SHOWTIME</span>
          <span class="aoa-trigger-key">T</span>
        </button>
      </div>
    </nav>

    <!-- ====================================================================
         JOKER SILHOUETTE WITH RED CHROMATIC DROP SHADOW
         ==================================================================== -->
    <div class="joker-silhouette-container">
      <img id="joker-silhouette" class="joker-silhouette" src="/images/p5r/joker_render.png" alt="Joker Silhouette Render" />
    </div>

    <!-- ====================================================================
         MAIN VIEWPORT CONTENT PANELS
         ==================================================================== -->
    <main class="main-content">

      <!-- ================================================================
           TAB 1: PROFILE (HERO & VITALS)
           ================================================================ -->
      <section id="tab-profile" class="tab-pane active">
        <div class="section-header">
          <div class="section-tag"><span>IDENTITY // UNITY &amp; BLENDER 3D SPECIALIST</span></div>
          <h2 class="section-title">
            <span class="ransom-note">
              <span class="ransom-char r-bg-red r-rot-neg2">P</span>
              <span class="ransom-char r-bg-white r-rot-pos1">H</span>
              <span class="ransom-char r-bg-black r-rot-neg1">A</span>
              <span class="ransom-char r-bg-gold r-rot-pos2">N</span>
              <span class="ransom-char r-bg-white r-rot-neg2">T</span>
              <span class="ransom-char r-bg-red r-rot-pos1">O</span>
              <span class="ransom-char r-bg-black r-rot-0">M</span>
            </span>
            THIEVES OF HEARTS
            <span class="title-sub">// LEAD UNITY DEVELOPER &amp; 3D ARTIST</span>
          </h2>
        </div>

        <div class="hero-portfolio-grid">
          <!-- Left: Profile & Vitals -->
          <div class="hero-profile-card p5-card-frame">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="p5-wildcard-badge">
                  <span>WILD CARD // UNITY &amp; BLENDER 3D SPECIALIST</span>
                </span>
              </div>

              <h1 class="operative-title-h1">${profile.name}</h1>
              <div class="operative-subtitle">${profile.title.toUpperCase()}</div>

              <div class="p5-data-strip">◆ INFILTRATION-LOG ◆ STATUS: ACTIVE ◆ CLEARANCE: LV.99 ◆ OPERATIVE: ${profile.codename || 'JOKER'}</div>

              <blockquote class="protagonist-quote">
                "${profile.quote}"
                <cite>— ${profile.name} // ${profile.classType}</cite>
              </blockquote>

              <!-- Core Arsenal Tech Chips -->
              <div class="profile-arsenal-row">
                <span class="arsenal-label">CORE ARSENAL &amp; ENGINE STACK:</span>
                <div class="arsenal-chips-grid">
                  <button type="button" class="p5-tech-chip" data-tech="Unity 3D"><span>UNITY 3D / C#</span></button>
                  <button type="button" class="p5-tech-chip" data-tech="Blender 3D"><span>BLENDER 3D</span></button>
                  <button type="button" class="p5-tech-chip" data-tech="URP / Shader Graph"><span>URP / SHADER GRAPH</span></button>
                  <button type="button" class="p5-tech-chip" data-tech="3D Rigging"><span>3D RIGGING &amp; ANIMATION</span></button>
                  <button type="button" class="p5-tech-chip" data-tech="DOTS / Burst"><span>UNITY DOTS / BURST</span></button>
                  <button type="button" class="p5-tech-chip" data-tech="Unity Profiler"><span>UNITY PROFILER</span></button>
                </div>
              </div>

              <!-- Slanted Specialization Ribbons -->
              <div class="profile-specializations">
                <div class="spec-ribbon">
                  <div class="spec-tag"><span>01 // UNITY GAMEPLAY</span></div>
                  <div class="spec-text">
                    <strong>UNITY C# GAMEPLAY &amp; COMBAT SYSTEMS:</strong> Fluid character controllers, state machines, Mecanim animation blending, and zero-allocation gameplay architecture.
                  </div>
                </div>
                <div class="spec-ribbon">
                  <div class="spec-tag"><span>02 // BLENDER 3D</span></div>
                  <div class="spec-text">
                    <strong>BLENDER 3D MODELING &amp; RIGGING:</strong> Production-ready stylized 3D character &amp; environment modeling, clean quad topology, PBR UV unwrapping, and skeletal IK rigging.
                  </div>
                </div>
                <div class="spec-ribbon">
                  <div class="spec-tag"><span>03 // TECH ART &amp; VFX</span></div>
                  <div class="spec-text">
                    <strong>URP SHADERS &amp; PERFORMANCE OPTIMIZATION:</strong> Custom Shader Graph/VFX Graph effects, Blender-to-Unity export pipeline, LOD management, and frame budgeting via Unity Profiler.
                  </div>
                </div>
              </div>
            </div>

            <!-- Social Links / Quick Connect -->
            <div>
              <div class="text-xs font-mono font-bold text-[#FFDE00] uppercase tracking-wider mb-1">
                CONFIDANT REPOSITORIES & RELEASES:
              </div>
              <div class="slink-grid" id="slink-grid">
                <!-- Dynamically populated by renderer.ts -->
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================================
           TAB 2: SKILLS (5-AXIS RADAR & ELEMENTAL AFFINITIES)
           ================================================================ -->
      <section id="tab-skills" class="tab-pane">
        <div class="section-header">
          <div class="section-tag"><span>PARAMETERS // COMPETENCIES</span></div>
          <h2 class="section-title">
            <span class="ransom-note">
              <span class="ransom-char r-bg-red r-rot-neg2">C</span>
              <span class="ransom-char r-bg-white r-rot-pos1">O</span>
              <span class="ransom-char r-bg-black r-rot-neg1">M</span>
              <span class="ransom-char r-bg-gold r-rot-pos2">B</span>
              <span class="ransom-char r-bg-white r-rot-neg1">A</span>
              <span class="ransom-char r-bg-red r-rot-pos1">T</span>
            </span>
            PARAMETERS & ENGINE SKILLS
            <span class="title-sub">// 5-AXIS PERSONA RADAR CHART</span>
          </h2>
        </div>

        <div class="skills-dashboard-grid">
          <!-- Left: 5-Axis SVG Radar Chart -->
          <div class="skills-param-panel p5-card-frame">
            <div class="border-b border-zinc-800 pb-2 mb-3 flex justify-between items-center">
              <span class="font-mono text-xs font-black text-[#E60012] uppercase tracking-widest">
                GAME DEVELOPMENT PARAMETERS
              </span>
              <span class="font-mono text-xs text-[#FFDE00]">RADAR: 5 AXES</span>
            </div>

            <div class="radar-chart-container" id="radar-chart-container">
              <!-- Dynamically populated with SVG polygon radar by renderer.ts -->
            </div>

            <div id="skills-parameters-list" class="mt-4 space-y-2">
              <!-- Dynamically populated stat breakdowns -->
            </div>
          </div>

          <!-- Right: 10 Elemental Game Engine Affinities -->
          <div class="affinities-table-panel p5-card-frame">
            <div class="border-b border-zinc-800 pb-2 mb-3 flex justify-between items-center">
              <span class="font-mono text-xs font-black text-[#FFDE00] uppercase tracking-widest">
                10 ELEMENTAL GAME ENGINE AFFINITIES
              </span>
              <span class="font-mono text-xs text-zinc-400">STACK MASTERY</span>
            </div>

            <div class="affinity-grid" id="affinities-grid-body">
              <!-- Dynamically populated by renderer.ts -->
            </div>

            <!-- Mastered Weapon & Specialty -->
            <div class="mt-6 bg-black border border-[#E60012] p-4 [transform:skewX(-6deg)]">
              <div class="[transform:skewX(6deg)]">
                <div class="text-xs font-mono text-[#FFDE00] font-bold uppercase mb-1">
                  MASTERED WEAPON & SPECIALTY
                </div>
                <div class="text-lg font-title font-black text-white uppercase mb-1">
                  UNITY 3D SYSTEMS & BLENDER TECHNICAL ART
                </div>
                <p class="text-xs text-zinc-300">
                  Specialized in Unity C# Gameplay Architecture, Blender 3D Modeling & Skeletal Rigging, URP Shader Graph, and real-time mobile/PC performance profiling for 60 FPS polished game experiences.
                </p>
              </div>
            </div>

            <!-- Tech Codex & Ongoing R&D Vault (/learn) -->
            <div class="mt-4 bg-black/90 border border-zinc-800 border-l-4 border-l-[#FFDE00] p-4 [transform:skewX(-6deg)]">
              <div class="[transform:skewX(6deg)]">
                <div class="flex justify-between items-center mb-2">
                  <div class="text-xs font-mono text-[#FFDE00] font-black uppercase tracking-wider">
                    📚 TECH CODEX & ONGOING R&D (/LEARN)
                  </div>
                  <span class="text-[10px] font-mono text-zinc-400">RESEARCH VAULT</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div class="p-2 bg-zinc-950 border border-zinc-800">
                    <div class="text-[#E60012] font-mono font-bold text-[11px] mb-0.5">ACTIVE R&D TOPICS</div>
                    <ul class="text-zinc-300 space-y-1 text-[11px]">
                      <li>◆ Unity DOTS (ECS, Burst Compiler, Job System)</li>
                      <li>◆ Blender Geometry Nodes Procedural Environments</li>
                      <li>◆ Custom URP Scriptable Render Passes & VFX Graph</li>
                    </ul>
                  </div>
                  <div class="p-2 bg-zinc-950 border border-zinc-800">
                    <div class="text-[#FFDE00] font-mono font-bold text-[11px] mb-0.5">CORE TECHNICAL REFERENCES</div>
                    <ul class="text-zinc-300 space-y-1 text-[11px]">
                      <li>◆ Unity in Action & C# Design Patterns (Hocking)</li>
                      <li>◆ Blender 3D by Example & Character Rigging</li>
                      <li>◆ Real-Time Rendering & Unity Shader Graph (URP)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================================
           TAB 3: CONFIDANTS (CAREER ARCANA TIMELINE)
           ================================================================ -->
      <section id="tab-experience" class="tab-pane">
        <div class="section-header">
          <div class="section-tag"><span>CONFIDANTS // CHRONOLOGY</span></div>
          <h2 class="section-title">
            <span class="ransom-note">
              <span class="ransom-char r-bg-red r-rot-neg2">C</span>
              <span class="ransom-char r-bg-white r-rot-pos1">O</span>
              <span class="ransom-char r-bg-black r-rot-neg1">N</span>
              <span class="ransom-char r-bg-gold r-rot-pos2">F</span>
              <span class="ransom-char r-bg-white r-rot-neg1">I</span>
              <span class="ransom-char r-bg-red r-rot-pos1">D</span>
              <span class="ransom-char r-bg-black r-rot-neg2">A</span>
              <span class="ransom-char r-bg-gold r-rot-pos2">N</span>
              <span class="ransom-char r-bg-white r-rot-neg1">T</span>
            </span>
            COOPERATION TIMELINE
            <span class="title-sub">// GAME STUDIO EXPERIENCE & EDUCATION</span>
          </h2>
        </div>

        <div class="experience-timeline" id="experience-timeline">
          <!-- Dynamically populated by renderer.ts -->
        </div>
      </section>

    </main>

  </div>

  <!-- ====================================================================
       ALL-OUT ATTACK FULLSCREEN CINEMATIC MODAL
       ==================================================================== -->
  <div id="aoa-flash"></div>

  <div class="all-out-attack-overlay aoa-modal" id="all-out-attack-overlay">
    <div class="aoa-diagonal-slash"></div>

    <!-- AOA slash lines -->
    <div class="aoa-slash-line"></div>
    <div class="aoa-slash-line"></div>
    <div class="aoa-slash-line"></div>

    <!-- Joker cutin -->
    <img src="/images/p5r/joker_render.png" alt="Joker" class="aoa-joker-cutin" />

    <div class="aoa-splash-content">
      <div class="aoa-hero-cutin">
        <div class="text-xs font-mono font-black text-[#FFDE00] tracking-[0.4em] uppercase mb-2">
          ★ PHANTOM THIEVES SPECIAL FINISHING TOUCH ★
        </div>
        <h1 class="aoa-title-main" id="aoa-title-main">THE CODE IS EXECUTED!</h1>
        <div class="aoa-subtext" id="aoa-speaker">
          "I'VE BEEN WAITING FOR THIS! — ${profile.name} // ${profile.codename}"
        </div>
        <button class="aoa-close-btn" id="aoa-close-btn">
          CLAIM VICTORY ▶
        </button>
      </div>
    </div>
  </div>
  `;
}

// ──────────────────────────────────────────────────────────────────────────────
// 1. Social Link Tarot / Confidant Cards
// ──────────────────────────────────────────────────────────────────────────────
export function renderSocialLinks(): void {
  const container = document.getElementById('slink-grid');
  if (!container || !PORTFOLIO_CONFIG.profile?.socialLinks) return;

  const html = PORTFOLIO_CONFIG.profile.socialLinks.map((link) => {
    const isConfigured = link.url && link.url.trim() !== '';
    if (isConfigured) {
      return `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="slink-card group"
           title="${link.name} — ${link.arcana || link.category}">
          <div class="slink-inner">
            <div class="slink-icon">${link.icon}</div>
            <div class="slink-text">
              <div class="slink-arcana">${link.arcana || 'CO-OP'}</div>
              <div class="slink-name">${link.name}</div>
              <div class="slink-handle">${link.handle}</div>
            </div>
          </div>
        </a>
      `;
    } else {
      return `
        <div class="slink-card slink-card-locked group cursor-pointer"
             data-social-name="${link.name}"
             title="${link.name} — Confidant Frequency Pending">
          <div class="slink-inner">
            <div class="slink-icon opacity-60">${link.icon}</div>
            <div class="slink-text">
              <div class="slink-arcana text-zinc-500">${link.arcana || 'CO-OP'}</div>
              <div class="slink-name flex items-center gap-1 text-zinc-300">
                <span>${link.name}</span>
                <span class="text-[10px] text-[#FFDE00]">🔒</span>
              </div>
              <div class="slink-handle text-zinc-500 font-mono text-[10px]">PENDING // OFFLINE</div>
            </div>
          </div>
        </div>
      `;
    }
  }).join('');

  container.innerHTML = html;

  // Add click handlers for locked cards
  container.querySelectorAll<HTMLElement>('.slink-card-locked').forEach((el) => {
    el.addEventListener('click', () => {
      const name = el.getAttribute('data-social-name') || 'Social Account';
      const toast = document.getElementById('p5-boost-toast');
      if (toast) {
        toast.innerHTML = `
          <div class="p5-boost-toast-inner border-[#FFDE00]">
            <span class="toast-tag text-[#FFDE00]">CONFIDANT FREQUENCY OFFLINE</span>
            <span class="toast-msg">Joker has not yet linked a public ${name} account. Dispatch a Calling Card below or schedule a briefing!</span>
          </div>
        `;
        toast.classList.remove('hidden', 'toast-exit');
        toast.classList.add('toast-enter');
        setTimeout(() => {
          toast.classList.remove('toast-enter');
          toast.classList.add('toast-exit');
        }, 3000);
      }
    });
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. 5-Axis SVG Radar Chart & Parameter Breakdowns
// ──────────────────────────────────────────────────────────────────────────────
export function renderSkillParameters(): void {
  const stats = PORTFOLIO_CONFIG.statsRadar || PORTFOLIO_CONFIG.skills || [];
  if (!stats || stats.length === 0) return;

  // 2.1 SVG Radar Chart
  const radarContainer = document.getElementById('radar-chart-container');
  if (radarContainer) {
    const size = 320;
    const center = size / 2;
    const radius = 100;
    const count = stats.length;
    const angleStep = (Math.PI * 2) / count;

    // Web circles (25%, 50%, 75%, 100%)
    let websSvg = '';
    [0.25, 0.5, 0.75, 1.0].forEach((level) => {
      const points = [];
      for (let i = 0; i < count; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + Math.cos(angle) * (radius * level);
        const y = center + Math.sin(angle) * (radius * level);
        points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }
      websSvg += `<polygon points="${points.join(' ')}" class="radar-web" />`;
    });

    // Axis lines and labels
    let axesSvg = '';
    let labelSvg = '';
    const polygonPoints: string[] = [];

    stats.forEach((stat, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const axisX = center + Math.cos(angle) * radius;
      const axisY = center + Math.sin(angle) * radius;
      axesSvg += `<line x1="${center}" y1="${center}" x2="${axisX.toFixed(1)}" y2="${axisY.toFixed(1)}" class="radar-axis" />`;

      // Stat value point
      const statVal = stat.value ?? (stat as any).score ?? 50;
      const valRatio = Math.min(Math.max(statVal / 100, 0.1), 1.0);
      const valX = center + Math.cos(angle) * (radius * valRatio);
      const valY = center + Math.sin(angle) * (radius * valRatio);
      polygonPoints.push(`${valX.toFixed(1)},${valY.toFixed(1)}`);

      // Outer label
      const labelDist = radius + 28;
      const labelX = center + Math.cos(angle) * labelDist;
      const labelY = center + Math.sin(angle) * labelDist;
      const axisLabel = stat.code || stat.label;
      labelSvg += `
        <text x="${labelX.toFixed(1)}" y="${(labelY - 5).toFixed(1)}" class="radar-label">${axisLabel}</text>
        <text x="${labelX.toFixed(1)}" y="${(labelY + 10).toFixed(1)}" class="radar-val">${statVal}</text>
      `;
    });

    const polygonSvg = `<polygon points="${polygonPoints.join(' ')}" class="radar-polygon" />`;

    radarContainer.innerHTML = `
      <svg class="radar-svg" viewBox="0 0 ${size} ${size}">
        ${websSvg}
        ${axesSvg}
        ${polygonSvg}
        ${labelSvg}
      </svg>
    `;
  }

  // 2.2 Parameter Breakdown Cards
  const listContainer = document.getElementById('skills-parameters-list');
  if (listContainer) {
    const listHtml = stats.map((stat) => {
      const tools = stat.technologies || (stat as any).tools || [];
      const toolPills = tools.map((t: string) =>
        `<span class="tech-pill">${t}</span>`
      ).join('');

      const statVal = stat.value ?? (stat as any).score ?? 0;
      const statLabel = stat.label || stat.code;
      const statDomain = stat.domain || (stat as any).category || '';
      const statDesc = stat.description || (stat as any).desc || '';

      return `
        <div class="bg-black/80 border border-zinc-800 border-l-4 border-l-[#E60012] p-3 [transform:skewX(-6deg)]">
          <div class="[transform:skewX(6deg)]">
            <div class="flex justify-between items-start mb-1">
              <div>
                <span class="font-title font-black text-sm text-white">${stat.code} // ${statLabel}</span>
                <span class="text-[10px] font-mono text-[#FFDE00] ml-2 font-bold">${statDomain}</span>
              </div>
              <span class="font-title font-black text-base text-[#FFDE00]">${statVal}</span>
            </div>
            <div class="w-full bg-zinc-900 h-1.5 mb-2 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-[#FFDE00] to-[#E60012]" style="width: ${statVal}%;"></div>
            </div>
            <p class="text-xs text-zinc-400 mb-2 leading-relaxed">${statDesc}</p>
            <div class="flex flex-wrap gap-1">${toolPills}</div>
          </div>
        </div>
      `;
    }).join('');

    listContainer.innerHTML = listHtml;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. 10 Elemental Game Engine Affinities
// ──────────────────────────────────────────────────────────────────────────────
export function renderAffinities(): void {
  const container = document.getElementById('affinities-grid-body');
  if (!container || !PORTFOLIO_CONFIG.affinities) return;

  const html = PORTFOLIO_CONFIG.affinities.map((aff) => {
    const badgeCls = (aff.badgeText || aff.affinity || 'Null').toLowerCase();
    const badgeLabel = (aff.badgeText || aff.affinity || 'NULL').toUpperCase();

    return `
      <div class="affinity-row">
        <div class="affinity-elem-col">
          <div class="affinity-elem-name">${aff.element}</div>
          <div class="affinity-elem-role">${aff.notes || ''}</div>
        </div>
        <div class="affinity-tech-name">${aff.techStack}</div>
        <div class="affinity-badge-wrap">
          <span class="affinity-badge ${badgeCls}">${badgeLabel}</span>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

// ──────────────────────────────────────────────────────────────────────────────
// 4. Palace Infiltrations (Heists removed per specification)
// ──────────────────────────────────────────────────────────────────────────────
export function renderProjects(): void {
  // Heists tab removed per user specification
}

// ──────────────────────────────────────────────────────────────────────────────
// 5. Confidant Cooperation Career & Education Timeline
// ──────────────────────────────────────────────────────────────────────────────
export function renderExperience(): void {
  const container = document.getElementById('experience-timeline');
  const confidants = PORTFOLIO_CONFIG.confidants || PORTFOLIO_CONFIG.experience || [];
  if (!container || confidants.length === 0) return;

  const html = confidants.map((item) => {
    const role = item.role || (item as any).roleTitle || '';
    const company = item.company || (item as any).organization || '';
    const period = item.period || (item as any).timeframe || '';
    const desc = item.description || (item as any).desc || '';
    const perk = item.deliverables && item.deliverables.length > 0 ? item.deliverables[0] : ((item as any).unlockedAbility || '');

    return `
      <div class="timeline-milestone-card p5-card-frame">
        <div class="timeline-rank-col">
          <div class="confidant-rank-label">RANK</div>
          <div class="confidant-rank-num">${item.rank}</div>
          <div class="timeline-rank-arcana">${item.arcana}</div>
        </div>

        <div class="timeline-body">
          <div class="timeline-card-header">
            <div>
              <h3 class="timeline-role">${role}</h3>
              <div class="timeline-company">${company}</div>
            </div>
            <div class="timeline-meta">${period}</div>
          </div>

          <div class="p5-data-strip">◆ INFILTRATION-LOG ◆ STATUS: ACTIVE ◆ CLEARANCE: LV.99 ◆ RANK: ${item.rank}</div>

          <p class="timeline-desc">${desc}</p>
          ${perk ? `
            <div class="timeline-perk">
              <span>⚡ DELIVERABLE: ${perk}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

// ──────────────────────────────────────────────────────────────────────────────
// 6. Security Alert Level (Removed per specification)
// ──────────────────────────────────────────────────────────────────────────────
export function initSecurityAlert(): void {
  // Security alert removed per user specification
}

// ──────────────────────────────────────────────────────────────────────────────
// 7. Master Render Call
// ──────────────────────────────────────────────────────────────────────────────
export function renderAll(root: HTMLElement = document.getElementById('app') || document.body): void {
  // Ensure the App Shell is mounted into root if not already present
  if (!root.querySelector('.p5r-app-wrapper')) {
    renderAppShell(root);
  }

  renderSocialLinks();
  renderSkillParameters();
  renderAffinities();
  renderExperience();
}
