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
      const parsed = JSON.parse(data) ?? {};
      // Validar cada campo: un valor corrupto (ej. null por un NaN serializado) hacía
      // fallar .toFixed() en el panel de control y rompía toda la interfaz.
      const num = (v: unknown, fallback: number, min: number, max: number) =>
        typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
      return {
        distanceKm: num(parsed.distanceKm, defaults.distanceKm, 0, 50),
        alphaDbPerKm: num(parsed.alphaDbPerKm, defaults.alphaDbPerKm, 0, 10),
        injectedSnrDb: num(parsed.injectedSnrDb, defaults.injectedSnrDb, -45, 20),
        applyTelephoneFilter:
          typeof parsed.applyTelephoneFilter === "boolean"
            ? parsed.applyTelephoneFilter
            : defaults.applyTelephoneFilter,
        fadingModel: ["none", "rayleigh", "rician"].includes(parsed.fadingModel)
          ? parsed.fadingModel
          : defaults.fadingModel,
        sampleRate: num(parsed.sampleRate, defaults.sampleRate, 8000, 192000),
      };
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
