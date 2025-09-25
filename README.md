# AuroraOps Platform

AuroraOps es un stack de operaciones digitales de última generación que combina un backend basado en **FastAPI + SQLModel** y un frontend construido con **React 18 + Vite + TailwindCSS**. La plataforma permite orquestar workspaces, proyectos y analítica impulsada por IA para organizaciones modernas.

## Arquitectura
- **Backend (Python 3.11+)**
  - FastAPI asincrónico con autenticación JWT.
  - SQLModel sobre SQLite (soporta migración a PostgreSQL/MySQL cambiando `AURORAOPS_DATABASE_URL`).
  - Servicios desacoplados para usuarios, workspaces, proyectos y analítica.
  - Tests con `pytest` y `httpx`.
- **Frontend (TypeScript + React 18)**
  - Vite 5 con TailwindCSS, React Query y componentes animados con Framer Motion.
  - UI futurista/enterprise con layouts responsivos y contenido ficticio listo para demos.

## Puesta en marcha

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
El frontend espera la API en `http://localhost:8000` (se puede sobreescribir con `VITE_API_BASE_URL`).

## Funcionalidades clave
- Registro y login con JWT (tokens de acceso + refresh).
- Gestión de workspaces con relaciones de membresías.
- Catálogo de proyectos y pulsos de salud.
- Endpoint de analítica que sintetiza métricas e insights simulados con IA.
- Frontend que consume la API (cuando hay token) y muestra datos simulados cuando no hay sesión.

## Pruebas
```bash
cd backend
pytest
```

## Scripts de lint/build
- `npm run lint` desde `frontend/` para ejecutar ESLint.
- `npm run build` para generar el bundle de producción.

## Licencia
Proyecto educativo/demostrativo. Ajusta a tus necesidades empresariales.
