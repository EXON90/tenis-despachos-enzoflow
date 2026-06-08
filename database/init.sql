-- ─────────────────────────────────────────────
-- Sistema de Despachos de Tenis
-- PostgreSQL 16
-- ─────────────────────────────────────────────

CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    nombre     VARCHAR(150) NOT NULL,
    nit        VARCHAR(20)  NOT NULL UNIQUE,
    creado_en  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cargas_csv (
    id_carga       SERIAL PRIMARY KEY,
    nombre_archivo VARCHAR(200) NOT NULL,
    total_filas    INTEGER NOT NULL,
    filas_ok       INTEGER NOT NULL,
    filas_error    INTEGER NOT NULL,
    fecha_carga    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE despachos (
    id_despacho     SERIAL PRIMARY KEY,
    id_cliente      INTEGER NOT NULL REFERENCES clientes(id_cliente),
    id_carga        INTEGER NOT NULL REFERENCES cargas_csv(id_carga),
    fecha_despacho  DATE NOT NULL,
    referencia      VARCHAR(150) NOT NULL,
    talla           DECIMAL(4,1) NOT NULL,
    cantidad_pares  INTEGER NOT NULL CHECK (cantidad_pares > 0),
    precio_unitario DECIMAL(12,2) NOT NULL CHECK (precio_unitario > 0),
    valor_total     DECIMAL(14,2) GENERATED ALWAYS AS
                    (cantidad_pares * precio_unitario) STORED,
    creado_en       TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar rendimiento en consultas frecuentes
CREATE INDEX idx_despachos_cliente ON despachos(id_cliente);
CREATE INDEX idx_despachos_fecha   ON despachos(fecha_despacho);
CREATE INDEX idx_clientes_nit      ON clientes(nit);
