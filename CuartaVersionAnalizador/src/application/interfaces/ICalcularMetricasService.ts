/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Aplicación: Interfaz ICalcularMetricasService.
 */

import { CalcularMetricasResponse } from "../dtos/CalcularMetricasModel";

export interface ICalcularMetricasService {
  execute(signal: Float32Array, sampleRate: number): CalcularMetricasResponse;
}
