import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import type { Post } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import { renderMarkdownLite } from '@/lib/rich-text'

type Params = {
  slug: string
}

async function getPost(slug: string): Promise<Post | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return (result.docs[0] as Post | undefined) || null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return {
      title: 'Journal',
    }
  }

  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export default async function JournalEntryRoute({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <main>
      <section className="page-hero page-hero--entry">
        <div className="shell narrow-shell">
          <div className="page-hero__panel">
            <p className="section-eyebrow">{post.category}</p>
            <h1>{post.title}</h1>
            <p className="page-hero__lede">{post.excerpt}</p>
            <div className="journal-card__meta">
              <span>{formatDate(post.publishedAt)}</span>
              {post.featured ? <span>Featured</span> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--compact">
        <div className="shell narrow-shell">
          <Link className="back-link" href="/journal">
            Back to journal
          </Link>
          <article className="card prose-card">
            <div className="prose">{renderMarkdownLite(post.body)}</div>
          </article>
        </div>
      </section>
    </main>
  )
}
