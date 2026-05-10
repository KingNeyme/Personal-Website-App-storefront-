import type { ReactNode } from 'react'

import { getPayloadClient } from '@/lib/payload'

type LinkItem = {
  label?: string | null
  href?: string | null
}

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const payload = await getPayloadClient()
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 1,
  })

  const brandName = siteSettings.brand?.brandName || 'CaribAI'
  const tagline = siteSettings.brand?.tagline || 'AI Engineering • Intelligent Systems • Digital Infrastructure'
  const navItems = (siteSettings.primaryNavigation || []).filter(
    (item: LinkItem) => item?.label && item?.href,
  ) as LinkItem[]
  const headerAction = siteSettings.headerAction
  const footerColumns = siteSettings.footerColumns || []
  const footerMeta = siteSettings.footerMeta

  return (
    <div className="public-shell">
      <header className="public-header">
        <div className="shell public-header__inner">
          <a className="public-brand" href="/">
            <span className="public-brand__name">{brandName}</span>
            <span className="public-brand__tagline">{tagline}</span>
          </a>
          <nav className="public-nav" aria-label="Primary">
            {navItems.map((item) => (
              <a key={`${item.label}-${item.href}`} href={item.href || '#'}>
                {item.label}
              </a>
            ))}
          </nav>
          {headerAction?.label && headerAction?.href ? (
            <a className="button button--primary public-header__cta" href={headerAction.href}>
              {headerAction.label}
            </a>
          ) : null}
        </div>
      </header>

      {children}

      <footer className="public-footer">
        <div className="shell public-footer__grid">
          <div className="public-footer__brand">
            <h2>{footerMeta?.headline || brandName}</h2>
            <p>{footerMeta?.description || 'A practical AI platform for intelligent systems, execution, and digital infrastructure.'}</p>
          </div>
          <div className="public-footer__links">
            {footerColumns.map((column: any) => (
              <div key={column.heading} className="public-footer__column">
                <h3>{column.heading}</h3>
                <div className="public-footer__column-links">
                  {(column.links || []).map((link: LinkItem) => (
                    <a key={`${link.label}-${link.href}`} href={link.href || '#'}>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="shell public-footer__bottom">{footerMeta?.copyrightText || `${brandName}. All rights reserved.`}</div>
      </footer>
    </div>
  )
}
