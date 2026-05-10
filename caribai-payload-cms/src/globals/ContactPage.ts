import type { GlobalConfig } from 'payload'

export const ContactPage: GlobalConfig = {
  slug: 'contact-page',
  label: 'Contact Page',
  admin: {
    group: 'Pages',
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  fields: [
    {
      name: 'content',
      type: 'json',
      required: true,
      admin: {
        description: 'Transitional JSON storage for the current contact page while richer admin-specific fields are being broken out.',
      },
    },
  ],
}
