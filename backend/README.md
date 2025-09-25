# AuroraOps Backend

AuroraOps es una plataforma de operaciones digitales impulsada por IA. Este backend expone una API moderna construida con **FastAPI**, **SQLModel** y autenticación basada en JWT.

## Características
- Arquitectura asincrónica con FastAPI.
- Gestión de organizaciones, proyectos y módulos de analítica avanzada.
- Autenticación con JWT y recuperación de sesiones.
- Servicios de analítica que combinan datos operativos con insights de IA.
- Configuración flexible mediante variables de entorno con `pydantic-settings`.

## Requisitos
- Python 3.11+
- `uvicorn` para ejecutar el servidor (incluido en las dependencias `fastapi[standard]`).

## Instalación rápida
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

## Ejecución
```bash
uvicorn app.main:app --reload
```

La primera ejecución creará automáticamente una base de datos SQLite local (`auroraops.db`).

## Variables de entorno clave
| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `AURORAOPS_SECRET_KEY` | Clave secreta JWT | Generada aleatoriamente si no se define |
| `AURORAOPS_DATABASE_URL` | URL de la base de datos | `sqlite+aiosqlite:///./auroraops.db` |
| `AURORAOPS_ACCESS_TOKEN_EXPIRE_MINUTES` | Minutos de validez del token de acceso | 30 |

## Scripts útiles
- `make lint` *(pendiente)*
- `pytest` para pruebas.

## Estructura
```
backend/
  app/
    api/         # Rutas agrupadas por dominio
    core/        # Configuración y utilidades comunes
    db/          # Inicialización y sesiones de base de datos
    models/      # Modelos SQLModel
    schemas/     # Esquemas Pydantic para entrada/salida
    services/    # Lógica de negocio reutilizable
    utils/       # Helpers especializados (ej. IA)
```
