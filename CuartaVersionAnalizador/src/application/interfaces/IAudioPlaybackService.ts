/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Aplicación: Interfaz IAudioPlaybackService.
 */

export interface PlaybackControl {
  stop: () => void;
}

/** Puerto de salida: reproducción dual (Canal A original / Canal B degradado). */
export interface IAudioPlaybackService {
  playChannelA(samples: Float32Array, sampleRate: number, onEnded?: () => void): PlaybackControl;
  playChannelB(samples: Float32Array, sampleRate: number, onEnded?: () => void): PlaybackControl;
  stopPlaybackA(): void;
  stopPlaybackB(): void;
  stopAll(): void;
}
