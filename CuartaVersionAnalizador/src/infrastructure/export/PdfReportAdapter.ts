/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Infraestructura: Adaptador de Generación de Reportes Técnicos en PDF.
 */

import { jsPDF } from "jspdf";
import { TelemetryReportData } from "../../domain/models/AudioModels";

export class PdfReportAdapter {
  public static generatePdf(data: TelemetryReportData): void {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const { metrics, options, sampleRate, durationSec, profileName } = data;
    const now = new Date();
    const dateStr = now.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // 1. Cabecera Institucional Académica
    doc.setFillColor(15, 19, 28);
    doc.rect(0, 0, 210, 36, "F");

    doc.setTextColor(0, 229, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("DSP-LAB — TELECOM CORE", 14, 15);

    doc.setTextColor(195, 245, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Reporte Técnico: Simulación de Canal y Análisis Espectral de Señales", 14, 22);

    doc.setTextColor(132, 147, 150);
    doc.setFontSize(8);
    doc.text(`Fecha: ${dateStr}  |  Estación: 04-DSP  |  Fs: ${sampleRate} Hz (16-bit PCM)`, 14, 30);

    // 2. Parámetros del Entorno
    let y = 46;
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("1. PARÁMETROS DEL ENTORNO Y CANAL FÍSICO", 14, y);

    y += 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y, 196, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    const col1 = 14;
    const col2 = 110;

    doc.text(`• Perfil de Canal: ${profileName}`, col1, y);
    doc.text(`• Distancia de Enlace: ${options.distanceKm.toFixed(1)} km (α = ${options.alphaDbPerKm} dB/km)`, col2, y);
    y += 5.5;

    doc.text(`• Duración de Captura: ${durationSec.toFixed(1)} segundos`, col1, y);
    doc.text(`• Atenuación Acumulada: -${metrics.attenuationDb.toFixed(1)} dB (k = ${metrics.linearGain.toFixed(3)})`, col2, y);
    y += 5.5;

    doc.text(`• Filtro Telefónico: ${options.applyTelephoneFilter ? "Activo (300 - 3400 Hz, Butterworth)" : "Bypass (Paso Directo)"}`, col1, y);
    doc.text(`• Ruido AWGN Inyectado: ${options.injectedSnrDb.toFixed(1)} dB SNR (σ² = ${(metrics.noiseSigma * metrics.noiseSigma).toFixed(4)} V²)`, col2, y);
    y += 5.5;

    doc.text(`• Modelo de Desvanecimiento: ${options.fadingModel.toUpperCase()}`, col1, y);
    doc.text(`• Señal Analizada: Formato Linear PCM Mono`, col2, y);
    y += 10;

    // 3. Métricas Extraídas
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("2. TELEMETRÍA Y MÉTRICAS EXTRAÍDAS", 14, y);

    y += 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y, 196, y);
    y += 6;

    const drawMetricBox = (xPos: number, yPos: number, title: string, value: string, subtitle: string) => {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(xPos, yPos, 42, 20, 1.5, 1.5, "F");
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(xPos, yPos, 42, 20, 1.5, 1.5, "D");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(title.toUpperCase(), xPos + 3, yPos + 4.5);

      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(value, xPos + 3, yPos + 11.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(subtitle, xPos + 3, yPos + 17);
    };

    drawMetricBox(14, y, "Frec. Fundamental", `${metrics.f0.toFixed(1)} Hz`, `Periodo T₀: ${metrics.periodT0.toFixed(2)} ms`);
    drawMetricBox(59, y, "Clasificación", metrics.classification.category, `Timbre: ${metrics.classification.timbre}`);
    drawMetricBox(104, y, "Ancho Banda (B)", `${metrics.effectiveBandwidth} Hz`, `Rango: ${metrics.bwInf}-${metrics.bwSup} Hz`);
    drawMetricBox(149, y, "Potencia RMS", `${metrics.dbfs.toFixed(1)} dBFS`, `RMS: ${metrics.rms.toFixed(3)} V`);
    y += 24;

    drawMetricBox(14, y, "Capacidad (C)", `${metrics.shannonCapacityKbps.toFixed(1)} Kbps`, `Shannon-Hartley`);
    drawMetricBox(59, y, "Eficiencia (C/B)", `${metrics.spectralEfficiency.toFixed(1)} b/s/Hz`, `Límite Teórico`);
    drawMetricBox(104, y, "SNR Salida", `${metrics.outputSnrDb.toFixed(1)} dB`, `Relación S/N real`);
    drawMetricBox(149, y, "Calidad PESQ", `${metrics.pesqScore.toFixed(2)} / 4.5`, `Puntuación Objetiva`);
    y += 28;

    // 4. Fundamentos Teóricos
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("3. FUNDAMENTO TEÓRICO Y FÓRMULAS APLICADAS", 14, y);

    y += 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y, 196, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    const formulas = [
      {
        name: "• Teorema de Shannon-Hartley:",
        desc: "C = B · log₂(1 + S/N) [bps]. Cota teórica de capacidad de información libre de errores sobre canal analógico con ancho de banda B y ruido AWGN.",
      },
      {
        name: "• Atenuación en Líneas de Transmisión:",
        desc: "A_dB = α · d; Factor lineal: k = 10^(-A_dB / 20). Modela la disipación óhmica y dieléctrica acumulada a lo largo del cable o fibra.",
      },
      {
        name: "• Ruido Blanco Gaussiano Aditivo (AWGN):",
        desc: "Generado vía Transformada de Box-Muller: z = √(-2·ln(u₁))·cos(2π·u₂)·σ. Posee densidad espectral de potencia constante N₀/2 y distribución normal N(0, σ²).",
      },
      {
        name: "• Filtro Telefónico Paso-Banda (Norma ITU-T G.711):",
        desc: "Biquad IIR Butterworth de 4to orden con frecuencias de corte fc1 = 300 Hz y fc2 = 3,400 Hz. Limita el ancho de banda útil a B = 3,100 Hz.",
      },
    ];

    formulas.forEach((item) => {
      doc.setFont("helvetica", "bold");
      doc.text(item.name, 14, y);
      y += 4;
      doc.setFont("helvetica", "normal");
      const splitText = doc.splitTextToSize(item.desc, 182);
      doc.text(splitText, 18, y);
      y += splitText.length * 3.8 + 2;
    });

    // Pie de página
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 280, 196, 280);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("DSP-LAB Telecom Core • Desarrollado para Comunicaciones de Datos • Procesamiento 100% en el Navegador", 14, 285);
    doc.text("Página 1 de 1", 185, 285);

    doc.save(`DSP_Reporte_Canal_${now.toISOString().slice(0, 10)}.pdf`);
  }
}
