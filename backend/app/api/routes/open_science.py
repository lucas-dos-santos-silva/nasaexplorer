from enum import Enum
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import Response

from backend.app.api.dependencies import get_nasa_client, query_items
from backend.app.core.providers import ProviderName
from backend.app.services.nasa_client import NasaClient

router = APIRouter(tags=["Ciencia aberta"])


class OsdrEntity(str, Enum):
    BIOSPECIMEN = "biospecimen"
    EXPERIMENT = "experiment"
    HARDWARE = "hardware"
    MISSION = "mission"
    PAYLOAD = "payload"
    SUBJECT = "subject"
    VEHICLE = "vehicle"


OSDR_COLLECTIONS = {
    OsdrEntity.BIOSPECIMEN: "biospecimens",
    OsdrEntity.EXPERIMENT: "experiments",
    OsdrEntity.HARDWARE: "hardware",
    OsdrEntity.MISSION: "missions",
    OsdrEntity.PAYLOAD: "payloads",
    OsdrEntity.SUBJECT: "subjects",
    OsdrEntity.VEHICLE: "vehicles",
}


@router.get("/osdr/search", summary="Pesquisar estudos no OSDR")
async def osdr_search(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    term: Annotated[Optional[str], Query()] = None,
    offset: Annotated[int, Query(alias="from", ge=0)] = 0,
    size: Annotated[int, Query(ge=1, le=100)] = 25,
) -> Response:
    return await client.get(ProviderName.OSDR, "osdr/data/search", query_items(request))


@router.get("/osdr/files/{study_ids}", summary="Listar arquivos de estudos OSDR")
async def osdr_files(
    study_ids: str,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    page: Annotated[int, Query(ge=0)] = 0,
    size: Annotated[int, Query(ge=1, le=25)] = 25,
    all_files: Annotated[bool, Query()] = False,
) -> Response:
    return await client.get(
        ProviderName.OSDR,
        f"osdr/data/osd/files/{study_ids}",
        query_items(request),
    )


@router.get("/osdr/metadata/{study_id}", summary="Consultar metadados de um estudo OSDR")
async def osdr_metadata(
    study_id: str,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(
        ProviderName.OSDR,
        f"osdr/data/osd/meta/{study_id}",
        query_items(request),
    )


@router.get("/osdr/entities/{entity}", summary="Listar entidades de ciencia espacial")
async def osdr_entities(
    entity: OsdrEntity,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    path = f"geode-py/ws/api/{OSDR_COLLECTIONS[entity]}"
    return await client.get(ProviderName.OSDR, path, query_items(request))


@router.get(
    "/osdr/entities/{entity}/{identifier}",
    summary="Consultar uma entidade de ciencia espacial",
)
async def osdr_entity(
    entity: OsdrEntity,
    identifier: str,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    path = f"geode-py/ws/api/{entity.value}/{identifier}"
    return await client.get(ProviderName.OSDR, path, query_items(request))
