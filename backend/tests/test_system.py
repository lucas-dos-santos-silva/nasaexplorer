import httpx


def test_health_and_catalog(client_factory):
    transport = httpx.MockTransport(lambda request: httpx.Response(200, json={}))

    with client_factory(transport) as client:
        health = client.get("/api/v1/health")
        catalog = client.get("/api/v1/catalog")

    assert health.status_code == 200
    assert health.json() == {"status": "ok"}
    assert catalog.status_code == 200
    assert catalog.json()["count"] == 16
    assert catalog.json()["products"][0]["id"] == "apod"


def test_openapi_exposes_main_get_routes(client_factory):
    transport = httpx.MockTransport(lambda request: httpx.Response(200, json={}))

    with client_factory(transport) as client:
        paths = client.get("/openapi.json").json()["paths"]

    expected = {
        "/api/v1/apod",
        "/api/v1/asteroids/feed",
        "/api/v1/asteroids/today",
        "/api/v1/donki/{event}",
        "/api/v1/earth/imagery",
        "/api/v1/eonet/events",
        "/api/v1/epic/{collection}",
        "/api/v1/exoplanets/query",
        "/api/v1/gibs/capabilities",
        "/api/v1/insight",
        "/api/v1/images/search",
        "/api/v1/mars/rovers/{rover}/photos",
        "/api/v1/osdr/search",
        "/api/v1/ssc/observatories",
        "/api/v1/ssc/ground-stations",
        "/api/v1/ssc/locations/{observatories}/{time_range}/{coordinate_systems}",
        "/api/v1/ssd/{service}",
        "/api/v1/techport/projects",
        "/api/v1/techtransfer/{transfer_type}",
        "/api/v1/tle",
        "/api/v1/trek/{body}/capabilities",
    }
    assert expected.issubset(paths)
