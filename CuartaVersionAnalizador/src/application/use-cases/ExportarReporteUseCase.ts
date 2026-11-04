/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Aplicación: Caso de Uso ExportarReporteUseCase.
 */

import { TelemetryReportData } from "../../domain/models/AudioModels";

export interface IReportExporter {
  exportPdf(data: TelemetryReportData): void;
  exportCsv(data: TelemetryReportData): void;
}

export class ExportarReporteUseCase {
  constructor(private readonly exporter: IReportExporter) {}

  public exportPdfReport(data: TelemetryReportData): void {
    this.exporter.exportPdf(data);
  }

  public exportCsvTelemetry(data: TelemetryReportData): void {
    this.exporter.exportCsv(data);
  }
}
