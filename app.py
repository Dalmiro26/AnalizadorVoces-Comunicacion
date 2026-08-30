import streamlit as st
import sounddevice as sd
import numpy as np
import matplotlib.pyplot as plt
from scipy.fft import rfft, rfftfreq

# 1. Configuración de la Interfaz Web (Layout ancho)
st.set_page_config(page_title="Analizador de Señales", layout="wide")
st.title("🎙️ Análisis de Señales con Series de Fourier")
st.markdown("### Proyecto de Comunicaciones de Datos")
st.write("---")

# 2. Creación del Layout (Panel izquierdo 1/3, Gráficos derechos 2/3)
col_panel, col_graficos = st.columns([1, 2.5])

with col_panel:
    st.header("⚙️ Panel de Control")
    duracion = st.slider("Duración (segundos):", min_value=1, max_value=5, value=3)
    btn_grabar = st.button("🔴 Iniciar Grabación", type="primary", use_container_width=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    st.subheader("📊 Datos de la Señal")
    
    # Preparamos los "espacios vacíos" para las métricas
    metrica_f0 = st.empty()
    metrica_bw = st.empty()
    metrica_db = st.empty()

# 3. Lógica de Captura y Análisis
if btn_grabar:
    fs = 44100
    with col_panel:
        with st.spinner(f"Grabando {duracion} s..."):
            grabacion = sd.rec(int(duracion * fs), samplerate=fs, channels=1, dtype='float64')
            sd.wait()
    
    # Procesamiento Matemático
    audio_plano = grabacion.flatten()
    tiempo = np.linspace(0, duracion, num=len(audio_plano))
    
    N = len(audio_plano)
    magnitud_frecuencia = np.abs(rfft(audio_plano))
    frecuencias = rfftfreq(N, 1 / fs)
    
    # --- CÁLCULO DE MÉTRICAS ---
    # 1. Frecuencia Fundamental (Ignorando el componente DC en el índice 0)
    indice_pico = np.argmax(magnitud_frecuencia[1:]) + 1
    frec_fundamental = frecuencias[indice_pico]
    
    # 2. Potencia (RMS a dBFS)
    rms = np.sqrt(np.mean(audio_plano**2))
    dbfs = 20 * np.log10(rms + 1e-10) # Sumamos un valor ínfimo para evitar log(0)
    
    # 3. Ancho de Banda (Rango con energía mayor al 10% del pico)
    umbral = 0.1 * magnitud_frecuencia[indice_pico]
    indices_activos = np.where(magnitud_frecuencia > umbral)[0]
    
    if len(indices_activos) > 0:
        bw_inf = frecuencias[indices_activos[0]]
        bw_sup = frecuencias[indices_activos[-1]]
        ancho_banda = bw_sup - bw_inf
    else:
        ancho_banda, bw_inf, bw_sup = 0, 0, 0

    # Llenamos los espacios vacíos del panel con los datos calculados
    metrica_f0.metric("Frec. Fundamental (Tono)", f"{frec_fundamental:.1f} Hz")
    metrica_bw.metric("Ancho de Banda Eficaz", f"{ancho_banda:.1f} Hz", f"Rango: {bw_inf:.0f}Hz - {bw_sup:.0f}Hz", delta_color="off")
    metrica_db.metric("Nivel de Señal (Potencia)", f"{dbfs:.1f} dB")

    # 4. Generación de Gráficos en la columna derecha
    with col_graficos:
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 6.5))
        
        ax1.plot(tiempo, audio_plano, color='#007acc')
        ax1.set_title('Dominio del Tiempo', fontweight='bold')
        ax1.set_xlabel('Tiempo [s]')
        ax1.set_ylabel('Amplitud')
        ax1.grid(True, linestyle='--', alpha=0.5)
        
        ax2.plot(frecuencias, magnitud_frecuencia, color='#e63946')
        ax2.set_title('Dominio de la Frecuencia (Fourier)', fontweight='bold')
        ax2.set_xlabel('Frecuencia [Hz]')
        ax2.set_ylabel('Magnitud')
        ax2.set_xlim(0, 4000)
        ax2.grid(True, linestyle='--', alpha=0.5)
        
        plt.tight_layout()
        st.pyplot(fig)