import type { Metadata } from 'next'
import Link from 'next/link'

import type { JourneyPage } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({
    slug: 'journey-page',
    depth: 1,
  })

  return {
    title: page.seo?.metaTitle || 'Journey',
    description: page.seo?.metaDescription || page.hero.description,
  }
}

export default async function JourneyRoute() {
  const payload = await getPayloadClient()
  const page = (await payload.findGlobal({
    slug: 'journey-page',
    depth: 2,
  })) as JourneyPage

  const focusItems = page.focus.items || []
  const documentationItems = page.documentation.items || []
  const futureItems = page.future.items || []

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
              <p className="section-eyebrow">{page.focus.eyebrow}</p>
              <h2>{page.focus.title}</h2>
            </div>
          </div>
          <div className="value-grid">
            {focusItems.map((item) => (
              <article key={item.id || item.title} className="card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">{page.documentation.eyebrow}</p>
              <h2>{page.documentation.title}</h2>
            </div>
            <p className="section-copy">{page.documentation.description}</p>
          </div>
          <div className="timeline">
            {documentationItems.map((item) => (
              <article key={item.id || item.title} className="timeline__item">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                {item.status ? <span>{item.status}</span> : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--compact">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">{page.future.eyebrow}</p>
              <h2>{page.future.title}</h2>
            </div>
          </div>
          <div className="summary-grid">
            {futureItems.map((item) => (
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
