import type { CollectionConfig } from 'payload'

import { seoFields } from '@/fields/shared'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    group: 'Business',
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'focus'],
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'badge', type: 'text' },
    { name: 'focus', type: 'text' },
    {
      name: 'status',
      type: 'select',
      options: ['active', 'growing', 'focused', 'future'],
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
      name: 'seo',
      type: 'group',
      fields: seoFields(),
    },
  ],
}
