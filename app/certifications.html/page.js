import { StandardPage } from "../../components/PublicPage";
import { getPageContent } from "../../lib/content";

export default async function CertificationsPage() {
  const data = await getPageContent("certifications");

  return (
    <StandardPage
      data={data}
      sections={[
        { key: "status", data: data.status, type: "cards" },
        { key: "summary", data: { eyebrow: "Why it matters", title: "Structured growth behind the systems.", items: data.summary?.items || [] }, type: "cards" }
      ]}
    />
  );
}
