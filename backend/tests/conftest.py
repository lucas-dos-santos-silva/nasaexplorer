import asyncio
from collections.abc import Callable, Iterator

import httpx
import pytest
from fastapi.testclient import TestClient

from backend.app.api.dependencies import get_nasa_client
from backend.app.core.config import Settings
from backend.app.main import app
from backend.app.services.nasa_client import NasaClient


@pytest.fixture
def client_factory() -> Iterator[Callable[[httpx.MockTransport], TestClient]]:
    clients: list[NasaClient] = []

    def build(transport: httpx.MockTransport) -> TestClient:
        nasa_client = NasaClient(
            Settings(nasa_api_key="test-key", nasa_request_timeout=1),
            transport=transport,
        )
        clients.append(nasa_client)
        app.dependency_overrides[get_nasa_client] = lambda: nasa_client
        return TestClient(app)

    yield build

    app.dependency_overrides.clear()
    for nasa_client in clients:
        asyncio.run(nasa_client.close())

