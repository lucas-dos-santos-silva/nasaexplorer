from backend.app.core.config import Settings


def test_cors_origins_accept_comma_separated_values():
    settings = Settings(
        app_cors_origins="http://localhost:5173, https://example.test"
    )

    assert settings.cors_origins == [
        "http://localhost:5173",
        "https://example.test",
    ]

