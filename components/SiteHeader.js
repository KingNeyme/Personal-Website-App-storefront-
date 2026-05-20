"use client";

import Link from "next/link";
import { useState } from "react";

import { assetPath, routeHref } from "../lib/routes";

export default function SiteHeader({ settings }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="topbar-shell">
      <div className="topbar">
        <Link className="brandmark" href={routeHref(settings.brand?.homeHref || "/")}>
          <img src={assetPath(settings.brand?.logoSrc)} alt={settings.brand?.logoAlt || "CaribAI logo"} />
          <span>CaribAI</span>
        </Link>

        <button
          className={`nav-toggle${open ? " is-open" : ""}`}
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <span />
          <span />
        </button>

        <nav className={`site-nav${open ? " is-open" : ""}`}>
          {(settings.navigation?.links || []).map((link) => (
            <Link key={link.href} href={routeHref(link.href)} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          {settings.navigation?.cta ? (
            <Link className="button button-ghost" href={routeHref(settings.navigation.cta.href)} onClick={() => setOpen(false)}>
              {settings.navigation.cta.label}
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
