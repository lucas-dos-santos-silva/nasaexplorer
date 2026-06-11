from datetime import date
from enum import Enum
from typing import Annotated, Literal, Optional

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import Response

from backend.app.api.dependencies import get_nasa_client, query_items
from backend.app.core.providers import ProviderName
from backend.app.services.nasa_client import NasaClient

router = APIRouter(tags=["Astronomia"])


class SsdService(str, Enum):
    CAD = "cad"
    FIREBALL = "fireball"
    MDESIGN = "mdesign"
    NHATS = "nhats"
    SBDB = "sbdb"
    SBDB_QUERY = "sbdb-query"
    SCOUT = "scout"
    SENTRY = "sentry"


class Rover(str, Enum):
    CURIOSITY = "curiosity"
    OPPORTUNITY = "opportunity"
    PERSEVERANCE = "perseverance"
    SPIRIT = "spirit"


SSD_PATHS = {
    SsdService.CAD: "cad.api",
    SsdService.FIREBALL: "fireball.api",
    SsdService.MDESIGN: "mdesign.api",
    SsdService.NHATS: "nhats.api",
    SsdService.SBDB: "sbdb.api",
    SsdService.SBDB_QUERY: "sbdb_query.api",
    SsdService.SCOUT: "scout.api",
    SsdService.SENTRY: "sentry.api",
}


@router.get("/apod", summary="Consultar a imagem astronomica do dia")
async def apod(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    selected_date: Annotated[Optional[date], Query(alias="date")] = None,
    start_date: Annotated[Optional[date], Query()] = None,
    end_date: Annotated[Optional[date], Query()] = None,
    count: Annotated[Optional[int], Query(ge=1, le=100)] = None,
    thumbs: Annotated[bool, Query()] = False,
) -> Response:
    return await client.get(ProviderName.NASA, "planetary/apod", query_items(request))


@router.get("/asteroids/feed", summary="Listar aproximacoes de asteroides por periodo")
async def asteroid_feed(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    start_date: Annotated[Optional[date], Query()] = None,
    end_date: Annotated[Optional[date], Query()] = None,
) -> Response:
    return await client.get(ProviderName.NASA, "neo/rest/v1/feed", query_items(request))


@router.get("/asteroids/today", summary="Listar aproximacoes de asteroides de hoje")
async def asteroid_today(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    detailed: Annotated[bool, Query()] = False,
) -> Response:
    return await client.get(ProviderName.NASA, "neo/rest/v1/feed/today", query_items(request))


@router.get("/asteroids/browse", summary="Navegar pelo catalogo de asteroides")
async def asteroid_browse(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    page: Annotated[int, Query(ge=0)] = 0,
    size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> Response:
    return await client.get(ProviderName.NASA, "neo/rest/v1/neo/browse", query_items(request))


@router.get("/asteroids/{asteroid_id}", summary="Consultar um asteroide")
async def asteroid(
    asteroid_id: str,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(
        ProviderName.NASA,
        f"neo/rest/v1/neo/{asteroid_id}",
        query_items(request),
    )


@router.get("/exoplanets/query", summary="Executar consulta TAP no arquivo de exoplanetas")
async def exoplanets(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    query: Annotated[str, Query(min_length=8)],
    output_format: Annotated[Literal["json", "csv", "tsv"], Query(alias="format")] = "json",
) -> Response:
    params = [
        ("query", query),
        ("format", output_format),
    ]
    return await client.get(ProviderName.EXOPLANET, "TAP/sync", params)


@router.get("/exoplanets/legacy", summary="Consultar a API tabular legada de exoplanetas")
async def exoplanets_legacy(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    table: Annotated[str, Query(min_length=2)] = "exoplanets",
    output_format: Annotated[str, Query(alias="format")] = "json",
) -> Response:
    return await client.get(
        ProviderName.EXOPLANET,
        "cgi-bin/nstedAPI/nph-nstedAPI",
        query_items(request),
    )


@router.get("/mars/rovers/{rover}/photos", summary="Consultar fotos de um rover em Marte")
async def mars_rover_photos(
    rover: Rover,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    sol: Annotated[Optional[int], Query(ge=0)] = None,
    earth_date: Annotated[Optional[date], Query()] = None,
    camera: Annotated[Optional[str], Query()] = None,
    page: Annotated[int, Query(ge=1)] = 1,
) -> Response:
    return await client.get(
        ProviderName.NASA,
        f"mars-photos/api/v1/rovers/{rover.value}/photos",
        query_items(request),
    )


@router.get(
    "/mars/rovers/{rover}/latest",
    summary="Consultar as fotos mais recentes de um rover",
)
async def mars_rover_latest(
    rover: Rover,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(
        ProviderName.NASA,
        f"mars-photos/api/v1/rovers/{rover.value}/latest_photos",
        query_items(request),
    )


@router.get(
    "/mars/rovers/{rover}/manifest",
    summary="Consultar o manifesto de uma missao rover",
)
async def mars_rover_manifest(
    rover: Rover,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(
        ProviderName.NASA,
        f"mars-photos/api/v1/manifests/{rover.value}",
        query_items(request),
    )


@router.get("/ssd/{service}", summary="Consultar um servico SSD/CNEOS")
async def ssd(
    service: SsdService,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(ProviderName.SSD, SSD_PATHS[service], query_items(request))
