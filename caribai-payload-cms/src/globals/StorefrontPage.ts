import type { GlobalConfig } from 'payload'

import { heroFields, seoFields, simpleCTAFields, summaryItemFields } from '@/fields/shared'

export const StorefrontPage: GlobalConfig = {
  slug: 'storefront-page',
  label: 'Storefront Page',
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
      name: 'productsSection',
      label: 'Products Section',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        {
          name: 'items',
          type: 'relationship',
          relationTo: 'products',
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
      name: 'lead',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'buttonLabel', type: 'text' },
        { name: 'successMessage', type: 'textarea' },
        { name: 'note', type: 'textarea' },
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
