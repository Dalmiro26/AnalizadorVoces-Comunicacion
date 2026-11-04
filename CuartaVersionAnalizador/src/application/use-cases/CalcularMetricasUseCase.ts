/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Aplicación: Caso de Uso CalcularMetricasUseCase.
 * 
 * Calcula métricas espectrales, f0 y potencia para cualquier búfer de audio.
 */

import {
  ChannelMetrics,
  FFTResult,
} from "../../domain/models/AudioModels";
import { ChannelPhysicsService } from "../../domain/services/ChannelPhysicsService";
import { FourierService } from "../../domain/services/FourierService";
import { PitchDetectorService } from "../../domain/services/PitchDetectorService";
import { ShannonService } from "../../domain/services/ShannonService";

export interface MetricsCalculationResult {
  metrics: ChannelMetrics;
  fft: FFTResult;
}

export class CalcularMetricasUseCase {
  public static execute(signal: Float32Array, sampleRate: number): MetricsCalculationResult {
    if (signal.length === 0) {
      throw new Error("El búfer de señal está vacío.");
    }

    const { rms, dbfs } = ChannelPhysicsService.calculateRMSandDBFS(signal);
    const fft = FourierService.computeFFT(signal, sampleRate, "HAMMING");
    const { f0, periodT0, classification } = PitchDetectorService.detectPitch(signal, sampleRate);
    const { bw, bwInf, bwSup } = FourierService.calculateEffectiveBandwidth(fft);
    const shannon = ShannonService.calculateCapacity(bw, 60);

    const metrics: ChannelMetrics = {
      f0,
      periodT0,
      classification,
      effectiveBandwidth: bw,
      bwInf,
      bwSup,
      rms: Math.round(rms * 1000) / 1000,
      dbfs: Math.round(dbfs * 10) / 10,
      attenuationDb: 0,
      linearGain: 1.0,
      noiseSigma: 0,
      inputSnrDb: 60,
      outputSnrDb: 60,
      shannonCapacityKbps: shannon.capacityKbps,
      spectralEfficiency: shannon.spectralEfficiency,
      pesqScore: 4.5,
    };

    return { metrics, fft };
  }
}
