/**
 * ==========================================================================
 * P5R MOTION DIRECTOR
 * File: src/transitions/transitions.ts
 *
 * Four choreographed variants, each returned as a cancellable cue:
 *
 *   SLASH-CUT         tab -> tab     60ms blackout -> blades cover -> pane
 *                                    swap once the cover has actually landed
 *                                    -> blade release + light beam + viewport
 *                                    micro-recoil. Nominal 490ms.
 *   SHUTTER-BLACKOUT  modal open     60ms black frame -> host mounted while
 *                                    covered -> polygon release -> children
 *                                    land at 40ms increments.
 *   RANSOM-ASSEMBLE   section header per-character snap-in on a seeded
 *                                    rotation, so a tab reassembles identically.
 *   KINETIC-EXIT      modal close    reverse wipe + menu_back + confetti halt.
 *
 * Guarantees
 *  - One transaction at a time; a new cue preempts the previous one.
 *  - Every timer is registered. cancel() clears timers, cancels WAAPI
 *    animations and unmounts overlay nodes; no code path touches a node after
 *    its cleanup callback has run.
 *  - Every CSS delay used by a variant is <= its JS cleanup window.
 *  - prefers-reduced-motion resolves to a hard cut: no overlays, no stagger,
 *    nothing travelling across the viewport.
 * ==========================================================================
 */

import { p5rAudio, type MotionAudioCue } from '../audio/p5rAudio';
import { p5HaltConfetti } from '../utils/p5Confetti';

// ─────────────────────────────────────────────────────────────────────────────
// Pacing table (ms). A CSS animation-length + delay pair used by a layer must
// be <= the JS wait that removes that layer, and the pane swap may only happen
// once the last blade has actually finished covering the viewport.
//
//   0        shutter starts
//   60       blades mount (cover: 120ms, delays 0/15/30 -> covered at 210)
//   210      midpoint swap: pane flips, beam shears, recoil fires
//   490      last release blade finishes  (nominal end of the choreography)
//   630      worst case: every await falls back to its timer instead of
//            animationend. slashCut/kineticExit declare this ceiling so the
//            director's guard can never preempt a legitimate wipe.
// ─────────────────────────────────────────────────────────────────────────────
export const MOTION = {
  blackout: 60,
  bladeCover: 120,
  /** Longest cover delay + cover length: when the screen is truly opaque. */
  coverSettle: 150,
  /** Nominal midpoint; the real swap waits for animationend. */
  swapAt: 215,
  bladeRelease: 200,
  bladeStagger: 80,
  /** A CSS animation only starts on the next frame, so the JS window that
   *  unmounts it carries slack: the layer must always outlive its animation. */
  settleSlack: 70,
  stagger: 40,
  charStagger: 40,
  charSnap: 150,
  slashCut: 640,
  shutter: 400,
  ransom: 520,
  kineticExit: 640,
  guardSlack: 60
} as const;

export type MotionVariant = 'slash-cut' | 'shutter-blackout' | 'ransom-assemble' | 'kinetic-exit';
export type MotionOutcome = 'completed' | 'cancelled' | 'skipped';

/** Backwards-compatible alias for legacy consumers. */
export type P5RTransitionType = MotionVariant | 'comic-slash' | 'instant' | 'chromatic-flash';
export type TransitionType = P5RTransitionType;

export interface MotionCue {
  readonly variant: MotionVariant;
  /** Worst-case wall-clock length of the choreography, in ms. */
  readonly duration: number;
  play(): Promise<MotionOutcome>;
  cancel(): void;
}

export interface P5RTransitionOptions {
  durationMs?: number;
  originX?: number;
  originY?: number;
  onComplete?: () => void;
  playAudio?: boolean;
}

/** Backwards-compatible alias. */
export interface TransitionOptions extends P5RTransitionOptions {}

