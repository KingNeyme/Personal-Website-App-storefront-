from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.idea import (
    AgentRun,
    BuildPlan,
    Idea,
    LaunchAssets,
    ProductBrief,
    ResearchReport,
    ValidationReport,
)
from app.schemas.idea import (
    BuildPlanRead,
    IdeaCreate,
    IdeaRead,
    LaunchAssetsRead,
    ProductBriefRead,
    ResearchReportRead,
    ValidationReportRead,
    WorkflowSnapshot,
)
from app.services.product_workflow import ProductWorkflowService

router = APIRouter(prefix="/ideas", tags=["ideas"])


def _get_idea_or_404(db: Session, idea_id: int) -> Idea:
    idea = db.get(Idea, idea_id)
    if not idea:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found")
    return idea


@router.post("", response_model=IdeaRead, status_code=status.HTTP_201_CREATED)
def create_idea(payload: IdeaCreate, db: Session = Depends(get_db)) -> Idea:
    idea = Idea(
        title=payload.title,
        niche=payload.niche,
        platform=payload.platform,
        audience=payload.audience,
        problem=payload.problem,
        notes=payload.notes,
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return idea


@router.get("", response_model=List[IdeaRead])
def list_ideas(db: Session = Depends(get_db)) -> List[Idea]:
    return db.query(Idea).order_by(Idea.created_at.desc()).all()


@router.get("/{idea_id}", response_model=WorkflowSnapshot)
def get_idea_snapshot(idea_id: int, db: Session = Depends(get_db)) -> WorkflowSnapshot:
    idea = _get_idea_or_404(db, idea_id)
    return WorkflowSnapshot(
        idea=idea,
        research_report=idea.research_report,
        validation_report=idea.validation_report,
        product_brief=idea.product_brief,
        build_plan=idea.build_plan,
        launch_assets=idea.launch_assets,
    )


@router.post("/{idea_id}/research", response_model=ResearchReportRead)
def run_research(idea_id: int, db: Session = Depends(get_db)) -> ResearchReport:
    idea = _get_idea_or_404(db, idea_id)
    service = ProductWorkflowService(db)
    return service.generate_research_report(idea)


@router.post("/{idea_id}/validate", response_model=ValidationReportRead)
def run_validation(idea_id: int, db: Session = Depends(get_db)) -> ValidationReport:
    idea = _get_idea_or_404(db, idea_id)
    service = ProductWorkflowService(db)
    return service.generate_validation_report(idea)


@router.post("/{idea_id}/brief", response_model=ProductBriefRead)
def run_brief(idea_id: int, db: Session = Depends(get_db)) -> ProductBrief:
    idea = _get_idea_or_404(db, idea_id)
    service = ProductWorkflowService(db)
    return service.generate_product_brief(idea)


@router.post("/{idea_id}/build-plan", response_model=BuildPlanRead)
def run_build_plan(idea_id: int, db: Session = Depends(get_db)) -> BuildPlan:
    idea = _get_idea_or_404(db, idea_id)
    service = ProductWorkflowService(db)
    return service.generate_build_plan(idea)


@router.post("/{idea_id}/assets", response_model=LaunchAssetsRead)
def run_assets(idea_id: int, db: Session = Depends(get_db)) -> LaunchAssets:
    idea = _get_idea_or_404(db, idea_id)
    service = ProductWorkflowService(db)
    return service.generate_launch_assets(idea)


@router.post("/{idea_id}/run-all", response_model=WorkflowSnapshot)
def run_full_workflow(idea_id: int, db: Session = Depends(get_db)) -> WorkflowSnapshot:
    idea = _get_idea_or_404(db, idea_id)
    service = ProductWorkflowService(db)

    service.run_signal(idea)
    service.run_blueprint(idea)
    service.run_forge(idea)

    db.refresh(idea)
    return WorkflowSnapshot(
        idea=idea,
        research_report=idea.research_report,
        validation_report=idea.validation_report,
        product_brief=idea.product_brief,
        build_plan=idea.build_plan,
        launch_assets=idea.launch_assets,
    )


@router.get("/{idea_id}/runs", response_model=List[dict])
def list_agent_runs(idea_id: int, db: Session = Depends(get_db)) -> List[dict]:
    _get_idea_or_404(db, idea_id)
    runs = (
        db.query(AgentRun)
        .filter(AgentRun.idea_id == idea_id)
        .order_by(AgentRun.created_at.desc())
        .all()
    )
    return [
        {
            "id": run.id,
            "agent_name": run.agent_name,
            "status": run.status,
            "summary": run.summary,
            "created_at": run.created_at,
        }
        for run in runs
    ]
