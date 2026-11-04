/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture Adapter
 * 
 * Este archivo actúa como puente de compatibilidad hacia la Capa de Infraestructura (src/infrastructure).
 */

import {
  globalAudioContextManager,
  AudioContextManager,
} from "../infrastructure/audio/AudioContextManager";
import {
  globalMicrophoneCaptureAdapter,
} from "../infrastructure/audio/MicrophoneCaptureAdapter";
import {
  globalAudioPlaybackAdapter,
} from "../infrastructure/audio/AudioPlaybackAdapter";

export class AudioEngine {
  public get sampleRate(): number {
    return globalAudioContextManager.sampleRate;
  }

  public getAudioContext(): AudioContext {
    return globalAudioContextManager.getAudioContext();
  }

  public resumeAudioContext(): Promise<void> {
    globalAudioContextManager.resumeSynchronously();
    return globalAudioContextManager.ensureResumed().then(() => {});
  }

  public startMicrophoneMonitoring(
    onDataUpdate?: (timeData: Float32Array, freqData: Float32Array) => void
  ): Promise<boolean> {
    return globalMicrophoneCaptureAdapter.startLiveMonitoring(onDataUpdate);
  }

  public stopMicrophoneMonitoring(): void {
    globalMicrophoneCaptureAdapter.stopLiveMonitoring();
  }

  public recordMicrophoneBuffer(
    durationSec: number,
    signal?: AbortSignal
  ): Promise<Float32Array> {
    return globalMicrophoneCaptureAdapter.recordBuffer(durationSec, signal);
  }

  public createAudioBuffer(samples: Float32Array, sampleRate: number): AudioBuffer {
    return globalAudioContextManager.createAudioBuffer(samples, sampleRate);
  }

  public playChannelA(
    samples: Float32Array,
    sampleRate: number,
    onEnded?: () => void
  ): { stop: () => void } {
    return globalAudioPlaybackAdapter.playChannelA(samples, sampleRate, onEnded);
  }

  public playChannelB(
    samples: Float32Array,
    sampleRate: number,
    _channelOptions?: unknown,
    onEnded?: () => void
  ): { stop: () => void } {
    return globalAudioPlaybackAdapter.playChannelB(samples, sampleRate, onEnded);
  }

  public playProcessedChannelB(
    samples: Float32Array,
    sampleRate: number,
    onEnded?: () => void
  ): { stop: () => void } {
    return globalAudioPlaybackAdapter.playChannelB(samples, sampleRate, onEnded);
  }

  public stopPlaybackA(): void {
    globalAudioPlaybackAdapter.stopPlaybackA();
  }

  public stopPlaybackB(): void {
    globalAudioPlaybackAdapter.stopPlaybackB();
  }

  public stopAllPlayback(): void {
    globalAudioPlaybackAdapter.stopAll();
  }
}

export const globalAudioEngine = new AudioEngine();
