from pathlib import Path

from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.config import settings
from app.models.idea import Idea
from app.services.product_workflow import ProductWorkflowService

router = APIRouter(tags=["ui"])
templates = Jinja2Templates(directory="app/templates")


def _build_stage_status(selected_idea: Idea | None) -> list[dict]:
    if not selected_idea:
        return []

    return [
        {
            "name": "Signal",
            "complete": bool(selected_idea.research_report) and bool(selected_idea.validation_report),
            "action": "signal",
            "description": "Choose the strongest opportunity based on demand, pain, and speed to market.",
        },
        {
            "name": "Blueprint",
            "complete": bool(selected_idea.product_brief) and bool(selected_idea.build_plan),
            "action": "blueprint",
            "description": "Turn the chosen opportunity into a structured product plan and package map.",
        },
        {
            "name": "Forge",
            "complete": bool(selected_idea.launch_assets),
            "action": "forge",
            "description": "Generate the customer-facing product files, packaging assets, and bundle.",
        },
    ]


def _render_dashboard(request: Request, db: Session, selected_idea: Idea | None) -> HTMLResponse:
    ideas = db.query(Idea).order_by(Idea.created_at.desc()).all()
    asset_links = _build_asset_links(selected_idea)
    labs_status = ProductWorkflowService(db).capabilities()
    return templates.TemplateResponse(
        request,
        "dashboard.html",
        {
            "ideas": ideas,
            "selected_idea": selected_idea,
            "runs": selected_idea.agent_runs if selected_idea else [],
            "stage_status": _build_stage_status(selected_idea),
            "asset_links": asset_links,
            "chat_messages": _build_chat_messages(selected_idea, asset_links),
            "labs_status": labs_status,
        },
    )


def _build_asset_links(selected_idea: Idea | None) -> list[dict]:
    if not selected_idea or not selected_idea.launch_assets:
        return []

    asset_dir = Path(settings.generated_assets_dir) / f"idea_{selected_idea.id}"
    if not asset_dir.exists():
        return []

    files = sorted(path for path in asset_dir.iterdir() if path.is_file())
    priority = {
        "asset_bundle.zip": 0,
        "ai_product_system.md": 1,
        "prompt_pack.md": 2,
        "examples_and_swipes.md": 3,
        "implementation_map.md": 4,
        "marketplace_cover.png": 5,
        "worksheet_preview.png": 6,
        "product_sheet.pdf": 7,
        "landing_page.html": 8,
        "offer_sheet.html": 9,
    }
    files = sorted(files, key=lambda path: (priority.get(path.name, 99), path.name))
    links = []
    for file_path in files:
        links.append(
            {
                "name": file_path.name,
                "url": f"/generated-assets/idea_{selected_idea.id}/{file_path.name}",
            }
        )
    return links


def _extract_note_value(notes: str, key: str) -> str | None:
    if not notes:
        return None
    prefix = f"{key}: "
    for line in notes.splitlines():
        if line.startswith(prefix):
            return line[len(prefix):].strip()
    return None


def _build_chat_messages(selected_idea: Idea | None, asset_links: list[dict]) -> list[dict]:
    if not selected_idea:
        return []

    messages = []
    source_prompt = _extract_note_value(selected_idea.notes, "SOURCE_PROMPT")
    demand_selection = _extract_note_value(selected_idea.notes, "DEMAND_SELECTION")
    product_format = _extract_note_value(selected_idea.notes, "PRODUCT_FORMAT")
    demand_score = _extract_note_value(selected_idea.notes, "DEMAND_SCORE")

    if source_prompt:
        messages.append({"role": "user", "title": "Prompt", "body": source_prompt})

    intro = (
        f"I selected **{selected_idea.title}** for **{selected_idea.audience}** in the **{selected_idea.niche}** niche."
    )
    if demand_selection:
        intro += f"\n\nReason: {demand_selection}"
    if demand_score:
        intro += f"\nDemand score: {demand_score}"
    if product_format:
        intro += f"\nProduct format: {product_format}"
    messages.append({"role": "assistant", "title": "Demand-Aware Selection", "body": intro})

    if selected_idea.research_report:
        messages.append(
            {
                "role": "assistant",
                "title": "Signal",
                "body": (
                    f"Summary: {selected_idea.research_report.summary}\n\n"
                    f"Demand signals: {selected_idea.research_report.demand_signals}\n\n"
                    f"Competition: {selected_idea.research_report.competitor_notes}\n\n"
                    f"Recommendation: {selected_idea.research_report.recommendation}"
                ),
            }
        )

    if selected_idea.validation_report:
        messages.append(
            {
                "role": "assistant",
                "title": "Signal Score",
                "body": (
                    f"Total score: {selected_idea.validation_report.total_score}\n\n"
                    f"Recommendation: {selected_idea.validation_report.recommendation}\n\n"
                    f"Risks: {selected_idea.validation_report.risks}"
                ),
            }
        )

    if selected_idea.launch_assets:
        messages.append(
            {
                "role": "assistant",
                "title": "Forge Output",
                "body": (
                    f"{selected_idea.launch_assets.product_summary}\n\n"
                    "The package now includes customer-facing files such as a workbook, prompt pack, checklist bundle, quick-start guide, bonus resources, and marketplace packaging assets."
                ),
            }
        )

    if asset_links:
        messages.append(
            {
                "role": "assistant",
                "title": "Downloads",
                "body": "Download the generated files below and review them before uploading to a marketplace.",
            }
        )

    return messages


