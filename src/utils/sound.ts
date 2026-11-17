// Procedural Web Audio API Sound & Ambient Soundscape Engine

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedCtx) {
    sharedCtx = new AudioCtx();
  }
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.12,
  delay = 0,
  slideToFreq?: number
) {
  const ctx = getCtx();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideToFreq) {
    osc.frequency.exponentialRampToValueAtTime(slideToFreq, start + duration);
  }
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export const sfx = {
  habitDone(enabled: boolean) {
    if (!enabled) return;
    tone(523.25, 0.12, 'triangle', 0.12, 0); // C5
    tone(659.25, 0.16, 'triangle', 0.12, 0.07); // E5
    tone(783.99, 0.24, 'sine', 0.11, 0.14); // G5
  },
  habitStep(enabled: boolean) {
    if (!enabled) return;
    tone(480, 0.08, 'sine', 0.09, 0, 620);
  },
  shieldDeflect(enabled: boolean) {
    if (!enabled) return;
    // Metallic shield clang + rising power chord
    tone(220, 0.12, 'sawtooth', 0.07, 0, 440);
    tone(587.33, 0.18, 'triangle', 0.14, 0.03); // D5
    tone(880, 0.28, 'sine', 0.12, 0.09); // A5
    tone(1174.66, 0.35, 'sine', 0.08, 0.16); // D6
  },
  critHit(enabled: boolean) {
    if (!enabled) return;
    tone(140, 0.14, 'sawtooth', 0.14, 0, 55);
    tone(660, 0.16, 'square', 0.06, 0.04, 990);
  },
  chestOpen(enabled: boolean) {
    if (!enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, idx) => {
      tone(n, 0.26, 'triangle', 0.11, idx * 0.07);
    });
  },
  slip(enabled: boolean) {
    if (!enabled) return;
    tone(240, 0.25, 'sine', 0.08, 0, 160);
  },
  breathCue(enabled: boolean, phase: 'inhale' | 'hold' | 'exhale') {
    if (!enabled) return;
    if (phase === 'inhale') tone(320, 0.4, 'sine', 0.05, 0, 420);
    else if (phase === 'hold') tone(420, 0.25, 'sine', 0.035, 0);
    else tone(400, 0.5, 'sine', 0.05, 0, 280);
  },
  coinSpend(enabled: boolean) {
    if (!enabled) return;
    tone(987.77, 0.09, 'sine', 0.09, 0);
    tone(1318.51, 0.2, 'sine', 0.1, 0.07);
  },
};

export type AmbientKind = 'none' | 'rain' | 'brown' | 'ocean';

class AmbientSoundscape {
  private source: AudioBufferSourceNode | null = null;
  private lfo: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private current: AmbientKind = 'none';

  public getCurrent(): AmbientKind {
    return this.current;
  }

  public setVolume(vol: number) {
    if (this.gainNode && sharedCtx) {
      this.gainNode.gain.setTargetAtTime(vol, sharedCtx.currentTime, 0.1);
    }
  }

  public stop() {
    try {
      this.source?.stop();
      this.lfo?.stop();
    } catch {
      // ignore if already stopped
    }
    this.source?.disconnect();
    this.lfo?.disconnect();
    this.gainNode?.disconnect();
    this.source = null;
    this.lfo = null;
    this.gainNode = null;
    this.current = 'none';
  }

  public start(kind: AmbientKind, volume = 0.28) {
    this.stop();
    if (kind === 'none') return;
    const ctx = getCtx();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate smooth brown or pink-ish noise
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (kind === 'brown' || kind === 'ocean') {
        data[i] = (lastOut + 0.025 * white) / 1.025;
        lastOut = data[i];
        data[i] *= 3.2;
      } else {
        // Rain: crisp filtered noise
        data[i] = (lastOut + 0.12 * white) / 1.12;
        lastOut = data[i];
        data[i] *= 1.6;
      }
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);

    if (kind === 'rain') {
      filter.type = 'bandpass';
      filter.frequency.value = 1100;
      filter.Q.value = 0.55;
      src.connect(filter);
      filter.connect(gain);
    } else if (kind === 'brown') {
      filter.type = 'lowpass';
      filter.frequency.value = 340;
      src.connect(filter);
      filter.connect(gain);
    } else if (kind === 'ocean') {
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      // Slow LFO modulating ocean wave volume & filter cutoff
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.11; // ~9s wave cycle
      lfoGain.gain.value = 260;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.lfo = lfo;
      src.connect(filter);
      filter.connect(gain);
    }

    gain.connect(ctx.destination);
    src.start();

    this.source = src;
    this.gainNode = gain;
    this.current = kind;
  }
}

export const ambientEngine = new AmbientSoundscape();