export interface SlashCutSpec {
  next: HTMLElement;
  current?: HTMLElement | null;
  /** Stable string seeding the ransom-note rotations for this pane. */
  seed?: string;
  playAudio?: boolean;
}

export interface ShutterBlackoutSpec {
  /** Overlay host that becomes visible under the black frame. */
  host: HTMLElement;
  /** Runs while the viewport is fully covered: flip visibility classes here. */
  onCovered?: () => void;
  /** Children to land at 40ms increments. Derived from the host card otherwise. */
  staggerSelector?: string;
  audio?: MotionAudioCue;
}

export interface RansomAssembleSpec {
  header: HTMLElement;
  seed: string;
  /** Delay before the first character lands, in ms. */
  leadMs?: number;
  playAudio?: boolean;
}

export interface KineticExitSpec {
  host: HTMLElement;
  /** Runs while the viewport is covered: hide the host here. */
  onCovered?: () => void;
  audio?: MotionAudioCue;
  suppressConfetti?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reduced motion
// ─────────────────────────────────────────────────────────────────────────────

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internals: cancellable timeline + node/animation bookkeeping
// ─────────────────────────────────────────────────────────────────────────────

interface RegisteredWait {
  id: number;
  settle: (alive: boolean) => void;
}

class Sequence {
  private waits = new Set<RegisteredWait>();
  private stopHandlers = new Set<() => void>();
  private stopped = false;

  get live(): boolean {
    return !this.stopped;
  }

  /** Resolves true when the timeline survived the wait, false once cancelled. */
  wait(ms: number): Promise<boolean> {
    if (this.stopped) return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
      const entry: RegisteredWait = { id: 0, settle: resolve };
      entry.id = window.setTimeout(() => {
        this.waits.delete(entry);
        resolve(!this.stopped);
      }, ms);
      this.waits.add(entry);
    });
  }

  /** Run a callback the moment this timeline is cancelled. */
  onStop(handler: () => void): () => void {
    if (this.stopped) {
      handler();
      return () => undefined;
    }
    this.stopHandlers.add(handler);
    return () => this.stopHandlers.delete(handler);
  }

  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    this.waits.forEach((entry) => {
      window.clearTimeout(entry.id);
      entry.settle(false);
    });
    this.waits.clear();
    this.stopHandlers.forEach((handler) => handler());
    this.stopHandlers.clear();
  }
}

class Track {
  private nodes = new Set<HTMLElement>();
  private anims = new Set<Animation>();

  mount<T extends HTMLElement>(el: T): T {
    this.nodes.add(el);
    document.body.appendChild(el);
    return el;
  }

  /**
   * fill:'none' keeps the element's own (committed) style as the resting state,
   * so no keyframe ever resets a persistent skew or rotation.
   */
  animate(el: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions): Animation | null {
    if (typeof el.animate !== 'function') return null;
    const anim = el.animate(frames, { fill: 'none', ...options });
    this.anims.add(anim);
    // cancel() rejects `finished` with AbortError; never await it bare.
    anim.finished.catch(() => undefined);
    return anim;
  }

  /** Normal end: drop overlay nodes, let in-flight animations settle. */
  sweep(): void {
    this.nodes.forEach((node) => node.remove());
    this.nodes.clear();
    this.anims.clear();
  }

  /** Preemption: also abort every animation this cue owns. */
  clear(): void {
    this.anims.forEach((anim) => {
      try {
        anim.cancel();
      } catch {
        /* already detached */
      }
    });
    this.anims.clear();
    this.sweep();
  }
}

const BLADE_COUNT = 3;

function createBlades(track: Track): HTMLElement[] {
  const blades: HTMLElement[] = [];
  for (let i = 1; i <= BLADE_COUNT; i += 1) {
    const blade = document.createElement('div');
    blade.className = `p5-blade p5-blade-${i}`;
    blade.setAttribute('aria-hidden', 'true');
    blades.push(track.mount(blade));
  }
  return blades;
}

