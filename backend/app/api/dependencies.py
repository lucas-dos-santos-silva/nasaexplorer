from fastapi import Request

from backend.app.services.nasa_client import NasaClient


def get_nasa_client(request: Request) -> NasaClient:
    return request.app.state.nasa_client


def query_items(request: Request) -> list[tuple[str, str]]:
    return list(request.query_params.multi_items())

