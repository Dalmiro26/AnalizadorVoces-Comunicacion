/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa de Presentación: Raíz de composición (inyección de dependencias).
 *
 * Único lugar donde se instancian las implementaciones concretas y se conectan
 * con las interfaces de las capas Application y Domain. El resto de la
 * presentación consume solo las interfaces expuestas en `appDependencies`.
 */

import { IProcesarSenalService } from "../../application/interfaces/IProcesarSenalService";
import { IGenerarSenalPruebaService } from "../../application/interfaces/IGenerarSenalPruebaService";
import { IExportarReporteService } from "../../application/interfaces/IExportarReporteService";
import { IPreferenciasService } from "../../application/interfaces/IPreferenciasService";
import { IAudioContextService } from "../../application/interfaces/IAudioContextService";
import { IAudioCaptureService } from "../../application/interfaces/IAudioCaptureService";
import { IAudioPlaybackService } from "../../application/interfaces/IAudioPlaybackService";
import { ProcesarSenalService } from "../../application/services/ProcesarSenalService";
import { GenerarSenalPruebaService } from "../../application/services/GenerarSenalPruebaService";
import { ExportarReporteService } from "../../application/services/ExportarReporteService";
import { PreferenciasService } from "../../application/services/PreferenciasService";
import { IPreferencesRepository } from "../../domain/interfaces/IPreferencesRepository";
import { LocalStoragePreferencesRepository } from "../../data/LocalStoragePreferencesRepository";
import { AudioContextManager } from "../services/AudioContextManager";
import { MicrophoneCaptureService } from "../services/MicrophoneCaptureService";
import { AudioPlaybackService } from "../services/AudioPlaybackService";
import { PdfReportExporter } from "../services/PdfReportExporter";
import { CsvReportExporter } from "../services/CsvReportExporter";

export interface AppDependencies {
  procesarSenal: IProcesarSenalService;
  generarSenalPrueba: IGenerarSenalPruebaService;
  exportarReporte: IExportarReporteService;
  preferencias: IPreferenciasService;
  audioContext: IAudioContextService;
  audioCapture: IAudioCaptureService;
  audioPlayback: IAudioPlaybackService;
}

export function createAppDependencies(): AppDependencies {
  // Data
  const preferencesRepository: IPreferencesRepository = new LocalStoragePreferencesRepository();

  // Servicios del navegador (una sola instancia de AudioContext compartida)
  const audioContextManager = new AudioContextManager();

  return {
    procesarSenal: new ProcesarSenalService(),
    generarSenalPrueba: new GenerarSenalPruebaService(),
    exportarReporte: new ExportarReporteService(new PdfReportExporter(), new CsvReportExporter()),
    preferencias: new PreferenciasService(preferencesRepository),
    audioContext: audioContextManager,
    audioCapture: new MicrophoneCaptureService(audioContextManager),
    audioPlayback: new AudioPlaybackService(audioContextManager),
  };
}

/** Contenedor único de la aplicación. */
export const appDependencies: AppDependencies = createAppDependencies();