def _snapshot_payload(idea: Idea | None, asset_links: list[dict] | None = None) -> dict:
    if not idea:
        return {}

    asset_links = asset_links or []
    return {
        "idea": {
            "id": idea.id,
            "title": idea.title,
            "niche": idea.niche,
            "platform": idea.platform,
            "audience": idea.audience,
            "problem": idea.problem,
            "notes": idea.notes,
        },
        "signal": {
            "selection_reason": _extract_note_value(idea.notes, "SIGNAL_SELECTION"),
            "total_score": _extract_note_value(idea.notes, "SIGNAL_TOTAL_SCORE"),
            "research": {
                "summary": idea.research_report.summary if idea.research_report else None,
                "demand_signals": idea.research_report.demand_signals if idea.research_report else None,
                "competition": idea.research_report.competitor_notes if idea.research_report else None,
                "recommendation": idea.research_report.recommendation if idea.research_report else None,
            },
            "validation": {
                "total_score": idea.validation_report.total_score if idea.validation_report else None,
                "pain_score": idea.validation_report.pain_score if idea.validation_report else None,
                "speed_score": idea.validation_report.speed_score if idea.validation_report else None,
                "monetization_score": idea.validation_report.monetization_score if idea.validation_report else None,
                "expansion_score": idea.validation_report.expansion_score if idea.validation_report else None,
                "risks": idea.validation_report.risks if idea.validation_report else None,
                "recommendation": idea.validation_report.recommendation if idea.validation_report else None,
            },
        },
        "blueprint": {
            "product_name": idea.product_brief.product_name if idea.product_brief else None,
            "product_type": _extract_note_value(idea.notes, "PRODUCT_TYPE"),
            "positioning": idea.product_brief.positioning if idea.product_brief else None,
            "promise": idea.product_brief.promise if idea.product_brief else None,
            "core_features": idea.product_brief.core_features if idea.product_brief else None,
            "pricing_notes": idea.product_brief.pricing_notes if idea.product_brief else None,
            "launch_notes": idea.product_brief.launch_notes if idea.product_brief else None,
            "format_architecture": idea.build_plan.stack_recommendation if idea.build_plan else None,
            "deliverables": idea.build_plan.data_entities if idea.build_plan else None,
            "module_map": idea.build_plan.api_endpoints if idea.build_plan else None,
            "customer_journey": idea.build_plan.milestone_plan if idea.build_plan else None,
            "release_notes": idea.build_plan.next_steps if idea.build_plan else None,
        },
        "forge": {
            "product_summary": idea.launch_assets.product_summary if idea.launch_assets else None,
            "landing_page_copy": idea.launch_assets.landing_page_copy if idea.launch_assets else None,
            "waitlist_copy": idea.launch_assets.waitlist_copy if idea.launch_assets else None,
            "launch_post": idea.launch_assets.launch_post if idea.launch_assets else None,
            "faq": idea.launch_assets.faq if idea.launch_assets else None,
            "downloads": asset_links,
        },
    }


@router.get("/", response_class=HTMLResponse)
def dashboard(request: Request, db: Session = Depends(get_db)) -> HTMLResponse:
    ideas = db.query(Idea).order_by(Idea.created_at.desc()).all()
    selected_idea = ideas[0] if ideas else None
    return _render_dashboard(request, db, selected_idea)


