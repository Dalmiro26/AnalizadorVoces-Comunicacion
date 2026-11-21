/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Aplicación: Interfaz IAudioContextService.
 */

/** Puerto de salida: administración del AudioContext del navegador. */
export interface IAudioContextService {
  /** Frecuencia de muestreo del dispositivo de audio en Hz. */
  readonly sampleRate: number;
  /** Reanuda el contexto de forma sincrónica (debe llamarse dentro del gesto del usuario). */
  resumeSynchronously(): void;
  /** Reanuda el contexto y espera a que esté activo. */
  ensureResumed(): Promise<void>;
}
