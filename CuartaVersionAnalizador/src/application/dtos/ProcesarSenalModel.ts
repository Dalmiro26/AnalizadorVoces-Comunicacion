/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Aplicación: DTOs del procesamiento de señal.
 */

import { ChannelMetrics, FFTResult } from "../../domain/entities";

export interface ProcesarSenalResponse {
  degradedSignal: Float32Array;
  metrics: ChannelMetrics;
  inputFft: FFTResult;
  outputFft: FFTResult;
}
