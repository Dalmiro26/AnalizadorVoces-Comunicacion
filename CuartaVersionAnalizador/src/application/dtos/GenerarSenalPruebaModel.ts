/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Aplicación: DTOs de generación de señales de prueba.
 */

import { AnalyticalSignalType } from "../../domain/services/SignalGeneratorService";

export interface GenerarSenalPruebaRequest {
  type: AnalyticalSignalType;
  durationSec: number;
  sampleRate: number;
}
