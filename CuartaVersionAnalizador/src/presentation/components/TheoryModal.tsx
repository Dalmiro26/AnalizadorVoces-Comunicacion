/**
 * @license
 * DSP-LAB Telecom Core - Clean Architecture
 * Capa de Presentación: Modal de Fundamentos Teóricos de Telecomunicaciones y DSP.
 */

import React from "react";
import { X, BookOpen, Sigma, Activity, Radio, Cpu, Network } from "lucide-react";

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181b25] border border-[#262a34] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#dfe2ef]">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#262a34] bg-[#1c1f29]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#00e5ff]/20 text-[#00e5ff] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#dfe2ef]">
                Compendio Teórico — Comunicaciones de Datos & DSP
              </h2>
              <p className="text-xs font-mono text-[#849396]">
                Fundamentos matemáticos, teoremas fundamentales y normas ITU-T
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#849396] hover:text-[#dfe2ef] hover:bg-[#262a34] transition-colors"
            type="button"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* Sección 1: Shannon-Hartley */}
          <div className="bg-[#0a0e17] p-4 rounded-xl border border-[#1c1f29] space-y-2">
            <div className="flex items-center gap-2 text-[#00e5ff] font-bold">
              <Sigma className="w-4 h-4" />
              <h3 className="font-mono text-sm">1. Teorema de Shannon-Hartley (Capacidad de Canal)</h3>
            </div>
            <p className="text-[#bac9cc] leading-relaxed">
              Establece el límite superior teórico de la tasa de transferencia de datos libre de errores que puede transmitirse a través de un canal analógico de ancho de banda <strong className="text-[#dfe2ef]">B</strong> afectado por ruido blanco gaussiano aditivo (AWGN).
            </p>
            <div className="bg-[#181b25] p-3 rounded font-mono text-center text-[#00e5ff] text-base font-bold border border-[#262a34]">
              C = B · log₂(1 + S/N) &nbsp;[bits por segundo]
            </div>
            <ul className="list-disc list-inside text-xs text-[#bac9cc] space-y-1 font-mono">
              <li><strong className="text-[#dfe2ef]">C:</strong> Capacidad de información del canal (bps o Kbps).</li>
              <li><strong className="text-[#dfe2ef]">B:</strong> Ancho de banda analógico efectivo del canal en Hertz (Hz).</li>
              <li><strong className="text-[#dfe2ef]">S/N:</strong> Relación señal a ruido en escala lineal (S/N = 10^(SNR_dB / 10)).</li>
              <li><strong className="text-[#dfe2ef]">C/B:</strong> Eficiencia espectral en bits/segundo/Hertz.</li>
            </ul>
          </div>

          {/* Sección 2: FFT y Ventaneo de Hamming */}
          <div className="bg-[#0a0e17] p-4 rounded-xl border border-[#1c1f29] space-y-2">
            <div className="flex items-center gap-2 text-[#00e5ff] font-bold">
              <Activity className="w-4 h-4" />
              <h3 className="font-mono text-sm">2. Transformada Rápida de Fourier (FFT) y Ventaneo</h3>
            </div>
            <p className="text-[#bac9cc] leading-relaxed">
              La Transformada Discreta de Fourier (DFT) transforma una señal del dominio temporal al dominio frecuencial. El algoritmo <strong className="text-[#dfe2ef]">Cooley-Tukey Radix-2</strong> reduce la complejidad de O(N²) a O(N log₂ N).
            </p>
            <div className="bg-[#181b25] p-3 rounded font-mono text-center text-[#c3f5ff] text-sm border border-[#262a34]">
              X[k] = Σ (n=0 a N-1) x[n] · e^(-j 2π k n / N)
            </div>
            <p className="text-[#bac9cc] leading-relaxed">
              Para mitigar la fuga espectral (<em className="text-[#dfe2ef]">Spectral Leakage</em>) producida por el truncamiento temporal de las muestras, se aplica la <strong className="text-[#dfe2ef]">Ventana de Hamming</strong>:
            </p>
            <div className="bg-[#181b25] p-2 rounded font-mono text-center text-xs text-[#bac9cc] border border-[#262a34]">
              w[n] = 0.54 - 0.46 · cos(2π n / (N - 1))
            </div>
          </div>

          {/* Sección 3: Atenuación y Ruido AWGN */}
          <div className="bg-[#0a0e17] p-4 rounded-xl border border-[#1c1f29] space-y-2">
            <div className="flex items-center gap-2 text-[#00e5ff] font-bold">
              <Radio className="w-4 h-4" />
              <h3 className="font-mono text-sm">3. Atenuación en Medios de Transmisión y Ruido AWGN</h3>
            </div>
            <p className="text-[#bac9cc] leading-relaxed">
              A medida que una onda electromagnética viaja a través de un par de cobre, cable coaxial o fibra, su potencia decae exponencialmente debido a las pérdidas en el medio:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-center font-mono text-xs">
              <div className="bg-[#181b25] p-2.5 rounded border border-[#262a34]">
                <span className="text-[#849396] block text-[10px]">Atenuación en Decibelios:</span>
                <span className="text-[#ff8097] font-bold">A_dB = α · d</span>
              </div>
              <div className="bg-[#181b25] p-2.5 rounded border border-[#262a34]">
                <span className="text-[#849396] block text-[10px]">Factor de Amplitud Lineal:</span>
                <span className="text-[#00e5ff] font-bold">k = 10^(-A_dB / 20)</span>
              </div>
            </div>
            <p className="text-[#bac9cc] leading-relaxed text-xs">
              El <strong className="text-[#dfe2ef]">Ruido Blanco Gaussiano Aditivo (AWGN)</strong> modela el ruido térmico de Johnson-Nyquist generado por la agitación de electrones. Se sintetiza mediante la <strong className="text-[#dfe2ef]">Transformada de Box-Muller</strong> generando variables aleatorias con distribución normal N(0, σ²).
            </p>
          </div>

          {/* Sección 4: Filtro Telefónico PSTN */}
          <div className="bg-[#0a0e17] p-4 rounded-xl border border-[#1c1f29] space-y-2">
            <div className="flex items-center gap-2 text-[#00e5ff] font-bold">
              <Network className="w-4 h-4" />
              <h3 className="font-mono text-sm">4. Canal Telefónico PSTN (Norma ITU-T G.711)</h3>
            </div>
            <p className="text-[#bac9cc] leading-relaxed">
              Históricamente, la red telefónica conmutada limita la señal a la banda pasante de <strong className="text-[#dfe2ef]">300 Hz a 3,400 Hz</strong> (ancho de banda nominal de 3.1 kHz). Esto preserva la inteligibilidad de la voz y los formantes principales F1 y F2 eliminando componentes prescindibles, permitiendo una tasa de muestreo de 8,000 muestras/s (Nyquist).
            </p>
          </div>

          {/* Sección 5: Frecuencia Fundamental de la Voz */}
          <div className="bg-[#0a0e17] p-4 rounded-xl border border-[#1c1f29] space-y-2">
            <div className="flex items-center gap-2 text-[#00e5ff] font-bold">
              <Cpu className="w-4 h-4" />
              <h3 className="font-mono text-sm">5. Frecuencia Fundamental (f₀) y Formantes Vocales</h3>
            </div>
            <p className="text-[#bac9cc] leading-relaxed">
              La frecuencia fundamental (<strong className="text-[#dfe2ef]">f₀</strong>) es el ritmo de vibración glotal de las cuerdas vocales. Las resonancias del tracto vocal forman picos espectrales llamados <strong className="text-[#dfe2ef]">formantes (F1, F2, F3)</strong> que determinan las vocales y el timbre fonatorio.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border border-[#262a34]">
                <thead className="bg-[#1c1f29] text-[#00e5ff]">
                  <tr>
                    <th className="p-2 border border-[#262a34]">Registro Vocal</th>
                    <th className="p-2 border border-[#262a34]">Rango de f₀</th>
                    <th className="p-2 border border-[#262a34]">Características Espectrales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262a34] text-[#bac9cc]">
                  <tr>
                    <td className="p-2 border border-[#262a34] text-[#dfe2ef] font-semibold">Voz Masculina Grave (Bajo/Barítono)</td>
                    <td className="p-2 border border-[#262a34]">85 Hz – 130 Hz</td>
                    <td className="p-2 border border-[#262a34]">Fuerte energía sub-kiloHertz y armónicos densos.</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-[#262a34] text-[#dfe2ef] font-semibold">Voz Masculina Media (Tenor)</td>
                    <td className="p-2 border border-[#262a34]">130 Hz – 165 Hz</td>
                    <td className="p-2 border border-[#262a34]">Armónicos prominentes entre 1.2 kHz y 2.2 kHz.</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-[#262a34] text-[#dfe2ef] font-semibold">Voz Femenina (Mezzo / Soprano)</td>
                    <td className="p-2 border border-[#262a34]">165 Hz – 265 Hz</td>
                    <td className="p-2 border border-[#262a34]">Espaciado armónico amplio y brillo en agudos.</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-[#262a34] text-[#dfe2ef] font-semibold">Voz Infantil (Muy Aguda)</td>
                    <td className="p-2 border border-[#262a34]">265 Hz – 350 Hz</td>
                    <td className="p-2 border border-[#262a34]">Cuerdas vocales cortas, longitud de onda reducida.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="p-4 border-t border-[#262a34] bg-[#1c1f29] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#00e5ff] text-[#00363d] font-mono text-xs font-bold hover:bg-[#9cf0ff] transition-colors"
            type="button"
          >
            CERRAR
          </button>
        </div>
      </div>
    </div>
  );
};
