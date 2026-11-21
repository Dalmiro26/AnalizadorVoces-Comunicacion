/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa CrossCutting: Códigos de error y mensajes de usuario.
 */

export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  EMPTY_SIGNAL: "EMPTY_SIGNAL",
  INVALID_SAMPLE_RATE: "INVALID_SAMPLE_RATE",
  REPORT_DATA_MISSING: "REPORT_DATA_MISSING",
  AUDIO_NOT_SUPPORTED: "AUDIO_NOT_SUPPORTED",
  AUDIO_CONTEXT_FAILED: "AUDIO_CONTEXT_FAILED",
  MICROPHONE_ACCESS_DENIED: "MICROPHONE_ACCESS_DENIED",
  EMPTY_CAPTURE: "EMPTY_CAPTURE",
  PLAYBACK_FAILED: "PLAYBACK_FAILED",
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export const ErrorMessages: Record<ErrorCode, string> = {
  VALIDATION_ERROR: "Los datos de entrada no son válidos.",
  EMPTY_SIGNAL: "La señal de entrada no contiene muestras para procesar.",
  INVALID_SAMPLE_RATE: "Frecuencia de muestreo inválida.",
  REPORT_DATA_MISSING: "No hay métricas calculadas para exportar.",
  AUDIO_NOT_SUPPORTED:
    "Tu navegador no es compatible con la Web Audio API. Actualiza tu navegador para continuar.",
  AUDIO_CONTEXT_FAILED: "No se pudo iniciar el sistema de audio.",
  MICROPHONE_ACCESS_DENIED:
    "No se pudo acceder al micrófono. Por favor permite los permisos de audio en tu navegador.",
  EMPTY_CAPTURE: "La captura no registró muestras de audio. Intenta nuevamente.",
  PLAYBACK_FAILED: "No se pudo iniciar la reproducción de audio en este dispositivo.",
  UNEXPECTED_ERROR: "Ocurrió un error inesperado.",
};
