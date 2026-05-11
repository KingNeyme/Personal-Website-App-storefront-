import type { CollectionConfig } from 'payload'

import { seoFields } from '../fields/shared'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    group: 'Business',
    useAsTitle: 'title',
    defaultColumns: ['title', 'lifecycleStatus', 'category'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'badge', type: 'text' },
    { name: 'category', type: 'text' },
    {
      name: 'lifecycleStatus',
      label: 'Lifecycle Status',
      type: 'select',
      options: ['active', 'growing', 'validation', 'future'],
      defaultValue: 'active',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    { name: 'imageAlt', type: 'text' },
    { name: 'summary', type: 'textarea', required: true },
    {
      name: 'meta',
      type: 'array',
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    { name: 'featured', type: 'checkbox' },
    { name: 'muted', type: 'checkbox' },
    {
      name: 'problemSolved',
      type: 'textarea',
    },
    {
      name: 'seo',
      type: 'group',
      fields: seoFields(),
    },
  ],
}
