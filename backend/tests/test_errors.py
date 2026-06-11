import httpx


def test_invalid_json_is_normalized(client_factory):
    transport = httpx.MockTransport(
        lambda request: httpx.Response(
            200,
            content=b"not-json",
            headers={"content-type": "application/json"},
        )
    )

    with client_factory(transport) as client:
        response = client.get("/api/v1/apod")

    assert response.status_code == 502
    assert response.json()["error"]["code"] == "upstream_error"
    assert response.json()["error"]["provider"] == "nasa"


def test_timeout_is_normalized(client_factory):
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ReadTimeout("timeout", request=request)

    with client_factory(httpx.MockTransport(handler)) as client:
        response = client.get("/api/v1/eonet/events")

    assert response.status_code == 504
    assert response.json()["error"]["provider"] == "eonet"


def test_upstream_client_error_is_preserved(client_factory):
    transport = httpx.MockTransport(
        lambda request: httpx.Response(400, json={"error": "invalid date"})
    )

    with client_factory(transport) as client:
        response = client.get("/api/v1/asteroids/feed?start_date=2026-01-01")

    assert response.status_code == 400
    assert response.json() == {"error": "invalid date"}
