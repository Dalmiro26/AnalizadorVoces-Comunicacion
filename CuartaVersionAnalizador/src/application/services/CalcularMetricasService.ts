/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Aplicación: Servicio CalcularMetricasService.
 * 
 * Calcula métricas espectrales, f0 y potencia para cualquier búfer de audio.
 */

import { ChannelMetrics } from "../../domain/entities";
import { ChannelPhysicsService } from "../../domain/services/ChannelPhysicsService";
import { FourierService } from "../../domain/services/FourierService";
import { PitchDetectorService } from "../../domain/services/PitchDetectorService";
import { ShannonService } from "../../domain/services/ShannonService";
import { ValidationException } from "../../crossCutting/exceptions/ValidationException";
import { ErrorCodes } from "../../crossCutting/resources/ErrorCodes";
import { CalcularMetricasResponse } from "../dtos/CalcularMetricasModel";
import { ICalcularMetricasService } from "../interfaces/ICalcularMetricasService";

export class CalcularMetricasService implements ICalcularMetricasService {
  public execute(signal: Float32Array, sampleRate: number): CalcularMetricasResponse {
    if (signal.length === 0) {
      throw new ValidationException(ErrorCodes.EMPTY_SIGNAL);
    }

    const { rms, dbfs } = ChannelPhysicsService.calculateRMSandDBFS(signal);
    // Analizar el tramo de mayor energía (no solo el comienzo del búfer)
    const offset = FourierService.findMostEnergeticWindowOffset(signal, 4096);
    const frame = signal.subarray(offset, offset + 4096);
    const fft = FourierService.computeFFT(frame, sampleRate, "HAMMING");
    const { f0, periodT0, classification } = PitchDetectorService.detectPitch(frame, sampleRate);
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
