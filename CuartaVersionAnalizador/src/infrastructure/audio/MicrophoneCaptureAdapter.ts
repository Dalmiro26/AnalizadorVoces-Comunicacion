/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Infraestructura: Adaptador de Captura de Audio de Micrófono (getUserMedia).
 * 
 * Corrección de Bug Móvil Crítico:
 * - Los navegadores móviles (iOS Safari / Chrome Android) reciclan agresivamente la memoria
 *   de los buffers de audio en el siguiente ciclo de hardware.
 * - Este adaptador clona inmediatamente el Float32Array al finalizar la grabación, garantizando
 *   que la capa de Dominio y Aplicación reciban un buffer inmutable e intacto.
 */

import { AudioContextManager, globalAudioContextManager } from "./AudioContextManager";

export class MicrophoneCaptureAdapter {
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private liveAnalyser: AnalyserNode | null = null;
  private isListeningMic: boolean = false;
  private micRafId: number | null = null;

  constructor(private readonly contextManager: AudioContextManager = globalAudioContextManager) {}

  /**
   * Conecta el micrófono e inicializa el AnalyserNode en tiempo real para osciloscopio dinámico.
   */
  public async startLiveMonitoring(
    onDataUpdate?: (timeData: Float32Array, freqData: Float32Array) => void
  ): Promise<boolean> {
    try {
      this.stopLiveMonitoring();
      const ctx = this.contextManager.getAudioContext();

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      this.micSource = ctx.createMediaStreamSource(this.micStream);
      this.liveAnalyser = ctx.createAnalyser();
      this.liveAnalyser.fftSize = 2048;
      this.liveAnalyser.smoothingTimeConstant = 0.5;

      this.micSource.connect(this.liveAnalyser);
      this.isListeningMic = true;

      if (onDataUpdate) {
        const timeData = new Float32Array(this.liveAnalyser.fftSize);
        const freqData = new Float32Array(this.liveAnalyser.frequencyBinCount);

        let lastTime = 0;
        const targetInterval = 1000 / 30; // 30 FPS throttle

        const poll = (time: number) => {
          if (!this.isListeningMic || !this.liveAnalyser) return;
          if (time - lastTime >= targetInterval) {
            this.liveAnalyser.getFloatTimeDomainData(timeData);
            this.liveAnalyser.getFloatFrequencyData(freqData);
            // Clonación defensiva inmediata de los frames de telemetría en vivo
            onDataUpdate(new Float32Array(timeData), new Float32Array(freqData));
            lastTime = time;
          }
          this.micRafId = requestAnimationFrame(poll);
        };
        this.micRafId = requestAnimationFrame(poll);
      }

      return true;
    } catch (err) {
      console.error("Error al acceder al micrófono:", err);
      return false;
    }
  }

  /**
   * Detiene el monitoreo en vivo y libera recursos.
   */
  public stopLiveMonitoring(): void {
    this.isListeningMic = false;
    if (this.micRafId !== null) {
      cancelAnimationFrame(this.micRafId);
      this.micRafId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch {}
      this.micSource = null;
    }
    if (this.liveAnalyser) {
      try {
        this.liveAnalyser.disconnect();
      } catch {}
      this.liveAnalyser = null;
    }
  }

  /**
   * BUG 1 & BUG 2 CRITICAL FIX:
   * Graba un búfer de audio continuo desde el micrófono durante 'durationSec' segundos exactos.
   * Al culminar, clona inmediatamente el Float32Array capturado para evitar vaciado de memoria por el SO móvil.
   */
  public async recordBuffer(
    durationSec: number,
    signal?: AbortSignal
  ): Promise<Float32Array> {
    const ctx = this.contextManager.getAudioContext();
    if (signal?.aborted) return new Float32Array(0);

    const safeDuration = Math.max(0.5, Math.min(10, durationSec));
    const targetSamples = Math.round(safeDuration * ctx.sampleRate);
    const ownsStream = !this.micStream;

    const stream =
      this.micStream ??
      (await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      }));

    const source = this.micSource ?? ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    const silentGain = ctx.createGain();
    silentGain.gain.value = 0;

    const audioBuffer = new Float32Array(targetSamples);
    let sampleOffset = 0;

    return new Promise<Float32Array>((resolve) => {
      let isCompleted = false;

      const cleanup = () => {
        if (isCompleted) return;
        isCompleted = true;
        signal?.removeEventListener("abort", handleAbort);
        processor.onaudioprocess = null;
        try {
          processor.disconnect();
          silentGain.disconnect();
          if (ownsStream) {
            source.disconnect();
            stream.getTracks().forEach((track) => track.stop());
          }
        } catch {}
      };

      const finish = (length: number) => {
        // BUG 1 FIX: Clonación inmediata profunda del Float32Array
        // Los navegadores móviles descartan o vacían el búfer antes del re-render de React.
        const capturedSlice = audioBuffer.subarray(0, length);
        const clonedBuffer = new Float32Array(length);
        clonedBuffer.set(capturedSlice);

        cleanup();
        resolve(clonedBuffer);
      };

      const handleAbort = () => finish(sampleOffset);
      signal?.addEventListener("abort", handleAbort, { once: true });

      processor.onaudioprocess = (e) => {
        if (isCompleted) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const copyLen = Math.min(inputData.length, targetSamples - sampleOffset);

        if (copyLen > 0) {
          audioBuffer.set(inputData.subarray(0, copyLen), sampleOffset);
          sampleOffset += copyLen;
        }

        if (sampleOffset >= targetSamples) {
          finish(targetSamples);
        }
      };

      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(ctx.destination);

      if (signal?.aborted) handleAbort();
    });
  }
}

export const globalMicrophoneCaptureAdapter = new MicrophoneCaptureAdapter();
