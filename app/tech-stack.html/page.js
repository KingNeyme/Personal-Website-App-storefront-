import { StandardPage } from "../../components/PublicPage";
import { getPageContent } from "../../lib/content";

export default async function TechStackPage() {
  const data = await getPageContent("tech-stack");

  return (
    <StandardPage
      data={data}
      sections={[
        { key: "primary", data: data.primary, type: "cards" },
        { key: "secondary", data: data.secondary, type: "cards" },
        { key: "support", data: { eyebrow: data.support?.eyebrow, title: data.support?.title, items: data.support?.items || [] }, type: "cards" }
      ]}
    />
  );
}
