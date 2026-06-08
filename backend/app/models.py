from sqlalchemy import Column, Computed, Integer, String, Date, Numeric, TIMESTAMP, ForeignKey, text
from sqlalchemy.orm import relationship
from app.database import Base

class Cliente(Base):
    __tablename__ = "clientes"

    id_cliente = Column(Integer, primary_key=True, index=True)
    nombre     = Column(String(150), nullable=False)
    nit        = Column(String(20), nullable=False, unique=True, index=True)
    creado_en  = Column(TIMESTAMP, server_default=text("NOW()"))

    despachos  = relationship("Despacho", back_populates="cliente")


class CargaCSV(Base):
    __tablename__ = "cargas_csv"

    id_carga       = Column(Integer, primary_key=True, index=True)
    nombre_archivo = Column(String(200), nullable=False)
    total_filas    = Column(Integer, nullable=False)
    filas_ok       = Column(Integer, nullable=False)
    filas_error    = Column(Integer, nullable=False)
    fecha_carga    = Column(TIMESTAMP, server_default=text("NOW()"))

    despachos      = relationship("Despacho", back_populates="carga")


class Despacho(Base):
    __tablename__ = "despachos"

    id_despacho     = Column(Integer, primary_key=True, index=True)
    id_cliente      = Column(Integer, ForeignKey("clientes.id_cliente"), nullable=False)
    id_carga        = Column(Integer, ForeignKey("cargas_csv.id_carga"), nullable=False)
    fecha_despacho  = Column(Date, nullable=False, index=True)
    referencia      = Column(String(150), nullable=False)
    talla           = Column(Numeric(4, 1), nullable=False)
    cantidad_pares  = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(12, 2), nullable=False)
    # valor_total es columna GENERATED en la BD — solo lectura desde Python
    valor_total     = Column(Numeric(14, 2), Computed("cantidad_pares * precio_unitario", persisted=True))
    creado_en       = Column(TIMESTAMP, server_default=text("NOW()"))

    cliente = relationship("Cliente", back_populates="despachos")
    carga   = relationship("CargaCSV", back_populates="despachos")
