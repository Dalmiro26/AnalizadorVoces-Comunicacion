/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Aplicación: Caso de Uso ProcesarSenalUseCase.
 * 
 * Orquesta la simulación del canal físico o paso directo, cálculo de FFT Cooley-Tukey,
 * estimación de tono f0 por autocorrelación, ancho de banda eficaz y Teorema de Shannon-Hartley.
 */

import {
  ChannelMetrics,
  ChannelSimulationOptions,
  FFTResult,
} from "../../domain/models/AudioModels";
import { ChannelPhysicsService } from "../../domain/services/ChannelPhysicsService";
import { FourierService } from "../../domain/services/FourierService";
import { PitchDetectorService } from "../../domain/services/PitchDetectorService";
import { ShannonService } from "../../domain/services/ShannonService";

export interface ProcessSignalOutput {
  degradedSignal: Float32Array;
  metrics: ChannelMetrics;
  inputFft: FFTResult;
  outputFft: FFTResult;
}

export class ProcesarSenalUseCase {
  /**
   * Ejecuta el procesamiento completo de la señal a través del modelo de canal.
   * @param inputSignal Muestras de la señal original
   * @param options Parámetros de simulación física del canal
   * @param isSimulationEnabled Indica si la simulación de canal está encendida o en bypass
   */
  public static execute(
    inputSignal: Float32Array,
    options: ChannelSimulationOptions,
    isSimulationEnabled: boolean = true
  ): ProcessSignalOutput {
    if (inputSignal.length === 0) {
      throw new Error("La señal de entrada no contiene muestras para procesar.");
    }
    if (!Number.isFinite(options.sampleRate) || options.sampleRate <= 0) {
      throw new RangeError(`Frecuencia de muestreo inválida: ${options.sampleRate}`);
    }

    const sampleRate = options.sampleRate;

    // 1. Simulación física del canal (o bypass)
    let degradedSignal: Float32Array;
    let attenuationDb: number;
    let linearGain: number;
    let noiseSigma: number;
    let inRms: number;
    let inDbfs: number;
    let outputSnrDb: number;

    if (!isSimulationEnabled) {
      // Bypass / Loopback directo
      const directOpts: ChannelSimulationOptions = {
        ...options,
        distanceKm: 0,
        injectedSnrDb: 60,
        applyTelephoneFilter: false,
        fadingModel: "none",
      };
      const directResult = ChannelPhysicsService.simulateChannel(inputSignal, directOpts);
      degradedSignal = new Float32Array(inputSignal);
      attenuationDb = 0;
      linearGain = 1.0;
      noiseSigma = 0;
      inRms = directResult.inputRms;
      inDbfs = directResult.inputDbfs;
      outputSnrDb = 60;
    } else {
      const channelResult = ChannelPhysicsService.simulateChannel(inputSignal, options);
      degradedSignal = channelResult.degradedSignal;
      attenuationDb = channelResult.attenuationDb;
      linearGain = channelResult.linearGain;
      noiseSigma = channelResult.noiseSigma;
      inRms = channelResult.inputRms;
      inDbfs = channelResult.inputDbfs;
      outputSnrDb = channelResult.outputSnrDb;
    }

    // 2. Transformadas Rápidas de Fourier (FFT Cooley-Tukey con Hamming)
    const inputFft = FourierService.computeFFT(inputSignal, sampleRate, "HAMMING");
    const outputFft = isSimulationEnabled
      ? FourierService.computeFFT(degradedSignal, sampleRate, "HAMMING")
      : inputFft;

    // 3. Frecuencia fundamental (f0) y clasificación acústica
    const pitchResult = PitchDetectorService.detectPitch(inputSignal, sampleRate);
    const { f0, periodT0, classification } = pitchResult;

    // 4. Ancho de banda eficaz (B)
    const { bw: effBw, bwInf, bwSup } = FourierService.calculateEffectiveBandwidth(outputFft);

    // 5. Teorema de Shannon-Hartley: C = B * log2(1 + S/N)
    const channelBw = (isSimulationEnabled && options.applyTelephoneFilter)
      ? 3100
      : Math.min(8000, Math.max(1000, effBw));

    const shannonResult = ShannonService.calculateCapacity(channelBw, outputSnrDb);

    // 6. Estimación perceptual objetiva de calidad (PESQ aproximado 1.0 - 4.5)
    let pesqScore = 1.0 + (3.5 * (outputSnrDb + 10)) / 45;
    if (isSimulationEnabled && options.applyTelephoneFilter) {
      pesqScore = Math.min(pesqScore, 3.8); // Límite códec banda estrecha
    }
    pesqScore = Math.max(1.0, Math.min(4.5, Math.round(pesqScore * 100) / 100));

    const metrics: ChannelMetrics = {
      f0,
      periodT0,
      classification,
      effectiveBandwidth: effBw,
      bwInf,
      bwSup,
      rms: Math.round(inRms * 1000) / 1000,
      dbfs: Math.round(inDbfs * 10) / 10,
      attenuationDb: Math.round(attenuationDb * 10) / 10,
      linearGain: Math.round(linearGain * 1000) / 1000,
      noiseSigma: Math.round(noiseSigma * 1000) / 1000,
      inputSnrDb: Math.round(options.injectedSnrDb * 10) / 10,
      outputSnrDb: Math.round(outputSnrDb * 10) / 10,
      shannonCapacityKbps: shannonResult.capacityKbps,
      spectralEfficiency: shannonResult.spectralEfficiency,
      pesqScore,
    };

    return {
      degradedSignal,
      metrics,
      inputFft,
      outputFft,
    };
  }
}
