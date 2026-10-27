/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Dominio: Servicio de Transformada Rápida de Fourier (FFT) y Ventaneo Temporal.
 * 
 * Implementa:
 * - Algoritmo Cooley-Tukey Radix-2 Decimation-In-Time (DIT).
 * - Ventaneo temporal Hamming, Hanning y Rectangular.
 * - Tablas trigonométricas (Twiddle Factors) precalculadas para máxima eficiencia.
 * - Cálculo de magnitudes normalizadas y escala logarítmica dBFS.
 * - Cálculo del Ancho de Banda Eficaz (B) por concentración espectral de energía.
 */

import { FFTResult } from "../models/AudioModels";

interface FFTLookupTable {
  bitRev: Uint16Array;
  twiddleR: Float32Array;
  twiddleI: Float32Array;
  windowHamming: Float32Array;
  windowHanning: Float32Array;
}

export type WindowFunctionType = "HAMMING" | "HANNING" | "RECT";

export class FourierService {
  private static lookupCache = new Map<number, FFTLookupTable>();

  /**
   * Obtiene o genera tablas de consulta aceleradas para longitud N (potencia de 2).
   */
  private static getLookupTable(N: number): FFTLookupTable {
    let lookup = this.lookupCache.get(N);
    if (lookup) return lookup;

    const bitRev = new Uint16Array(N);
    let j = 0;
    for (let i = 0; i < N - 1; i++) {
      bitRev[i] = j;
      let k = N >> 1;
      while (k <= j) {
        j -= k;
        k >>= 1;
      }
      j += k;
    }
    bitRev[N - 1] = j;

    const halfN = N >> 1;
    const twiddleR = new Float32Array(halfN);
    const twiddleI = new Float32Array(halfN);
    for (let k = 0; k < halfN; k++) {
      const angle = (-2 * Math.PI * k) / N;
      twiddleR[k] = Math.cos(angle);
      twiddleI[k] = Math.sin(angle);
    }

    const windowHamming = new Float32Array(N);
    const windowHanning = new Float32Array(N);
    const factor = (2 * Math.PI) / (N - 1);
    for (let n = 0; n < N; n++) {
      // Ventana Hamming: 0.54 - 0.46 * cos(2*pi*n / (N - 1))
      windowHamming[n] = 0.54 - 0.46 * Math.cos(factor * n);
      // Ventana Hanning: 0.50 - 0.50 * cos(2*pi*n / (N - 1))
      windowHanning[n] = 0.50 - 0.50 * Math.cos(factor * n);
    }

    lookup = { bitRev, twiddleR, twiddleI, windowHamming, windowHanning };
    this.lookupCache.set(N, lookup);
    return lookup;
  }

  /**
   * Aplica ventana de Hamming sobre una copia independiente de las muestras.
   */
  public static applyHammingWindow(buffer: Float32Array): Float32Array {
    const N = buffer.length;
    const windowed = new Float32Array(N);
    const factor = (2 * Math.PI) / (N - 1);
    for (let n = 0; n < N; n++) {
      const w = 0.54 - 0.46 * Math.cos(factor * n);
      windowed[n] = buffer[n] * w;
    }
    return windowed;
  }

