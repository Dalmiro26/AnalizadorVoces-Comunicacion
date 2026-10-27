/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Presentación: Panel de Control de Captura y Parámetros del Canal Físico.
 * 
 * Estética Académica: Limpia, sobria y profesional, enfocada en parámetros de laboratorio.
 */

import React from "react";
import { Mic, Radio, Play, Square, Sparkles } from "lucide-react";
import { ChannelSimulationOptions } from "../../domain/models/AudioModels";
import { AnalyticalSignalType } from "../../domain/services/SignalGeneratorService";

interface ChannelControlsProps {
  durationSec: number;
  setDurationSec: (sec: number) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  elapsedSec: number;
  options: ChannelSimulationOptions;
  onOptionsChange: (newOpts: Partial<ChannelSimulationOptions>) => void;
  channelSimulationEnabled: boolean;
  setChannelSimulationEnabled: (val: boolean) => void;
  onGenerateTestSignal?: (type: AnalyticalSignalType) => void;
}

export const ChannelControls: React.FC<ChannelControlsProps> = ({
  durationSec,
  setDurationSec,
  isRecording,
  onToggleRecording,
  elapsedSec,
  options,
  onOptionsChange,
  channelSimulationEnabled,
  setChannelSimulationEnabled,
  onGenerateTestSignal,
}) => {
  const totalAttenuationDb = (options.distanceKm * options.alphaDbPerKm).toFixed(1);
  const noisePct = Math.min(100, Math.max(5, ((options.injectedSnrDb + 45) / 45) * 100));

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `[${mins.toString().padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}s]`;
  };

  return (
    <aside className="w-full flex flex-col gap-3">
      {/* 1. Panel de Captura Real de Voz (Micrófono) */}
      <div className="bg-[#181b25] p-3 sm:p-4 rounded-xl shadow-lg flex flex-col gap-3 border border-[#262a34]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-[#00e5ff]" />
            <span className="text-sm font-semibold text-[#dfe2ef] tracking-tight">
              Captura de Voz
            </span>
          </div>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1c1f29] text-[#00e5ff] uppercase tracking-wider border border-[#262a34]">
            PCM Mono 16-bit
          </span>
        </div>

        {/* Botón Principal de Captura */}
        <button
          onClick={onToggleRecording}
          type="button"
          className={`w-full py-3 px-4 rounded-lg font-mono text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
            isRecording
              ? "bg-[#ff4d6d] text-white hover:bg-[#ff8097] animate-pulse"
              : "bg-[#00e5ff] text-[#00363d] hover:bg-[#9cf0ff]"
          }`}
        >
          {isRecording ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>DETENER CAPTURA {formatTimer(elapsedSec)}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>INICIAR CAPTURA DE AUDIO</span>
            </>
          )}
        </button>

        {/* Control de Duración de Muestreo */}
        <div className="flex flex-col gap-1.5 bg-[#0a0e17] p-2.5 rounded-lg border border-[#1c1f29]">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10px] text-[#849396] uppercase" htmlFor="dur-slider">
              Duración de Muestreo:
            </label>
            <span className="font-mono text-xs text-[#00e5ff] font-bold">
              {durationSec.toFixed(1)} s
            </span>
          </div>
          <input
            id="dur-slider"
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={durationSec}
            disabled={isRecording}
            onChange={(e) => setDurationSec(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#1c1f29] rounded-lg appearance-none cursor-pointer accent-[#00e5ff] disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="flex justify-between font-mono text-[10px] text-[#849396]">
            <span>1.0s</span>
            <span>5.0s</span>
            <span>10.0s</span>
          </div>
        </div>

        {/* Señales Analíticas de Prueba (Para pruebas sin micrófono) */}
        {onGenerateTestSignal && (
          <div className="flex flex-col gap-1.5 pt-1 border-t border-[#262a34]">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#849396]">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#00e5ff]" /> Señal de Prueba:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => onGenerateTestSignal("male_voice")}
                disabled={isRecording}
                className="px-2 py-1.5 rounded bg-[#1c1f29] hover:bg-[#262a34] text-[#bac9cc] hover:text-[#00e5ff] transition-colors border border-[#262a34] text-left truncate disabled:opacity-50"
              >
                Voz Masculina (120Hz)
              </button>
              <button
                type="button"
                onClick={() => onGenerateTestSignal("female_voice")}
                disabled={isRecording}
                className="px-2 py-1.5 rounded bg-[#1c1f29] hover:bg-[#262a34] text-[#bac9cc] hover:text-[#00e5ff] transition-colors border border-[#262a34] text-left truncate disabled:opacity-50"
              >
                Voz Femenina (220Hz)
              </button>
              <button
                type="button"
                onClick={() => onGenerateTestSignal("sine_1khz")}
                disabled={isRecording}
                className="px-2 py-1.5 rounded bg-[#1c1f29] hover:bg-[#262a34] text-[#bac9cc] hover:text-[#00e5ff] transition-colors border border-[#262a34] text-left truncate disabled:opacity-50"
              >
                Tono Puro (1 kHz)
              </button>
              <button
                type="button"
                onClick={() => onGenerateTestSignal("chirp_sweep")}
                disabled={isRecording}
                className="px-2 py-1.5 rounded bg-[#1c1f29] hover:bg-[#262a34] text-[#bac9cc] hover:text-[#00e5ff] transition-colors border border-[#262a34] text-left truncate disabled:opacity-50"
              >
                Barrido Chirp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Condiciones del Canal de Transmisión */}
      <div className="bg-[#181b25] p-3 sm:p-4 rounded-xl shadow-lg flex flex-col gap-3 border border-[#262a34]">
        <div className="flex items-center justify-between pb-2 border-b border-[#262a34]">
          <div className="flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-[#00daf3]" />
            <h2 className="text-sm font-semibold text-[#dfe2ef] tracking-tight">
              Condiciones de Canal
            </h2>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={channelSimulationEnabled}
              onChange={(e) => setChannelSimulationEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#31353f] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#0a0e17] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#dfe2ef] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00e5ff]" />
          </label>
        </div>

        <div className="flex items-center justify-between bg-[#0a0e17] px-2.5 py-1.5 rounded border border-[#1c1f29] text-xs font-mono">
          <span className="text-[#849396]">Simulación de Canal:</span>
          <span
            className={`font-bold ${
              channelSimulationEnabled ? "text-[#00e5ff]" : "text-[#849396]"
            }`}
          >
            {channelSimulationEnabled ? "HABILITADA" : "DESHABILITADA (PASO DIRECTO)"}
          </span>
        </div>

        {/* Controles de Parámetros del Canal */}
        <div
          className={`flex flex-col gap-3 transition-opacity ${
            channelSimulationEnabled ? "opacity-100" : "opacity-40 pointer-events-none"
          }`}
        >
          {/* Deslizador 1: Atenuación por Distancia */}
          <div className="flex flex-col gap-1.5 bg-[#0a0e17] p-2.5 rounded-lg border border-[#1c1f29]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#849396] uppercase">
                Atenuación por Distancia
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1c1f29] text-[#ff8097] font-bold">
                -{totalAttenuationDb} dB
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-[#dfe2ef] font-semibold">
                {options.distanceKm.toFixed(1)} km
              </span>
              <span className="font-mono text-[10px] text-[#849396]">
                α = {options.alphaDbPerKm.toFixed(1)} dB/km
              </span>
            </div>
            <input
              id="dist-slider"
              type="range"
              min="0"
              max="50"
              step="0.5"
              value={options.distanceKm}
              onChange={(e) => onOptionsChange({ distanceKm: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-[#1c1f29] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
            />
            <div className="flex justify-between font-mono text-[10px] text-[#849396]">
              <span>0 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* Deslizador 2: Inyección de Ruido AWGN */}
          <div className="flex flex-col gap-1.5 bg-[#0a0e17] p-2.5 rounded-lg border border-[#1c1f29]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#849396] uppercase">
                Inyección Ruido (AWGN)
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1c1f29] text-[#c3f5ff] font-bold">
                Blanco Gaussiano
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-[#ff8097] font-semibold">
                {options.injectedSnrDb.toFixed(1)} dB SNR
              </span>
              <span className="font-mono text-[10px] text-[#849396]">
                Nivel S/N
              </span>
            </div>
            <input
              id="noise-slider"
              type="range"
              min="-45"
              max="20"
              step="1"
              value={options.injectedSnrDb}
              onChange={(e) => onOptionsChange({ injectedSnrDb: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-[#1c1f29] rounded-lg appearance-none cursor-pointer accent-[#ff4d6d]"
            />
            <div className="w-full h-1 rounded-full bg-[#1c1f29] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00e5ff] via-[#3b82f6] to-[#ff4d6d] transition-all"
                style={{ width: `${noisePct}%` }}
              />
            </div>
          </div>

          {/* Interruptor 3: Filtro Telefónico ITU-T G.711 */}
          <div className="bg-[#1c1f29] p-2.5 rounded-lg flex flex-col gap-1 border border-[#262a34]">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-[11px] text-[#dfe2ef] font-bold uppercase tracking-wider">
                  Filtro Telefónico
                </span>
                <span className="font-mono text-[11px] text-[#bac9cc]">
                  Pasa-banda 300 Hz – 3,400 Hz
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="filter-toggle"
                  type="checkbox"
                  checked={options.applyTelephoneFilter}
                  onChange={(e) => onOptionsChange({ applyTelephoneFilter: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-[#31353f] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#0a0e17] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#dfe2ef] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00e5ff]" />
              </label>
            </div>
            <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
              <span className="text-[#849396]">NORMA ITU-T G.711</span>
              <span
                className={`px-1.5 py-0.5 rounded font-semibold ${
                  options.applyTelephoneFilter
                    ? "bg-[#00e5ff]/20 text-[#00e5ff]"
                    : "bg-[#262a34] text-[#849396]"
                }`}
              >
                {options.applyTelephoneFilter ? "ACTIVO" : "BYPASS"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
