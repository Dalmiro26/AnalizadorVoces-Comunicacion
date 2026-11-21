/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Dominio: Entidad de clasificación vocal.
 */

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
