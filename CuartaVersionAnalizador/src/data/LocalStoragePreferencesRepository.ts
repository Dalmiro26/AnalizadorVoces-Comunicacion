/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa Data: Implementación de IPreferencesRepository sobre localStorage.
 * Solo lee y escribe; la validación de los valores es responsabilidad de la capa de Aplicación.
 */

import { ChannelSimulationOptions } from "../domain/entities";
import { IPreferencesRepository } from "../domain/interfaces/IPreferencesRepository";

const STORAGE_KEY_OPTIONS = "dsplab_channel_options";
const STORAGE_KEY_DURATION = "dsplab_sampling_duration";

export class LocalStoragePreferencesRepository implements IPreferencesRepository {
  public loadChannelOptions(): Partial<ChannelSimulationOptions> | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_OPTIONS);
      if (!data) return null;
      const parsed: unknown = JSON.parse(data);
      return parsed && typeof parsed === "object" ? (parsed as Partial<ChannelSimulationOptions>) : null;
    } catch {
      return null;
    }
  }

  public saveChannelOptions(options: ChannelSimulationOptions): void {
    try {
      localStorage.setItem(STORAGE_KEY_OPTIONS, JSON.stringify(options));
    } catch (e) {
      console.warn("No se pudieron guardar las preferencias en localStorage:", e);
    }
  }

  public loadSamplingDuration(): number | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_DURATION);
      if (!data) return null;
      const val = parseFloat(data);
      return Number.isFinite(val) ? val : null;
    } catch {
      return null;
    }
  }

  public saveSamplingDuration(durationSec: number): void {
    try {
      localStorage.setItem(STORAGE_KEY_DURATION, durationSec.toString());
    } catch {}
  }
}
