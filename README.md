# 👟 Sistema de Despachos de Tenis Enzoflow

Aplicación web para cargar, visualizar y hacer seguimiento a los despachos de tenis por cliente.

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado
- Git instalado
- pnpm instalado si se desea ejecutar el frontend fuera de Docker

## Levantar el proyecto

```bash
git clone https://github.com/EXON90/tenis-despachos-enzoflow.git
cd tenis-despachos-enzoflow
docker compose up --build
```

| Servicio | URL |
|---|---|
| Aplicación | http://localhost:5173 |
| API docs (Swagger) | http://localhost:8000/docs |

## Formato del CSV

El archivo debe ser **UTF-8**, separado por punto y coma (`;`), con estas columnas exactas:

| Columna | Tipo | Ejemplo |
|---|---|---|
| fecha_despacho | DD/MM/YYYY | 1/06/2024 |
| cliente_nombre | texto | Deportes El Crack |
| cliente_nit | texto | 900123456-1 |
| referencia | texto | Nike Air Max 90 |
| talla | número | 42 |
| cantidad_pares | entero > 0 | 12 |
| precio_unitario | decimal > 0 | 185000.00 |

Un archivo de ejemplo está disponible en `database/ejemplo_despachos.csv`.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + lucide-react + Recharts
- **Runtime frontend:** Node 24 + pnpm
- **Backend:** FastAPI + SQLAlchemy (Python 3.12.9)
- **Base de datos:** PostgreSQL 16
- **Contenedores:** Docker Compose
