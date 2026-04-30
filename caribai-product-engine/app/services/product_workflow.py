import json
import base64
from io import BytesIO
from pathlib import Path
from typing import Any
from zipfile import ZIP_DEFLATED, ZipFile

from pydantic import BaseModel, Field
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.idea import AgentRun, BuildPlan, Idea, LaunchAssets, ProductBrief, ResearchReport, ValidationReport

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover - optional dependency in local setup
    OpenAI = None


class SignalCandidate(BaseModel):
    title: str
    niche: str
    platform: str
    audience: str
    problem: str
    product_archetype: str
    product_format: str
    demand_score: int = Field(ge=1, le=10)
    pain_score: int = Field(ge=1, le=10)
    speed_score: int = Field(ge=1, le=10)
    buyer_urgency_score: int = Field(ge=1, le=10)
    weighted_score: int = Field(ge=1, le=100)
    selection_reason: str
    keywords: list[str]


class SignalAnalysis(BaseModel):
    market_summary: str
    selection_summary: str
    selected_title: str
    candidates: list[SignalCandidate]


class SignalExecution(BaseModel):
    summary: str
    product_archetype: str
    transformation_promise: str
    demand_signals: list[str]
    competitor_notes: list[str]
    monetization_notes: list[str]
    recommendation: str
    pain_score: int = Field(ge=1, le=10)
    speed_score: int = Field(ge=1, le=10)
    monetization_score: int = Field(ge=1, le=10)
    expansion_score: int = Field(ge=1, le=10)
    total_score: int = Field(ge=4, le=40)
    risks: list[str]
    selection_reason: str


class BlueprintExecution(BaseModel):
    product_name: str
    product_archetype: str
    product_type: str
    positioning: str
    promise: str
    customer_problem: str
    transformation: str
    core_features: list[str]
    signature_assets: list[str]
    pricing_notes: str
    launch_notes: str
    format_architecture: str
    deliverables: list[str]
    module_map: list[str]
    customer_journey: list[str]
    release_notes: str


class WorkbookSection(BaseModel):
    title: str
    purpose: str
    prompts: list[str]
    example: str


class PromptAsset(BaseModel):
    title: str
    prompt: str
    outcome: str
    example_input: str
    example_result: str


class ChecklistGroup(BaseModel):
    title: str
    items: list[str]


class ForgeExecution(BaseModel):
    product_name: str
    product_archetype: str
    product_type: str
    tagline: str
    hero_promise: str
    customer_result: str
    bundle_value: str
    product_summary: str
    landing_page_copy: str
    waitlist_copy: str
    launch_post: str
    faq: list[dict[str, str]]
    workbook_sections: list[WorkbookSection]
    prompt_pack: list[PromptAsset]
    checklist_groups: list[ChecklistGroup]
    quick_start_steps: list[str]
    use_cases: list[str]
    bonus_resources: list[str]
    pricing_recommendation: str
    marketplace_title: str
    marketplace_description: str
    marketplace_bullets: list[str]
    marketplace_tags: list[str]
    design_direction: str


