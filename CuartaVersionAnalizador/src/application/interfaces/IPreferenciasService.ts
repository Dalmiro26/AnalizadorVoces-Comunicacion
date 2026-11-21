/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Aplicación: Interfaz IPreferenciasService.
 */

import { ChannelSimulationOptions } from "../../domain/entities";

export interface IPreferenciasService {
  loadChannelOptions(defaults: ChannelSimulationOptions): ChannelSimulationOptions;
  saveChannelOptions(options: ChannelSimulationOptions): void;
  loadSamplingDuration(fallback: number): number;
  saveSamplingDuration(durationSec: number): void;
}
