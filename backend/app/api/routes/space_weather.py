from datetime import date
from enum import Enum
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import Response

from backend.app.api.dependencies import get_nasa_client, query_items
from backend.app.core.providers import ProviderName
from backend.app.services.nasa_client import NasaClient

router = APIRouter(tags=["Clima espacial"])


class DonkiEvent(str, Enum):
    CME = "CME"
    CME_ANALYSIS = "CMEAnalysis"
    FLR = "FLR"
    GST = "GST"
    HSS = "HSS"
    IPS = "IPS"
    MPC = "MPC"
    RBE = "RBE"
    SEP = "SEP"
    WSA_ENLIL = "WSAEnlilSimulations"
    NOTIFICATIONS = "notifications"


@router.get("/donki/{event}", summary="Consultar eventos DONKI")
async def donki(
    event: DonkiEvent,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    start_date: Annotated[Optional[date], Query(alias="startDate")] = None,
    end_date: Annotated[Optional[date], Query(alias="endDate")] = None,
) -> Response:
    return await client.get(ProviderName.NASA, f"DONKI/{event.value}", query_items(request))


@router.get("/insight", summary="Consultar o historico meteorologico da InSight")
async def insight(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    feedtype: Annotated[str, Query()] = "json",
    version: Annotated[str, Query(alias="ver")] = "1.0",
) -> Response:
    params = query_items(request)
    if not params:
        params = [("feedtype", feedtype), ("ver", version)]
    return await client.get(ProviderName.NASA, "insight_weather/", params)


@router.get("/tle", summary="Pesquisar elementos orbitais")
async def tle_collection(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    search: Annotated[Optional[str], Query()] = None,
    page: Annotated[int, Query(ge=1)] = 1,
) -> Response:
    return await client.get(ProviderName.TLE, "", query_items(request))


@router.get("/tle/{satellite_number}", summary="Consultar elementos orbitais de um satelite")
async def tle_single(
    satellite_number: int,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(ProviderName.TLE, str(satellite_number), query_items(request))
