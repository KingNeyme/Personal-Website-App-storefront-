import type { GlobalConfig } from 'payload'

export const CertificationsPage: GlobalConfig = {
  slug: 'certifications-page',
  label: 'Certifications Page',
  admin: {
    group: 'Pages',
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'content',
      type: 'json',
      required: true,
      admin: {
        description: 'Transitional JSON storage for the current certifications page while the richer field model is being built.',
      },
    },
  ],
}
