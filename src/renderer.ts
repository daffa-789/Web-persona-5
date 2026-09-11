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
  const callingCard = PORTFOLIO_CONFIG.callingCard;

  root.innerHTML = `
  <!-- Comic Halftone Texture Overlay -->
  <div class="p5-halftone-overlay"></div>

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
              <span class="p5-blink-indicator ml-2">● INFILTRATING PALACE</span>
            </div>
          </div>
        </div>

        <!-- P5R Authentic Calendar & Schedule Widget (/schedule) -->
        <div class="p5-calendar-widget hidden lg:flex" id="p5-calendar-widget" title="Metaverse Infiltration Schedule">
          <div class="p5-cal-date-block">
            <span class="p5-cal-month">9/11</span>
            <span class="p5-cal-day">FRI</span>
          </div>
          <div class="p5-cal-meta">
            <div class="p5-cal-weather">
              <span class="p5-weather-icon">☁</span>
              <span class="p5-weather-text">CLOUDY</span>
              <span class="p5-time-slot">AFTER SCHOOL</span>
            </div>
            <div class="p5-target-countdown">
              <span class="p5-countdown-label">DEADLINE:</span>
              <span class="p5-countdown-target">AAA STUDIO HEIST IN PROGRESS</span>
            </div>
          </div>
        </div>

        <!-- Palace Security Alert Level Meter -->
        <div class="security-alert-hud" id="security-alert-container">
          <div class="alert-hud-inner">
            <span class="alert-badge">SECURITY ALERT</span>
            <div class="alert-meter-bar">
              <div class="alert-meter-fill" id="security-alert-bar" style="width: 15%;"></div>
            </div>
            <span class="text-[#FFDE00] font-black" id="security-alert-text">15% ALERT</span>
          </div>
        </div>

        <!-- Audio, BGM & Technical Interrogation Controls -->
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
          <button class="p5-btn-pill btn-command-palette" id="btn-command-palette" title="Metaverse Command Palette [/]">
            <span>⌨️ CMDS [/]</span>
          </button>
          <button class="p5-btn-pill btn-trigger-grill-me" id="btn-trigger-grill-me" title="Velvet Room Technical Due Diligence Challenge [G]">
            <span>⚔️ GRILL [G]</span>
          </button>
          <button class="p5-btn-pill btn-schedule-heist" id="btn-schedule-heist" title="Schedule Palace Briefing [S]">
            <span>📅 SCHEDULE [S]</span>
          </button>
          <button class="p5-btn-pill btn-boost-toggle" id="btn-boost-toggle" title="Toggle 120 FPS Overclock Mode [O]">
            <span>⚡ BOOST</span>
          </button>
        </div>
      </div>

      <!-- Infiltration Goal Ribbon (/goal) -->
      <div class="p5-goal-ribbon">
        <span class="p5-goal-tag">★ INFILTRATION TARGET:</span>
        <span class="p5-goal-text">LIBERATE 120 FPS GAMEPLAY ARCHITECTURE // SECURE LEAD STUDIO ROLE</span>
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
            <span>DOSSIER</span>
          </div>
        </button>

        <button class="p5-ribbon-btn p3r-ribbon-btn" data-tab="tab-skills">
          <div class="inner-text">
            <span class="num-badge">02</span>
            <span>SKILLS</span>
          </div>
        </button>

        <button class="p5-ribbon-btn p3r-ribbon-btn" data-tab="tab-projects">
          <div class="inner-text">
            <span class="num-badge">03</span>
            <span>HEISTS</span>
          </div>
        </button>

        <button class="p5-ribbon-btn p3r-ribbon-btn" data-tab="tab-experience">
          <div class="inner-text">
            <span class="num-badge">04</span>
            <span>CONFIDANTS</span>
          </div>
        </button>

        <button class="p5-ribbon-btn p3r-ribbon-btn" data-tab="tab-contact">
          <div class="inner-text">
            <span class="num-badge">05</span>
            <span>CALLING CARD</span>
          </div>
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
           TAB 1: DOSSIER (HERO & VITALS)
           ================================================================ -->
      <section id="tab-profile" class="tab-pane active">
        <div class="section-header">
          <div class="section-tag"><span>STATUS // IDENTITY</span></div>
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
            <span class="title-sub">// LEAD GAME SYSTEMS ARCHITECT</span>
          </h2>
        </div>

        <div class="hero-portfolio-grid">
          <!-- Left: Profile & Vitals -->
          <div class="hero-profile-card p5-card-frame">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="p5-wildcard-badge">
                  <span>WILD CARD // GAMEPLAY ENGINEER</span>
                </span>
                <span class="text-[#FFDE00] font-mono font-bold text-xs tracking-widest">
                  ID: PT-JOKER-01 // LV. ${profile.level || 99}
                </span>
              </div>

              <h1 class="operative-title-h1">${profile.name}</h1>
              <div class="operative-subtitle">${profile.title.toUpperCase()} // 120 FPS HIGH-PERFORMANCE</div>

              <blockquote class="protagonist-quote">
                "${profile.quote}"
                <cite>— ${profile.name} // ${profile.classType}</cite>
              </blockquote>

              <!-- Live Vitals Telemetry -->
              <div class="hero-vitals">
                <div class="hero-vitals-inner">
                  <!-- HP (Framerate Stability) -->
                  <div class="vital-row">
                    <div class="vital-labels">
                      <span class="text-[#00FF66]">HP (FRAMERATE STABILITY)</span>
                      <span>${profile.vitals.hpPercent}% // ${profile.vitals.hpText}</span>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill hp" style="width: ${profile.vitals.hpPercent}%;"></div>
                    </div>
                  </div>

                  <!-- SP (Shader Architecture) -->
                  <div class="vital-row">
                    <div class="vital-labels">
                      <span class="text-[#C846FF]">SP (SHADER ARCHITECTURE & VFX)</span>
                      <span>${profile.vitals.spPercent}% // ${profile.vitals.spText}</span>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill sp" style="width: ${profile.vitals.spPercent}%;"></div>
                    </div>
                  </div>

                  <!-- Baton Pass Gauge -->
                  <div class="vital-row">
                    <div class="vital-labels">
                      <span class="text-[#FFDE00] flex items-center gap-1">⚡ BATON PASS (AGILE STUDIO SPRINT)</span>
                      <span class="text-[#FFDE00] animate-pulse font-black" id="vital-baton-pass-text">${profile.vitals.batonPassPercent}% MAX READY</span>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill theurgy baton-pass" id="vital-baton-pass-bar" style="width: ${profile.vitals.batonPassPercent}%;"></div>
                    </div>
                  </div>

                  <!-- Baton Pass Booster Trigger (/boost) -->
                  <button type="button" class="btn-boost-vitals mt-3" id="btn-boost-vitals" title="Trigger Baton Pass Overdrive Boost (120%)">
                    <span>⚡ BATON PASS: OVERDRIVE BOOST (120%)</span>
                  </button>
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

          <!-- Right: Hero Visual Art & Action -->
          <div class="hero-art-panel p5-card-frame">
            <div class="flex justify-between items-center border-b border-zinc-800 pb-2 mb-2">
              <div class="font-mono text-xs font-black text-[#E60012] tracking-widest uppercase">
                TARGET IDENTIFICATION // JOKER
              </div>
              <span class="text-xs font-mono text-[#FFDE00] font-bold">ARCANA: 0. THE FOOL</span>
            </div>

            <div class="character-art-container">
              <img 
                src="/images/p5r/joker_render.png" 
                alt="Joker Character Cutout" 
                class="p5r-character-img"
              />
            </div>

            <div class="mt-4 flex flex-col gap-2">
              <button class="btn-theurgy-strike" id="btn-trigger-theurgy-main">
                <span>⚡ UNLEASH SHOWTIME: ALL-OUT ATTACK</span>
              </button>
              <div class="grid grid-cols-2 gap-2">
                <button type="button" class="btn-theurgy-strike btn-trigger-grill-me" id="btn-trigger-grill-me-hero" style="background: #000; border-color: #FFDE00; color: #FFDE00; font-size: 0.8rem; padding: 0.5rem 0.5rem;">
                  <span>⚔️ GRILL ME [G]</span>
                </button>
                <button type="button" class="btn-theurgy-strike btn-schedule-heist" id="btn-schedule-heist-hero" style="background: #000; border-color: #E60012; color: #FFFFFF; font-size: 0.8rem; padding: 0.5rem 0.5rem;">
                  <span>📅 SCHEDULE [S]</span>
                </button>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <button type="button" class="btn-theurgy-strike btn-browser-sandbox" id="btn-browser-sandbox-hero" style="background: #000; border-color: #FFDE00; color: #FFDE00; font-size: 0.8rem; padding: 0.5rem 0.5rem;">
                  <span>🌀 120FPS [B]</span>
                </button>
                <button type="button" class="btn-theurgy-strike btn-command-palette" id="btn-command-palette-hero" style="background: #000; border-color: #E60012; color: #FFFFFF; font-size: 0.8rem; padding: 0.5rem 0.5rem;">
                  <span>⌨️ CMDS [/]</span>
                </button>
              </div>
              <div class="text-center text-xs font-mono text-[#FFDE00] mt-1">
                EXECUTE CRITICAL HIT FINISHING TOUCH // METAVERSE OPERATIONS
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
                  CUSTOM ENGINE & SHADER PROGRAMMING
                </div>
                <p class="text-xs text-zinc-300">
                  Specialized in C++, C#, HLSL/GLSL Compute Shaders, Unreal Engine 5, Unity, and real-time GPU performance profiling for 60/120 FPS high-intensity game experiences.
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
                      <li>◆ Vulkan 1.3 Ray Tracing & Mesh Shaders</li>
                      <li>◆ Data-Oriented ECS & Lock-Free Job Pipelines</li>
                      <li>◆ WebGPU Compute Shaders for SIMD In-Browser AI</li>
                    </ul>
                  </div>
                  <div class="p-2 bg-zinc-950 border border-zinc-800">
                    <div class="text-[#FFDE00] font-mono font-bold text-[11px] mb-0.5">CORE TECHNICAL REFERENCES</div>
                    <ul class="text-zinc-300 space-y-1 text-[11px]">
                      <li>◆ Game Engine Architecture (Jason Gregory)</li>
                      <li>◆ Real-Time Rendering, 4th Ed (Akenine-Möller)</li>
                      <li>◆ Physically Based Rendering (Pharr, Humphreys)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================================
           TAB 3: HEISTS (PALACE INFILTRATION GAME PROJECTS)
           ================================================================ -->
      <section id="tab-projects" class="tab-pane">
        <div class="section-header">
          <div class="section-tag"><span>HEISTS // RELEASES</span></div>
          <h2 class="section-title">
            <span class="ransom-note">
              <span class="ransom-char r-bg-red r-rot-neg2">P</span>
              <span class="ransom-char r-bg-white r-rot-pos1">A</span>
              <span class="ransom-char r-bg-black r-rot-neg1">L</span>
              <span class="ransom-char r-bg-gold r-rot-pos2">A</span>
              <span class="ransom-char r-bg-white r-rot-neg2">C</span>
              <span class="ransom-char r-bg-red r-rot-pos1">E</span>
            </span>
            INFILTRATION PROJECTS
            <span class="title-sub">// PLAYABLE GAMES & TECH DEMOS</span>
          </h2>
        </div>

        <div class="projects-operations-grid" id="projects-operations-grid">
          <!-- Dynamically populated by renderer.ts -->
        </div>

        <!-- In-Browser 120 FPS Engine Benchmark Trigger (/browser) -->
        <div class="mt-8 p-5 bg-black/95 border-2 border-[#00F0FF] [transform:skewX(-4deg)] text-center shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <div class="[transform:skewX(4deg)]">
            <div class="text-xs font-mono text-[#00F0FF] font-black uppercase tracking-widest mb-1">
              🎮 HIGH-PERFORMANCE WEB ENGINE RUNTIME (/BROWSER)
            </div>
            <p class="text-xs text-zinc-300 max-w-2xl mx-auto mb-3">
              Experience 6,000+ SIMD-integrated physics particles running locked at 120 FPS with zero heap allocations directly in your browser viewport.
            </p>
            <button type="button" class="btn-theurgy-strike btn-browser-sandbox max-w-md mx-auto" id="btn-browser-sandbox" style="background: #000; border: 2px solid #00F0FF; color: #00F0FF;">
              <span>⚡ LAUNCH 120 FPS BROWSER ENGINE BENCHMARK</span>
            </button>
          </div>
        </div>
      </section>

      <!-- ================================================================
           TAB 4: CONFIDANTS (CAREER ARCANA TIMELINE)
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

        <!-- Baton Pass Teamwork Synergy Matrix (/teamwork-preview) -->
        <div class="mt-8 p5-card-frame bg-black/90 p-5">
          <div class="flex justify-between items-center border-b border-zinc-800 pb-2 mb-4">
            <div>
              <span class="font-mono text-xs font-black text-[#E60012] uppercase tracking-widest">
                ⚡ BATON PASS TEAMWORK SYNERGY MATRIX (/TEAMWORK-PREVIEW)
              </span>
              <div class="text-[11px] font-mono text-zinc-400">
                CROSS-DISCIPLINARY COLLABORATION & STUDIO INTEGRATION TELEMETRY
              </div>
            </div>
            <span class="text-xs font-mono text-[#FFDE00] font-bold">SYNERGY: 100% SYNCHRONIZED</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div class="p-3 bg-zinc-950 border-l-4 border-l-[#E60012] border border-zinc-800 [transform:skewX(-4deg)]">
              <div class="[transform:skewX(4deg)]">
                <div class="font-title font-black text-white text-sm uppercase mb-1">
                  ⚔️ COMBAT & SYSTEMS DESIGNERS
                </div>
                <p class="text-zinc-300 leading-relaxed text-[11px]">
                  Engineers rapid prototyping sandboxes in Dear ImGui and custom hot-reloading parameters. Guarantees tight combat cancel windows, deterministic hit-stop frames, and intuitive tuning without code recompiles.
                </p>
              </div>
            </div>

            <div class="p-3 bg-zinc-950 border-l-4 border-l-[#FFDE00] border border-zinc-800 [transform:skewX(-4deg)]">
              <div class="[transform:skewX(4deg)]">
                <div class="font-title font-black text-white text-sm uppercase mb-1">
                  🎨 TECHNICAL ARTISTS & ANIMATORS
                </div>
                <p class="text-zinc-300 leading-relaxed text-[11px]">
                  Authors custom HLSL shaders, Niagara GPU emitters, and root motion blend trees. Empowers artistic expression while maintaining rigid vertex/pixel shader instruction and VRAM memory budgets.
                </p>
              </div>
            </div>

            <div class="p-3 bg-zinc-950 border-l-4 border-l-[#00F0FF] border border-zinc-800 [transform:skewX(-4deg)]">
              <div class="[transform:skewX(4deg)]">
                <div class="font-title font-black text-white text-sm uppercase mb-1">
                  🎵 SOUND DESIGNERS (FMOD / WWISE)
                </div>
                <p class="text-zinc-300 leading-relaxed text-[11px]">
                  Integrates real-time audio middleware with game state telemetry. Drives reactive DSP low-pass filters, dynamic combat intensity stems, and spatial 3D attenuation without latency.
                </p>
              </div>
            </div>

            <div class="p-3 bg-zinc-950 border-l-4 border-l-[#00FF66] border border-zinc-800 [transform:skewX(-4deg)]">
              <div class="[transform:skewX(4deg)]">
                <div class="font-title font-black text-white text-sm uppercase mb-1">
                  📋 PRODUCTION & ENGINEERING LEADS
                </div>
                <p class="text-zinc-300 leading-relaxed text-[11px]">
                  Provides predictable sprint delivery with modular technical RFCs, automated CI build regression tests, and zero critical blockers at gold master release.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================================
           TAB 5: CALLING CARD (TACTICS COMMU CONTACT FORM)
           ================================================================ -->
      <section id="tab-contact" class="tab-pane">
        <div class="section-header">
          <div class="section-tag"><span>DISPATCH // HIRE</span></div>
          <h2 class="section-title">
            <span class="ransom-note">
              <span class="ransom-char r-bg-red r-rot-neg2">C</span>
              <span class="ransom-char r-bg-white r-rot-pos1">A</span>
              <span class="ransom-char r-bg-black r-rot-neg1">L</span>
              <span class="ransom-char r-bg-gold r-rot-pos2">L</span>
              <span class="ransom-char r-bg-white r-rot-neg2">I</span>
              <span class="ransom-char r-bg-red r-rot-pos1">N</span>
              <span class="ransom-char r-bg-black r-rot-pos2">G</span>
            </span>
            CARD DISPATCH
            <span class="title-sub">// STUDIO HIRE & INQUIRY</span>
          </h2>
        </div>

        <div class="contact-tactics-layout">
          <!-- Left: Calling Card Form -->
          <div class="calling-card-container p5-card-frame">
            <div class="calling-card-banner">
              "${callingCard?.producerQuote || 'Sir / Madam Producer, you have hoarded complex game architecture hurdles... on this day, we shall take your project offer!'}"
            </div>

            <div class="text-xs font-mono font-black text-[#FFDE00] uppercase tracking-widest mb-3">
              SELECT MISSION OBJECTIVE:
            </div>

            <div class="action-type-select-grid">
              <button type="button" class="btn-action-type selected" data-obj="full-time">
                <span>🛡️ FULL-TIME STUDIO ROLE</span>
              </button>
              <button type="button" class="btn-action-type" data-obj="collab">
                <span>⚡ GAME JAM / INDIE COLLAB</span>
              </button>
              <button type="button" class="btn-action-type" data-obj="freelance">
                <span>⚔️ FREELANCE SHADER/ENGINE</span>
              </button>
              <button type="button" class="btn-action-type" data-obj="chat">
                <span>☕ TECH COFFEE CHAT</span>
              </button>
            </div>

            <form id="tactics-contact-form">
              <div class="form-group">
                <label class="form-label" for="contact-name">STUDIO / PRODUCER NAME</label>
                <input type="text" id="contact-name" class="form-input" placeholder="e.g. Atlus Studios / Producer Tanaka" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="contact-email">DIRECT FREQUENCY (EMAIL)</label>
                <input type="email" id="contact-email" class="form-input" placeholder="e.g. producer@gamestudio.com" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="contact-msg">MISSION BRIEF / PROJECT SINS</label>
                <textarea id="contact-msg" rows="3" class="form-textarea" placeholder="Describe the game engine requirements, framerate target, or timeline..." required></textarea>
              </div>

              <button type="submit" class="btn-theurgy-strike" id="btn-submit-calling-card">
                <span>⚡ DISPATCH CALLING CARD</span>
              </button>

              <div id="form-submit-feedback" class="mt-4 hidden"></div>
            </form>

            <!-- R6: CALLING CARD DELIVERED stamp (shown after successful submit) -->
            <div id="calling-card-success">
              <div class="stamp-text">CALLING CARD DELIVERED</div>
              <div class="stamp-sub">⚡ YOUR MESSAGE HAS BEEN TRANSMITTED // PHANTOM THIEVES WILL RESPOND ⚡</div>
              <button type="button" id="btn-reset-calling-card" class="btn-theurgy-strike mt-4" style="max-width: 320px;">
                <span>↩ DISPATCH ANOTHER CARD</span>
              </button>
            </div>
          </div>

          <!-- Right: Direct Frequencies -->
          <div class="hero-art-panel p5-card-frame">
            <div class="border-b border-zinc-800 pb-2 mb-3">
              <div class="font-mono text-xs font-black text-[#E60012] tracking-widest uppercase">
                DIRECT COMMU CHANNELS
              </div>
            </div>

            <div class="p5-commu-list">
              <div class="p5-commu-channel-card">
                <div class="p5-commu-inner">
                  <div class="p5-commu-tag gold">PRIMARY DISPATCH</div>
                  <div class="p5-commu-val">${callingCard?.defaultRecipient || 'daffa@gamedev.portfolio'}</div>
                  <div class="p5-commu-desc">Response within 24 hours</div>
                </div>
              </div>

              <div class="p5-commu-channel-card">
                <div class="p5-commu-inner">
                  <div class="p5-commu-tag cyan">LOCATION & TIMEZONE</div>
                  <div class="p5-commu-val">Jakarta, Indonesia (UTC+7)</div>
                  <div class="p5-commu-desc">Available for Global Remote Studio Roles</div>
                </div>
              </div>

              <div class="p5-commu-channel-card">
                <div class="p5-commu-inner">
                  <div class="p5-commu-tag green">STATUS // AVAILABILITY</div>
                  <div class="p5-commu-val">AVAILABLE FOR HIRE</div>
                  <div class="p5-commu-desc">Open for Senior Gameplay & Engine Roles</div>
                </div>
              </div>
            </div>

            <div class="text-center mt-4">
              <span class="text-xs font-mono text-[#E60012] tracking-widest uppercase font-bold">
                "TAKE YOUR HEART // MAKE EVERY FRAME COUNT"
              </span>
            </div>
          </div>
        </div>
      </section>

    </main>

    <!-- ====================================================================
         FOOTER
         ==================================================================== -->
    <footer class="p3r-footer border-t border-zinc-800 bg-black/95 p-4 text-center lg:pr-80">
      <div class="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4 text-xs font-mono text-zinc-400">
        <div>
          <span>${profile.name} // PHANTOM THIEVES GAME DEVELOPER TERMINAL</span>
          <div class="text-[10px] text-zinc-500 mt-0.5">
            Crafted with Persona 5 Royal Art Direction • "Take Your Heart"
          </div>
        </div>
        <div>
          <span class="text-[#E60012] font-bold">SYSTEM STATUS: FULL INFILTRATION CLEAR</span>
        </div>
      </div>
    </footer>

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
// 4. Palace Infiltrations (Game Heists & Mission Cleared Stamps)
// ──────────────────────────────────────────────────────────────────────────────
export function renderProjects(): void {
  const container = document.getElementById('projects-operations-grid');
  const heists = PORTFOLIO_CONFIG.heists || PORTFOLIO_CONFIG.projects || [];
  if (!container || heists.length === 0) return;

  const html = heists.map((proj) => {
    const techList = proj.techStack || (proj as any).tech || [];
    const techPills = techList.map((t: string) =>
      `<span class="tech-pill">${t}</span>`
    ).join('');

    const targetCode = proj.targetCode || (proj as any).code || 'PALACE HEIST';
    const genre = proj.genre || (proj as any).category || 'TACTICAL';
    const summary = proj.summary || (proj as any).targetDescription || '';
    const metricsStr = typeof proj.metrics === 'object' && proj.metrics !== null
      ? `${proj.metrics.fps} // ${proj.metrics.scale}`
      : String(proj.metrics || '');
    const gitUrl = proj.githubUrl || (proj as any).repoUrl || '';

    return `
      <div class="project-conquest-card p5-card-frame" id="heist-${proj.id || targetCode}">
        <!-- Blood-Red Angled "MISSION CLEARED" Stamp -->
        <div class="mission-cleared-stamp">
          ★ MISSION CLEARED ★
        </div>

        <div class="project-card-inner">
          <div class="project-code-badge">${targetCode} // ${genre}</div>
          <h3 class="project-title">${proj.title}</h3>
          <div class="p5-data-strip">◆ INFILTRATION-LOG ◆ STATUS: ACTIVE ◆ CLEARANCE: LV.99</div>
          <p class="project-summary">${summary}</p>

          <div class="tech-pills-row">${techPills}</div>

          <div class="project-metrics-bar">
            <span>📊 ${metricsStr}</span>
          </div>

          <div class="project-action-row">
            ${proj.demoUrl ? `
              <a href="${proj.demoUrl}" target="_blank" rel="noopener noreferrer" class="project-link-btn demo-btn">
                <span>▶ PLAY DEMO</span>
              </a>
            ` : ''}
            ${gitUrl ? `
              <a href="${gitUrl}" target="_blank" rel="noopener noreferrer" class="project-link-btn github-btn">
                <span>⌥ BLUEPRINTS (GIT)</span>
              </a>
            ` : ''}
            ${!proj.demoUrl && !gitUrl ? `
              <div class="p5-heist-classified-badge py-1 text-[11px] font-mono text-zinc-400">
                <span>🔒 PALACE ARCHIVE // CLEARANCE LV.99</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
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
// 6. Security Alert Level Scroll Telemetry
// ──────────────────────────────────────────────────────────────────────────────
export function initSecurityAlert(): void {
  const alertBar = document.getElementById('security-alert-bar');
  const alertText = document.getElementById('security-alert-text');

  const updateAlert = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const maxScroll = (document.documentElement.scrollHeight || 0) - (window.innerHeight || 1);
    const finalVal = maxScroll > 0
      ? Math.min(99, Math.max(15, Math.floor(15 + (scrollY / maxScroll) * 84)))
      : 15;

    if (alertBar) {
      alertBar.style.width = `${finalVal}%`;
    }
    if (alertText) {
      alertText.textContent = `${finalVal}% ${finalVal >= 90 ? 'MAX' : 'ALERT'}`;
    }
  };

  window.addEventListener('scroll', updateAlert, { passive: true });
  updateAlert();
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
  renderProjects();
  renderExperience();
  initSecurityAlert();
}
