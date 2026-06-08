# SPEC — Sistema de Despachos de Tenis

## Propósito
Aplicación web para que un administrador cargue archivos CSV con despachos de tenis,
visualice el historial por cliente y consulte valores acumulados.
Sin autenticación. Despliegue 100% con Docker Compose.

---

## Stack

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Node 24 |
| Backend | FastAPI + SQLAlchemy | Python 3.12.9 |
| Base de datos | PostgreSQL | 16 |
| Contenedores | Docker + Docker Compose | 3.9 |
| CSV processing | Pandas | 2.2.2 |
| Gráficas | Recharts | 3.8.1 |

---

## Estructura del repositorio

```
tenis-despachos/
├── SPEC.md                        ← este archivo (fuente de verdad)
├── docker-compose.yml
├── README.md
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── CargaCSV.jsx
│       │   ├── Clientes.jsx
│       │   └── ClienteDetalle.jsx
│       └── components/
│           ├── Navbar.jsx
│           ├── TarjetaResumen.jsx
│           └── TablaDespachos.jsx
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       └── routers/
│           ├── csv_upload.py
│           └── clientes.py
└── database/
    ├── init.sql
    └── ejemplo_despachos.csv
```

---

## Base de datos

### Tablas

#### clientes
| Campo | Tipo | Restricción |
|---|---|---|
| id_cliente | SERIAL | PK |
| nombre | VARCHAR(150) | NOT NULL |
| nit | VARCHAR(20) | NOT NULL, UNIQUE |
| creado_en | TIMESTAMP | DEFAULT NOW() |

#### cargas_csv
| Campo | Tipo | Restricción |
|---|---|---|
| id_carga | SERIAL | PK |
| nombre_archivo | VARCHAR(200) | NOT NULL |
| total_filas | INTEGER | NOT NULL |
| filas_ok | INTEGER | NOT NULL |
| filas_error | INTEGER | NOT NULL |
| fecha_carga | TIMESTAMP | DEFAULT NOW() |

#### despachos
| Campo | Tipo | Restricción |
|---|---|---|
| id_despacho | SERIAL | PK |
| id_cliente | INTEGER | FK → clientes |
| id_carga | INTEGER | FK → cargas_csv |
| fecha_despacho | DATE | NOT NULL |
| referencia | VARCHAR(150) | NOT NULL |
| talla | DECIMAL(4,1) | NOT NULL |
| cantidad_pares | INTEGER | NOT NULL, CHECK > 0 |
| precio_unitario | DECIMAL(12,2) | NOT NULL, CHECK > 0 |
| valor_total | DECIMAL(14,2) | GENERATED ALWAYS AS (cantidad_pares * precio_unitario) STORED |
| creado_en | TIMESTAMP | DEFAULT NOW() |

### Relaciones
- CARGA_CSV 1 → N DESPACHOS
- CLIENTE 1 → N DESPACHOS

---

## API — Endpoints

### POST /csv/upload
- Recibe: multipart/form-data con campo `file` (CSV UTF-8 separado por punto y coma `;`)
- Valida columnas: `fecha_despacho`, `cliente_nombre`, `cliente_nit`, `referencia`, `talla`, `cantidad_pares`, `precio_unitario`
- Si más del 30% de filas son inválidas → rechaza todo con 400
- Por cada fila válida: upsert cliente por NIT, insert despacho
- Retorna:
```json
{
  "nombre_archivo": "string",
  "total_filas": 0,
  "filas_ok": 0,
  "filas_error": 0,
  "errores": [{"fila": 0, "motivo": "string"}]
}
```

### GET /clientes
- Retorna lista de clientes con resumen agregado
- Query params opcionales: `buscar` (nombre o NIT)
```json
[{
  "id_cliente": 0,
  "nombre": "string",
  "nit": "string",
  "total_despachos": 0,
  "total_pares": 0,
  "valor_total": 0.0,
  "ultimo_despacho": "2024-01-01"
}]
```

### GET /clientes/{nit}
- Retorna detalle del cliente + lista de despachos
- Query params opcionales: `fecha_desde`, `fecha_hasta` (formato YYYY-MM-DD)
```json
{
  "cliente": {
    "id_cliente": 0,
    "nombre": "string",
    "nit": "string"
  },
  "resumen": {
    "total_despachos": 0,
    "total_pares": 0,
    "valor_total": 0.0,
    "primer_despacho": "2024-01-01",
    "ultimo_despacho": "2024-01-01"
  },
  "despachos": [{
    "id_despacho": 0,
    "fecha_despacho": "2024-01-01",
    "referencia": "string",
    "talla": 0.0,
    "cantidad_pares": 0,
    "precio_unitario": 0.0,
    "valor_total": 0.0
  }]
}
```

