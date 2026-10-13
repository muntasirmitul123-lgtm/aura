// Real-time procedural Web Audio API engine for AURA
// Synthesizes multi-channel spatial atmospheres without external MP3 dependencies that could fail to load.

interface ActiveChannelNodes {
  id: string;
  gainNode: GainElement;
  pannerNode: StereoPannerNode;
  cleanup: () => void;
  targetVolume: number;
}

type GainElement = GainNode;

class AuraAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private channels: Map<string, ActiveChannelNodes> = new Map();
  private masterVolume: number = 0.8;
  private isMuted: boolean = false;
  private spatialEnabled: boolean = true;
  private spatialInterval: number | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.85;

      this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.startSpatialDrift();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock() {
    this.ensureContext();
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      const effective = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.setTargetAtTime(effective, now, 0.08);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      const effective = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.setTargetAtTime(effective, now, 0.12);
    }
  }

  public setSpatialEnabled(enabled: boolean) {
    this.spatialEnabled = enabled;
    if (!enabled && this.ctx) {
      this.channels.forEach((ch) => {
        ch.pannerNode.pan.setTargetAtTime(0, this.ctx!.currentTime, 0.2);
      });
    }
  }

  public setChannelVolume(id: string, volume: number, defaultPan: number = 0) {
    const clamped = Math.max(0, Math.min(1, volume));
    if (clamped <= 0.005) {
      const existing = this.channels.get(id);
      if (existing && this.ctx) {
        const now = this.ctx.currentTime;
        existing.gainNode.gain.setTargetAtTime(0.0001, now, 0.25);
        existing.targetVolume = 0;
        setTimeout(() => {
          const current = this.channels.get(id);
          if (current && current.targetVolume === 0) {
            current.cleanup();
            this.channels.delete(id);
          }
        }, 900);
      }
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    let channel = this.channels.get(id);
    if (!channel) {
      channel = this.createChannelGenerator(ctx, id, defaultPan);
      this.channels.set(id, channel);
    }

    channel.targetVolume = clamped;
    const now = ctx.currentTime;
    // Scale perceptually so ambient layers blend smoothly
    const scaledGain = Math.pow(clamped, 1.65) * 0.45;
    channel.gainNode.gain.setTargetAtTime(scaledGain, now, 0.3);
  }

  public applyPresetMix(mix: Record<string, number>, defaultPans: Record<string, number>) {
    // Fade out channels not in the new mix
    this.channels.forEach((_, id) => {
      if (!(id in mix) || mix[id] === 0) {
        this.setChannelVolume(id, 0);
      }
    });
    // Fade in or adjust channels in the new mix
    Object.entries(mix).forEach(([id, vol]) => {
      this.setChannelVolume(id, vol, defaultPans[id] ?? 0);
    });
  }

  public getFrequencyData(targetArray: Uint8Array): boolean {
    if (!this.analyser || this.isMuted || this.channels.size === 0) {
      targetArray.fill(0);
      return false;
    }
    this.analyser.getByteFrequencyData(targetArray as unknown as Uint8Array<ArrayBuffer>);
    return true;
  }

  // Subtle harmonic chime for session start, completion, or breathing cues
  public playHarmonicCue(type: 'start' | 'complete' | 'inhale' | 'exhale') {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const notes =
      type === 'complete'
        ? [261.63, 329.63, 392.0, 493.88, 587.33] // C maj9 warm chord
        : type === 'start'
        ? [220.0, 329.63, 440.0] // A5 open interval
        : type === 'inhale'
        ? [293.66, 440.0]
        : [246.94, 329.63];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      noteGain.gain.setValueAtTime(0.0001, now + idx * 0.12);
      noteGain.gain.exponentialRampToValueAtTime(0.06, now + idx * 0.12 + 0.4);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 3.8);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain!);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 4.0);
    });
  }

  private startSpatialDrift() {
    if (this.spatialInterval) window.clearInterval(this.spatialInterval);
    this.spatialInterval = window.setInterval(() => {
      if (!this.ctx || !this.spatialEnabled) return;
      const t = performance.now() * 0.00025;
      let idx = 0;
      this.channels.forEach((ch) => {
        idx += 1;
        const drift = Math.sin(t + idx * 1.7) * 0.22;
        ch.pannerNode.pan.setTargetAtTime(Math.max(-0.85, Math.min(0.85, drift)), this.ctx!.currentTime, 1.8);
      });
    }, 2000);
  }

  private createNoiseBuffer(ctx: AudioContext, type: 'white' | 'pink' | 'brown', seconds = 4): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.045;
        b6 = white * 0.115926;
      }
    } else {
      // Brown noise
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 2.4;
      }
    }
    return buffer;
  }

  private createChannelGenerator(ctx: AudioContext, id: string, defaultPan: number): ActiveChannelNodes {
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);

    const pannerNode = ctx.createStereoPanner();
    pannerNode.pan.setValueAtTime(this.spatialEnabled ? defaultPan : 0, ctx.currentTime);

    gainNode.connect(pannerNode);
    pannerNode.connect(this.masterGain!);

    const disposers: Array<() => void> = [];

    const startLoopedNoise = (noiseType: 'white' | 'pink' | 'brown', filterType: BiquadFilterType, freq: number, q: number = 0.7) => {
      const src = ctx.createBufferSource();
      src.buffer = this.createNoiseBuffer(ctx, noiseType, 5);
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.value = freq;
      filter.Q.value = q;

      src.connect(filter);
      filter.connect(gainNode);
      src.start();
      disposers.push(() => {
        try {
          src.stop();
          src.disconnect();
        } catch {}
      });
      return { src, filter };
    };

    switch (id) {
      case 'rain': {
        startLoopedNoise('pink', 'bandpass', 1100, 0.6);
        startLoopedNoise('brown', 'lowpass', 340, 0.8);
        break;
      }
      case 'thunder': {
        const { filter } = startLoopedNoise('brown', 'lowpass', 95, 1.4);
        const timer = window.setInterval(() => {
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          filter.frequency.setValueAtTime(85, now);
          filter.frequency.exponentialRampToValueAtTime(210, now + 0.8);
          filter.frequency.exponentialRampToValueAtTime(75, now + 4.5);
        }, 7500);
        disposers.push(() => window.clearInterval(timer));
        break;
      }
      case 'wind':
      case 'leaves': {
        const baseFreq = id === 'wind' ? 320 : 1600;
        const { filter } = startLoopedNoise('pink', 'bandpass', baseFreq, 2.2);
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = id === 'wind' ? 0.14 : 0.23;
        lfoGain.gain.value = id === 'wind' ? 160 : 450;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        disposers.push(() => {
          try {
            lfo.stop();
          } catch {}
        });
        break;
      }
      case 'ocean': {
        const { filter } = startLoopedNoise('brown', 'lowpass', 380, 0.9);
        const waveLfo = ctx.createOscillator();
        const waveGain = ctx.createGain();
        waveLfo.frequency.value = 0.11; // ~9 second wave period
        waveGain.gain.value = 260;
        waveLfo.connect(waveGain);
        waveGain.connect(filter.frequency);
        waveLfo.start();
        disposers.push(() => {
          try {
            waveLfo.stop();
          } catch {}
        });
        break;
      }
      case 'river': {
        startLoopedNoise('pink', 'bandpass', 640, 0.9);
        startLoopedNoise('brown', 'lowpass', 260, 1.1);
        break;
      }
      case 'fireplace': {
        startLoopedNoise('brown', 'lowpass', 220, 0.8);
        // Subtle crackle impulses
        const timer = window.setInterval(() => {
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const popGain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(900 + Math.random() * 1400, now);
          popGain.gain.setValueAtTime(0.08, now);
          popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
          osc.connect(popGain);
          popGain.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.05);
        }, 420);
        disposers.push(() => window.clearInterval(timer));
        break;
      }
      case 'cafe':
      case 'city': {
        startLoopedNoise('brown', 'bandpass', id === 'cafe' ? 420 : 180, 0.7);
        break;
      }
      case 'clock-tick':
      case 'keyboard': {
        const intervalMs = id === 'clock-tick' ? 1000 : 280;
        const timer = window.setInterval(() => {
          if (!this.ctx) return;
          if (id === 'keyboard' && Math.random() > 0.65) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const tickGain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(id === 'clock-tick' ? 880 : 320 + Math.random() * 120, now);
          tickGain.gain.setValueAtTime(0.09, now);
          tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
          osc.connect(tickGain);
          tickGain.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.04);
        }, intervalMs);
        disposers.push(() => window.clearInterval(timer));
        break;
      }
      case 'spaceship': {
        startLoopedNoise('brown', 'lowpass', 120, 1.2);
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.value = 55; // A1 warm hull hum
        subGain.gain.value = 0.25;
        sub.connect(subGain);
        subGain.connect(gainNode);
        sub.start();
        disposers.push(() => {
          try {
            sub.stop();
          } catch {}
        });
        break;
      }
      case 'brown-noise': {
        startLoopedNoise('brown', 'lowpass', 480, 0.5);
        break;
      }
      case 'pink-noise': {
        startLoopedNoise('pink', 'lowpass', 1400, 0.5);
        break;
      }
      case 'white-noise': {
        startLoopedNoise('white', 'lowpass', 2200, 0.5);
        break;
      }
      case 'ambient-pad':
      case 'lofi':
      case 'piano': {
        // Generative warm harmonic pad / chord intervals
        const baseFreqs =
          id === 'ambient-pad'
            ? [110.0, 164.81, 220.0, 261.63, 329.63] // A minor 7 warm drone
            : id === 'lofi'
            ? [146.83, 220.0, 261.63, 349.23] // D minor 7
            : [196.0, 293.66, 392.0, 493.88]; // G maj7

        baseFreqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.value = f + (Math.random() - 0.5) * 0.4; // subtle analog detune
          filter.type = 'lowpass';
          filter.frequency.value = 620;
          oscGain.gain.value = 0.14 / baseFreqs.length;

          osc.connect(filter);
          filter.connect(oscGain);
          oscGain.connect(gainNode);
          osc.start();
          disposers.push(() => {
            try {
              osc.stop();
            } catch {}
          });
        });
        break;
      }
      default: {
        startLoopedNoise('brown', 'lowpass', 400, 0.7);
      }
    }

    return {
      id,
      gainNode,
      pannerNode,
      targetVolume: 0,
      cleanup: () => {
        disposers.forEach((fn) => fn());
        try {
          gainNode.disconnect();
          pannerNode.disconnect();
        } catch {}
      },
    };
  }
}

export const audioEngine = new AuraAudioEngine();
