/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Presentación: Hook useAudioPipeline.
 * 
 * Orquesta el flujo completo de audio, estados de React, casos de uso de la capa de Aplicación
 * y adaptadores de Infraestructura.
 * 
 * Corrección de Bugs Críticos:
 * - Bug 1 (Móviles): audioCtx.resume() sincrónico inmediato en el evento onClick antes de cualquier promesa.
 *   Clonación inmediata de Float32Array para prevenir vaciado del buffer por el recolector de basura de iOS/Android.
 * - Bug 2 (Stale Closure): duracionRef.current actualizado para que el temporizador y el grabador lean
 *   siempre la duración actual sin closures obsoletos.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChannelMetrics,
  ChannelSimulationOptions,
  FFTResult,
  TelemetryReportData,
} from "../../domain/models/AudioModels";
import { ProcesarSenalUseCase } from "../../application/use-cases/ProcesarSenalUseCase";
import {
  GenerarSenalPruebaUseCase,
} from "../../application/use-cases/GenerarSenalPruebaUseCase";
import { AnalyticalSignalType } from "../../domain/services/SignalGeneratorService";
import { globalAudioContextManager } from "../../infrastructure/audio/AudioContextManager";
import { globalMicrophoneCaptureAdapter } from "../../infrastructure/audio/MicrophoneCaptureAdapter";
import { globalAudioPlaybackAdapter } from "../../infrastructure/audio/AudioPlaybackAdapter";
import { LocalStoragePreferences } from "../../infrastructure/storage/LocalStoragePreferences";
import { PdfReportAdapter } from "../../infrastructure/export/PdfReportAdapter";
import { CsvExportAdapter } from "../../infrastructure/export/CsvExportAdapter";

