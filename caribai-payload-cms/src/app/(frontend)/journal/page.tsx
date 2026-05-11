import type { Metadata } from 'next'
import Link from 'next/link'

import type { JournalPage, Post } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({
    slug: 'journal-page',
    depth: 1,
  })

  return {
    title: page.seo?.metaTitle || 'Journal',
    description: page.seo?.metaDescription || page.hero.description,
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export default async function JournalRoute() {
  const payload = await getPayloadClient()
  const [journalPage, postResponse] = await Promise.all([
    payload.findGlobal({
      slug: 'journal-page',
      depth: 2,
    }) as Promise<JournalPage>,
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 12,
      sort: '-publishedAt',
    }),
  ])

  const featuredThemes =
    (journalPage.featured.items || []) as NonNullable<JournalPage['featured']['items']>
  const posts = postResponse.docs as Post[]

  return (
    <main>
      <section className="page-hero">
        <div className="shell">
          <div className="page-hero__panel">
            <p className="section-eyebrow">{journalPage.hero.eyebrow}</p>
            <h1>{journalPage.hero.title}</h1>
            <p className="page-hero__lede">{journalPage.hero.description}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell split-grid">
          <div className="section-heading section-heading--stacked">
            <div>
              <p className="section-eyebrow">{journalPage.editorial.eyebrow}</p>
              <h2>{journalPage.editorial.title}</h2>
            </div>
            <p className="section-copy">{journalPage.editorial.description}</p>
          </div>
          <div className="value-grid">
            {featuredThemes.map((item) => (
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
              <p className="section-eyebrow">Recent Notes</p>
              <h2>What CaribAI is learning, building, and validating in public.</h2>
            </div>
            <p className="section-copy">
              Practical writing around AI engineering, execution systems, launch logic, and platform-building decisions.
            </p>
          </div>
          <div className="journal-grid">
            {posts.map((post) => (
              <article
                key={post.id}
                className={`card journal-card ${post.featured ? 'card--featured' : 'card--subtle'}`}
              >
                <div className="journal-card__meta">
                  <span className="card-kicker">{post.category}</span>
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <Link className="journal-card__link" href={`/journal/${post.slug}`}>
                  Read entry
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--compact">
        <div className="shell">
          <section className="lead-panel">
            <div>
              <p className="section-eyebrow">{journalPage.cta.eyebrow}</p>
              <h2>{journalPage.cta.title}</h2>
              <p className="section-copy">{journalPage.cta.description}</p>
            </div>
            <div className="notice__actions">
              <Link className="button button--primary" href={journalPage.cta.href}>
                {journalPage.cta.label}
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
