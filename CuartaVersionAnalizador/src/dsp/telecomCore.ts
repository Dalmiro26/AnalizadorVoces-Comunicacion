/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture Adapter
 * 
 * Este archivo actúa como puente de compatibilidad hacia la Capa de Dominio (src/domain)
 * y la Capa de Aplicación (src/application).
 */

import {
  FFTResult,
  VoiceClassification,
  ChannelMetrics,
  ChannelSimulationOptions,
} from "../domain/models/AudioModels";
import { FourierService } from "../domain/services/FourierService";
import { PitchDetectorService } from "../domain/services/PitchDetectorService";
import {
  ChannelPhysicsService,
  BiquadFilter,
  TelephonePSTNFilter,
} from "../domain/services/ChannelPhysicsService";
import { SignalGeneratorService } from "../domain/services/SignalGeneratorService";
import { ProcesarSenalUseCase } from "../application/use-cases/ProcesarSenalUseCase";

export type {
  FFTResult,
  VoiceClassification,
  ChannelMetrics,
  ChannelSimulationOptions,
};

export { BiquadFilter, TelephonePSTNFilter };

export const applyHammingWindow = FourierService.applyHammingWindow.bind(FourierService);
export const computeFFT = FourierService.computeFFT.bind(FourierService);
export const detectFundamentalFrequency = (buffer: Float32Array, sampleRate: number) => {
  const res = PitchDetectorService.detectPitch(buffer, sampleRate);
  return { f0: res.f0, confidence: res.confidence };
};
export const classifyVoice = PitchDetectorService.classifyVoice.bind(PitchDetectorService);
export const calculateEffectiveBandwidth = FourierService.calculateEffectiveBandwidth.bind(FourierService);
export const calculateRMSandDBFS = ChannelPhysicsService.calculateRMSandDBFS.bind(ChannelPhysicsService);
export const generateGaussianSample = ChannelPhysicsService.generateGaussianSample.bind(ChannelPhysicsService);
export const generateTestSignal = SignalGeneratorService.generateSignal.bind(SignalGeneratorService);

export function simulatePhysicalChannel(
  inputSignal: Float32Array,
  options: ChannelSimulationOptions
) {
  return ProcesarSenalUseCase.execute(inputSignal, options, true);
}
