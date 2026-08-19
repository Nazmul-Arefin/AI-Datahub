from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Weeple AI OS API"
    app_env: str = "development"
    api_prefix: str = "/api/v1"
    debug: bool = True

    cors_origins: str = (
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:11121,http://127.0.0.1:11121,"
        "http://localhost:11046,http://127.0.0.1:11046"
    )
    cors_origin_regex: str = r"https?://(localhost|127\.0\.0\.1)(:\d+)?"

    database_url: str = "postgresql+psycopg://weeple:weeple@localhost:5432/weeple"
    use_database: bool = False
    use_mock_data: bool = True

    jwt_secret: str = "change-me-in-production-use-32b+"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    admin_username: str = "admin"
    admin_password: str = "weeple"
    frontend_url: str = "http://localhost:3000"
    api_public_url: str = "http://127.0.0.1:8000/api/v1"

    nango_url: str = "http://localhost:3003"
    mcp_gateway_url: str = "http://localhost:8080"
    memory_service_url: str = "http://localhost:8081"
    agent_harness_url: str = "http://localhost:8082"
    astrbot_url: str = "http://localhost:8083"
    llm_deepseek_base_url: str = "https://api.deepseek.com"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
