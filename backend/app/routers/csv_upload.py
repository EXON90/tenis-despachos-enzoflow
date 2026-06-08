import io
from datetime import date
from typing import List

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CargaCSV, Cliente, Despacho

router = APIRouter()

COLUMNAS_REQUERIDAS = {
    "fecha_despacho",
    "cliente_nombre",
    "cliente_nit",
    "referencia",
    "talla",
    "cantidad_pares",
    "precio_unitario",
}


# ── Schemas de respuesta ──────────────────────────────────────────────────

class ErrorFila(BaseModel):
    fila: int
    motivo: str

class ResultadoCarga(BaseModel):
    nombre_archivo: str
    total_filas: int
    filas_ok: int
    filas_error: int
    errores: List[ErrorFila]


# ── Lógica de validación por fila ─────────────────────────────────────────

def validar_fila(fila: dict, numero: int):
    """Retorna motivo de error o None si la fila es válida."""
    try:
        fecha = pd.to_datetime(fila["fecha_despacho"], dayfirst=True).date()
        if fecha > date.today():
            return f"fecha_despacho no puede ser futura: {fecha}"
    except Exception:
        return "fecha_despacho inválida, usar formato DD/MM/YYYY"

    try:
        cantidad = int(fila["cantidad_pares"])
        if cantidad <= 0:
            return "cantidad_pares debe ser mayor a 0"
    except Exception:
        return "cantidad_pares debe ser un número entero"

    try:
        precio = float(fila["precio_unitario"])
        if precio <= 0:
            return "precio_unitario debe ser mayor a 0"
    except Exception:
        return "precio_unitario debe ser un número decimal"

    if not str(fila.get("cliente_nit", "")).strip():
        return "cliente_nit no puede estar vacío"

    if not str(fila.get("cliente_nombre", "")).strip():
        return "cliente_nombre no puede estar vacío"

    return None


# ── Endpoint ──────────────────────────────────────────────────────────────

@router.post("/upload", response_model=ResultadoCarga)
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos .csv")

    contenido = await file.read()
    try:
        df = pd.read_csv(io.StringIO(contenido.decode("utf-8")), sep=";")
    except Exception:
        raise HTTPException(status_code=400, detail="No se pudo leer el archivo. Verificar que sea CSV UTF-8 separado por punto y coma")

    # Validar columnas requeridas
    columnas_presentes = set(df.columns.str.strip().str.lower())
    faltantes = COLUMNAS_REQUERIDAS - columnas_presentes
    if faltantes:
        raise HTTPException(
            status_code=400,
            detail=f"Columnas faltantes en el CSV: {', '.join(sorted(faltantes))}"
        )

    df.columns = df.columns.str.strip().str.lower()
    total_filas = len(df)
    errores: List[ErrorFila] = []
    filas_validas = []

    for i, row in df.iterrows():
        motivo = validar_fila(row.to_dict(), i + 2)
        if motivo:
            errores.append(ErrorFila(fila=i + 2, motivo=motivo))
        else:
            filas_validas.append(row)

    # Regla RN-07: más del 30% inválidas → rechazar todo
    if total_filas > 0 and (len(errores) / total_filas) > 0.30:
        raise HTTPException(
            status_code=400,
            detail=f"El archivo tiene {len(errores)}/{total_filas} filas inválidas (más del 30%). No se importó nada."
        )

    # Registrar la carga
    carga = CargaCSV(
        nombre_archivo=file.filename,
        total_filas=total_filas,
        filas_ok=len(filas_validas),
        filas_error=len(errores),
    )
    db.add(carga)
    db.flush()  # obtener id_carga sin hacer commit aún

    # Insertar filas válidas
    for row in filas_validas:
        nit = str(row["cliente_nit"]).strip()
        nombre = str(row["cliente_nombre"]).strip()

        # Upsert cliente por NIT (RN-01)
        cliente = db.query(Cliente).filter(Cliente.nit == nit).first()
        if not cliente:
            cliente = Cliente(nombre=nombre, nit=nit)
            db.add(cliente)
            db.flush()

        despacho = Despacho(
            id_cliente=cliente.id_cliente,
            id_carga=carga.id_carga,
            fecha_despacho=pd.to_datetime(row["fecha_despacho"], dayfirst=True).date(),
            referencia=str(row["referencia"]).strip(),
            talla=float(row["talla"]),
            cantidad_pares=int(row["cantidad_pares"]),
            precio_unitario=float(row["precio_unitario"]),
        )
        db.add(despacho)

    db.commit()

    return ResultadoCarga(
        nombre_archivo=file.filename,
        total_filas=total_filas,
        filas_ok=len(filas_validas),
        filas_error=len(errores),
        errores=errores,
    )
