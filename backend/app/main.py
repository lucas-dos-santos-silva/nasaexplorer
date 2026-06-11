from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.api.router import api_router
from backend.app.core.config import get_settings
from backend.app.core.errors import UpstreamError, upstream_error_handler
from backend.app.services.nasa_client import NasaClient

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.nasa_client = NasaClient(settings)
    yield
    await app.state.nasa_client.close()


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Gateway GET para APIs publicas da NASA.",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)
app.add_exception_handler(UpstreamError, upstream_error_handler)
app.include_router(api_router)

frontend_dist = Path(__file__).resolve().parents[3] / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
