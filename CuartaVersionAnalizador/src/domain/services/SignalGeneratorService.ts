/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Dominio: Servicio Generador de Señales Analíticas de Prueba.
 * 
 * Permite realizar pruebas y simulaciones de laboratorio sin requerir micrófono:
 * - Síntesis armónica de voz masculina (Barítono f0 = 120 Hz con formantes F1, F2, F3).
 * - Síntesis armónica de voz femenina (Soprano f0 = 220 Hz con formantes F1, F2, F3).
 * - Tono puro de referencia de 1.000 Hz para calibración.
 * - Barrido frecuencial (Chirp) de 100 Hz a 4.000 Hz para análisis de respuesta al impulso.
 * - Tonos multifrecuencia DTMF estándar para telecomunicaciones.
 */

export type AnalyticalSignalType =
  | "male_voice"
  | "female_voice"
  | "sine_1khz"
  | "chirp_sweep"
  | "dtmf";

export class SignalGeneratorService {
  /**
   * Genera un búfer de señal analítica en formato Float32Array.
   */
  public static generateSignal(
    type: AnalyticalSignalType,
    durationSec: number = 5,
    sampleRate: number = 44100
  ): Float32Array {
    const totalSamples = Math.floor(Math.max(0.5, durationSec) * sampleRate);
    const signal = new Float32Array(totalSamples);

    if (type === "male_voice") {
      const f0 = 120;
      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const envelope = 0.6 + 0.4 * Math.sin(2 * Math.PI * 1.5 * t);
        const val =
          0.5 * Math.sin(2 * Math.PI * f0 * t) +
          0.35 * Math.sin(2 * Math.PI * 2 * f0 * t) +
          0.25 * Math.sin(2 * Math.PI * 3 * f0 * t) +
          0.4 * Math.sin(2 * Math.PI * 6 * f0 * t) + // F1 (~720Hz)
          0.3 * Math.sin(2 * Math.PI * 10 * f0 * t) + // F2 (~1200Hz)
          0.15 * Math.sin(2 * Math.PI * 21 * f0 * t); // F3 (~2520Hz)
        signal[i] = val * envelope * 0.45;
      }
    } else if (type === "female_voice") {
      const f0 = 220;
      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const envelope = 0.65 + 0.35 * Math.sin(2 * Math.PI * 1.8 * t);
        const val =
          0.55 * Math.sin(2 * Math.PI * f0 * t) +
          0.4 * Math.sin(2 * Math.PI * 2 * f0 * t) +
          0.35 * Math.sin(2 * Math.PI * 4 * f0 * t) + // F1 (~880Hz)
          0.3 * Math.sin(2 * Math.PI * 8 * f0 * t) + // F2 (~1760Hz)
          0.18 * Math.sin(2 * Math.PI * 13 * f0 * t); // F3 (~2860Hz)
        signal[i] = val * envelope * 0.45;
      }
    } else if (type === "sine_1khz") {
      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        signal[i] = 0.6 * Math.sin(2 * Math.PI * 1000 * t);
      }
    } else if (type === "chirp_sweep") {
      const fStart = 100;
      const fEnd = 4000;
      const k = (fEnd - fStart) / durationSec;
      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const freq = fStart + 0.5 * k * t;
        signal[i] = 0.5 * Math.sin(2 * Math.PI * freq * t);
      }
    } else if (type === "dtmf") {
      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const digitMod = Math.floor(t * 2) % 2;
        const tone = 0.35 * Math.sin(2 * Math.PI * 852 * t) + 0.35 * Math.sin(2 * Math.PI * 1477 * t);
        signal[i] = digitMod === 0 ? tone : 0;
      }
    }

    return signal;
  }
}
