import type { Metadata } from 'next'
import Link from 'next/link'

import type { Project, ProjectsPage } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

function isProject(item: number | Project): item is Project {
  return typeof item === 'object' && item !== null
}

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({
    slug: 'projects-page',
    depth: 1,
  })

  return {
    title: page.seo?.metaTitle || 'Projects',
    description: page.seo?.metaDescription || page.hero.description,
  }
}

export default async function ProjectsRoute() {
  const payload = await getPayloadClient()
  const [projectsPage, projectResponse] = await Promise.all([
    payload.findGlobal({
      slug: 'projects-page',
      depth: 2,
    }) as Promise<ProjectsPage>,
    payload.find({
      collection: 'projects',
      depth: 1,
      limit: 12,
      sort: 'title',
    }),
  ])

  const projects = (projectsPage.pipeline.items?.length
    ? projectsPage.pipeline.items.filter(isProject)
    : projectResponse.docs) as Project[]
  const summaryItems =
    (projectsPage.summary?.items || []) as NonNullable<
      NonNullable<ProjectsPage['summary']>['items']
    >

  return (
    <main>
      <section className="page-hero">
        <div className="shell">
          <div className="page-hero__panel">
            <p className="section-eyebrow">{projectsPage.hero.eyebrow}</p>
            <h1>{projectsPage.hero.title}</h1>
            <p className="page-hero__lede">{projectsPage.hero.description}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">{projectsPage.pipeline.eyebrow}</p>
              <h2>{projectsPage.pipeline.title}</h2>
            </div>
            <p className="section-copy">{projectsPage.pipeline.description}</p>
          </div>
          <div className="stack-grid">
            {projects.map((item) => (
              <article
                key={item.id}
                className={`timeline__item timeline__item--project ${item.featured ? 'card--featured' : item.muted ? 'card--subtle' : ''}`}
              >
                <div>
                  <span className="card-kicker">{item.badge || item.focus}</span>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  {item.meta?.length ? (
                    <div className="meta-list meta-list--inline">
                      {item.meta.map((metaItem: NonNullable<Project['meta']>[number]) => (
                        <span key={metaItem.id || metaItem.value}>{metaItem.value}</span>
                      ))}
                    </div>
                  ) : null}
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
              <p className="section-eyebrow">{projectsPage.cta.eyebrow}</p>
              <h2>{projectsPage.cta.title}</h2>
              <p className="section-copy">{projectsPage.cta.description}</p>
            </div>
            <div className="notice__actions">
              <Link className="button button--primary" href={projectsPage.cta.href}>
                {projectsPage.cta.label}
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
