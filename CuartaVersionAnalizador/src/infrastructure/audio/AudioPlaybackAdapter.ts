/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Infraestructura: Adaptador de Reproducción de Audio Dual (Canal A y Canal B).
 * 
 * Permite escuchar y comparar acústicamente:
 * - Canal A: Señal original capturada pura.
 * - Canal B: Señal procesada/degradada a través del canal físico (Atenuación + AWGN + Filtro telefónico).
 */

import { AudioContextManager, globalAudioContextManager } from "./AudioContextManager";

export interface PlaybackControl {
  stop: () => void;
}

export class AudioPlaybackAdapter {
  private currentSourceA: AudioBufferSourceNode | null = null;
  private currentSourceB: AudioBufferSourceNode | null = null;
  private gainNodeA: GainNode | null = null;
  private gainNodeB: GainNode | null = null;

  constructor(private readonly contextManager: AudioContextManager = globalAudioContextManager) {}

  /**
   * Reproduce el búfer del Canal A (Voz original pura).
   */
  public playChannelA(
    samples: Float32Array,
    sampleRate: number,
    onEnded?: () => void
  ): PlaybackControl {
    this.stopPlaybackA();
    const ctx = this.contextManager.getAudioContext();
    const buffer = this.contextManager.createAudioBuffer(samples, sampleRate);

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.value = 0.9;

    source.connect(gain);
    gain.connect(ctx.destination);

    this.currentSourceA = source;
    this.gainNodeA = gain;

    source.onended = () => {
      this.stopPlaybackA();
      if (onEnded) onEnded();
    };

    source.start(0);

    return {
      stop: () => this.stopPlaybackA(),
    };
  }

  /**
   * Reproduce el búfer del Canal B (Señal procesada con atenuación y ruido).
   */
  public playChannelB(
    samples: Float32Array,
    sampleRate: number,
    onEnded?: () => void
  ): PlaybackControl {
    this.stopPlaybackB();
    const ctx = this.contextManager.getAudioContext();
    const buffer = this.contextManager.createAudioBuffer(samples, sampleRate);

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.value = 0.9;

    source.connect(gain);
    gain.connect(ctx.destination);

    this.currentSourceB = source;
    this.gainNodeB = gain;

    source.onended = () => {
      this.stopPlaybackB();
      if (onEnded) onEnded();
    };

    source.start(0);

    return {
      stop: () => this.stopPlaybackB(),
    };
  }

  public stopPlaybackA(): void {
    if (this.currentSourceA) {
      try {
        this.currentSourceA.onended = null;
        this.currentSourceA.stop();
        this.currentSourceA.disconnect();
      } catch {}
      this.currentSourceA = null;
    }
    if (this.gainNodeA) {
      try {
        this.gainNodeA.disconnect();
      } catch {}
      this.gainNodeA = null;
    }
  }

  public stopPlaybackB(): void {
    if (this.currentSourceB) {
      try {
        this.currentSourceB.onended = null;
        this.currentSourceB.stop();
        this.currentSourceB.disconnect();
      } catch {}
      this.currentSourceB = null;
    }
    if (this.gainNodeB) {
      try {
        this.gainNodeB.disconnect();
      } catch {}
      this.gainNodeB = null;
    }
  }

  public stopAll(): void {
    this.stopPlaybackA();
    this.stopPlaybackB();
  }
}

export const globalAudioPlaybackAdapter = new AudioPlaybackAdapter();
