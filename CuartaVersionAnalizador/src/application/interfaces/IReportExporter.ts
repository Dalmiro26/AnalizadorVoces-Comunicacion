/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Aplicación: Interfaz IReportExporter.
 */

import { TelemetryReportData } from "../dtos/TelemetryReportModel";

/** Puerto de salida implementado por los exportadores de la capa de presentación (PDF, CSV). */
export interface IReportExporter {
  export(data: TelemetryReportData): void;
}
