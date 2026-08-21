from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

SidecarMode = Literal["mock", "live"]


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
    # Browser-facing Nango API (Connect UI must not use docker hostname nango:3003).
    nango_public_url: str = "http://localhost:3003"
    mcp_gateway_url: str = "http://localhost:8080"
    memory_service_url: str = "http://localhost:8420"
    agent_harness_url: str = "http://localhost:3080"
    astrbot_url: str = "http://localhost:6185"
    astrbot_public_url: str = "http://localhost:6185"
    llm_deepseek_base_url: str = "https://api.deepseek.com"
    llm_deepseek_model: str = "deepseek-v4-pro"
    deepseek_api_key: str = ""
    nango_secret_key: str = ""
    nango_connect_url: str = "http://localhost:3009"

    telegram_bot_token: str = ""
    astrbot_dashboard_token: str = ""

    # Optional China AstrBot platform credentials (admin configures once).
    feishu_app_id: str = ""
    feishu_app_secret: str = ""
    feishu_domain: str = "https://open.feishu.cn"
    dingtalk_client_id: str = ""
    dingtalk_client_secret: str = ""
    wecom_corpid: str = ""
    wecom_secret: str = ""
    wecom_token: str = ""
    wecom_encoding_aes_key: str = ""
    wecom_ai_token: str = ""
    wecom_ai_encoding_aes_key: str = ""
    qq_appid: str = ""
    qq_secret: str = ""

    harness_mode: SidecarMode = "live"
    astrbot_mode: SidecarMode = "live"
    nango_mode: SidecarMode = "live"
    memory_mode: SidecarMode = "mock"
    mcp_gateway_mode: SidecarMode = "mock"
    sidecar_health_timeout_seconds: float = 3.0

    # Coze image workflow (goal cover art). Token only via env — never commit.
    coze_api_token: str = ""
    coze_workflow_id: str = "7676050213220040713"
    coze_api_base: str = "https://api.coze.cn"
    coze_workflow_input_key: str = "input"
    coze_mode: SidecarMode = "mock"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def coze_enabled(self) -> bool:
        """Live Coze artwork when a token is present and mode is not explicitly mock."""
        if not self.coze_api_token.strip() or not self.coze_workflow_id.strip():
            return False
        return self.coze_mode == "live"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
