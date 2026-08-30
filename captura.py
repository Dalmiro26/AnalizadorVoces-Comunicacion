import sounddevice as sd
import numpy as np
import matplotlib.pyplot as plt
from scipy.fft import rfft, rfftfreq

# 1. Configuración de la grabación
fs = 44100  # Frecuencia de muestreo (Nyquist)
duracion = 3

print("🎤 Grabando... ¡Habla ahora!")
grabacion = sd.rec(int(duracion * fs), samplerate=fs, channels=1, dtype='float64')
sd.wait()
print("✅ Grabación finalizada. Calculando Serie de Fourier...")

audio_plano = grabacion.flatten()
tiempo = np.linspace(0, duracion, num=len(audio_plano))

# 2. TRANSFORMADA DE FOURIER (Paso al Dominio de la Frecuencia)
N = len(audio_plano) # Cantidad total de muestras

# Aplicamos Fourier para obtener la magnitud de las frecuencias
magnitud_frecuencia = np.abs(rfft(audio_plano))

# Generamos el eje X (las frecuencias en Hertz)
frecuencias = rfftfreq(N, 1 / fs)

# 3. Visualización de ambos dominios
# Creamos una figura con 2 subgráficos (2 filas, 1 columna)
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))

# Gráfico 1: Dominio del Tiempo (El que ya conoces)
ax1.plot(tiempo, audio_plano, color='#007acc')
ax1.set_title('Señal de Voz en el Dominio del Tiempo')
ax1.set_xlabel('Tiempo [segundos]')
ax1.set_ylabel('Amplitud')
ax1.grid(True, linestyle='--', alpha=0.7)

# Gráfico 2: Dominio de la Frecuencia (Espectro de Fourier)
ax2.plot(frecuencias, magnitud_frecuencia, color='#e63946')
ax2.set_title('Espectro de Frecuencias (Serie de Fourier)')
ax2.set_xlabel('Frecuencia [Hz]')
ax2.set_ylabel('Magnitud (Fuerza de cada armónico)')
ax2.set_xlim(0, 4000) # Recortamos la vista hasta 4000 Hz (donde se concentra la voz humana)
ax2.grid(True, linestyle='--', alpha=0.7)

plt.tight_layout()
plt.show()