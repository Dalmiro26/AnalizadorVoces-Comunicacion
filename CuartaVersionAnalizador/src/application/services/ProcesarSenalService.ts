/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Aplicación: Servicio ProcesarSenalService.
 * 
 * Orquesta la simulación del canal físico o paso directo, cálculo de FFT Cooley-Tukey,
 * estimación de tono f0 por autocorrelación, ancho de banda eficaz y Teorema de Shannon-Hartley.
 */

import { ChannelMetrics, ChannelSimulationOptions } from "../../domain/entities";
import { ChannelPhysicsService } from "../../domain/services/ChannelPhysicsService";
import { FourierService } from "../../domain/services/FourierService";
import { PitchDetectorService } from "../../domain/services/PitchDetectorService";
import { ShannonService } from "../../domain/services/ShannonService";
import { ValidationException } from "../../crossCutting/exceptions/ValidationException";
import { ErrorCodes } from "../../crossCutting/resources/ErrorCodes";
import { ProcesarSenalResponse } from "../dtos/ProcesarSenalModel";
import { IProcesarSenalService } from "../interfaces/IProcesarSenalService";

export class ProcesarSenalService implements IProcesarSenalService {
  /**
   * Ejecuta el procesamiento completo de la señal a través del modelo de canal.
   * @param inputSignal Muestras de la señal original
   * @param options Parámetros de simulación física del canal
   * @param isSimulationEnabled Indica si la simulación de canal está encendida o en bypass
   */
  public execute(
    inputSignal: Float32Array,
    options: ChannelSimulationOptions,
    isSimulationEnabled: boolean = true
  ): ProcesarSenalResponse {
    if (inputSignal.length === 0) {
      throw new ValidationException(ErrorCodes.EMPTY_SIGNAL);
    }
    if (!Number.isFinite(options.sampleRate) || options.sampleRate <= 0) {
      throw new ValidationException(
        ErrorCodes.INVALID_SAMPLE_RATE,
        `Frecuencia de muestreo inválida: ${options.sampleRate}`
      );
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
      // Bypass / Loopback directo: la salida es idéntica a la entrada
      const inputPower = ChannelPhysicsService.calculateRMSandDBFS(inputSignal);
      degradedSignal = new Float32Array(inputSignal);
      attenuationDb = 0;
      linearGain = 1.0;
      noiseSigma = 0;
      inRms = inputPower.rms;
      inDbfs = inputPower.dbfs;
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

    // 2. Ventana de análisis: tramo de 4096 muestras con mayor energía de la entrada.
    // Se usa el mismo tramo en entrada y salida para que los espectros sean comparables.
    const ANALYSIS_WINDOW = 4096;
    const offset = FourierService.findMostEnergeticWindowOffset(inputSignal, ANALYSIS_WINDOW);
    const inputFrame = inputSignal.subarray(offset, offset + ANALYSIS_WINDOW);
    const outputFrame = degradedSignal.subarray(offset, offset + ANALYSIS_WINDOW);

    // 3. Transformadas Rápidas de Fourier (FFT Cooley-Tukey con Hamming)
    const inputFft = FourierService.computeFFT(inputFrame, sampleRate, "HAMMING");
    const outputFft = isSimulationEnabled
      ? FourierService.computeFFT(outputFrame, sampleRate, "HAMMING")
      : inputFft;

    // 3b. Frecuencia fundamental (f0) y clasificación acústica de la voz de entrada
    const pitchResult = PitchDetectorService.detectPitch(inputFrame, sampleRate);
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
      // 4 cifras significativas: con redondeo fijo a 3 decimales k y σ quedaban en 0
      // para atenuaciones altas (ej. 75 dB → k = 0.00018).
      linearGain: Number(linearGain.toPrecision(4)),
      noiseSigma: Number(noiseSigma.toPrecision(4)),
      inputSnrDb: Math.round(options.injectedSnrDb * 10) / 10,
      outputSnrDb: Math.round(outputSnrDb * 10) / 10,
      channelBandwidthHz: channelBw,
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
