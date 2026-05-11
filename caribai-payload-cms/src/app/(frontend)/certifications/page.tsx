import type { Metadata } from 'next'
import Link from 'next/link'

import type { CertificationsPage } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

type CertificationsContent = {
  hero: {
    eyebrow?: string | null
    title: string
    description: string
  }
  status: {
    eyebrow?: string | null
    title: string
    description?: string | null
    items?: Array<{
      title: string
      description: string
      status?: string | null
    }>
  }
  summary?: {
    items?: Array<{
      title: string
      description: string
    }>
  }
  cta: {
    eyebrow?: string | null
    title: string
    description: string
    label: string
    href: string
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({
    slug: 'certifications-page',
    depth: 1,
  })
  const content = page.content as CertificationsContent

  return {
    title: 'Certifications',
    description: content.hero.description,
  }
}

export default async function CertificationsRoute() {
  const payload = await getPayloadClient()
  const page = (await payload.findGlobal({
    slug: 'certifications-page',
    depth: 2,
  })) as CertificationsPage
  const content = page.content as CertificationsContent

  const statusItems = content.status.items || []
  const summaryItems = content.summary?.items || []

  return (
    <main>
      <section className="page-hero">
        <div className="shell">
          <div className="page-hero__panel">
            <p className="section-eyebrow">{content.hero.eyebrow}</p>
            <h1>{content.hero.title}</h1>
            <p className="page-hero__lede">{content.hero.description}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">{content.status.eyebrow}</p>
              <h2>{content.status.title}</h2>
            </div>
            <p className="section-copy">{content.status.description}</p>
          </div>
          <div className="timeline">
            {statusItems.map((item) => (
              <article key={item.title} className="timeline__item">
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
          <div className="summary-grid">
            {summaryItems.map((item) => (
              <article key={item.title} className="card card--subtle">
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
              <p className="section-eyebrow">{content.cta.eyebrow}</p>
              <h2>{content.cta.title}</h2>
              <p className="section-copy">{content.cta.description}</p>
            </div>
            <div className="notice__actions">
              <Link className="button button--primary" href={content.cta.href}>
                {content.cta.label}
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
