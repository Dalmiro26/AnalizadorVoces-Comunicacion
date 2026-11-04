/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Presentación: Tarjetas Telemétricas de Parámetros Acústicos y de Telecomunicaciones.
 * 
 * Características:
 * - Diseño responsivo con flex-wrap y grid adaptativo para pantallas móviles sin desbordamiento.
 * - Tooltips interactivos con fundamentación técnica y fórmulas matemáticas de ingeniería.
 */

import React, { useState } from "react";
import { Info } from "lucide-react";
import { ChannelMetrics } from "../../domain/models/AudioModels";

interface MetricCardsProps {
  metrics: ChannelMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  return (
    <div className="grid min-w-0 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
      {/* Tarjeta 1: Clasificación Vocal */}
      <div className="group relative min-w-0 bg-[#181b25] p-3 rounded-xl flex flex-col justify-between shadow-md hover:bg-[#1c1f29] transition-colors border border-[#262a34]">
        <div className="flex items-start justify-between">
          <span className="font-mono text-[10px] text-[#849396] uppercase tracking-wider">
            Clasificación
          </span>
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setActiveTooltip("clasif")}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={() => setActiveTooltip((c) => (c === "clasif" ? null : "clasif"))}
              className="text-[#849396] hover:text-[#00e5ff] transition-colors focus:outline-none"
              aria-label="Información de clasificación vocal"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            {activeTooltip === "clasif" && (
              <div className="absolute top-5 right-0 z-50 w-52 p-2.5 bg-[#262a34] text-[#dfe2ef] rounded-lg shadow-2xl border border-[#00e5ff]/30 font-mono text-[11px] leading-tight pointer-events-none">
                <p className="text-[#00e5ff] font-bold mb-1">Acústica Vocal:</p>
                Detector por correlación cruzada normalizada (ACF). Discrimina registros vocales por f₀.
              </div>
            )}
          </div>
        </div>

        <div className="my-1.5">
          <span className="text-sm sm:text-base font-bold text-[#dfe2ef] block leading-tight truncate">
            {metrics.classification.category}
          </span>
          <span className="font-mono text-xs text-[#00e5ff] font-semibold block truncate">
            {metrics.classification.timbre}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#262a34] text-xs font-mono">
          <span className="text-[#849396] text-[10px]">CONFIANZA</span>
          <span className="text-[#00e5ff] font-bold">
            {(metrics.classification.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Tarjeta 2: Tono Fundamental f0 */}
      <div className="group relative min-w-0 bg-[#181b25] p-3 rounded-xl flex flex-col justify-between shadow-md hover:bg-[#1c1f29] transition-colors border border-[#262a34]">
        <div className="flex items-start justify-between">
          <span className="font-mono text-[10px] text-[#849396] uppercase tracking-wider">
            Fund. (f₀)
          </span>
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setActiveTooltip("f0")}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={() => setActiveTooltip((c) => (c === "f0" ? null : "f0"))}
              className="text-[#849396] hover:text-[#00e5ff] transition-colors focus:outline-none"
              aria-label="Información de tono fundamental f0"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            {activeTooltip === "f0" && (
              <div className="absolute top-5 right-0 z-50 w-56 p-2.5 bg-[#262a34] text-[#dfe2ef] rounded-lg shadow-2xl border border-[#00e5ff]/30 font-mono text-[11px] leading-tight pointer-events-none">
                <p className="text-[#00e5ff] font-bold mb-1">Tono Fundamental f₀:</p>
                Vibración glotal primaria. Calculada con r(τ) = Σ x[n]·x[n+τ] y periodo fundamental T₀ = 1/f₀.
              </div>
            )}
          </div>
        </div>

        <div className="my-1.5">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[#00e5ff] tabular-nums">
              {metrics.f0 > 0 ? metrics.f0.toFixed(1) : "—"}
            </span>
            <span className="font-mono text-xs text-[#849396]">Hz</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#262a34] text-xs font-mono">
          <span className="text-[#849396] text-[10px]">PERIODO T₀</span>
          <span className="text-[#dfe2ef] font-semibold tabular-nums">
            {metrics.periodT0 > 0 ? `${metrics.periodT0.toFixed(2)} ms` : "—"}
          </span>
        </div>
      </div>

      {/* Tarjeta 3: Ancho de Banda B */}
      <div className="group relative min-w-0 bg-[#181b25] p-3 rounded-xl flex flex-col justify-between shadow-md hover:bg-[#1c1f29] transition-colors border border-[#262a34]">
        <div className="flex items-start justify-between">
          <span className="font-mono text-[10px] text-[#849396] uppercase tracking-wider">
            Ancho Banda (B)
          </span>
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setActiveTooltip("bw")}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={() => setActiveTooltip((c) => (c === "bw" ? null : "bw"))}
              className="text-[#849396] hover:text-[#00e5ff] transition-colors focus:outline-none"
              aria-label="Información de ancho de banda"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            {activeTooltip === "bw" && (
              <div className="absolute top-5 right-0 z-50 w-56 p-2.5 bg-[#262a34] text-[#dfe2ef] rounded-lg shadow-2xl border border-[#00e5ff]/30 font-mono text-[11px] leading-tight pointer-events-none">
                <p className="text-[#00e5ff] font-bold mb-1">Ancho de Banda Eficaz B:</p>
                Rango espectral que contiene la energía principal (&gt; 10% del pico). B = f_sup - f_inf.
              </div>
            )}
          </div>
        </div>

