/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Dominio: Entidad de métricas acústicas y de telecomunicaciones.
 */

import { VoiceClassification } from "./VoiceClassification";

/**
 * Métricas acústicas y de telecomunicaciones del canal de transmisión.
 */
export interface ChannelMetrics {
  /** Frecuencia fundamental en Hertz */
  f0: number;
  /** Periodo fundamental en milisegundos (T0 = 1 / f0) */
  periodT0: number;
  /** Clasificación fonética de la voz */
  classification: VoiceClassification;
  /** Ancho de banda eficaz B en Hertz */
  effectiveBandwidth: number;
  /** Frecuencia de corte inferior efectiva (Hz) */
  bwInf: number;
  /** Frecuencia de corte superior efectiva (Hz) */
  bwSup: number;
  /** Valor eficaz cuadrático medio (Root Mean Square) */
  rms: number;
  /** Potencia en dBFS (Decibels relative to Full Scale) */
  dbfs: number;
  /** Atenuación total acumulada en decibelios (dB) */
  attenuationDb: number;
  /** Factor de ganancia lineal de amplitud (k = 10^(-A/20)) */
  linearGain: number;
  /** Desviación estándar del ruido gaussiano AWGN */
  noiseSigma: number;
  /** SNR de entrada estimada en dB */
  inputSnrDb: number;
  /** SNR a la salida del canal físico en dB */
  outputSnrDb: number;
  /** Ancho de banda B (Hz) usado en el cálculo de Shannon-Hartley */
  channelBandwidthHz?: number;
  /** Capacidad teórica C en Kbps según Shannon-Hartley */
  shannonCapacityKbps: number;
  /** Eficiencia espectral C / B en bits/s/Hz */
  spectralEfficiency: number;
  /** Estimación perceptual objetiva de calidad PESQ (1.0 - 4.5) */
  pesqScore: number;
}
