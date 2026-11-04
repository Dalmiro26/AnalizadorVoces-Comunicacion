/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Presentación: Reproductores Duales de Audio para Canal A y Canal B.
 * 
 * Permite escuchar de forma alternada o comparativa:
 * - Canal A: Señal original pura capturada.
 * - Canal B: Señal procesada con efectos de atenuación, ruido AWGN y filtrado telefónico.
 */

import React, { useEffect, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { globalAudioContextManager } from "../../infrastructure/audio/AudioContextManager";
import { globalAudioPlaybackAdapter } from "../../infrastructure/audio/AudioPlaybackAdapter";

interface AudioPlayerDualProps {
  originalSignal: Float32Array;
  degradedSignal: Float32Array;
  sampleRate: number;
}

export const AudioPlayerDual: React.FC<AudioPlayerDualProps> = ({
  originalSignal,
  degradedSignal,
  sampleRate,
}) => {
  const [playingChannel, setPlayingChannel] = useState<"A" | "B" | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const durationSec = originalSignal.length / Math.max(1, sampleRate);

  useEffect(() => {
    return () => {
      globalAudioPlaybackAdapter.stopAll();
    };
  }, [originalSignal, degradedSignal]);

  const playChannel = async (channel: "A" | "B") => {
    if (playingChannel === channel) {
      if (channel === "A") globalAudioPlaybackAdapter.stopPlaybackA();
      else globalAudioPlaybackAdapter.stopPlaybackB();
      setPlayingChannel(null);
      return;
    }

    // Detener el otro canal si estaba sonando
    if (channel === "A") globalAudioPlaybackAdapter.stopPlaybackB();
    else globalAudioPlaybackAdapter.stopPlaybackA();
    setPlayingChannel(null);
    setPlaybackError(null);

    try {
      // Reanudar contexto sincrónicamente ante interacción directa
      globalAudioContextManager.resumeSynchronously();
      await globalAudioContextManager.ensureResumed();

      const onEnded = () => setPlayingChannel(null);
      if (channel === "A") {
        globalAudioPlaybackAdapter.playChannelA(originalSignal, sampleRate, onEnded);
      } else {
        globalAudioPlaybackAdapter.playChannelB(degradedSignal, sampleRate, onEnded);
      }
      setPlayingChannel(channel);
    } catch (error) {
      console.error(`Error al reproducir Canal ${channel}:`, error);
      setPlaybackError("No se pudo iniciar la reproducción de audio en este dispositivo.");
    }
  };

  return (
    <section className="grid w-full min-w-0 grid-cols-1 gap-3 md:grid-cols-2" aria-label="Reproductores de audio">
      {/* Canal A: Señal Original */}
      <article className="min-w-0 rounded-xl border border-[#00e5ff]/40 bg-[#181b25] p-4 shadow-lg">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-mono text-xs font-bold tracking-wide text-[#00e5ff]">
            CANAL A · VOZ ORIGINAL
          </h3>
          <span className="font-mono text-[10px] text-[#849396]">
            PCM Mono · {(sampleRate / 1000).toFixed(1)} kHz
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void playChannel("A")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00e5ff] text-[#00363d] transition-transform hover:scale-105 active:scale-95"
            aria-label={playingChannel === "A" ? "Detener Canal A" : "Reproducir Canal A"}
          >
            {playingChannel === "A" ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex h-8 items-center gap-1 overflow-hidden rounded border border-[#262a34] bg-[#0a0e17] px-2">
              {Array.from({ length: 28 }, (_, index) => (
                <span
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-all duration-150 ${
                    playingChannel === "A" ? "bg-[#00e5ff] animate-pulse" : "bg-[#00e5ff]/40"
                  }`}
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between font-mono text-[10px] text-[#849396]">
              <span>{playingChannel === "A" ? "REPRODUCIENDO" : "LISTO"}</span>
              <span>{durationSec.toFixed(2)} s</span>
            </div>
          </div>
          <Volume2 className="h-4 w-4 shrink-0 text-[#00e5ff]" />
        </div>
      </article>

      {/* Canal B: Señal Procesada */}
      <article className="min-w-0 rounded-xl border border-[#ff4d6d]/40 bg-[#181b25] p-4 shadow-lg">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-mono text-xs font-bold tracking-wide text-[#ff8097]">
            CANAL B · SEÑAL DEGRADADA
          </h3>
          <span className="font-mono text-[10px] text-[#849396]">
            Atenuación · AWGN · Filtro ITU-T
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void playChannel("B")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ff4d6d] text-[#40000f] transition-transform hover:scale-105 active:scale-95"
            aria-label={playingChannel === "B" ? "Detener Canal B" : "Reproducir Canal B"}
          >
            {playingChannel === "B" ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex h-8 items-center gap-1 overflow-hidden rounded border border-[#262a34] bg-[#0a0e17] px-2">
              {Array.from({ length: 28 }, (_, index) => (
                <span
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-all duration-150 ${
                    playingChannel === "B" ? "bg-[#ff4d6d] animate-pulse" : "bg-[#ff4d6d]/40"
                  }`}
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between font-mono text-[10px] text-[#849396]">
              <span>{playingChannel === "B" ? "REPRODUCIENDO" : "LISTO"}</span>
              <span>{durationSec.toFixed(2)} s</span>
            </div>
          </div>
          <Volume2 className="h-4 w-4 shrink-0 text-[#ff8097]" />
        </div>
      </article>

      {playbackError && (
        <p className="col-span-full text-xs text-[#ff8097]" role="alert">
          {playbackError}
        </p>
      )}
    </section>
  );
};
