/**
 * Ambient Soundscape Generator using Web Audio API
 * Generates natural relaxing focus audio in real-time (No external audio files needed).
 * 100% offline, zero bandwidth, zero latency.
 */

export type AmbientSoundType = "rain" | "waves" | "alpha" | "campfire" | null;

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentType: AmbientSoundType = null;
  private masterGain: GainNode | null = null;
  private activeNodes: { stop?: () => void; disconnect: () => void }[] = [];
  private volume: number = 0.4;
  private isMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
      if (!this.ctx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Create White/Pink Noise Buffer
  private createNoiseBuffer(ctx: AudioContext, durationSeconds = 5): AudioBuffer {
    const bufferSize = ctx.sampleRate * durationSeconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // 3dB/octave pinking filter
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  public play(type: AmbientSoundType, targetVolume?: number): void {
    if (targetVolume !== undefined) {
      this.volume = Math.max(0, Math.min(1, targetVolume));
    }

    if (this.currentType === type && this.masterGain) {
      return; // Already playing this sound
    }

    this.stop();

    if (!type) {
      this.currentType = null;
      return;
    }

    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.currentType = type;
    const now = ctx.currentTime;

    // Master Gain Node
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(
      this.isMuted ? 0.0001 : Math.max(0.001, this.volume * 0.6),
      now + 0.8
    );
    this.masterGain.connect(ctx.destination);

    if (type === "rain") {
      this.buildRain(ctx, this.masterGain);
    } else if (type === "waves") {
      this.buildWaves(ctx, this.masterGain);
    } else if (type === "alpha") {
      this.buildAlphaWaves(ctx, this.masterGain);
    } else if (type === "campfire") {
      this.buildCampfire(ctx, this.masterGain);
    }
  }

  // 1. Gentle Rain Sound (Filtered pink noise with subtle water droplet frequencies)
  private buildRain(ctx: AudioContext, destination: GainNode) {
    const buffer = this.createNoiseBuffer(ctx, 4);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filter 1: Lowpass for gentle rainfall
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(850, ctx.currentTime);

    // Filter 2: Highpass to eliminate rumbling
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(120, ctx.currentTime);

    noiseSource.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(destination);

    noiseSource.start();
    this.activeNodes.push(noiseSource, lowpass, highpass);
  }

  // 2. Ocean Waves (LFO modulated filtered noise simulating rhythmic swells)
  private buildWaves(ctx: AudioContext, destination: GainNode) {
    const buffer = this.createNoiseBuffer(ctx, 6);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Dynamic Filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    // LFO Oscillator to sweep filter up and down every 7 seconds
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.14, ctx.currentTime); // ~7 seconds per ocean swell

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(320, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noiseSource.connect(filter);
    filter.connect(destination);

    noiseSource.start();
    lfo.start();
    this.activeNodes.push(noiseSource, filter, lfo, lfoGain);
  }

  // 3. Deep Focus Alpha Waves (432Hz Harmonic drone + 8Hz binaural wave)
  private buildAlphaWaves(ctx: AudioContext, destination: GainNode) {
    const now = ctx.currentTime;

    // Base 432 Hz Healing / Focus Carrier
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(216, now); // Sub-octave 216Hz for rich warmth

    const osc2 = ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(432, now); // Harmonic 432Hz

    // 8Hz alpha rhythm modulator
    const tremolo = ctx.createOscillator();
    tremolo.type = "sine";
    tremolo.frequency.setValueAtTime(8, now); // 8 Hz Alpha rhythm (relaxed alert state)

    const tremoloGain = ctx.createGain();
    tremoloGain.gain.setValueAtTime(0.04, now);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.2, now);

    tremolo.connect(tremoloGain.gain);
    osc1.connect(subGain);
    osc2.connect(subGain);
    subGain.connect(destination);

    osc1.start(now);
    osc2.start(now);
    tremolo.start(now);

    this.activeNodes.push(osc1, osc2, tremolo, tremoloGain, subGain);
  }

  // 4. Cozy Campfire Crackles
  private buildCampfire(ctx: AudioContext, destination: GainNode) {
    const buffer = this.createNoiseBuffer(ctx, 3);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(500, ctx.currentTime);
    bandpass.Q.setValueAtTime(1.5, ctx.currentTime);

    noise.connect(bandpass);
    bandpass.connect(destination);

    noise.start();
    this.activeNodes.push(noise, bandpass);
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(
        Math.max(0.001, this.volume * 0.6),
        this.ctx.currentTime,
        0.1
      );
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0.0001 : Math.max(0.001, this.volume * 0.6);
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.1);
    }
    return this.isMuted;
  }

  public stop(): void {
    if (this.masterGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      } catch {
        // Safe fallback
      }
    }

    setTimeout(() => {
      this.activeNodes.forEach((node) => {
        try {
          if (node.stop) node.stop();
          node.disconnect();
        } catch {
          // ignore already stopped
        }
      });
      this.activeNodes = [];
      if (this.masterGain) {
        try {
          this.masterGain.disconnect();
        } catch {
          // ignore
        }
        this.masterGain = null;
      }
    }, 450);

    this.currentType = null;
  }

  public getCurrentType(): AmbientSoundType {
    return this.currentType;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const ambientSoundEngine = new AmbientSoundEngine();
