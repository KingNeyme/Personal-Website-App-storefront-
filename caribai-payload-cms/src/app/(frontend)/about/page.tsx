import type { Metadata } from 'next'
import Link from 'next/link'

import type { AboutPage } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayloadClient()
  const aboutPage = await payload.findGlobal({
    slug: 'about-page',
    depth: 1,
  })

  return {
    title: aboutPage.seo?.metaTitle || 'About',
    description:
      aboutPage.seo?.metaDescription ||
      aboutPage.hero.description,
  }
}

export default async function AboutRoute() {
  const payload = await getPayloadClient()
  const aboutPage = (await payload.findGlobal({
    slug: 'about-page',
    depth: 2,
  })) as AboutPage

  const values =
    (aboutPage.values?.items || []) as NonNullable<NonNullable<AboutPage['values']>['items']>
  const structureItems =
    (aboutPage.structure.items || []) as NonNullable<AboutPage['structure']['items']>

  return (
    <main>
      <section className="page-hero">
        <div className="shell">
          <div className="page-hero__panel">
            <p className="section-eyebrow">{aboutPage.hero.eyebrow}</p>
            <h1>{aboutPage.hero.title}</h1>
            <p className="page-hero__lede">{aboutPage.hero.description}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell split-grid">
          <div className="section-heading section-heading--stacked">
            <div>
              <p className="section-eyebrow">{aboutPage.identity.eyebrow}</p>
              <h2>{aboutPage.identity.title}</h2>
            </div>
            <p className="section-copy">{aboutPage.identity.description}</p>
          </div>
          <div className="value-grid">
            {values.map((item) => (
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
              <p className="section-eyebrow">{aboutPage.structure.eyebrow}</p>
              <h2>{aboutPage.structure.title}</h2>
            </div>
            <p className="section-copy">{aboutPage.structure.description}</p>
          </div>
          <div className="grid grid--four">
            {structureItems.map((item) => (
              <article
                key={item.id || item.title}
                className={`card ${item.featured ? 'card--featured' : item.muted ? 'card--subtle' : ''}`}
              >
                <span className="card-kicker">{item.badge}</span>
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
              <p className="section-eyebrow">{aboutPage.cta.eyebrow}</p>
              <h2>{aboutPage.cta.title}</h2>
              <p className="section-copy">{aboutPage.cta.description}</p>
            </div>
            <div className="notice">
              <Link className="button button--primary" href={aboutPage.cta.href}>
                {aboutPage.cta.label}
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
