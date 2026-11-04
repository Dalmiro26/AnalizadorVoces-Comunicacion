/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Presentación: Vista de Telemetría Avanzada & Curva de Capacidad de Shannon-Hartley.
 */

import React from "react";
import { ChannelMetrics, ChannelSimulationOptions } from "../../domain/models/AudioModels";
import { ShannonService } from "../../domain/services/ShannonService";

interface TelemetryTabProps {
  metrics: ChannelMetrics;
  options: ChannelSimulationOptions;
}

export const TelemetryTab: React.FC<TelemetryTabProps> = ({ metrics, options }) => {
  const B = options.applyTelephoneFilter ? 3100 : metrics.effectiveBandwidth;
  const capacityPoints = ShannonService.generateCapacityCurve(B, -20, 40, 2);
  const maxCap = capacityPoints[capacityPoints.length - 1].capacityKbps;

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Curva de Shannon-Hartley */}
      <div className="bg-[#181b25] p-4 sm:p-5 rounded-xl border border-[#262a34] shadow-lg">
        <div className="flex flex-col items-start justify-between gap-3 pb-3 border-b border-[#262a34] sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-bold text-[#dfe2ef]">
              Curva de Capacidad de Shannon-Hartley: C vs SNR
            </h3>
            <p className="text-xs font-mono text-[#849396]">
              C = B · log₂(1 + S/N) con Ancho de Banda B = {B.toLocaleString()} Hz
            </p>
          </div>
          <span className="max-w-full break-words font-mono text-xs text-[#00e5ff] bg-[#00e5ff]/10 px-2.5 py-1 rounded border border-[#00e5ff]/30 font-semibold">
            Punto Operativo: {metrics.outputSnrDb.toFixed(1)} dB → {metrics.shannonCapacityKbps.toFixed(1)} Kbps
          </span>
        </div>

        {/* Gráfico SVG Vectorial de la Curva */}
        <div className="relative mt-3 w-full overflow-x-auto rounded-lg border border-[#1c1f29] bg-[#0a0e17] p-2">
          <svg className="h-64 w-full min-w-[520px]" viewBox="0 0 640 230" preserveAspectRatio="xMidYMid meet">
            {/* Cuadrícula */}
            {[62, 199, 336, 473, 610].map((x) => (
              <line key={`x-${x}`} x1={x} y1="20" x2={x} y2="185" stroke="#1c2230" strokeWidth="1" />
            ))}
            {[20, 61, 102, 143, 185].map((y) => (
              <line
                key={`y-${y}`}
                x1="62"
                y1={y}
                x2="610"
                y2={y}
                stroke={y === 185 ? "#3b494c" : "#1c2230"}
                strokeWidth={y === 185 ? "1.5" : "1"}
                strokeDasharray={y === 185 ? undefined : "2,2"}
              />
            ))}

            {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
              <text
                key={`ylabel-${fraction}`}
                x="55"
                y={188 - fraction * 165}
                textAnchor="end"
                fill="#849396"
                fontSize="10"
                fontFamily="monospace"
              >
                {(maxCap * fraction).toFixed(0)}
              </text>
            ))}
            {[-20, -5, 10, 25, 40].map((snr, index) => (
              <text
                key={`xlabel-${snr}`}
                x={62 + index * 137}
                y="204"
                textAnchor="middle"
                fill="#849396"
                fontSize="10"
                fontFamily="monospace"
              >
                {snr > 0 ? `+${snr}` : snr}
              </text>
            ))}
            <text x="336" y="223" textAnchor="middle" fill="#849396" fontSize="10" fontFamily="monospace">
              SNR (dB)
            </text>
            <text
              x="13"
              y="103"
              textAnchor="middle"
              fill="#849396"
              fontSize="10"
              fontFamily="monospace"
              transform="rotate(-90 13 103)"
            >
              Capacidad (Kbps)
            </text>

            {/* Trazo continuo de la curva */}
            <path
              d={capacityPoints
                .map((p, idx) => {
                  const x = 62 + ((p.snrDb + 20) / 60) * (610 - 62);
                  const y = 185 - (p.capacityKbps / maxCap) * (185 - 20);
                  return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2.5"
            />

            {/* Punto de trabajo operativo actual */}
            {(() => {
              const currentX = Math.max(
                62,
                Math.min(610, 62 + ((metrics.outputSnrDb + 20) / 60) * (610 - 62))
              );
              const currentY = Math.max(
                20,
                Math.min(185, 185 - (metrics.shannonCapacityKbps / maxCap) * (185 - 20))
              );
              const labelX = currentX > 470 ? currentX - 8 : currentX + 8;
              return (
                <g>
                  <circle cx={currentX} cy={currentY} r="6" fill="#ff4d6d" stroke="#ffffff" strokeWidth="2" />
                  <line
                    x1={currentX}
                    y1={currentY}
                    x2={currentX}
                    y2="185"
                    stroke="#ff4d6d"
                    strokeDasharray="2,2"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="62"
                    y1={currentY}
                    x2={currentX}
                    y2={currentY}
                    stroke="#ff4d6d"
                    strokeDasharray="2,2"
                    strokeWidth="1.5"
                  />
                  <text
                    x={labelX}
                    y={Math.max(32, currentY - 8)}
                    textAnchor={currentX > 470 ? "end" : "start"}
                    fill="#ff4d6d"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    OP: {metrics.outputSnrDb.toFixed(1)}dB, {metrics.shannonCapacityKbps.toFixed(1)}k
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* 2. Matriz de Balance de Enlace (Link Budget) */}
      <div className="bg-[#181b25] p-4 rounded-xl border border-[#262a34]">
        <h4 className="text-sm font-bold text-[#dfe2ef] mb-3">
          Balance de Potencia y Presupuesto de Enlace (Link Budget)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border border-[#262a34]">
            <thead className="bg-[#1c1f29] text-[#00e5ff]">
              <tr>
                <th className="p-2 border border-[#262a34]">Parámetro</th>
                <th className="p-2 border border-[#262a34]">Valor Canal A (Fuente)</th>
                <th className="p-2 border border-[#262a34]">Valor Canal B (Salida)</th>
                <th className="p-2 border border-[#262a34]">Delta / Impacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a34] text-[#bac9cc]">
              <tr>
                <td className="p-2 text-[#dfe2ef] font-semibold">Potencia de Señal</td>
                <td className="p-2">{metrics.dbfs.toFixed(1)} dBFS</td>
                <td className="p-2">{(metrics.dbfs - metrics.attenuationDb).toFixed(1)} dBFS</td>
                <td className="p-2 text-[#ff8097]">-{metrics.attenuationDb.toFixed(1)} dB (Atenuación)</td>
              </tr>
              <tr>
                <td className="p-2 text-[#dfe2ef] font-semibold">Ruido de Fondo</td>
                <td className="p-2">&lt; -84.0 dBFS (Piso PCM)</td>
                <td className="p-2">{(metrics.dbfs - metrics.attenuationDb - metrics.outputSnrDb).toFixed(1)} dBFS</td>
                <td className="p-2 text-[#ff8097]">Inyección AWGN activa</td>
              </tr>
              <tr>
                <td className="p-2 text-[#dfe2ef] font-semibold">Ancho de Banda (B)</td>
                <td className="p-2">22,050 Hz (Nyquist)</td>
                <td className="p-2">{options.applyTelephoneFilter ? "3,100 Hz (PSTN)" : `${metrics.effectiveBandwidth} Hz`}</td>
                <td className="p-2 text-[#00e5ff]">{options.applyTelephoneFilter ? "Filtro 300-3400 Hz" : "Banda base"}</td>
              </tr>
              <tr>
                <td className="p-2 text-[#dfe2ef] font-semibold">Capacidad Máxima (C)</td>
                <td className="p-2">&gt; 350.0 Kbps</td>
                <td className="p-2">{metrics.shannonCapacityKbps.toFixed(1)} Kbps</td>
                <td className="p-2 text-[#c3f5ff]">Límite Shannon-Hartley</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
