/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Dominio: Entidad resultado de la FFT.
 */

/**
 * Resultado de la Transformada Rápida de Fourier (FFT).
 */
export interface FFTResult {
  /** Magnitud espectral |X[k]| normalizada */
  magnitudes: Float32Array;
  /** Magnitud en escala logarítmica dBFS */
  magnitudesDb: Float32Array;
  /** Vector de frecuencias en Hertz */
  frequencies: Float32Array;
  /** Índice del bin espectral de mayor energía */
  peakIndex: number;
  /** Frecuencia del pico espectral en Hz */
  peakFreq: number;
  /** Magnitud máxima registrada */
  peakMagnitude: number;
}
