# Workspace Guidelines: Persona 5 Royal Web Development

These guidelines reflect learned project conventions, design invariants, and technical workflows for this Persona 5 Royal web portfolio.

---

## 1. Typography Invariants
- **Command & Navigation Ribbons**: Use `Bebas Neue` with `letter-spacing: 0.05em`, `text-transform: uppercase`, and `transform: skewX(-12deg) rotate(-8deg)`.
- **Primary Display Titles & Finishing Touch (AOA)**: Use `Anton` (`--font-display`) with negative kerning (`letter-spacing: -0.04em`) and dynamic `skewX(-12deg)`.
- **Ransom-Note Paper Cutout Headers**: Use `Dela Gothic One` with per-character rotation (-4deg to +4deg) and alternating paper-cutout backgrounds (`r-bg-red`, `r-bg-white`, `r-bg-black`).
- **Telemetry, System Stats & Meters**: Use `JetBrains Mono` with wide tracking (`letter-spacing: 0.25em`).

---

## 2. Audio Engine & SFX Integration
- **Two-Tier Audio Architecture**:
  1. **Primary**: High-fidelity local `.mp3` / `.wav` sound files located in `public/audio/sfx/`.
  2. **Fallback**: Zero-latency procedural Web Audio API synthesizer for instant fallback if browser autoplay policy blocks HTMLAudioElement playback.
- **Audio Asset Acquisition**:
  - Direct scraping from game rips often encounters Cloudflare protection or proprietary `.cpk`/`.awb` containers.
  - Source verified, pre-extracted game audio from high-fidelity open-source fan projects and browser mods on GitHub (e.g., `Hum2a/Persona-5-Royal-Main-Menu-Opera-GX-Mod`, `Chavafei/Persona_5_menu_in_Godot`, `ffaneto/persona5-website-theme`).
  - Always store audio assets in both `.mp3` and `.wav` formats in `public/audio/sfx/`.

---

## 3. UI Framing & Comic Accents
- **Card Brackets (`.p5-card-frame`)**:
  - Top-left corner: Crimson L-bracket (`#E60012`).
  - Bottom-right corner: Royal Gold L-bracket (`#FFDE00`).
  - Ensure all main content panels, cards, and interactive containers apply `.p5-card-frame`.
- **Data Readout Strips (`.p5-data-strip`)**:
  - Every project card must include the infiltration log telemetry strip: `◆ INFILTRATION-LOG ◆ STATUS: ACTIVE ◆ CLEARANCE: LV.99`.
- **Section Transition Pacing**:
  - Always precede dramatic polygon wipes with a brief 60ms screen blackout to simulate high-contrast camera shutter flash.

---

## 4. Subagent Quota & Execution Resilience
- If background subagents hit API quota limits (`RESOURCE_EXHAUSTED / 429`), immediately pivot to executing and verifying the implementation directly in the primary session to maintain continuous execution.

---

## 5. Audio Collision Prevention & Channel Separation
- Separate sound effects into dedicated channels (`playHoverChannel` vs `playActionChannel`).
- Hover channel must throttle events (minimum 100–120ms cooldown) and pause/reset any currently playing hover sound when a new one begins to prevent auditory cacophony during rapid mouse sweeps.
- Action channel must pause previous action clips so confirms, cancels, and slashes hit crisply without muddy reverberation.

---

## 6. Keyboard & Controller Navigation Invariants
- Provide dual input support: Mouse + full Keyboard controls (`ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight` and `W`/`A`/`S`/`D`).
- Input Protection: Always check `document.activeElement` for `input`, `textarea`, or `select` before intercepting keyboard shortcuts.
- Cancel/Return Navigation: Pressing `ESC` or `Backspace` must close active modals first, then navigate back through `tabHistory` with authentic Persona cancel sound (`menu_back.wav` / `menu_back.mp3`).
- On-Screen Prompts: Include an authentic Persona 5 Back Button (`#p5-back-btn`) and Controller Prompt Bar (`#p5-controller-hud`).

---

## 7. Transition Pacing, Kinetic Entrances & Hitbox Anchoring
- **Wipe Pacing & Animation Synchronization**:
  - Never place artificial CSS animation delays on wipe-out layers that exceed JS cleanup timeouts. Wipe-out must execute smoothly upon tab swap at midpoint (~160ms) without premature DOM removal.
  - Pair the diagonal comic slash with a synchronized light beam (`.p5r-slash-cutline`) and subtle micro-punch recoil on `.main-content`.
- **Mouse Hover Hitbox Anchoring**:
  - Elements that translate horizontally on hover (such as ribbon buttons `translateX(18px)`) must incorporate an extended hit-area buffer (`::before { inset: -6px -12px -6px -32px; }`) so cursor movement never slips off the element and causes recursive hover-jitter loops.
- **Dynamic Stance Kinetic Transitions**:
  - Animate character stance reactions using the Web Animations API (`element.animate()`) preserving custom rotational and positional offsets rather than rigid CSS `@keyframes` that force scale resets.
- **Staggered Content Reveal**:
  - Newly activated tabs must reveal their section headers with comic slide-in and child cards with staggered pop-in (`0.04s` stagger increments) to match Persona 5's energetic menu feel.

---

## 8. Tactical Field Navigator & Modal System Invariants
- **Morgana Field Advisor (`#p5-mona-navigator`)**:
  - Stationed bottom-left (`z-index: 60`), non-blocking with `pointer-events: none` on container and `pointer-events: auto` on interactive speech bubble and avatar button.
  - Listens to `p5r:tabchange`, high alert telemetry (>80%), and audio toggles to speak contextual Phantom Thief lines.
  - Clicking avatar cycles practical keyboard tips and lore.
- **Modal Dialog Hierarchies (`.p5-modal-backdrop`)**:
  - All application modals (Field Manual, Palace Heist Blueprint, All-Out Attack) must share unified backdrop blur (`z-index: 9980-9999`) and respect `ESC` key dismiss with `menu_back.mp3`.
  - Always trap or isolate scroll when modal is active, and reset input focus gracefully upon dismissal.



