from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class IdeaCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    niche: str = Field(min_length=2, max_length=255)
    platform: str = Field(min_length=2, max_length=100)
    audience: str = Field(min_length=2, max_length=255)
    problem: str = Field(min_length=10)
    notes: str = ""


class IdeaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    niche: str
    platform: str
    audience: str
    problem: str
    notes: str
    created_at: datetime


class ResearchReportRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    idea_id: int
    summary: str
    demand_signals: str
    competitor_notes: str
    monetization_notes: str
    recommendation: str
    created_at: datetime


class ValidationReportRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    idea_id: int
    pain_score: int
    speed_score: int
    monetization_score: int
    expansion_score: int
    total_score: int
    risks: str
    recommendation: str
    created_at: datetime


class ProductBriefRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    idea_id: int
    product_name: str
    positioning: str
    promise: str
    core_features: str
    pricing_notes: str
    launch_notes: str
    created_at: datetime


class BuildPlanRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    idea_id: int
    stack_recommendation: str
    data_entities: str
    api_endpoints: str
    milestone_plan: str
    next_steps: str
    created_at: datetime


class LaunchAssetsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    idea_id: int
    landing_page_copy: str
    waitlist_copy: str
    launch_post: str
    product_summary: str
    faq: str
    created_at: datetime


class WorkflowSnapshot(BaseModel):
    idea: IdeaRead
    research_report: Optional[ResearchReportRead] = None
    validation_report: Optional[ValidationReportRead] = None
    product_brief: Optional[ProductBriefRead] = None
    build_plan: Optional[BuildPlanRead] = None
    launch_assets: Optional[LaunchAssetsRead] = None
