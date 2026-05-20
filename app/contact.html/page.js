import { StandardPage } from "../../components/PublicPage";
import { getPageContent } from "../../lib/content";

export default async function ContactPage() {
  const data = await getPageContent("contact");

  return (
    <StandardPage
      data={{ ...data, cta: null }}
      sections={[
        { key: "info", data: data.info, type: "contact-form" },
        { key: "boxes", data: { eyebrow: "Contact surfaces", title: "Where and how to reach CaribAI.", items: data.info?.boxes || [] }, type: "cards" }
      ]}
    />
  );
}
