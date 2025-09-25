# AuroraOps Frontend

Interfaz futurista construída con React 18, Vite y TailwindCSS. Incluye integración con React Query, animaciones con Framer Motion y componentes accesibles con Headless UI.

## Scripts disponibles
- `npm run dev`: servidor de desarrollo en `http://localhost:5173`.
- `npm run build`: genera artefactos de producción.
- `npm run preview`: previsualiza el build.
- `npm run lint`: ejecuta ESLint con TypeScript.

## Variables de entorno
Crea un archivo `.env` en `frontend/` con:
```
VITE_API_BASE_URL=http://localhost:8000
```

## Estilo visual
- Diseño dark/minimal con gradientes dinámicos.
- Componentes modulables (`GlowCard`, `Timeline`, `StatCard`) listos para reutilizar.
- Datos ficticios cuando la API no está autenticada para mantener la narrativa.