### GET /clientes/resumen
- Retorna totales globales para el dashboard
```json
{
  "total_clientes": 0,
  "total_despachos": 0,
  "total_pares": 0,
  "valor_total_global": 0.0,
  "top5_clientes": [{
    "nombre": "string",
    "nit": "string",
    "total_pares": 0,
    "valor_total": 0.0
  }]
}
```

### GET /clientes/tendencia
- Retorna totales agrupados por mes para las gráficas de evolución
- Ordenado cronológicamente (mes ascendente)
```json
[{
  "mes": "2024-06",
  "total_pares": 0,
  "valor_total": 0.0
}]
```

---

## Frontend — Páginas

### / → redirige a /dashboard

### /dashboard
- Consume: GET /clientes/resumen, GET /clientes/tendencia
- Muestra:
  - 4 TarjetaResumen: total clientes, despachos, pares, valor total
  - Gráfica de dona: participación porcentual top 5 clientes por pares, con leyenda (nombre, cantidad, %)
  - Gráfica de barras: pares despachados por mes
  - Gráfica de barras: valor total despachado por mes (ancho completo)
  - Botón "Cargar CSV"

### /cargar-csv
- Consume: POST /csv/upload
- Muestra: zona upload + resultado post-carga con filas ok/error

### /clientes
- Consume: GET /clientes?buscar=
- Muestra: buscador + TablaDespachos con columnas: nombre, NIT, pares, valor, despachos, última fecha

### /clientes/:nit
- Consume: GET /clientes/{nit}?fecha_desde=&fecha_hasta=
- Muestra: encabezado cliente + resumen tarjetas + filtro fechas + TablaDespachos detallada

---

## Frontend — Componentes

### Navbar
- Links: Dashboard | Clientes | Cargar CSV
- Responsive: hamburger en móvil

### TarjetaResumen
- Props: `titulo`, `valor`, `icono`, `color`
- Usada en Dashboard y ClienteDetalle

### TablaDespachos
- Props: `columnas`, `datos`, `totales` (opcional)
- Scroll horizontal en móvil
- Fila de totales al pie si se pasan totales

---

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | Cliente identificado por NIT único — upsert al importar |
| RN-02 | Cada fila CSV = un despacho |
| RN-03 | cantidad_pares: entero > 0 |
| RN-04 | precio_unitario: decimal > 0 |
| RN-05 | fecha_despacho: formato DD/MM/YYYY, no futura |
| RN-06 | valor_total: solo lectura, calculado por BD |
| RN-07 | CSV con más del 30% filas inválidas → rechazar todo |

---

## Casos de uso

| ID | Caso de uso | Descripción |
|---|---|---|
| CU-01 | Ver dashboard inicial | El administrador entra al sistema y visualiza el resumen principal: total de clientes, despachos, pares, valor total y top 5 clientes. |
| CU-02 | Cargar CSV | El administrador sube un archivo CSV UTF-8 separado por punto y coma (`;`) para registrar despachos. |
| CU-03 | Consultar clientes | El administrador revisa el listado de clientes y puede buscar por nombre o NIT. |
| CU-04 | Ver detalle de cliente | El administrador consulta el historial de despachos de un cliente específico. |
| CU-05 | Filtrar por fechas | El administrador filtra el historial de un cliente usando fecha inicial y fecha final. |

---

## Diseño UI

- **Enfoque:** Mobile First
- **Framework CSS:** Tailwind CSS
- **Iconos:** lucide-react, estilo lineal y minimalista
- **Gráficas:** Recharts (PieChart con Customized para label central, BarChart con dos ejes Y)
- **Breakpoints:** base(móvil) → sm(640px) → md(768px) → lg(1024px)
- **Paleta:**
  - Primario ENZOTEC: `#f20505`
  - Primario hover: `#b80000`
  - Fondo destacado suave: `#fee2e2`
  - Fondo general: `#f6f7f9`
  - Tarjetas: `#ffffff` con borde suave
  - Texto principal: `#111827`
  - Texto secundario: `#6b7280`
  - Bordes: `#e5e7eb`
- **Móvil:** tarjetas apiladas, tablas con scroll horizontal, nav hamburger
- **Escritorio:** tarjetas en fila, tablas completas visibles

---

## Variables de entorno

### Backend (.env / docker-compose)
```
DATABASE_URL=postgresql://admin:admin123@db:5432/tenis_db
```

### Frontend
```
VITE_API_URL=http://localhost:8000
```

---

## Instrucciones de despliegue

```bash
git clone https://github.com/usuario/tenis-despachos-enzoflow.git
cd tenis-despachos-enzoflow
docker compose up --build
# App: http://localhost:5173
# API docs: http://localhost:8000/docs
```
