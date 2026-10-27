/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Infraestructura: Adaptador de Persistencia de Preferencias (LocalStorage).
 */

import { ChannelSimulationOptions } from "../../domain/models/AudioModels";

const STORAGE_KEY_OPTIONS = "dsplab_channel_options";
const STORAGE_KEY_DURATION = "dsplab_sampling_duration";

export class LocalStoragePreferences {
  public static saveChannelOptions(options: ChannelSimulationOptions): void {
    try {
      localStorage.setItem(STORAGE_KEY_OPTIONS, JSON.stringify(options));
    } catch (e) {
      console.warn("No se pudieron guardar las preferencias en localStorage:", e);
    }
  }

  public static loadChannelOptions(defaults: ChannelSimulationOptions): ChannelSimulationOptions {
    try {
      const data = localStorage.getItem(STORAGE_KEY_OPTIONS);
      if (!data) return defaults;
      const parsed = JSON.parse(data);
      return { ...defaults, ...parsed };
    } catch {
      return defaults;
    }
  }

  public static saveSamplingDuration(duration: number): void {
    try {
      localStorage.setItem(STORAGE_KEY_DURATION, duration.toString());
    } catch {}
  }

  public static loadSamplingDuration(fallback: number = 5.0): number {
    try {
      const data = localStorage.getItem(STORAGE_KEY_DURATION);
      if (!data) return fallback;
      const val = parseFloat(data);
      return Number.isFinite(val) && val >= 1 && val <= 10 ? val : fallback;
    } catch {
      return fallback;
    }
  }
}
