import type { Metadata } from 'next'
import Link from 'next/link'

import type { Product, StorefrontPage } from '@/payload-types'
import { resolveMediaAlt, resolveMediaURL } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

function isProduct(item: number | Product): item is Product {
  return typeof item === 'object' && item !== null
}

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({
    slug: 'storefront-page',
    depth: 1,
  })

  return {
    title: page.seo?.metaTitle || 'Products',
    description: page.seo?.metaDescription || page.hero.description,
  }
}

export default async function ProductsRoute() {
  const payload = await getPayloadClient()
  const [storefrontPage, productResponse] = await Promise.all([
    payload.findGlobal({
      slug: 'storefront-page',
      depth: 2,
    }) as Promise<StorefrontPage>,
    payload.find({
      collection: 'products',
      depth: 1,
      limit: 12,
      sort: 'title',
    }),
  ])

  const products = (storefrontPage.productsSection.items?.length
    ? storefrontPage.productsSection.items.filter(isProduct)
    : productResponse.docs) as Product[]
  const summaryItems =
    (storefrontPage.summary?.items || []) as NonNullable<
      NonNullable<StorefrontPage['summary']>['items']
    >

  return (
    <main>
      <section className="page-hero">
        <div className="shell">
          <div className="page-hero__panel">
            <p className="section-eyebrow">{storefrontPage.hero.eyebrow}</p>
            <h1>{storefrontPage.hero.title}</h1>
            <p className="page-hero__lede">{storefrontPage.hero.description}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">{storefrontPage.productsSection.eyebrow}</p>
              <h2>{storefrontPage.productsSection.title}</h2>
            </div>
            <p className="section-copy">{storefrontPage.productsSection.description}</p>
          </div>
          <div className="grid grid--products">
            {products.map((item) => (
              <article
                key={item.id}
                className={`card card--product ${item.featured ? 'card--featured' : item.muted ? 'card--subtle' : ''}`}
              >
                {resolveMediaURL(item.image) ? (
                  <div className="card-media">
                    <img
                      alt={resolveMediaAlt(item.image, item.imageAlt || `${item.title} visual`)}
                      src={resolveMediaURL(item.image) || ''}
                    />
                  </div>
                ) : null}
                <span className="card-kicker">{item.badge || item.category || item.lifecycleStatus}</span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                {item.meta?.length ? (
                  <div className="meta-list">
                    {item.meta.map((metaItem: NonNullable<Product['meta']>[number]) => (
                      <span key={metaItem.id || metaItem.value}>{metaItem.value}</span>
                    ))}
                  </div>
                ) : null}
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
              <p className="section-eyebrow">{storefrontPage.cta.eyebrow}</p>
              <h2>{storefrontPage.cta.title}</h2>
              <p className="section-copy">{storefrontPage.cta.description}</p>
            </div>
            <div className="notice">
              <strong>{storefrontPage.lead.buttonLabel || 'Join Early Access'}</strong>
              <p>{storefrontPage.lead.note || storefrontPage.lead.description}</p>
              <div className="notice__actions">
                <Link className="button button--primary" href={storefrontPage.cta.href}>
                  {storefrontPage.cta.label}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
