import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'

import { Media } from '@/collections/Media'
import { Posts } from '@/collections/Posts'
import { Products } from '@/collections/Products'
import { Projects } from '@/collections/Projects'
import { Users } from '@/collections/Users'
import { AboutPage } from '@/globals/AboutPage'
import { CertificationsPage } from '@/globals/CertificationsPage'
import { ContactPage } from '@/globals/ContactPage'
import { HomePage } from '@/globals/HomePage'
import { JournalPage } from '@/globals/JournalPage'
import { JourneyPage } from '@/globals/JourneyPage'
import { ProjectsPage } from '@/globals/ProjectsPage'
import { SiteSettings } from '@/globals/SiteSettings'
import { StorefrontPage } from '@/globals/StorefrontPage'
import { TechStackPage } from '@/globals/TechStackPage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'replace-me-in-env',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname, './src/app/(payload)'),
      importMapFile: path.resolve(dirname, './src/app/(payload)/admin/importMap.js'),
    },
  },
  editor: lexicalEditor(),
  collections: [Users, Media, Posts, Products, Projects],
  globals: [
    SiteSettings,
    HomePage,
    AboutPage,
    JournalPage,
    StorefrontPage,
    ProjectsPage,
    JourneyPage,
    TechStackPage,
    CertificationsPage,
    ContactPage,
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./caribai.db',
    },
  }),
})
