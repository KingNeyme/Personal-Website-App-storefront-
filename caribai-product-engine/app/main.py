from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.routes import health, ideas, ui
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine


def create_app() -> FastAPI:
    app = FastAPI(
        title="CaribAI Labs",
        description="Internal end-to-end AI digital product factory for CaribAI.",
        version="0.1.0",
    )

    Base.metadata.create_all(bind=engine)
    app.mount("/static", StaticFiles(directory="app/static"), name="static")
    Path(settings.generated_assets_dir).mkdir(parents=True, exist_ok=True)
    app.mount("/generated-assets", StaticFiles(directory=settings.generated_assets_dir), name="generated-assets")

    app.include_router(health.router)
    app.include_router(ideas.router)
    app.include_router(ui.router)
    return app


app = create_app()
