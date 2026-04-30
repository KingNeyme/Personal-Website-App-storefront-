from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CaribAI Labs"
    environment: str = "development"
    database_url: str = "sqlite:///./caribai_product_engine.db"
    generated_assets_dir: str = str(Path("generated_assets"))
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    openai_api_key: str | None = None
    openai_model: str = "gpt-5.5"
    openai_image_model: str = "gpt-image-1.5"
    openai_timeout_seconds: float = 25.0

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
