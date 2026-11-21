/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Aplicación: Interfaz IExportarReporteService.
 */

import { TelemetryReportData } from "../dtos/TelemetryReportModel";

export interface IExportarReporteService {
  exportPdfReport(data: TelemetryReportData): void;
  exportCsvTelemetry(data: TelemetryReportData): void;
}