class ProductWorkflowService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.client = self._build_openai_client()

    def analyze_prompt_candidates(self, prompt: str) -> list[dict[str, Any]]:
        analysis = self._generate_signal_analysis_from_prompt(prompt)
        selected_title = analysis.selected_title
        candidates = [candidate.model_dump() for candidate in analysis.candidates]
        candidates.sort(key=lambda item: item["weighted_score"], reverse=True)

        for candidate in candidates:
            candidate["is_selected"] = candidate["title"] == selected_title

        if not any(candidate["is_selected"] for candidate in candidates) and candidates:
            candidates[0]["is_selected"] = True

        return candidates

    def run_signal(self, idea: Idea) -> None:
        signal = self._generate_signal_execution(idea)
        self._upsert_research(
            idea,
            summary=signal.summary,
            demand_signals=self._join_lines(signal.demand_signals),
            competitor_notes=self._join_lines(signal.competitor_notes),
            monetization_notes=self._join_lines(signal.monetization_notes),
            recommendation=signal.recommendation,
        )
        self._upsert_validation(
            idea,
            pain_score=signal.pain_score,
            speed_score=signal.speed_score,
            monetization_score=signal.monetization_score,
            expansion_score=signal.expansion_score,
            total_score=signal.total_score,
            risks=self._join_lines(signal.risks),
            recommendation=signal.recommendation,
        )
        self._append_notes(
            idea,
            {
                "SIGNAL_SELECTION": signal.selection_reason,
                "SIGNAL_TOTAL_SCORE": str(signal.total_score),
                "PRODUCT_ARCHETYPE": signal.product_archetype,
                "TRANSFORMATION_PROMISE": signal.transformation_promise,
            },
        )
        self._record_run(idea.id, "signal", "completed", "Signal selected and scored the strongest digital product direction.")

    def run_blueprint(self, idea: Idea) -> None:
        blueprint = self._generate_blueprint_execution(idea)
        self._upsert_brief(
            idea,
            product_name=blueprint.product_name,
            positioning=blueprint.positioning,
            promise=blueprint.promise,
            core_features=self._join_lines(blueprint.core_features),
            pricing_notes=blueprint.pricing_notes,
            launch_notes=blueprint.launch_notes,
        )
        self._upsert_build_plan(
            idea,
            stack_recommendation=blueprint.format_architecture,
            data_entities=self._join_lines(blueprint.deliverables),
            api_endpoints=self._join_lines(blueprint.module_map),
            milestone_plan=self._join_lines(blueprint.customer_journey),
            next_steps=blueprint.release_notes,
        )
        self._append_notes(
            idea,
            {
                "PRODUCT_TYPE": blueprint.product_type,
                "BLUEPRINT_NAME": blueprint.product_name,
                "PRODUCT_ARCHETYPE": blueprint.product_archetype,
                "CUSTOMER_PROBLEM": blueprint.customer_problem,
                "TRANSFORMATION_PROMISE": blueprint.transformation,
            },
        )
        self._record_run(idea.id, "blueprint", "completed", "Blueprint shaped the digital product structure and packaging plan.")

    def run_forge(self, idea: Idea) -> None:
        forge = self._generate_forge_execution(idea)
        faq_text = "\n\n".join(f"Q: {item['question']}\nA: {item['answer']}" for item in forge.faq)
        assets = self._upsert_launch_assets(
            idea,
            landing_page_copy=forge.landing_page_copy,
            waitlist_copy=forge.waitlist_copy,
            launch_post=forge.launch_post,
            product_summary=forge.product_summary,
            faq=faq_text,
        )
        self._write_asset_bundle(idea, assets, forge)
        self._append_notes(
            idea,
            {
                "FORGE_PRODUCT_NAME": forge.product_name,
                "FORGE_DESIGN_DIRECTION": forge.design_direction,
            },
        )
        self._record_run(idea.id, "forge", "completed", "Forge created the customer-facing digital product bundle and download package.")

    def create_idea_from_prompt(self, prompt: str) -> Idea:
        candidates = self.analyze_prompt_candidates(prompt)
        selected = next((candidate for candidate in candidates if candidate["is_selected"]), candidates[0])
        notes = (
            f"SOURCE_PROMPT: {prompt}\n"
            f"DEMAND_SELECTION: {selected['selection_reason']}\n"
            f"PRODUCT_ARCHETYPE: {selected['product_archetype']}\n"
            f"PRODUCT_FORMAT: {selected['product_format']}\n"
            f"DEMAND_SCORE: {selected['demand_score']}/10\n"
            f"WEIGHTED_SCORE: {selected['weighted_score']}/100\n"
        )
        idea = Idea(
            title=selected["title"],
            niche=selected["niche"],
            platform=selected["platform"],
            audience=selected["audience"],
            problem=selected["problem"],
            notes=notes,
        )
        self.db.add(idea)
        self.db.commit()
        self.db.refresh(idea)
        self._record_run(idea.id, "prompt_intake", "completed", "Prompt converted into a demand-aware product direction.")
        return idea

    def generate_research_report(self, idea: Idea) -> ResearchReport:
        signal = self._generate_signal_execution(idea)
        report = self._upsert_research(
            idea,
            summary=signal.summary,
            demand_signals=self._join_lines(signal.demand_signals),
            competitor_notes=self._join_lines(signal.competitor_notes),
            monetization_notes=self._join_lines(signal.monetization_notes),
            recommendation=signal.recommendation,
        )
        self._record_run(idea.id, "market_research", "completed", "Research report generated.")
        return report

    def generate_validation_report(self, idea: Idea) -> ValidationReport:
        signal = self._generate_signal_execution(idea)
        report = self._upsert_validation(
            idea,
            pain_score=signal.pain_score,
            speed_score=signal.speed_score,
            monetization_score=signal.monetization_score,
            expansion_score=signal.expansion_score,
            total_score=signal.total_score,
            risks=self._join_lines(signal.risks),
            recommendation=signal.recommendation,
        )
        self._record_run(idea.id, "idea_validation", "completed", "Validation report generated.")
        return report

    def generate_product_brief(self, idea: Idea) -> ProductBrief:
        blueprint = self._generate_blueprint_execution(idea)
        brief = self._upsert_brief(
            idea,
            product_name=blueprint.product_name,
            positioning=blueprint.positioning,
            promise=blueprint.promise,
            core_features=self._join_lines(blueprint.core_features),
            pricing_notes=blueprint.pricing_notes,
            launch_notes=blueprint.launch_notes,
        )
        self._record_run(idea.id, "offer_designer", "completed", "Product brief generated.")
        return brief

    def generate_build_plan(self, idea: Idea) -> BuildPlan:
        blueprint = self._generate_blueprint_execution(idea)
        plan = self._upsert_build_plan(
            idea,
            stack_recommendation=blueprint.format_architecture,
            data_entities=self._join_lines(blueprint.deliverables),
            api_endpoints=self._join_lines(blueprint.module_map),
            milestone_plan=self._join_lines(blueprint.customer_journey),
            next_steps=blueprint.release_notes,
        )
        self._record_run(idea.id, "build_planner", "completed", "Build plan generated.")
        return plan

    def generate_launch_assets(self, idea: Idea) -> LaunchAssets:
        forge = self._generate_forge_execution(idea)
        faq_text = "\n\n".join(f"Q: {item['question']}\nA: {item['answer']}" for item in forge.faq)
        assets = self._upsert_launch_assets(
            idea,
            landing_page_copy=forge.landing_page_copy,
            waitlist_copy=forge.waitlist_copy,
            launch_post=forge.launch_post,
            product_summary=forge.product_summary,
            faq=faq_text,
        )
        self._write_asset_bundle(idea, assets, forge)
        self._record_run(idea.id, "asset_factory", "completed", "Launch assets generated.")
        return assets

    def _build_openai_client(self) -> Any | None:
        if not settings.openai_api_key or OpenAI is None:
            return None
        return OpenAI(api_key=settings.openai_api_key, timeout=settings.openai_timeout_seconds)

    def _model_enabled(self) -> bool:
        return self.client is not None

    def capabilities(self) -> dict[str, Any]:
        return {
            "text_model_enabled": self._model_enabled(),
            "image_model_enabled": self._model_enabled(),
            "text_model": settings.openai_model,
            "image_model": settings.openai_image_model,
            "timeout_seconds": settings.openai_timeout_seconds,
        }

    def _structured_model_call(
        self,
        schema_model: type[BaseModel],
        *,
        schema_name: str,
        system_prompt: str,
        user_prompt: str,
        max_output_tokens: int = 6000,
    ) -> BaseModel | None:
        if not self._model_enabled():
            return None

        try:
            response = self.client.responses.create(
                model=settings.openai_model,
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_output_tokens=max_output_tokens,
                text={
                    "format": {
                        "type": "json_schema",
                        "name": schema_name,
                        "schema": schema_model.model_json_schema(),
                        "strict": True,
                    }
                },
            )
            output_text = getattr(response, "output_text", None)
            if not output_text:
                return None
            return schema_model.model_validate_json(output_text)
        except Exception:
            return None

    def _generate_image_bytes(self, prompt: str, *, size: str = "1536x1024") -> bytes | None:
        if not self._model_enabled():
            return None

        try:
            response = self.client.responses.create(
                model=settings.openai_model,
                input=prompt,
                tools=[
                    {
                        "type": "image_generation",
                        "model": settings.openai_image_model,
                        "size": size,
                        "quality": "high",
                    }
                ],
                max_output_tokens=1200,
            )
            for output in getattr(response, "output", []):
                if getattr(output, "type", None) == "image_generation_call":
                    result = getattr(output, "result", None)
                    if result:
                        return base64.b64decode(result)
            return None
        except Exception:
            return None

    def _generate_signal_analysis_from_prompt(self, prompt: str) -> SignalAnalysis:
        analysis = self._structured_model_call(
            SignalAnalysis,
            schema_name="caribai_signal_analysis",
            system_prompt=(
                "You are the Signal stage of CaribAI Labs, a private AI digital product factory. "
                "Your job is to weigh multiple Gumroad-friendly AI digital product opportunities and choose the strongest one. "
                "Optimize for real demand, painful urgency, fast packaging, and digital-product fit. "
                "Do not suggest software SaaS builds. "
                "Choose from strong archetypes such as Prompt System, Generator Toolkit, Template Pack, Swipe File Kit, or Operational Playbook. "
                "Favor products that directly help the buyer get a result, not generic education bundles."
            ),
            user_prompt=(
                f"Founder prompt: {prompt}\n\n"
                "Return 4-5 candidate digital products, each with a title, niche, platform, audience, problem, product format, "
                "product archetype, scores, clear reasoning, and keywords. Select the single best opportunity."
            ),
            max_output_tokens=4000,
        )
        if isinstance(analysis, SignalAnalysis):
            return self._normalize_signal_analysis(analysis)
        return self._fallback_signal_analysis(prompt)

    def _generate_signal_execution(self, idea: Idea) -> SignalExecution:
        source_prompt = self._extract_note_value(idea.notes, "SOURCE_PROMPT") or idea.title
        signal = self._structured_model_call(
            SignalExecution,
            schema_name="caribai_signal_execution",
            system_prompt=(
                "You are the Signal stage inside CaribAI Labs. "
                "Given a chosen digital product opportunity, produce structured market reasoning that justifies why it is worth packaging for sale. "
                "Focus on digital product demand, pain, monetization, speed to market, and why the chosen archetype matches the pain."
            ),
            user_prompt=(
                f"Original prompt: {source_prompt}\n"
                f"Chosen title: {idea.title}\n"
                f"Niche: {idea.niche}\n"
                f"Platform: {idea.platform}\n"
                f"Audience: {idea.audience}\n"
                f"Problem: {idea.problem}\n\n"
                "Provide concise but specific market reasoning, numeric scores, the product archetype, and the transformation promise."
            ),
            max_output_tokens=3000,
        )
        if isinstance(signal, SignalExecution):
            return self._normalize_signal_execution(signal)
        return self._fallback_signal_execution(idea)

    def _generate_blueprint_execution(self, idea: Idea) -> BlueprintExecution:
        signal_summary = idea.research_report.summary if idea.research_report else self._fallback_signal_execution(idea).summary
        blueprint = self._structured_model_call(
            BlueprintExecution,
            schema_name="caribai_blueprint_execution",
            system_prompt=(
                "You are the Blueprint stage in CaribAI Labs. "
                "Turn a chosen digital product opportunity into a polished, sellable package plan for a marketplace like Gumroad. "
                "Do not describe a SaaS build. Describe the product archetype, product structure, included deliverables, transformation, signature assets, pricing direction, and packaging map."
            ),
            user_prompt=(
                f"Title: {idea.title}\n"
                f"Niche: {idea.niche}\n"
                f"Audience: {idea.audience}\n"
                f"Problem: {idea.problem}\n"
                f"Signal summary: {signal_summary}\n\n"
                "Produce a structured product blueprint for a customer-facing AI digital product."
            ),
            max_output_tokens=3500,
        )
        if isinstance(blueprint, BlueprintExecution):
            return blueprint
        return self._fallback_blueprint_execution(idea)

    def _generate_forge_execution(self, idea: Idea) -> ForgeExecution:
        blueprint = self._generate_blueprint_execution(idea)
        signal_summary = idea.research_report.summary if idea.research_report else self._fallback_signal_execution(idea).summary
        forge = self._structured_model_call(
            ForgeExecution,
            schema_name="caribai_forge_execution",
            system_prompt=(
                "You are the Forge stage in CaribAI Labs. "
                "Create the actual customer-facing AI digital product contents and packaging assets for immediate marketplace upload. "
                "The result must feel premium, practical, complete, and niche-specific. "
                "Create something a buyer would feel comfortable paying roughly $49 to $79 for. "
                "Avoid generic filler. Include concrete examples, realistic use cases, stronger prompt packs, and practical worksheet material. "
                "The product must directly help the buyer solve the pain point. "
                "Generate specific workbook sections, prompt pack entries, checklist groups, quick-start steps, use cases, FAQ, marketplace copy, pricing direction, and design direction."
            ),
            user_prompt=(
                f"Title: {idea.title}\n"
                f"Niche: {idea.niche}\n"
                f"Audience: {idea.audience}\n"
                f"Problem: {idea.problem}\n"
                f"Signal summary: {signal_summary}\n"
                f"Blueprint product name: {blueprint.product_name}\n"
                f"Blueprint product type: {blueprint.product_type}\n"
                f"Deliverables: {', '.join(blueprint.deliverables)}\n"
                f"Promise: {blueprint.promise}\n\n"
                "Create a complete digital product package that can be sold as downloadable files. "
                "Make the product specific enough that it clearly belongs to this niche and audience."
            ),
            max_output_tokens=7000,
        )
        if isinstance(forge, ForgeExecution):
            return forge
        return self._fallback_forge_execution(idea, blueprint)

    def _normalize_signal_analysis(self, analysis: SignalAnalysis) -> SignalAnalysis:
        candidates = sorted(analysis.candidates, key=lambda candidate: candidate.weighted_score, reverse=True)
        selected_titles = {candidate.title for candidate in candidates}
        selected_title = analysis.selected_title if analysis.selected_title in selected_titles else candidates[0].title
        return SignalAnalysis(
            market_summary=analysis.market_summary,
            selection_summary=analysis.selection_summary,
            selected_title=selected_title,
            candidates=candidates,
        )

    def _normalize_signal_execution(self, signal: SignalExecution) -> SignalExecution:
        total = signal.pain_score + signal.speed_score + signal.monetization_score + signal.expansion_score
        return SignalExecution(
            summary=signal.summary,
            product_archetype=signal.product_archetype,
            transformation_promise=signal.transformation_promise,
            demand_signals=signal.demand_signals,
            competitor_notes=signal.competitor_notes,
            monetization_notes=signal.monetization_notes,
            recommendation=signal.recommendation,
            pain_score=signal.pain_score,
            speed_score=signal.speed_score,
            monetization_score=signal.monetization_score,
            expansion_score=signal.expansion_score,
            total_score=min(total, 40),
            risks=signal.risks,
            selection_reason=signal.selection_reason,
        )

    def _fallback_signal_analysis(self, prompt: str) -> SignalAnalysis:
        lower_prompt = prompt.lower()
        catalog = [
            {
                "title": "Shopify Conversion Copy Command Center",
                "niche": "ecommerce",
                "platform": "gumroad",
                "audience": "small Shopify merchants",
                "problem": "Merchants need faster, higher-converting product pages without paying copywriters for every listing.",
                "product_archetype": "Prompt System",
                "product_format": "prompt pack + workbook + optimization checklist",
                "demand_score": 9,
                "pain_score": 9,
                "speed_score": 9,
                "buyer_urgency_score": 8,
                "selection_reason": "Shopify merchants already pay for conversion improvements and respond well to tools that shorten listing time.",
                "keywords": ["shopify", "merchant", "store", "ecommerce", "conversion", "product description"],
            },
            {
                "title": "AI Career Pivot Command Pack",
                "niche": "career growth",
                "platform": "gumroad",
                "audience": "IT professionals pivoting into cybersecurity or AI roles",
                "problem": "Career changers need practical prompts, frameworks, and worksheets to reposition themselves quickly and confidently.",
                "product_archetype": "Operational Playbook",
                "product_format": "workbook + prompt pack + transition checklist",
                "demand_score": 8,
                "pain_score": 8,
                "speed_score": 8,
                "buyer_urgency_score": 9,
                "selection_reason": "Career pain is urgent and buyers spend money on products that improve outcomes quickly.",
                "keywords": ["career", "job", "resume", "transition", "cybersecurity", "interview"],
            },
            {
                "title": "Creator Repurposing Revenue Kit",
                "niche": "creator economy",
                "platform": "gumroad",
                "audience": "creators and personal brands",
                "problem": "Creators need repeatable systems for turning one idea into multiple monetizable content assets.",
                "product_archetype": "Generator Toolkit",
                "product_format": "prompt pack + planning workbook + repurposing checklist",
                "demand_score": 8,
                "pain_score": 7,
                "speed_score": 8,
                "buyer_urgency_score": 7,
                "selection_reason": "Creators buy packaging systems when they save time and help produce more content.",
                "keywords": ["creator", "content", "repurpose", "posts", "personal brand"],
            },
            {
                "title": "Client Reply Accelerator",
                "niche": "small business operations",
                "platform": "gumroad",
                "audience": "online businesses handling DMs and support",
                "problem": "Owners lose sales and trust because replies are slow, inconsistent, and mentally draining to produce.",
                "product_archetype": "Swipe File Kit",
                "product_format": "reply prompt pack + template bundle + quick-start guide",
                "demand_score": 7,
                "pain_score": 8,
                "speed_score": 9,
                "buyer_urgency_score": 7,
                "selection_reason": "Customer messaging is constant, repetitive, and naturally suited to prompts and templates.",
                "keywords": ["support", "reply", "dm", "email", "customer", "follow-up"],
            },
        ]

        candidates: list[SignalCandidate] = []
        for item in catalog:
            keyword_matches = sum(1 for keyword in item["keywords"] if keyword in lower_prompt)
            weighted_score = min(
                100,
                item["demand_score"] * 4
                + item["pain_score"] * 3
                + item["speed_score"] * 2
                + item["buyer_urgency_score"] * 1
                + keyword_matches * 8,
            )
            candidates.append(
                SignalCandidate(
                    weighted_score=weighted_score,
                    **item,
                )
            )

        candidates.sort(key=lambda candidate: candidate.weighted_score, reverse=True)
        selected = candidates[0]
        return SignalAnalysis(
            market_summary="Signal reviewed a short list of digital product opportunities optimized for demand, pain, and packaging speed.",
            selection_summary=selected.selection_reason,
            selected_title=selected.title,
            candidates=candidates,
        )

    def _fallback_signal_execution(self, idea: Idea) -> SignalExecution:
        lower_problem = idea.problem.lower()
        lower_audience = idea.audience.lower()

        pain_score = 9 if any(word in lower_problem for word in ("time", "manual", "slow", "waste")) else 8
        speed_score = 9 if any(word in lower_problem for word in ("prompt", "template", "checklist", "guide")) else 8
        monetization_score = 9 if any(word in lower_audience for word in ("merchant", "business", "creator", "professional")) else 7
        expansion_score = 8 if idea.niche.lower() in {"ecommerce", "creator economy", "career growth"} else 7
        total_score = pain_score + speed_score + monetization_score + expansion_score

        return SignalExecution(
            summary=(
                f"{idea.title} sits in the {idea.niche} niche for {idea.audience}. "
                "It targets an immediate and visible pain point that fits a downloadable AI digital product."
            ),
            product_archetype=self._selected_archetype(idea),
            transformation_promise=self._transformation_promise(idea),
            demand_signals=[
                "Buyers already look for shortcuts that reduce time, confusion, or inconsistent results.",
                "The problem is repeated enough to justify a reusable prompt pack and workbook bundle.",
                "The audience can see the value before purchase because the outcome is concrete and immediate.",
            ],
            competitor_notes=[
                "Generic AI bundles exist, but most are too broad and not packaged around one painful workflow.",
                "Differentiation comes from tighter positioning, sharper worksheets, and a clearer before-and-after result.",
            ],
            monetization_notes=[
                "A bundle with prompts, worksheets, and quick-start assets is easy to price in the impulse-buy range.",
                "The offer can expand into follow-on packs, upsells, or niche variants once one format proves itself.",
            ],
            recommendation="Strong candidate for a focused digital product package. Keep the promise narrow and the assets immediately useful.",
            pain_score=pain_score,
            speed_score=speed_score,
            monetization_score=monetization_score,
            expansion_score=expansion_score,
            total_score=total_score,
            risks=[
                "The bundle could feel generic if the examples are not niche-specific.",
                "Overpacking too many assets can lower perceived clarity and increase cleanup work.",
                "Weak design polish can make a strong concept feel less premium on a marketplace page.",
            ],
            selection_reason=self._extract_note_value(idea.notes, "DEMAND_SELECTION")
            or "It balances demand, pain, and fast digital packaging better than the alternatives.",
        )

    def _fallback_blueprint_execution(self, idea: Idea) -> BlueprintExecution:
        product_name = self._product_name(idea)
        product_archetype = self._selected_archetype(idea)
        product_type = self._extract_note_value(idea.notes, "PRODUCT_FORMAT") or "AI prompt pack + workbook + checklist bundle"
        signature_assets = self._signature_assets_for_archetype(product_archetype)
        return BlueprintExecution(
            product_name=product_name,
            product_archetype=product_archetype,
            product_type=product_type,
            positioning=(
                f"A premium but practical AI digital product for {idea.audience} that removes friction from {idea.problem.lower()}."
            ),
            promise=(
                f"Help {idea.audience} go from confusion and wasted effort to a cleaner, faster workflow they can execute immediately."
            ),
            customer_problem=idea.problem,
            transformation=self._transformation_promise(idea),
            core_features=[
                f"A {product_archetype.lower()} built around one repeated pain point",
                "Ready-to-use prompts tailored to the niche and audience",
                "Filled examples that show what strong outputs should look like",
                "Quick-start material that helps the buyer get value on day one",
            ],
            signature_assets=signature_assets,
            pricing_notes="Price the first version as a premium mini-bundle with a clear transformation and instant-use promise.",
            launch_notes="Lead with the pain point, show the bundle contents clearly, and make the preview feel polished and specific.",
            format_architecture=(
                f"{product_archetype} + workbook + examples and swipes + implementation map + quick-start guide + marketplace assets"
            ),
            deliverables=signature_assets
            + [
                "Customer workbook PDF/markdown",
                "Marketplace listing copy and promo banner",
            ],
            module_map=[
                "Opening promise and who-this-is-for page",
                "Current-state audit section",
                "Core prompt or template execution section with examples",
                "Quality-control and packaging checklist",
                "Quick-start and bonus implementation pages",
            ],
            customer_journey=[
                "Buyer recognizes a repeated pain point",
                "Buyer downloads the bundle and starts with the workbook",
                "Buyer uses the prompts to generate better outputs faster",
                "Buyer checks quality using the bundled checklists",
                "Buyer repeats the workflow as a reusable system",
            ],
            release_notes="Review the final wording, proof the examples, then upload the polished bundle and listing assets to Gumroad.",
        )

    def _fallback_forge_execution(self, idea: Idea, blueprint: BlueprintExecution) -> ForgeExecution:
        outcome = self._target_outcome(idea)
        lower_niche = idea.niche.lower()

        if "ecommerce" in lower_niche or "shopify" in idea.audience.lower():
            return self._fallback_shopify_forge_execution(idea, blueprint)
        if "career" in lower_niche:
            return self._fallback_career_forge_execution(idea, blueprint)
        if "creator" in lower_niche:
            return self._fallback_creator_forge_execution(idea, blueprint)

        return ForgeExecution(
            product_name=blueprint.product_name,
            product_archetype=blueprint.product_archetype,
            product_type=blueprint.product_type,
            tagline=f"Practical AI systems for {idea.audience}",
            hero_promise=f"Go from manual effort to a cleaner workflow for {outcome}.",
            customer_result=f"The buyer leaves with a repeatable workflow they can run weekly without starting from scratch.",
            bundle_value="A premium mini-system that combines prompts, worksheets, and execution checklists into one repeatable workflow.",
            product_summary=(
                f"{blueprint.product_name} is a complete AI digital product bundle for {idea.audience}. "
                f"It helps buyers with {outcome} through guided exercises, prompts, and practical packaging assets."
            ),
            landing_page_copy=(
                f"{blueprint.product_name} gives {idea.audience} a faster, clearer way to handle {outcome}.\n\n"
                "Inside the bundle, buyers get a guided workbook, a niche-specific prompt pack, checklists, and a quick-start guide that makes implementation feel immediate instead of overwhelming.\n\n"
                "The result is a premium digital product that feels practical, actionable, and easy to apply."
            ),
            waitlist_copy=(
                f"Join the list for {blueprint.product_name}, a premium AI digital product for {idea.audience} who want a faster path to {outcome}."
            ),
            launch_post=(
                f"I just forged {blueprint.product_name}, a premium AI digital product bundle for {idea.audience}. "
                f"It is built to help them with {outcome} using prompts, worksheets, checklists, and a practical system they can apply immediately."
            ),
            faq=[
                {"question": "Who is this for?", "answer": idea.audience},
                {"question": "What problem does it solve?", "answer": idea.problem},
                {
                    "question": "What is included?",
                    "answer": "A workbook, prompt pack, checklist bundle, quick-start guide, bonus resource sheet, and marketplace-ready support assets.",
                },
                {
                    "question": "How quickly can I use it?",
                    "answer": "The quick-start guide is designed to help buyers get a first useful outcome on the same day.",
                },
            ],
            workbook_sections=[
                WorkbookSection(
                    title="Current State Audit",
                    purpose="Diagnose where the workflow breaks down and where time is being lost.",
                    prompts=[
                        "What part of this process currently feels manual or frustrating?",
                        "What result do you wish you could produce faster or better?",
                        "What happens when this problem stays unsolved for another month?",
                    ],
                    example="Example: a buyer identifies that their current workflow requires too much manual rewriting and inconsistent review.",
                ),
                WorkbookSection(
                    title="Outcome Mapping",
                    purpose="Translate the pain point into a concrete transformation the buyer wants.",
                    prompts=[
                        "What would a strong before-and-after change look like?",
                        "Which output would create the biggest immediate win?",
                        "What would make this workflow feel simpler and more repeatable?",
                    ],
                    example="Example: define a specific improvement like faster copy creation, less editing time, or more consistency.",
                ),
                WorkbookSection(
                    title="Execution Worksheet",
                    purpose="Help the buyer run the prompts and refine the result into something usable.",
                    prompts=[
                        "What input are you starting with?",
                        "Which prompt produced the strongest result and why?",
                        "What will you standardize for the next run?",
                    ],
                    example="Example: compare two prompt outputs and highlight what made one more immediately usable.",
                ),
            ],
            prompt_pack=[
                PromptAsset(
                    title="Starter Prompt",
                    prompt=f"Act as a specialist helping {idea.audience} with {outcome}. Generate a strong first draft from this input: [INSERT INPUT].",
                    outcome="Produce a fast, useful first version.",
                    example_input="Short brief or raw source material",
                    example_result="A structured first draft that reduces blank-page friction and gives the buyer something usable to refine.",
                ),
                PromptAsset(
                    title="Refinement Prompt",
                    prompt=f"Improve the output so it is clearer, more persuasive, and more immediately useful for {idea.audience}.",
                    outcome="Raise quality without restarting from scratch.",
                    example_input="A weak or generic draft",
                    example_result="A sharper output with better structure, stronger clarity, and more specific usefulness.",
                ),
                PromptAsset(
                    title="Quality Control Prompt",
                    prompt="Audit the output for gaps, weak spots, and unclear steps. Then rewrite the weakest section.",
                    outcome="Create a polished final result.",
                    example_input="A nearly finished draft",
                    example_result="A final pass that strengthens the weakest points before the buyer uses or publishes it.",
                ),
            ],
            checklist_groups=[
                ChecklistGroup(
                    title="Preparation Checklist",
                    items=[
                        "Define the exact task or output you want to improve.",
                        "Gather the source material before running the prompts.",
                        "Decide how the finished output should feel to the buyer.",
                    ],
                ),
                ChecklistGroup(
                    title="Quality Checklist",
                    items=[
                        "Is the output clear and useful on first read?",
                        "Does it solve the pain point directly?",
                        "Does it feel polished enough to use or sell?",
                    ],
                ),
            ],
            quick_start_steps=[
                "Read the short promise page to understand the intended transformation.",
                "Open the workbook and complete the audit in one sitting.",
                "Run the starter prompt and refine the result using the prompt pack.",
                "Use the quality checklist before publishing or sending anything.",
            ],
            use_cases=[
                "Use it to speed up a repeated workflow that normally causes friction.",
                "Use it to turn weak first drafts into something buyer-ready faster.",
                "Use it to build a repeatable personal system instead of reinventing the process each time.",
            ],
            bonus_resources=[
                "A reflection sheet for identifying your most reusable workflow pattern",
                "A simple implementation tracker for the next 7 days",
                "A bonus packaging checklist for polishing the buyer-facing result",
            ],
            pricing_recommendation="$49 starter premium bundle, with room for a later Pro pack or niche-specific expansion.",
            marketplace_title=blueprint.product_name,
            marketplace_description=(
                f"A premium AI digital product bundle for {idea.audience} who want a cleaner, faster path to {outcome}."
            ),
            marketplace_bullets=[
                "Prompt pack built around one painful workflow",
                "Guided workbook with practical exercises",
                "Quality-control and packaging checklists",
                "Quick-start guide for immediate implementation",
            ],
            marketplace_tags=["ai prompts", "digital product", "workflow", idea.niche, idea.platform],
            design_direction="Deep navy background, electric blue highlights, warm gold accents, editorial typography, and premium worksheet styling.",
        )

    def _fallback_shopify_forge_execution(self, idea: Idea, blueprint: BlueprintExecution) -> ForgeExecution:
        return ForgeExecution(
            product_name=blueprint.product_name,
            product_archetype=blueprint.product_archetype,
            product_type="Shopify prompt pack + conversion workbook + product page checklist system",
            tagline="Conversion-focused AI copy tools for Shopify merchants",
            hero_promise="Go from thin, generic listings to stronger product pages that sound more persuasive and easier to buy from.",
            customer_result="The buyer leaves with a repeatable product-page copy workflow, stronger prompt templates, and better merchandising structure for new listings.",
            bundle_value="A merchant-facing micro-system for writing product descriptions, bullets, SEO copy, and conversion angles faster.",
            product_summary=(
                f"{blueprint.product_name} is a practical Shopify conversion copy system for small merchants who need stronger product pages without relying on expensive copy help."
            ),
            landing_page_copy=(
                f"{blueprint.product_name} helps Shopify merchants create sharper product descriptions, benefit bullets, SEO snippets, and conversion-focused messaging without staring at a blank page.\n\n"
                "Inside the bundle, buyers get a merchant-specific workbook, a deeper prompt pack, product-page checklists, and example frameworks for turning raw product information into cleaner copy.\n\n"
                "This is not generic AI advice. It is a practical listing workflow designed for merchants who need better outputs fast."
            ),
            waitlist_copy=(
                f"Get access to {blueprint.product_name}, a conversion-focused AI copy bundle for Shopify merchants who want stronger listings in less time."
            ),
            launch_post=(
                f"{blueprint.product_name} is a Shopify copy system built for merchants who need stronger product pages, better benefit framing, and less time wasted rewriting listings."
            ),
            faq=[
                {"question": "Who is this for?", "answer": "Small Shopify merchants, solo founders, and ecommerce teams writing their own product pages."},
                {"question": "What problem does it solve?", "answer": "It helps merchants stop publishing weak, generic product pages that take too long to write and do too little to persuade."},
                {"question": "What is included?", "answer": "A conversion workbook, 8 merchant prompts, product-page checklists, quick-start guide, bonus examples, and marketplace packaging assets."},
                {"question": "What can I create with it?", "answer": "Descriptions, benefit bullets, angle variations, SEO snippets, urgency framing, and cleaner product-page structure."},
            ],
            workbook_sections=[
                WorkbookSection(
                    title="Product Clarity Audit",
                    purpose="Identify why the current listing feels generic or hard to buy from.",
                    prompts=[
                        "What does this product actually help the customer do faster, better, or more confidently?",
                        "Which three product details matter most to a buyer?",
                        "What is missing from the current listing that would improve trust or clarity?",
                    ],
                    example="Example: instead of listing '100% cotton', translate it into a buyer-facing benefit like breathability, comfort, or softness for daily wear.",
                ),
                WorkbookSection(
                    title="Offer Angle Worksheet",
                    purpose="Choose the strongest angle before writing copy.",
                    prompts=[
                        "Is this product best sold on convenience, luxury, simplicity, savings, transformation, or trust?",
                        "What objection is most likely to stop the buyer from purchasing?",
                        "What emotional payoff should the copy reinforce?",
                    ],
                    example="Example: a skincare item may perform better when framed around routine simplicity and confidence, not ingredient overload.",
                ),
                WorkbookSection(
                    title="Description Builder",
                    purpose="Turn raw product details into a stronger narrative flow.",
                    prompts=[
                        "What should the opening line immediately communicate?",
                        "Which feature-to-benefit translations belong in the middle section?",
                        "What final line should create confidence or urgency?",
                    ],
                    example="Example: opening with a clean outcome statement often performs better than opening with specs.",
                ),
                WorkbookSection(
                    title="Bullet Point Upgrade Sheet",
                    purpose="Improve weak bullets into concise benefit-driven bullets.",
                    prompts=[
                        "Which features need stronger benefit language?",
                        "Which bullet feels too technical or too vague?",
                        "How can each bullet sound more buyer-centered?",
                    ],
                    example="Example: 'water-resistant exterior' becomes 'keeps your essentials protected on busy, unpredictable days.'",
                ),
                WorkbookSection(
                    title="Final Conversion Review",
                    purpose="Check the page before publishing.",
                    prompts=[
                        "Does the page feel scannable on mobile?",
                        "Does the buyer understand the outcome quickly?",
                        "What would make this listing feel easier to trust?",
                    ],
                    example="Example: a short trust-building sentence near the end can strengthen uncertain product pages.",
                ),
            ],
            prompt_pack=[
                PromptAsset(
                    title="Product Description Architect",
                    prompt="Act as a high-converting Shopify copywriter. Using the product title, key features, and customer audience below, write a persuasive product description with a strong hook, benefit-driven middle, and confident close. Input: [TITLE] [FEATURES] [AUDIENCE].",
                    outcome="Create a full product description structure.",
                    example_input="Minimal product notes for a candle, skincare item, or apparel product.",
                    example_result="A cleaner, more persuasive description with stronger flow and buyer-facing benefits.",
                ),
                PromptAsset(
                    title="Feature-to-Benefit Translator",
                    prompt="Turn the following product features into buyer-centered benefit bullets for a Shopify product page. Keep them concise, vivid, and useful. Input: [FEATURE LIST].",
                    outcome="Upgrade flat feature lists.",
                    example_input="100% cotton, machine washable, relaxed fit.",
                    example_result="Three bullets that explain comfort, ease, and everyday usability instead of raw specs.",
                ),
                PromptAsset(
                    title="Angle Finder",
                    prompt="Review this product and suggest 5 different conversion angles for the listing, such as convenience, luxury, problem-solving, simplicity, or gifting. Input: [PRODUCT NOTES].",
                    outcome="Find stronger merchandising angles.",
                    example_input="A home organization product or beauty item.",
                    example_result="Multiple angles that help the merchant test a stronger positioning direction.",
                ),
                PromptAsset(
                    title="SEO Snippet Builder",
                    prompt="Create an SEO title under 60 characters and a meta description under 155 characters for this Shopify product page. Input: [PRODUCT TITLE] [CORE BENEFITS].",
                    outcome="Create supporting search copy.",
                    example_input="Product title and two core benefits.",
                    example_result="Cleaner metadata that still sounds useful to a human reader.",
                ),
                PromptAsset(
                    title="Objection Handler",
                    prompt="List the top 5 likely customer objections for this product, then write a short sentence that addresses each one naturally within product-page copy. Input: [PRODUCT DETAILS].",
                    outcome="Reduce buyer hesitation.",
                    example_input="Price concerns, quality doubts, sizing questions, shipping concerns.",
                    example_result="Trust-building lines that can be woven into the listing.",
                ),
                PromptAsset(
                    title="Luxury Rewrite",
                    prompt="Rewrite this product copy in a premium, elevated tone that still sounds clear and believable. Input: [CURRENT COPY].",
                    outcome="Create a higher-end tone option.",
                    example_input="A plain draft description.",
                    example_result="A more polished version suited to a premium brand style.",
                ),
                PromptAsset(
                    title="Minimalist Rewrite",
                    prompt="Rewrite this product page copy in a minimalist, clean, conversion-aware tone. Input: [CURRENT COPY].",
                    outcome="Create a stripped-back tone option.",
                    example_input="A long or overly busy description.",
                    example_result="A cleaner version that feels sharper and easier to scan.",
                ),
                PromptAsset(
                    title="Cross-Sell Suggestion Prompt",
                    prompt="Suggest 3 natural cross-sell ideas for this product and write one sentence for each that can appear on the product page. Input: [PRODUCT DETAILS].",
                    outcome="Add related revenue opportunities.",
                    example_input="A candle, notebook, skincare set, or tote bag.",
                    example_result="Relevant add-on copy that feels natural rather than forced.",
                ),
            ],
            checklist_groups=[
                ChecklistGroup(
                    title="Before You Write",
                    items=[
                        "Clarify the buyer type and primary use case.",
                        "Choose the strongest merchandising angle before drafting.",
                        "Translate features into benefits before opening the AI prompts.",
                    ],
                ),
                ChecklistGroup(
                    title="Description Quality Checklist",
                    items=[
                        "The opening line communicates the main outcome quickly.",
                        "Benefits are more visible than raw specs.",
                        "The copy sounds specific instead of generic.",
                        "The product page feels easy to skim on mobile.",
                    ],
                ),
                ChecklistGroup(
                    title="Trust and Conversion Checklist",
                    items=[
                        "Likely objections are handled somewhere on the page.",
                        "The tone matches the brand position.",
                        "The listing feels believable, polished, and buyer-centered.",
                    ],
                ),
            ],
            quick_start_steps=[
                "Choose one real product listing that currently feels weak or unfinished.",
                "Work through the Product Clarity Audit to identify the real buyer value.",
                "Use the Angle Finder and Product Description Architect prompts first.",
                "Refine the result with the Feature-to-Benefit Translator and Objection Handler.",
                "Run the final page through the Description Quality and Trust checklists before publishing.",
            ],
            use_cases=[
                "Launching a new product when you only have raw notes and features.",
                "Refreshing older listings that feel generic or low-converting.",
                "Creating multiple tone variants to match different brand styles.",
                "Building quicker product-page workflows for a growing catalog.",
            ],
            bonus_resources=[
                "A sample product-page structure guide for faster copy assembly",
                "A list of 12 ecommerce power words that still sound believable",
                "A mini buyer-objection cheat sheet for product listings",
                "A simple A/B copy testing tracker for future iterations",
            ],
            pricing_recommendation="$59 premium niche bundle, with an upsell path for seasonal prompts or industry-specific versions.",
            marketplace_title=blueprint.product_name,
            marketplace_description="A Shopify-focused AI copy system for merchants who want sharper product descriptions, stronger benefit bullets, and faster listing workflows.",
            marketplace_bullets=[
                "8 niche-specific Shopify copy prompts",
                "Merchant workbook with product-page exercises",
                "Conversion and trust checklists",
                "SEO, objections, and cross-sell support prompts",
                "Quick-start workflow for real listings",
            ],
            marketplace_tags=["shopify", "ecommerce", "product descriptions", "conversion copy", "ai prompts"],
            design_direction="Premium ecommerce editorial look with deep navy, sharp electric blue accents, warm gold details, and polished worksheet styling.",
        )

    def _fallback_career_forge_execution(self, idea: Idea, blueprint: BlueprintExecution) -> ForgeExecution:
        outcome = "transitioning into a stronger target role faster"
        return ForgeExecution(
            product_name=blueprint.product_name,
            product_archetype=blueprint.product_archetype,
            product_type="career transition workbook + resume prompts + interview checklist system",
            tagline="AI-guided career transition tools for role changers",
            hero_promise="Go from scattered career effort to a clearer, more confident transition plan.",
            customer_result="The buyer leaves with stronger positioning, clearer application materials, and a repeatable job-search support workflow.",
            bundle_value="A guided transition toolkit that helps the buyer reposition themselves instead of consuming generic career advice.",
            product_summary=f"{blueprint.product_name} gives career changers a more structured path to repositioning themselves and producing stronger materials.",
            landing_page_copy=f"{blueprint.product_name} helps career changers create clearer resumes, stronger positioning, better interview prep, and a more focused transition plan.\n\nIt is built for buyers who need structure, confidence, and practical AI-supported assets instead of vague motivation.",
            waitlist_copy=f"Get access to {blueprint.product_name}, a premium AI transition toolkit for career changers.",
            launch_post=f"{blueprint.product_name} is a practical transition toolkit for buyers who need stronger positioning, resume help, and clearer next steps.",
            faq=[
                {"question": "Who is this for?", "answer": idea.audience},
                {"question": "What problem does it solve?", "answer": idea.problem},
                {"question": "What is included?", "answer": "A transition workbook, resume prompts, interview prep prompts, checklists, and a quick-start guide."},
                {"question": "What result should I expect?", "answer": "A clearer positioning story, stronger materials, and a more organized transition process."},
            ],
            workbook_sections=[
                WorkbookSection(title="Career Story Audit", purpose="Clarify the strongest narrative for the transition.", prompts=["What skills transfer best?", "What role are you really targeting?", "What proof points make the shift believable?"], example="Example: turning scattered experience into one focused transition story."),
                WorkbookSection(title="Resume Positioning", purpose="Translate experience into buyer-ready positioning.", prompts=["Which wins should lead the resume?", "What language should be cut?", "What sounds more role-relevant?"], example="Example: replacing broad IT descriptions with more targeted role relevance."),
                WorkbookSection(title="Interview Readiness", purpose="Prepare stronger, clearer answers.", prompts=["What story explains your pivot best?", "What objection might an interviewer raise?", "How can you answer with confidence?"], example="Example: building a concise answer to 'Why this transition now?'"),
            ],
            prompt_pack=[
                PromptAsset(title="Resume Reposition Prompt", prompt="Rewrite this resume for a target role transition while preserving honesty and emphasizing transferability. Input: [RESUME] [TARGET ROLE].", outcome="Stronger targeting.", example_input="Current resume plus target role.", example_result="Cleaner role-aligned bullet points."),
                PromptAsset(title="Cover Letter Strategy Prompt", prompt="Write a focused cover letter that explains the transition convincingly without sounding defensive. Input: [BACKGROUND] [TARGET ROLE].", outcome="Clearer narrative.", example_input="Career background and target role.", example_result="A sharper, more confident transition letter."),
                PromptAsset(title="Interview Objection Prompt", prompt="List the top interviewer doubts for this transition and draft strong responses for each. Input: [BACKGROUND] [TARGET ROLE].", outcome="Better interview prep.", example_input="Candidate details.", example_result="Better handling of common doubts."),
                PromptAsset(title="30-Day Plan Prompt", prompt="Create a realistic 30-day transition plan with skill, application, and networking steps. Input: [CURRENT STAGE].", outcome="Better execution structure.", example_input="Current readiness level.", example_result="A clearer month-long action plan."),
            ],
            checklist_groups=[
                ChecklistGroup(title="Positioning Checklist", items=["The target role is clearly defined.", "The transition story sounds believable.", "The most relevant proof points are easy to find."]),
                ChecklistGroup(title="Materials Checklist", items=["Resume bullets reflect the target role.", "The summary sounds specific.", "Language is not too broad or generic."]),
            ],
            quick_start_steps=["Complete the Career Story Audit.", "Run the Resume Reposition Prompt.", "Use the Interview Objection Prompt.", "Follow the first 7 days of the action plan."],
            use_cases=["Resume rewrites", "Target-role positioning", "Interview preparation", "Creating a practical transition plan"],
            bonus_resources=["Transition progress tracker", "Networking outreach starter prompts", "A confidence review worksheet"],
            pricing_recommendation="$49 to $69 depending on depth and role specificity.",
            marketplace_title=blueprint.product_name,
            marketplace_description="A practical AI-supported transition toolkit for buyers who want stronger materials and clearer next steps.",
            marketplace_bullets=["Transition workbook", "Resume and cover-letter prompts", "Interview prep prompts", "Action-plan support"],
            marketplace_tags=["career", "job search", "resume", "ai prompts", "transition"],
            design_direction="Professional editorial document style with deep navy, clean white layouts, electric blue markers, and warm gold callouts.",
        )

    def _fallback_creator_forge_execution(self, idea: Idea, blueprint: BlueprintExecution) -> ForgeExecution:
        return ForgeExecution(
            product_name=blueprint.product_name,
            product_archetype=blueprint.product_archetype,
            product_type="content repurposing system + planning workbook + creator prompt pack",
            tagline="AI-assisted content systems for creators and personal brands",
            hero_promise="Go from one raw idea to a repeatable stream of better content outputs.",
            customer_result="The buyer leaves with a repeatable repurposing workflow and less friction around turning ideas into multiple content assets.",
            bundle_value="A creator-facing repurposing workflow with prompts, planning pages, and content system support.",
            product_summary=f"{blueprint.product_name} helps creators turn one idea into multiple practical content outputs with less waste and more structure.",
            landing_page_copy=f"{blueprint.product_name} gives creators a cleaner repurposing workflow for turning one idea into posts, hooks, outlines, and follow-up assets.\n\nIt is designed for buyers who need practical structure, not another vague content guide.",
            waitlist_copy=f"Get access to {blueprint.product_name}, a premium AI repurposing workflow for creators.",
            launch_post=f"{blueprint.product_name} helps creators and personal brands turn one core idea into multiple usable content outputs faster.",
            faq=[
                {"question": "Who is this for?", "answer": idea.audience},
                {"question": "What does it help with?", "answer": idea.problem},
                {"question": "What is included?", "answer": "A creator workbook, repurposing prompts, checklists, a quick-start guide, and bonus planning resources."},
                {"question": "What can I create with it?", "answer": "Hooks, post ideas, breakdowns, repurposed formats, and a more repeatable content process."},
            ],
            workbook_sections=[
                WorkbookSection(title="Idea Extraction", purpose="Pull stronger content angles out of one raw idea.", prompts=["What is the real point of this idea?", "Which audience pain does it connect to?", "Which sub-angles could become standalone posts?"], example="Example: turning one short insight into education, opinion, story, and CTA angles."),
                WorkbookSection(title="Format Mapping", purpose="Choose the best outputs for the same idea.", prompts=["Which formats fit this idea best?", "What belongs in short-form versus long-form?", "What should become a hook versus a deeper breakdown?"], example="Example: one idea becomes a thread, carousel outline, short video hook, and email angle."),
                WorkbookSection(title="Publishing Rhythm", purpose="Turn ideas into a repeatable publishing workflow.", prompts=["What can be created in one batch?", "Which assets can be recycled next week?", "What should be saved as a future series?"], example="Example: building a weekly content system from one recording or one written note."),
            ],
            prompt_pack=[
                PromptAsset(title="Angle Expansion Prompt", prompt="Take this raw idea and generate 10 specific content angles for creators, each with a clear audience pain. Input: [IDEA].", outcome="More usable angles.", example_input="A short content idea.", example_result="Multiple high-signal content angles instead of one flat topic."),
                PromptAsset(title="Hook Generator Prompt", prompt="Generate 15 hooks for this idea in different styles: curiosity, authority, pain, direct, and story-driven. Input: [IDEA].", outcome="Stronger openings.", example_input="One idea or lesson.", example_result="A bank of stronger hooks."),
                PromptAsset(title="Repurposing Prompt", prompt="Turn this idea into 6 output formats: thread, carousel, caption, short video outline, email angle, and CTA prompt. Input: [IDEA].", outcome="Faster repurposing.", example_input="A single insight.", example_result="A fuller set of content outputs."),
                PromptAsset(title="Editorial Planner Prompt", prompt="Create a 7-day mini content plan based on this core topic and audience. Input: [TOPIC] [AUDIENCE].", outcome="Better planning.", example_input="One topic plus audience.", example_result="A simple short-term content plan."),
            ],
            checklist_groups=[
                ChecklistGroup(title="Angle Quality Checklist", items=["The idea is clear.", "Each angle connects to a real audience pain.", "The output formats feel different enough to matter."]),
                ChecklistGroup(title="Publishing Checklist", items=["Hooks are strong enough to lead.", "Each output has a clear purpose.", "The set feels reusable, not one-off."]),
            ],
            quick_start_steps=["Start with one raw idea.", "Run the Angle Expansion Prompt.", "Choose 3 formats using Format Mapping.", "Use the Publishing Checklist before scheduling anything."],
            use_cases=["Repurposing a podcast clip", "Expanding a tweet into multiple formats", "Turning a weekly lesson into a content batch", "Building a more repeatable personal-brand workflow"],
            bonus_resources=["A 7-day content planning worksheet", "A reusable content batch tracker", "A hook-scoring mini cheat sheet"],
            pricing_recommendation="$49 creator workflow bundle, with upsells for niche platform packs later.",
            marketplace_title=blueprint.product_name,
            marketplace_description="A practical AI repurposing system for creators who want to get more outputs from each idea.",
            marketplace_bullets=["Creator workbook", "Repurposing prompt pack", "Hook and planning support", "Quick-start workflow"],
            marketplace_tags=["creator", "content", "repurposing", "ai prompts", "personal brand"],
            design_direction="Modern creator-editorial style with deep navy, vivid blue accents, warm gold notes, and clean layout blocks.",
        )

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

    def _write_asset_bundle(self, idea: Idea, assets: LaunchAssets, package: ForgeExecution) -> None:
        asset_dir = Path(settings.generated_assets_dir) / f"idea_{idea.id}"
        asset_dir.mkdir(parents=True, exist_ok=True)

        landing_page_html = self._landing_page_html(idea, package)
        offer_sheet_html = self._offer_sheet_html(idea, package)
        promo_svg = self._promo_svg(package)
        cover_png_bytes = self._cover_png_bytes(idea, package)
        worksheet_png_bytes = self._worksheet_preview_png_bytes(idea, package)
        pdf_bytes = self._pdf_bytes(idea, package)
        workbook_markdown = self._workbook_markdown(package)
        prompt_pack_markdown = self._prompt_pack_markdown(package)
        checklist_markdown = self._checklist_markdown(package)
        quick_start_markdown = self._quick_start_markdown(package)
        bonus_resource_markdown = self._bonus_resource_markdown(idea, package)
        system_overview_markdown = self._system_overview_markdown(idea, package)
        examples_markdown = self._examples_and_swipes_markdown(package)
        implementation_map_markdown = self._implementation_map_markdown(package)

        manifest = {
            "idea_id": idea.id,
            "product_name": package.product_name,
            "product_type": package.product_type,
            "design_direction": package.design_direction,
            "files": [
                "ai_product_system.md",
                "prompt_pack.md",
                "examples_and_swipes.md",
                "implementation_map.md",
                "customer_workbook.md",
                "quick_start_guide.md",
                "checklist_bundle.md",
                "bonus_resource_sheet.md",
                "product_sheet.pdf",
                "marketplace_listing.md",
                "landing_page.html",
                "offer_sheet.html",
                "waitlist_email.txt",
                "launch_post.txt",
                "faq.md",
                "product_summary.json",
                "promo_banner.svg",
                "marketplace_cover.png",
                "worksheet_preview.png",
                "forge_package.json",
            ],
        }

        file_map = {
            "ai_product_system.md": system_overview_markdown,
            "prompt_pack.md": prompt_pack_markdown,
            "examples_and_swipes.md": examples_markdown,
            "implementation_map.md": implementation_map_markdown,
            "customer_workbook.md": workbook_markdown,
            "quick_start_guide.md": quick_start_markdown,
            "checklist_bundle.md": checklist_markdown,
            "bonus_resource_sheet.md": bonus_resource_markdown,
            "landing_page.html": landing_page_html,
            "offer_sheet.html": offer_sheet_html,
            "marketplace_listing.md": self._marketplace_listing(idea, package),
            "waitlist_email.txt": assets.waitlist_copy,
            "launch_post.txt": assets.launch_post,
            "faq.md": assets.faq,
            "product_summary.json": json.dumps(
                {
                    "product_name": package.product_name,
                    "product_archetype": package.product_archetype,
                    "product_type": package.product_type,
                    "summary": assets.product_summary,
                    "platform": idea.platform,
                    "niche": idea.niche,
                    "audience": idea.audience,
                },
                indent=2,
            ),
            "promo_banner.svg": promo_svg,
            "manifest.json": json.dumps(manifest, indent=2),
            "forge_package.json": package.model_dump_json(indent=2),
        }

        for filename, content in file_map.items():
            (asset_dir / filename).write_text(content, encoding="utf-8")

        (asset_dir / "product_sheet.pdf").write_bytes(pdf_bytes)
        (asset_dir / "marketplace_cover.png").write_bytes(cover_png_bytes)
        (asset_dir / "worksheet_preview.png").write_bytes(worksheet_png_bytes)

        bundle_path = asset_dir / "asset_bundle.zip"
        with ZipFile(bundle_path, "w", compression=ZIP_DEFLATED) as bundle:
            for file_path in sorted(asset_dir.iterdir()):
                if file_path.name == "asset_bundle.zip":
                    continue
                bundle.write(file_path, arcname=file_path.name)

    def _landing_page_html(self, idea: Idea, package: ForgeExecution) -> str:
        benefit_cards = "\n".join(
            f"<article class=\"card\"><h3>{title}</h3><p>{body}</p></article>"
            for title, body in [
                ("Built For", idea.audience),
                ("Solves", idea.problem),
                ("Outcome", package.hero_promise),
            ]
        )
        bullet_list = "".join(f"<li>{bullet}</li>" for bullet in package.marketplace_bullets)
        return f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{package.product_name}</title>
    <style>
      :root {{
        --bg: #07111b;
        --panel: rgba(14, 23, 34, 0.92);
        --line: rgba(161, 196, 230, 0.18);
        --text: #eef5fb;
        --muted: #a9bacb;
        --accent: #50a8ff;
        --accent-warm: #f4c95d;
      }}
      * {{ box-sizing: border-box; }}
      body {{
        margin: 0;
        font-family: "Trebuchet MS", Arial, sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(80, 168, 255, 0.22), transparent 26%),
          radial-gradient(circle at bottom right, rgba(244, 201, 93, 0.18), transparent 24%),
          linear-gradient(160deg, #05101a 0%, #091521 55%, #0f1d2c 100%);
      }}
      .shell {{ width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 40px 0 48px; }}
      .hero, .panel {{
        border: 1px solid var(--line);
        border-radius: 28px;
        background: var(--panel);
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.34);
      }}
      .hero {{ padding: 40px; }}
      .eyebrow {{
        margin: 0 0 14px;
        color: var(--accent-warm);
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-size: 0.78rem;
      }}
      h1 {{ margin: 0; font-size: clamp(2.6rem, 5vw, 4.8rem); line-height: 1; max-width: 11ch; }}
      p {{ color: var(--muted); line-height: 1.75; }}
      .hero-copy {{ max-width: 650px; }}
      .cta {{
        display: inline-flex;
        margin-top: 12px;
        padding: 14px 20px;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--accent), var(--accent-warm));
        color: #08111a;
        font-weight: 700;
        text-decoration: none;
      }}
      .grid {{
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
        margin-top: 24px;
      }}
      .card, .panel {{ padding: 24px; }}
      h2, h3 {{ margin-top: 0; }}
      ul {{ padding-left: 18px; color: var(--muted); line-height: 1.7; }}
      .faq-item {{ border-top: 1px solid var(--line); padding: 16px 0 0; margin-top: 16px; }}
      @media (max-width: 860px) {{ .grid {{ grid-template-columns: 1fr; }} }}
    </style>
  </head>
  <body>
    <div class="shell">
      <section class="hero">
        <p class="eyebrow">{package.product_type}</p>
        <h1>{package.product_name}</h1>
        <p class="hero-copy">{package.landing_page_copy}</p>
        <a class="cta" href="#">Get Instant Access</a>
      </section>

      <section class="grid">
        {benefit_cards}
      </section>

      <section class="panel" style="margin-top: 24px;">
        <h2>Inside the Bundle</h2>
        <ul>{bullet_list}</ul>
      </section>

      <section class="panel" style="margin-top: 24px;">
        <h2>FAQ</h2>
        {"".join(f'<div class="faq-item"><h3>{item["question"]}</h3><p>{item["answer"]}</p></div>' for item in package.faq)}
      </section>
    </div>
  </body>