function armBlades(track: Track, phase: 'cover' | 'release'): HTMLElement[] {
  const blades = createBlades(track);
  blades.forEach((blade) => blade.classList.add(phase === 'cover' ? 'p5-blade-cover' : 'p5-blade-release'));
  return blades;
}

/**
 * The 60ms high-contrast shutter. Reuses the shell's #section-blackout when it
 * exists (invariant R6.2) and falls back to a tracked sheet in modal contexts.
 */
function openBlackout(track: Track, holdMs: number): void {
  const shell = document.getElementById('section-blackout');
  const sheet = shell ?? track.mount(document.createElement('div'));
  if (!shell) sheet.className = 'p5-blackout-sheet';
  sheet.classList.remove('p5-blackout-run');
  void sheet.offsetWidth;
  sheet.classList.add('p5-blackout-run');
  window.setTimeout(() => sheet.classList.remove('p5-blackout-run'), holdMs);
}

function recoil(): void {
  const main = document.querySelector<HTMLElement>('.main-content');
  if (!main) return;
  main.classList.remove('p5-recoil-punch');
  void main.offsetWidth;
  main.classList.add('p5-recoil-punch');
}

/** Deterministic LCG in [-4, 4] deg so a header always snaps together the same way. */
function seededRotations(seed: string, count: number): number[] {
  let state = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    state = Math.imul(state ^ seed.charCodeAt(i), 16777619) >>> 0;
  }
  const next = (): number => {
    state = (Math.imul(state, 48271) + 1492) >>> 0;
    return state / 4294967295;
  };
  const out: number[] = [];
  for (let i = 0; i < count; i += 1) out.push(Math.round((next() * 8 - 4) * 10) / 10);
  return out;
}

function collectPanes(next: HTMLElement): HTMLElement[] {
  const all = Array.from(document.querySelectorAll<HTMLElement>('.tab-pane'));
  if (!all.includes(next)) all.push(next);
  return all;
}

/** Clears every legacy inline write so the stylesheet owns pane visibility. */
function commitPanes(panes: HTMLElement[], active: HTMLElement): void {
  panes.forEach((pane) => {
    pane.style.display = '';
    pane.style.visibility = '';
    pane.style.opacity = '';
    pane.style.transform = '';
    pane.style.filter = '';
    pane.style.clipPath = '';
    pane.style.pointerEvents = '';
    pane.classList.toggle('active', pane === active);
  });
  if (typeof window !== 'undefined') window.scrollTo(0, 0);
}

abstract class CueBase implements MotionCue {
  abstract readonly variant: MotionVariant;
  readonly duration: number;
  protected seq = new Sequence();
  protected track = new Track();
  protected settled = false;
  /** Runs only on preemption: undo cosmetic staging the stylesheet owns. */
  protected onAbort?: () => void;
  /**
   * Runs at the end of every outcome, including a cancelled one. Anything the
   * caller has already committed to — a pane swap, a hidden dialog — belongs
   * here, because dropping it on a preempted animation would leave the DOM
   * disagreeing with the navigation state.
   */
  protected onSettle?: () => void;

  constructor(durationMs: number) {
    this.duration = durationMs;
  }

  get done(): boolean {
    return this.settled;
  }

  cancel(): void {
    if (this.settled) return;
    this.settled = true;
    this.seq.stop();
    this.track.clear();
    this.onAbort?.();
    this.onSettle?.();
  }

  protected finish(outcome: MotionOutcome): MotionOutcome {
    if (!this.settled) {
      this.settled = true;
      this.seq.stop();
      this.track.sweep();
      this.onSettle?.();
    }
    return outcome;
  }

  /**
   * Wait for a layer's CSS animation to actually end instead of guessing its
   * length: a frame that arrives late would otherwise have the node yanked out
   * mid-sweep. The timer is only a safety net so the cue can never hang.
   * Resolves true when the animations finished, false on timeout or cancel.
   */
  protected restAfter(nodes: HTMLElement[], fallbackMs: number): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (!nodes.length) {
        resolve(this.seq.live);
        return;
      }

