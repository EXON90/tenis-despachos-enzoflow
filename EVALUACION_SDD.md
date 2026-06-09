# Evaluacion del SDD y documentacion

> **Estado del proyecto: LISTO PARA EVALUACION**
> Todos los puntos criticos y medios han sido resueltos. El codigo, la documentacion tecnica y el documento Word estan alineados.

---

## Estado final por elemento

| Elemento | Estado | Observacion |
|---|---|---|
| Alcance | ✅ Completo | Carga CSV, clientes, historial, dashboard con graficas, Docker Compose |
| Autenticacion | ✅ Excluida correctamente | No aparece como caso de uso ni en el codigo |
| CSV | ✅ Alineado | UTF-8, separado por `;`, columnas validadas, regla del 30% activa |
| Base de datos | ✅ Completa | 3 tablas, columna GENERATED, 3 indices, esquema coherente con el SDD |
| API | ✅ Completa | 5 endpoints documentados e implementados |
| Frontend | ✅ Completo | 4 pantallas, 3 componentes, diseño Mobile First con Tailwind CSS |
| Graficas | ✅ Implementadas | Recharts 3.8.1: dona + barras de pares + barras de valor |
| Diagramas UML | ✅ Disponibles | `diagramas_seccion3.md` con 5 diagramas Mermaid versionados |
| Docker Compose | ✅ Funcional | 3 servicios con healthcheck, un solo comando para levantar todo |
| Documento Word | ✅ Actualizado | Todas las secciones criticas y medias resueltas |
| README.md | ✅ Completo | Instrucciones claras, formato del CSV documentado, URLs de acceso |

---

## Endpoints implementados

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/csv/upload` | Carga y procesa archivo CSV con validaciones |
| GET | `/clientes` | Lista todos los clientes con resumen agregado |
| GET | `/clientes/resumen` | Totales globales para el dashboard y top 5 |
| GET | `/clientes/tendencia` | Totales por mes para graficas de evolucion |
| GET | `/clientes/{nit}` | Detalle + despachos + filtro por fecha |

---

## Reglas de negocio — verificacion de implementacion

| ID | Regla | Implementada en |
|---|---|---|
| RN-01 | Cliente identificado por NIT unico | `csv_upload.py` — upsert por NIT |
| RN-02 | Cada fila CSV = un despacho | `csv_upload.py` — insert por fila valida |
| RN-03 | cantidad_pares entero > 0 | `csv_upload.py` — `validar_fila()` + `CHECK > 0` en SQL |
| RN-04 | precio_unitario decimal > 0 | `csv_upload.py` — `validar_fila()` + `CHECK > 0` en SQL |
| RN-05 | fecha_despacho formato D/MM/YYYY, no futura | `csv_upload.py` — `dayfirst=True`, comparacion con `date.today()` |
| RN-06 | valor_total solo lectura | `init.sql` — `GENERATED ALWAYS AS (cantidad_pares * precio_unitario) STORED` |
| RN-07 | CSV con >30% filas invalidas rechazado | `csv_upload.py` — bloque de rechazo total con HTTP 400 |

---

## Decisiones tecnicas relevantes

- **Columna GENERATED en PostgreSQL:** `valor_total` nunca puede ser modificado desde la aplicacion, garantizando consistencia absoluta del dato.
- **Label central de la dona con `<Customized>`:** renderiza dentro del SVG para que el tooltip HTML quede siempre encima, evitando superposicion visual.
- **Endpoint `/clientes/tendencia` antes de `/{nit}`:** el orden de definicion en FastAPI es critico — la ruta literal `/tendencia` se registra primero para que el router no la interprete como un NIT.
- **Frontend en modo `dev` con Docker:** la variable `VITE_API_URL` es tomada en tiempo de ejecucion (no de build), lo que permite que el contenedor resuelva la URL correctamente sin recompilar.
- **Indices en `init.sql`:** `idx_clientes_nit`, `idx_despachos_cliente` e `idx_despachos_fecha` estan creados desde el inicio para soportar las consultas mas frecuentes del sistema.

---

## Pendientes menores antes de entrega final

- [ ] Corregir en la seccion 4.5 del Word el comando `cd tenis-despachos` por `cd tenis-despachos-enzoflow`.
- [ ] Corregir RN-05 en el Word: aparece `DD/MM /YYYY`; debe quedar `DD/MM/YYYY`.
- [ ] Aclarar en el Word que la tabla del archivo CSV de ejemplo muestra una muestra parcial o incluir las 7 filas reales del archivo `database/ejemplo_despachos.csv`.
- [ ] Insertar screenshots reales en Anexos F y G del documento Word (evidencias de Docker y del sistema funcionando).

---

## Conclusion

El proyecto **supera el alcance original del MVP**. La implementacion cubre todos los requerimientos funcionales (RF-01 al RF-10) y no funcionales (RNF-01 al RNF-05). Las graficas interactivas agregan valor analitico sin complejidad adicional de infraestructura. La arquitectura es coherente, el despliegue es reproducible con un solo comando y la documentacion tecnica esta versionada junto al codigo — lo que refleja una practica profesional real de desarrollo de software.
