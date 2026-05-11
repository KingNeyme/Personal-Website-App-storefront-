import type { ReactNode } from 'react'

import config from '@payload-config'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'

import { importMap } from './admin/importMap'

async function serverFunction(args: Parameters<typeof handleServerFunctions>[0]) {
  'use server'

  return handleServerFunctions(args as never)
}

export default function PayloadLayout({ children }: { children: ReactNode }) {
  return (
    <RootLayout
      config={Promise.resolve(config)}
      importMap={importMap}
      serverFunction={serverFunction as never}
    >
      {children}
    </RootLayout>
  )
}
