/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Aplicación: DTOs del cálculo de métricas.
 */

import { ChannelMetrics, FFTResult } from "../../domain/entities";

export interface CalcularMetricasResponse {
  metrics: ChannelMetrics;
  fft: FFTResult;
}
