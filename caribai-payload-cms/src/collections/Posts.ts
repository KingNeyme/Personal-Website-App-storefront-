import type { CollectionConfig } from 'payload'

import { seoFields } from '../fields/shared'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Journal Entry',
    plural: 'Journal',
  },
  admin: {
    group: 'Publishing',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'featured', 'publishedAt'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'category', type: 'text', required: true },
    { name: 'featured', type: 'checkbox' },
    { name: 'excerpt', type: 'textarea', required: true },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'coverVideo',
      type: 'text',
    },
    { name: 'body', type: 'textarea', required: true },
    {
      name: 'publishedAt',
      label: 'Publish Date',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
      required: true,
    },
    {
      name: 'seo',
      type: 'group',
      fields: seoFields(),
    },
  ],
}
