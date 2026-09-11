/**
 * ============================================================================
 * PERSONA 5 ROYAL (P5R) - PORTFOLIO DATA CONFIGURATION & INTERFACE CONTRACTS
 * ============================================================================
 * Central single source of truth for Lead Gameplay & Engine Programmer
 * Operative: DAFFA // JOKER (Level 99 Wild Card Game Systems Engineer).
 *
 * Conforms to P5R authentic design tokens, Phantom Thief motifs,
 * and high-performance Game Development competencies.
 * ============================================================================
 */

// ────────────────────────────────────────────────────────────────────────────
// 1. TYPE SYSTEM & INTERFACE CONTRACTS
// ────────────────────────────────────────────────────────────────────────────

/**
 * P5R Elemental Affinity Badges
 * Null (Mastered / Immune), Drain (Absorbed), Repel (Reflected back)
 */
export type AffinityType = 'Null' | 'Drain' | 'Repel';

/**
 * Backward-compatibility alias for interim renderer transition
 */
export type AffinityValue = 'drain' | 'repel' | 'null' | 'resist' | 'weak';

/**
 * Social / Network Link Representation
 */
export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  handle: string;
  category: 'code' | 'games' | 'career' | 'art';
  arcana?: string; // e.g. "0. The Fool", "IV. The Emperor"
}

/**
 * Operative Profile (Dossier / Hero Profile)
 * Models Level 99 Game Systems Engineer telemetry and vitals
 */
export interface OperativeProfile {
  name: string;
  codename: string;
  title: string;
  subTitle: string;
  level: number;
  classType: string;
  quote: string;
  vitals: {
    hpText: string;
    hpPercent: number;
    spText: string;
    spPercent: number;
    batonPassText: string;
    batonPassPercent: number;
  };
  socialLinks: SocialLink[];

  // Backward compatibility fields for legacy UI components
  idCode?: string;
  role?: string;
  weapon?: string;
  japanese?: string;
  status?: {
    hp: string;
    sp: string;
    theurgy?: string;
    batonPass?: string;
  };
}

/**
 * 5-Axis Combat Parameters (Game Dev Radar Chart)
 * Corresponds to P5 core battle statistics: ST, MA, EN, AG, LU
 */
export interface RadarStat {
  code: 'ST' | 'MA' | 'EN' | 'AG' | 'LU';
  label: string;
  domain: string;
  value: number; // 0..100
  description: string;
  technologies: string[];

  // Compatibility fields for legacy list renderer
  param?: string;
  category?: string;
  score?: number;
  desc?: string;
  tools?: string[];
}

/**
 * 10 Elemental Game Engine Affinities
 * Phys, Gun, Fire, Ice, Elec, Wind, Psy, Nuke, Bless, Curse
 */
export interface ElementalAffinity {
  id: string;
  element: string;
  techStack: string;
  affinity: AffinityType;
  badgeText: string;
  icon: string;
  notes: string;

  // Compatibility fields for legacy table renderer
  elem?: string;
  role?: string;
  val?: AffinityValue;
  note?: string;
}

/**
 * Palace Heist Project Card
 * Styled as Palace Infiltration Target Files with "MISSION CLEARED" stamps
 */
export interface PalaceHeist {
  id: string;
  targetCode: string;
  title: string;
  genre: string;
  techStack: string[];
  metrics: {
    fps: string;
    drawCalls?: string;
    entityCount?: string;
    scale: string;
  };
  summary: string;
  image: string;
  demoUrl?: string;
  steamUrl?: string;
  itchUrl?: string;
  githubUrl: string;
  missionCleared: boolean;

  // Compatibility fields for legacy project renderer
  code?: string;
  category?: string;
  tech?: string[];
}

/**
 * Confidant Arcana Career Timeline
 * Game Studio Experience & Education ranked from 1 up to MAX
 */
export interface ConfidantArcana {
  id: string;
  rank: string;
  arcana: string;
  character: string;
  company: string;
  role: string;
  period: string;
  description: string;
  deliverables: string[];

  // Compatibility field for legacy timeline renderer
  desc?: string;
}

/**
 * Calling Card Contact Configuration
 * Official Phantom Thieves calling card sent to producers & studio heads
 */
export interface CallingCardConfig {
  producerQuote: string;
  objectives: {
    id: string;
    label: string;
    description: string;
  }[];
  defaultRecipient: string;
}

