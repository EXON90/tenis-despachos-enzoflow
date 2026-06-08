# Cambios realizados en el proyecto

Este archivo documenta los cambios aplicados durante la construccion y ajuste del proyecto ENZOFLOW. La idea es dejar una guia clara de que se modifico, por que se modifico y como probarlo.

## 1. Ajustes del SDD y documentacion

### Archivos modificados

- `SPEC.md`
- `README.md`
- `diagramas_seccion3.md`
- `EVALUACION_SDD.md`

### Cambios

- Se cambio el caso de uso inicial para que sea `CU-01 Ver dashboard inicial`.
- Se elimino la idea de `Iniciar sesion` como caso de uso, porque el alcance del MVP no incluye autenticacion.
- Se agrego una seccion de casos de uso en `SPEC.md`.
- Se confirmo que `diagramas_seccion3.md` existe y contiene los diagramas UML del proyecto.
- Se creo `EVALUACION_SDD.md` como informe comparativo entre el SDD, la documentacion y el estado real del proyecto.

### Motivo

El sistema no tiene autenticacion. Por eso, la entrada natural a la aplicacion debe ser el dashboard, donde el administrador ve la informacion mas importante del negocio.

## 2. Formato del CSV

### Archivos modificados

- `database/ejemplo_despachos.csv`
- `backend/app/routers/csv_upload.py`
- `README.md`
- `SPEC.md`
- `EVALUACION_SDD.md`
- `frontend/src/pages/CargaCSV.jsx`

### Cambios

- El CSV oficial quedo definido como archivo `UTF-8` separado por punto y coma (`;`).
- El archivo `database/ejemplo_despachos.csv` fue actualizado para usar `;` como delimitador.
- El backend ahora lee el CSV con `pd.read_csv(..., sep=";")`.
- El formato de fecha del CSV quedo definido como `DD/MM/YYYY`.
- El backend interpreta las fechas con `dayfirst=True`.
- La pantalla de carga ahora informa que el archivo debe estar separado por punto y coma.
- La pantalla de carga muestra la lista de columnas usando `;` como separador visual.

### Motivo

El archivo CSV real estaba delimitado por `;`. Pandas estaba intentando leerlo con coma, lo que hacia que todas las columnas se interpretaran como una sola y la carga fallara.

## 3. Correccion del valor total generado

### Archivo modificado

- `backend/app/models.py`

### Cambios

- Se importo `Computed` desde SQLAlchemy.
- La columna `valor_total` se definio como columna calculada:

```python
valor_total = Column(
    Numeric(14, 2),
    Computed("cantidad_pares * precio_unitario", persisted=True)
)
```

### Motivo

PostgreSQL calcula `valor_total` automaticamente con una columna `GENERATED ALWAYS`. Antes SQLAlchemy intentaba insertar `valor_total = None`, y PostgreSQL rechazaba la operacion. Esto causaba error 500 al cargar el CSV.

## 4. Uso de pnpm en frontend

### Archivos modificados o agregados

- `frontend/package.json`
- `frontend/pnpm-lock.yaml`
- `frontend/pnpm-workspace.yaml`
- `frontend/.npmrc`
- `frontend/Dockerfile`
- `frontend/.dockerignore`
- `.gitignore`

### Cambios

- Se instalo `lucide-react` usando `pnpm`.
- Se agrego `pnpm-lock.yaml`.
- Se configuro `pnpm-workspace.yaml` para permitir el build de `esbuild`.
- Se agrego `.npmrc` para ajustar el comportamiento de pnpm en el proyecto.
- El Dockerfile del frontend ahora usa `pnpm`.
- El contenedor frontend se actualizo a `node:24-alpine`, porque `pnpm 11` requiere una version moderna de Node.
- Se agrego `.dockerignore` en frontend para evitar copiar `node_modules` y `dist` al contexto de Docker.
- Se agrego `.pnpm-store/` al `.gitignore`, porque es cache local y no debe subirse al repositorio.

### Comandos utiles

Desde `frontend`:

```powershell
pnpm approve-builds --all
pnpm install
pnpm build
```

Desde la raiz del proyecto:

```powershell
docker compose up --build
```

### Motivo

El usuario decidio usar `pnpm` en lugar de `npm`. Se adapto el flujo local y Docker para que el frontend pueda instalar dependencias y ejecutarse con pnpm.

