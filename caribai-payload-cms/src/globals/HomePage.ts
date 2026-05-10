import type { GlobalConfig } from 'payload'

import { badgeCardFields, ctaFields, heroFields, seoFields, simpleCTAFields, summaryItemFields } from '@/fields/shared'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home Page',
  admin: {
    group: 'Pages',
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        ...heroFields(),
        {
          name: 'actions',
          type: 'array',
          fields: ctaFields(),
        },
        {
          name: 'points',
          type: 'array',
          fields: [{ name: 'value', type: 'text', required: true }],
        },
        {
          name: 'metrics',
          type: 'array',
          fields: badgeCardFields(),
        },
      ],
    },
    {
      name: 'positioning',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    {
      name: 'structure',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        {
          name: 'items',
          type: 'array',
          fields: badgeCardFields(),
        },
      ],
    },
    {
      name: 'storefrontSection',
      label: 'Storefront Section',
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
      name: 'buildSection',
      label: 'What We Build',
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
      name: 'businessModel',
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
      name: 'execution',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'title', type: 'text', required: true },
        {
          name: 'link',
          type: 'group',
          fields: simpleCTAFields().slice(3),
        },
        {
          name: 'items',
          type: 'array',
          fields: summaryItemFields(),
        },
      ],
    },
    {
      name: 'lens',
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
      name: 'growthHub',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea', required: true },
            { name: 'href', type: 'text', required: true },
            { name: 'linkLabel', type: 'text', required: true },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
            },
            { name: 'imageAlt', type: 'text' },
          ],
        },
      ],
    },
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
      name: 'contactCTA',
      label: 'Contact CTA',
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
