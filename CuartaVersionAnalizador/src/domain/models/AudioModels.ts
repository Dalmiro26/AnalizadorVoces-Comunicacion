/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Dominio: Entidades, Interfaces y Modelos de Tipos Puros de TypeScript.
 * Sin dependencias de frameworks ni de React.
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

/**
 * Clasificación acústica y fonética de la voz humana.
 */
export interface VoiceClassification {
  /** Categoría vocal (ej. 'Voz Masculina Grave', 'Voz Femenina Media', etc.) */
  category: string;
  /** Timbre o registro (ej. 'Barítono', 'Tenor', 'Soprano') */
  timbre: string;
  /** Coeficiente de confianza estadística entre 0 y 1 */
  confidence: number;
  /** Descripción técnica del registro fonatorio */
  description: string;
}

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
  /** Capacidad teórica C en Kbps según Shannon-Hartley */
  shannonCapacityKbps: number;
  /** Eficiencia espectral C / B en bits/s/Hz */
  spectralEfficiency: number;
  /** Estimación perceptual objetiva de calidad PESQ (1.0 - 4.5) */
  pesqScore: number;
}

/**
 * Parámetros de configuración del modelo físico de canal.
 */
export interface ChannelSimulationOptions {
  /** Distancia del enlace de transmisión en kilómetros (0 a 50 km) */
  distanceKm: number;
  /** Atenuación específica del medio de transmisión en dB/km (alfa) */
  alphaDbPerKm: number;
  /** Nivel de SNR inyectado por ruido blanco AWGN en dB */
  injectedSnrDb: number;
  /** Band-pass telefónico ITU-T G.711 (300 Hz a 3400 Hz) */
  applyTelephoneFilter: boolean;
  /** Modelo estocástico de desvanecimiento por multitrayecto */
  fadingModel: "none" | "rayleigh" | "rician";
  /** Frecuencia de muestreo en Hz (ej. 44100) */
  sampleRate: number;
}

/**
 * Datos requeridos para exportar reportes técnicos.
 */
export interface TelemetryReportData {
  metrics: ChannelMetrics;
  options: ChannelSimulationOptions;
  sampleRate: number;
  durationSec: number;
  profileName: string;
  originalSignal: Float32Array;
  degradedSignal: Float32Array;
  inputFft: FFTResult;
  outputFft: FFTResult;
}
