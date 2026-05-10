import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const repoRoot = path.resolve(dirname, '..', '..')
const outputPath = path.join(dirname, '..', 'src', 'seed', 'caribai-media-manifest.json')

const localAssetRoots = [
  path.join(repoRoot, 'assets'),
  path.join(repoRoot, 'assets', 'graphics'),
]

const contentFiles = [
  path.join(repoRoot, 'content', 'site', 'home.json'),
  path.join(repoRoot, 'content', 'site', 'about.json'),
  path.join(repoRoot, 'content', 'site', 'storefront.json'),
  path.join(repoRoot, 'content', 'site', 'projects.json'),
  path.join(repoRoot, 'content', 'site', 'journey.json'),
  path.join(repoRoot, 'content', 'site', 'tech-stack.json'),
  path.join(repoRoot, 'content', 'site', 'certifications.json'),
  path.join(repoRoot, 'content', 'site', 'contact.json'),
  path.join(repoRoot, 'content', 'blog', 'posts.json'),
]

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name)

      if (entry.isDirectory()) return walk(entryPath)
      if (!entry.isFile()) return []

      return [entryPath]
    }),
  )

  return files.flat()
}

const gatherLocalAssets = async () => {
  const files = await Promise.all(localAssetRoots.map((root) => walk(root)))
  const uniquePaths = Array.from(
    new Set(files.flat().filter((filePath) => /\.(svg|png|jpe?g|webp|gif)$/i.test(filePath))),
  )

  return uniquePaths.map((filePath) => ({
      type: 'local',
      filePath: path.relative(repoRoot, filePath),
    }))
}

const gatherReferencedUrls = async () => {
  const rawFiles = await Promise.all(contentFiles.map((filePath) => fs.readFile(filePath, 'utf8')))
  const urlPattern = /https?:\/\/[^\s"]+/g
  const urls = new Set()

  rawFiles.forEach((raw) => {
    const matches = raw.match(urlPattern) || []
    matches.forEach((match) => urls.add(match))
  })

  return Array.from(urls).sort().map((url) => ({
    type: 'remote',
    url,
  }))
}

const main = async () => {
  const [localAssets, remoteAssets] = await Promise.all([gatherLocalAssets(), gatherReferencedUrls()])

  const manifest = {
    generatedAt: new Date().toISOString(),
    summary: {
      localAssetCount: localAssets.length,
      remoteAssetCount: remoteAssets.length,
    },
    localAssets,
    remoteAssets,
  }

  await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2))
  console.log(`Wrote media manifest to ${outputPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
