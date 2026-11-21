<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/aafbdca0-ba8c-48f0-9179-ebb0b6650951

## Arquitectura

El código de `src/` está organizado en capas, siguiendo el patrón *Layers*:

| Carpeta | Responsabilidad |
|---|---|
| `presentation/` | Vistas, componentes y hooks de React; servicios del navegador (Web Audio, micrófono, exportación PDF/CSV); composición de dependencias (`configurations/dependencies.ts`) y manejo de errores (`middlewares/`) |
| `application/` | Servicios (casos de uso), DTOs e interfaces (puertos) que la presentación consume |
| `domain/` | Entidades, servicios DSP puros (FFT, f0, canal físico, Shannon) e interfaces de persistencia |
| `data/` | Implementación de la persistencia (`LocalStoragePreferencesRepository`) |
| `crossCutting/` | Excepciones, códigos de error y helpers transversales |

Las dependencias apuntan siempre hacia el dominio: `presentation → application → domain`, con `data` implementando las interfaces que define `domain`. Las implementaciones concretas solo se instancian en `presentation/configurations/dependencies.ts`.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
