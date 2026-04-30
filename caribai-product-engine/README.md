# caribai-product-engine

Private internal V1 for researching, shaping, and generating digital products under CaribAI Labs.

## What this version does

- accepts a prompt like `Create an AI digital product`
- runs `Signal` to choose and justify the strongest opportunity
- runs `Blueprint` to shape the product structure and delivery
- runs `Forge` to generate a customer-facing digital product bundle
- generates premium bundle assets such as a PDF, landing page, listing copy, and marketplace cover images

This version is intentionally practical:

- `FastAPI` backend
- `SQLAlchemy` models
- `SQLite` by default for local development
- OpenAI-backed structured generation when `OPENAI_API_KEY` is set
- reliable fallback generation when model calls are unavailable

## Project structure

```text
caribai-product-engine/
  app/
    api/
    core/
    db/
    models/
    schemas/
    services/
  main.py
  requirements.txt
```

## Quick start

```bash
cd /Users/kingneyme/Desktop/Personal-Website-App-storefront-/caribai-product-engine
cp .env.example .env
./.venv/bin/python -m pip install -r requirements.txt
./.venv/bin/python -m uvicorn main:app --reload
```

Set your key in `.env`:

```env
OPENAI_API_KEY=your_real_openai_api_key
OPENAI_MODEL=gpt-5.5
OPENAI_IMAGE_MODEL=gpt-image-1.5
OPENAI_TIMEOUT_SECONDS=25
```

Open:

- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`
- `http://127.0.0.1:8000/`

## Suggested next steps

1. Add multi-variant cover generation and selection in Forge.
2. Stream real server-side stage progress instead of client-simulated substeps.
3. Move from SQLite to PostgreSQL when the workflow stabilizes.
4. Add auth before exposing beyond local use.
