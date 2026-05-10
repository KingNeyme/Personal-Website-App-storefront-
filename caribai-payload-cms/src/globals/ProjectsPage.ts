import type { GlobalConfig } from 'payload'

import { heroFields, seoFields, simpleCTAFields, summaryItemFields } from '@/fields/shared'

export const ProjectsPage: GlobalConfig = {
  slug: 'projects-page',
  label: 'Projects Page',
  admin: {
    group: 'Pages',
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  fields: [
    { name: 'hero', type: 'group', fields: heroFields() },
    {
      name: 'pipeline',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        {
          name: 'items',
          type: 'relationship',
          relationTo: 'projects',
          hasMany: true,
        },
      ],
    },
    {
      name: 'summary',
      type: 'group',
      fields: [
        {
          name: 'items',
          type: 'array',
          fields: summaryItemFields(),
        },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      fields: simpleCTAFields(),
    },
    {
      name: 'seo',
      type: 'group',
      fields: seoFields(),
    },
  ],
}