</html>
"""

    def _offer_sheet_html(self, idea: Idea, package: ForgeExecution) -> str:
        workbook_cards = "".join(
            f"<article><h3>{section.title}</h3><p>{section.purpose}</p></article>"
            for section in package.workbook_sections
        )
        return f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{package.product_name} Offer Sheet</title>
    <style>
      body {{
        margin: 0;
        font-family: Arial, sans-serif;
        background: #f4f7fb;
        color: #122131;
      }}
      .sheet {{
        width: min(980px, calc(100% - 32px));
        margin: 28px auto;
        padding: 32px;
        background: white;
        border-radius: 26px;
        box-shadow: 0 24px 70px rgba(10, 18, 30, 0.12);
      }}
      .meta {{
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        margin: 24px 0;
      }}
      .meta article {{
        padding: 16px;
        border-radius: 18px;
        background: #eff5fb;
      }}
      .section-grid {{
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
      }}
      .section-grid article {{
        padding: 18px;
        border-radius: 18px;
        background: #f8fbff;
      }}
      p, li {{ line-height: 1.75; }}
      ul {{ padding-left: 18px; }}
      @media (max-width: 780px) {{
        .meta, .section-grid {{ grid-template-columns: 1fr; }}
      }}
    </style>
  </head>
  <body>
    <div class="sheet">
      <h1>{package.product_name}</h1>
      <p>{package.product_summary}</p>
      <div class="meta">
        <article><strong>Niche</strong><p>{idea.niche}</p></article>
        <article><strong>Audience</strong><p>{idea.audience}</p></article>
        <article><strong>Product Type</strong><p>{package.product_type}</p></article>
      </div>
      <h2>Marketplace Promise</h2>
      <p>{package.hero_promise}</p>
      <h2>Included Sections</h2>
      <div class="section-grid">
        {workbook_cards}
      </div>
      <h2>Customer Result</h2>
      <p>{package.customer_result}</p>
      <h2>Bundle Value</h2>
      <p>{package.bundle_value}</p>
      <h2>Design Direction</h2>
      <p>{package.design_direction}</p>
      <h2>Marketplace Listing</h2>
      <ul>{"".join(f"<li>{bullet}</li>" for bullet in package.marketplace_bullets)}</ul>
    </div>
  </body>
</html>
"""

    def _marketplace_listing(self, idea: Idea, package: ForgeExecution) -> str:
        bullets = "\n".join(f"- {bullet}" for bullet in package.marketplace_bullets)
        tags = ", ".join(package.marketplace_tags)
        return (
            f"# {package.marketplace_title}\n\n"
            f"## Product Type\n{package.product_type}\n\n"
            f"## Who It's For\n{idea.audience}\n\n"
            f"## Description\n{package.marketplace_description}\n\n"
            f"## What Problem It Solves\n{idea.problem}\n\n"
            f"## Customer Result\n{package.customer_result}\n\n"
            f"## Why It Has Value\n{package.bundle_value}\n\n"
            f"## What's Included\n{bullets}\n\n"
            f"## Pricing Recommendation\n{package.pricing_recommendation}\n\n"
            f"## Suggested Tags\n{tags}\n\n"
            f"## Product Summary\n{package.product_summary}\n\n"
            f"## Launch Angle\n{package.launch_post}\n"
        )

    def _promo_svg(self, package: ForgeExecution) -> str:
        return f"""<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" fill="none">
  <rect width="1600" height="900" rx="44" fill="#08121B"/>
  <circle cx="260" cy="170" r="240" fill="#4AA7FF" fill-opacity="0.18"/>
  <circle cx="1320" cy="730" r="260" fill="#F0CB58" fill-opacity="0.16"/>
  <rect x="88" y="88" width="1424" height="724" rx="34" fill="#111B28" stroke="rgba(180,210,235,0.18)"/>
  <text x="150" y="210" fill="#F0CB58" font-size="28" font-family="Arial" letter-spacing="6">CARIBAI LABS</text>
  <text x="150" y="330" fill="#EEF5FB" font-size="82" font-family="Arial" font-weight="700">{package.product_name}</text>
  <text x="150" y="420" fill="#A4B7C8" font-size="34" font-family="Arial">{package.product_type}</text>
  <text x="150" y="520" fill="#EEF5FB" font-size="46" font-family="Arial">{package.hero_promise}</text>
  <text x="150" y="620" fill="#A4B7C8" font-size="28" font-family="Arial">{package.design_direction}</text>
</svg>
"""

    def _pdf_bytes(self, idea: Idea, package: ForgeExecution) -> bytes:
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=0.75 * inch,
            rightMargin=0.75 * inch,
            topMargin=0.75 * inch,
            bottomMargin=0.75 * inch,
        )
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "CaribTitle",
            parent=styles["Title"],
            textColor=colors.HexColor("#0D1A29"),
            fontSize=24,
            leading=28,
            spaceAfter=10,
        )
        heading_style = ParagraphStyle(
            "CaribHeading",
            parent=styles["Heading2"],
            textColor=colors.HexColor("#0E3154"),
            spaceAfter=8,
        )
        body_style = ParagraphStyle(
            "CaribBody",
            parent=styles["BodyText"],
            textColor=colors.HexColor("#223547"),
            leading=16,
            spaceAfter=6,
        )

        meta_table = Table(
            [
                ["Niche", idea.niche],
                ["Audience", idea.audience],
                ["Product Type", package.product_type],
                ["Design", package.design_direction],
            ],
            colWidths=[1.5 * inch, 5.8 * inch],
        )
        meta_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F5F9FD")),
                    ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.HexColor("#F5F9FD"), colors.white]),
                    ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#13273A")),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D6E3F0")),
                    ("PADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )

        bundle_table = Table(
            [["Bundle Includes"], [package.product_type], [package.hero_promise]],
            colWidths=[7.0 * inch],
        )
        bundle_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#10253A")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F7FAFE")),
                    ("TEXTCOLOR", (0, 1), (-1, -1), colors.HexColor("#203345")),
                    ("PADDING", (0, 0), (-1, -1), 12),
                    ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#D6E3F0")),
                ]
            )
        )

        story = [
            Paragraph(package.product_name, title_style),
            Paragraph(package.hero_promise, body_style),
            Spacer(1, 12),
            meta_table,
            Spacer(1, 14),
            bundle_table,
            Spacer(1, 18),
            Paragraph("Product Summary", heading_style),
            Paragraph(package.product_summary, body_style),
            Spacer(1, 10),
            Paragraph("Customer Result", heading_style),
            Paragraph(package.customer_result, body_style),
            Spacer(1, 10),
            Paragraph("Bundle Value", heading_style),
            Paragraph(package.bundle_value, body_style),
            Spacer(1, 12),
            Paragraph("Workbook Sections", heading_style),
        ]

        for section in package.workbook_sections:
            story.append(Paragraph(section.title, styles["Heading3"]))
            story.append(Paragraph(section.purpose, body_style))
            for prompt in section.prompts:
                story.append(Paragraph(f"• {prompt}", body_style))
            story.append(Paragraph(f"Example: {section.example}", body_style))
            story.append(Spacer(1, 6))

        story.append(Paragraph("Prompt Pack", heading_style))
        for prompt_asset in package.prompt_pack:
            story.append(Paragraph(prompt_asset.title, styles["Heading3"]))
            story.append(Paragraph(prompt_asset.prompt, body_style))
            story.append(Paragraph(f"Outcome: {prompt_asset.outcome}", body_style))
            story.append(Paragraph(f"Example Input: {prompt_asset.example_input}", body_style))
            story.append(Paragraph(f"Example Result: {prompt_asset.example_result}", body_style))
            story.append(Spacer(1, 6))

        story.append(PageBreak())
        story.append(Paragraph("Checklist Bundle", heading_style))
        for group in package.checklist_groups:
            story.append(Paragraph(group.title, styles["Heading3"]))
            checklist_table = Table([[item] for item in group.items], colWidths=[6.8 * inch])
            checklist_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FBFF")),
                        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#203345")),
                        ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#D8E3EE")),
                        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2ECF5")),
                        ("PADDING", (0, 0), (-1, -1), 10),
                    ]
                )
            )
            story.append(checklist_table)
            story.append(Spacer(1, 10))

        story.append(Paragraph("Quick Start", heading_style))
        for step_number, step in enumerate(package.quick_start_steps, start=1):
            story.append(Paragraph(f"{step_number}. {step}", body_style))

        story.append(Spacer(1, 12))
        story.append(Paragraph("Bonus Resources", heading_style))
        for resource in package.bonus_resources:
            story.append(Paragraph(f"• {resource}", body_style))

        story.append(Spacer(1, 12))
        story.append(Paragraph("Use Cases", heading_style))
        for use_case in package.use_cases:
            story.append(Paragraph(f"• {use_case}", body_style))

        doc.build(story)
        return buffer.getvalue()

    def _cover_png_bytes(self, idea: Idea, package: ForgeExecution) -> bytes:
        generated = self._openai_cover_png_bytes(idea, package)
        if generated:
            return generated

        image = Image.new("RGB", (1600, 900), "#08121b")
        draw = ImageDraw.Draw(image)
        self._draw_vertical_gradient(draw, image.size, "#08121b", "#0f2438")
        draw.ellipse((40, 20, 460, 430), fill="#174a74")
        draw.ellipse((1150, 520, 1570, 920), fill="#654b16")
        draw.rounded_rectangle((72, 72, 1528, 828), radius=36, fill="#111c29", outline="#2d4860", width=3)

        title_font = self._load_font(82)
        subtitle_font = self._load_font(30)
        body_font = self._load_font(34)
        small_font = self._load_font(22)

        draw.text((150, 170), "CARIBAI LABS", font=subtitle_font, fill="#f0ca59")
        draw.text((150, 270), package.product_name, font=title_font, fill="#eef5fb")
        draw.text((150, 390), package.product_type, font=body_font, fill="#9db4c7")
        draw.text((150, 500), package.hero_promise, font=body_font, fill="#eef5fb")
        draw.rounded_rectangle((150, 620, 860, 760), radius=24, fill="#153450", outline="#4fa7ff", width=2)
        draw.text((186, 650), "Marketplace-ready bundle", font=subtitle_font, fill="#eef5fb")
        draw.text((186, 700), package.design_direction[:92], font=small_font, fill="#c5d4e1")

        output = BytesIO()
        image.save(output, format="PNG")
        return output.getvalue()

    def _openai_cover_png_bytes(self, idea: Idea, package: ForgeExecution) -> bytes | None:
        prompt = self._cover_image_prompt(idea, package)
        return self._generate_image_bytes(prompt, size="1536x1024")

    def _cover_image_prompt(self, idea: Idea, package: ForgeExecution) -> str:
        return (
            "Create a premium digital product marketplace cover image.\n"
            "Style: polished, editorial, modern SaaS-luxury, high-contrast, premium information-product packaging.\n"
            "Format: landscape 3:2 hero cover suitable for Gumroad marketplace previews.\n"
            "Do not include device mockups with people. Focus on polished product packaging, layered abstract shapes, document/workbook energy, and visual clarity.\n"
            "Include elegant typography treatment and compositional space for a product title.\n"
            "Avoid clutter, cheap gradients, cartoon styling, or generic stock-photo look.\n"
            f"Product title: {package.product_name}\n"
            f"Product type: {package.product_type}\n"
            f"Audience: {idea.audience}\n"
            f"Niche: {idea.niche}\n"
            f"Promise: {package.hero_promise}\n"
            f"Design direction: {package.design_direction}\n"
            "Color direction: deep navy base, electric blue highlights, warm gold accents, clean whites.\n"
            "Output one premium finished cover image."
        )

    def _worksheet_preview_png_bytes(self, idea: Idea, package: ForgeExecution) -> bytes:
        image = Image.new("RGB", (1400, 1000), "#f4f8fc")
        draw = ImageDraw.Draw(image)
        draw.rounded_rectangle((70, 60, 1330, 940), radius=34, fill="white", outline="#d7e3ef", width=3)
        draw.rounded_rectangle((110, 110, 1290, 220), radius=24, fill="#10253a")
        title_font = self._load_font(44)
        heading_font = self._load_font(28)
        body_font = self._load_font(22)

        draw.text((150, 140), package.product_name, font=title_font, fill="#eef5fb")
        draw.text((150, 190), f"Worksheet Preview for {idea.audience}", font=body_font, fill="#b8cad7")

        y = 280
        for section in package.workbook_sections[:3]:
            draw.text((130, y), section.title, font=heading_font, fill="#163653")
            draw.text((130, y + 40), section.purpose[:90], font=body_font, fill="#52697c")
            box_y = y + 92
            for idx, prompt in enumerate(section.prompts[:2]):
                top = box_y + idx * 92
                draw.rounded_rectangle((130, top, 1270, top + 72), radius=18, fill="#f7fbff", outline="#d7e3ef", width=2)
                draw.text((160, top + 22), prompt[:105], font=body_font, fill="#243949")
            y += 250

        output = BytesIO()
        image.save(output, format="PNG")
        return output.getvalue()

    def _draw_vertical_gradient(self, draw: ImageDraw.ImageDraw, size: tuple[int, int], start_hex: str, end_hex: str) -> None:
        width, height = size
        start_rgb = self._hex_to_rgb(start_hex)
        end_rgb = self._hex_to_rgb(end_hex)
        for y in range(height):
            ratio = y / max(height - 1, 1)
            color = tuple(int(start_rgb[i] + (end_rgb[i] - start_rgb[i]) * ratio) for i in range(3))
            draw.line((0, y, width, y), fill=color)

    def _hex_to_rgb(self, value: str) -> tuple[int, int, int]:
        cleaned = value.lstrip("#")
        return tuple(int(cleaned[index:index + 2], 16) for index in (0, 2, 4))

    def _load_font(self, size: int) -> ImageFont.ImageFont | ImageFont.FreeTypeFont:
        for font_name in ("Arial.ttf", "Helvetica.ttf", "DejaVuSans-Bold.ttf", "DejaVuSans.ttf"):
            try:
                return ImageFont.truetype(font_name, size)
            except OSError:
                continue
        return ImageFont.load_default()

    def _workbook_markdown(self, package: ForgeExecution) -> str:
        parts = [f"# {package.product_name} Workbook", "", package.product_summary, ""]
        for section in package.workbook_sections:
            parts.extend([f"## {section.title}", section.purpose, ""])
            for prompt in section.prompts:
                parts.append(f"- {prompt}")
            parts.extend(["", f"Example: {section.example}", ""])
        parts.extend(["## Customer Result", package.customer_result, "", "## Bundle Value", package.bundle_value, ""])
        return "\n".join(parts).strip() + "\n"

    def _prompt_pack_markdown(self, package: ForgeExecution) -> str:
        parts = [f"# {package.product_name} Prompt Pack", ""]
        for prompt_asset in package.prompt_pack:
            parts.extend(
                [
                    f"## {prompt_asset.title}",
                    prompt_asset.prompt,
                    "",
                    f"Outcome: {prompt_asset.outcome}",
                    f"Example Input: {prompt_asset.example_input}",
                    f"Example Result: {prompt_asset.example_result}",
                    "",
                ]
            )
        return "\n".join(parts).strip() + "\n"

    def _checklist_markdown(self, package: ForgeExecution) -> str:
        parts = [f"# {package.product_name} Checklist Bundle", ""]
        for group in package.checklist_groups:
            parts.append(f"## {group.title}")
            for item in group.items:
                parts.append(f"- {item}")
            parts.append("")
        return "\n".join(parts).strip() + "\n"

    def _quick_start_markdown(self, package: ForgeExecution) -> str:
        parts = [f"# Quick Start Guide for {package.product_name}", ""]
        for index, step in enumerate(package.quick_start_steps, start=1):
            parts.append(f"{index}. {step}")
        parts.extend(["", "## Bonus Resources"])
        for resource in package.bonus_resources:
            parts.append(f"- {resource}")
        return "\n".join(parts).strip() + "\n"

    def _bonus_resource_markdown(self, idea: Idea, package: ForgeExecution) -> str:
        parts = [
            f"# Bonus Resource Sheet for {package.product_name}",
            "",
            f"## Audience",
            idea.audience,
            "",
            "## Bonus Assets",
        ]
        for resource in package.bonus_resources:
            parts.append(f"- {resource}")
        parts.extend(["", "## Design Direction", package.design_direction])
        return "\n".join(parts).strip() + "\n"

    def _system_overview_markdown(self, idea: Idea, package: ForgeExecution) -> str:
        parts = [
            f"# {package.product_name} AI Product System",
            "",
            "## Who It Is For",
            idea.audience,
            "",
            "## Core Problem",
            idea.problem,
            "",
            "## Product Type",
            package.product_type,
            "",
            "## Product Archetype",
            package.product_archetype,
            "",
            "## Customer Result",
            package.customer_result,
            "",
            "## Transformation Promise",
            package.hero_promise,
            "",
            "## Why This Product Has Value",
            package.bundle_value,
            "",
            "## Main Use Cases",
        ]
        for use_case in package.use_cases:
            parts.append(f"- {use_case}")
        parts.extend(["", "## Pricing Recommendation", package.pricing_recommendation])
        return "\n".join(parts).strip() + "\n"

    def _examples_and_swipes_markdown(self, package: ForgeExecution) -> str:
        parts = [f"# {package.product_name} Examples and Swipes", ""]
        for prompt_asset in package.prompt_pack:
            parts.extend(
                [
                    f"## {prompt_asset.title}",
                    f"Prompt: {prompt_asset.prompt}",
                    "",
                    f"Example Input: {prompt_asset.example_input}",
                    f"Example Result: {prompt_asset.example_result}",
                    "",
                ]
            )
        return "\n".join(parts).strip() + "\n"

    def _implementation_map_markdown(self, package: ForgeExecution) -> str:
        parts = [
            f"# {package.product_name} Implementation Map",
            "",
            "## Product Archetype",
            package.product_archetype,
            "",
            "## Quick Start Steps",
        ]
        for index, step in enumerate(package.quick_start_steps, start=1):
            parts.append(f"{index}. {step}")
        parts.extend(["", "## Use Cases"])
        for use_case in package.use_cases:
            parts.append(f"- {use_case}")
        parts.extend(["", "## Support Resources"])
        for resource in package.bonus_resources:
            parts.append(f"- {resource}")
        return "\n".join(parts).strip() + "\n"

    def _extract_note_value(self, notes: str, key: str) -> str | None:
        if not notes:
            return None
        prefix = f"{key}: "
        for line in notes.splitlines():
            if line.startswith(prefix):
                return line[len(prefix):].strip()
        return None

    def _append_notes(self, idea: Idea, updates: dict[str, str]) -> None:
        note_lines = []
        existing = {}
        if idea.notes:
            for line in idea.notes.splitlines():
                if ": " in line:
                    key, value = line.split(": ", 1)
                    existing[key] = value
                else:
                    note_lines.append(line)
        existing.update(updates)
        new_lines = [f"{key}: {value}" for key, value in existing.items()]
        idea.notes = "\n".join(new_lines + note_lines)
        self.db.add(idea)
        self.db.commit()
        self.db.refresh(idea)

    def _join_lines(self, items: list[str]) -> str:
        return "\n".join(f"- {item}" for item in items)

    def _product_name(self, idea: Idea) -> str:
        cleaned_title = idea.title.strip()
        return cleaned_title if cleaned_title.lower().endswith("ai") else f"{cleaned_title} AI"

    def _target_outcome(self, idea: Idea) -> str:
        lower_problem = idea.problem.lower()
        if "description" in lower_problem or "copy" in lower_problem:
            return "creating stronger product copy"
        if "task" in lower_problem or "workflow" in lower_problem:
            return "turning messy work into a cleaner execution system"
        if "message" in lower_problem or "support" in lower_problem or "reply" in lower_problem:
            return "handling customer communication faster and more confidently"
        return "solving a repeated workflow problem faster"

    def _selected_archetype(self, idea: Idea) -> str:
        return self._extract_note_value(idea.notes, "PRODUCT_ARCHETYPE") or "Prompt System"

    def _transformation_promise(self, idea: Idea) -> str:
        stored = self._extract_note_value(idea.notes, "TRANSFORMATION_PROMISE")
        if stored:
            return stored

        outcome = self._target_outcome(idea)
        lower_audience = idea.audience.lower()
        if "merchant" in lower_audience or "shopify" in lower_audience:
            return f"Help {idea.audience} go from slow, generic listings to faster, higher-converting product pages."
        if "creator" in lower_audience:
            return f"Help {idea.audience} go from one raw idea to a repeatable content-output system."
        if "professional" in lower_audience or "career" in idea.niche.lower():
            return f"Help {idea.audience} go from scattered effort to clearer positioning and better execution."
        return f"Help {idea.audience} go from friction and guesswork to a repeatable system for {outcome}."

    def _signature_assets_for_archetype(self, archetype: str) -> list[str]:
        normalized = archetype.lower()
        if "generator" in normalized:
            return [
                "A generator prompt stack for multiple scenarios",
                "Filled examples that show what good output looks like",
                "A batching worksheet for repeat production",
                "A quality filter checklist",
            ]
        if "swipe" in normalized:
            return [
                "Message swipe files segmented by situation",
                "Plug-and-play response templates",
                "Escalation and tone checklists",
                "A same-day implementation guide",
            ]
        if "operational" in normalized or "playbook" in normalized:
            return [
                "A step-by-step playbook workbook",
                "Decision prompts for each stage",
                "Execution checklists and trackers",
                "A first-week implementation roadmap",
            ]
        if "template" in normalized:
            return [
                "Editable templates for the core workflow",
                "Niche examples and fill-in fields",
                "Quality-control checklists",
                "A quick-start implementation sequence",
            ]
        return [
            "A master prompt system for the core pain point",
            "Use-case-specific prompt variations",
            "Filled examples and before/after swipes",
            "A quality rubric and implementation guide",
        ]

    def _record_run(self, idea_id: int, agent_name: str, status: str, summary: str) -> None:
        run = AgentRun(
            idea_id=idea_id,
            agent_name=agent_name,
            status=status,
            summary=summary,
        )
        self.db.add(run)
        self.db.commit()
