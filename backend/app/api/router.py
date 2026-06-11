from fastapi import APIRouter

from backend.app.api.routes import (
    astronomy,
    earth,
    library,
    open_science,
    proxy,
    space_weather,
    system,
    technology,
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(system.router)
api_router.include_router(astronomy.router)
api_router.include_router(earth.router)
api_router.include_router(space_weather.router)
api_router.include_router(library.router)
api_router.include_router(open_science.router)
api_router.include_router(technology.router)
api_router.include_router(proxy.router)

