import './globals.css'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: {
    default: 'CaribAI',
    template: '%s | CaribAI',
  },
  description:
    'CaribAI builds intelligent systems, digital infrastructure, and practical AI products shaped for real-world execution.',
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
