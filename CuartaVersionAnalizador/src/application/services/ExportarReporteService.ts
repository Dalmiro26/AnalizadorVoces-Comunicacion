/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Aplicación: Servicio ExportarReporteService.
 */

import { ValidationException } from "../../crossCutting/exceptions/ValidationException";
import { ErrorCodes } from "../../crossCutting/resources/ErrorCodes";
import { TelemetryReportData } from "../dtos/TelemetryReportModel";
import { IExportarReporteService } from "../interfaces/IExportarReporteService";
import { IReportExporter } from "../interfaces/IReportExporter";

export class ExportarReporteService implements IExportarReporteService {
  constructor(
    private readonly pdfExporter: IReportExporter,
    private readonly csvExporter: IReportExporter
  ) {}

  public exportPdfReport(data: TelemetryReportData): void {
    this.validate(data);
    this.pdfExporter.export(data);
  }

  public exportCsvTelemetry(data: TelemetryReportData): void {
    this.validate(data);
    this.csvExporter.export(data);
  }

  private validate(data: TelemetryReportData): void {
    if (!data.metrics || !data.inputFft || !data.outputFft) {
      throw new ValidationException(ErrorCodes.REPORT_DATA_MISSING);
    }
  }
}
