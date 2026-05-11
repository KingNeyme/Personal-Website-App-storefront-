import type { Media } from '@/payload-types'

type MediaLike = Media | number | null | string | undefined
type UnknownMedia = MediaLike | unknown

export function isMediaDoc(value: UnknownMedia): value is Media {
  return typeof value === 'object' && value !== null
}

export function normalizeAssetPath(value: string) {
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }

  if (value.startsWith('/')) {
    return value
  }

  if (value.startsWith('assets/graphics/')) {
    return `/${value.replace(/^assets\//, '')}`
  }

  if (value.startsWith('assets/')) {
    return `/${value.replace(/^assets\//, '')}`
  }

  return value
}

export function resolveMediaURL(value: UnknownMedia) {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    return normalizeAssetPath(value)
  }

  if (!isMediaDoc(value)) {
    return null
  }

  if (value.url) {
    return normalizeAssetPath(value.url)
  }

  if (value.filename) {
    return `/${value.filename}`
  }

  return null
}

export function resolveMediaAlt(value: UnknownMedia, fallback: string) {
  if (isMediaDoc(value) && value.alt) {
    return value.alt
  }

  return fallback
}
