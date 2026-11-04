/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Infraestructura: Adaptador y Administrador del AudioContext de la Web Audio API.
 * 
 * Corrección de Bug Móvil Crítico:
 * - Soporte universal para iOS Safari y Android mediante window.webkitAudioContext || window.AudioContext.
 * - Método resumeSynchronously() ejecutable de forma síncrona dentro del evento de interacción del usuario (onClick/onTouchEnd),
 *   asegurando que el navegador no suspenda el AudioContext ni descarte el gesto táctil del usuario.
 */

export class AudioContextManager {
  private static instance: AudioContextManager;
  private ctx: AudioContext | null = null;
  public sampleRate: number = 44100;

  private constructor() {
    // Inicialización diferida ante interacción del usuario
  }

  public static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  /**
   * Obtiene o crea la instancia de AudioContext con compatibilidad cross-browser (webkitAudioContext).
   */
  public getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error(
          "Tu navegador no es compatible con la Web Audio API. Actualiza tu navegador para continuar."
        );
      }

      try {
        // Intenta 44.1 kHz estándar para telecomunicaciones y DSP
        this.ctx = new AudioContextClass({ sampleRate: 44100 });
      } catch (err) {
        console.warn("No se pudo forzar sampleRate a 44100 Hz, utilizando sampleRate nativo del dispositivo:", err);
        this.ctx = new AudioContextClass();
      }

      this.sampleRate = this.ctx.sampleRate;
    }
    return this.ctx;
  }

  /**
   * BUG 1 FIX (MOBILE CRITICAL):
   * Reanuda el AudioContext de forma estrictamente sincrónica dentro del manejador de eventos del usuario (onClick).
   * En iOS Safari y Chrome Mobile, cualquier 'await' previo al resume() hace que el navegador pierda el contexto
   * de interacción del usuario, dejando el AudioContext suspendido y la FFT en blanco.
   */
  public resumeSynchronously(): AudioContext {
    const ctx = this.getAudioContext();
    if (ctx.state === "suspended") {
      // Disparo sincrónico en la pila de ejecución del gesto
      ctx.resume().catch((err) => {
        console.warn("Advertencia al reanudar AudioContext sincrónicamente:", err);
      });
    }
    return ctx;
  }

  /**
   * Versión promesa de reanudación si el llamador necesita esperar confirmación de estado 'running'.
   */
  public async ensureResumed(): Promise<AudioContext> {
    const ctx = this.resumeSynchronously();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    this.sampleRate = ctx.sampleRate;
    return ctx;
  }

  /**
   * Crea un AudioBuffer nativo a partir de un Float32Array asegurando resampleo adecuado si la tasa nativa difiere.
   */
  public createAudioBuffer(samples: Float32Array, sampleRate: number): AudioBuffer {
    const ctx = this.getAudioContext();
    const targetRate = ctx.sampleRate;

    if (Math.abs(targetRate - sampleRate) < 1) {
      const buffer = ctx.createBuffer(1, samples.length, targetRate);
      const channelSamples = new Float32Array(samples);
      buffer.copyToChannel(channelSamples, 0);
      return buffer;
    } else {
      // Resampleo lineal para evitar pitch-shifting si la tarjeta opera a 48 kHz
      const ratio = targetRate / sampleRate;
      const newLength = Math.round(samples.length * ratio);
      const buffer = ctx.createBuffer(1, newLength, targetRate);
      const channelData = buffer.getChannelData(0);

      for (let i = 0; i < newLength; i++) {
        const srcIdx = i / ratio;
        const idx0 = Math.floor(srcIdx);
        const idx1 = Math.min(idx0 + 1, samples.length - 1);
        const frac = srcIdx - idx0;
        channelData[i] = samples[idx0] * (1 - frac) + samples[idx1] * frac;
      }
      return buffer;
    }
  }
}

export const globalAudioContextManager = AudioContextManager.getInstance();
