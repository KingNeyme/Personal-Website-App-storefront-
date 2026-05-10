import type { ReactNode } from 'react'

import config from '@payload-config'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'

import { importMap } from './admin/importMap'

async function serverFunction(...args: Parameters<typeof handleServerFunctions>) {
  'use server'

  return handleServerFunctions(...args)
}

export default function PayloadLayout({ children }: { children: ReactNode }) {
  return (
    <RootLayout config={Promise.resolve(config)} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
