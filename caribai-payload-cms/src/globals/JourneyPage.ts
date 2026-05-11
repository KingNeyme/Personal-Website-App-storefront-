import type { GlobalConfig } from 'payload'

import { heroFields, seoFields, simpleCTAFields, summaryItemFields } from '../fields/shared'

export const JourneyPage: GlobalConfig = {
  slug: 'journey-page',
  label: 'Journey Page',
  admin: {
    group: 'Pages',
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: 'hero', type: 'group', fields: heroFields() },
    {
      name: 'focus',
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
      name: 'documentation',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        {
          name: 'items',
          type: 'array',
          fields: summaryItemFields(),
        },
      ],
    },
    {
      name: 'future',
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
