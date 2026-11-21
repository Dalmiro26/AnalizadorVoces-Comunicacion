/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Dominio: Contrato de persistencia de preferencias (implementado en la capa Data).
 */

import { ChannelSimulationOptions } from "../entities/ChannelSimulationOptions";

export interface IPreferencesRepository {
  /** Devuelve las opciones guardadas tal como están almacenadas (sin validar) o null. */
  loadChannelOptions(): Partial<ChannelSimulationOptions> | null;
  saveChannelOptions(options: ChannelSimulationOptions): void;
  /** Devuelve la duración guardada (sin validar) o null. */
  loadSamplingDuration(): number | null;
  saveSamplingDuration(durationSec: number): void;
}
