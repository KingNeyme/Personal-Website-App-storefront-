import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.api.deps import get_db
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine as app_engine
from app.main import app


class CaribAILabsAppTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.assets_dir = Path(self.temp_dir.name) / "assets"
        self.assets_dir.mkdir(parents=True, exist_ok=True)
        self.test_db_path = Path(self.temp_dir.name) / "test.db"

        self.original_assets_dir = settings.generated_assets_dir
        self.original_api_key = settings.openai_api_key
        settings.generated_assets_dir = str(self.assets_dir)
        settings.openai_api_key = None

        self.engine = create_engine(
            f"sqlite:///{self.test_db_path}",
            connect_args={"check_same_thread": False},
        )
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        Base.metadata.create_all(bind=self.engine)

        def override_get_db():
            db = self.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_get_db
        self.client = TestClient(app)

    def tearDown(self):
        app.dependency_overrides.clear()
        settings.generated_assets_dir = self.original_assets_dir
        settings.openai_api_key = self.original_api_key
        self.engine.dispose()
        app_engine.dispose()
        self.temp_dir.cleanup()

    def test_health_endpoint_reports_runtime_state(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn(payload["status"], {"ok", "degraded"})
        self.assertTrue(payload["database"]["ok"])
        self.assertTrue(payload["generated_assets"]["exists"])

    def test_prompt_to_forge_flow_creates_bundle(self):
        intake = self.client.post("/ui/api/prompt-intake", data={"prompt": "Create an AI digital product for Shopify merchants"})
        self.assertEqual(intake.status_code, 200)
        self.assertEqual(intake.json()["snapshot"]["signal"]["product_archetype"], "Prompt System")
        idea_id = intake.json()["snapshot"]["idea"]["id"]

        blueprint = self.client.post(f"/ui/api/ideas/{idea_id}/blueprint")
        self.assertEqual(blueprint.status_code, 200)
        self.assertTrue(blueprint.json()["snapshot"]["blueprint"]["product_name"])
        self.assertEqual(blueprint.json()["snapshot"]["blueprint"]["product_archetype"], "Prompt System")

        forge = self.client.post(f"/ui/api/ideas/{idea_id}/forge")
        self.assertEqual(forge.status_code, 200)
        self.assertEqual(forge.json()["snapshot"]["forge"]["package"]["product_archetype"], "Prompt System")
        downloads = forge.json()["snapshot"]["forge"]["downloads"]
        names = [item["name"] for item in downloads]
        self.assertIn("asset_bundle.zip", names)
        self.assertIn("ai_product_system.md", names)
        self.assertIn("prompt_pack.md", names)
        self.assertIn("done_for_you_templates.md", names)
        self.assertIn("Examples and Swipes", forge.json()["snapshot"]["forge"]["examples_preview"])
        self.assertIn("Done-For-You Templates", forge.json()["snapshot"]["forge"]["templates_preview"])

        idea_assets = self.assets_dir / f"idea_{idea_id}"
        self.assertTrue((idea_assets / "asset_bundle.zip").exists())
        self.assertTrue((idea_assets / "product_sheet.pdf").exists())
        self.assertTrue((idea_assets / "marketplace_listing.md").exists())

    def test_api_run_all_snapshot(self):
        create = self.client.post(
            "/ideas",
            json={
                "title": "Creator Prompt Engine",
                "niche": "creator economy",
                "platform": "gumroad",
                "audience": "creators",
                "problem": "Creators waste time turning one idea into multiple usable outputs.",
                "notes": "",
            },
        )
        self.assertEqual(create.status_code, 201)
        idea_id = create.json()["id"]

        snapshot = self.client.post(f"/ideas/{idea_id}/run-all")
        self.assertEqual(snapshot.status_code, 200)
        payload = snapshot.json()
        self.assertEqual(payload["idea"]["id"], idea_id)
        self.assertIsNotNone(payload["research_report"])
        self.assertIsNotNone(payload["validation_report"])
        self.assertIsNotNone(payload["product_brief"])
        self.assertIsNotNone(payload["build_plan"])
        self.assertIsNotNone(payload["launch_assets"])


if __name__ == "__main__":
    unittest.main()
