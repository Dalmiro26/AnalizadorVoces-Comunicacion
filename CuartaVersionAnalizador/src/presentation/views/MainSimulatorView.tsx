/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Presentación: Vista Principal del Simulador (MainSimulatorView).
 * 
 * Cumple con:
 * - Mobile-First Layout: flex-col en celulares y lg:grid en escritorio.
 * - Estética académica limpia, profesional y libre de textos innecesarios.
 * - Integración completa con el hook useAudioPipeline.
 */

import React, { useState } from "react";
import {
  Activity,
  Sliders,
  TrendingUp,
  BarChart3,
  Radio,
  FileText,
  FileSpreadsheet,
  BookOpen,
} from "lucide-react";
import { useAudioPipeline } from "../hooks/useAudioPipeline";
import { OscilloscopeCanvas } from "../components/OscilloscopeCanvas";
import { SpectrumAnalyzerCanvas } from "../components/SpectrumAnalyzerCanvas";
import { WaterfallSpectrogramCanvas } from "../components/WaterfallSpectrogramCanvas";
import { MetricCards } from "../components/MetricCards";
import { ChannelControls } from "../components/ChannelControls";
import { AudioPlayerDual } from "../components/AudioPlayerDual";
import { TelemetryTab } from "../components/TelemetryTab";
import { TheoryModal } from "../components/TheoryModal";

type TabMode = "analizador" | "parametros" | "cascada" | "telemetria";

