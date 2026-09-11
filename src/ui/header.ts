/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - TOP HUD & HEADER CONTROLLER
 * File: src/ui/header.ts
 *
 * Controls all Top HUD header components:
 *  1. Phantom Thieves Logo Banner (clicks navigate to Tab 1 / Dossier & scroll top)
 *  2. Palace Security Alert Level Meter:
 *     - Clamped strictly between 0% minimum and 99% maximum
 *     - Driven by window scroll depth: Math.min(99, Math.floor((scrollY / maxScroll) * 99))
 *     - 60fps telemetry via requestAnimationFrame and { passive: true }
 *     - Handles zero-height viewports gracefully
 *  3. BGM Controls:
 *     - Looping "Last Surprise" Play/Pause toggle (#btn-bgm-toggle)
 *     - Master Mute toggle (#btn-mute-toggle)
 *     - Master Volume slider (#master-volume-slider) hooked directly to p5rAudio.setVolume()
 *  4. Global Gesture Unlocker for browser autoplay policy compliance
 * ==========================================================================
 */

import { p5rAudio } from '../audio/p5rAudio';

export interface HeaderController {
  init(): void;
  updateBgmButton(isPlaying: boolean): void;
  updateMuteButton(isMuted: boolean): void;
  updateVolumeSlider(volume: number): void;
  updateAlertMeter(level: number): void;
  getAlertLevel(): number;
  destroy(): void;
}

export class HeaderControllerImpl implements HeaderController {
  private btnBgmToggle: HTMLElement | null = null;
  private btnMuteToggle: HTMLElement | null = null;
  private muteIcon: HTMLElement | null = null;
  private volumeSlider: HTMLInputElement | null = null;
  private logoBox: HTMLElement | null = null;
  private alertBar: HTMLElement | null = null;
  private alertText: HTMLElement | null = null;

  private alertLevel: number = 15;
  private isScrollTicking: boolean = false;
  private scrollListener: (() => void) | null = null;

  public init(): void {
    if (typeof document === 'undefined') return;

    this.btnBgmToggle = document.getElementById('btn-bgm-toggle');
    this.btnMuteToggle = document.getElementById('btn-mute-toggle');
    this.muteIcon = document.getElementById('mute-icon');
    this.volumeSlider = document.getElementById('master-volume-slider') as HTMLInputElement | null;
    this.logoBox = document.querySelector('.brand-group, .pt-logo-img');
    this.alertBar = document.getElementById('security-alert-bar');
    this.alertText = document.getElementById('security-alert-text');

    // Ensure volume slider exists in DOM if not present in static HTML
    this.ensureVolumeSliderInDom();

    this.bindBrandLogo();
    this.bindAudioControls();
    this.bindSecurityAlertScroll();
    this.bindHoverSfx();
    this.registerGlobalGestureUnlock();
  }

  /**
   * Dynamically mounts volume slider into .audio-ctrl-group if missing from index.html.
   */
  private ensureVolumeSliderInDom(): void {
    if (this.volumeSlider) return;
    const ctrlGroup = document.querySelector('.audio-ctrl-group');
    if (!ctrlGroup) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'volume-slider-group';
    wrapper.title = 'Master Volume Control';
    wrapper.innerHTML = `
      <span class="vol-icon">VOL</span>
      <input type="range" id="master-volume-slider" min="0" max="1" step="0.02" value="${p5rAudio.getVolume()}" class="p5-volume-slider" />
    `;
    ctrlGroup.appendChild(wrapper);
    this.volumeSlider = document.getElementById('master-volume-slider') as HTMLInputElement | null;
  }

  /**
   * 1. Brand Logo: clicking scrolls to top and activates Dossier (Tab 1).
   */
  private bindBrandLogo(): void {
    if (!this.logoBox) return;

    this.logoBox.style.cursor = 'pointer';
    this.logoBox.addEventListener('click', () => {
      p5rAudio.playConfirm();
      const firstTab = document.querySelector<HTMLElement>('[data-tab="tab-profile"]');
      if (firstTab) {
        firstTab.click();
      }
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /**
   * 2. Audio & BGM Controls (Play/Pause, Mute, Volume Slider).
   */
  private bindAudioControls(): void {
    // Play/Pause BGM Toggle
    if (this.btnBgmToggle) {
      this.btnBgmToggle.addEventListener('click', () => {
        p5rAudio.playMenuSelect();
        const isPlaying = p5rAudio.toggleBgm();
        this.updateBgmButton(isPlaying);
      });
      this.updateBgmButton(p5rAudio.isBgmActive());
    }

    // Mute/Unmute Toggle
    if (this.btnMuteToggle) {
      this.btnMuteToggle.addEventListener('click', () => {
        p5rAudio.playMenuSelect();
        const isMuted = p5rAudio.toggleMute();
        this.updateMuteButton(isMuted);
      });
      this.updateMuteButton(p5rAudio.isMuted());
    }

    // Linear Master Volume Slider
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', () => {
        const val = parseFloat(this.volumeSlider!.value);
        p5rAudio.setVolume(val);
        if (p5rAudio.isMuted() && val > 0) {
          p5rAudio.toggleMute();
          this.updateMuteButton(false);
        }
      });
    }
  }

  /**
   * 3. Palace Security Alert Level Meter (0% to 99% based on scroll depth).
   * Formula: Math.min(99, Math.floor((scrollY / maxScroll) * 99))
   */
  private bindSecurityAlertScroll(): void {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const scrollHeight = document.documentElement.scrollHeight || 0;
      const innerHeight = window.innerHeight || 1;
      const maxScroll = scrollHeight - innerHeight;

      // Ambient baseline is 15% (stealth infiltration level), smoothly scaling to 99% (MAX Alert) on scroll
      const computed = maxScroll > 0
        ? Math.min(99, Math.max(15, Math.floor(15 + (scrollY / maxScroll) * 84)))
        : 15;

      this.updateAlertMeter(computed);
      this.isScrollTicking = false;
    };

    this.scrollListener = () => {
      if (!this.isScrollTicking) {
        window.requestAnimationFrame(handleScroll);
        this.isScrollTicking = true;
      }
    };

    window.addEventListener('scroll', this.scrollListener, { passive: true });
    // Initial evaluation
    handleScroll();
  }

  /**
   * 4. Hover microinteraction SFX on header elements.
   */
  private bindHoverSfx(): void {
    const interactives = [
      this.logoBox,
      this.btnBgmToggle,
      this.btnMuteToggle,
      this.volumeSlider,
    ].filter((el): el is HTMLElement => el !== null);

    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        p5rAudio.playMenuNavigate();
      });
    });
  }

  /**
   * Global gesture unlock for browser Web Audio autoplay policy.
   */
  private registerGlobalGestureUnlock(): void {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      p5rAudio.init();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
  }

  public updateBgmButton(isPlaying: boolean): void {
    if (!this.btnBgmToggle) return;
    this.btnBgmToggle.classList.toggle('active', isPlaying);
    this.btnBgmToggle.innerHTML = `<span>🎵 BGM: ${isPlaying ? 'LAST SURPRISE' : 'PAUSED'}</span>`;
  }

  public updateMuteButton(isMuted: boolean): void {
    if (!this.btnMuteToggle) return;
    this.btnMuteToggle.classList.toggle('active', isMuted);
    this.btnMuteToggle.classList.toggle('muted', isMuted);
    if (this.muteIcon) {
      this.muteIcon.textContent = isMuted ? '🔇 MUTED' : '🔊 SOUND ON';
    }
  }

  public updateVolumeSlider(volume: number): void {
    if (!this.volumeSlider) return;
    this.volumeSlider.value = String(Math.max(0, Math.min(1, volume)));
  }

  public updateAlertMeter(level: number): void {
    this.alertLevel = Math.max(0, Math.min(99, Math.round(level)));
    if (this.alertBar) {
      this.alertBar.style.width = `${this.alertLevel}%`;
    }
    if (this.alertText) {
      this.alertText.textContent = `${this.alertLevel}% ${this.alertLevel >= 90 ? 'MAX' : 'ALERT'}`;
    }
  }

  public getAlertLevel(): number {
    return this.alertLevel;
  }

  public destroy(): void {
    if (this.scrollListener && typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = null;
    }
  }
}

// Global Singleton Export
export const headerController = new HeaderControllerImpl();