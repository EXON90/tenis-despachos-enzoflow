from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Cliente, Despacho

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────

class ClienteResumen(BaseModel):
    id_cliente: int
    nombre: str
    nit: str
    total_despachos: int
    total_pares: int
    valor_total: float
    ultimo_despacho: Optional[date]

    class Config:
        from_attributes = True


class DespachoItem(BaseModel):
    id_despacho: int
    fecha_despacho: date
    referencia: str
    talla: float
    cantidad_pares: int
    precio_unitario: float
    valor_total: float

    class Config:
        from_attributes = True


class ClienteDetalle(BaseModel):
    id_cliente: int
    nombre: str
    nit: str


class ResumenCliente(BaseModel):
    total_despachos: int
    total_pares: int
    valor_total: float
    primer_despacho: Optional[date]
    ultimo_despacho: Optional[date]


class ClienteDetalleResponse(BaseModel):
    cliente: ClienteDetalle
    resumen: ResumenCliente
    despachos: List[DespachoItem]


class Top5Item(BaseModel):
    nombre: str
    nit: str
    total_pares: int
    valor_total: float


class TendenciaMes(BaseModel):
    mes: str
    total_pares: int
    valor_total: float


class ResumenGlobal(BaseModel):
    total_clientes: int
    total_despachos: int
    total_pares: int
    valor_total_global: float
    top5_clientes: List[Top5Item]


# ── Endpoints ─────────────────────────────────────────────────────────────

@router.get("/resumen", response_model=ResumenGlobal)
def get_resumen_global(db: Session = Depends(get_db)):
    """Totales globales para el dashboard."""
    total_clientes  = db.query(func.count(Cliente.id_cliente)).scalar() or 0
    total_despachos = db.query(func.count(Despacho.id_despacho)).scalar() or 0
    total_pares     = db.query(func.sum(Despacho.cantidad_pares)).scalar() or 0
    valor_total     = float(db.query(func.sum(Despacho.valor_total)).scalar() or 0)

    top5 = (
        db.query(
            Cliente.nombre,
            Cliente.nit,
            func.sum(Despacho.cantidad_pares).label("total_pares"),
            func.sum(Despacho.valor_total).label("valor_total"),
        )
        .join(Despacho, Despacho.id_cliente == Cliente.id_cliente)
        .group_by(Cliente.id_cliente)
        .order_by(func.sum(Despacho.cantidad_pares).desc())
        .limit(5)
        .all()
    )

    return ResumenGlobal(
        total_clientes=total_clientes,
        total_despachos=total_despachos,
        total_pares=int(total_pares),
        valor_total_global=valor_total,
        top5_clientes=[
            Top5Item(nombre=r.nombre, nit=r.nit, total_pares=int(r.total_pares), valor_total=float(r.valor_total))
            for r in top5
        ],
    )


@router.get("/tendencia", response_model=List[TendenciaMes])
def get_tendencia(db: Session = Depends(get_db)):
    """Totales de pares y valor agrupados por mes (para gráfica de evolución)."""
    resultados = (
        db.query(
            func.to_char(Despacho.fecha_despacho, "YYYY-MM").label("mes"),
            func.sum(Despacho.cantidad_pares).label("total_pares"),
            func.sum(Despacho.valor_total).label("valor_total"),
        )
        .group_by("mes")
        .order_by("mes")
        .all()
    )
    return [
        TendenciaMes(mes=r.mes, total_pares=int(r.total_pares), valor_total=float(r.valor_total))
        for r in resultados
    ]


@router.get("", response_model=List[ClienteResumen])
def get_clientes(
    buscar: Optional[str] = Query(None, description="Buscar por nombre o NIT"),
    db: Session = Depends(get_db),
):
    """Listado de clientes con resumen agregado."""
    query = (
        db.query(
            Cliente.id_cliente,
            Cliente.nombre,
            Cliente.nit,
            func.count(Despacho.id_despacho).label("total_despachos"),
            func.coalesce(func.sum(Despacho.cantidad_pares), 0).label("total_pares"),
            func.coalesce(func.sum(Despacho.valor_total), 0).label("valor_total"),
            func.max(Despacho.fecha_despacho).label("ultimo_despacho"),
        )
        .outerjoin(Despacho, Despacho.id_cliente == Cliente.id_cliente)
        .group_by(Cliente.id_cliente)
    )

    if buscar:
        like = f"%{buscar}%"
        query = query.filter(
            Cliente.nombre.ilike(like) | Cliente.nit.ilike(like)
        )

    resultados = query.order_by(func.sum(Despacho.cantidad_pares).desc().nullslast()).all()

    return [
        ClienteResumen(
            id_cliente=r.id_cliente,
            nombre=r.nombre,
            nit=r.nit,
            total_despachos=r.total_despachos,
            total_pares=int(r.total_pares),
            valor_total=float(r.valor_total),
            ultimo_despacho=r.ultimo_despacho,
        )
        for r in resultados
    ]


@router.get("/{nit}", response_model=ClienteDetalleResponse)
def get_cliente_detalle(
    nit: str,
    fecha_desde: Optional[date] = Query(None),
    fecha_hasta: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    """Detalle de un cliente con historial de despachos y filtro por fecha."""
    cliente = db.query(Cliente).filter(Cliente.nit == nit).first()
    if not cliente:
        raise HTTPException(status_code=404, detail=f"Cliente con NIT {nit} no encontrado")

    query = db.query(Despacho).filter(Despacho.id_cliente == cliente.id_cliente)

    if fecha_desde:
        query = query.filter(Despacho.fecha_despacho >= fecha_desde)
    if fecha_hasta:
        query = query.filter(Despacho.fecha_despacho <= fecha_hasta)

    despachos = query.order_by(Despacho.fecha_despacho.desc()).all()

    total_pares  = sum(d.cantidad_pares for d in despachos)
    valor_total  = float(sum(d.valor_total for d in despachos))
    fechas       = [d.fecha_despacho for d in despachos]

    return ClienteDetalleResponse(
        cliente=ClienteDetalle(
            id_cliente=cliente.id_cliente,
            nombre=cliente.nombre,
            nit=cliente.nit,
        ),
        resumen=ResumenCliente(
            total_despachos=len(despachos),
            total_pares=total_pares,
            valor_total=valor_total,
            primer_despacho=min(fechas) if fechas else None,
            ultimo_despacho=max(fechas) if fechas else None,
        ),
        despachos=[
            DespachoItem(
                id_despacho=d.id_despacho,
                fecha_despacho=d.fecha_despacho,
                referencia=d.referencia,
                talla=float(d.talla),
                cantidad_pares=d.cantidad_pares,
                precio_unitario=float(d.precio_unitario),
                valor_total=float(d.valor_total),
            )
            for d in despachos
        ],
    )
