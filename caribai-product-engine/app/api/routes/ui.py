from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.idea import Idea
from app.services.product_workflow import ProductWorkflowService

router = APIRouter(tags=["ui"])
templates = Jinja2Templates(directory="app/templates")


def _build_stage_status(selected_idea: Idea | None) -> list[dict]:
    if not selected_idea:
        return []

    return [
        {"name": "Research", "complete": bool(selected_idea.research_report), "action": "research"},
        {"name": "Validation", "complete": bool(selected_idea.validation_report), "action": "validate"},
        {"name": "Product Brief", "complete": bool(selected_idea.product_brief), "action": "brief"},
        {"name": "Build Plan", "complete": bool(selected_idea.build_plan), "action": "build-plan"},
        {"name": "Assets", "complete": bool(selected_idea.launch_assets), "action": "assets"},
    ]


def _render_dashboard(request: Request, db: Session, selected_idea: Idea | None) -> HTMLResponse:
    ideas = db.query(Idea).order_by(Idea.created_at.desc()).all()
    return templates.TemplateResponse(
        request,
        "dashboard.html",
        {
            "ideas": ideas,
            "selected_idea": selected_idea,
            "runs": selected_idea.agent_runs if selected_idea else [],
            "stage_status": _build_stage_status(selected_idea),
        },
    )


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


@router.post("/ui/ideas/{idea_id}/run-all")
def run_workflow_from_ui(idea_id: int, db: Session = Depends(get_db)) -> RedirectResponse:
    idea = db.get(Idea, idea_id)
    if idea:
        service = ProductWorkflowService(db)
        service.generate_research_report(idea)
        service.generate_validation_report(idea)
        service.generate_product_brief(idea)
        service.generate_build_plan(idea)
        service.generate_launch_assets(idea)
    return RedirectResponse(url=f"/ideas/{idea_id}/dashboard", status_code=303)


@router.post("/ui/ideas/{idea_id}/run-step/{step_name}")
def run_step_from_ui(idea_id: int, step_name: str, db: Session = Depends(get_db)) -> RedirectResponse:
    idea = db.get(Idea, idea_id)
    if idea:
        service = ProductWorkflowService(db)
        step_handlers = {
            "research": service.generate_research_report,
            "validate": service.generate_validation_report,
            "brief": service.generate_product_brief,
            "build-plan": service.generate_build_plan,
            "assets": service.generate_launch_assets,
        }
        handler = step_handlers.get(step_name)
        if handler:
            handler(idea)
    return RedirectResponse(url=f"/ideas/{idea_id}/dashboard", status_code=303)
