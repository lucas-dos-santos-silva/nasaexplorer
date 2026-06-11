from enum import Enum
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import Response

from backend.app.api.dependencies import get_nasa_client, query_items
from backend.app.core.providers import ProviderName
from backend.app.services.nasa_client import NasaClient

router = APIRouter(tags=["Tecnologia e missoes"])


class TransferType(str, Enum):
    PATENT = "patent"
    PATENT_ISSUED = "patent_issued"
    SOFTWARE = "software"
    SPINOFF = "spinoff"


@router.get("/techtransfer/{transfer_type}", summary="Pesquisar tecnologias NASA")
async def techtransfer(
    transfer_type: TransferType,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    query: Annotated[Optional[str], Query()] = None,
) -> Response:
    params = [
        ("engine" if key == "query" else key, value)
        for key, value in query_items(request)
    ]
    return await client.get(
        ProviderName.NASA,
        f"techtransfer/{transfer_type.value}/",
        params,
    )


@router.get("/techport/projects", summary="Listar projetos do TechPort")
async def techport_projects(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(ProviderName.TECHPORT, "projects", query_items(request))


@router.get("/techport/projects/{project_id}", summary="Consultar um projeto do TechPort")
async def techport_project(
    project_id: int,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(
        ProviderName.TECHPORT,
        f"projects/{project_id}",
        query_items(request),
    )


@router.get("/ssc/observatories", summary="Listar observatorios e naves do SSC")
async def ssc_observatories(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(ProviderName.SSC, "observatories", query_items(request))


@router.get("/ssc/application.wadl", summary="Obter a especificacao WADL do SSC")
async def ssc_wadl(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(ProviderName.SSC, "application.wadl", query_items(request))


@router.get("/ssc/spase-observatories", summary="Listar observatorios SPASE")
async def ssc_spase_observatories(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(ProviderName.SSC, "spaseObservatories", query_items(request))


@router.get("/ssc/ground-stations", summary="Listar estacoes terrestres")
async def ssc_ground_stations(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(ProviderName.SSC, "groundStations", query_items(request))


@router.get(
    "/ssc/observatories/{observatory}/client-example/{library}",
    summary="Obter um cliente de exemplo do SSC",
)
async def ssc_client_example(
    observatory: str,
    library: str,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    media_type: Annotated[Optional[str], Query(alias="mediaType")] = None,
) -> Response:
    path = f"observatories/{observatory}/clientLibraryExample/{library}"
    return await client.get(ProviderName.SSC, path, query_items(request))


@router.get(
    "/ssc/locations/{observatories}/{time_range}/{coordinate_systems}",
    summary="Consultar localizacoes simplificadas no SSC",
)
async def ssc_locations(
    observatories: str,
    time_range: str,
    coordinate_systems: str,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    resolution_factor: Annotated[
        Optional[int],
        Query(alias="resolutionFactor", ge=1),
    ] = None,
) -> Response:
    path = f"locations/{observatories}/{time_range}/{coordinate_systems}/"
    return await client.get(ProviderName.SSC, path, query_items(request))


@router.get("/trek/{body}/capabilities", summary="Consultar capacidades de um mapa Trek")
async def trek_capabilities(
    body: str,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    mosaic: Annotated[str, Query(min_length=2)],
) -> Response:
    normalized = body.lower()
    if normalized not in {"mars", "vesta"}:
        return await client.get(
            ProviderName.TREK,
            "tiles/apidoc/trekAPI.html",
            [("body", normalized)],
        )
    return await client.get(
        ProviderName.NASA,
        f"{normalized}-wmts/catalog/{mosaic}/1.0.0/WMTSCapabilities.xml",
        query_items(request),
    )
