import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const repoRoot = path.resolve(dirname, '..', '..')
const contentRoot = path.join(repoRoot, 'content')
const outputPath = path.join(dirname, '..', 'src', 'seed', 'caribai-seed.json')

const primaryNavigation = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Products', href: '/products' },
  { label: 'Projects', href: '/projects' },
  { label: 'Journey', href: '/journey' },
  { label: 'Journal', href: '/journal' },
]

const footerColumns = [
  {
    heading: 'Platform',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Journal', href: '/journal' },
    ],
  },
  {
    heading: 'Products',
    links: [
      { label: 'Products', href: '/products' },
      { label: 'Projects', href: '/projects' },
      { label: 'Tech Stack', href: '/tech-stack' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Journey', href: '/journey' },
      { label: 'Certifications', href: '/certifications' },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

const readJSON = async (...parts) => {
  const filePath = path.join(contentRoot, ...parts)
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

const hrefMap = {
  'index.html': '/',
  'about.html': '/about',
  'storefront.html': '/products',
  'projects.html': '/projects',
  'journey.html': '/journey',
  'tech-stack.html': '/tech-stack',
  'certifications.html': '/certifications',
  'blog.html': '/journal',
  'contact.html': '/contact',
}

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const mapMetaValues = (items = []) => items.map((value) => ({ value }))

const normalizeHref = (value) => {
  if (typeof value !== 'string') return value
  if (value.startsWith('http') || value.startsWith('#') || value.startsWith('/')) return value
  return hrefMap[value] || value
}

const normalizeLinksDeep = (value) => {
  if (Array.isArray(value)) return value.map((item) => normalizeLinksDeep(item))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        key === 'href' ? normalizeHref(entry) : normalizeLinksDeep(entry),
      ]),
    )
  }

  return value
}

const mapProductLikeItem = (item, fallbackStatus) => ({
  title: item.title,
  slug: slugify(item.title),
  badge: item.badge || '',
  category: item.badge || '',
  status: fallbackStatus,
  image: item.image || '',
  imageAlt: item.imageAlt || '',
  summary: item.description,
  meta: mapMetaValues(item.meta || []),
  featured: Boolean(item.featured),
  muted: Boolean(item.muted),
  problemSolved: item.description,
})

const main = async () => {
  const home = await readJSON('site', 'home.json')
  const about = await readJSON('site', 'about.json')
  const storefront = await readJSON('site', 'storefront.json')
  const projectsPage = await readJSON('site', 'projects.json')
  const journey = await readJSON('site', 'journey.json')
  const techStack = await readJSON('site', 'tech-stack.json')
  const certifications = await readJSON('site', 'certifications.json')
  const contact = await readJSON('site', 'contact.json')
  const posts = await readJSON('blog', 'posts.json')

  const seed = {
    globals: {
      siteSettings: {
        brand: {
          brandName: 'CaribAI',
          legalName: 'CaribAI Labs',
          tagline: home.hero.eyebrow,
        },
        business: {
          siteUrl: 'https://caribailabs.vercel.app',
          supportEmail: 'caribailabs@gmail.com',
          primaryLocation: 'St. Lucia, Caribbean',
        },
        primaryNavigation,
        headerAction: {
          label: 'Contact',
          href: '/contact',
        },
        socialLinks: [
          { label: 'Journal', href: '/journal' },
          { label: 'GitHub', href: 'https://github.com/KingNeyme' },
        ],
        footerColumns,
        footerMeta: {
          headline: 'CaribAI',
          description:
            'AI engineering, intelligent systems, and digital infrastructure built from the Caribbean with practical long-term ambition.',
          copyrightText: 'CaribAI. All rights reserved.',
        },
      },
      homePage: {
        ...home,
        storefrontSection: home.storefront,
        buildSection: home.build,
        contactCTA: home.contact,
      },
      aboutPage: about,
      journalPage: {
        hero: {
          eyebrow: 'CaribAI Journal',
          title: 'Writing about AI engineering, execution systems, and platform-building logic.',
          description:
            'The journal turns CaribAI into a visible thinking system: product notes, engineering lessons, launch logic, and the strategic decisions shaping the platform.',
        },
        editorial: {
          eyebrow: 'Editorial Lens',
          title: 'A public record of how the ecosystem is being built.',
          description:
            'Each entry should help readers understand what is being engineered, why it matters, and how practical AI systems become stronger through iteration and evidence.',
        },
        featured: {
          eyebrow: 'Featured Themes',
          title: 'What the journal is designed to cover',
          items: [
            {
              title: 'AI Engineering',
              description: 'Practical implementation notes behind tools, systems, automation, and infrastructure.',
            },
            {
              title: 'Execution Systems',
              description: 'How workflows, operating models, and product decisions are shaped for measurable outcomes.',
            },
            {
              title: 'Platform Thinking',
              description: 'The strategic reasoning behind products, apps, and the long-term ecosystem architecture.',
            },
          ],
        },
        cta: {
          eyebrow: 'Stay Close',
          title: 'Follow the build as the platform gets sharper.',
          description: 'Use the journal to track what is being launched, learned, and strengthened across CaribAI.',
          label: 'Contact CaribAI',
          href: '/contact',
        },
      },
      storefrontPage: {
        ...storefront,
        productsSection: storefront.products,
      },
      projectsPage,
      journeyPage: journey,
      techStackPage: techStack,
      certificationsPage: {
        content: certifications,
      },
      contactPage: {
        content: contact,
      },
    },
    collections: {
      posts: posts.posts.map((post) => ({
        ...post,
        publishedAt: post.publishDate,
      })),
      products: storefront.products.items.map((item) =>
        mapProductLikeItem(
          item,
          item.badge?.toLowerCase().includes('future') ? 'future' : item.title === 'AI Toolkit' ? 'growing' : 'active',
        ),
      ),
      projects: projectsPage.pipeline.items.map((item) =>
        ({
          ...mapProductLikeItem(
            item,
            item.badge?.toLowerCase().includes('future')
              ? 'future'
              : item.title === 'AI Toolkit'
                ? 'growing'
                : item.title === 'Resume Kit'
                  ? 'focused'
                  : 'active',
          ),
          focus: (item.meta || [])
            .find((entry) => entry.toLowerCase().startsWith('focus:'))
            ?.split(':')
            ?.slice(1)
            ?.join(':')
            ?.trim() || '',
        }),
      ),
    },
  }

  await fs.writeFile(outputPath, JSON.stringify(normalizeLinksDeep(seed), null, 2))
  console.log(`Wrote seed data to ${outputPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