@router.get("/ideas/{idea_id}/dashboard", response_class=HTMLResponse)
def dashboard_for_idea(idea_id: int, request: Request, db: Session = Depends(get_db)) -> HTMLResponse:
    selected_idea = db.get(Idea, idea_id)
    return _render_dashboard(request, db, selected_idea)


@router.post("/ui/ideas")
def create_idea_from_ui(
    title: str = Form(...),
    niche: str = Form(...),
    platform: str = Form(...),
    audience: str = Form(...),
    problem: str = Form(...),
    notes: str = Form(""),
    db: Session = Depends(get_db),
) -> RedirectResponse:
    idea = Idea(
        title=title,
        niche=niche,
        platform=platform,
        audience=audience,
        problem=problem,
        notes=notes,
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return RedirectResponse(url=f"/ideas/{idea.id}/dashboard", status_code=303)


@router.post("/ui/chat")
def create_idea_from_prompt_ui(
    prompt: str = Form(...),
    db: Session = Depends(get_db),
) -> RedirectResponse:
    service = ProductWorkflowService(db)
    idea = service.create_idea_from_prompt(prompt)
    service.run_signal(idea)
    service.run_blueprint(idea)
    service.run_forge(idea)
    return RedirectResponse(url=f"/ideas/{idea.id}/dashboard", status_code=303)


@router.post("/ui/api/prompt-intake")
def prompt_intake_api(
    prompt: str = Form(...),
    db: Session = Depends(get_db),
) -> JSONResponse:
    service = ProductWorkflowService(db)
    candidates = service.analyze_prompt_candidates(prompt)
    idea = service.create_idea_from_prompt(prompt)
    service.run_signal(idea)
    db.refresh(idea)

    payload = {
        "prompt": prompt,
        "candidates": [
            {
                "title": candidate["title"],
                "niche": candidate["niche"],
                "platform": candidate["platform"],
                "audience": candidate["audience"],
                "product_format": candidate["product_format"],
                "demand_score": candidate["demand_score"],
                "weighted_score": candidate["weighted_score"],
                "selection_reason": candidate["selection_reason"],
                "is_selected": candidate["title"] == idea.title,
            }
            for candidate in candidates
        ],
        "snapshot": _snapshot_payload(idea),
    }
    return JSONResponse(payload)


@router.post("/ui/api/ideas/{idea_id}/blueprint")
def blueprint_api(idea_id: int, db: Session = Depends(get_db)) -> JSONResponse:
    idea = db.get(Idea, idea_id)
    if not idea:
        return JSONResponse({"detail": "Idea not found"}, status_code=404)

    service = ProductWorkflowService(db)
    service.run_blueprint(idea)
    db.refresh(idea)
    return JSONResponse({"snapshot": _snapshot_payload(idea)})


@router.post("/ui/api/ideas/{idea_id}/forge")
def forge_api(idea_id: int, db: Session = Depends(get_db)) -> JSONResponse:
    idea = db.get(Idea, idea_id)
    if not idea:
        return JSONResponse({"detail": "Idea not found"}, status_code=404)

    service = ProductWorkflowService(db)
    service.run_forge(idea)
    db.refresh(idea)
    return JSONResponse({"snapshot": _snapshot_payload(idea, _build_asset_links(idea))})


@router.post("/ui/ideas/{idea_id}/run-all")
def run_workflow_from_ui(idea_id: int, db: Session = Depends(get_db)) -> RedirectResponse:
    idea = db.get(Idea, idea_id)
    if idea:
        service = ProductWorkflowService(db)
        service.run_signal(idea)
        service.run_blueprint(idea)
        service.run_forge(idea)
    return RedirectResponse(url=f"/ideas/{idea_id}/dashboard", status_code=303)


@router.post("/ui/ideas/{idea_id}/run-step/{step_name}")
def run_step_from_ui(idea_id: int, step_name: str, db: Session = Depends(get_db)) -> RedirectResponse:
    idea = db.get(Idea, idea_id)
    if idea:
        service = ProductWorkflowService(db)
        step_handlers = {
            "signal": service.run_signal,
            "blueprint": service.run_blueprint,
            "forge": service.run_forge,
        }
        handler = step_handlers.get(step_name)
        if handler:
            handler(idea)
    return RedirectResponse(url=f"/ideas/{idea_id}/dashboard", status_code=303)
