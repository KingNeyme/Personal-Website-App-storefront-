from pathlib import Path

from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import settings
from app.db.session import engine

router = APIRouter(tags=["health"])


@router.get("/health")
def healthcheck() -> dict:
    db_ok = False
    db_error = None
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        db_ok = True
    except Exception as exc:  # pragma: no cover - defensive runtime check
        db_error = str(exc)

    assets_dir = Path(settings.generated_assets_dir)
    assets_dir.mkdir(parents=True, exist_ok=True)

    return {
        "status": "ok" if db_ok else "degraded",
        "service": "caribai-product-engine",
        "database": {
            "ok": db_ok,
            "url": settings.database_url,
            "error": db_error,
        },
        "generated_assets": {
            "path": str(assets_dir),
            "exists": assets_dir.exists(),
        },
        "models": {
            "text_enabled": bool(settings.openai_api_key),
            "text_model": settings.openai_model,
            "image_model": settings.openai_image_model,
            "timeout_seconds": settings.openai_timeout_seconds,
        },
    }
