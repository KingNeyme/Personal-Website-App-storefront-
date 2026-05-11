import type { Metadata } from 'next'
import Link from 'next/link'

import type { TechStackPage } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({
    slug: 'tech-stack-page',
    depth: 1,
  })

  return {
    title: page.seo?.metaTitle || 'Tech Stack',
    description: page.seo?.metaDescription || page.hero.description,
  }
}

function ToolCard({
  title,
  label,
  description,
  logo,
}: {
  title: string
  label?: string | null
  description: string
  logo?: string | null
}) {
  return (
    <article className="card tool-card">
      <div className="tool-card__header">
        <div className="tool-card__logo">
          {logo ? <img src={logo} alt={`${title} logo`} /> : title.slice(0, 2).toUpperCase()}
        </div>
        <div>
          {label ? <span className="card-kicker">{label}</span> : null}
          <h3>{title}</h3>
        </div>
      </div>
      <p>{description}</p>
    </article>
  )
}

export default async function TechStackRoute() {
  const payload = await getPayloadClient()
  const page = (await payload.findGlobal({
    slug: 'tech-stack-page',
    depth: 2,
  })) as TechStackPage

  const primaryItems = page.primary.items || []
  const secondaryItems = page.secondary.items || []
  const supportItems = page.support.items || []

  return (
    <main>
      <section className="page-hero">
        <div className="shell">
          <div className="page-hero__panel">
            <p className="section-eyebrow">{page.hero.eyebrow}</p>
            <h1>{page.hero.title}</h1>
            <p className="page-hero__lede">{page.hero.description}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">{page.primary.eyebrow}</p>
              <h2>{page.primary.title}</h2>
            </div>
            <p className="section-copy">{page.primary.description}</p>
          </div>
          <div className="grid grid--three">
            {primaryItems.map((item) => (
              <ToolCard
                key={item.id || item.title}
                title={item.title}
                label={item.label}
                logo={item.logo}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">{page.secondary.eyebrow}</p>
              <h2>{page.secondary.title}</h2>
            </div>
            <p className="section-copy">{page.secondary.description}</p>
          </div>
          <div className="grid grid--three">
            {secondaryItems.map((item) => (
              <ToolCard
                key={item.id || item.title}
                title={item.title}
                label={item.label}
                logo={item.logo}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--compact">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">{page.support.eyebrow}</p>
              <h2>{page.support.title}</h2>
            </div>
          </div>
          <div className="summary-grid">
            {supportItems.map((item) => (
              <article key={item.id || item.title} className="card card--subtle">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--compact">
        <div className="shell">
          <section className="lead-panel">
            <div>
              <p className="section-eyebrow">{page.cta.eyebrow}</p>
              <h2>{page.cta.title}</h2>
              <p className="section-copy">{page.cta.description}</p>
            </div>
            <div className="notice__actions">
              <Link className="button button--primary" href={page.cta.href}>
                {page.cta.label}
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
