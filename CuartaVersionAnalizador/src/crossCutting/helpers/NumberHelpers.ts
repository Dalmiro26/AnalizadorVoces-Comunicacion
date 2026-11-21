/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa CrossCutting: Funciones numéricas transversales.
 */

/** Indica si el valor es un número finito (descarta NaN, ±Infinity y no-números). */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Limita `value` al rango [min, max]; si no es un número finito devuelve `fallback`. */
export function clampOr(value: unknown, fallback: number, min: number, max: number): number {
  return isFiniteNumber(value) ? Math.min(max, Math.max(min, value)) : fallback;
}
