from sqlalchemy.orm import Session

from app.models.idea import AgentRun, BuildPlan, Idea, LaunchAssets, ProductBrief, ResearchReport, ValidationReport


class ProductWorkflowService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def generate_research_report(self, idea: Idea) -> ResearchReport:
        pain_keywords = self._pain_keywords(idea.problem)
        positioning_angle = self._positioning_angle(idea)
        summary = (
            f"{idea.title} targets the {idea.niche} niche on {idea.platform} for {idea.audience}. "
            f"The core problem is '{idea.problem}'. Best angle: {positioning_angle}."
        )
        report = self._upsert_research(
            idea,
            summary=summary,
            demand_signals=(
                f"Pain signals to verify: {pain_keywords}. Also validate whether users complain about manual steps, lost time, low output quality, or revenue leakage."
            ),
            competitor_notes=(
                f"Expect generic AI competitors and broad automation tools. Differentiation should come from a niche-specific workflow for {idea.audience} on {idea.platform}."
            ),
            monetization_notes=(
                f"Monetization likely works best if the product saves time, improves output quality, or increases business speed in the {idea.niche} niche."
            ),
            recommendation=(
                "Worth exploring if the workflow stays narrow, demoable, and tied to one obvious before-and-after improvement."
            ),
        )
        self._record_run(idea.id, "market_research", "completed", "Research report generated.")
        return report

    def generate_validation_report(self, idea: Idea) -> ValidationReport:
        lower_problem = idea.problem.lower()
        lower_audience = idea.audience.lower()
        lower_platform = idea.platform.lower()

        pain_score = 9 if any(word in lower_problem for word in ("time", "slow", "manual", "repetitive")) else 7
        speed_score = 8 if idea.platform.lower() in {"shopify", "monday.com"} else 6
        monetization_score = 8 if any(word in lower_audience for word in ("business", "merchant", "team", "store")) else 6
        expansion_score = 8 if lower_platform in {"shopify", "monday.com"} or "small business" in lower_audience else 6
        total_score = pain_score + speed_score + monetization_score + expansion_score

        report = self._upsert_validation(
            idea,
            pain_score=pain_score,
            speed_score=speed_score,
            monetization_score=monetization_score,
            expansion_score=expansion_score,
            total_score=total_score,
            risks=(
                "Risks: building too broadly, copying a generic AI tool, unclear buyer urgency, or stuffing too many features into the MVP."
            ),
            recommendation=(
                self._validation_recommendation(total_score)
            ),
        )
        self._record_run(idea.id, "idea_validation", "completed", "Validation report generated.")
        return report

    def generate_product_brief(self, idea: Idea) -> ProductBrief:
        product_name = self._product_name(idea)
        brief = self._upsert_brief(
            idea,
            product_name=product_name,
            positioning=(
                f"A focused AI product for {idea.audience} in the {idea.niche} niche, positioned around one high-value workflow outcome."
            ),
            promise=(
                f"Help {idea.audience} move faster by removing friction from a recurring {idea.platform}-related workflow."
            ),
            core_features=(
                "1. Focused workflow input\n2. AI-generated output tied to one narrow use case\n3. Save/export result\n4. History or basic project tracking"
            ),
            pricing_notes=(
                "Start with waitlist validation, then test a low-friction starter tier or usage cap before expanding feature depth."
            ),
            launch_notes=(
                "Launch with a tight landing page, founder-led outreach, early-access signups, and content showing the before-and-after result."
            ),
        )
        self._record_run(idea.id, "offer_designer", "completed", "Product brief generated.")
        return brief

    def generate_build_plan(self, idea: Idea) -> BuildPlan:
        plan = self._upsert_build_plan(
            idea,
            stack_recommendation=(
                f"Recommended stack: FastAPI backend, SQLite/PostgreSQL database, simple UI, and Docker. Keep the first build optimized for speed on {idea.platform}."
            ),
            data_entities=(
                "ideas, users, product_runs, outputs, launch_assets, usage_logs, feedback_notes"
            ),
            api_endpoints=(
                "POST /ideas, POST /ideas/{id}/research, POST /ideas/{id}/validate, POST /ideas/{id}/brief, POST /ideas/{id}/build-plan, POST /ideas/{id}/run-all"
            ),
            milestone_plan=(
                "Phase 1: define one narrow workflow. Phase 2: ship the input/output loop. Phase 3: add persistence, testing, and early-user feedback capture."
            ),
            next_steps=(
                "Narrow the MVP to one workflow, define the first real output, connect structured AI generation, and validate the result with one real target user segment."
            ),
        )
        self._record_run(idea.id, "build_planner", "completed", "Build plan generated.")
        return plan

    def generate_launch_assets(self, idea: Idea) -> LaunchAssets:
        product_name = self._product_name(idea)
        target_outcome = self._target_outcome(idea)
        assets = self._upsert_launch_assets(
            idea,
            landing_page_copy=(
                f"{product_name} helps {idea.audience} solve a painful {idea.platform} workflow faster.\n\n"
                f"Built for the {idea.niche} niche, it focuses on {target_outcome} without forcing users through broad, generic AI tooling.\n\n"
                "Join early access to see how the workflow can go from manual friction to a simpler, faster result."
            ),
            waitlist_copy=(
                f"Get early access to {product_name}.\n"
                f"Built for {idea.audience} who need a better way to handle {target_outcome}."
            ),
            launch_post=(
                f"I’m building {product_name}, a focused AI product for {idea.audience} in the {idea.niche} niche.\n"
                f"The goal is simple: make {target_outcome} easier, faster, and more usable without bloated workflows.\n"
                "Early access is open."
            ),
            product_summary=(
                f"{product_name} is a focused AI product designed for {idea.audience}. "
                f"It targets {target_outcome} on {idea.platform} with a narrow workflow and a clearer outcome."
            ),
            faq=(
                f"Who is it for?\n{idea.audience}\n\n"
                f"What does it help with?\nIt helps with {target_outcome}.\n\n"
                "What stage is it in?\nIt is currently in early development and validation.\n\n"
                "Why join early?\nEarly users help shape the first useful version."
            ),
        )
        self._record_run(idea.id, "asset_factory", "completed", "Launch assets generated.")
        return assets

    def _pain_keywords(self, problem: str) -> str:
        lower_problem = problem.lower()
        keywords = []
        for keyword in ("manual work", "time loss", "slow output", "repetitive steps", "poor conversion", "messy workflow"):
            if any(token in lower_problem for token in keyword.split()):
                keywords.append(keyword)
        return ", ".join(keywords) if keywords else "manual workflow, lost time, and low-quality output"

    def _positioning_angle(self, idea: Idea) -> str:
        lower_platform = idea.platform.lower()
        if lower_platform == "shopify":
            return "a merchant-facing speed and conversion tool with a fast demo value"
        if lower_platform == "monday.com":
            return "a workflow simplification tool that turns complexity into clearer execution"
        return "a narrow workflow AI tool with one visible business outcome"

    def _validation_recommendation(self, total_score: int) -> str:
        if total_score >= 31:
            return "Strong candidate. Move to MVP planning and early-access validation quickly."
        if total_score >= 27:
            return "Promising, but refine the use case and buyer before committing too much build time."
        return "Keep researching. The idea likely needs a sharper problem, audience, or distribution angle."

    def _product_name(self, idea: Idea) -> str:
        cleaned_title = idea.title.strip()
        return cleaned_title if cleaned_title.lower().endswith("ai") else f"{cleaned_title} AI"

    def _target_outcome(self, idea: Idea) -> str:
        lower_problem = idea.problem.lower()
        if "description" in lower_problem or "copy" in lower_problem:
            return "creating stronger product copy"
        if "task" in lower_problem or "workflow" in lower_problem:
            return "turning work into clearer execution"
        if "message" in lower_problem or "support" in lower_problem or "reply" in lower_problem:
            return "managing customer communication"
        return "solving a recurring workflow problem"

    def _upsert_research(self, idea: Idea, **values: str) -> ResearchReport:
        report = idea.research_report or ResearchReport(idea_id=idea.id)
        for key, value in values.items():
            setattr(report, key, value)
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def _upsert_validation(self, idea: Idea, **values: object) -> ValidationReport:
        report = idea.validation_report or ValidationReport(idea_id=idea.id)
        for key, value in values.items():
            setattr(report, key, value)
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def _upsert_brief(self, idea: Idea, **values: str) -> ProductBrief:
        brief = idea.product_brief or ProductBrief(idea_id=idea.id)
        for key, value in values.items():
            setattr(brief, key, value)
        self.db.add(brief)
        self.db.commit()
        self.db.refresh(brief)
        return brief

    def _upsert_build_plan(self, idea: Idea, **values: str) -> BuildPlan:
        plan = idea.build_plan or BuildPlan(idea_id=idea.id)
        for key, value in values.items():
            setattr(plan, key, value)
        self.db.add(plan)
        self.db.commit()
        self.db.refresh(plan)
        return plan

    def _upsert_launch_assets(self, idea: Idea, **values: str) -> LaunchAssets:
        assets = idea.launch_assets or LaunchAssets(idea_id=idea.id)
        for key, value in values.items():
            setattr(assets, key, value)
        self.db.add(assets)
        self.db.commit()
        self.db.refresh(assets)
        return assets

    def _record_run(self, idea_id: int, agent_name: str, status: str, summary: str) -> None:
        run = AgentRun(
            idea_id=idea_id,
            agent_name=agent_name,
            status=status,
            summary=summary,
        )
        self.db.add(run)
        self.db.commit()
