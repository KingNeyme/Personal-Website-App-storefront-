import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Admin User',
    plural: 'Users',
  },
  admin: {
    group: 'Operations',
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'updatedAt'],
  },
  auth: true,
  fields: [
    {
      name: 'role',
      type: 'select',
      defaultValue: 'admin',
      options: ['admin', 'editor'],
      required: true,
    },
    {
      name: 'displayName',
      type: 'text',
    },
  ],
}
