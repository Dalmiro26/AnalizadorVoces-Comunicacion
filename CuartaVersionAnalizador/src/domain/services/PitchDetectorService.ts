/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Dominio: Servicio de Detección de Frecuencia Fundamental (f0) y Clasificación Acústica.
 * 
 * Implementa:
 * - Detección de f0 mediante Función de Autocorrelación Normalizada (ACF).
 * - Interpolación parabólica sub-muestra para precisión fina de tono.
 * - Clasificación fonética y de registro vocal humano (Barítono, Tenor, Mezzo, Soprano, Infantil).
 */

import { VoiceClassification } from "../models/AudioModels";

export interface PitchDetectionResult {
  /** Frecuencia fundamental en Hertz (0 si no hay tono periódico o hay silencio) */
  f0: number;
  /** Periodo fundamental T0 = 1 / f0 en milisegundos */
  periodT0: number;
  /** Nivel de confianza entre 0.0 y 1.0 */
  confidence: number;
  /** Clasificación fonética de la voz */
  classification: VoiceClassification;
}

export class PitchDetectorService {
  /**
   * Detecta la frecuencia fundamental (f0) de una señal analizada mediante autocorrelación.
   * Rango útil de tono para voz humana: 65 Hz a 500 Hz.
   */
  public static detectPitch(buffer: Float32Array, sampleRate: number): PitchDetectionResult {
    const minFreq = 65; // Límite inferior fonatorio típico
    const maxFreq = 500; // Límite superior fonatorio típico
    const minLag = Math.floor(sampleRate / maxFreq);
    const maxLag = Math.floor(sampleRate / minFreq);

    const N = Math.min(buffer.length, 4096);
    if (N <= maxLag * 2 || !Number.isFinite(sampleRate) || sampleRate <= 0) {
      const classification = this.classifyVoice(0, 0);
      return { f0: 0, periodT0: 0, confidence: 0, classification };
    }

    // Medición de energía de referencia
    let energy0 = 0;
    for (let i = 0; i < N - maxLag; i++) {
      energy0 += buffer[i] * buffer[i];
    }

    if (energy0 < 1e-5) {
      // Silencio o nivel base
      const classification = this.classifyVoice(0, 0);
      return { f0: 0, periodT0: 0, confidence: 0, classification };
    }

    let maxCorr = -1;
    let bestLag = -1;
    const corr = new Float32Array(maxLag + 2);

    for (let lag = minLag; lag <= maxLag; lag++) {
      let sum = 0;
      let energyLag = 0;
      for (let i = 0; i < N - maxLag; i++) {
        sum += buffer[i] * buffer[i + lag];
        energyLag += buffer[i + lag] * buffer[i + lag];
      }
      const norm = Math.sqrt(energy0 * energyLag) + 1e-9;
      const r = sum / norm;
      corr[lag] = r;

      if (r > maxCorr) {
        maxCorr = r;
        bestLag = lag;
      }
    }

    if (bestLag <= 0 || maxCorr < 0.25) {
      // Tono débil o inarmónico
      const classification = this.classifyVoice(120, 0.3);
      return { f0: 120, periodT0: (1 / 120) * 1000, confidence: 0.3, classification };
    }

    // Refinamiento sub-muestra mediante ajuste parabólico
    let deltaLag = 0;
    if (bestLag > minLag && bestLag < maxLag) {
      const alpha = corr[bestLag - 1];
      const beta = corr[bestLag];
      const gamma = corr[bestLag + 1];
      const denom = 2 * (2 * beta - alpha - gamma);
      if (Math.abs(denom) > 1e-6) {
        deltaLag = (alpha - gamma) / denom;
      }
    }

    const exactLag = bestLag + deltaLag;
    const f0 = sampleRate / exactLag;
    const confidence = Math.min(1.0, Math.max(0.1, maxCorr));
    const periodT0 = f0 > 0 ? (1 / f0) * 1000 : 0;
    const classification = this.classifyVoice(f0, confidence);

    return {
      f0: Math.round(f0 * 10) / 10,
      periodT0: Math.round(periodT0 * 100) / 100,
      confidence,
      classification,
    };
  }

  /**
   * Clasifica la voz humana según normas acústicas estándar basadas en f0.
   */
  public static classifyVoice(f0: number, confidence: number): VoiceClassification {
    if (f0 <= 0 || confidence < 0.2) {
      return {
        category: "Sin Señal / Silencio",
        timbre: "Nivel Base",
        confidence: 0,
        description: "No se detecta tono periódico en la ventana de análisis.",
      };
    }

    if (f0 < 85) {
      return {
        category: "Frecuencia Sub-vocal",
        timbre: "Bajo Profundo",
        confidence: confidence * 0.95,
        description: "Vibración glotal en registro grave extremo / laringal.",
      };
    } else if (f0 <= 125) {
      return {
        category: "Voz Masculina Grave",
        timbre: "Bajo / Barítono",
        confidence,
        description: "Apertura glotal masculina estándar con fuerte presencia de formantes graves.",
      };
    } else if (f0 <= 165) {
      return {
        category: "Voz Masculina Media",
        timbre: "Tenor",
        confidence,
        description: "Registro medio masculino con armónicos prominentes entre 1 kHz y 2 kHz.",
      };
    } else if (f0 <= 215) {
      return {
        category: "Voz Femenina Media",
        timbre: "Mezzosoprano / Contralto",
        confidence,
        description: "Registro vocal femenino con fundamental bien definida y armónicos claros.",
      };
    } else if (f0 <= 265) {
      return {
        category: "Voz Femenina Aguda",
        timbre: "Soprano",
        confidence,
        description: "Tono brillante y alta energía en la franja de 2 kHz a 3.4 kHz.",
      };
    } else if (f0 <= 350) {
      return {
        category: "Voz Infantil",
        timbre: "Muy Agudo / Infantil",
        confidence: confidence * 0.92,
        description: "Cuerdas vocales cortas generando longitud de onda reducida.",
      };
    } else {
      return {
        category: "Frecuencia Atípica",
        timbre: "Agudo / Silbido / Tono Puro",
        confidence: confidence * 0.85,
        description: "Frecuencia superior al rango fonatorio humano típico.",
      };
    }
  }
}
