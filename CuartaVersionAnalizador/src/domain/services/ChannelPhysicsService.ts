/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Dominio: Servicio de Física de Canales de Telecomunicación.
 * 
 * Implementa:
 * - Atenuación acumulada por distancia en medios de transmisión: A_dB = alpha * d.
 * - Factor lineal de ganancia k = 10^(-A / 20).
 * - Generador de Ruido Blanco Gaussiano Aditivo (AWGN) mediante Transformada de Box-Muller.
 * - Filtros digitales IIR Biquad (Direct Form II Transposed).
 * - Filtro Telefónico ITU-T G.711 en cascada (300 Hz a 3400 Hz).
 * - Desvanecimiento estocástico (Rayleigh / Rician).
 * - Cálculo de potencia RMS y conversión a dBFS.
 */

import { ChannelSimulationOptions } from "../models/AudioModels";

/**
 * Filtro IIR Biquad de segundo orden (Direct Form II Transposed).
 */
export class BiquadFilter {
  // Coeficientes de transferencia H(z) = (b0 + b1*z^-1 + b2*z^-2) / (1 + a1*z^-1 + a2*z^-2)
  b0: number = 1;
  b1: number = 0;
  b2: number = 0;
  a1: number = 0;
  a2: number = 0;

  // Estados internos
  x1: number = 0;
  x2: number = 0;
  y1: number = 0;
  y2: number = 0;

  constructor(
    type: "highpass" | "lowpass" | "bandpass",
    f0: number,
    fs: number,
    Q: number = 0.707
  ) {
    this.configure(type, f0, fs, Q);
  }

  public configure(
    type: "highpass" | "lowpass" | "bandpass",
    f0: number,
    fs: number,
    Q: number = 0.707
  ): void {
    const w0 = (2 * Math.PI * f0) / fs;
    const alpha = Math.sin(w0) / (2 * Q);
    const cosw0 = Math.cos(w0);

    let a0 = 1;

    if (type === "highpass") {
      this.b0 = (1 + cosw0) / 2;
      this.b1 = -(1 + cosw0);
      this.b2 = (1 + cosw0) / 2;
      a0 = 1 + alpha;
      this.a1 = -2 * cosw0;
      this.a2 = 1 - alpha;
    } else if (type === "lowpass") {
      this.b0 = (1 - cosw0) / 2;
      this.b1 = 1 - cosw0;
      this.b2 = (1 - cosw0) / 2;
      a0 = 1 + alpha;
      this.a1 = -2 * cosw0;
      this.a2 = 1 - alpha;
    } else {
      // bandpass
      this.b0 = alpha;
      this.b1 = 0;
      this.b2 = -alpha;
      a0 = 1 + alpha;
      this.a1 = -2 * cosw0;
      this.a2 = 1 - alpha;
    }

    // Normalizar coeficientes por a0
    this.b0 /= a0;
    this.b1 /= a0;
    this.b2 /= a0;
    this.a1 /= a0;
    this.a2 /= a0;

    this.reset();
  }

  public reset(): void {
    this.x1 = 0;
    this.x2 = 0;
    this.y1 = 0;
    this.y2 = 0;
  }

  public processSample(x: number): number {
    const y =
      this.b0 * x +
      this.b1 * this.x1 +
      this.b2 * this.x2 -
      this.a1 * this.y1 -
      this.a2 * this.y2;

    this.x2 = this.x1;
    this.x1 = x;
    this.y2 = this.y1;
    this.y1 = y;

    return y;
  }
}

/**
 * Filtro Telefónico PSTN en Cascada de 4to orden (300 Hz - 3400 Hz) según ITU-T G.711.
 */
export class TelephonePSTNFilter {
  private hp1: BiquadFilter;
  private hp2: BiquadFilter;
  private lp1: BiquadFilter;
  private lp2: BiquadFilter;

  constructor(sampleRate: number) {
    this.hp1 = new BiquadFilter("highpass", 300, sampleRate, 0.707);
    this.hp2 = new BiquadFilter("highpass", 300, sampleRate, 0.707);
    this.lp1 = new BiquadFilter("lowpass", 3400, sampleRate, 0.707);
    this.lp2 = new BiquadFilter("lowpass", 3400, sampleRate, 0.707);
  }

  public process(buffer: Float32Array): Float32Array {
    const out = new Float32Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      let s = buffer[i];
      s = this.hp1.processSample(s);
      s = this.hp2.processSample(s);
      s = this.lp1.processSample(s);
      s = this.lp2.processSample(s);
      out[i] = s;
    }
    return out;
  }
}

