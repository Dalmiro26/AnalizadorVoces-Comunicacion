/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Aplicación: DTO con los datos para exportar reportes.
 */

import { ChannelMetrics, ChannelSimulationOptions, FFTResult } from "../../domain/entities";

/**
 * Datos requeridos para exportar reportes técnicos.
 */
export interface TelemetryReportData {
  metrics: ChannelMetrics;
  options: ChannelSimulationOptions;
  sampleRate: number;
  durationSec: number;
  profileName: string;
  originalSignal: Float32Array;
  degradedSignal: Float32Array;
  inputFft: FFTResult;
  outputFft: FFTResult;
}
