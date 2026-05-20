import "./globals.css";

import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { getSettings } from "../lib/content";

export const metadata = {
  title: "CaribAI",
  description: "Practical AI systems, digital infrastructure, and visible product-building from the Caribbean."
};

export default async function RootLayout({ children }) {
  const settings = await getSettings();

  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          <SiteHeader settings={settings} />
          <main className="site-main">{children}</main>
          <SiteFooter settings={settings} />
        </div>
      </body>
    </html>
  );
}
