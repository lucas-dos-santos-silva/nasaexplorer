from fastapi import APIRouter

from backend.app.core.catalog import NASA_PRODUCTS

router = APIRouter(tags=["Sistema"])


@router.get("/health", summary="Verificar disponibilidade da API")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/catalog", summary="Listar produtos NASA disponiveis")
async def catalog() -> dict[str, object]:
    return {"count": len(NASA_PRODUCTS), "products": NASA_PRODUCTS}

