/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Dominio: Servicio del Teorema de Capacidad de Canal de Shannon-Hartley.
 * 
 * Teorema:
 * C = B * log2(1 + S/N)
 * Donde:
 * - C: Capacidad teórica máxima en bits por segundo (bps).
 * - B: Ancho de banda analógico efectivo del canal en Hertz (Hz).
 * - S/N: Relación señal a ruido en escala lineal (S/N = 10^(SNR_dB / 10)).
 */

export interface ShannonCapacityResult {
  /** Capacidad teórica en bits por segundo (bps) */
  capacityBps: number;
  /** Capacidad teórica en kilobits por segundo (Kbps) */
  capacityKbps: number;
  /** Eficiencia espectral en bits/s/Hz (C / B) */
  spectralEfficiency: number;
  /** SNR lineal utilizado en el cálculo */
  snrLinear: number;
}

export interface ShannonCurvePoint {
  snrDb: number;
  capacityKbps: number;
}

export class ShannonService {
  /**
   * Calcula la capacidad de canal según Shannon-Hartley.
   * @param bandwidthHz Ancho de banda B en Hertz (debe ser > 0)
   * @param snrDb Relación señal a ruido en decibelios (dB)
   */
  public static calculateCapacity(bandwidthHz: number, snrDb: number): ShannonCapacityResult {
    const B = Math.max(1, bandwidthHz);
    // Convertir SNR de dB a escala lineal: S/N = 10^(SNR_dB / 10)
    const snrLinear = Math.max(1e-6, Math.pow(10, snrDb / 10));

    // C = B * log2(1 + S/N) = B * (ln(1 + S/N) / ln(2))
    const capacityBps = B * (Math.log(1 + snrLinear) / Math.LN2);
    const capacityKbps = Math.round((capacityBps / 1000) * 10) / 10;
    const spectralEfficiency = Math.round((capacityBps / B) * 10) / 10;

    return {
      capacityBps,
      capacityKbps,
      spectralEfficiency,
      snrLinear,
    };
  }

  /**
   * Genera una serie de puntos para trazar la curva teórica de Shannon (C vs SNR)
   * en un rango típico de ingeniería (ej. -20 dB a +40 dB).
   */
  public static generateCapacityCurve(
    bandwidthHz: number,
    minSnrDb: number = -20,
    maxSnrDb: number = 40,
    stepDb: number = 2
  ): ShannonCurvePoint[] {
    const points: ShannonCurvePoint[] = [];
    for (let snr = minSnrDb; snr <= maxSnrDb; snr += stepDb) {
      const { capacityKbps } = this.calculateCapacity(bandwidthHz, snr);
      points.push({ snrDb: snr, capacityKbps });
    }
    return points;
  }
}
