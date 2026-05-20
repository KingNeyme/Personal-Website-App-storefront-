import Link from "next/link";

import { routeHref } from "../lib/routes";

export default function SiteFooter({ settings }) {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <p className="eyebrow">CaribAI</p>
          <h2>Practical AI systems, product direction, and visible execution.</h2>
          <p>{settings.brand?.footerCopy}</p>
          <a className="footer-email" href={`mailto:${settings.contact?.email || "caribailabs@gmail.com"}`}>
            {settings.contact?.email || "caribailabs@gmail.com"}
          </a>
        </div>
        <div className="footer-column">
          <p className="footer-heading">Explore</p>
          <div className="footer-links">
            {(settings.footer?.links || []).map((link) => (
              <Link key={link.href} href={routeHref(link.href)}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="footer-column footer-status">
          <p className="footer-heading">Current Build Cycle</p>
          <div className="footer-status-card">
            <span className="status-dot" />
            <div>
              <strong>Brand site live</strong>
              <p>CaribAI is being used to publish ideas, showcase products, and build authority around the ecosystem.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
