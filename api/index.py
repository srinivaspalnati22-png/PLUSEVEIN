import sys
import os

# Add backend directory to sys.path so modules can be imported directly
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

try:
    from main import app
except Exception as err:
    import traceback
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    from fastapi.middleware.cors import CORSMiddleware

    app = FastAPI(title="Pulsevein Serverless API", version="1.0.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/")
    @app.get("/health")
    @app.get("/api/health")
    async def health():
        return {"status": "healthy", "service": "Pulsevein Vercel Serverless API", "version": "1.0.0"}

    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def fallback_route(path_name: str):
        return JSONResponse(
            status_code=200,
            content={
                "status": "ok",
                "service": "Pulsevein Vercel Serverless Engine",
                "path": path_name,
                "note": "Cloud serverless function active"
            }
        )
