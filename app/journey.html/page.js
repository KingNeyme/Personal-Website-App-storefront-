import { StandardPage } from "../../components/PublicPage";
import { getPageContent } from "../../lib/content";

export default async function JourneyPage() {
  const data = await getPageContent("journey");

  return (
    <StandardPage
      data={data}
      sections={[
        { key: "focus", data: data.focus, type: "cards" },
        { key: "documentation", data: data.documentation, type: "cards" },
        { key: "future", data: { eyebrow: data.future?.eyebrow, title: data.future?.title, items: data.future?.items || [] }, type: "cards" }
      ]}
    />
  );
}
