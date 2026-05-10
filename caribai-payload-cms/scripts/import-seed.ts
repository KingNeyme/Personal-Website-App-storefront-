import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload } from 'payload'

import config from '../payload.config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const seedPath = path.join(dirname, '..', 'src', 'seed', 'caribai-seed.json')

type ProductLike = {
  id: string | number
  title: string
  slug: string
}

type SeedData = {
  globals: Record<string, any>
  collections: {
    posts: any[]
    products: any[]
    projects: any[]
  }
}

const globalSlugMap: Record<string, string> = {
  siteSettings: 'site-settings',
  homePage: 'home-page',
  aboutPage: 'about-page',
  journalPage: 'journal-page',
  storefrontPage: 'storefront-page',
  projectsPage: 'projects-page',
  journeyPage: 'journey-page',
  techStackPage: 'tech-stack-page',
  certificationsPage: 'certifications-page',
  contactPage: 'contact-page',
}

const byTitle = <T extends ProductLike>(items: T[]) =>
  new Map(items.map((item) => [item.title, item.id]))

const loadSeed = async (): Promise<SeedData> => {
  const raw = await fs.readFile(seedPath, 'utf8')
  return JSON.parse(raw)
}

const uploadFieldNames = new Set(['image', 'coverImage', 'logo', 'ogImage'])

const sanitizeUnresolvedUploads = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeUnresolvedUploads(item))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([key, entry]) => {
          if (uploadFieldNames.has(key) && typeof entry === 'string') {
            return [key, null]
          }

          return [key, sanitizeUnresolvedUploads(entry)]
        })
        .filter(([, entry]) => entry !== undefined),
    )
  }

  return value
}

const upsertBySlug = async ({
  payload,
  collection,
  slug,
  data,
}: {
  payload: any
  collection: 'posts' | 'products' | 'projects'
  slug: string
  data: Record<string, unknown>
}) => {
  const existing = await payload.find({
    collection,
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    pagination: false,
  })

  if (existing.docs?.[0]) {
    return payload.update({
      collection,
      id: existing.docs[0].id,
      data: sanitizeUnresolvedUploads(data),
    })
  }

  return payload.create({
    collection,
    data: sanitizeUnresolvedUploads(data),
  })
}

const importCollections = async (payload: any, seed: SeedData) => {
  const products: ProductLike[] = []
  const projects: ProductLike[] = []

  for (const item of seed.collections.products) {
    const doc = await upsertBySlug({
      payload,
      collection: 'products',
      slug: item.slug,
      data: item,
    })

    products.push({
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
    })
  }

  for (const item of seed.collections.projects) {
    const doc = await upsertBySlug({
      payload,
      collection: 'projects',
      slug: item.slug,
      data: item,
    })

    projects.push({
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
    })
  }

  for (const item of seed.collections.posts) {
    await upsertBySlug({
      payload,
      collection: 'posts',
      slug: item.slug,
      data: item,
    })
  }

  return {
    productsByTitle: byTitle(products),
    projectsByTitle: byTitle(projects),
  }
}

const normalizeHomePage = (homePage: any, productsByTitle: Map<string, string | number>) => ({
  ...homePage,
  hero: {
    ...homePage.hero,
    points: (homePage.hero?.points || []).map((value: string | { value: string }) =>
      typeof value === 'string' ? { value } : value,
    ),
    metrics: (homePage.hero?.metrics || []).map((item: any) => ({
      ...item,
      badge: item.badge || item.label || '',
    })),
  },
  storefrontSection: {
    ...homePage.storefrontSection,
    items: (homePage.storefrontSection?.items || [])
      .map((item: any) => productsByTitle.get(item.title))
      .filter(Boolean),
  },
})

const normalizeStorefrontPage = (storefrontPage: any, productsByTitle: Map<string, string | number>) => ({
  ...storefrontPage,
  productsSection: {
    ...storefrontPage.productsSection,
    items: (storefrontPage.productsSection?.items || [])
      .map((item: any) => productsByTitle.get(item.title))
      .filter(Boolean),
  },
})

const normalizeProjectsPage = (projectsPage: any, projectsByTitle: Map<string, string | number>) => ({
  ...projectsPage,
  pipeline: {
    ...projectsPage.pipeline,
    items: (projectsPage.pipeline?.items || [])
      .map((item: any) => projectsByTitle.get(item.title))
      .filter(Boolean),
  },
})

const importGlobals = async ({
  payload,
  seed,
  productsByTitle,
  projectsByTitle,
}: {
  payload: any
  seed: SeedData
  productsByTitle: Map<string, string | number>
  projectsByTitle: Map<string, string | number>
}) => {
  const globalsToImport: Record<string, any> = {
    ...seed.globals,
    homePage: normalizeHomePage(seed.globals.homePage, productsByTitle),
    storefrontPage: normalizeStorefrontPage(seed.globals.storefrontPage, productsByTitle),
    projectsPage: normalizeProjectsPage(seed.globals.projectsPage, projectsByTitle),
  }

  for (const [seedKey, globalSlug] of Object.entries(globalSlugMap)) {
    const data = globalsToImport[seedKey]

    if (!data) continue

    await payload.updateGlobal({
      slug: globalSlug,
      data: sanitizeUnresolvedUploads(data),
    })
  }
}

const main = async () => {
  const payload = await getPayload({ config })
  const seed = await loadSeed()

  const { productsByTitle, projectsByTitle } = await importCollections(payload, seed)

  await importGlobals({
    payload,
    seed,
    productsByTitle,
    projectsByTitle,
  })

  console.log('CaribAI seed import complete.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
