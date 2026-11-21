/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Dominio: Entidad de parámetros del canal físico.
 */

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
