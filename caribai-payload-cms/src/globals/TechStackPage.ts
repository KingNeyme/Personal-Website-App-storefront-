import type { GlobalConfig } from 'payload'

import { heroFields, seoFields, simpleCTAFields, summaryItemFields } from '@/fields/shared'

const toolFields = [
  { name: 'title', type: 'text', required: true },
  { name: 'label', type: 'text' },
  { name: 'logo', type: 'text' },
  { name: 'description', type: 'textarea', required: true },
]

export const TechStackPage: GlobalConfig = {
  slug: 'tech-stack-page',
  label: 'Tech Stack Page',
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
      name: 'primary',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        {
          name: 'items',
          type: 'array',
          fields: toolFields,
        },
      ],
    },
    {
      name: 'secondary',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        {
          name: 'items',
          type: 'array',
          fields: toolFields,
        },
      ],
    },
    {
      name: 'support',
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
