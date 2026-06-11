from __future__ import annotations

from collections.abc import Iterable
from pathlib import PurePosixPath
from urllib.parse import urljoin, urlparse

import httpx
from fastapi import Response
from starlette.background import BackgroundTask
from starlette.responses import StreamingResponse

from backend.app.core.config import Settings
from backend.app.core.errors import UpstreamError
from backend.app.core.providers import PROVIDERS, ProviderName


class NasaClient:
    def __init__(
        self,
        settings: Settings,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self.settings = settings
        self.client = httpx.AsyncClient(
            timeout=settings.nasa_request_timeout,
            follow_redirects=True,
            transport=transport,
            headers={"User-Agent": "NASA-Explorer/1.0"},
        )

    async def close(self) -> None:
        await self.client.aclose()

    async def get(
        self,
        provider_name: ProviderName,
        path: str,
        query: Iterable[tuple[str, str]] = (),
    ) -> Response:
        provider = PROVIDERS[provider_name]
        safe_path = self._safe_path(path)
        url = f"{provider.base_url.rstrip('/')}/{safe_path}" if safe_path else provider.base_url
        params = [(key, value) for key, value in query if key.lower() != "api_key"]
        if provider.requires_api_key:
            params.append(("api_key", self.settings.nasa_api_key))
        try:
            upstream = await self.client.get(url, params=params)
        except httpx.TimeoutException as exc:
            raise UpstreamError(
                provider_name.value,
                "A NASA excedeu o tempo de resposta.",
                504,
            ) from exc
        except httpx.RequestError as exc:
            raise UpstreamError(
                provider_name.value,
                "Nao foi possivel acessar o servico NASA.",
            ) from exc
        return self._response(provider_name, upstream)

    async def stream_media(self, url: str) -> StreamingResponse:
        parsed = urlparse(url)
        if parsed.scheme != "https" or not self._allowed_media_host(parsed.hostname):
            raise UpstreamError("media", "A origem da midia nao e permitida.", 400)
        try:
            upstream = await self._open_media(url)
        except httpx.TimeoutException as exc:
            raise UpstreamError("media", "A midia excedeu o tempo de resposta.", 504) from exc
        except httpx.RequestError as exc:
            raise UpstreamError("media", "Nao foi possivel carregar a midia.") from exc
        if upstream.status_code >= 400:
            await upstream.aclose()
            raise UpstreamError("media", "A NASA nao retornou a midia solicitada.", 502)
        headers = {}
        for name in ("content-length", "cache-control", "etag", "last-modified"):
            if value := upstream.headers.get(name):
                headers[name] = value
        return StreamingResponse(
            upstream.aiter_bytes(),
            media_type=upstream.headers.get("content-type", "application/octet-stream"),
            headers=headers,
            background=BackgroundTask(upstream.aclose),
        )

    async def _open_media(self, url: str) -> httpx.Response:
        current_url = url
        for _ in range(5):
            request = self.client.build_request("GET", current_url)
            upstream = await self.client.send(
                request,
                stream=True,
                follow_redirects=False,
            )
            if upstream.status_code not in {301, 302, 303, 307, 308}:
                return upstream
            location = upstream.headers.get("location")
            await upstream.aclose()
            if not location:
                raise UpstreamError("media", "A NASA retornou um redirecionamento invalido.")
            current_url = urljoin(current_url, location)
            parsed = urlparse(current_url)
            if parsed.scheme != "https" or not self._allowed_media_host(parsed.hostname):
                raise UpstreamError(
                    "media",
                    "O redirecionamento da midia nao e permitido.",
                    400,
                )
        raise UpstreamError("media", "A midia excedeu o limite de redirecionamentos.")

    def _response(self, provider_name: ProviderName, upstream: httpx.Response) -> Response:
        content_type = upstream.headers.get("content-type", "application/octet-stream")
        if upstream.status_code >= 500:
            raise UpstreamError(provider_name.value, "O servico NASA esta indisponivel.")
        if "application/json" in content_type:
            try:
                upstream.json()
            except ValueError as exc:
                raise UpstreamError(
                    provider_name.value,
                    "O servico NASA retornou uma resposta invalida.",
                ) from exc
        return Response(
            content=upstream.content,
            status_code=upstream.status_code,
            media_type=content_type.split(";")[0],
        )

    @staticmethod
    def _safe_path(path: str) -> str:
        clean = path.strip("/")
        if any(part in {"..", "."} for part in PurePosixPath(clean).parts):
            raise UpstreamError("proxy", "O caminho solicitado nao e permitido.", 400)
        return clean

    @staticmethod
    def _allowed_media_host(hostname: str | None) -> bool:
        if not hostname:
            return False
        return any(
            hostname == suffix or hostname.endswith(f".{suffix}")
            for suffix in ("nasa.gov", "jpl.nasa.gov", "caltech.edu")
        )
