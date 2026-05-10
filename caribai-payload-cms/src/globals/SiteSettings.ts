import type { GlobalConfig } from 'payload'

import { footerColumnFields, linkFields } from '@/fields/shared'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Platform',
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  fields: [
    {
      name: 'brand',
      type: 'group',
      fields: [
        { name: 'brandName', type: 'text', defaultValue: 'CaribAI', required: true },
        { name: 'legalName', type: 'text', defaultValue: 'CaribAI Labs' },
        { name: 'tagline', type: 'text', defaultValue: 'AI Engineering • Intelligent Systems • Digital Infrastructure' },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'business',
      type: 'group',
      fields: [
        { name: 'siteUrl', type: 'text', defaultValue: 'https://caribailabs.vercel.app' },
        { name: 'supportEmail', type: 'email', defaultValue: 'caribailabs@gmail.com' },
        { name: 'primaryLocation', type: 'text', defaultValue: 'St. Lucia, Caribbean' },
      ],
    },
    {
      name: 'primaryNavigation',
      type: 'array',
      fields: linkFields(),
    },
    {
      name: 'headerAction',
      type: 'group',
      fields: linkFields(),
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: linkFields(),
    },
    {
      name: 'footerColumns',
      type: 'array',
      fields: footerColumnFields(),
    },
    {
      name: 'footerMeta',
      type: 'group',
      fields: [
        { name: 'headline', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'copyrightText', type: 'text' },
      ],
    },
    {
      name: 'seoDefaults',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
