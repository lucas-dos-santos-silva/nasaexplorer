import httpx


def test_apod_uses_backend_api_key(client_factory):
    captured = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["url"] = str(request.url)
        return httpx.Response(200, json={"title": "Earthrise"})

    with client_factory(httpx.MockTransport(handler)) as client:
        response = client.get("/api/v1/apod?thumbs=true&api_key=client-key")

    assert response.status_code == 200
    assert response.json()["title"] == "Earthrise"
    assert captured["url"].startswith("https://api.nasa.gov/planetary/apod?")
    assert "api_key=test-key" in captured["url"]
    assert "client-key" not in captured["url"]
    assert "thumbs=true" in captured["url"]


def test_image_search_uses_library_provider(client_factory):
    captured = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["url"] = str(request.url)
        return httpx.Response(200, json={"collection": {"items": []}})

    with client_factory(httpx.MockTransport(handler)) as client:
        response = client.get("/api/v1/images/search?q=artemis&media_type=image")

    assert response.status_code == 200
    assert captured["url"] == "https://images-api.nasa.gov/search?q=artemis&media_type=image"


def test_epic_latest_uses_images_endpoint(client_factory):
    captured = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["url"] = str(request.url)
        return httpx.Response(200, json=[])

    with client_factory(httpx.MockTransport(handler)) as client:
        response = client.get("/api/v1/epic/natural")

    assert response.status_code == 200
    assert captured["url"] == "https://api.nasa.gov/EPIC/api/natural/images?api_key=test-key"


def test_mars_rover_photos_use_documented_route(client_factory):
    captured = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["url"] = str(request.url)
        return httpx.Response(200, json={"photos": []})

    with client_factory(httpx.MockTransport(handler)) as client:
        response = client.get("/api/v1/mars/rovers/curiosity/photos?sol=1000&page=1")

    assert response.status_code == 200
    assert captured["url"] == (
        "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos"
        "?sol=1000&page=1&api_key=test-key"
    )


def test_earth_imagery_uses_planetary_route(client_factory):
    captured = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["url"] = str(request.url)
        return httpx.Response(200, json={"url": "https://earth.nasa.gov/image.png"})

    with client_factory(httpx.MockTransport(handler)) as client:
        response = client.get("/api/v1/earth/imagery?lon=-47.9&lat=-15.8&dim=0.1")

    assert response.status_code == 200
    assert captured["url"] == (
        "https://api.nasa.gov/planetary/earth/imagery"
        "?lon=-47.9&lat=-15.8&dim=0.1&api_key=test-key"
    )


def test_osdr_mission_uses_geode_endpoint(client_factory):
    captured = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["url"] = str(request.url)
        return httpx.Response(200, json={"mission": "SpaceX-8"})

    with client_factory(httpx.MockTransport(handler)) as client:
        response = client.get("/api/v1/osdr/entities/mission/SpaceX-8")

    assert response.status_code == 200
    assert captured["url"] == "https://osdr.nasa.gov/geode-py/ws/api/mission/SpaceX-8"


def test_tle_uses_documented_external_service(client_factory):
    captured = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["url"] = str(request.url)
        return httpx.Response(200, json={"member": []})

    with client_factory(httpx.MockTransport(handler)) as client:
        response = client.get("/api/v1/tle?search=ISS")

    assert response.status_code == 200
    assert captured["url"] == "https://tle.ivanstanojevic.me/api/tle?search=ISS"


def test_media_rejects_redirect_to_unknown_host(client_factory):
    transport = httpx.MockTransport(
        lambda request: httpx.Response(
            302,
            headers={"location": "https://example.com/image.jpg"},
        )
    )

    with client_factory(transport) as client:
        response = client.get(
            "/api/v1/media",
            params={"url": "https://images-assets.nasa.gov/image.jpg"},
        )

    assert response.status_code == 400
    assert response.json()["error"]["provider"] == "media"


def test_generic_proxy_rejects_unknown_provider(client_factory):
    transport = httpx.MockTransport(lambda request: httpx.Response(200, json={}))

    with client_factory(transport) as client:
        response = client.get("/api/v1/proxy/example/path")

    assert response.status_code == 422
