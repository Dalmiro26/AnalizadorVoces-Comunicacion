/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Aplicación: Interfaz IGenerarSenalPruebaService.
 */

import { GenerarSenalPruebaRequest } from "../dtos/GenerarSenalPruebaModel";

export interface IGenerarSenalPruebaService {
  execute(request: GenerarSenalPruebaRequest): Float32Array;
}
