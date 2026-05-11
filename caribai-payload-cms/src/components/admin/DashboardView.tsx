type QuickCard = {
  eyebrow: string
  title: string
  description: string
  href: string
  action: string
}

const pageCards: QuickCard[] = [
  {
    eyebrow: 'Globals',
    title: 'Homepage',
    description: 'Refine the core positioning, hero, structure, and front-page messaging.',
    href: '/admin/globals/home-page',
    action: 'Edit homepage',
  },
  {
    eyebrow: 'Globals',
    title: 'About and Journey',
    description: 'Keep the company narrative, mission, and public build story aligned.',
    href: '/admin/globals/about-page',
    action: 'Open about page',
  },
  {
    eyebrow: 'Globals',
    title: 'Tech Stack',
    description: 'Maintain tools, logos, and the engineering infrastructure story.',
    href: '/admin/globals/tech-stack-page',
    action: 'Edit tech stack',
  },
]

const publishingCards: QuickCard[] = [
  {
    eyebrow: 'Collections',
    title: 'Products',
    description: 'Manage sellable systems, launch-ready offers, and product status.',
    href: '/admin/collections/products',
    action: 'Manage products',
  },
  {
    eyebrow: 'Collections',
    title: 'Projects',
    description: 'Track initiatives, experiments, and platform-building efforts.',
    href: '/admin/collections/projects',
    action: 'Manage projects',
  },
  {
    eyebrow: 'Publishing',
    title: 'Journal',
    description: 'Publish notes, insights, and build-in-public content around CaribAI.',
    href: '/admin/collections/posts',
    action: 'Write journal',
  },
]

const operationsCards: QuickCard[] = [
  {
    eyebrow: 'Brand',
    title: 'Site Settings',
    description: 'Update navigation, footer links, contact details, and shell-level settings.',
    href: '/admin/globals/site-settings',
    action: 'Open settings',
  },
  {
    eyebrow: 'Media',
    title: 'Media Library',
    description: 'Upload visuals, logos, supporting graphics, and future branded media.',
    href: '/admin/collections/media',
    action: 'Open media',
  },
  {
    eyebrow: 'Preview',
    title: 'View Public Site',
    description: 'Check the audience-facing site while you update and refine content.',
    href: '/',
    action: 'Open site',
  },
]

function QuickCard({ eyebrow, title, description, href, action }: QuickCard) {
  return (
    <article className="caribai-admin-quick-card">
      <span className="caribai-admin-quick-card__eyebrow">{eyebrow}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <a className="caribai-admin-quick-card__link" href={href}>
        {action}
      </a>
    </article>
  )
}

function Section({
  title,
  description,
  href,
  action,
  cards,
}: {
  title: string
  description: string
  href: string
  action: string
  cards: QuickCard[]
}) {
  return (
    <section className="caribai-admin-dashboard__section">
      <div className="caribai-admin-dashboard__section-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <a href={href}>{action}</a>
      </div>
      <div className="caribai-admin-dashboard__grid">
        {cards.map((card) => (
          <QuickCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  )
}

export function DashboardView() {
  return (
    <main className="caribai-admin-dashboard">
      <section className="caribai-admin-dashboard__hero">
        <div className="caribai-admin-dashboard__hero-head">
          <div className="caribai-admin-dashboard__hero-copy">
            <p className="caribai-admin-dashboard__eyebrow">CaribAI CMS</p>
            <h1>Run the brand like a serious publishing and operations platform.</h1>
            <p>
              A cleaner control surface for managing public pages, products, editorial content, and
              brand infrastructure without getting lost in raw collection screens.
            </p>
          </div>
          <div className="caribai-admin-dashboard__hero-actions">
            <a className="caribai-admin-dashboard__hero-link" href="/admin/globals/home-page">
              Open homepage controls
            </a>
            <a className="caribai-admin-dashboard__hero-link" href="/admin/globals/site-settings">
              Open site settings
            </a>
          </div>
        </div>
        <div className="caribai-admin-dashboard__meta">
          <span>WordPress-style structure</span>
          <span>Payload editorial engine</span>
          <span>Live on Vercel + Postgres</span>
        </div>
      </section>

      <section className="caribai-admin-dashboard__stats">
        <article className="caribai-admin-dashboard__stat">
          <span className="caribai-admin-dashboard__stat-label">Pages</span>
          <span className="caribai-admin-dashboard__stat-value">8 managed globals</span>
        </article>
        <article className="caribai-admin-dashboard__stat">
          <span className="caribai-admin-dashboard__stat-label">Publishing</span>
          <span className="caribai-admin-dashboard__stat-value">Journal, products, projects</span>
        </article>
        <article className="caribai-admin-dashboard__stat">
          <span className="caribai-admin-dashboard__stat-label">Media</span>
          <span className="caribai-admin-dashboard__stat-value">Central asset library</span>
        </article>
        <article className="caribai-admin-dashboard__stat">
          <span className="caribai-admin-dashboard__stat-label">Stack</span>
          <span className="caribai-admin-dashboard__stat-value">Payload + Vercel + Postgres</span>
        </article>
      </section>

      <Section
        title="Page Management"
        description="Edit the high-visibility pages that define how the public sees CaribAI."
        href="/admin/globals/home-page"
        action="Open page globals"
        cards={pageCards}
      />

      <Section
        title="Publishing and Inventory"
        description="Control what CaribAI is launching, writing about, and building in public."
        href="/admin/collections/posts"
        action="Open collections"
        cards={publishingCards}
      />

      <Section
        title="Operations"
        description="Manage settings, media, and live review without leaving the admin workspace."
        href="/admin/globals/site-settings"
        action="Open settings"
        cards={operationsCards}
      />
    </main>
  )
}
