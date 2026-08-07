"""
Pulsevein Backend — FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import settings
from routers import analysis, auth, history

app = FastAPI(
    title="Pulsevein API",
    description="Multimodal Deepfake Reality Checker — rPPG + Lip-Sync Analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers mounted on both root and /api prefixes for full URL compatibility
app.include_router(analysis.router)
app.include_router(analysis.router, prefix="/api")
app.include_router(auth.router)
app.include_router(auth.router, prefix="/api")
app.include_router(history.router)
app.include_router(history.router, prefix="/api")


@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "service": "Pulsevein API", "version": "1.0.0"}


@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy"}


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)[:200]}"},
    )
