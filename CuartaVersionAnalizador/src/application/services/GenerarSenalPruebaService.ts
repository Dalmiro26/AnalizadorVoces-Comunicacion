/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Aplicación: Servicio GenerarSenalPruebaService.
 */

import { SignalGeneratorService } from "../../domain/services/SignalGeneratorService";
import { ValidationException } from "../../crossCutting/exceptions/ValidationException";
import { ErrorCodes } from "../../crossCutting/resources/ErrorCodes";
import { GenerarSenalPruebaRequest } from "../dtos/GenerarSenalPruebaModel";
import { IGenerarSenalPruebaService } from "../interfaces/IGenerarSenalPruebaService";

export class GenerarSenalPruebaService implements IGenerarSenalPruebaService {
  public execute(request: GenerarSenalPruebaRequest): Float32Array {
    const { type, durationSec, sampleRate } = request;
    if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
      throw new ValidationException(
        ErrorCodes.INVALID_SAMPLE_RATE,
        `Frecuencia de muestreo inválida: ${sampleRate}`
      );
    }
    return SignalGeneratorService.generateSignal(type, durationSec, sampleRate);
  }
}
