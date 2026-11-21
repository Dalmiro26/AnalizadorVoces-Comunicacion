/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Presentación: Manejo centralizado de excepciones.
 *
 * Traduce cualquier error a un mensaje para el usuario: las AppException traen su
 * propio mensaje; el resto se informa con el prefijo del contexto donde ocurrió.
 */

import { AppException } from "../../crossCutting/exceptions/AppException";
import { ErrorCode, ErrorMessages } from "../../crossCutting/resources/ErrorCodes";

/** Mensaje de usuario para un código de error conocido. */
export function messageFor(code: ErrorCode): string {
  return ErrorMessages[code];
}

/**
 * Registra el error en consola y devuelve el mensaje a mostrar.
 * @param context Prefijo descriptivo (ej. "Error al procesar la señal de audio").
 */
export function handleError(err: unknown, context: string): string {
  console.error(`${context}:`, err);
  const detail = err instanceof Error ? err.message : String(err);
  return `${context}: ${detail}`;
}

/**
 * Para errores esperados (AppException) devuelve directamente su mensaje de usuario;
 * para errores inesperados usa `fallback`.
 */
export function userMessage(err: unknown, fallback: string): string {
  console.error(err);
  return err instanceof AppException ? err.message : fallback;
}
