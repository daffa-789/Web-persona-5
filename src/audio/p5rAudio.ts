/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - WEB AUDIO API SOUND & BGM ENGINE
 * File: src/audio/p5rAudio.ts
 *
 * High-octane zero-latency procedural sound effects & looping BGM controller.
 * Features:
 *  - 4 authentic procedural P5R UI sound effects:
 *      1. Gun Cock (playGunCock): 2-stage mechanical double-click on hover
 *      2. Knife Slash (playKnifeSlash): High-to-low resonant filter sweep + noise slice
 *      3. All-Out Attack (playAllOutAttack): Heavy 808 sub-bass drop + distortion punch
 *      4. Confirm Chime (playConfirm): Snappy dual-tone chime
 *  - Looping "Last Surprise" BGM controller with HTML5 MediaElement audio source
 *  - Multi-tier fallback protection:
 *      Tier 1: /audio/last_surprise.mp3
 *      Tier 2: /audio/disturbing_the_peace.mp3 / mass_destruction.mp3 / color_your_night.mp3
 *      Tier 3: Procedural 4-chord acid-jazz funk synthesizer (Em9 -> A13 -> Cmaj7 -> B7alt)
 *  - Master / SFX / BGM gain bus topology with DynamicsCompressorNode
 *  - Clickless gain ramping (50ms smooth linear/exponential transition)
 *  - Browser autoplay gesture unlocking & headless/SSR safe fallback
 *  - Pre-allocated white noise buffer and WaveShaper distortion curve (zero GC churn)
 *  - Full backward compatibility aliases for P3R callers
 * ==========================================================================
 */

/** Two non-overlapping SFX buses, per workspace guideline 5. */
export type SfxChannel = 'hover' | 'action';

/** Every motion event the Motion Director can score. All resolve to local .mp3. */
export type MotionAudioCue =
  | 'menu_open'
  | 'menu_navigate'
  | 'aoa_start'
  | 'aoa_finish'
  | 'menu_back';

export interface P5RAudioEngine {
  /** Initialize the AudioContext, routing buses, and compressor */
  init(): void;

  /** Ensure AudioContext is instantiated and resumed from suspended state */
  ensureContext(): Promise<void>;

  /** Score a motion event on the correct channel (hover cues self-throttle). */
  playMotionAudio(cue: MotionAudioCue): void;

  /** 1. Gun Cock SFX: 2-stage mechanical double-click on hover */
  playGunCock(): void;

  /** 2. Knife Slash SFX: High-to-low resonant filter sweep + noise slice on tab switch */
  playKnifeSlash(): void;

  /** 3. All-Out Attack Bass Drop: Heavy 808 sub-bass sine drop + distortion punch */
  playAllOutAttack(): void;

  /** 4. Confirm Chime: Snappy dual-tone chime on action confirm */
  playConfirm(): void;
  
  playMenuSelect(): void;
  playMenuNavigate(): void;
  playMenuBack(): void;
  playMenuOpen(): void;
  playAoaStart(): void;
  playAoaFinish(): void;

  /** Toggle BGM playback state */
  toggleBgm(): boolean;

  /** Start looping BGM ("Last Surprise" with automatic fallback) */
  startBgm(): Promise<void>;

  /** Stop looping BGM */
  stopBgm(): void;

  /** Toggle master audio mute state */
  toggleMute(): boolean;

  /** Check if master audio is currently muted */
  isMuted(): boolean;

  /** Check if BGM is currently active/playing */
  isBgmActive(): boolean;

  /** Set master volume level (0.0 to 1.0) */
  setVolume(volume: number): void;

  /** Get master volume level (0.0 to 1.0) */
  getVolume(): number;

  /** Set BGM sub-bus volume level (0.0 to 1.0) */
  setBgmVolume(volume: number): void;

  /** Get BGM sub-bus volume level */
  getBgmVolume(): number;

  /** Set SFX sub-bus volume level (0.0 to 1.0) */
  setSfxVolume(volume: number): void;

  /** Get SFX sub-bus volume level */
  getSfxVolume(): number;

  /** Get underlying Web AudioContext (or null if not initialized/supported) */
  getContext(): AudioContext | null;

  // Backward-compatibility aliases for legacy callers during migration:
  playHover?(): void;
  playClick?(): void;
  playTheurgy?(): void;
  playFusion?(): void;
  playVelvetRoom?(): void;
  playDarkHourBell?(): void;
}

