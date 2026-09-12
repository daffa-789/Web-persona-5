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
    title: "Lead Unity Developer & 3D Technical Artist",
    subTitle: "Unity 3D Systems & C# Gameplay // Blender 3D Modeling & Pipeline",
    level: 99,
    classType: "Unity & Blender 3D Specialist",
    quote: "Specializing in responsive Unity C# gameplay mechanics, custom URP shaders, and seamless Blender 3D modeling & rigging pipelines.",
    vitals: {
      hpText: "Unity C# Systems // Robust Game Core",
      hpPercent: 100,
      spText: "Blender 3D Modeling // URP Shaders & VFX",
      spPercent: 95,
      batonPassText: "Agile Studio Collaboration // 100% Sync",
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
    role: "Lead Unity Developer & 3D Technical Artist",
    weapon: "Unity C# Blade & Blender 3D Stylus",
    japanese: "ジョーカー // Unity & 3D開発責任者",
    status: {
      hp: "UNITY C# SYSTEMS // CLEAN CODE",
      sp: "BLENDER 3D & URP SHADERS",
      theurgy: "100% SHOWTIME READY",
      batonPass: "100% SPRINT READY"
    }
  },

  // ── 2.2 COMBAT PARAMETERS (5-AXIS GAME DEV RADAR) ─────────────────────────
  statsRadar: [
    {
      code: "ST",
      label: "Strength (ST)",
      domain: "Unity Gameplay & C# Architecture",
      value: 98,
      description: "Modular Unity C# systems, responsive 3D character controllers, custom PhysX collision handling, ScriptableObject event architectures, and high-throughput DOTS/Burst gameplay routines.",
      technologies: [
        "Unity 3D",
        "C# (.NET Core)",
        "Character Controllers",
        "ScriptableObject Architecture",
        "PhysX & Collision Sweeps",
        "DOTS / Entities & Burst",
        "New Input System"
      ],
      // Compatibility mappings
      param: "STRENGTH (ST)",
      category: "Unity Gameplay & C# Architecture",
      score: 98,
      desc: "Modular Unity C# systems, responsive 3D character controllers, custom PhysX collision handling, ScriptableObject event architectures, and high-throughput DOTS/Burst gameplay routines.",
      tools: ["Unity 3D", "C#", "Character Controllers", "ScriptableObjects", "PhysX", "DOTS / Burst", "Input System"]
    },
    {
      code: "MA",
      label: "Magic (MA)",
      domain: "Blender 3D Modeling & Texturing",
      value: 96,
      description: "End-to-end 3D asset pipeline in Blender: game-ready low-poly modeling, non-destructive modifiers, high-to-low normal map baking, clean quad topology, and PBR procedural texturing.",
      technologies: [
        "Blender 3D",
        "Hard-Surface Modeling",
        "Low-Poly / High-Poly Baking",
        "Clean Quads Topology",
        "UV Unwrapping & Atlasing",
        "Geometry Nodes",
        "PBR Material Shading"
      ],
      // Compatibility mappings
      param: "MAGIC (MA)",
      category: "Blender 3D Modeling & Texturing",
      score: 96,
      desc: "End-to-end 3D asset pipeline in Blender: game-ready low-poly modeling, non-destructive modifiers, high-to-low normal map baking, clean quad topology, and PBR procedural texturing.",
      tools: ["Blender 3D", "Hard-Surface", "Baking", "Quads Topology", "UV Atlasing", "Geometry Nodes", "PBR Materials"]
    },
    {
      code: "EN",
      label: "Endurance (EN)",
      domain: "Unity Profiling & Optimization",
      value: 95,
      description: "Rigorous frame-budget profiling (60-120 FPS target), memory leak diagnostics, garbage collection zeroing, draw call batching (Static/Dynamic/GPU Instancing), and occlusion culling.",
      technologies: [
        "Unity Profiler",
        "Memory Profiler",
        "Draw Call Batching",
        "Garbage Collection Zeroing",
        "Occlusion Culling & LODs",
        "Texture Compression (ASTC/DXT)",
        "Mobile & PC Performance"
      ],
      // Compatibility mappings
      param: "ENDURANCE (EN)",
      category: "Unity Profiling & Optimization",
      score: 95,
      desc: "Rigorous frame-budget profiling (60-120 FPS target), memory leak diagnostics, garbage collection zeroing, draw call batching (Static/Dynamic/GPU Instancing), and occlusion culling.",
      tools: ["Unity Profiler", "Memory Profiler", "Draw Call Batching", "GC Zeroing", "Occlusion Culling", "Texture Compression", "LODs"]
    },
    {
      code: "AG",
      label: "Agility (AG)",
      domain: "Blender Rigging & Unity Animation",
      value: 99,
      description: "Full character skeletal rigging and weight painting in Blender, custom IK/FK bone constraints, automated FBX export, and dynamic Unity Mecanim blend trees with Animation Rigging.",
      technologies: [
        "Blender Skeletal Armatures",
        "Weight Painting & Skinning",
        "Inverse Kinematics (IK)",
        "Unity Mecanim Animator",
        "2D/3D Blend Trees",
        "Unity Animation Rigging",
        "Root Motion & Sync"
      ],
      // Compatibility mappings
      param: "AGILITY (AG)",
      category: "Blender Rigging & Unity Animation",
      score: 99,
      desc: "Full character skeletal rigging and weight painting in Blender, custom IK/FK bone constraints, automated FBX export, and dynamic Unity Mecanim blend trees with Animation Rigging.",
      tools: ["Blender Rigging", "Weight Painting", "IK / FK", "Mecanim", "Blend Trees", "Animation Rigging", "Root Motion"]
    },
    {
      code: "LU",
      label: "Luck (LU)",
      domain: "URP Shaders & Visual Effects",
      value: 94,
      description: "Custom stylized anime and PBR shaders in Unity Shader Graph, dynamic GPU particle simulations with VFX Graph, post-processing color grading, and custom render features.",
      technologies: [
        "Unity Shader Graph",
        "Universal Render Pipeline (URP)",
        "VFX Graph & Shuriken",
        "Custom Toon Cel-Shading",
        "Post-Processing Stack",
        "Decal Projectors",
        "Blender Lighting & Baking"
      ],
      // Compatibility mappings
      param: "LUCK (LU)",
      category: "URP Shaders & Visual Effects",
      score: 94,
      desc: "Custom stylized anime and PBR shaders in Unity Shader Graph, dynamic GPU particle simulations with VFX Graph, post-processing color grading, and custom render features.",
      tools: ["Shader Graph", "URP", "VFX Graph", "Cel-Shading", "Post-Processing", "Decals", "Blender Lighting"]
    }
  ],

  // ── 2.3 10 ELEMENTAL GAME ENGINE AFFINITIES (UNITY & BLENDER) ────────────
  affinities: [
    {
      id: "elem-phys",
      element: "Phys",
      techStack: "Unity C# Gameplay",
      affinity: "Repel",
      badgeText: "REPEL",
      icon: "⚔️",
      notes: "Responsive character controllers, finite state machines, event-driven game loops, and zero GC allocation",
      elem: "Unity C# Gameplay",
      role: "Physical (Phys)",
      val: "repel",
      note: "Responsive character controllers, finite state machines, event-driven loops, and zero GC allocation"
    },
    {
      id: "elem-gun",
      element: "Gun",
      techStack: "Blender 3D Modeling",
      affinity: "Null",
      badgeText: "NULL",
      icon: "🔫",
      notes: "Stylized characters, modular hard-surface props, clean quad retopology, and game-ready SubD modeling",
      elem: "Blender 3D Modeling",
      role: "Ballistics (Gun)",
      val: "null",
      note: "Stylized characters, modular hard-surface props, clean quad retopology, and SubD modeling"
    },
    {
      id: "elem-fire",
      element: "Fire",
      techStack: "Unity URP & Shaders",
      affinity: "Drain",
      badgeText: "DRAIN",
      icon: "🔥",
      notes: "Custom Shader Graph cel-shading, PBR surface shaders, post-processing volume stacks, and render features",
      elem: "Unity URP & Shaders",
      role: "Flame (Fire)",
      val: "drain",
      note: "Custom Shader Graph cel-shading, PBR surface shaders, post-processing stacks, and render features"
    },
    {
      id: "elem-ice",
      element: "Ice",
      techStack: "Blender Rigging & IK",
      affinity: "Null",
      badgeText: "NULL",
      icon: "❄️",
      notes: "Skeletal deformation bones, Rigify IK/FK blending, facial shape keys, and custom weight painting",
      elem: "Blender Rigging & IK",
      role: "Frost (Ice)",
      val: "null",
      note: "Skeletal deformation bones, Rigify IK/FK blending, facial shape keys, and custom weight painting"
    },
    {
      id: "elem-elec",
      element: "Elec",
      techStack: "Unity Mecanim Animation",
      affinity: "Repel",
      badgeText: "REPEL",
      icon: "⚡",
      notes: "1D/2D locomotion blend trees, animation rigging IK constraints, avatar masks, and state transitions",
      elem: "Unity Mecanim",
      role: "Volt (Elec)",
      val: "repel",
      note: "1D/2D locomotion blend trees, animation rigging IK constraints, avatar masks, and state transitions"
    },
    {
      id: "elem-wind",
      element: "Wind",
      techStack: "Blender Geometry Nodes",
      affinity: "Drain",
      badgeText: "DRAIN",
      icon: "🌪️",
      notes: "Procedural foliage scattering, parametric curve generation, non-destructive modifiers, and mesh baking",
      elem: "Blender Geo Nodes",
      role: "Gale (Wind)",
      val: "drain",
      note: "Procedural foliage scattering, parametric curve generation, non-destructive modifiers, and mesh baking"
    },
    {
      id: "elem-psy",
      element: "Psy",
      techStack: "Unity Physics & Collisions",
      affinity: "Null",
      badgeText: "NULL",
      icon: "👁️",
      notes: "Kinematic raycast controllers, layer-based collision matrices, joint ragdoll dynamics, and physics tuning",
      elem: "Unity Physics",
      role: "Telekinesis (Psy)",
      val: "null",
      note: "Kinematic raycast controllers, layer-based collision matrices, joint ragdoll dynamics, and physics tuning"
    },
    {
      id: "elem-nuke",
      element: "Nuke",
      techStack: "Unity Profiler & Opt.",
      affinity: "Repel",
      badgeText: "REPEL",
      icon: "☢️",
      notes: "Garbage collection spike elimination, deep CPU/GPU frame time profiling, draw call batching, and LOD culling",
      elem: "Unity Profiler & Opt.",
      role: "Atomic (Nuke)",
      val: "repel",
      note: "GC spike elimination, deep CPU/GPU frame profiling, draw call batching, and LOD culling"
    },
    {
      id: "elem-bless",
      element: "Bless",
      techStack: "Unity UI Toolkit & UX",
      affinity: "Drain",
      badgeText: "DRAIN",
      icon: "✨",
      notes: "Responsive Canvas layouts, UI Toolkit USS styling, juicy tween feedback, and Persona-style diegetic HUDs",
      elem: "Unity UI / UX Systems",
      role: "Divine (Bless)",
      val: "drain",
      note: "Responsive Canvas layouts, UI Toolkit USS styling, juicy tween feedback, and diegetic HUDs"
    },
    {
      id: "elem-curse",
      element: "Curse",
      techStack: "Blender-to-Unity Pipeline",
      affinity: "Null",
      badgeText: "NULL",
      icon: "💀",
      notes: "Seamless FBX/glTF asset pipeline, coordinate axis synchronization, packed PBR textures, and Git LFS versioning",
      elem: "Blender -> Unity Pipeline",
      role: "Chaos (Curse)",
      val: "null",
      note: "Seamless FBX/glTF asset pipeline, axis synchronization, packed PBR textures, and Git LFS"
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

  // ── 2.5 CONFIDANTS ARCANA TIMELINE (UNITY & BLENDER CAREER) ─────────────
  confidants: [
    {
      id: "confidant-sae",
      rank: "RANK 10 // MAX",
      arcana: "XX. Judgement",
      character: "Sae Niijima",
      company: "Apex Interactive / Metaverse Game Labs",
      role: "Lead Unity Developer & 3D Technical Artist",
      period: "2024 — PRESENT",
      description: "Directing Unity client gameplay architecture and the 3D art integration pipeline. Championing asset optimization from Blender into Unity URP, authoring core C# character mechanics, and enforcing strict 60 FPS mobile/PC performance budgets.",
      deliverables: [
        "Engineered modular C# gameplay framework across 5 core systems with zero-allocation memory pooling",
        "Established automated Blender-to-Unity asset pipeline reducing 3D model import & setup time by 50%",
        "Authored custom URP Shader Graph shaders and optimized draw calls from 1,800 to under 450 with GPU instancing"
      ],
      // Compatibility field
      desc: "Directing Unity client gameplay architecture and Blender 3D technical art pipeline, custom URP shaders, and 60 FPS performance optimization."
    },
    {
      id: "confidant-yusuke",
      rank: "RANK 8",
      arcana: "IV. The Emperor",
      character: "Yusuke Kitagawa",
      company: "Kirijo Digital Games",
      role: "Senior Unity Gameplay Programmer & 3D Modeler",
      period: "2022 — 2024",
      description: "Modeled stylized 3D character and environment assets in Blender and implemented interactive combat mechanics in Unity. Collaborated closely with game designers and art directors to establish visual coherence.",
      deliverables: [
        "Modeled, textured, and rigged 12+ stylized character models in Blender with clean quad topology",
        "Developed Mecanim combat animation state machine with responsive combo input buffering",
        "Created custom procedural foliage scatter tools in Blender Geometry Nodes for environmental set dressing"
      ],
      // Compatibility field
      desc: "Modeled stylized 3D characters in Blender, authored Mecanim combat state machines in Unity, and built procedural Geometry Nodes tools."
    },
    {
      id: "confidant-ryuji",
      rank: "RANK 6",
      arcana: "VII. The Chariot",
      character: "Ryuji Sakamoto",
      company: "Shujin Interactive Works",
      role: "Unity Gameplay & Physics Developer",
      period: "2020 — 2022",
      description: "Built responsive 3D character movement, kinematic collision resolution, and satisfying combat hit-stop effects in Unity. Handled 3D prop modeling, UV unwrapping, and texture baking in Blender.",
      deliverables: [
        "Created custom raycast-based character controller handling slopes, jumping, and ledge hanging",
        "Implemented screen shake, hit-spark particle systems (VFX Graph), and dynamic time scale pause",
        "Modeled 40+ modular environment props in Blender and baked high-to-low poly normal maps"
      ],
      // Compatibility field
      desc: "Built responsive 3D character movement, kinematic raycast controllers, VFX Graph combat impacts, and Blender modular 3D props."
    },
    {
      id: "confidant-futaba",
      rank: "RANK 4",
      arcana: "IX. The Hermit",
      character: "Futaba Sakura",
      company: "Leblanc Cybernetics & Indie R&D",
      role: "Unity Tools & Blender Technical Artist Intern",
      period: "2019 — 2020",
      description: "Developed custom Unity Editor tools, automated model import inspectors, and procedural level generators. Modeled low-poly stylized props and configured texture atlases in Blender.",
      deliverables: [
        "Built custom Unity Editor window for bulk asset tagging, texture compression, and prefab generation",
        "Modeled low-poly isometric dioramas in Blender for mobile prototype iterations",
        "Created automated Python scripts in Blender to export batch FBX meshes with unified coordinate origins"
      ],
      // Compatibility field
      desc: "Developed custom Unity Editor tooling windows, low-poly 3D Blender modeling, and automated Python batch export pipelines."
    },
    {
      id: "confidant-sojiro",
      rank: "RANK 1",
      arcana: "V. The Hierophant",
      character: "Sojiro Sakura",
      company: "Tatsumi University of Technology",
      role: "B.S. in Computer Science & Interactive 3D Game Art",
      period: "2016 — 2020",
      description: "Graduated with First-Class Honors. Dual concentration in 3D Computer Graphics and Software Engineering. Lead Developer and 3D Artist for University Game Development Guild.",
      deliverables: [
        "Capstone: Full 3D Action-Adventure playable demo built from scratch in Unity with custom Blender assets",
        "Winner of National University Game Jam 2019 (Best 3D Art Direction & Gameplay Feel)",
        "Authored academic paper on 'Optimizing Skeletal Mesh Deformations in Real-Time Mobile Game Engines'"
      ],
      // Compatibility field
      desc: "First-Class Honors graduate in Computer Science & Interactive 3D Game Art. Specialized in Unity gameplay and Blender 3D modeling."
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
