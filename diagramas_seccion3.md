# Diagramas UML — Sistema de Despachos de Tenis

---

## 3.2.1 Modelo Entidad-Relación

```mermaid
erDiagram
    CARGA_CSV {
        serial id_carga PK
        varchar nombre_archivo
        integer total_filas
        integer filas_ok
        integer filas_error
        timestamp fecha_carga
    }

    CLIENTE {
        serial id_cliente PK
        varchar nombre
        varchar nit
        timestamp creado_en
    }

    DESPACHO {
        serial id_despacho PK
        integer id_cliente FK
        integer id_carga FK
        date fecha_despacho
        varchar referencia
        decimal talla
        integer cantidad_pares
        decimal precio_unitario
        decimal valor_total
        timestamp creado_en
    }

    CARGA_CSV ||--o{ DESPACHO : "contiene"
    CLIENTE ||--o{ DESPACHO : "recibe"
```

---

## 3.4.1 Diagrama de Casos de Uso

```mermaid
graph LR
    Admin(["👤 Administrador"])

    subgraph Sistema["Sistema de Despachos de Tenis - Enzoflow"]
        CU1(["Ver dashboard inicial"])
        CU2(["Cargar CSV"])
        CU3(["Ver listado de clientes"])
        CU4(["Ver detalle de cliente"])
        CU5(["Filtrar por fechas"])
    end

    Admin --> CU1
    Admin --> CU2
    Admin --> CU3
    Admin --> CU4
    Admin --> CU5

    CU4 -.->|include| CU5
```

---

## 3.4.2 Diagrama de Clases

```mermaid
classDiagram
    class CargaCSV {
        +int id
        +String nombre_archivo
        +int total_filas
        +int filas_ok
        +int filas_error
        +DateTime fecha_carga
        +procesar()
        +validar_columnas()
    }

    class Cliente {
        +int id
        +String nombre
        +String nit
        +DateTime creado_en
        +get_total_pares()
        +get_valor_total()
    }

    class Despacho {
        +int id
        +int id_cliente
        +int id_carga
        +Date fecha_despacho
        +String referencia
        +Decimal talla
        +int cantidad_pares
        +Decimal precio_unitario
        +Decimal valor_total
        +DateTime creado_en
        +get_valor()
    }

    CargaCSV "1" --> "0..*" Despacho : contiene
    Cliente "1" --> "0..*" Despacho : recibe
```

---

## 3.4.3 Diagrama de Secuencia — Carga de CSV

```mermaid
sequenceDiagram
    actor Admin
    participant FE as Frontend (React)
    participant BE as Backend (FastAPI)
    participant DB as Base de Datos (PostgreSQL)

    Admin->>FE: Sube archivo CSV
    FE->>BE: POST /csv/upload (multipart/form-data)
    BE->>BE: Valida columnas requeridas
    Note right of BE: fecha_despacho, cliente_nombre,<br/>cliente_nit, referencia,<br/>talla, cantidad_pares,<br/>precio_unitario

    alt CSV inválido - más del 30% de errores
        BE-->>FE: 400 - Archivo rechazado
        FE-->>Admin: Muestra error total
    else CSV válido
        BE->>DB: INSERT cargas_csv
        DB-->>BE: id_carga generado

        loop Por cada fila del CSV
            BE->>DB: SELECT cliente por NIT
            alt Cliente nuevo
                BE->>DB: INSERT cliente
                DB-->>BE: id_cliente generado
            else Cliente existente
                DB-->>BE: id_cliente existente
            end
            BE->>DB: INSERT despacho
            Note right of DB: BD calcula valor_total<br/>= cantidad_pares x precio_unitario
            DB-->>BE: OK
        end

        BE->>DB: UPDATE cargas_csv filas_ok y filas_error
        BE-->>FE: 200 - filas_ok, filas_error, errores
        FE-->>Admin: Muestra resumen de carga
    end
```

---

## 3.4.4 Diagrama de Componentes

```mermaid
graph TB
    subgraph Docker["Docker Compose"]

        subgraph FE["Frontend — Puerto 5173"]
            Dashboard["/dashboard"]
            CargaCSV["/cargar-csv"]
            Clientes["/clientes"]
            Detalle["/clientes/:nit"]
        end

        subgraph BE["Backend — Puerto 8000"]
            CSVRouter["/csv/upload"]
            ClientesRouter["/clientes"]
        end

        subgraph DB["Base de Datos — Puerto 5432"]
            TClientes["Tabla: clientes"]
            TDespachos["Tabla: despachos"]
            TCargas["Tabla: cargas_csv"]
        end

    end

    Dashboard --> ClientesRouter
    CargaCSV --> CSVRouter
    Clientes --> ClientesRouter
    Detalle --> ClientesRouter

    CSVRouter --> TCargas
    CSVRouter --> TClientes
    CSVRouter --> TDespachos
    ClientesRouter --> TClientes
    ClientesRouter --> TDespachos
```
