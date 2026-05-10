import type { GlobalConfig } from 'payload'

import { badgeCardFields, heroFields, seoFields, simpleCTAFields, summaryItemFields } from '@/fields/shared'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'About Page',
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
      name: 'identity',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    {
      name: 'values',
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
      name: 'structure',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        {
          name: 'items',
          type: 'array',
          fields: badgeCardFields(),
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
