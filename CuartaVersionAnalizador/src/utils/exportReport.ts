/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture Adapter
 * 
 * Este archivo actúa como puente de compatibilidad hacia los adaptadores de exportación
 * en la Capa de Infraestructura (src/infrastructure/export).
 */

import { TelemetryReportData } from "../domain/models/AudioModels";
import { PdfReportAdapter } from "../infrastructure/export/PdfReportAdapter";
import { CsvExportAdapter } from "../infrastructure/export/CsvExportAdapter";

export type ExportReportData = TelemetryReportData;

export function generateTechnicalPdfReport(data: TelemetryReportData): void {
  PdfReportAdapter.generatePdf(data);
}

export function exportTelemetryCsv(data: TelemetryReportData): void {
  CsvExportAdapter.exportCsv(data);
}
