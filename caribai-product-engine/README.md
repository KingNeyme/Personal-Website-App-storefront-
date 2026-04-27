# caribai-product-engine

Private internal V1 for researching, validating, and planning digital products under CaribAI.

## What this version does

- captures raw product ideas
- generates a structured research report
- scores the idea with a validation report
- turns the idea into a product brief
- creates a first-pass build plan

This version is intentionally simple:

- `FastAPI` backend
- `SQLAlchemy` models
- `SQLite` by default for local development
- rule-based workflow services that are ready to be replaced with LLM-backed implementations later

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
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Open:

- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`

## Suggested next steps

1. Replace rule-based service logic with OpenAI-backed structured outputs.
2. Add async job execution for longer research flows.
3. Move from SQLite to PostgreSQL when the workflow stabilizes.
4. Add auth before exposing beyond local use.
