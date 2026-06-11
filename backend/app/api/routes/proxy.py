from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response

from backend.app.api.dependencies import get_nasa_client, query_items
from backend.app.core.providers import ProviderName
from backend.app.services.nasa_client import NasaClient

router = APIRouter(tags=["Cobertura avancada"])


@router.get(
    "/proxy/{provider}/{path:path}",
    summary="Encaminhar GET para um provedor NASA permitido",
)
async def provider_proxy(
    provider: ProviderName,
    path: str,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(provider, path, query_items(request))

