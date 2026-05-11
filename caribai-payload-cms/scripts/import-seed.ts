import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload } from 'payload'

import config from '../payload.config'

const env = process.env as Record<string, string | undefined>

if (!env.NODE_ENV) {
  env.NODE_ENV = 'production'
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const seedPath = path.join(dirname, '..', 'src', 'seed', 'caribai-seed.json')
const mediaManifestPath = path.join(dirname, '..', 'src', 'seed', 'caribai-media-manifest.json')
const workspaceRoot = path.join(dirname, '..', '..')

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

type MediaManifest = {
  localAssets: {
    filePath: string
  }[]
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

const loadMediaManifest = async (): Promise<MediaManifest> => {
  const raw = await fs.readFile(mediaManifestPath, 'utf8')
  return JSON.parse(raw)
}

const uploadFieldNames = new Set(['image', 'coverImage', 'logo', 'ogImage'])

const normalizeAssetKey = (value: string) => value.replace(/\\/g, '/')

const isRemoteAsset = (value: string) => /^https?:\/\//i.test(value)

const inferMediaCategory = (filePath: string) => {
  if (filePath.includes('logo')) return 'brand'
  if (filePath.includes('cyber-ascend') || filePath.includes('ai-toolkit') || filePath.includes('resume-kit')) {
    return 'product'
  }
  if (filePath.includes('caribai-apps')) return 'project'
  return 'general'
}

const inferMediaAlt = (filePath: string) =>
  path
    .basename(filePath, path.extname(filePath))
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

const upsertLocalMediaAssets = async (payload: any) => {
  const manifest = await loadMediaManifest()
  const assetMap = new Map<string, number>()

  for (const asset of manifest.localAssets || []) {
    const normalizedPath = normalizeAssetKey(asset.filePath)
    const absolutePath = path.join(workspaceRoot, normalizedPath)
    const filename = path.basename(normalizedPath)

    const existing = await payload.find({
      collection: 'media',
      where: {
        filename: {
          equals: filename,
        },
      },
      limit: 1,
      pagination: false,
    })

    if (existing.docs?.[0]) {
      assetMap.set(normalizedPath, existing.docs[0].id)
      continue
    }

    const created = await payload.create({
      collection: 'media',
      data: {
        alt: inferMediaAlt(normalizedPath),
        category: inferMediaCategory(normalizedPath),
      },
      filePath: absolutePath,
    })

    assetMap.set(normalizedPath, created.id)
  }

  return assetMap
}

const sanitizeUnresolvedUploads = (
  value: unknown,
  assetMap: Map<string, number>,
): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeUnresolvedUploads(item, assetMap))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([key, entry]) => {
          if (uploadFieldNames.has(key) && typeof entry === 'string') {
            const assetKey = normalizeAssetKey(entry)

            if (assetMap.has(assetKey)) {
              return [key, assetMap.get(assetKey)]
            }

            if (key === 'logo') {
              return [key, isRemoteAsset(entry) ? entry : null]
            }

            return [key, null]
          }

          return [key, sanitizeUnresolvedUploads(entry, assetMap)]
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
  assetMap,
}: {
  payload: any
  collection: 'posts' | 'products' | 'projects'
  slug: string
  data: Record<string, unknown>
  assetMap: Map<string, number>
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
      data: sanitizeUnresolvedUploads(data, assetMap),
    })
  }

  return payload.create({
    collection,
    data: sanitizeUnresolvedUploads(data, assetMap),
  })
}

const normalizeProductSeed = (item: Record<string, unknown>) => {
  const { status, ...rest } = item

  return {
    ...rest,
    lifecycleStatus: status,
  }
}

const normalizeProjectSeed = (item: Record<string, unknown>) => {
  const { status, ...rest } = item

  return {
    ...rest,
    lifecycleStatus: status,
  }
}

const importCollections = async (
  payload: any,
  seed: SeedData,
  assetMap: Map<string, number>,
) => {
  const products: ProductLike[] = []
  const projects: ProductLike[] = []

  for (const item of seed.collections.products) {
    const doc = await upsertBySlug({
      payload,
      collection: 'products',
      slug: item.slug,
      data: normalizeProductSeed(item),
      assetMap,
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
      data: normalizeProjectSeed(item),
      assetMap,
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
      assetMap,
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
  assetMap,
}: {
  payload: any
  seed: SeedData
  productsByTitle: Map<string, string | number>
  projectsByTitle: Map<string, string | number>
  assetMap: Map<string, number>
}) => {
  const siteSettings = seed.globals.siteSettings || {}
  const globalsToImport: Record<string, any> = {
    ...seed.globals,
    siteSettings: {
      ...siteSettings,
      brand: {
        ...siteSettings.brand,
        logo:
          siteSettings.brand?.logo ||
          assetMap.get('assets/CariAI-LOGO-Transparent.png') ||
          null,
      },
    },
    homePage: normalizeHomePage(seed.globals.homePage, productsByTitle),
    storefrontPage: normalizeStorefrontPage(seed.globals.storefrontPage, productsByTitle),
    projectsPage: normalizeProjectsPage(seed.globals.projectsPage, projectsByTitle),
  }

  for (const [seedKey, globalSlug] of Object.entries(globalSlugMap)) {
    const data = globalsToImport[seedKey]

    if (!data) continue

    await payload.updateGlobal({
      slug: globalSlug,
      data: sanitizeUnresolvedUploads(data, assetMap),
    })
  }
}

const main = async () => {
  const payload = await getPayload({ config })
  const seed = await loadSeed()
  const assetMap = await upsertLocalMediaAssets(payload)

  const { productsByTitle, projectsByTitle } = await importCollections(
    payload,
    seed,
    assetMap,
  )

  await importGlobals({
    payload,
    seed,
    productsByTitle,
    projectsByTitle,
    assetMap,
  })

  console.log('CaribAI seed import complete.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