        <div className="my-1.5">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[#dfe2ef] tabular-nums">
              {metrics.effectiveBandwidth.toLocaleString()}
            </span>
            <span className="font-mono text-xs text-[#849396]">Hz</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#262a34] text-xs font-mono">
          <span className="text-[#849396] text-[10px]">VENTANA</span>
          <span className="text-[#00daf3] font-semibold tabular-nums text-[11px]">
            {metrics.bwInf}-{metrics.bwSup} Hz
          </span>
        </div>
      </div>

      {/* Tarjeta 4: Potencia RMS y dBFS */}
      <div className="group relative min-w-0 bg-[#181b25] p-3 rounded-xl flex flex-col justify-between shadow-md hover:bg-[#1c1f29] transition-colors border border-[#262a34]">
        <div className="flex items-start justify-between">
          <span className="font-mono text-[10px] text-[#849396] uppercase tracking-wider">
            Potencia RMS
          </span>
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setActiveTooltip("power")}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={() => setActiveTooltip((c) => (c === "power" ? null : "power"))}
              className="text-[#849396] hover:text-[#00e5ff] transition-colors focus:outline-none"
              aria-label="Información de potencia dBFS"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            {activeTooltip === "power" && (
              <div className="absolute top-5 right-0 z-50 w-56 p-2.5 bg-[#262a34] text-[#dfe2ef] rounded-lg shadow-2xl border border-[#00e5ff]/30 font-mono text-[11px] leading-tight pointer-events-none">
                <p className="text-[#00e5ff] font-bold mb-1">Escala dBFS:</p>
                dBFS = 20·log₁₀(RMS / V_max). Relativo a la escala completa de 16 bits (0 dBFS = máximo antes de recorte).
              </div>
            )}
          </div>
        </div>

        <div className="my-1.5">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[#dfe2ef] tabular-nums">
              {metrics.dbfs.toFixed(1)}
            </span>
            <span className="font-mono text-xs text-[#849396]">dBFS</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 pt-1 border-t border-[#262a34]">
          <div className="flex justify-between font-mono text-[9px] text-[#849396]">
            <span>VU</span>
            <span className={metrics.dbfs > -3 ? "text-[#ff8097] font-bold" : "text-[#00e5ff]"}>
              {metrics.dbfs > -3 ? "PEAK CLIP" : "PEAK OK"}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#0a0e17] overflow-hidden flex gap-0.5">
            <div
              className="h-full bg-[#00e5ff] transition-all duration-300"
              style={{ width: `${Math.min(70, Math.max(5, (metrics.dbfs + 60) * 1.5))}%` }}
            />
            <div
              className="h-full bg-[#3b82f6] transition-all duration-300"
              style={{ width: metrics.dbfs > -18 ? "20%" : "0%" }}
            />
            <div
              className="h-full bg-[#ff4d6d] transition-all duration-300"
              style={{ width: metrics.dbfs > -6 ? "10%" : "0%" }}
            />
          </div>
        </div>
      </div>

      {/* Tarjeta 5: Capacidad de Shannon (C) */}
      <div className="group relative min-w-0 bg-[#181b25] p-3 rounded-xl flex flex-col justify-between shadow-md hover:bg-[#1c1f29] transition-colors border border-[#262a34]">
        <div className="flex items-start justify-between">
          <span className="font-mono text-[10px] text-[#849396] uppercase tracking-wider">
            Capacidad (C)
          </span>
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setActiveTooltip("shannon")}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={() => setActiveTooltip((c) => (c === "shannon" ? null : "shannon"))}
              className="text-[#849396] hover:text-[#00e5ff] transition-colors focus:outline-none"
              aria-label="Información de capacidad de Shannon-Hartley"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            {activeTooltip === "shannon" && (
              <div className="absolute top-5 right-0 z-50 w-64 p-2.5 bg-[#262a34] text-[#dfe2ef] rounded-lg shadow-2xl border border-[#00e5ff]/30 font-mono text-[11px] leading-tight pointer-events-none">
                <p className="text-[#00e5ff] font-bold mb-1">Teorema de Shannon-Hartley:</p>
                <code className="text-[#c3f5ff] block mb-1">C = B · log₂(1 + S/N)</code>
                Cota superior teórica de transmisión libre de errores por canal con ancho de banda B y ruido AWGN.
              </div>
            )}
          </div>
        </div>

        <div className="my-1.5">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[#00e5ff] tabular-nums">
              {metrics.shannonCapacityKbps.toFixed(1)}
            </span>
            <span className="font-mono text-xs text-[#849396]">Kbps</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#262a34] text-xs font-mono">
          <span className="text-[#849396] text-[10px]">EFICIENCIA</span>
          <span className="text-[#00e5ff] font-semibold tabular-nums text-[11px]">
            C/B = {metrics.spectralEfficiency.toFixed(1)} b/s/Hz
          </span>
        </div>
      </div>
    </div>
  );
};
