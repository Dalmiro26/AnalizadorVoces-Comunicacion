/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Aplicación: Caso de Uso GenerarSenalPruebaUseCase.
 */

import {
  AnalyticalSignalType,
  SignalGeneratorService,
} from "../../domain/services/SignalGeneratorService";

export interface GenerateSignalOptions {
  type: AnalyticalSignalType;
  durationSec: number;
  sampleRate: number;
}

export class GenerarSenalPruebaUseCase {
  public static execute(options: GenerateSignalOptions): Float32Array {
    const { type, durationSec, sampleRate } = options;
    return SignalGeneratorService.generateSignal(type, durationSec, sampleRate);
  }
}
