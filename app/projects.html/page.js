import { StandardPage } from "../../components/PublicPage";
import { getPageContent } from "../../lib/content";

export default async function ProjectsPage() {
  const data = await getPageContent("projects");

  return (
    <StandardPage
      data={data}
      sections={[
        { key: "pipeline", data: data.pipeline, type: "cards" },
        { key: "summary", data: { eyebrow: "What it signals", title: "How the project mix shapes the broader ecosystem.", items: data.summary?.items || [] }, type: "summary" }
      ]}
    />
  );
}
