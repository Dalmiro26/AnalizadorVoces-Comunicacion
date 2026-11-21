/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Presentación (servicios del navegador): Exportador de Telemetría en CSV.
 */

import { TelemetryReportData } from "../../application/dtos/TelemetryReportModel";
import { IReportExporter } from "../../application/interfaces/IReportExporter";

export class CsvReportExporter implements IReportExporter {
  public export(data: TelemetryReportData): void {
    const { originalSignal, degradedSignal, sampleRate, inputFft, outputFft } = data;

    const rows: string[] = [];
    rows.push("# DSP-LAB TELECOM CORE - EXPORTACIÓN TELEMÉTRICA");
    rows.push(`# Fs: ${sampleRate} Hz`);
    rows.push(`# Fecha: ${new Date().toISOString()}`);
    rows.push("");
    rows.push("Tiempo_s,Amplitud_CH1_Original,Amplitud_CH2_Degradada");

    // Limitar a 2000 muestras representativas para descarga ágil
    const step = Math.max(1, Math.floor(originalSignal.length / 2000));
    for (let i = 0; i < originalSignal.length; i += step) {
      const t = (i / sampleRate).toFixed(6);
      const s1 = originalSignal[i].toFixed(6);
      const s2 = degradedSignal[i] !== undefined ? degradedSignal[i].toFixed(6) : "0";
      rows.push(`${t},${s1},${s2}`);
    }

    rows.push("");
    rows.push("# ESPECTRO FFT (FRECUENCIA Y MAGNITUD)");
    rows.push("Frecuencia_Hz,Magnitud_CH1_dBFS,Magnitud_CH2_dBFS");

    const fftLen = Math.min(inputFft.frequencies.length, outputFft.frequencies.length);
    for (let k = 0; k < fftLen; k += 2) {
      const f = inputFft.frequencies[k].toFixed(2);
      const m1 = inputFft.magnitudesDb[k].toFixed(2);
      const m2 = outputFft.magnitudesDb[k].toFixed(2);
      rows.push(`${f},${m1},${m2}`);
    }

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `telemetria_dsp_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
