import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import type { Metadata } from 'next'

import { importMap } from '../importMap'

type Args = {
  params: Promise<{ segments?: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

type PayloadSearchParams = Promise<Record<string, string | string[]>>

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({
    config: Promise.resolve(config),
    params,
    searchParams: searchParams as PayloadSearchParams,
  })

export default function PayloadAdminPage({ params, searchParams }: Args) {
  return (
    <RootPage
      config={Promise.resolve(config)}
      importMap={importMap}
      params={params as Promise<{ segments: string[] }>}
      searchParams={searchParams as PayloadSearchParams}
    />
  )
}