## 5. Iconos minimalistas

### Archivos modificados

- `frontend/package.json`
- `frontend/src/components/Navbar.jsx`
- `frontend/src/components/TarjetaResumen.jsx`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/CargaCSV.jsx`
- `frontend/src/pages/Clientes.jsx`
- `frontend/src/pages/ClienteDetalle.jsx`

### Cambios

- Se instalo `lucide-react`.
- Se reemplazaron emojis por iconos lineales minimalistas.
- Iconos usados:
  - `LayoutDashboard`
  - `Users`
  - `Upload`
  - `Package`
  - `ShoppingBag`
  - `CircleDollarSign`
  - `Search`
  - `Eye`
  - `CalendarDays`
  - `ArrowLeft`
  - `FileUp`
  - `CheckCircle2`
  - `XCircle`
  - `Menu`
  - `X`

### Motivo

Los iconos minimalistas hacen que la interfaz se vea mas limpia, profesional y facil de entender sin sobrecargar visualmente el proyecto.

## 6. Paleta visual ENZOTEC

### Archivo principal

- `frontend/tailwind.config.js`

### Paleta agregada

```js
enzotec: {
  red: '#f20505',
  darkRed: '#b80000',
  softRed: '#fee2e2',
  ink: '#111827',
  muted: '#6b7280',
  panel: '#ffffff',
  surface: '#f6f7f9',
  border: '#e5e7eb',
}
```

### Uso visual

- Rojo principal para botones, acciones importantes y enlaces activos.
- Rojo oscuro para estados hover.
- Rojo suave para fondos destacados.
- Gris oscuro para encabezados y tablas.
- Blanco para tarjetas y paneles.
- Gris claro para fondo general y bordes.

### Motivo

La paleta se baso en la imagen de ENZOTEC compartida por el usuario. Se busco una interfaz armonica, sencilla y apropiada para un dashboard administrativo.

## 7. Estilos del dashboard

### Archivos modificados

- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/components/TarjetaResumen.jsx`
- `frontend/src/components/TablaDespachos.jsx`
- `frontend/src/App.jsx`

### Cambios

- El fondo general ahora usa `bg-enzotec-surface`.
- Las tarjetas resumen usan fondo blanco, borde suave e iconos minimalistas.
- El boton principal `Cargar CSV` usa rojo ENZOTEC.
- La tabla usa encabezado oscuro para mejorar lectura.
- El dashboard muestra:
  - total de clientes
  - total de despachos
  - total de pares
  - valor total
  - top 5 clientes por volumen
- La pantalla de detalle de cliente muestra `primer_despacho` y `ultimo_despacho`, de acuerdo con la respuesta del API y el SDD.

### Motivo

El dashboard debe mostrar la informacion importante de forma rapida, clara y visualmente ordenada.

## 8. Verificaciones realizadas

### Backend

- `http://localhost:8000/` respondio correctamente.
- La carga directa del CSV devolvio:

```json
{
  "total_filas": 7,
  "filas_ok": 7,
  "filas_error": 0,
  "errores": []
}
```

- El resumen global devolvio datos correctos despues de importar el CSV:
  - 3 clientes
  - 7 despachos
  - 115 pares
  - valor total de 19.030.000

### Frontend

- Vite compilo correctamente con:

```powershell
.\node_modules\.bin\vite.CMD build
```

- El frontend respondio en:

```text
http://localhost:5173
```

### Docker

- Los servicios `frontend`, `backend` y `db` quedaron levantados correctamente.
- El frontend Docker construyo correctamente usando `node:24-alpine` y `pnpm`.

## 9. Pasos recomendados para continuar

1. Abrir el proyecto en VS Code.
2. Levantar Docker:

```powershell
docker compose up --build
```

3. Abrir la aplicacion:

```text
http://localhost:5173
```

4. Subir el archivo:

```text
database/ejemplo_despachos.csv
```

5. Revisar:
   - Dashboard
   - Clientes
   - Detalle de cliente
   - Filtro por fecha

## 10. Nota importante

Si aparecen datos duplicados por haber cargado varias veces el CSV durante pruebas, se puede reiniciar la base de datos con:

```powershell
docker compose down -v
docker compose up --build
```

Ese comando elimina el volumen de PostgreSQL y deja la base limpia.