export const MainSimulatorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabMode>("analizador");
  const [isTheoryOpen, setIsTheoryOpen] = useState<boolean>(false);

  const {
    durationSec,
    setDurationSec,
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
  } = useAudioPipeline();

  return (
    <div className="bg-[#0f131c] text-[#dfe2ef] min-h-screen flex selection:bg-[#00e5ff] selection:text-[#00363d] overflow-x-hidden">
      {/* ========================================================= */}
      {/* 1. BARRA LATERAL IZQUIERDA DE NAVEGACIÓN (ESCRITORIO)     */}
      {/* ========================================================= */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0a0e17] z-50 flex flex-col justify-between py-4 border-r border-[#1c1f29] hidden lg:flex">
        <div className="flex flex-col gap-6">
          {/* Cabecera / Identidad Académica */}
          <div className="px-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#00e5ff] flex items-center justify-center text-[#00363d] shadow-md shadow-[#00e5ff]/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-[#00e5ff] tracking-tight block">
                Simulador de Canal
              </span>
              <span className="font-mono text-[10px] text-[#849396] block uppercase tracking-wider">
                Comunicaciones & DSP
              </span>
            </div>
          </div>

          {/* Menú de Pestañas */}
          <nav className="flex flex-col gap-1 px-3 font-mono text-xs">
            <button
              onClick={() => setActiveTab("analizador")}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors text-left ${
                activeTab === "analizador"
                  ? "bg-[#262a34] text-[#00e5ff] font-semibold border-l-2 border-[#00e5ff]"
                  : "text-[#849396] hover:bg-[#181b25] hover:text-[#dfe2ef]"
              }`}
              type="button"
            >
              <Activity className="w-4 h-4" />
              <span>Analizador Principal</span>
            </button>

            <button
              onClick={() => setActiveTab("parametros")}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors text-left ${
                activeTab === "parametros"
                  ? "bg-[#262a34] text-[#00e5ff] font-semibold border-l-2 border-[#00e5ff]"
                  : "text-[#849396] hover:bg-[#181b25] hover:text-[#dfe2ef]"
              }`}
              type="button"
            >
              <Sliders className="w-4 h-4" />
              <span>Parámetros Canal</span>
            </button>

            <button
              onClick={() => setActiveTab("cascada")}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors text-left ${
                activeTab === "cascada"
                  ? "bg-[#262a34] text-[#00e5ff] font-semibold border-l-2 border-[#00e5ff]"
                  : "text-[#849396] hover:bg-[#181b25] hover:text-[#dfe2ef]"
              }`}
              type="button"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Cascada Espectral (STFT)</span>
            </button>

            <button
              onClick={() => setActiveTab("telemetria")}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors text-left ${
                activeTab === "telemetria"
                  ? "bg-[#262a34] text-[#00e5ff] font-semibold border-l-2 border-[#00e5ff]"
                  : "text-[#849396] hover:bg-[#181b25] hover:text-[#dfe2ef]"
              }`}
              type="button"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Capacidad de Shannon</span>
            </button>
          </nav>
        </div>

        {/* Acciones Secundarias: Teoría y Exportación */}
        <div className="flex flex-col gap-2 px-3 pt-3 border-t border-[#1c1f29] font-mono text-xs">
          <button
            type="button"
            onClick={() => setIsTheoryOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#181b25] hover:bg-[#262a34] text-[#bac9cc] hover:text-[#00e5ff] transition-colors border border-[#262a34]"
          >
            <BookOpen className="w-4 h-4 text-[#00e5ff]" />
            <span>Fundamentos Teóricos</span>
          </button>

          {metrics && (
            <div className="flex flex-col gap-1.5 pt-1">
              <button
                type="button"
                onClick={handleExportPdf}
                className="flex items-center justify-between px-3 py-1.5 rounded bg-[#181b25] hover:bg-[#262a34] text-[#bac9cc] hover:text-[#00e5ff] transition-colors border border-[#262a34] text-[11px]"
              >
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#ff8097]" /> Reporte PDF
                </span>
                <span className="text-[10px] text-[#849396]">A4</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center justify-between px-3 py-1.5 rounded bg-[#181b25] hover:bg-[#262a34] text-[#bac9cc] hover:text-[#00e5ff] transition-colors border border-[#262a34] text-[11px]"
              >
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#00e5ff]" /> Datos CSV
                </span>
                <span className="text-[10px] text-[#849396]">RAW</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. CONTENEDOR PRINCIPAL (MOBILE-FIRST)                    */}
      {/* ========================================================= */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen min-w-0">
        {/* Cabecera Superior */}
        <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-[#181b25]/95 backdrop-blur-md z-40 border-b border-[#262a34]">
          <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-sm sm:text-base text-[#dfe2ef] tracking-tight">
                Simulador de Canal de Comunicaciones
              </h1>
              <div className="hidden sm:flex items-center gap-2 bg-[#0a0e17] px-2.5 py-1 rounded border border-[#262a34] font-mono text-xs">
                <span className="text-[10px] text-[#849396]">Fs:</span>
                <span className="text-[#00e5ff] font-semibold">
                  {(channelOptions.sampleRate / 1000).toFixed(1)} kHz
                </span>
                <span className="text-[#3b494c]">|</span>
                <span className="text-[#bac9cc]">DSP Client Core</span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setIsTheoryOpen(true)}
                className="lg:hidden p-1.5 rounded bg-[#1c1f29] text-[#00e5ff] border border-[#262a34]"
                title="Ver teoría"
                aria-label="Ver fundamentos teóricos"
              >
                <BookOpen className="w-4 h-4" />
              </button>

              <span
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border ${
                  isRecording
                    ? "bg-[#ff4d6d]/20 text-[#ff8097] border-[#ff4d6d]/50 animate-pulse font-bold"
                    : "bg-[#1c1f29] text-[#849396] border-[#262a34]"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRecording ? "bg-[#ff4d6d]" : "bg-[#849396]"
                  }`}
                />
                <span>{isRecording ? "CAPTURA ACTIVA" : "LISTO"}</span>
              </span>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* 3. ÁREA DE CONTENIDO CENTRAL                              */}
        {/* ========================================================= */}
        <main className="flex-1 min-w-0 px-3 pt-20 pb-4 sm:px-5 sm:pt-20 sm:pb-5 flex flex-col gap-4 max-w-7xl mx-auto w-full">
          {processingError && (
            <div
              role="alert"
              className="rounded-lg border border-[#ff4d6d]/50 bg-[#ff4d6d]/10 px-3 py-2 font-mono text-xs text-[#ff8097]"
            >
              {processingError}
            </div>
          )}

          {/* Navegación por Pestañas en Móviles */}
          <div className="flex lg:hidden overflow-x-auto pb-1 gap-1.5 font-mono text-xs">
            <button
              onClick={() => setActiveTab("analizador")}
              className={`px-3 py-1.5 rounded whitespace-nowrap transition-colors ${
                activeTab === "analizador"
                  ? "bg-[#00e5ff] text-[#00363d] font-bold"
                  : "bg-[#181b25] text-[#bac9cc]"
              }`}
            >
              Analizador
            </button>
            <button
              onClick={() => setActiveTab("parametros")}
              className={`px-3 py-1.5 rounded whitespace-nowrap transition-colors ${
                activeTab === "parametros"
                  ? "bg-[#00e5ff] text-[#00363d] font-bold"
                  : "bg-[#181b25] text-[#bac9cc]"
              }`}
            >
              Parámetros Canal
            </button>
            <button
              onClick={() => setActiveTab("cascada")}
              className={`px-3 py-1.5 rounded whitespace-nowrap transition-colors ${
                activeTab === "cascada"
                  ? "bg-[#00e5ff] text-[#00363d] font-bold"
                  : "bg-[#181b25] text-[#bac9cc]"
              }`}
            >
              Cascada STFT
            </button>
            <button
              onClick={() => setActiveTab("telemetria")}
              className={`px-3 py-1.5 rounded whitespace-nowrap transition-colors ${
                activeTab === "telemetria"
                  ? "bg-[#00e5ff] text-[#00363d] font-bold"
                  : "bg-[#181b25] text-[#bac9cc]"
              }`}
            >
              Shannon
            </button>
          </div>

          {/* Layout Principal: Mobile flex-col -> Desktop Grid 12 cols */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 items-start w-full min-w-0">
            {/* Panel de Control Lateral */}
            <div className="w-full min-w-0 lg:col-span-4 flex flex-col gap-4">
              <ChannelControls
                durationSec={durationSec}
                setDurationSec={setDurationSec}
                isRecording={isRecording}
                onToggleRecording={handleToggleRecording}
                elapsedSec={elapsedSec}
                options={channelOptions}
                onOptionsChange={handleOptionsChange}
                channelSimulationEnabled={channelSimulationEnabled}
                setChannelSimulationEnabled={handleToggleSimulation}
                onGenerateTestSignal={handleGenerateTestSignal}
              />
            </div>

            {/* Columna Principal según la Pestaña Activa */}
            <div className="w-full min-w-0 lg:col-span-8 flex flex-col gap-4">
              {activeTab === "analizador" && (
                <>
                  {/* Osciloscopio Dominio del Tiempo */}
                  <OscilloscopeCanvas
                    originalSignal={originalSignal}
                    degradedSignal={degradedSignal}
                    sampleRate={channelOptions.sampleRate}
                    durationSec={durationSec}
                    isLiveMonitoring={isLiveMonitoring}
                    liveBuffer={liveBuffer}
                  />

                  {/* Tarjetas de Métricas de Ingeniería */}
                  {metrics && <MetricCards metrics={metrics} />}

                  {/* Analizador de Espectro FFT */}
                  <SpectrumAnalyzerCanvas
                    inputFft={inputFft}
                    outputFft={outputFft}
                    f0={metrics ? metrics.f0 : 0}
                    telephoneFilterActive={channelSimulationEnabled && channelOptions.applyTelephoneFilter}
                    sampleRate={channelOptions.sampleRate}
                    isLiveMonitoring={isLiveMonitoring}
                    liveFreqBuffer={liveFreqBuffer}
                  />

                  {/* Reproductores de Audio para Canal A y Canal B */}
                  {originalSignal.length > 0 && (
                    <AudioPlayerDual
                      originalSignal={originalSignal}
                      degradedSignal={degradedSignal.length > 0 ? degradedSignal : originalSignal}
                      sampleRate={channelOptions.sampleRate}
                    />
                  )}
                </>
              )}

              {activeTab === "parametros" && (
                <div className="flex flex-col gap-4">
                  <div className="bg-[#181b25] p-4 sm:p-5 rounded-xl border border-[#262a34] shadow-lg">
                    <h3 className="text-base font-bold text-[#dfe2ef] mb-1.5">
                      Análisis Paramétrico del Canal de Transmisión
                    </h3>
                    <p className="text-xs text-[#bac9cc] leading-relaxed mb-4">
                      Ajusta la atenuación por distancia, ruido AWGN y el filtro telefónico ITU-T G.711. Observa el impacto sobre la relación señal/ruido (SNR) y la capacidad máxima teórica de Shannon-Hartley.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                      <div className="bg-[#0a0e17] p-3 rounded border border-[#262a34]">
                        <span className="text-[#849396] block text-[10px]">Atenuación:</span>
                        <span className="text-lg sm:text-xl font-bold text-[#ff8097]">
                          -{metrics?.attenuationDb.toFixed(1) || "0.0"} dB
                        </span>
                      </div>

                      <div className="bg-[#0a0e17] p-3 rounded border border-[#262a34]">
                        <span className="text-[#849396] block text-[10px]">SNR a la Salida:</span>
                        <span className="text-lg sm:text-xl font-bold text-[#00e5ff]">
                          {metrics?.outputSnrDb.toFixed(1) || "0.0"} dB
                        </span>
                      </div>

                      <div className="bg-[#0a0e17] p-3 rounded border border-[#262a34]">
                        <span className="text-[#849396] block text-[10px]">Límite Shannon:</span>
                        <span className="text-lg sm:text-xl font-bold text-[#c3f5ff]">
                          {metrics?.shannonCapacityKbps.toFixed(1) || "0.0"} Kbps
                        </span>
                      </div>
                    </div>
                  </div>

                  <SpectrumAnalyzerCanvas
                    inputFft={inputFft}
                    outputFft={outputFft}
                    f0={metrics ? metrics.f0 : 0}
                    telephoneFilterActive={channelSimulationEnabled && channelOptions.applyTelephoneFilter}
                    sampleRate={channelOptions.sampleRate}
                    isLiveMonitoring={isLiveMonitoring}
                    liveFreqBuffer={liveFreqBuffer}
                  />
                </div>
              )}

              {activeTab === "cascada" && (
                <WaterfallSpectrogramCanvas
                  signal={degradedSignal.length > 0 ? degradedSignal : originalSignal}
                  sampleRate={channelOptions.sampleRate}
                  durationSec={durationSec}
                />
              )}

              {activeTab === "telemetria" && (
                metrics ? (
                  <TelemetryTab metrics={metrics} options={channelOptions} />
                ) : (
                  <div className="bg-[#181b25] p-8 rounded-xl border border-[#262a34] text-center font-mono text-sm text-[#849396]">
                    Realiza una captura de voz o genera una señal de prueba para calcular la telemetría y curva de Shannon.
                  </div>
                )
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Fundamentos Teóricos */}
      <TheoryModal isOpen={isTheoryOpen} onClose={() => setIsTheoryOpen(false)} />
    </div>
  );
};