export interface ChannelDegradationResult {
  degradedSignal: Float32Array;
  attenuationDb: number;
  linearGain: number;
  noiseSigma: number;
  inputRms: number;
  inputDbfs: number;
  outputRms: number;
  outputDbfs: number;
  outputSnrDb: number;
}

export class ChannelPhysicsService {
  /**
   * Genera una muestra de Ruido Blanco Gaussiano Aditivo (AWGN) mediante Box-Muller.
   * Produce una distribución normal N(0, sigma^2).
   */
  public static generateGaussianSample(sigma: number = 1.0): number {
    let u1 = 0;
    let u2 = 0;
    while (u1 <= 1e-12) u1 = Math.random();
    while (u2 <= 1e-12) u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * sigma;
  }

  /**
   * Calcula el valor eficaz (RMS) y la potencia relativa a plena escala (dBFS).
   */
  public static calculateRMSandDBFS(buffer: Float32Array): { rms: number; dbfs: number } {
    let sumSq = 0;
    const len = buffer.length;
    for (let i = 0; i < len; i++) {
      sumSq += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sumSq / Math.max(1, len));
    const dbfs = 20 * Math.log10(Math.max(rms, 1e-6));
    return { rms, dbfs };
  }

  /**
   * Aplica el modelo físico completo de canal sobre la señal de entrada.
   */
  public static simulateChannel(
    inputSignal: Float32Array,
    options: ChannelSimulationOptions
  ): ChannelDegradationResult {
    const {
      distanceKm,
      alphaDbPerKm,
      injectedSnrDb,
      applyTelephoneFilter,
      fadingModel,
      sampleRate,
    } = options;

    const N = inputSignal.length;
    const degradedSignal = new Float32Array(N);

    // 1. Atenuación en el medio de transmisión
    const totalAttenuationDb = distanceKm * alphaDbPerKm;
    const linearGain = Math.pow(10, -totalAttenuationDb / 20);

    // 2. Medición de potencia de la señal de entrada
    const { rms: inRms, dbfs: inDbfs } = this.calculateRMSandDBFS(inputSignal);
    const sigPower = inRms * inRms;

    // 3. Potencia de ruido blanco según SNR inyectado
    const snrLinear = Math.pow(10, injectedSnrDb / 10);
    const targetNoisePower = Math.max(1e-8, (sigPower * linearGain * linearGain) / (snrLinear + 1e-9));
    const noiseSigma = Math.sqrt(targetNoisePower);

    // Filtro telefónico ITU-T G.711
    const filter = applyTelephoneFilter ? new TelephonePSTNFilter(sampleRate) : null;

    // Parámetros de fading multitrayecto
    let fadingPhase = 0;
    const dopplerFreq = 2.5; // Frecuencia Doppler lenta en Hz

    for (let n = 0; n < N; n++) {
      let s = inputSignal[n] * linearGain;

      if (fadingModel === "rayleigh") {
        fadingPhase += (2 * Math.PI * dopplerFreq) / sampleRate;
        const r1 = Math.cos(fadingPhase) + 0.3 * Math.sin(fadingPhase * 1.7);
        const r2 = Math.sin(fadingPhase) - 0.2 * Math.cos(fadingPhase * 2.3);
        const rayleighEnv = Math.min(1.5, Math.sqrt(r1 * r1 + r2 * r2) * 0.7 + 0.2);
        s *= rayleighEnv;
      } else if (fadingModel === "rician") {
        fadingPhase += (2 * Math.PI * dopplerFreq) / sampleRate;
        const los = 0.8;
        const scattered = 0.3 * Math.cos(fadingPhase);
        s *= los + scattered;
      }

      // Adición de Ruido Blanco Gaussiano (AWGN)
      const noise = this.generateGaussianSample(noiseSigma);
      degradedSignal[n] = s + noise;
    }

    // Filtrado telefónico si está activo
    const filteredSignal = filter ? filter.process(degradedSignal) : degradedSignal;

    // Medición de salida
    const { rms: outRms, dbfs: outDbfs } = this.calculateRMSandDBFS(filteredSignal);
    const outSigPower = Math.max(1e-9, outRms * outRms);
    const finalNoisePower = Math.max(1e-9, noiseSigma * noiseSigma);
    const outputSnrDb = Math.max(-30, Math.min(60, 10 * Math.log10(outSigPower / finalNoisePower)));

    return {
      degradedSignal: filteredSignal,
      attenuationDb: totalAttenuationDb,
      linearGain,
      noiseSigma,
      inputRms: inRms,
      inputDbfs: inDbfs,
      outputRms: outRms,
      outputDbfs: outDbfs,
      outputSnrDb,
    };
  }
}
