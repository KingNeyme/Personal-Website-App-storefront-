import { StandardPage } from "../../components/PublicPage";
import { getPageContent } from "../../lib/content";

export default async function AboutPage() {
  const data = await getPageContent("about");

  return (
    <StandardPage
      data={data}
      sections={[
        { key: "identity", data: data.identity, type: "statement", variant: "content-section" },
        { key: "values", data: { eyebrow: "Core Direction", title: "Mission, vision, and operating lens.", items: data.values?.items || [] }, type: "cards" },
        { key: "structure", data: data.structure, type: "cards" }
      ]}
    />
  );
}
