/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Presentación: Osciloscopio Digital Doble Canal (CH1: Original, CH2: Canal Simulado).
 * 
 * Características:
 * - Retícula milimétrica de laboratorio de telecomunicaciones.
 * - Ejes y leyendas dibujados estrictamente por fuera de la onda.
 * - Soporte táctil móvil de zoom y desplazamiento panorámico con 'touch-action: none'.
 * - Escala vertical de voltaje (mV/div) y base temporal (ms/div).
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Sliders, Timer, Pause, Play, RotateCcw } from "lucide-react";

interface OscilloscopeCanvasProps {
  originalSignal: Float32Array;
  degradedSignal: Float32Array;
  sampleRate: number;
  durationSec: number;
  isLiveMonitoring: boolean;
  liveBuffer?: Float32Array;
}

export const OscilloscopeCanvas: React.FC<OscilloscopeCanvasProps> = ({
  originalSignal,
  degradedSignal,
  sampleRate,
  durationSec,
  isLiveMonitoring,
  liveBuffer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [voltageScale, setVoltageScale] = useState<number>(1.0);
  const [timeDivMs, setTimeDivMs] = useState<number>(500);
  const [cursorX, setCursorX] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panPosition, setPanPosition] = useState<number>(0.5);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const pinchDistanceRef = useRef<number | null>(null);
  const mouseDragRef = useRef<{ x: number; pan: number } | null>(null);
  const touchPanXRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      // 1. Limpiar fondo estilo osciloscopio de laboratorio
      ctx.fillStyle = "#0a0e17";
      ctx.fillRect(0, 0, width, height);

      // 2. Retícula Milimétrica de Laboratorio (Graticule)
      ctx.strokeStyle = "#1c2230";
      ctx.lineWidth = 1;

      // 10 divisiones horizontales de tiempo
      const numDivsX = 10;
      const divWidth = width / numDivsX;
      for (let i = 1; i < numDivsX; i++) {
        const x = i * divWidth;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        ctx.fillStyle = "#262e40";
        for (let j = 1; j < 8; j++) {
          const py = (j * height) / 8;
          ctx.fillRect(x - 1, py - 1, 2, 2);
        }
      }

      // 8 divisiones verticales de voltaje
      const numDivsY = 8;
      const divHeight = height / numDivsY;
      for (let j = 1; j < numDivsY; j++) {
        const y = j * divHeight;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Eje central de referencia (0 V) punteado
      ctx.strokeStyle = "#3b494c";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Selección de señales a renderizar
      let sig1 = originalSignal;
      let sig2 = degradedSignal;

      if (isLiveMonitoring && liveBuffer && liveBuffer.length > 0 && !isFrozen) {
        sig1 = liveBuffer;
        sig2 = liveBuffer;
      }

      if (sig1 && sig1.length > 0) {
        const totalSamples = sig1.length;
        const visibleSamples = Math.max(1, Math.floor(totalSamples / zoomLevel));
        const startSample = Math.floor((totalSamples - visibleSamples) * panPosition);
        const step = visibleSamples / width;

        // CH2: Canal Simulado / Degradado (Coral)
        if (sig2 && sig2.length > 0 && !isLiveMonitoring) {
          ctx.strokeStyle = "rgba(255, 77, 109, 0.8)";
          ctx.lineWidth = 1.6;
          ctx.beginPath();

          for (let x = 0; x < width; x++) {
            const idx = Math.min(totalSamples - 1, startSample + Math.floor(x * step));
            const val = sig2[idx] * voltageScale;
            const y = midY - val * (height * 0.42);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // CH1: Señal Original Pura (Cyan Phosphor)
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 2.0;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const idx = Math.min(totalSamples - 1, startSample + Math.floor(x * step));
          const val = sig1[idx] * voltageScale;
          const y = midY - val * (height * 0.42);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // Trazo inicial en cero voltios
        ctx.strokeStyle = "rgba(0, 229, 255, 0.45)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(width, midY);
        ctx.stroke();
      }

      // Cursor interactivo de medición temporal
      if (cursorX !== null && cursorX >= 0 && cursorX <= width) {
        ctx.strokeStyle = "rgba(0, 229, 255, 0.7)";
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(cursorX, 0);
        ctx.lineTo(cursorX, height);
        ctx.stroke();
        ctx.setLineDash([]);

        const timeFraction = cursorX / width;
        const startFraction = panPosition * (1 - 1 / zoomLevel);
        const timeMs =
          Math.round(
            ((startFraction + timeFraction / zoomLevel) * durationSec) * 1000 * 10
          ) / 10;

        ctx.fillStyle = "#1c1f29";
        ctx.fillRect(Math.min(width - 85, cursorX + 6), 12, 78, 18);
        ctx.strokeStyle = "#00e5ff";
        ctx.strokeRect(Math.min(width - 85, cursorX + 6), 12, 78, 18);
        ctx.fillStyle = "#00e5ff";
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillText(`t: ${timeMs}ms`, Math.min(width - 85, cursorX + 6) + 6, 25);
      }

      if (!isFrozen && isLiveMonitoring) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [
    originalSignal,
    degradedSignal,
    sampleRate,
    durationSec,
    isLiveMonitoring,
    liveBuffer,
    isFrozen,
    voltageScale,
    cursorX,
    zoomLevel,
    panPosition,
  ]);

  const toggleVoltageScale = () => {
    setVoltageScale((prev) => (prev === 1.0 ? 1.8 : prev === 1.8 ? 0.6 : 1.0));
  };

  const toggleTimeDiv = () => {
    setTimeDivMs((prev) => (prev === 500 ? 250 : prev === 250 ? 1000 : 500));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0) return;
    const scaleX = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    setCursorX(x);
    if (mouseDragRef.current && e.buttons === 1) {
      const panRange = 1 - 1 / zoomLevel;
      setPanPosition(
        Math.max(
          0,
          Math.min(
            1,
            mouseDragRef.current.pan -
              ((e.clientX - mouseDragRef.current.x) / rect.width) * panRange
          )
        )
      );
    }
  };

  const handleMouseLeave = () => {
    setCursorX(null);
    mouseDragRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseDragRef.current = { x: e.clientX, pan: panPosition };
    if (rect.width > 0) e.currentTarget.focus();
  };

  const handleMouseUp = () => {
    mouseDragRef.current = null;
  };

  // Gestos táctiles optimizados para móviles con touch-action: none
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
      const canvas = canvasRef.current;
      const rect = canvas?.getBoundingClientRect();
      if (rect && rect.width > 0) {
        const currentX = e.touches[0].clientX;
        const deltaX = currentX - touchPanXRef.current;
        const panRange = 1 - 1 / zoomLevel;
        setPanPosition((position) =>
          Math.max(0, Math.min(1, position - (deltaX / rect.width) * panRange))
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
    setZoomLevel((zoom) => Math.max(1, Math.min(8, zoom * scale)));
    pinchDistanceRef.current = distance;
  };

  const handleTouchEnd = () => {
    pinchDistanceRef.current = null;
    touchPanXRef.current = null;
  };

  const handleWheelNative = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.deltaY < 0) {
      setZoomLevel((z) => Math.min(8.0, Math.round((z + 0.25) * 100) / 100));
    } else {
      setZoomLevel((z) => Math.max(1.0, Math.round((z - 0.25) * 100) / 100));
    }
  }, []);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    container.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheelNative);
    };
  }, [handleWheelNative]);

  return (
    <div className="bg-[#181b25] rounded-xl p-3 sm:p-4 shadow-lg flex flex-col gap-2.5 border border-[#262a34]">
      {/* Barra de Herramientas del Osciloscopio */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff]"></span>
            <h3 className="font-semibold text-sm sm:text-base text-[#dfe2ef] tracking-tight">
              Dominio del Tiempo
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-mono">
            <span className="flex items-center gap-1 text-[#00e5ff]">
              <span className="w-2 h-0.5 bg-[#00e5ff]"></span> CH1: Voz Original
            </span>
            <span className="flex items-center gap-1 text-[#ff8097]">
              <span className="w-2 h-0.5 bg-[#ff8097]"></span> CH2: Canal Simulado
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <div className="bg-[#0a0e17] px-2 py-1 rounded text-[#00e5ff] border border-[#262a34]">
            <span>Zoom: {zoomLevel.toFixed(2)}x</span>
          </div>
          {zoomLevel > 1.0 && (
            <button
              onClick={() => {
                setZoomLevel(1.0);
                setPanPosition(0.5);
              }}
              className="px-2 py-1 rounded bg-[#262a34] text-[#849396] hover:text-[#dfe2ef] flex items-center gap-1"
              type="button"
              title="Restablecer zoom"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
          <button
            onClick={toggleVoltageScale}
            className="px-2 py-1 rounded bg-[#1c1f29] hover:bg-[#262a34] text-[#dfe2ef] flex items-center gap-1 transition-colors border border-[#31353f]"
            type="button"
            title="Escala vertical de voltaje"
          >
            <Sliders className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>
              {voltageScale === 1.0 ? "200 mV/div" : voltageScale === 1.8 ? "100 mV/div" : "500 mV/div"}
            </span>
          </button>
          <button
            onClick={toggleTimeDiv}
            className="px-2 py-1 rounded bg-[#1c1f29] hover:bg-[#262a34] text-[#dfe2ef] flex items-center gap-1 transition-colors border border-[#31353f]"
            type="button"
            title="Base temporal horizontal"
          >
            <Timer className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>{timeDivMs} ms/div</span>
          </button>
          <button
            onClick={() => setIsFrozen((f) => !f)}
            className={`px-2 py-1 rounded font-bold flex items-center gap-1 transition-colors border ${
              isFrozen
                ? "bg-[#ff4d6d]/20 text-[#ffb4ab] border-[#ff4d6d]"
                : "bg-[#262a34] text-[#00e5ff] hover:bg-[#31353f] border-[#31353f]"
            }`}
            type="button"
            title="Congelar oscilograma"
          >
            {isFrozen ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isFrozen ? "RESUME" : "FREEZE"}</span>
          </button>
        </div>
      </div>

      {/* Escala Superior Externa (Fuera de la onda) */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:flex sm:justify-between items-center font-mono text-[10px] sm:text-[11px] text-[#849396] px-2 py-1 bg-[#0a0e17] rounded-md border border-[#1c1f29]">
        <span>Voltaje Máx: <strong className="text-[#dfe2ef]">+1.00 V</strong></span>
        <span className="text-[#00e5ff]">BASE TEMPORAL: {timeDivMs} ms/div</span>
        <span>Muestreo: <strong className="text-[#bac9cc]">{sampleRate.toLocaleString()} Hz</strong></span>
      </div>

      {/* Visor Canvas del Osciloscopio con touch-action: none */}
      <div className="flex min-w-0 gap-2">
        <div className="h-56 sm:h-64 py-1 flex flex-col justify-between font-mono text-[9px] text-[#849396] text-right shrink-0">
          <span>+1.0 V</span>
          <span>+0.5 V</span>
          <span>0 V</span>
          <span>-0.5 V</span>
          <span>-1.0 V</span>
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

      {/* Escala Inferior Externa (Fuera de la onda) */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:flex sm:justify-between items-center font-mono text-[10px] sm:text-[11px] text-[#849396] px-2 py-1 bg-[#0a0e17] rounded-md border border-[#1c1f29]">
        <span>t = {(panPosition * (1 - 1 / zoomLevel) * durationSec).toFixed(2)} s</span>
        <span className="text-[#bac9cc] text-center">Referencia Central: 0.00 V (Trigger: CH1)</span>
        <span className="text-right">t = {((panPosition * (1 - 1 / zoomLevel) + 1 / zoomLevel) * durationSec).toFixed(2)} s</span>
      </div>
    </div>
  );
};
