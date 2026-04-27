from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.routes import health, ideas, ui
from app.db.base import Base
from app.db.session import engine


def create_app() -> FastAPI:
    app = FastAPI(
        title="CaribAI Product Engine",
        description="Internal product research and planning engine for CaribAI.",
        version="0.1.0",
    )

    Base.metadata.create_all(bind=engine)
    app.mount("/static", StaticFiles(directory="app/static"), name="static")

    app.include_router(health.router)
    app.include_router(ideas.router)
    app.include_router(ui.router)
    return app


app = create_app()
