from dataclasses import dataclass

from fastapi import Request
from fastapi.responses import JSONResponse


@dataclass
class UpstreamError(Exception):
    provider: str
    message: str
    status_code: int = 502


async def upstream_error_handler(_: Request, exc: UpstreamError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": "upstream_error",
                "provider": exc.provider,
                "message": exc.message,
            }
        },
    )

