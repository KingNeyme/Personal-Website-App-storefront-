import type { ReactNode } from 'react'

function flushParagraph(
  blocks: ReactNode[],
  paragraph: string[],
  key: string,
) {
  if (!paragraph.length) {
    return
  }

  blocks.push(<p key={key}>{paragraph.join(' ')}</p>)
  paragraph.length = 0
}

function flushList(
  blocks: ReactNode[],
  listItems: string[],
  key: string,
) {
  if (!listItems.length) {
    return
  }

  blocks.push(
    <ul key={key}>
      {listItems.map((item) => (
        <li key={`${key}-${item}`}>{item}</li>
      ))}
    </ul>,
  )
  listItems.length = 0
}

export function renderMarkdownLite(markdown?: string | null): ReactNode[] {
  if (!markdown) {
    return []
  }

  const lines = markdown.split('\n')
  const blocks: ReactNode[] = []
  const paragraph: string[] = []
  const listItems: string[] = []

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim()

    if (!line) {
      flushParagraph(blocks, paragraph, `paragraph-${index}`)
      flushList(blocks, listItems, `list-${index}`)
      return
    }

    if (line.startsWith('## ')) {
      flushParagraph(blocks, paragraph, `paragraph-${index}`)
      flushList(blocks, listItems, `list-${index}`)
      blocks.push(<h2 key={`heading-${index}`}>{line.replace(/^##\s+/, '')}</h2>)
      return
    }

    if (line.startsWith('- ')) {
      flushParagraph(blocks, paragraph, `paragraph-${index}`)
      listItems.push(line.replace(/^- /, ''))
      return
    }

    flushList(blocks, listItems, `list-${index}`)
    paragraph.push(line)
  })

  flushParagraph(blocks, paragraph, 'paragraph-final')
  flushList(blocks, listItems, 'list-final')

  return blocks
}
