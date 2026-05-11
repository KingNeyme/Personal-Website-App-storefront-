import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'

import { Media } from './src/collections/Media'
import { Posts } from './src/collections/Posts'
import { Products } from './src/collections/Products'
import { Projects } from './src/collections/Projects'
import { Users } from './src/collections/Users'
import { AboutPage } from './src/globals/AboutPage'
import { CertificationsPage } from './src/globals/CertificationsPage'
import { ContactPage } from './src/globals/ContactPage'
import { HomePage } from './src/globals/HomePage'
import { JournalPage } from './src/globals/JournalPage'
import { JourneyPage } from './src/globals/JourneyPage'
import { ProjectsPage } from './src/globals/ProjectsPage'
import { SiteSettings } from './src/globals/SiteSettings'
import { StorefrontPage } from './src/globals/StorefrontPage'
import { TechStackPage } from './src/globals/TechStackPage'

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
