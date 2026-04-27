from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Idea(Base):
    __tablename__ = "ideas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    niche: Mapped[str] = mapped_column(String(255), nullable=False)
    platform: Mapped[str] = mapped_column(String(100), nullable=False)
    audience: Mapped[str] = mapped_column(String(255), nullable=False)
    problem: Mapped[str] = mapped_column(Text, nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    research_report: Mapped["ResearchReport"] = relationship(back_populates="idea", uselist=False, cascade="all, delete-orphan")
    validation_report: Mapped["ValidationReport"] = relationship(back_populates="idea", uselist=False, cascade="all, delete-orphan")
    product_brief: Mapped["ProductBrief"] = relationship(back_populates="idea", uselist=False, cascade="all, delete-orphan")
    build_plan: Mapped["BuildPlan"] = relationship(back_populates="idea", uselist=False, cascade="all, delete-orphan")
    launch_assets: Mapped["LaunchAssets"] = relationship(back_populates="idea", uselist=False, cascade="all, delete-orphan")
    agent_runs: Mapped[list["AgentRun"]] = relationship(back_populates="idea", cascade="all, delete-orphan")


class ResearchReport(Base):
    __tablename__ = "research_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    idea_id: Mapped[int] = mapped_column(ForeignKey("ideas.id"), unique=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    demand_signals: Mapped[str] = mapped_column(Text, nullable=False)
    competitor_notes: Mapped[str] = mapped_column(Text, nullable=False)
    monetization_notes: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    idea: Mapped[Idea] = relationship(back_populates="research_report")


class ValidationReport(Base):
    __tablename__ = "validation_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    idea_id: Mapped[int] = mapped_column(ForeignKey("ideas.id"), unique=True)
    pain_score: Mapped[int] = mapped_column(Integer, nullable=False)
    speed_score: Mapped[int] = mapped_column(Integer, nullable=False)
    monetization_score: Mapped[int] = mapped_column(Integer, nullable=False)
    expansion_score: Mapped[int] = mapped_column(Integer, nullable=False)
    total_score: Mapped[int] = mapped_column(Integer, nullable=False)
    risks: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    idea: Mapped[Idea] = relationship(back_populates="validation_report")


class ProductBrief(Base):
    __tablename__ = "product_briefs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    idea_id: Mapped[int] = mapped_column(ForeignKey("ideas.id"), unique=True)
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    positioning: Mapped[str] = mapped_column(Text, nullable=False)
    promise: Mapped[str] = mapped_column(Text, nullable=False)
    core_features: Mapped[str] = mapped_column(Text, nullable=False)
    pricing_notes: Mapped[str] = mapped_column(Text, nullable=False)
    launch_notes: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    idea: Mapped[Idea] = relationship(back_populates="product_brief")


class BuildPlan(Base):
    __tablename__ = "build_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    idea_id: Mapped[int] = mapped_column(ForeignKey("ideas.id"), unique=True)
    stack_recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    data_entities: Mapped[str] = mapped_column(Text, nullable=False)
    api_endpoints: Mapped[str] = mapped_column(Text, nullable=False)
    milestone_plan: Mapped[str] = mapped_column(Text, nullable=False)
    next_steps: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    idea: Mapped[Idea] = relationship(back_populates="build_plan")


class LaunchAssets(Base):
    __tablename__ = "launch_assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    idea_id: Mapped[int] = mapped_column(ForeignKey("ideas.id"), unique=True)
    landing_page_copy: Mapped[str] = mapped_column(Text, nullable=False)
    waitlist_copy: Mapped[str] = mapped_column(Text, nullable=False)
    launch_post: Mapped[str] = mapped_column(Text, nullable=False)
    product_summary: Mapped[str] = mapped_column(Text, nullable=False)
    faq: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    idea: Mapped[Idea] = relationship(back_populates="launch_assets")


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    idea_id: Mapped[int] = mapped_column(ForeignKey("ideas.id"), nullable=False)
    agent_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    idea: Mapped[Idea] = relationship(back_populates="agent_runs")