      let done = false;
      let remaining = nodes.length;
      let timer = 0;
      let unsub: (() => void) | null = null;

      const settle = (finished: boolean): void => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        unsub?.();
        nodes.forEach((node) => node.removeEventListener('animationend', onEnd));
        resolve(finished && this.seq.live);
      };

      const onEnd = (): void => {
        remaining -= 1;
        if (remaining <= 0) settle(true);
      };

      nodes.forEach((node) => node.addEventListener('animationend', onEnd));
      timer = window.setTimeout(() => settle(false), fallbackMs);
      unsub = this.seq.onStop(() => settle(false));
    });
  }

  abstract play(): Promise<MotionOutcome>;
}

/** A cancellable choreography. `duration` is its worst-case wall-clock length. */
export type Cue = CueBase;

// ─────────────────────────────────────────────────────────────────────────────
// 1. SLASH-CUT — tab -> tab
// ─────────────────────────────────────────────────────────────────────────────

class SlashCutCue extends CueBase {
  readonly variant = 'slash-cut' as const;
  private readonly director: MotionDirectorImpl;
  private swapped = false;

  constructor(
    private spec: SlashCutSpec,
    director: MotionDirectorImpl
  ) {
    super(MOTION.slashCut);
    this.director = director;
    // The next pane is staged early so a preemption can never strand the
    // viewport on a half-wiped tab — but that staging has to be withdrawn,
    // otherwise two panes end up .active at once.
    this.onAbort = () => {
      if (!this.swapped) this.spec.next.classList.remove('active');
    };
    // A preempted wipe still has to land on the requested tab: navigation has
    // already recorded it, so leaving the old pane up would strand the app.
    this.onSettle = () => {
      if (this.swapped) return;
      this.swapped = true;
      this.onAbort = undefined;
      commitPanes(collectPanes(this.spec.next), this.spec.next);
    };
  }

  async play(): Promise<MotionOutcome> {
    const { next } = this.spec;
    const panes = collectPanes(next);
    const audible = this.spec.playAudio !== false;

    // The next pane is staged immediately: a preemption can never strand the
    // viewport on a half-wiped tab.
    next.style.display = '';
    next.style.visibility = '';
    next.classList.add('active');

    if (prefersReducedMotion()) {
      this.swapped = true;
      commitPanes(panes, next);
      if (audible) p5rAudio.playMotionAudio('menu_navigate');
      this.assembleHeader(next, 0);
      return this.finish('skipped');
    }

    openBlackout(this.track, MOTION.blackout);
    if (audible) p5rAudio.playKnifeSlash();
    if (!(await this.seq.wait(MOTION.blackout))) return this.finish('cancelled');

    const blades = armBlades(this.track, 'cover');
    // Swap only once the cover has actually landed. Waiting on animationend
    // rather than a guessed 155ms keeps the pane flip invisible even when a
    // frame is late; the timer is the safety net.
    if (!(await this.restAfter(blades, MOTION.coverSettle + MOTION.settleSlack))) return this.finish('cancelled');

    // Midpoint: the viewport is fully covered, so the swap itself is invisible.
    this.swapped = true;
    commitPanes(panes, next);
    recoil();
    const beam = document.createElement('div');
    beam.className = 'p5-slash-beam';
    beam.setAttribute('aria-hidden', 'true');
    this.track.mount(beam);
    if (audible) p5rAudio.playMotionAudio('menu_navigate');
    this.assembleHeader(next, MOTION.charStagger);

    // The cover set is reused as the release set: a second full-screen cover
    // would keep the new pane painted over until the whole wipe finished.
    blades.forEach((blade) => {
      blade.classList.remove('p5-blade-cover');
      blade.classList.add('p5-blade-release');
    });

    if (!(await this.restAfter(blades, MOTION.bladeRelease + MOTION.bladeStagger + MOTION.settleSlack))) {
      return this.finish('cancelled');
    }
    return this.finish('completed');
  }