/**
 * Master P5R Portfolio Configuration Contract
 */
export interface P5RPortfolioConfig {
  profile: OperativeProfile;
  statsRadar: RadarStat[];
  affinities: ElementalAffinity[];
  heists: PalaceHeist[];
  confidants: ConfidantArcana[];
  callingCard: CallingCardConfig;

  // Backward compatibility fields for legacy renderer access
  skills?: RadarStat[];
  projects?: PalaceHeist[];
  experience?: ConfidantArcana[];
  companions?: any[];
}

/**
 * Legacy interface alias
 */
export type PortfolioConfig = P5RPortfolioConfig;

// ────────────────────────────────────────────────────────────────────────────
// 2. COMPLETE GAME DEVELOPER PORTFOLIO DATA
// ────────────────────────────────────────────────────────────────────────────

export const PORTFOLIO_CONFIG: P5RPortfolioConfig = {
  // ── 2.1 DOSSIER / OPERATIVE PROFILE ────────────────────────────────────────
  profile: {
    name: "DAFFA",
    codename: "JOKER",
    title: "Lead Gameplay & Engine Programmer",
    subTitle: "Wild Card Systems Architect // High-Performance Game Engineering",
    level: 99,
    classType: "Wild Card Game Engineer",
    quote: "I am the Phantom Thief of bottlenecks. We steal frame drops, optimize draw calls, and liberate 120 FPS performance from the deepest Palaces of technical debt.",
    vitals: {
      hpText: "Framerate Stability 60/120 FPS // Zero Memory Leaks",
      hpPercent: 100,
      spText: "Creative Shader Architecture 95%",
      spPercent: 95,
      batonPassText: "Agile Studio Sprint Ready // 100% Sync",
      batonPassPercent: 100
    },
    socialLinks: [
      {
        name: "GitHub",
        url: "",
        icon: "🐙",
        handle: "PENDING",
        category: "code",
        arcana: "0. The Fool"
      },
      {
        name: "Itch.io",
        url: "",
        icon: "🕹️",
        handle: "PENDING",
        category: "games",
        arcana: "I. The Magician"
      },
      {
        name: "Steam",
        url: "",
        icon: "🎮",
        handle: "PENDING",
        category: "games",
        arcana: "VII. The Chariot"
      },
      {
        name: "LinkedIn",
        url: "",
        icon: "💼",
        handle: "PENDING",
        category: "career",
        arcana: "IV. The Emperor"
      },
      {
        name: "ArtStation",
        url: "",
        icon: "🎨",
        handle: "PENDING",
        category: "art",
        arcana: "VIII. Justice"
      }
    ],

    // Legacy fields for backward compatibility
    idCode: "PHANTOM-THIEF-01",
    role: "Lead Gameplay & Engine Programmer",
    weapon: "C++20 Blade & Custom Shader Dagger",
    japanese: "ジョーカー // 開発責任者",
    status: {
      hp: "60/120 FPS LOCKED // ZERO LEAKS",
      sp: "95% // CREATIVE SHADER ARCHITECTURE",
      theurgy: "100% ALL-OUT ATTACK CHARGED",
      batonPass: "100% SPRINT READY"
    }
  },

  // ── 2.2 COMBAT PARAMETERS (5-AXIS GAME DEV RADAR) ─────────────────────────
  statsRadar: [
    {
      code: "ST",
      label: "Strength (ST)",
      domain: "Game Physics & Engine Core",
      value: 98,
      description: "Low-level engine architecture, deterministic physics simulation, custom spatial partitioning (BVH/Octrees), multithreaded job systems, and cache-coherent ECS memory layouts.",
      technologies: [
        "C++20",
        "C#",
        "Custom Memory Allocators",
        "Multithreading / Job Systems",
        "SIMD Intrinsic Ops",
        "Spatial Partitioning (BVH)",
        "Data-Oriented ECS"
      ],
      // Compatibility mappings
      param: "STRENGTH (ST)",
      category: "Game Physics & Engine Core",
      score: 98,
      desc: "Low-level engine architecture, deterministic physics simulation, custom spatial partitioning (BVH/Octrees), multithreaded job systems, and cache-coherent ECS memory layouts.",
      tools: ["C++20", "C#", "Memory Allocators", "Multithreading", "SIMD", "BVH", "ECS"]
    },
    {
      code: "MA",
      label: "Magic (MA)",
      domain: "Graphics & Shader Programming",
      value: 96,
      description: "HLSL/GLSL programmable pipeline, GPU compute shaders, volumetric ray marching, PBR materials, custom post-processing passes, and GPU-driven particle simulations.",
      technologies: [
        "HLSL / GLSL",
        "Compute Shaders",
        "Volumetric Lighting",
        "VFX Graph / Niagara",
        "Custom PBR Shaders",
        "Screen-Space Reflections",
        "RenderDoc Profiling"
      ],
      // Compatibility mappings
      param: "MAGIC (MA)",
      category: "Graphics & Shader Programming",
      score: 96,
      desc: "HLSL/GLSL programmable pipeline, GPU compute shaders, volumetric ray marching, PBR materials, custom post-processing passes, and GPU-driven particle simulations.",
      tools: ["HLSL", "GLSL", "Compute Shaders", "Volumetric FX", "PBR", "SSR", "RenderDoc"]
    },
    {
      code: "EN",
      label: "Endurance (EN)",
      domain: "Optimization & Profiling",
      value: 95,
      description: "Rigorous frame budget management (16.6ms for 60 FPS / 8.3ms for 120 FPS), draw call batching, memory leak triage, GC allocation elimination, and deep CPU/GPU hardware profiling.",
      technologies: [
        "Draw Call Optimization",
        "Garbage Collection Zeroing",
        "Unreal Insights",
        "Superluminal / Tracy",
        "Pix / RenderDoc",
        "Memory Footprint Triage",
        "Frame Budget Analysis"
      ],
      // Compatibility mappings
      param: "ENDURANCE (EN)",
      category: "Optimization & Profiling",
      score: 95,
      desc: "Rigorous frame budget management (16.6ms for 60 FPS / 8.3ms for 120 FPS), draw call batching, memory leak triage, GC allocation elimination, and deep CPU/GPU hardware profiling.",
      tools: ["Draw Calls", "GC Zeroing", "Unreal Insights", "Superluminal", "Tracy", "Pix", "Frame Budgets"]
    },
    {
      code: "AG",
      label: "Agility (AG)",
      domain: "Gameplay Mechanics & Prototyping",
      value: 99,
      description: "Snappy, responsive character controllers, state-machine combat flow (HFSM), animation blend trees, inverse kinematics (IK), and rapid 48-hour game jam prototype execution.",
      technologies: [
        "Character Locomotion",
        "Hierarchical State Machines",
        "Animation Blend Trees",
        "Combat Hit-Stop / Juice",
        "Root Motion & IK",
        "Rapid Prototyping",
        "Input Buffering"
      ],
      // Compatibility mappings
      param: "AGILITY (AG)",
      category: "Gameplay Mechanics & Prototyping",
      score: 99,
      desc: "Snappy, responsive character controllers, state-machine combat flow (HFSM), animation blend trees, inverse kinematics (IK), and rapid 48-hour game jam prototype execution.",
      tools: ["Locomotion", "HFSM State Machines", "Blend Trees", "Hit-Stop / Juice", "Root Motion", "Prototyping", "Input Buffer"]
    },
    {
      code: "LU",
      label: "Luck (LU)",
      domain: "Procedural Generation & Game AI",
      value: 92,
      description: "Algorithmic procedural dungeon synthesis via Wave Function Collapse & BSP, dynamic NavMesh navigation, tactical sensory systems, and utility-based enemy behavior trees.",
      technologies: [
        "Behavior Trees",
        "Utility AI Systems",
        "Wave Function Collapse (WFC)",
        "Binary Space Partitioning",
        "NavMesh Dynamic Obstacles",
        "Perlin / Simplex Noise",
        "A* Pathfinding Heuristics"
      ],
      // Compatibility mappings
      param: "LUCK (LU)",
      category: "Procedural Generation & Game AI",
      score: 92,
      desc: "Algorithmic procedural dungeon synthesis via Wave Function Collapse & BSP, dynamic NavMesh navigation, tactical sensory systems, and utility-based enemy behavior trees.",
      tools: ["Behavior Trees", "Utility AI", "WFC Dungeon Gen", "BSP", "NavMesh", "Simplex Noise", "A* Pathfinding"]
    }
  ],

  // ── 2.3 10 ELEMENTAL GAME ENGINE AFFINITIES ───────────────────────────────
  affinities: [
    {
      id: "elem-phys",
      element: "Phys",
      techStack: "C++ / C# Core",
      affinity: "Repel",
      badgeText: "REPEL",
      icon: "⚔️",
      notes: "Zero-cost abstractions, deterministic memory safety, and high-throughput cache alignment",
      elem: "C++ / C# Core",
      role: "Physical (Phys)",
      val: "repel",
      note: "Deterministic native engine architecture, cache alignment & zero-cost abstractions"
    },
    {
      id: "elem-gun",
      element: "Gun",
      techStack: "Unreal Engine 5 / Blueprint",
      affinity: "Null",
      badgeText: "NULL",
      icon: "🔫",
      notes: "Gameplay Ability System (GAS), Motion Matching, Lumen/Nanite pipeline integration",
      elem: "Unreal Engine 5",
      role: "Ballistics (Gun)",
      val: "null",
      note: "Gameplay Ability System (GAS), Motion Matching, native C++ & Blueprint bridges"
    },
    {
      id: "elem-fire",
      element: "Fire",
      techStack: "Unity 3D / C#",
      affinity: "Drain",
      badgeText: "DRAIN",
      icon: "🔥",
      notes: "Custom Scriptable Render Pipeline (URP/HDRP), DOTS/Burst compiler, and event architectures",
      elem: "Unity 3D / C#",
      role: "Flame (Fire)",
      val: "drain",
      note: "Custom SRP (URP/HDRP), DOTS/ECS Burst compiler, and modular gameplay architectures"
    },
    {
      id: "elem-ice",
      element: "Ice",
      techStack: "Godot / GDScript",
      affinity: "Null",
      badgeText: "NULL",
      icon: "❄️",
      notes: "Lightweight modular nodes, C++ GDExtension modules, and rapid 2D/3D prototype iterations",
      elem: "Godot Engine",
      role: "Frost (Ice)",
      val: "null",
      note: "Lightweight modular nodes, C++ GDExtension modules, and rapid 2D/3D iterations"
    },
    {
      id: "elem-elec",
      element: "Elec",
      techStack: "Shaders (HLSL / GLSL)",
      affinity: "Repel",
      badgeText: "REPEL",
      icon: "⚡",
      notes: "Compute pipelines, ray marching, volumetric lighting, and screen-space post-processing",
      elem: "HLSL / GLSL Shaders",
      role: "Volt (Elec)",
      val: "repel",
      note: "Compute pipelines, ray marching, volumetric lighting, and screen-space post-processing"
    },
    {
      id: "elem-wind",
      element: "Wind",
      techStack: "Game Physics & Mathematics",
      affinity: "Drain",
      badgeText: "DRAIN",
      icon: "🌪️",
      notes: "Rigid-body kinematics, quaternion spatial rotations, collision response, and linear algebra",
      elem: "Physics & Math",
      role: "Gale (Wind)",
      val: "drain",
      note: "Rigid-body kinematics, quaternion spatial rotations, collision response, and linear algebra"
    },
    {
      id: "elem-psy",
      element: "Psy",
      techStack: "Game AI & Behavior Trees",
      affinity: "Null",
      badgeText: "NULL",
      icon: "👁️",
      notes: "Hierarchical task networks, tactical combat perception grids, and dynamic crowd avoidance",
      elem: "Game AI & Behavior",
      role: "Telekinesis (Psy)",
      val: "null",
      note: "Hierarchical task networks, tactical combat perception grids, and crowd avoidance"
    },
    {
      id: "elem-nuke",
      element: "Nuke",
      techStack: "WebGL / WebGPU / Three.js",
      affinity: "Repel",
      badgeText: "REPEL",
      icon: "☢️",
      notes: "Hardware-accelerated in-browser graphics, WebAssembly compute bindings, and 60 FPS web engines",
      elem: "WebGL & WebGPU",
      role: "Atomic (Nuke)",
      val: "repel",
      note: "Hardware-accelerated in-browser graphics, WebAssembly compute, and 60 FPS web engines"
    },
    {
      id: "elem-bless",
      element: "Bless",
      techStack: "Audio Integration (FMOD / Wwise)",
      affinity: "Drain",
      badgeText: "DRAIN",
      icon: "✨",
      notes: "Interactive procedural sound design, DSP parameter automation, and dynamic combat music cues",
      elem: "FMOD / Wwise Audio",
      role: "Divine (Bless)",
      val: "drain",
      note: "Interactive procedural sound design, DSP parameter automation, and combat music cues"
    },
    {
      id: "elem-curse",
      element: "Curse",
      techStack: "Memory Optimization / Profiling",
      affinity: "Null",
      badgeText: "NULL",
      icon: "💀",
      notes: "Elimination of heap allocations, cache miss triage, frame budget enforcement, and zero GC spikes",
      elem: "Memory & Profiling",
      role: "Chaos (Curse)",
      val: "null",
      note: "Elimination of heap allocations, cache miss triage, frame budgets, and zero GC spikes"
    }
  ],

  // ── 2.4 PALACE INFILTRATIONS (4 FEATURED GAME PROJECTS) ───────────────────
  heists: [
    {
      id: "heist-01",
      targetCode: "PALACE OF THE FORGOTTEN ENGINE",
      title: "Soulforged: Echoes of Aethelgard",
      genre: "Fast-Paced Action RPG & Hack-and-Slash",
      techStack: [
        "Unreal Engine 5.4",
        "C++",
        "GAS (Gameplay Ability System)",
        "HLSL",
        "Niagara VFX",
        "Motion Matching"
      ],
      metrics: {
        fps: "120 FPS Locked",
        drawCalls: "<180 DC",
        entityCount: "4,000+ Dynamic Actors",
        scale: "16km² Open World"
      },
      summary: "A high-octane 3D third-person character action RPG featuring deterministic animation cancel windows, state-machine combat flow, custom physics dismemberment, and volumetric compute lighting.",
      image: "/images/p5r/arsene.png",
      demoUrl: "",
      itchUrl: "",
      steamUrl: "",
      githubUrl: "",
      missionCleared: true,
      // Compatibility fields
      code: "PALACE-01 // FORGOTTEN ENGINE",
      category: "Action RPG & Hack-and-Slash",
      tech: ["Unreal Engine 5.4", "C++", "GAS", "HLSL", "Niagara VFX"]
    },
    {
      id: "heist-02",
      targetCode: "PALACE OF THE ABYSSAL CHRONICLES",
      title: "Phantom Spire: Neon Underworld",
      genre: "Procedural Deckbuilding Roguelike Dungeon Crawler",
      techStack: [
        "Unity 6",
        "C#",
        "DOTS / Entities 1.0",
        "Burst Compiler",
        "Compute Shaders",
        "FMOD Audio"
      ],
      metrics: {
        fps: "144 FPS Benchmark",
        drawCalls: "<85 DC",
        entityCount: "12,000+ Swarm Units",
        scale: "Infinite Procedural Floors"
      },
      summary: "Grid-based tactical dungeon crawler leveraging Wave Function Collapse for floor generation, SIMD-accelerated AI swarm paths, and an interactive reactive audio DSP soundtrack.",
      image: "/images/p5r/joker_render.png",
      demoUrl: "",
      itchUrl: "",
      githubUrl: "",
      missionCleared: true,
      // Compatibility fields
      code: "PALACE-02 // ABYSSAL CHRONICLES",
      category: "Roguelike Dungeon Crawler",
      tech: ["Unity 6", "C#", "DOTS / Burst", "Compute Shaders", "FMOD"]
    },
    {
      id: "heist-03",
      targetCode: "PALACE OF THE CRIMSON CONTRACT",
      title: "Valkyrie Overdrive: 2088",
      genre: "Cyberpunk High-Speed 6DOF Mech Combat Simulator",
      techStack: [
        "Custom C++20 Engine",
        "Vulkan API",
        "Jolt Physics",
        "DirectX 12",
        "Dear ImGui",
        "Tracy Profiler"
      ],
      metrics: {
        fps: "240 FPS Ultra-Low Latency",
        drawCalls: "<60 DC",
        entityCount: "8,500 Colliding Projectiles",
        scale: "60km Orbit Arena"
      },
      summary: "Proprietary zero-overhead game engine built from scratch in C++20 and Vulkan. Features lock-free task stealing multithreading, custom continuous collision detection, and clustered forward shading.",
      image: "/images/p5r/phantom_thieves_logo.png",
      demoUrl: "",
      itchUrl: "",
      githubUrl: "",
      missionCleared: true,
      // Compatibility fields
      code: "PALACE-03 // CRIMSON CONTRACT",
      category: "6DOF Mech Combat Simulator",
      tech: ["Custom C++20", "Vulkan API", "Jolt Physics", "Tracy Profiler"]
    },
    {
      id: "heist-04",
      targetCode: "PALACE OF THE SYNTHETIC VOID",
      title: "Aetheria: Sovereign of WebGPU",
      genre: "Real-Time In-Browser 3D Shader Sandbox & Game Framework",
      techStack: [
        "TypeScript",
        "WebGPU",
        "WGSL",
        "Three.js",
        "Web Audio API",
        "WebAssembly (C++/Rust)"
      ],
      metrics: {
        fps: "60 FPS Web Standard",
        drawCalls: "1 Batched MultiDraw",
        entityCount: "250,000 GPU Particles",
        scale: "Interactive Browser Demo"
      },
      summary: "Cutting-edge browser-native game engine showcasing compute-driven flocking boids, real-time screen-space reflections, and synthesized procedural audio with zero external libraries.",
      image: "/images/p5r/joker_cutin.png",
      demoUrl: "",
      itchUrl: "",
      githubUrl: "",
      missionCleared: true,
      // Compatibility fields
      code: "PALACE-04 // SYNTHETIC VOID",
      category: "Real-Time WebGPU Engine",
      tech: ["TypeScript", "WebGPU", "WGSL", "WebAudio API", "Wasm"]
    }
  ],

  // ── 2.5 CONFIDANTS ARCANA TIMELINE (EXPERIENCE & EDUCATION) ───────────────
  confidants: [
    {
      id: "confidant-sae",
      rank: "RANK 10 // MAX",
      arcana: "XX. Judgement",
      character: "Sae Niijima",
      company: "Apex Interactive / Metaverse Game Labs",
      role: "Lead Gameplay & Engine Programmer",
      period: "2024 — PRESENT",
      description: "Spearheading engine core development, multithreaded ECS architectures, and high-performance gameplay systems for unannounced AAA/AA action titles. Guiding technical direction, profiling pipelines, and mentoring gameplay engineers.",
      deliverables: [
        "Architected deterministic rollback networking system handling 64 players with <2ms frame processing",
        "Cut memory footprint by 38% and stabilized 60 FPS on lower-tier hardware via custom arena allocators",
        "Constructed modular Gameplay Ability System (GAS) adopted by 4 internal cross-functional feature teams"
      ],
      // Compatibility field
      desc: "Leading architecture and development of high-performance gameplay systems, deterministic rollback networking, and multithreaded engine pipelines."
    },
    {
      id: "confidant-yusuke",
      rank: "RANK 8",
      arcana: "IV. The Emperor",
      character: "Yusuke Kitagawa",
      company: "Kirijo Digital Games",
      role: "Senior Game Systems & Graphics Engineer",
      period: "2022 — 2024",
      description: "Engineered rendering features, custom HLSL/compute shaders, and animation state machine systems in Unreal Engine 5 and proprietary engines. Spearheaded profiling sessions across target platforms.",
      deliverables: [
        "Authored custom volumetric cloud and atmospheric scattering shader pipeline in HLSL/DirectX 12",
        "Implemented character locomotion blend trees and inverse kinematics (IK) foot placement",
        "Reduced draw calls from 3,200 to under 750 through GPU instancing and hierarchical LOD generation"
      ],
      // Compatibility field
      desc: "Engineered custom HLSL/compute shaders, locomotion blend trees, inverse kinematics, and GPU instancing draw call reductions."
    },
    {
      id: "confidant-ryuji",
      rank: "RANK 6",
      arcana: "VII. The Chariot",
      character: "Ryuji Sakamoto",
      company: "Shujin Interactive Works",
      role: "Gameplay & Physics Programmer",
      period: "2020 — 2022",
      description: "Developed responsive 3D character controllers, collision detection, and weapon hit-stop 'game juice' mechanics in Unity and C++. Collaborated directly with combat designers.",
      deliverables: [
        "Built fluid parkour locomotion and ledge-grabbing system with responsive sub-millisecond input buffering",
        "Created weapon impact time-dilation and screen shake camera matrix shaking algorithm",
        "Shipped 2 commercially released indie action titles on Steam and Nintendo Switch"
      ],
      // Compatibility field
      desc: "Developed responsive 3D character controllers, combat impact hit-stop mechanics, and parkour locomotion systems."
    },
    {
      id: "confidant-futaba",
      rank: "RANK 4",
      arcana: "IX. The Hermit",
      character: "Futaba Sakura",
      company: "Leblanc Cybernetics & Indie R&D",
      role: "Game Engine & Tools Intern / Indie Dev",
      period: "2019 — 2020",
      description: "Built internal level editor tools, procedural dungeon generation algorithms (WFC / BSP), and telemetry debugging dashboards using C++, Python, and Dear ImGui.",
      deliverables: [
        "Created visual node-based behavior tree editor in Dear ImGui boosting designer workflow velocity by 3x",
        "Implemented procedural cavern layout generator based on cellular automata and Voronoi tessellation",
        "Authored automated build test runner and memory leak sanity checks in CI pipeline"
      ],
      // Compatibility field
      desc: "Built procedural dungeon generators (WFC/BSP), node-based behavior tree tools in Dear ImGui, and telemetry dashboards."
    },
    {
      id: "confidant-sojiro",
      rank: "RANK 1",
      arcana: "V. The Hierophant",
      character: "Sojiro Sakura",
      company: "Tatsumi University of Technology",
      role: "B.S. in Computer Science (Game Engineering & Graphics)",
      period: "2016 — 2020",
      description: "Graduated with First-Class Honors. Focused on Computer Graphics, Linear Algebra, Real-Time Physics Simulation, and Data-Oriented Design. President of University Game Dev Society.",
      deliverables: [
        "Capstone: Custom Software Rasterizer from scratch in C++ simulating full 3D pipeline without GPU APIs",
        "Winner of National 48-Hour Game Jam 2019 (Best Technical Gameplay Mechanics)",
        "Published academic research paper on Cache-Oblivious Spatial Partitioning Trees"
      ],
      // Compatibility field
      desc: "First-Class Honors graduate in Computer Science. Specialized in Computer Graphics, Physics Simulation, and Custom Software Rasterizers."
    }
  ],

  // ── 2.6 CALLING CARD CONFIG (STUDIO HIRE & CONTACT) ───────────────────────
  callingCard: {
    producerQuote: "Sir / Madam Producer, you have hoarded complex game architecture hurdles, sluggish frame drops, and technical debt behind closed doors. On this day, we shall take your project offer and deliver 120 FPS perfection!",
    objectives: [
      {
        id: "role-fulltime",
        label: "Full-time Studio Role",
        description: "Lead Gameplay / Engine Programmer opportunities in AAA, AA, or ambitious indie studios."
      },
      {
        id: "collab-indie",
        label: "Game Jam / Indie Collab",
        description: "High-octane game jam sprints, technical co-development, or rapid prototype development."
      },
      {
        id: "contract-shader",
        label: "Freelance Engine & Shaders",
        description: "Contract optimization, custom HLSL/GLSL shader engineering, and profiling triage."
      },
      {
        id: "coffee-chat",
        label: "Coffee Chat & Tech Sync",
        description: "Architecture discussions, engine deep-dives, industry networking, and game dev exchange."
      }
    ],
    defaultRecipient: "daffa.joker.dev@gmail.com"
  }
};

