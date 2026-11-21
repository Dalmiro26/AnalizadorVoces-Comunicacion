/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Presentación: Barrel export principal.
 */

export * from "./hooks/useAudioPipeline";
export * from "./components/OscilloscopeCanvas";
export * from "./components/SpectrumAnalyzerCanvas";
export * from "./components/WaterfallSpectrogramCanvas";
export * from "./components/MetricCards";
export * from "./components/ChannelControls";
export * from "./components/AudioPlayerDual";
export * from "./components/TelemetryTab";
export * from "./components/TheoryModal";
export * from "./views/MainSimulatorView";
export * from "./configurations/dependencies";
export * from "./middlewares/errorHandling";
export * from "./services/AudioContextManager";
export * from "./services/MicrophoneCaptureService";
export * from "./services/AudioPlaybackService";
export * from "./services/PdfReportExporter";
export * from "./services/CsvReportExporter";
