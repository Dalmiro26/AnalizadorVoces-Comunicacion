/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Presentación: Analizador de Espectro FFT (Dominio de la Frecuencia).
 * 
 * Características:
 * - Banda vocal telefónica sombreada (300 Hz a 3400 Hz según ITU-T G.711).
 * - Marcadores de formantes acústicos f0, F1, F2 y F3.
 * - Leyendas de ejes dibujadas por fuera de la gráfica.
 * - Contenedor con 'touch-action: none' para gestos táctiles fluidos sin scroll de página.
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import { FFTResult } from "../../domain/models/AudioModels";
import { WindowFunctionType } from "../../domain/services/FourierService";

interface SpectrumAnalyzerCanvasProps {
  inputFft: FFTResult | null;
  outputFft: FFTResult | null;
  f0: number;
  telephoneFilterActive: boolean;
  sampleRate: number;
  isLiveMonitoring?: boolean;
  liveFreqBuffer?: Float32Array;
}

export const SpectrumAnalyzerCanvas: React.FC<SpectrumAnalyzerCanvasProps> = ({
  inputFft,
  outputFft,
  f0,
  telephoneFilterActive,
  sampleRate,
  isLiveMonitoring = false,
  liveFreqBuffer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [useLogScale, setUseLogScale] = useState<boolean>(true);
  const [windowType, setWindowType] = useState<WindowFunctionType>("HAMMING");
  const [hoverInfo, setHoverInfo] = useState<{ freq: number; db: number; x: number; y: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffsetHz, setPanOffsetHz] = useState<number>(0);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const pinchDistanceRef = useRef<number | null>(null);
  const mouseDragRef = useRef<{ x: number; pan: number } | null>(null);
  const touchPanXRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Limpiar fondo
    ctx.fillStyle = "#0a0e17";
    ctx.fillRect(0, 0, width, height);

    const maxFreqView = 8000 / zoomLevel;
    const maxFreqEnd = panOffsetHz + maxFreqView;

    // 2. Cuadrícula de referencia
    ctx.strokeStyle = "#1c2230";
    ctx.lineWidth = 1;

    // Líneas horizontales de dB
    const numDbLines = 6;
    for (let i = 0; i <= numDbLines; i++) {
      const y = (i * height) / numDbLines;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Líneas verticales de Frecuencia
    const freqStep = maxFreqView <= 2500 ? 500 : 1000;
    for (let f = Math.ceil(panOffsetHz / freqStep) * freqStep; f < maxFreqEnd; f += freqStep) {
      const x = ((f - panOffsetHz) / maxFreqView) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 3. Banda Telefónica Sombreada (300 Hz - 3400 Hz PSTN)
    const xPhoneStart = ((300 - panOffsetHz) / maxFreqView) * width;
    const xPhoneEnd = ((3400 - panOffsetHz) / maxFreqView) * width;
    const phoneWidth = xPhoneEnd - xPhoneStart;

    ctx.fillStyle = "rgba(0, 229, 255, 0.07)";
    ctx.fillRect(xPhoneStart, 0, phoneWidth, height);

    ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(xPhoneStart, 0);
    ctx.lineTo(xPhoneStart, height);
    ctx.moveTo(xPhoneEnd, 0);
    ctx.lineTo(xPhoneEnd, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Etiqueta de la banda telefónica
    ctx.fillStyle = "rgba(28, 34, 48, 0.85)";
    ctx.fillRect(xPhoneStart + 6, 8, 210, 18);
    ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
    ctx.strokeRect(xPhoneStart + 6, 8, 210, 18);
    ctx.fillStyle = "#00e5ff";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.fillText("CANAL DE VOZ: 300 Hz – 3,400 Hz (PSTN)", xPhoneStart + 12, 21);

    const mapMagToY = (magDb: number, magLinear: number) => {
      if (useLogScale) {
        const clamped = Math.max(-90, Math.min(0, magDb));
        const normalized = (clamped - -90) / 90;
        return height - normalized * (height * 0.9) - height * 0.05;
      } else {
        const normalized = Math.min(1.0, magLinear * 3.5);
        return height - normalized * (height * 0.9) - height * 0.05;
      }
    };

    // 4. Curva Espectral CH1 (Original / Tiempo Real - Cyan)
    if (isLiveMonitoring && liveFreqBuffer && liveFreqBuffer.length > 0) {
      const numBins = liveFreqBuffer.length;
      const binFreqStep = (sampleRate / 2) / numBins;

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "rgba(0, 229, 255, 0.35)");
      grad.addColorStop(0.7, "rgba(0, 229, 255, 0.08)");
      grad.addColorStop(1, "rgba(0, 229, 255, 0.0)");

      ctx.beginPath();
      let started = false;

      for (let i = 0; i < numBins; i++) {
        const f = i * binFreqStep;
        if (f > maxFreqEnd) break;
        const x = ((f - panOffsetHz) / maxFreqView) * width;
        const db = liveFreqBuffer[i];
        const y = mapMagToY(db, 0);

        if (!started) {
          ctx.moveTo(x, height);
          ctx.lineTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      for (let i = 0; i < numBins; i++) {
        const f = i * binFreqStep;
        if (f > maxFreqEnd) break;
        const x = ((f - panOffsetHz) / maxFreqView) * width;
        const db = liveFreqBuffer[i];
        const y = mapMagToY(db, 0);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (inputFft && inputFft.frequencies && inputFft.frequencies.length > 0) {
      const freqs = inputFft.frequencies;
      const magsDb = inputFft.magnitudesDb;
      const mags = inputFft.magnitudes;

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "rgba(0, 229, 255, 0.35)");
      grad.addColorStop(0.7, "rgba(0, 229, 255, 0.08)");
      grad.addColorStop(1, "rgba(0, 229, 255, 0.0)");

      ctx.beginPath();
      let started = false;

      for (let i = 0; i < freqs.length; i++) {
        const f = freqs[i];
        if (f > maxFreqEnd) break;
        const x = ((f - panOffsetHz) / maxFreqView) * width;
        const y = mapMagToY(magsDb[i], mags[i]);

        if (!started) {
          ctx.moveTo(x, height);
          ctx.lineTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      for (let i = 0; i < freqs.length; i++) {
        const f = freqs[i];
        if (f > maxFreqEnd) break;
        const x = ((f - panOffsetHz) / maxFreqView) * width;
        const y = mapMagToY(magsDb[i], mags[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else {
      const floorY = height * 0.95;
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(width, floorY);
      ctx.stroke();
    }

    // 5. Curva Espectral CH2 (Canal Simulado - Coral Punteado)
    if (!isLiveMonitoring && outputFft && outputFft.frequencies && outputFft.frequencies.length > 0) {
      const freqs = outputFft.frequencies;
      const magsDb = outputFft.magnitudesDb;
      const mags = outputFft.magnitudes;

      ctx.strokeStyle = "#ff4d6d";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();

      for (let i = 0; i < freqs.length; i++) {
        const f = freqs[i];
        if (f > maxFreqEnd) break;
        const x = ((f - panOffsetHz) / maxFreqView) * width;
        const y = mapMagToY(magsDb[i], mags[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 6. Marcadores de Formantes Vocales (f0, F1, F2, F3)
    const drawFormantMarker = (
      freq: number,
      label: string,
      color: string,
      badgeBg: string,
      note?: string
    ) => {
      if (freq <= panOffsetHz || freq > maxFreqEnd) return;
      const x = ((freq - panOffsetHz) / maxFreqView) * width;
      const y = 50;

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y + 14);
      ctx.lineTo(x, height - 10);
      ctx.stroke();

      ctx.fillStyle = badgeBg;
      ctx.fillRect(x - 12, y, 24, 14);
      ctx.strokeStyle = color;
      ctx.strokeRect(x - 12, y, 24, 14);

      ctx.fillStyle = badgeBg === "#00e5ff" ? "#00363d" : color;
      ctx.font = "bold 8px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(label, x, y + 10);
      ctx.textAlign = "start";

      if (note) {
        ctx.fillStyle = color;
        ctx.font = "8px 'JetBrains Mono', monospace";
        ctx.fillText(note, x + 16, y + 10);
      }
    };

    if (f0 > 40 && f0 < 600) {
      drawFormantMarker(f0, "f₀", "#00e5ff", "#00e5ff");
    }
    drawFormantMarker(720, "F1", "#c3f5ff", "#262a34");
    drawFormantMarker(1250, "F2", "#c3f5ff", "#262a34");
    if (telephoneFilterActive) {
      drawFormantMarker(4800, "F3", "#ff4d6d", "#40000f", "Atenuado (-42dB)");
    }

    // 7. Cursor de Inspección Espectral (Hover)
    if (hoverInfo) {
      ctx.strokeStyle = "#bac9cc";
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(hoverInfo.x, 0);
      ctx.lineTo(hoverInfo.x, height);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#1c1f29";
      ctx.fillRect(hoverInfo.x + 8, hoverInfo.y - 12, 100, 24);
      ctx.strokeStyle = "#00e5ff";
      ctx.strokeRect(hoverInfo.x + 8, hoverInfo.y - 12, 100, 24);
      ctx.fillStyle = "#dfe2ef";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillText(`${hoverInfo.freq.toFixed(0)} Hz`, hoverInfo.x + 12, hoverInfo.y + 1);
      ctx.fillStyle = "#00e5ff";
      ctx.fillText(`${hoverInfo.db.toFixed(1)} dBFS`, hoverInfo.x + 60, hoverInfo.y + 1);
    }
  }, [
    inputFft,
    outputFft,
    f0,
    telephoneFilterActive,
    sampleRate,
    useLogScale,
    hoverInfo,
    isLiveMonitoring,
    liveFreqBuffer,
    zoomLevel,
    panOffsetHz,
  ]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const width = canvas.width;
    const height = canvas.height;

    const maxFreqView = 8000 / zoomLevel;
    const freq = panOffsetHz + (x / width) * maxFreqView;

    const normalizedY = 1.0 - y / height;
    const db = -90 + normalizedY * 90;

    setHoverInfo({ freq, db, x, y });
    if (mouseDragRef.current && e.buttons === 1) {
      setPanOffsetHz(
        Math.max(
          0,
          Math.min(
            8000 - maxFreqView,
            mouseDragRef.current.pan -
              ((e.clientX - mouseDragRef.current.x) / rect.width) * maxFreqView
          )
        )
      );
    }
  };

  const handleMouseLeave = () => {
    setHoverInfo(null);
    mouseDragRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    mouseDragRef.current = { x: e.clientX, pan: panOffsetHz };
  };

  const handleMouseUp = () => {
    mouseDragRef.current = null;
  };

  // Gestos táctiles optimizados con touch-action: none
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      touchPanXRef.current = null;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDistanceRef.current = Math.hypot(dx, dy);
    } else if (e.touches.length === 1) {
      touchPanXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && touchPanXRef.current !== null) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect && rect.width > 0) {
        const currentX = e.touches[0].clientX;
        const deltaX = currentX - touchPanXRef.current;
        const maxFreqView = 8000 / zoomLevel;
        setPanOffsetHz((offset) =>
          Math.max(
            0,
            Math.min(8000 - maxFreqView, offset - (deltaX / rect.width) * maxFreqView)
          )
        );
        touchPanXRef.current = currentX;
      }
      return;
    }
    if (e.touches.length !== 2 || pinchDistanceRef.current === null) return;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const distance = Math.hypot(dx, dy);
    const scale = distance / pinchDistanceRef.current;
    const nextZoom = Math.max(1, Math.min(8, zoomLevel * scale));
    setZoomLevel(nextZoom);
    setPanOffsetHz((offset) => Math.min(offset, 8000 - 8000 / nextZoom));
    pinchDistanceRef.current = distance;
  };

  const handleTouchEnd = () => {
    pinchDistanceRef.current = null;
    touchPanXRef.current = null;
  };

  const handleWheelNative = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const nextZoom =
        e.deltaY < 0
          ? Math.min(8, Math.round((zoomLevel + 0.25) * 100) / 100)
          : Math.max(1, Math.round((zoomLevel - 0.25) * 100) / 100);
      setZoomLevel(nextZoom);
      setPanOffsetHz((offset) => Math.min(offset, 8000 - 8000 / nextZoom));
    },
    [zoomLevel]
  );

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    container.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheelNative);
    };
  }, [handleWheelNative]);

  const maxFreqViewCurrent = Math.round(8000 / zoomLevel);

  return (
    <div className="bg-[#181b25] rounded-xl p-3 sm:p-4 shadow-lg flex flex-col gap-2.5 border border-[#262a34]">
      {/* Barra superior de herramientas */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff]"></span>
            <h3 className="font-semibold text-sm sm:text-base text-[#dfe2ef] tracking-tight">
              Dominio de la Frecuencia (FFT)
            </h3>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#00e5ff]/15 text-[#00e5ff] font-semibold border border-[#00e5ff]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]"></span> BANDA TELEFÓNICA (300 Hz - 3400 Hz)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <div className="bg-[#0a0e17] px-2 py-1 rounded text-[#00e5ff] border border-[#262a34]">
            <span>Zoom: {zoomLevel.toFixed(2)}x</span>
          </div>
          {(zoomLevel > 1.0 || panOffsetHz > 0) && (
            <button
              onClick={() => {
                setZoomLevel(1.0);
                setPanOffsetHz(0);
              }}
              className="px-2 py-1 rounded bg-[#262a34] text-[#849396] hover:text-[#dfe2ef] flex items-center gap-1"
              type="button"
              title="Restablecer zoom"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
          <div className="flex items-center gap-1 bg-[#1c1f29] px-2 py-1 rounded border border-[#262a34]">
            <span className="text-[#849396]">VENTANA:</span>
            <button
              onClick={() =>
                setWindowType((w) =>
                  w === "HAMMING" ? "HANNING" : w === "HANNING" ? "RECT" : "HAMMING"
                )
              }
              className="text-[#00e5ff] font-bold hover:underline"
              type="button"
            >
              {windowType}
            </button>
          </div>
          <button
            onClick={() => setUseLogScale((l) => !l)}
            className={`px-2 py-1 rounded font-bold transition-colors border ${
              useLogScale
                ? "bg-[#262a34] text-[#00e5ff] border-[#00e5ff]/40"
                : "bg-[#1c1f29] text-[#bac9cc] border-[#31353f]"
            }`}
            type="button"
            title="Alternar escala logarítmica (dBFS) o lineal"
          >
            {useLogScale ? "LOG (dB)" : "LINEAL"}
          </button>
        </div>
      </div>

      {/* Escala Superior Externa (Fuera de la onda) */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:flex sm:justify-between items-center font-mono text-[10px] sm:text-[11px] text-[#849396] px-2 py-1 bg-[#0a0e17] rounded-md border border-[#1c1f29]">
        <span>Escala: <strong className="text-[#dfe2ef]">0 a -90 dBFS</strong></span>
        <span className="text-right sm:text-left">Piso de Ruido: <strong className="text-[#bac9cc]">-84 dB</strong></span>
        <span className="col-span-2 sm:col-span-1 text-center sm:text-left text-[#00e5ff]">
          {telephoneFilterActive ? "FILTRO PASA-BANDA ACTIVO (300-3400 Hz)" : "RESPUESTA EN FRECUENCIA PLANA"}
        </span>
      </div>

      {/* Visor Canvas del Analizador de Espectro con touch-action: none */}
      <div className="flex min-w-0 gap-2">
        <div className="h-56 sm:h-64 py-1 flex flex-col justify-between font-mono text-[9px] text-[#849396] text-right shrink-0">
          <span>0 dBFS</span>
          <span>-15 dB</span>
          <span>-30 dB</span>
          <span>-45 dB</span>
          <span>-60 dB</span>
          <span>-75 dB</span>
          <span>-90 dB</span>
        </div>
        <div
          ref={canvasContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "none" }}
          className="relative min-w-0 flex-1 h-56 sm:h-64 bg-[#0a0e17] rounded-lg overflow-hidden border border-[#1c1f29]"
        >
          <canvas
            ref={canvasRef}
            width={1000}
            height={260}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className="w-full h-full cursor-grab active:cursor-grabbing block"
          />
        </div>
      </div>

      {/* Eje de Frecuencia Inferior Externo (Fuera de la onda) */}
      <div className="flex justify-between items-center font-mono text-[9px] sm:text-[11px] text-[#849396] px-2 py-1 bg-[#0a0e17] rounded-md border border-[#1c1f29]">
        <span>{Math.round(panOffsetHz).toLocaleString()} Hz</span>
        <span>{Math.round(panOffsetHz + maxFreqViewCurrent * 0.25).toLocaleString()} Hz</span>
        <span className="text-[#00e5ff] font-bold">
          {Math.round(panOffsetHz + maxFreqViewCurrent * 0.5).toLocaleString()} Hz
        </span>
        <span>{Math.round(panOffsetHz + maxFreqViewCurrent * 0.75).toLocaleString()} Hz</span>
        <span>{Math.round(panOffsetHz + maxFreqViewCurrent).toLocaleString()} Hz</span>
      </div>
    </div>
  );
};