// ────────────────────────────────────────────────────────────────────────────
// 3. BACKWARD COMPATIBILITY BRIDGES
// ────────────────────────────────────────────────────────────────────────────
// Connects new P5R properties to legacy property names for safe interim builds

PORTFOLIO_CONFIG.skills = PORTFOLIO_CONFIG.statsRadar;
PORTFOLIO_CONFIG.projects = PORTFOLIO_CONFIG.heists;
PORTFOLIO_CONFIG.experience = PORTFOLIO_CONFIG.confidants;
PORTFOLIO_CONFIG.companions = [
  {
    id: "joker",
    name: "Joker (Ren Amamiya)",
    role: "Leader // Wild Card Programmer",
    arcana: "0. The Fool",
    persona: "Arsène & Satanael",
    image: "/images/p5r/joker_render.png",
    quote: "Show me your true code!"
  },
  {
    id: "morgana",
    name: "Morgana (Mona)",
    role: "Navigator // Agile Scrum Master",
    arcana: "I. The Magician",
    persona: "Zorro",
    image: "/images/p5r/morgana.png",
    quote: "Looking cool, Joker! The sprint velocity is through the roof!"
  },
  {
    id: "arsene",
    name: "Arsène",
    role: "Initial Persona // Engine Kernel",
    arcana: "0. The Fool",
    persona: "Arsène",
    image: "/images/p5r/arsene.png",
    quote: "I am the pillager of twilight, the guardian of framerates."
  }
];

export default PORTFOLIO_CONFIG;