  /**
   * Calcula la FFT de una señal aplicando Cooley-Tukey Radix-2.
   * Complejidad: O(N log2 N).
   * @param signal Muestras temporales de entrada x[n]
   * @param sampleRate Frecuencia de muestreo en Hz
   * @param windowType Tipo de ventaneo a aplicar (Hamming por defecto)
   */
  public static computeFFT(
    signal: Float32Array,
    sampleRate: number,
    windowType: WindowFunctionType = "HAMMING"
  ): FFTResult {
    // Asegurar tamaño potencia de 2 (máximo 4096 para respuesta en tiempo real)
    const maxN = Math.min(signal.length, 4096);
    const N = 1 << Math.floor(Math.log2(maxN));

    if (N <= 0 || !Number.isFinite(sampleRate) || sampleRate <= 0) {
      return {
        magnitudes: new Float32Array(0),
        magnitudesDb: new Float32Array(0),
        frequencies: new Float32Array(0),
        peakIndex: 0,
        peakFreq: 0,
        peakMagnitude: 0,
      };
    }

    const lookup = this.getLookupTable(N);
    const real = new Float32Array(N);
    const imag = new Float32Array(N);

    // Selección de vector de ventana
    const win =
      windowType === "HAMMING"
        ? lookup.windowHamming
        : windowType === "HANNING"
        ? lookup.windowHanning
        : null;

    // Inversión de bits y ponderación de ventana en una sola pasada
    const bitRev = lookup.bitRev;
    for (let i = 0; i < N; i++) {
      const targetIdx = bitRev[i];
      const w = win ? win[i] : 1.0;
      real[targetIdx] = signal[i] * w;
    }

    // Iteraciones Radix-2 Cooley-Tukey con mariposas (Decimation In Time)
    for (let len = 2; len <= N; len <<= 1) {
      const halfLen = len >> 1;
      const stepTwiddle = N / len;

      for (let i = 0; i < N; i += len) {
        for (let k = 0; k < halfLen; k++) {
          const twiddleIdx = k * stepTwiddle;
          const wR = lookup.twiddleR[twiddleIdx];
          const wI = lookup.twiddleI[twiddleIdx];

          const idxEven = i + k;
          const idxOdd = idxEven + halfLen;

          const uR = real[idxEven];
          const uI = imag[idxEven];
          const vR = real[idxOdd] * wR - imag[idxOdd] * wI;
          const vI = real[idxOdd] * wI + imag[idxOdd] * wR;

          real[idxEven] = uR + vR;
          imag[idxEven] = uI + vI;
          real[idxOdd] = uR - vR;
          imag[idxOdd] = uI - vI;
        }
      }
    }

    // Espectro unilateral de 0 a Fs/2 (Nyquist: N/2 primeros bins)
    const halfN = N >> 1;
    const magnitudes = new Float32Array(halfN);
    const magnitudesDb = new Float32Array(halfN);
    const frequencies = new Float32Array(halfN);

    const freqStep = sampleRate / N;
    let maxMag = 0;
    let peakIdx = 1;
    const twoOverN = 2.0 / N;

    for (let k = 0; k < halfN; k++) {
      frequencies[k] = k * freqStep;
      // Normalización de energía FFT: magnitud = 2 * sqrt(R^2 + I^2) / N
      const mag = Math.hypot(real[k], imag[k]) * twoOverN;
      magnitudes[k] = mag;

      // Magnitud logarítmica en dBFS relativa a 1.0 (evitando log(0))
      const db = 20 * Math.log10(Math.max(mag, 1e-6));
      magnitudesDb[k] = db;

      // Descartar componente continua DC (k = 0) para el pico fundamental
      if (k > 1 && mag > maxMag && frequencies[k] <= 4500) {
        maxMag = mag;
        peakIdx = k;
      }
    }

    return {
      magnitudes,
      magnitudesDb,
      frequencies,
      peakIndex: peakIdx,
      peakFreq: frequencies[peakIdx],
      peakMagnitude: maxMag,
    };
  }

  /**
   * Cálculo del Ancho de Banda Eficaz (B) por concentración de energía espectral.
   * Identifica el rango [bwInf, bwSup] con energía superior al umbral relativo.
   */
  public static calculateEffectiveBandwidth(
    fft: FFTResult,
    thresholdFraction: number = 0.1
  ): { bw: number; bwInf: number; bwSup: number } {
    const { frequencies, magnitudes, peakMagnitude } = fft;
    if (frequencies.length === 0 || magnitudes.length === 0) {
      return { bw: 3100, bwInf: 300, bwSup: 3400 };
    }

    const threshold = peakMagnitude * thresholdFraction;
    let firstIdx = -1;
    let lastIdx = -1;

    for (let i = 1; i < magnitudes.length; i++) {
      if (frequencies[i] > 6000) break; // Limitar a banda audio útil
      if (magnitudes[i] >= threshold) {
        if (firstIdx === -1) firstIdx = i;
        lastIdx = i;
      }
    }

    if (firstIdx === -1 || lastIdx === -1 || lastIdx <= firstIdx) {
      return { bw: 3100, bwInf: 300, bwSup: 3400 };
    }

    const bwInf = Math.max(50, Math.round(frequencies[firstIdx]));
    const bwSup = Math.min(6000, Math.round(frequencies[lastIdx]));
    const bw = Math.max(100, bwSup - bwInf);

    return { bw, bwInf, bwSup };
  }
}
