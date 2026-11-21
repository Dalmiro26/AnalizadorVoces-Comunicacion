/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Aplicación: Servicio PreferenciasService (validación de preferencias persistidas).
 */

import { ChannelSimulationOptions } from "../../domain/entities";
import { IPreferencesRepository } from "../../domain/interfaces/IPreferencesRepository";
import { clampOr } from "../../crossCutting/helpers/NumberHelpers";
import { IPreferenciasService } from "../interfaces/IPreferenciasService";

const FADING_MODELS: ChannelSimulationOptions["fadingModel"][] = ["none", "rayleigh", "rician"];

export class PreferenciasService implements IPreferenciasService {
  constructor(private readonly repository: IPreferencesRepository) {}

  /**
   * Carga y valida cada campo: un valor corrupto (ej. null por un NaN serializado)
   * hacía fallar .toFixed() en el panel de control y rompía toda la interfaz.
   */
  public loadChannelOptions(defaults: ChannelSimulationOptions): ChannelSimulationOptions {
    const stored = this.repository.loadChannelOptions();
    if (!stored) return defaults;
    return {
      distanceKm: clampOr(stored.distanceKm, defaults.distanceKm, 0, 50),
      alphaDbPerKm: clampOr(stored.alphaDbPerKm, defaults.alphaDbPerKm, 0, 10),
      injectedSnrDb: clampOr(stored.injectedSnrDb, defaults.injectedSnrDb, -45, 20),
      applyTelephoneFilter:
        typeof stored.applyTelephoneFilter === "boolean"
          ? stored.applyTelephoneFilter
          : defaults.applyTelephoneFilter,
      fadingModel:
        stored.fadingModel && FADING_MODELS.includes(stored.fadingModel)
          ? stored.fadingModel
          : defaults.fadingModel,
      sampleRate: clampOr(stored.sampleRate, defaults.sampleRate, 8000, 192000),
    };
  }

  public saveChannelOptions(options: ChannelSimulationOptions): void {
    this.repository.saveChannelOptions(options);
  }

  public loadSamplingDuration(fallback: number = 5.0): number {
    const stored = this.repository.loadSamplingDuration();
    return stored !== null && Number.isFinite(stored) && stored >= 1 && stored <= 10
      ? stored
      : fallback;
  }

  public saveSamplingDuration(durationSec: number): void {
    this.repository.saveSamplingDuration(durationSec);
  }
}
