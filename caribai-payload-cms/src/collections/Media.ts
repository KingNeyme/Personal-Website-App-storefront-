import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media Asset',
    plural: 'Media Library',
  },
  upload: true,
  admin: {
    group: 'Publishing',
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
    {
      name: 'category',
      type: 'select',
      options: ['brand', 'hero', 'product', 'project', 'post', 'general'],
      defaultValue: 'general',
    },
  ],
}
