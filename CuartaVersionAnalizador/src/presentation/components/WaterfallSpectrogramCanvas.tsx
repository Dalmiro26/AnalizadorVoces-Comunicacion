/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Presentación: Cascada Espectral 3D / Espectrograma STFT (Waterfall).
 * 
 * Mapea Frecuencia (eje X) vs Tiempo (eje Y) con mapa térmico de potencia (dBFS).
 */

import React, { useRef, useEffect } from "react";
import { FourierService } from "../../domain/services/FourierService";

interface WaterfallSpectrogramCanvasProps {
  signal: Float32Array;
  sampleRate: number;
  durationSec: number;
}

export const WaterfallSpectrogramCanvas: React.FC<WaterfallSpectrogramCanvasProps> = ({
  signal,
  sampleRate,
  durationSec,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !signal || signal.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "#0a0e17";
    ctx.fillRect(0, 0, width, height);

    const windowSize = 1024;
    const hopSize = 512;
    const maxWindows = 120;
    const rawWindows = Math.floor((signal.length - windowSize) / hopSize);
    const numWindows = Math.min(rawWindows, maxWindows);

    if (numWindows <= 0) return;

    const maxFreqView = 6000;

    // Paleta de colores precalculada (Little-endian 0xAABBGGRR)
    const lutSize = 256;
    const lut = new Uint32Array(lutSize);
    for (let i = 0; i < lutSize; i++) {
      const norm = i / 255;
      let r = 10, g = 14, b = 23;
      if (norm < 0.2) {
        r = 10; g = 14; b = 23;
      } else if (norm < 0.4) {
        const t = (norm - 0.2) / 0.2;
        r = Math.floor(t * 10);
        g = Math.floor(t * 50);
        b = Math.floor(t * 180);
      } else if (norm < 0.65) {
        const t = (norm - 0.4) / 0.25;
        r = 0;
        g = Math.floor(150 + t * 90);
        b = Math.floor(200 + t * 55);
      } else if (norm < 0.85) {
        const t = (norm - 0.65) / 0.2;
        r = Math.floor(220 + t * 35);
        g = Math.floor(200 - t * 80);
        b = 40;
      } else {
        const t = (norm - 0.85) / 0.15;
        r = 255;
        g = Math.floor(120 + t * 135);
        b = Math.floor(40 + t * 215);
      }
      lut[i] = (255 << 24) | (b << 16) | (g << 8) | r;
    }

    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = width;
    offscreenCanvas.height = numWindows;
    const offCtx = offscreenCanvas.getContext("2d");
    if (!offCtx) return;

    const imgData = offCtx.createImageData(width, numWindows);
    const buf32 = new Uint32Array(imgData.data.buffer);

    for (let w = 0; w < numWindows; w++) {
      const startIdx = w * hopSize;
      const slice = signal.subarray(startIdx, startIdx + windowSize);
      const fft = FourierService.computeFFT(slice, sampleRate, "HAMMING");

      const numBins = fft.frequencies.length;
      const rowOffset = w * width;

      for (let x = 0; x < width; x++) {
        const targetFreq = (x / width) * maxFreqView;
        const binIdx = Math.min(numBins - 1, Math.round(targetFreq / (sampleRate / windowSize)));
        const db = fft.magnitudesDb[binIdx];
        const norm = Math.max(0, Math.min(1, (db + 80) / 80));
        const colorIdx = Math.floor(norm * 255);
        buf32[rowOffset + x] = lut[colorIdx];
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offscreenCanvas, 0, 0, width, height);

    ctx.strokeStyle = "rgba(132, 147, 150, 0.25)";
    ctx.setLineDash([2, 4]);
    for (let f = 1000; f < maxFreqView; f += 1000) {
      const x = (f / maxFreqView) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }, [signal, sampleRate, durationSec]);

  return (
    <div className="bg-[#181b25] rounded-xl p-3 sm:p-4 shadow-lg flex flex-col gap-2 border border-[#262a34]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff]"></span>
          <h3 className="font-semibold text-sm sm:text-base text-[#dfe2ef]">
            Espectrograma en Cascada (STFT - Tiempo vs Frecuencia)
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#bac9cc]">
          <span>Eje Y: Tiempo (0 a {durationSec.toFixed(1)}s)</span>
          <span>·</span>
          <span>Eje X: 0 a 6.000 Hz</span>
        </div>
      </div>

      <div
        style={{ touchAction: "none" }}
        className="relative w-full h-64 sm:h-80 bg-[#0a0e17] rounded-lg overflow-hidden border border-[#1c1f29]"
      >
        <canvas ref={canvasRef} width={1000} height={320} className="w-full h-full block" />

        <div className="absolute bottom-1 left-2 right-2 flex justify-between font-mono text-[10px] text-[#849396] bg-[#0f131c]/80 px-2 py-0.5 rounded pointer-events-none">
          <span>0 Hz</span>
          <span>1.000 Hz</span>
          <span>2.000 Hz</span>
          <span>3.000 Hz</span>
          <span>4.000 Hz</span>
          <span>5.000 Hz</span>
          <span>6.000 Hz</span>
        </div>
      </div>
    </div>
  );
};
