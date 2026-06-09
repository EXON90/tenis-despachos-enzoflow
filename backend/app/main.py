from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import csv_upload, clientes

app = FastAPI(
    title="API — Sistema de Despachos de Tenis Enzoflow",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(csv_upload.router, prefix="/csv",      tags=["CSV"])
app.include_router(clientes.router,   prefix="/clientes", tags=["Clientes"])

@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "app": "Despachos de Tenis Enzoflow"}
