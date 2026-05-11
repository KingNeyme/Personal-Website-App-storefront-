import { resolveMediaAlt, resolveMediaURL } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

type ItemWithCopy = {
  title?: string | null
  description?: string | null
  badge?: string | null
  status?: string | null
  image?: unknown
  imageAlt?: string | null
}

type ProductCard = {
  id?: number | string
  title?: string | null
  summary?: string | null
  badge?: string | null
  category?: string | null
  lifecycleStatus?: string | null
  image?: unknown
  imageAlt?: string | null
}

export default async function HomePage() {
  const payload = await getPayloadClient()
  const [homePage, featuredProducts] = await Promise.all([
    payload.findGlobal({
      slug: 'home-page',
      depth: 2,
    }),
    payload.find({
      collection: 'products',
      limit: 4,
      sort: 'title',
      depth: 0,
    }),
  ])

  const heroActions = homePage.hero?.actions || []
  const heroPoints = homePage.hero?.points || []
  const heroMetrics = homePage.hero?.metrics || []
  const structureItems = homePage.structure?.items || []
  const buildItems = homePage.buildSection?.items || []
  const businessItems = homePage.businessModel?.items || []
  const executionItems = homePage.execution?.items || []
  const focusItems = homePage.focus?.items || []
  const growthHubItems = homePage.growthHub?.items || []
  const lead = homePage.lead
  const productItems = (homePage.storefrontSection?.items?.length
    ? homePage.storefrontSection.items
    : featuredProducts.docs) as ProductCard[]

  return (
    <main>
      <section className="hero">
        <div className="shell">
          <section className="hero__panel">
            <p className="hero__eyebrow">{homePage.hero?.eyebrow}</p>
            <h1 className="hero__title">{homePage.hero?.title}</h1>
            <p className="hero__description">{homePage.hero?.description}</p>
            {resolveMediaURL(homePage.hero?.image) ? (
              <div className="hero-media">
                <img
                  alt={resolveMediaAlt(homePage.hero?.image, homePage.hero?.imageAlt || 'CaribAI hero image')}
                  src={resolveMediaURL(homePage.hero?.image) || ''}
                />
              </div>
            ) : null}
            <div className="hero__actions">
              {heroActions.map((action: any) => (
                <a
                  key={`${action.label}-${action.href}`}
                  className={`button ${action.variant === 'secondary' ? 'button--secondary' : 'button--primary'}`}
                  href={action.href || '#'}
                >
                  {action.label}
                </a>
              ))}
            </div>
            {heroPoints.length ? (
              <div className="hero__bullet-grid">
                {heroPoints.map((point: any) => (
                  <div key={point.value} className="hero__bullet">
                    {point.value}
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">{homePage.positioning?.eyebrow}</p>
              <h2>{homePage.positioning?.title}</h2>
            </div>
            <p className="section-copy">{homePage.positioning?.description}</p>
          </div>
          <div className="grid grid--three">
            {heroMetrics.map((item: ItemWithCopy) => (
              <article key={item.title} className="card card--metric">
                {resolveMediaURL(item.image) ? (
                  <div className="card-media">
                    <img
                      alt={resolveMediaAlt(item.image, item.imageAlt || `${item.title} visual`)}
                      src={resolveMediaURL(item.image) || ''}
                    />
                  </div>
                ) : null}
                <span className="card-kicker">{item.badge}</span>
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
              <p className="section-eyebrow">{homePage.structure?.eyebrow}</p>
              <h2>{homePage.structure?.title}</h2>
            </div>
            <p className="section-copy">{homePage.structure?.description}</p>
          </div>
          <div className="grid grid--four">
            {structureItems.map((item: ItemWithCopy) => (
              <article key={item.title} className="card">
                {resolveMediaURL(item.image) ? (
                  <div className="card-media">
                    <img
                      alt={resolveMediaAlt(item.image, item.imageAlt || `${item.title} visual`)}
                      src={resolveMediaURL(item.image) || ''}
                    />
                  </div>
                ) : null}
                <span className="card-kicker">{item.badge}</span>
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
              <p className="section-eyebrow">{homePage.storefrontSection?.eyebrow}</p>
              <h2>{homePage.storefrontSection?.title}</h2>
            </div>
            <p className="section-copy">{homePage.storefrontSection?.description}</p>
          </div>
          <div className="grid grid--products">
            {productItems.map((item: ProductCard) => (
              <article key={`${item.id}-${item.title}`} className="card card--product">
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
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">{homePage.buildSection?.eyebrow}</p>
              <h2>{homePage.buildSection?.title}</h2>
            </div>
            <p className="section-copy">{homePage.businessModel?.title}</p>
          </div>
          <div className="grid grid--three">
            {buildItems.map((item: ItemWithCopy) => (
              <article key={item.title} className="card">
                {resolveMediaURL(item.image) ? (
                  <div className="card-media">
                    <img
                      alt={resolveMediaAlt(item.image, item.imageAlt || `${item.title} visual`)}
                      src={resolveMediaURL(item.image) || ''}
                    />
                  </div>
                ) : null}
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
          <div className="grid grid--three section-stack">
            {businessItems.map((item: ItemWithCopy) => (
              <article key={item.title} className="card card--subtle">
                {resolveMediaURL(item.image) ? (
                  <div className="card-media">
                    <img
                      alt={resolveMediaAlt(item.image, item.imageAlt || `${item.title} visual`)}
                      src={resolveMediaURL(item.image) || ''}
                    />
                  </div>
                ) : null}
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
              <p className="section-eyebrow">{homePage.execution?.eyebrow}</p>
              <h2>{homePage.execution?.title}</h2>
            </div>
            {homePage.execution?.link?.label ? (
              <a className="section-link" href={homePage.execution.link.href || '#'}>
                {homePage.execution.link.label}
              </a>
            ) : null}
          </div>
          <div className="timeline">
            {executionItems.map((item: ItemWithCopy) => (
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

      {growthHubItems.length ? (
        <section className="section section--compact">
          <div className="shell">
            <div className="section-heading">
              <div>
                <p className="section-eyebrow">{homePage.growthHub?.eyebrow}</p>
                <h2>{homePage.growthHub?.title}</h2>
              </div>
              <p className="section-copy">{homePage.growthHub?.description}</p>
            </div>
            <div className="grid grid--three">
              {growthHubItems.map((item: any) => (
                <article key={item.id || item.title} className="card">
                  {resolveMediaURL(item.image) ? (
                    <div className="card-media">
                      <img
                        alt={resolveMediaAlt(item.image, item.imageAlt || `${item.title} visual`)}
                        src={resolveMediaURL(item.image) || ''}
                      />
                    </div>
                  ) : null}
                  <span className="card-kicker">Growth Hub</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <a className="journal-card__link" href={item.href || '#'}>
                    {item.linkLabel || 'Open'}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section section--compact">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">{homePage.focus?.eyebrow}</p>
              <h2>{homePage.focus?.title}</h2>
            </div>
          </div>
          <div className="timeline">
            {focusItems.map((item: ItemWithCopy) => (
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
          <section className="lead-panel">
            <div>
              <p className="section-eyebrow">{lead?.eyebrow}</p>
              <h2>{lead?.title}</h2>
              <p className="section-copy">{lead?.description}</p>
            </div>
            <div className="notice">
              <strong>{lead?.buttonLabel || 'Join Early Access'}</strong>
              <p>{lead?.note || 'Lead capture and deeper forms will be rebuilt against the Payload app next.'}</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
