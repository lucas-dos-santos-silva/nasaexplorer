from enum import Enum
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import Response

from backend.app.api.dependencies import get_nasa_client, query_items
from backend.app.core.providers import ProviderName
from backend.app.services.nasa_client import NasaClient

router = APIRouter(tags=["Biblioteca"])


class MediaType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"


@router.get("/images/search", summary="Pesquisar a biblioteca de imagens e videos")
async def image_search(
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    q: Annotated[Optional[str], Query(min_length=2)] = None,
    media_type: Annotated[Optional[MediaType], Query()] = None,
    year_start: Annotated[Optional[int], Query(ge=1900)] = None,
    year_end: Annotated[Optional[int], Query(ge=1900)] = None,
    page: Annotated[int, Query(ge=1)] = 1,
) -> Response:
    return await client.get(ProviderName.IMAGES, "search", query_items(request))


@router.get("/images/asset/{nasa_id}", summary="Listar arquivos de um item da biblioteca")
async def image_asset(
    nasa_id: str,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(ProviderName.IMAGES, f"asset/{nasa_id}", query_items(request))


@router.get("/images/metadata/{nasa_id}", summary="Consultar metadados de um item")
async def image_metadata(
    nasa_id: str,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(ProviderName.IMAGES, f"metadata/{nasa_id}", query_items(request))


@router.get("/images/captions/{nasa_id}", summary="Consultar legendas de um video")
async def image_captions(
    nasa_id: str,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
) -> Response:
    return await client.get(ProviderName.IMAGES, f"captions/{nasa_id}", query_items(request))


@router.get("/images/album/{album_name}", summary="Consultar um album da biblioteca")
async def image_album(
    album_name: str,
    request: Request,
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    page: Annotated[int, Query(ge=1)] = 1,
) -> Response:
    return await client.get(ProviderName.IMAGES, f"album/{album_name}", query_items(request))


@router.get("/media", summary="Carregar uma midia retornada pelas APIs NASA")
async def media(
    client: Annotated[NasaClient, Depends(get_nasa_client)],
    url: Annotated[str, Query(min_length=12)],
) -> Response:
    return await client.stream_media(url)
