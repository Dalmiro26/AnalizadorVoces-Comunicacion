/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Aplicación: Interfaz IProcesarSenalService.
 */

import { ChannelSimulationOptions } from "../../domain/entities";
import { ProcesarSenalResponse } from "../dtos/ProcesarSenalModel";

export interface IProcesarSenalService {
  /**
   * Procesa la señal a través del modelo físico del canal (o en bypass) y calcula sus métricas.
   * @throws ValidationException si la señal está vacía o la frecuencia de muestreo es inválida.
   */
  execute(
    inputSignal: Float32Array,
    options: ChannelSimulationOptions,
    isSimulationEnabled?: boolean
  ): ProcesarSenalResponse;
}
