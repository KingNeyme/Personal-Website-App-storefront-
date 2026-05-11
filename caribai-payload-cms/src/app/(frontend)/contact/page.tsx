import type { Metadata } from 'next'

import type { ContactPage } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

type ContactContent = {
  hero: {
    eyebrow?: string | null
    title: string
    description: string
  }
  info: {
    title: string
    items?: string[]
    boxes?: Array<{
      title: string
      description: string
      href?: string | null
    }>
  }
  form: {
    buttonLabel?: string | null
    note?: string | null
    topicPlaceholder?: string | null
    messagePlaceholder?: string | null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({
    slug: 'contact-page',
    depth: 1,
  })
  const content = page.content as ContactContent

  return {
    title: 'Contact',
    description: content.hero.description,
  }
}

export default async function ContactRoute() {
  const payload = await getPayloadClient()
  const page = (await payload.findGlobal({
    slug: 'contact-page',
    depth: 2,
  })) as ContactPage
  const content = page.content as ContactContent

  const bestFits = content.info.items || []
  const boxes = content.info.boxes || []

  return (
    <main>
      <section className="page-hero">
        <div className="shell">
          <div className="page-hero__panel">
            <p className="section-eyebrow">{content.hero.eyebrow}</p>
            <h1>{content.hero.title}</h1>
            <p className="page-hero__lede">{content.hero.description}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell contact-grid">
          <article className="card">
            <p className="section-eyebrow">Connect</p>
            <h2>{content.info.title}</h2>
            <ul className="contact-list">
              {bestFits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <div className="value-grid value-grid--stacked">
            {boxes.map((box) => (
              <article key={box.title} className="card card--subtle">
                <h3>{box.title}</h3>
                {box.href ? (
                  <p>
                    <a href={box.href}>{box.description}</a>
                  </p>
                ) : (
                  <p>{box.description}</p>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--compact">
        <div className="shell">
          <section className="lead-panel">
            <div>
              <p className="section-eyebrow">Inquiry Flow</p>
              <h2>{content.form.buttonLabel || 'Send Inquiry'}</h2>
              <p className="section-copy">{content.form.note}</p>
            </div>
            <form
              className="contact-form"
              action="mailto:caribailabs@gmail.com"
              method="post"
              encType="text/plain"
            >
              <input
                className="input"
                type="text"
                name="topic"
                placeholder={content.form.topicPlaceholder || 'Topic'}
              />
              <textarea
                className="input input--area"
                name="message"
                placeholder={content.form.messagePlaceholder || 'Message'}
              />
              <button className="button button--primary" type="submit">
                {content.form.buttonLabel || 'Send Inquiry'}
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  )
}
