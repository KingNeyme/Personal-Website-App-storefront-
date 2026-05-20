import { StandardPage } from "../../components/PublicPage";
import { getPageContent } from "../../lib/content";

export default async function StorefrontPage() {
  const data = await getPageContent("storefront");
  const liveItems = (data.products?.items || []).filter((item) => (item.workflowStatus || "draft").toLowerCase() === "live");

  return (
    <StandardPage
      data={{ ...data, cta: data.cta, lead: data.lead }}
      sections={[
        { key: "products", data: { ...data.products, items: liveItems }, type: "cards" },
        { key: "summary", data: { eyebrow: "Storefront logic", title: "Why the storefront matters.", items: data.summary?.items || [] }, type: "summary" }
      ]}
      ctaMode="lead"
    />
  );
}
