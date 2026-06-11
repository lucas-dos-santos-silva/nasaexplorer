from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "NASA Explorer API"
    app_env: str = "development"
    app_cors_origins: str = "http://localhost:5173"
    nasa_api_key: str = "DEMO_KEY"
    nasa_request_timeout: float = 20.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [
            item.strip()
            for item in self.app_cors_origins.split(",")
            if item.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