  /** Header assembly outlives the wipe but is cancelled with the transaction. */
  private assembleHeader(pane: HTMLElement, leadMs: number): void {
    const header = pane.querySelector<HTMLElement>('.section-header');
    if (!header) return;
    this.director.spawn(
      new RansomAssembleCue({
        header,
        seed: this.spec.seed ?? pane.id,
        leadMs,
        playAudio: false
      })
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SHUTTER-BLACKOUT — modal open
// ─────────────────────────────────────────────────────────────────────────────

class ShutterBlackoutCue extends CueBase {
  readonly variant = 'shutter-blackout' as const;
  private readonly children: HTMLElement[];
  private readonly step: number;
  private revealed = false;

  constructor(private spec: ShutterBlackoutSpec) {
    const kids = collectStaggered(spec.host, spec.staggerSelector);
    // 40ms is the house increment; it only compresses when a long list would
    // otherwise push the cue past its declared budget.
    const step = Math.max(16, Math.min(MOTION.stagger, Math.floor((MOTION.shutter - MOTION.blackout - 160) / Math.max(kids.length, 1))));
    // Never shorter than the blades' own sweep, or the nodes get unmounted
    // mid-travel and the remaining blades pop.
    super(Math.max(MOTION.blackout + kids.length * step + 160,
        MOTION.blackout + MOTION.bladeRelease + MOTION.bladeStagger + MOTION.settleSlack));
    this.children = kids;
    this.step = step;
    // A preemption may never leave a child parked at opacity 0.
    this.onAbort = () => kids.forEach((child) => child.classList.remove('p5-stagger-arm'));
    this.onSettle = () => this.reveal();
  }

  /** Open the dialog exactly once, however the cue ends. */
  private reveal(): void {
    if (this.revealed) return;
    this.revealed = true;
    this.children.forEach((child) => child.classList.remove('p5-stagger-arm'));
    this.spec.onCovered?.();
  }

  async play(): Promise<MotionOutcome> {
    if (prefersReducedMotion()) {
      p5rAudio.playMotionAudio(this.spec.audio ?? 'menu_open');
      return this.finish('skipped');
    }

    this.children.forEach((child) => child.classList.add('p5-stagger-arm'));
    openBlackout(this.track, MOTION.blackout);
    p5rAudio.playMotionAudio(this.spec.audio ?? 'menu_open');
    if (!(await this.seq.wait(MOTION.blackout))) return this.finish('cancelled');

    // Mounted under the black frame: the backdrop never pops.
    this.reveal();
    armBlades(this.track, 'release');

    for (let i = 0; i < this.children.length; i += 1) {
      if (!(await this.seq.wait(this.step))) return this.finish('cancelled');
      const child = this.children[i];
      child.classList.remove('p5-stagger-arm');
      this.track.animate(
        child,
        [
          { opacity: 0, translate: '0 18px', filter: 'brightness(1.9)' },
          { opacity: 1, translate: '0 0', filter: 'brightness(1)' }
        ],
        { duration: 160, easing: 'cubic-bezier(.16,1,.3,1)' }
      );
    }

    if (!this.seq.live) return this.finish('cancelled');
    return this.finish('completed');
  }
}

function collectStaggered(host: HTMLElement, selector?: string): HTMLElement[] {
  const CAP = 12;
  if (selector) return Array.from(host.querySelectorAll<HTMLElement>(selector)).slice(0, CAP);
  const card = host.querySelector<HTMLElement>('.p5-manual-card, .p5-modal-card, .p5-card-frame');
  const source = card ?? host;
  const kids = Array.from(source.children).filter((node): node is HTMLElement => node instanceof HTMLElement);
  return (kids.length ? kids : [source]).slice(0, CAP);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. RANSOM-ASSEMBLE — section header
// ─────────────────────────────────────────────────────────────────────────────

class RansomAssembleCue extends CueBase {
  readonly variant = 'ransom-assemble' as const;
  private readonly chars: HTMLElement[];
  private readonly rotations: number[];

  constructor(private spec: RansomAssembleSpec) {
    const chars = Array.from(spec.header.querySelectorAll<HTMLElement>('.ransom-char'));
    super((spec.leadMs ?? 0) + chars.length * MOTION.charStagger + MOTION.charSnap + 200);
    this.chars = chars;
    this.rotations = seededRotations(spec.seed, chars.length);
    // Never strand a glyph at opacity 0 if the transaction is replaced.
    this.onSettle = () => chars.forEach((char) => char.classList.remove('p5-ransom-arm'));
  }

  async play(): Promise<MotionOutcome> {
    const chars = this.chars;
    const rotations = this.rotations;

    if (prefersReducedMotion()) {
      chars.forEach((char, i) => {
        char.style.transform = `rotate(${rotations[i]}deg)`;
        char.classList.remove('p5-ransom-arm');
      });
      return this.finish('skipped');
    }

    // Arming class drops each glyph out of the nth-child cutout cascade so the
    // committed inline transform below is the only rotation in play.
    chars.forEach((char) => char.classList.add('p5-ransom-arm'));

    const lead = this.spec.leadMs ?? 0;
    if (lead > 0 && !(await this.seq.wait(lead))) return this.finish('cancelled');
    if (chars.length && this.spec.playAudio !== false) p5rAudio.playMotionAudio('menu_navigate');

    for (let i = 0; i < chars.length; i += 1) {
      if (i > 0 && !(await this.seq.wait(MOTION.charStagger))) return this.finish('cancelled');
      const char = chars[i];
      const rot = rotations[i];
      char.style.transform = `rotate(${rot}deg)`;
      char.classList.remove('p5-ransom-arm');
      this.track.animate(
        char,
        [
          { opacity: 0, transform: `translate(14px, -26px) rotate(${rot * 3.5 + 14}deg) scale(1.55)`, offset: 0 },
          { opacity: 1, transform: `translate(-2px, 3px) rotate(${rot - 5}deg) scale(1.12)`, offset: 0.62 },
          { opacity: 1, transform: `translate(0, 0) rotate(${rot}deg) scale(1)`, offset: 1 }
        ],
        { duration: MOTION.charSnap, easing: 'steps(3, end)' }
      );
    }

    const tag = this.spec.header.querySelector<HTMLElement>('.section-tag');
    if (tag) tag.classList.add('p5-ransom-snap');
    const sub = this.spec.header.querySelector<HTMLElement>('.title-sub');
    if (sub) {
      this.track.animate(sub, [{ opacity: 0, translate: '-16px 0' }, { opacity: 1, translate: '0 0' }], {
        duration: 140,
        easing: 'cubic-bezier(.16,1,.3,1)'
      });
    }

    return this.finish('completed');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. KINETIC-EXIT — modal close
// ─────────────────────────────────────────────────────────────────────────────

class KineticExitCue extends CueBase {
  readonly variant = 'kinetic-exit' as const;
  private covered = false;

  constructor(private spec: KineticExitSpec) {
    super(MOTION.kineticExit);
    // The caller has already committed to closing, so a preemption must still
    // hide the host — otherwise it lingers as an inert, invisible backdrop.
    this.onSettle = () => this.conceal();
  }

  /** Hide the host exactly once, whether reached normally or by preemption. */
  private conceal(): void {
    if (this.covered) return;
    this.covered = true;
    this.spec.onCovered?.();
  }

  async play(): Promise<MotionOutcome> {
    p5rAudio.playMotionAudio(this.spec.audio ?? 'menu_back');
    if (this.spec.suppressConfetti !== false) p5HaltConfetti();

    if (prefersReducedMotion()) return this.finish('skipped');

    const blades = armBlades(this.track, 'cover');
    if (!(await this.restAfter(blades, MOTION.coverSettle + MOTION.settleSlack))) return this.finish('cancelled');

    blades.forEach((blade) => {
      blade.classList.remove('p5-blade-cover');
      blade.classList.add('p5-blade-release');
    });

    if (!(await this.restAfter(blades, MOTION.bladeRelease + MOTION.bladeStagger + MOTION.settleSlack))) {
      return this.finish('cancelled');
    }
    return this.finish('completed');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Director
// ─────────────────────────────────────────────────────────────────────────────

export interface P5RTransitionManager {
  switchTab(
    currentTab: HTMLElement | null,
    nextTab: HTMLElement,
    type?: P5RTransitionType,
    options?: P5RTransitionOptions
  ): Promise<void>;
  flashChromatic(element: HTMLElement, durationMs?: number): void;
  isTransitioning(): boolean;
  cancelActiveTransitions(): void;
}

export class MotionDirectorImpl implements P5RTransitionManager {
  private static singleton: MotionDirectorImpl | null = null;
  private active: Cue | null = null;
  private followers: Cue[] = [];
  private running = false;
  private guard = 0;

  static get instance(): MotionDirectorImpl {
    if (!MotionDirectorImpl.singleton) MotionDirectorImpl.singleton = new MotionDirectorImpl();
    return MotionDirectorImpl.singleton;
  }

  /** Start a cue that belongs to the running transaction but does not gate it. */
  spawn(cue: Cue): Promise<MotionOutcome> {
    this.followers = this.followers.filter((follower) => !follower.done);
    this.followers.push(cue);
    return cue.play();
  }

  isTransitioning(): boolean {
    return this.running;
  }

  cancelActiveTransitions(): void {
    window.clearTimeout(this.guard);
    this.guard = 0;
    this.active?.cancel();
    this.active = null;
    this.followers.forEach((cue) => cue.cancel());
    this.followers = [];
    this.running = false;
    if (typeof document !== 'undefined') {
      document.body.classList.remove('transitioning-lock');
      document.getElementById('section-blackout')?.classList.remove('p5-blackout-run');
    }
  }

  /** Preempt the in-flight transaction, then run `cue` as the new one. */
  async play(cue: Cue, lockPointer = true): Promise<MotionOutcome> {
    this.cancelActiveTransitions();
    this.active = cue;
    this.running = lockPointer;
    if (lockPointer && typeof document !== 'undefined') document.body.classList.add('transitioning-lock');

    // Belt and braces: the pointer lock can never outlive the choreography.
    this.guard = window.setTimeout(
      () => this.cancelActiveTransitions(),
      cue.duration + MOTION.guardSlack
    );

    let outcome: MotionOutcome = 'cancelled';
    try {
      outcome = await cue.play();
    } catch (error) {
      console.warn('[P5R Motion] cue failed:', cue.variant, error);
      cue.cancel();
      outcome = 'cancelled';
    }

    if (this.active === cue) this.cancelActiveTransitions();
    return outcome;
  }

  slashCut(spec: SlashCutSpec): Promise<MotionOutcome> {
    return this.play(new SlashCutCue(spec, this));
  }

  shutterBlackout(spec: ShutterBlackoutSpec): Promise<MotionOutcome> {
    return this.play(new ShutterBlackoutCue(spec), false);
  }

  ransomAssemble(spec: RansomAssembleSpec): Promise<MotionOutcome> {
    return this.spawn(new RansomAssembleCue(spec));
  }

  kineticExit(spec: KineticExitSpec): Promise<MotionOutcome> {
    return this.play(new KineticExitCue(spec), false);
  }

  /** Snap a ribbon/hud element one step without a full-viewport wipe. */
  snap(el: HTMLElement, direction: 1 | -1 = 1): void {
    if (prefersReducedMotion()) return;
    this.trackless(el, [
      { transform: `translateX(${direction * -14}px) skewX(-12deg) rotate(-8deg)`, opacity: 0.55 },
      { transform: 'translateX(0) skewX(-12deg) rotate(-8deg)', opacity: 1 }
    ], 130, 'cubic-bezier(.16,1,.3,1)');
  }

  /** Comic pop for a freshly mounted speech bubble, panel or chip. */
  pop(el: HTMLElement, distance = 16): void {
    if (prefersReducedMotion()) return;
    this.trackless(el, [{ opacity: 0, translate: `${distance}px ${distance}px` }, { opacity: 1, translate: '0 0' }], 150, 'cubic-bezier(.16,1,.3,1)');
  }

  /**
   * Ribbon tabs land one at a time once the entrance cinematic hands back the
   * viewport. The stylesheet parks them at opacity 0 until this runs.
   */
  revealRibbons(staggerMs = MOTION.stagger): void {
    if (typeof document === 'undefined') return;
    const buttons = Array.from(document.querySelectorAll<HTMLElement>('.p5-ribbon-btn, .p3r-ribbon-btn'));
    buttons.forEach((btn, i) => {
      btn.classList.add('p5-ribbon-live');
      if (prefersReducedMotion()) return;
      this.trackless(
        btn,
        [
          { opacity: 0, transform: 'translateX(-34px) skewX(-12deg) rotate(-8deg)' },
          { opacity: 1, transform: 'translateX(0) skewX(-12deg) rotate(-8deg)' }
        ],
        180,
        'cubic-bezier(.16,1,.3,1)',
        i * staggerMs
      );
    });
  }

  private trackless(el: HTMLElement, frames: Keyframe[], duration: number, easing: string, delay = 0): void {
    if (typeof el.animate !== 'function') return;
    el.animate(frames, {
      duration,
      easing,
      delay,
      fill: delay > 0 ? 'backwards' : 'none'
    }).finished.catch(() => undefined);
  }

  // ── Legacy surface kept for src/ui/navigation.ts and src/main.ts ───────────

  async switchTab(
    currentTab: HTMLElement | null,
    nextTab: HTMLElement,
    type: P5RTransitionType = 'slash-cut',
    options: P5RTransitionOptions = {}
  ): Promise<void> {
    if (!nextTab) return;
    const legacy = type === 'comic-slash' ? 'slash-cut' : type;

    if (legacy === 'instant' || prefersReducedMotion()) {
      this.cancelActiveTransitions();
      commitPanes(collectPanes(nextTab), nextTab);
      options.onComplete?.();
      return;
    }

    if (legacy === 'chromatic-flash') {
      this.flashChromatic(nextTab, options.durationMs ?? 160);
      commitPanes(collectPanes(nextTab), nextTab);
      options.onComplete?.();
      return;
    }

    await this.slashCut({
      next: nextTab,
      current: currentTab,
      seed: nextTab.id,
      playAudio: options.playAudio
    });
    options.onComplete?.();
  }

  /** RGB misregister only: no transform keyframe, so persistent skews survive. */
  flashChromatic(element: HTMLElement, durationMs = 160): void {
    if (prefersReducedMotion() || typeof element.animate !== 'function') return;
    element.animate(
      [
        { filter: 'drop-shadow(-4px 0 0 #E60012) drop-shadow(4px 0 0 #FFDE00)' },
        { filter: 'drop-shadow(-2px 0 0 #E60012) drop-shadow(2px 0 0 #FFDE00)', offset: 0.5 },
        { filter: 'none' }
      ],
      { duration: Math.min(durationMs, 240), easing: 'steps(2, end)' }
    ).finished.catch(() => undefined);
  }
}

export const p5rTransitions = MotionDirectorImpl.instance;

/** Backwards-compatible aliases for legacy imports. */
export const p3rTransitions = p5rTransitions;
export type P5RTransitionDirector = MotionDirectorImpl;
export { MotionDirectorImpl as P3RTransitionManager };
export { MotionDirectorImpl as P5RTransitionManagerImpl };
