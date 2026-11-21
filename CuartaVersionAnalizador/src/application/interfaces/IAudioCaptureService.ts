/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Aplicación: Interfaz IAudioCaptureService.
 */

/** Puerto de salida: captura de audio desde el micrófono. */
export interface IAudioCaptureService {
  /** Inicia el monitoreo en vivo. Devuelve false si no se pudo acceder al micrófono. */
  startLiveMonitoring(
    onDataUpdate?: (timeData: Float32Array, freqData: Float32Array) => void
  ): Promise<boolean>;
  stopLiveMonitoring(): void;
  /** Graba `durationSec` segundos; si se aborta devuelve lo capturado hasta ese momento. */
  recordBuffer(durationSec: number, signal?: AbortSignal): Promise<Float32Array>;
}