const BGM_PLAYLIST = [
  '/audio/last_surprise.mp3',
  '/audio/disturbing_the_peace.mp3',
  '/audio/mass_destruction.mp3',
  '/audio/color_your_night.mp3'
];

export class P5RAudioEngineImpl implements P5RAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  // Pre-allocated noise buffer & distortion curve (Zero GC churn)
  private noiseBuffer: AudioBuffer | null = null;
  private distortionCurveCache: Float32Array<ArrayBuffer> | null = null;

  // BGM HTML5 Audio Source
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmSource: MediaElementAudioSourceNode | null = null;
  private currentTrackIndex: number = 0;

  // BGM Procedural Synthesizer Fallback State (Acid-Jazz Funk)
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;
  private isSynthBgmActive: boolean = false;

  // State flags
  private isMutedState: boolean = false;
  private isBgmPlayingState: boolean = false;
  private autoplayUnlocked: boolean = false;

  // Volume Defaults (P5R High-Fidelity Punch)
  private masterVolume: number = 1.0;
  private sfxVolume: number = 1.0;
  private bgmVolume: number = 0.50;

  constructor() {
    this.setupAutoplayUnlock();
  }

  /**
   * Initializes the Web Audio API AudioContext and gain routing bus topology:
   * [Procedural SFX] -> sfxGain (1.00) --+
   *                                      +-> masterGain (1.00) -> compressor -> destination
   * [BGM Audio / Synth] -> bgmGain (0.50)-+
   */
  public init(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    if (typeof window === 'undefined') return;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) {
      console.warn('[P5RAudio] Web Audio API is not supported in this browser environment.');
      return;
    }

    try {
      this.ctx = new AudioContextClass();

      // 1. Dynamics Compressor (Prevents clipping during rapid simultaneous SFX + BGM)
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-3.0, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(30.0, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(12.0, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);
      this.compressor.connect(this.ctx.destination);

      // 2. Master Gain Node -> Dynamics Compressor
      this.masterGain = this.ctx.createGain();
      const initialGain = this.isMutedState ? 0.0001 : this.masterVolume;
      this.masterGain.gain.setValueAtTime(initialGain, this.ctx.currentTime);
      this.masterGain.connect(this.compressor);

      // 3. SFX Sub-bus Gain Node (1.00) -> Master Gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // 4. BGM Sub-bus Gain Node (0.50) -> Master Gain
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      // 5. Pre-allocate 1s white noise buffer for zero-latency filter sweeps
      this.initNoiseBuffer();

      // 6. Initialize HTML5 Audio element for looping BGM
      this.initBgmAudio();
    } catch (e) {
      console.warn('[P5RAudio] Failed to initialize AudioContext graph:', e);
    }
  }

  /**
   * Pre-allocates a 1-second white noise buffer to avoid memory allocation and GC churn on SFX trigger.
   */
  private initNoiseBuffer(): void {
    if (!this.ctx) return;
    try {
      const length = Math.floor(this.ctx.sampleRate);
      this.noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const output = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } catch (err) {
      console.warn('[P5RAudio] Failed to pre-allocate noise buffer:', err);
    }
  }

  /**
   * Generates a cached soft-clipping sigmoid wave-shaping curve for overdrive distortion.
   */
  private getDistortionCurve(amount: number = 40): Float32Array<ArrayBuffer> {
    if (this.distortionCurveCache) return this.distortionCurveCache;
    const nSamples = 44100;
    const buffer = new ArrayBuffer(nSamples * 4);
    const curve = new Float32Array(buffer);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    this.distortionCurveCache = curve;
    return curve;
  }

  /**
   * Helper to play a short filtered noise transient from the cached noise buffer.
   */
  private playNoiseTransient(
    startTime: number,
    duration: number,
    filterFreq: number,
    q: number,
    gainLevel: number
  ): void {
    if (!this.ctx || !this.sfxGain || !this.noiseBuffer) return;

    try {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(filterFreq, startTime);
      filter.Q.setValueAtTime(q, startTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gainLevel, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noiseSource.start(startTime);
      noiseSource.stop(startTime + duration);
    } catch {
      // Ignore transient errors
    }
  }

  /**
   * Ensures the AudioContext is initialized and resumed from suspended state.
   */
  public async ensureContext(): Promise<void> {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (err) {
        // Will resume on interaction
      }
    }
  }

  /**
   * Sets up global interaction listeners to unlock AudioContext autoplay policies cleanly.
   */
  private setupAutoplayUnlock(): void {
    if (typeof window === 'undefined') return;

    const unlock = async () => {
      await this.ensureContext();
      if (this.autoplayUnlocked) return;
      this.autoplayUnlocked = true;

      // If user toggled BGM prior to user gesture, resume it now
      if (this.isBgmPlayingState && this.bgmAudio && this.bgmAudio.paused) {
        this.bgmAudio.play().catch(() => {
          this.startBgmSynth();
        });
      }

      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('pointermove', unlock);
    };

    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('pointermove', unlock, { once: true, passive: true });
  }

  /**
   * Initializes the HTML5 audio element with multi-tier track fallback.
   */
  private initBgmAudio(): void {
    if (this.bgmAudio || typeof Audio === 'undefined') return;

    try {
      const trackUrl = BGM_PLAYLIST[this.currentTrackIndex] || BGM_PLAYLIST[0];
      this.bgmAudio = new Audio(trackUrl);
      this.bgmAudio.loop = true;
      this.bgmAudio.crossOrigin = 'anonymous';
      this.bgmAudio.preload = 'auto';

      if (this.ctx && this.bgmGain && !this.bgmSource) {
        this.bgmSource = this.ctx.createMediaElementSource(this.bgmAudio);
        this.bgmSource.connect(this.bgmGain);
      }

      this.bgmAudio.addEventListener('error', (e) => {
        console.warn(
          `[P5RAudio] BGM track "${trackUrl}" failed to load:`,
          e
        );
        this.handleBgmTrackError();
      });
    } catch (err) {
      console.warn('[P5RAudio] Could not initialize BGM MediaElementSource:', err);
    }
  }

  /**
   * Advances through fallback BGM tracks or switches to procedural acid-jazz synth.
   */
  private handleBgmTrackError(): void {
    this.currentTrackIndex++;
    if (this.currentTrackIndex < BGM_PLAYLIST.length) {
      const nextTrack = BGM_PLAYLIST[this.currentTrackIndex];
      console.info(`[P5RAudio] Attempting fallback track (${this.currentTrackIndex + 1}/${BGM_PLAYLIST.length}): ${nextTrack}`);
      if (this.bgmAudio) {
        this.bgmAudio.src = nextTrack;
        this.bgmAudio.load();
        if (this.isBgmPlayingState) {
          this.bgmAudio.play().catch(() => {
            this.handleBgmTrackError();
          });
        }
      }
    } else {
      console.warn('[P5RAudio] All audio file tracks failed or unavailable. Activating procedural P5 acid-jazz synth.');
      if (this.isBgmPlayingState) {
        this.startBgmSynth();
      }
    }
  }

  // =========================================================================
  // ZERO-LATENCY PROCEDURAL SOUND SYNTHESIS
  // =========================================================================

  /**
   * 1. Gun Cock SFX: 2-stage mechanical double-click on hover.
   * Stage 1 (t = 0): Cylinder index / hammer pull (high metallic tick + subtle thump).
   * Stage 2 (t = +45ms): Heavy mechanical lock-in (square transient + sub knock + resonant ring).
   */
  public playGunCock(): void {
    this.playHoverChannel('/audio/sfx/gun_cock.mp3', () => this.playGunCockSynth());
  }

  public playGunCockSynth(): void {
    if (this.isMutedState) return;
    this.ensureContext().catch(() => {});
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // Stage 1: Cylinder index / Hammer pull
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(2400, now);
    osc1.frequency.exponentialRampToValueAtTime(600, now + 0.02);

    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.025);

    const subOsc1 = this.ctx.createOscillator();
    const subGain1 = this.ctx.createGain();
    subOsc1.type = 'triangle';
    subOsc1.frequency.setValueAtTime(360, now);
    subOsc1.frequency.exponentialRampToValueAtTime(90, now + 0.02);

    subGain1.gain.setValueAtTime(0.20, now);
    subGain1.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    subOsc1.connect(subGain1);
    subGain1.connect(this.sfxGain);
    subOsc1.start(now);
    subOsc1.stop(now + 0.025);

    // Stage 2: Heavy Hammer Latch Snap (t = now + 45ms)
    const t2 = now + 0.045;

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1800, t2);
    osc2.frequency.exponentialRampToValueAtTime(180, t2 + 0.035);

    gain2.gain.setValueAtTime(0.28, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.04);

    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(t2);
    osc2.stop(t2 + 0.04);

    const subOsc2 = this.ctx.createOscillator();
    const subGain2 = this.ctx.createGain();
    subOsc2.type = 'triangle';
    subOsc2.frequency.setValueAtTime(440, t2);
    subOsc2.frequency.exponentialRampToValueAtTime(50, t2 + 0.045);

    subGain2.gain.setValueAtTime(0.35, t2);
    subGain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.05);

    subOsc2.connect(subGain2);
    subGain2.connect(this.sfxGain);
    subOsc2.start(t2);
    subOsc2.stop(t2 + 0.05);

    this.playNoiseTransient(t2, 0.035, 3200, 6.0, 0.18);
  }

  /**
   * 2. Knife Slash SFX: Routed to menu navigate per user preference.
   */
  public playKnifeSlash(): void {
    this.playMenuNavigate();
  }

  public playKnifeSlashSynth(): void {
    if (this.isMutedState) return;
    this.ensureContext().catch(() => {});
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // Layer 1: Resonant Downward Noise Slice
    if (this.noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(7500, now);
      filter.frequency.exponentialRampToValueAtTime(650, now + 0.14);
      filter.Q.setValueAtTime(8.0, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.40, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      noiseSource.start(now);
      noiseSource.stop(now + 0.15);
    }

    // Layer 2: Metallic Blade Sing (Dual swept sine harmonics)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(3600, now);
    osc1.frequency.exponentialRampToValueAtTime(1100, now + 0.12);

    gain1.gain.setValueAtTime(0.20, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.13);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(5200, now);
    osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.10);

    gain2.gain.setValueAtTime(0.14, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(now);
    osc2.stop(now + 0.11);

    // Layer 3: Air Displacement Whoosh
    const whooshOsc = this.ctx.createOscillator();
    const whooshFilter = this.ctx.createBiquadFilter();
    const whooshGain = this.ctx.createGain();

    whooshOsc.type = 'sawtooth';
    whooshOsc.frequency.setValueAtTime(950, now);
    whooshOsc.frequency.exponentialRampToValueAtTime(140, now + 0.15);

    whooshFilter.type = 'lowpass';
    whooshFilter.frequency.setValueAtTime(1600, now);

    whooshGain.gain.setValueAtTime(0.25, now);
    whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    whooshOsc.connect(whooshFilter);
    whooshFilter.connect(whooshGain);
    whooshGain.connect(this.sfxGain);

    whooshOsc.start(now);
    whooshOsc.stop(now + 0.15);
  }

  /**
   * 3. All-Out Attack Bass Drop: Heavy 808 sub-bass sine drop + distortion punch.
   * Features: 160Hz -> 30Hz sub drop, WaveShaper overdrive saturation punch, glass cut-in sparkle.
   */
  public playAllOutAttack(): void {
    this.playActionChannel('/audio/sfx/aoa_start.mp3', () => this.playAllOutAttackSynth());
  }

  public playAllOutAttackSynth(): void {
    if (this.isMutedState) return;
    this.ensureContext().catch(() => {});
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // Layer 1: Massive 808 Sub-Bass Plunge (160Hz -> 30Hz over 800ms)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, now);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.80);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.85, now + 0.01);
    subGain.gain.setValueAtTime(0.85, now + 0.25);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.85);

    // Layer 2: Harmonic Distortion Overdrive Punch
    const distOsc = this.ctx.createOscillator();
    const distFilter = this.ctx.createBiquadFilter();
    const distGain = this.ctx.createGain();
    const shaper = this.ctx.createWaveShaper();

    shaper.curve = this.getDistortionCurve(40);
    shaper.oversample = '2x';

    distOsc.type = 'triangle';
    distOsc.frequency.setValueAtTime(320, now);
    distOsc.frequency.exponentialRampToValueAtTime(55, now + 0.22);

    distFilter.type = 'lowpass';
    distFilter.frequency.setValueAtTime(1200, now);

    distGain.gain.setValueAtTime(0.45, now);
    distGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    distOsc.connect(distFilter);
    distFilter.connect(shaper);
    shaper.connect(distGain);
    distGain.connect(this.sfxGain);

    distOsc.start(now);
    distOsc.stop(now + 0.25);

    // Layer 3: Glass Shatter / Cut-in Sparkle
    if (this.noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;

      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(4200, now);
      highpass.Q.setValueAtTime(3.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.30);

      noiseSource.connect(highpass);
      highpass.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      noiseSource.start(now);
      noiseSource.stop(now + 0.30);
    }

    // Layer 4: Impact Thump Transient
    const thumpOsc = this.ctx.createOscillator();
    const thumpGain = this.ctx.createGain();
    thumpOsc.type = 'square';
    thumpOsc.frequency.setValueAtTime(220, now);
    thumpOsc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

    thumpGain.gain.setValueAtTime(0.30, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    thumpOsc.connect(thumpGain);
    thumpGain.connect(this.sfxGain);
    thumpOsc.start(now);
    thumpOsc.stop(now + 0.09);
  }

  /**
   * 4. Confirm Chime: Snappy dual-tone chime on action confirm.
   * Pulse 1 (t = 0): G5 (784Hz) + G6 (1568Hz) triangle chime.
   * Pulse 2 (t = +45ms): D6 (1175Hz) + D7 (2349Hz) bright resolution.
   */
  public playConfirm(): void {
    this.playActionChannel('/audio/sfx/menu_select.mp3', () => this.playConfirmSynth());
  }

  public playConfirmSynth(): void {
    if (this.isMutedState) return;
    this.ensureContext().catch(() => {});
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // Pulse 1
    const osc1a = this.ctx.createOscillator();
    const osc1b = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();

    osc1a.type = 'triangle';
    osc1a.frequency.setValueAtTime(783.99, now);
    osc1b.type = 'sine';
    osc1b.frequency.setValueAtTime(1567.98, now);

    gain1.gain.setValueAtTime(0.24, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc1a.connect(gain1);
    osc1b.connect(gain1);
    gain1.connect(this.sfxGain);

    osc1a.start(now);
    osc1b.start(now);
    osc1a.stop(now + 0.14);
    osc1b.stop(now + 0.14);

    // Pulse 2 (offset 45ms)
    const t2 = now + 0.045;
    const osc2a = this.ctx.createOscillator();
    const osc2b = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();

    osc2a.type = 'triangle';
    osc2a.frequency.setValueAtTime(1174.66, t2);
    osc2b.type = 'sine';
    osc2b.frequency.setValueAtTime(2349.32, t2);

    gain2.gain.setValueAtTime(0.28, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.18);

    osc2a.connect(gain2);
    osc2b.connect(gain2);
    gain2.connect(this.sfxGain);

    osc2a.start(t2);
    osc2b.start(t2);
    osc2a.stop(t2 + 0.18);
    osc2b.stop(t2 + 0.18);
  }

  // ── High-Fidelity Non-Colliding Audio Channels ──
  private lastNavTime = 0;
  private readonly navThrottleMs = 110; // Guideline R6.3: 100–120ms hover cooldown
  private clips: Record<SfxChannel, HTMLAudioElement | null> = { hover: null, action: null };

  /** Stop whatever this channel is still holding so the next hit lands clean. */
  private cutChannel(channel: SfxChannel): void {
    const clip = this.clips[channel];
    if (!clip) return;
    this.clips[channel] = null;
    try {
      clip.pause();
      clip.currentTime = 0;
    } catch {
      /* already detached */
    }
  }

  private clipVolume(channel: SfxChannel): number {
    const scale = channel === 'hover' ? 0.9 : 1;
    return Math.max(0, Math.min(1, this.masterVolume * this.sfxVolume * scale));
  }

  /**
   * Universal SFX player. One live clip per channel: a new trigger cuts the
   * clip before it, so rapid ribbon sweeps and overlapping slashes never muddy.
   * Falls back to the procedural synth when autoplay or the file itself fails.
   */
  private playSound(url: string, fallback: () => void, channel: SfxChannel = 'action'): void {
    if (this.isMutedState) return;
    this.ensureContext().catch(() => {});
    this.cutChannel(channel);

    try {
      const audio = new Audio(url);
      audio.volume = this.clipVolume(channel);
      this.clips[channel] = audio;
      audio.addEventListener('ended', () => {
        if (this.clips[channel] === audio) this.clips[channel] = null;
      });
      const started = audio.play();
      if (started !== undefined) {
        started.catch(() => {
          if (this.clips[channel] === audio) {
            this.clips[channel] = null;
            fallback();
          }
        });
      }
    } catch {
      this.clips[channel] = null;
      fallback();
    }
  }

  /**
   * Hover channel: throttled to 110ms and self-cutting for tactile feedback
   * during fast mouse sweeps.
   */
  private playHoverChannel(url: string, fallback: () => void): void {
    if (this.isMutedState) return;
    const now = Date.now();
    if (now - this.lastNavTime < this.navThrottleMs) return;
    this.lastNavTime = now;
    this.playSound(url, fallback, 'hover');
  }

  /**
   * Action channel: full-volume trigger that also clears a hover sound still
   * in its tail, so confirms, cancels and slashes never double up.
   */
  private playActionChannel(url: string, fallback: () => void): void {
    if (this.isMutedState) return;
    this.cutChannel('hover');
    this.playSound(url, fallback, 'action');
  }

  /** Motion Director hook: one named cue per choreography event. */
  public playMotionAudio(cue: MotionAudioCue): void {
    switch (cue) {
      case 'menu_open':
        this.playMenuOpen();
        break;
      case 'menu_navigate':
        this.playMenuNavigate();
        break;
      case 'aoa_start':
        this.playAoaStart();
        break;
      case 'aoa_finish':
        this.playAoaFinish();
        break;
      case 'menu_back':
        this.playMenuBack();
        break;
    }
  }

  public playMenuSelect(): void {
    this.playActionChannel('/audio/sfx/menu_select.mp3', () => this.playConfirmSynth());
  }

  public playMenuNavigate(): void {
    this.playHoverChannel('/audio/sfx/menu_navigate.mp3', () => this.playGunCockSynth());
  }

  public playMenuBack(): void {
    this.playActionChannel('/audio/sfx/menu_back.mp3', () => this.playConfirmSynth());
  }

  public playMenuOpen(): void {
    this.playActionChannel('/audio/sfx/menu_open.mp3', () => this.playConfirmSynth());
  }

  public playAoaStart(): void {
    this.playActionChannel('/audio/sfx/aoa_start.mp3', () => this.playAllOutAttackSynth());
  }

  public playAoaFinish(): void {
    this.playActionChannel('/audio/sfx/aoa_finish.mp3', () => this.playConfirmSynth());
  }

  // =========================================================================
  // BACKWARD-COMPATIBILITY ALIASES (FOR P3R TO P5R SMOOTH MIGRATION)
  // =========================================================================

  public playHover(): void {
    this.playGunCock();
  }

  public playClick(): void {
    this.playMenuNavigate();
  }

  public playTheurgy(): void {
    this.playAllOutAttack();
  }

  public playFusion(): void {
    this.playConfirm();
  }

  public playVelvetRoom(): void {
    this.playConfirm();
  }

  public playDarkHourBell(): void {
    if (this.isMutedState) return;
    this.ensureContext().catch(() => {});
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const bellFrequencies = [110, 220, 330, 440, 680, 890];

    bellFrequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const amp = 0.25 / (idx + 1);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.20);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 2.20);
    });
  }

  // =========================================================================
  // BGM CONTROLLER & PROCEDURAL ACID-JAZZ SYNTHESIZER FALLBACK
  // =========================================================================

  /**
   * Toggles BGM between playing and stopped states.
   */
  public toggleBgm(): boolean {
    if (this.isBgmPlayingState) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm().catch(() => {});
      return true;
    }
  }

  /**
   * Starts BGM playback (attempts audio file first, falls back to procedural synth).
   */
  public async startBgm(): Promise<void> {
    await this.ensureContext();
    this.isBgmPlayingState = true;

    if (!this.bgmAudio) {
      this.initBgmAudio();
    }

    if (this.bgmAudio) {
      try {
        await this.bgmAudio.play();
        return;
      } catch (err) {
        console.warn(
          '[P5RAudio] HTML5 BGM play prevented or failed, activating procedural acid-jazz fallback:',
          err
        );
      }
    }

    // Fallback to procedural acid-jazz funk synth
    this.startBgmSynth();
  }

  /**
   * Stops BGM playback and cancels any active synth timers.
   */
  public stopBgm(): void {
    this.isBgmPlayingState = false;
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
    this.stopBgmSynth();
  }

  /**
   * Procedural 4-chord Persona 5 acid-jazz funk synthesizer fallback:
   * Em9 -> A13 -> Cmaj7 -> B7alt
   */
  private startBgmSynth(): void {
    this.stopBgmSynth();
    this.isSynthBgmActive = true;
    this.bgmStep = 0;

    const chords = [
      [164.81, 246.94, 293.66, 370.00, 392.00], // Em9 (E3, B3, D4, F#4, G4)
      [146.83, 220.00, 277.18, 329.63, 440.00], // A13 (D3/A2, A3, C#4, E4, A4)
      [130.81, 261.63, 329.63, 370.00, 392.00], // Cmaj7#11 (C3, C4, E4, F#4, G4)
      [123.47, 246.94, 311.13, 370.00, 440.00]  // B7alt (B2, B3, D#4, F#4, A4)
    ];

    const playChordStep = () => {
      if (!this.isSynthBgmActive || !this.isBgmPlayingState) return;
      if (!this.ctx || !this.bgmGain) return;

      const currentChord = chords[this.bgmStep % chords.length];
      const now = this.ctx.currentTime;

      // Electric Piano / Organ Comping
      currentChord.forEach((freq, idx) => {
        if (!this.ctx || !this.bgmGain) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100 + Math.sin(this.bgmStep) * 350, now);
        filter.Q.setValueAtTime(2.2, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08 / (idx + 1), now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.50);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 1.55);
      });

      // Funky walking bass note
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(currentChord[0] / 2, now);

      bassGain.gain.setValueAtTime(0.20, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.80);

      bassOsc.connect(bassGain);
      bassGain.connect(this.bgmGain);
      bassOsc.start(now);
      bassOsc.stop(now + 0.80);

      this.bgmStep++;
      if (typeof window !== 'undefined') {
        this.bgmTimer = window.setTimeout(playChordStep, 1600);
      }
    };

    playChordStep();
  }

  private stopBgmSynth(): void {
    this.isSynthBgmActive = false;
    if (this.bgmTimer !== null) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  // =========================================================================
  // VOLUME & MUTE CONTROLS WITH SMOOTH CLICKLESS GAIN RAMPING (50ms)
  // =========================================================================

  /**
   * Toggles global mute state with 50ms smooth exponential gain ramping.
   * Strictly clamps targetGain and starting gain to >= 0.0001 to prevent
   * W3C Web Audio API RangeError on exponentialRampToValueAtTime(0).
   */
  public toggleMute(): boolean {
    this.isMutedState = !this.isMutedState;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      // AudioParam zero clamping fix: clamp target to Math.max(0.0001, volume)
      const targetGain = this.isMutedState ? 0.0001 : Math.max(0.0001, this.masterVolume);
      const currentGain = Math.max(0.0001, this.masterGain.gain.value);
      this.masterGain.gain.setValueAtTime(currentGain, now);
      this.masterGain.gain.exponentialRampToValueAtTime(targetGain, now + 0.05);
    }
    return this.isMutedState;
  }

  public isMuted(): boolean {
    return this.isMutedState;
  }

  public isBgmActive(): boolean {
    return this.isBgmPlayingState;
  }

  public setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.masterGain && !this.isMutedState) {
      const now = this.ctx.currentTime;
      const targetGain = Math.max(0.0001, this.masterVolume);
      const currentGain = Math.max(0.0001, this.masterGain.gain.value);
      this.masterGain.gain.setValueAtTime(currentGain, now);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.05);
    }
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public setBgmVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.bgmGain) {
      const now = this.ctx.currentTime;
      const targetBgmGain = Math.max(0.0001, this.bgmVolume);
      const currentGain = Math.max(0.0001, this.bgmGain.gain.value);
      this.bgmGain.gain.setValueAtTime(currentGain, now);
      this.bgmGain.gain.linearRampToValueAtTime(targetBgmGain, now + 0.05);
    }
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.sfxGain) {
      const now = this.ctx.currentTime;
      const targetSfxGain = Math.max(0.0001, this.sfxVolume);
      const currentGain = Math.max(0.0001, this.sfxGain.gain.value);
      this.sfxGain.gain.setValueAtTime(currentGain, now);
      this.sfxGain.gain.linearRampToValueAtTime(targetSfxGain, now + 0.05);
    }
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }
}

// Global Singleton Export
export const p5rAudio = new P5RAudioEngineImpl();

// Backward-compatibility export so existing UI modules compile seamlessly
export const p3rAudio = p5rAudio;

