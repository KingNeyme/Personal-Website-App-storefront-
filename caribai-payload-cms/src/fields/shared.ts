import type { Field } from 'payload'

export const linkFields = (): Field[] => [
  { name: 'label', label: 'Label', type: 'text', required: true },
  { name: 'href', label: 'Link', type: 'text', required: true },
]

export const heroFields = (): Field[] => [
  { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  {
    name: 'image',
    label: 'Hero Image',
    type: 'upload',
    relationTo: 'media',
  },
  { name: 'imageAlt', label: 'Hero Image Alt', type: 'text' },
]

export const ctaFields = (): Field[] => [
  ...linkFields(),
  {
    name: 'variant',
    label: 'Variant',
    type: 'select',
    options: ['primary', 'secondary'],
    defaultValue: 'primary',
  },
]

export const badgeCardFields = (): Field[] => [
  { name: 'badge', label: 'Badge', type: 'text' },
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  {
    name: 'image',
    label: 'Image',
    type: 'upload',
    relationTo: 'media',
  },
  { name: 'imageAlt', label: 'Image Alt', type: 'text' },
  {
    name: 'meta',
    label: 'Meta Items',
    type: 'array',
    fields: [{ name: 'value', label: 'Value', type: 'text', required: true }],
  },
  { name: 'featured', label: 'Featured', type: 'checkbox' },
  { name: 'muted', label: 'Muted', type: 'checkbox' },
]

export const summaryItemFields = (): Field[] => [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'status', label: 'Status', type: 'text' },
  {
    name: 'image',
    label: 'Image',
    type: 'upload',
    relationTo: 'media',
  },
  { name: 'imageAlt', label: 'Image Alt', type: 'text' },
]

export const simpleCTAFields = (): Field[] => [
  { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'label', label: 'Button Label', type: 'text', required: true },
  { name: 'href', label: 'Button Link', type: 'text', required: true },
]

export const seoFields = (): Field[] => [
  { name: 'metaTitle', label: 'Meta Title', type: 'text' },
  { name: 'metaDescription', label: 'Meta Description', type: 'textarea' },
  {
    name: 'ogImage',
    label: 'Open Graph Image',
    type: 'upload',
    relationTo: 'media',
  },
]

export const footerColumnFields = (): Field[] => [
  { name: 'heading', label: 'Heading', type: 'text', required: true },
  {
    name: 'links',
    label: 'Links',
    type: 'array',
    fields: linkFields(),
  },
]
