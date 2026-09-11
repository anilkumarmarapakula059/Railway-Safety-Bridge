/**
 * Native Web Audio API Synthesizer for Railway Audible Warnings.
 * Does not require external audio assets. Safe, zero-latency, cross-browser.
 */

class RailwaySoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playWarningChime() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      // Railway chime dual frequency (e.g. 587.33Hz D5 to 880Hz A5)
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.25);

      osc2.frequency.setValueAtTime(880.0, now + 0.25);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.5);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.3);
      osc2.start(now + 0.25);
      osc2.stop(now + 0.6);
    } catch {
      // Audio autoplay policy catch
    }
  }

  public playBridgeClosureSiren() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Siren sweep 440Hz -> 800Hz
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(750, now + 0.4);
      osc.frequency.linearRampToValueAtTime(440, now + 0.8);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.85);
    } catch {
      // Audio autoplay policy catch
    }
  }

  public playEmergencyBuzzer() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(950, now + i * 0.15);

        gain.gain.setValueAtTime(0.18, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.1);
      }
    } catch {
      // Audio autoplay policy catch
    }
  }
}

export const soundEngine = new RailwaySoundEngine();
