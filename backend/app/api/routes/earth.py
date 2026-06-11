from datetime import date
from enum import Enum
from typing import Annotated, Literal, Optional

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import Response

from backend.app.api.dependencies import get_nasa_client, query_items
from backend.app.core.providers import ProviderName
from backend.app.services.nasa_client import NasaClient

router = APIRouter(tags=["Terra"])


class EpicCollection(str, Enum):
    NATURAL = "natural"
    ENHANCED = "enhanced"


@router.get("/eonet/events", summary="Listar eventos naturais")
async def eonet_events(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    status: Annotated[Literal["open", "closed", "all"], Query()] = "open",
    limit: Annotated[int, Query(ge=1, le=500)] = 20,
    days: Annotated[Optional[int], Query(ge=1)] = None,
) -> Response:
    return await client.get(ProviderName.EONET, "events", query_items(request))


@router.get("/earth/imagery", summary="Consultar uma imagem de satelite por coordenadas")
async def earth_imagery(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    lon: Annotated[float, Query(ge=-180, le=180)],
    lat: Annotated[float, Query(ge=-90, le=90)],
    selected_date: Annotated[Optional[date], Query(alias="date")] = None,
    dim: Annotated[float, Query(gt=0, le=1)] = 0.15,
) -> Response:
    return await client.get(ProviderName.NASA, "planetary/earth/imagery", query_items(request))


@router.get("/earth/assets", summary="Listar imagens de satelite disponiveis")
async def earth_assets(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    lon: Annotated[float, Query(ge=-180, le=180)],
    lat: Annotated[float, Query(ge=-90, le=90)],
    date_begin: Annotated[Optional[date], Query()] = None,
    date_end: Annotated[Optional[date], Query()] = None,
    dim: Annotated[float, Query(gt=0, le=1)] = 0.15,
) -> Response:
    return await client.get(ProviderName.NASA, "planetary/earth/assets", query_items(request))


@router.get("/eonet/events/{event_id}", summary="Consultar um evento natural")
async def eonet_event(
    event_id: str,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(ProviderName.EONET, f"events/{event_id}", query_items(request))


@router.get("/eonet/categories", summary="Listar categorias de eventos")
async def eonet_categories(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(ProviderName.EONET, "categories", query_items(request))


@router.get("/eonet/categories/{category_id}", summary="Consultar uma categoria EONET")
async def eonet_category(
    category_id: str,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(
        ProviderName.EONET,
        f"categories/{category_id}",
        query_items(request),
    )


@router.get("/eonet/layers/{category_id}", summary="Listar camadas de uma categoria")
async def eonet_layers(
    category_id: str,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(ProviderName.EONET, f"layers/{category_id}", query_items(request))


@router.get("/eonet/sources", summary="Listar fontes EONET")
async def eonet_sources(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(ProviderName.EONET, "sources", query_items(request))


@router.get("/eonet/sources/{source_id}", summary="Consultar uma fonte EONET")
async def eonet_source(
    source_id: str,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(ProviderName.EONET, f"sources/{source_id}", query_items(request))


@router.get("/epic/{collection}", summary="Listar as imagens EPIC mais recentes")
async def epic_latest(
    collection: EpicCollection,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(
        ProviderName.EPIC,
        f"{collection.value}/images",
        query_items(request),
    )


@router.get("/epic/{collection}/date/{selected_date}", summary="Listar imagens EPIC por data")
async def epic_by_date(
    collection: EpicCollection,
    selected_date: date,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(
        ProviderName.EPIC,
        f"{collection.value}/date/{selected_date.isoformat()}",
        query_items(request),
    )


@router.get("/epic/{collection}/available", summary="Listar datas disponiveis no EPIC")
async def epic_available(
    collection: EpicCollection,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(
        ProviderName.EPIC,
        f"{collection.value}/all",
        query_items(request),
    )


@router.get("/gibs/capabilities", summary="Obter capacidades WMTS do GIBS")
async def gibs_capabilities(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    projection: Annotated[Literal["epsg4326", "epsg3857", "epsg3413"], Query()] = "epsg4326",
) -> Response:
    return await client.get(
        ProviderName.GIBS,
        f"wmts/{projection}/best/1.0.0/WMTSCapabilities.xml",
        query_items(request),
    )