export function useAudioPipeline() {
  // 1. Duración del muestreo con protección contra Stale Closures (Bug 2 Fix)
  const [durationSec, setDurationSec] = useState<number>(() =>
    LocalStoragePreferences.loadSamplingDuration(5.0)
  );
  const duracionRef = useRef<number>(durationSec);

  useEffect(() => {
    duracionRef.current = durationSec;
    LocalStoragePreferences.saveSamplingDuration(durationSec);
  }, [durationSec]);

  // 2. Parámetros del modelo físico de canal
  const [channelSimulationEnabled, setChannelSimulationEnabled] = useState<boolean>(false);
  const [channelOptions, setChannelOptions] = useState<ChannelSimulationOptions>(() =>
    LocalStoragePreferences.loadChannelOptions({
      distanceKm: 10.0,
      alphaDbPerKm: 1.5,
      injectedSnrDb: -20.0,
      applyTelephoneFilter: true,
      fadingModel: "none",
      sampleRate: 44100,
    })
  );

  // 3. Búferes de señal y métricas
  const [originalSignal, setOriginalSignal] = useState<Float32Array>(() => new Float32Array(0));
  const [degradedSignal, setDegradedSignal] = useState<Float32Array>(() => new Float32Array(0));
  const [metrics, setMetrics] = useState<ChannelMetrics | null>(null);
  const [inputFft, setInputFft] = useState<FFTResult | null>(null);
  const [outputFft, setOutputFft] = useState<FFTResult | null>(null);

  // 4. Estados de captura y telemetría
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // 5. Monitoreo en vivo (AnalyserNode -> Osciloscopio / Espectro en tiempo real)
  const [isLiveMonitoring, setIsLiveMonitoring] = useState<boolean>(false);
  const [liveBuffer, setLiveBuffer] = useState<Float32Array>(() => new Float32Array(2048));
  const [liveFreqBuffer, setLiveFreqBuffer] = useState<Float32Array>(() => new Float32Array(1024));

  // Referencias para control de temporizadores y cancelación
  const recordIntervalRef = useRef<number | null>(null);
  const captureAbortRef = useRef<AbortController | null>(null);

  /**
   * Ejecuta el pipeline de procesamiento delegando en el Caso de Uso de la Capa de Aplicación.
   */
  const runDspPipeline = useCallback(
    (signalToProcess: Float32Array, opts: ChannelSimulationOptions, isSimEnabled: boolean) => {
      if (signalToProcess.length === 0) return;

      try {
        const result = ProcesarSenalUseCase.execute(signalToProcess, opts, isSimEnabled);
        setDegradedSignal(result.degradedSignal);
        setMetrics(result.metrics);
        setInputFft(result.inputFft);
        setOutputFft(result.outputFft);
        setProcessingError(null);
      } catch (err) {
        console.error("Error en Caso de Uso ProcesarSenalUseCase:", err);
        setMetrics(null);
        setInputFft(null);
        setOutputFft(null);
        setProcessingError(
          `Error al procesar la señal de audio: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    },
    []
  );

  // Modificación de opciones de canal
  const handleOptionsChange = useCallback(
    (newOpts: Partial<ChannelSimulationOptions>) => {
      setChannelOptions((prev) => {
        const updated = { ...prev, ...newOpts };
        LocalStoragePreferences.saveChannelOptions(updated);
        if (originalSignal.length > 0) {
          runDspPipeline(originalSignal, updated, channelSimulationEnabled);
        }
        return updated;
      });
    },
    [originalSignal, channelSimulationEnabled, runDspPipeline]
  );

  // Alternar simulación de canal
  const handleToggleSimulation = useCallback(
    (enabled: boolean) => {
      setChannelSimulationEnabled(enabled);
      if (originalSignal.length > 0) {
        runDspPipeline(originalSignal, channelOptions, enabled);
      }
    },
    [originalSignal, channelOptions, runDspPipeline]
  );

  // Modificación de duración
  const handleDurationChange = useCallback((nextDuration: number) => {
    duracionRef.current = nextDuration;
    setDurationSec(nextDuration);
  }, []);

  // Generar señales de prueba analíticas sin micrófono
  const handleGenerateTestSignal = useCallback(
    (type: AnalyticalSignalType) => {
      const duration = duracionRef.current;
      const sampleRate = globalAudioContextManager.sampleRate;
      const testSignal = GenerarSenalPruebaUseCase.execute({
        type,
        durationSec: duration,
        sampleRate,
      });

      // Clonar buffer defensivamente
      const safeSignal = new Float32Array(testSignal);
      setOriginalSignal(safeSignal);
      setElapsedSec(duration);
      runDspPipeline(safeSignal, { ...channelOptions, sampleRate }, channelSimulationEnabled);
    },
    [channelOptions, channelSimulationEnabled, runDspPipeline]
  );

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
      captureAbortRef.current?.abort();
      globalMicrophoneCaptureAdapter.stopLiveMonitoring();
      globalAudioPlaybackAdapter.stopAll();
    };
  }, []);

  /**
   * BUG 1 & BUG 2 CRITICAL FIX:
   * Disparador principal de captura de micrófono con protección móvil estricta.
   */
  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      // Detener captura en curso
      setIsRecording(false);
      setIsLiveMonitoring(false);
      captureAbortRef.current?.abort();
      captureAbortRef.current = null;
      globalMicrophoneCaptureAdapter.stopLiveMonitoring();
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
        recordIntervalRef.current = null;
      }
      return;
    }

    // =========================================================================
    // BUG 1 CRITICAL FIX (MÓVILES):
    // audioCtx.resume() DEBE ejecutarse de forma estrictamente sincrónica
    // directamente dentro del manejador del evento de clic, ANTES de cualquier
    // promesa o await. Esto preserva el gesto de usuario en iOS Safari y Android.
    // =========================================================================
    globalAudioContextManager.resumeSynchronously();

    // =========================================================================
    // BUG 2 CRITICAL FIX (STALE CLOSURE):
    // Leer la duración directamente desde duracionRef.current en lugar del estado
    // capturado para evitar lecturas de valores obsoletos (ej. 3s en lugar de 5s).
    // =========================================================================
    const captureDurationSec = Math.max(1, Math.min(10, duracionRef.current));
    const captureController = new AbortController();
    captureAbortRef.current = captureController;

    setIsRecording(true);
    setElapsedSec(0);
    setProcessingError(null);

    globalAudioPlaybackAdapter.stopAll();
    setOriginalSignal(new Float32Array(0));
    setDegradedSignal(new Float32Array(0));
    setMetrics(null);
    setInputFft(null);
    setOutputFft(null);
    setLiveBuffer(new Float32Array(2048));
    setLiveFreqBuffer(new Float32Array(1024));

    // Confirmación asíncrona de resume
    try {
      await globalAudioContextManager.ensureResumed();
    } catch (err) {
      console.error("Fallo al reanudar AudioContext:", err);
      setIsRecording(false);
      captureAbortRef.current = null;
      setProcessingError("No se pudo iniciar el sistema de audio.");
      return;
    }

    // Iniciar visualizador en vivo durante la captura
    setIsLiveMonitoring(true);
    const micConnected = await globalMicrophoneCaptureAdapter.startLiveMonitoring(
      (timeData, freqData) => {
        setLiveBuffer(timeData);
        setLiveFreqBuffer(freqData);
      }
    );

    if (!micConnected) {
      globalMicrophoneCaptureAdapter.stopLiveMonitoring();
      setIsRecording(false);
      setIsLiveMonitoring(false);
      captureAbortRef.current = null;
      setProcessingError(
        "No se pudo acceder al micrófono. Por favor permite los permisos de audio en tu navegador."
      );
      return;
    }

    if (captureController.signal.aborted) {
      globalMicrophoneCaptureAdapter.stopLiveMonitoring();
      setIsRecording(false);
      setIsLiveMonitoring(false);
      captureAbortRef.current = null;
      return;
    }

    const currentSampleRate = globalAudioContextManager.sampleRate;
    const captureOptions: ChannelSimulationOptions = {
      ...channelOptions,
      sampleRate: currentSampleRate,
    };
    if (captureOptions.sampleRate !== channelOptions.sampleRate) {
      setChannelOptions(captureOptions);
    }

    // Temporizador de interfaz basado en duracionRef.current
    recordIntervalRef.current = window.setInterval(() => {
      setElapsedSec((s) => {
        const target = duracionRef.current;
        if (s >= target) return target;
        return Math.min(target, Math.round((s + 0.1) * 10) / 10);
      });
    }, 100);

    try {
      // Grabar buffer a través del adaptador de infraestructura
      const recorded = await globalMicrophoneCaptureAdapter.recordBuffer(
        captureDurationSec,
        captureController.signal
      );

      // =========================================================================
      // BUG 1 CRITICAL FIX (CLONACIÓN INMEDIATA):
      // Clonar inmediatamente el Float32Array. En móviles, el recolector de audio
      // vacía los buffers antes de que React renderice los cálculos.
      // =========================================================================
      const safeCapturedSignal = new Float32Array(recorded.length);
      safeCapturedSignal.set(recorded);

      // Finalizar estado de grabación
      setIsRecording(false);
      setIsLiveMonitoring(false);
      captureAbortRef.current = null;
      globalMicrophoneCaptureAdapter.stopLiveMonitoring();

      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
        recordIntervalRef.current = null;
      }

      setOriginalSignal(safeCapturedSignal);

      if (safeCapturedSignal.length > 0) {
        setElapsedSec(safeCapturedSignal.length / currentSampleRate);
        runDspPipeline(safeCapturedSignal, captureOptions, channelSimulationEnabled);
      } else if (!captureController.signal.aborted) {
        setProcessingError("La captura no registró muestras de audio. Intenta nuevamente.");
      }
    } catch (err) {
      console.error("Error durante la grabación de audio:", err);
      setIsRecording(false);
      setIsLiveMonitoring(false);
      captureAbortRef.current = null;
      globalMicrophoneCaptureAdapter.stopLiveMonitoring();
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
        recordIntervalRef.current = null;
      }
      setProcessingError(
        `Error al capturar audio: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [isRecording, channelOptions, channelSimulationEnabled, runDspPipeline]);

  // Exportar reportes
  const handleExportPdf = useCallback(() => {
    if (!metrics || !inputFft || !outputFft) return;
    const reportData: TelemetryReportData = {
      metrics,
      options: channelOptions,
      sampleRate: channelOptions.sampleRate,
      durationSec: duracionRef.current,
      profileName: channelSimulationEnabled ? "Canal Físico Simulado" : "Paso Directo (Bypass)",
      originalSignal,
      degradedSignal,
      inputFft,
      outputFft,
    };
    PdfReportAdapter.generatePdf(reportData);
  }, [metrics, inputFft, outputFft, channelOptions, channelSimulationEnabled, originalSignal, degradedSignal]);

  const handleExportCsv = useCallback(() => {
    if (!metrics || !inputFft || !outputFft) return;
    const reportData: TelemetryReportData = {
      metrics,
      options: channelOptions,
      sampleRate: channelOptions.sampleRate,
      durationSec: duracionRef.current,
      profileName: channelSimulationEnabled ? "Canal Físico Simulado" : "Paso Directo (Bypass)",
      originalSignal,
      degradedSignal,
      inputFft,
      outputFft,
    };
    CsvExportAdapter.exportCsv(reportData);
  }, [metrics, inputFft, outputFft, channelOptions, channelSimulationEnabled, originalSignal, degradedSignal]);

  return {
    durationSec,
    setDurationSec: handleDurationChange,
    channelOptions,
    handleOptionsChange,
    channelSimulationEnabled,
    handleToggleSimulation,
    originalSignal,
    degradedSignal,
    metrics,
    inputFft,
    outputFft,
    isRecording,
    elapsedSec,
    isLiveMonitoring,
    liveBuffer,
    liveFreqBuffer,
    processingError,
    handleToggleRecording,
    handleGenerateTestSignal,
    handleExportPdf,
    handleExportCsv,
  };
}
