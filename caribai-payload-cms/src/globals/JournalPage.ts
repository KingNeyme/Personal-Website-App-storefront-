import type { GlobalConfig } from 'payload'

import { heroFields, seoFields, simpleCTAFields, summaryItemFields } from '@/fields/shared'

export const JournalPage: GlobalConfig = {
  slug: 'journal-page',
  label: 'Journal Page',
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
      name: 'editorial',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    {
      name: 'featured',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'title', type: 'text', required: true },
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
