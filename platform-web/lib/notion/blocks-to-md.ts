import type { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'

type RichTextItem = {
  plain_text: string
  annotations?: {
    bold?: boolean
    italic?: boolean
    code?: boolean
    strikethrough?: boolean
  }
  href?: string | null
}

function richTextToMd(richTexts: RichTextItem[]): string {
  return richTexts
    .map((rt) => {
      let text = rt.plain_text
      if (rt.annotations?.code) text = `\`${text}\``
      if (rt.annotations?.bold) text = `**${text}**`
      if (rt.annotations?.italic) text = `*${text}*`
      if (rt.annotations?.strikethrough) text = `~~${text}~~`
      if (rt.href) text = `[${text}](${rt.href})`
      return text
    })
    .join('')
}

const LIST_TYPES = new Set(['bulleted_list_item', 'numbered_list_item'])

export function blocksToMarkdown(
  blocks: BlockObjectResponse[],
  childrenMap?: Map<string, BlockObjectResponse[]>
): string {
  const lines: string[] = []
  let numberedListCounter = 0
  let prevType: string | null = null

  for (const block of blocks) {
    const type = block.type

    // Insert blank line when transitioning out of a list so the next paragraph
    // is not parsed as a lazy continuation of the last list item (CommonMark spec).
    if (LIST_TYPES.has(prevType ?? '') && !LIST_TYPES.has(type)) {
      lines.push('')
    }

    // Reset numbered list counter when we encounter a non-numbered-list block
    if (type !== 'numbered_list_item') {
      numberedListCounter = 0
    }

    switch (type) {
      case 'paragraph': {
        const b = block as Extract<BlockObjectResponse, { type: 'paragraph' }>
        const text = richTextToMd(b.paragraph.rich_text as RichTextItem[])
        lines.push(text || '')
        lines.push('')
        break
      }
      case 'heading_1': {
        const b = block as Extract<BlockObjectResponse, { type: 'heading_1' }>
        const text = richTextToMd(b.heading_1.rich_text as RichTextItem[])
        lines.push(`# ${text}`)
        lines.push('')
        break
      }
      case 'heading_2': {
        const b = block as Extract<BlockObjectResponse, { type: 'heading_2' }>
        const text = richTextToMd(b.heading_2.rich_text as RichTextItem[])
        lines.push(`## ${text}`)
        lines.push('')
        break
      }
      case 'heading_3': {
        const b = block as Extract<BlockObjectResponse, { type: 'heading_3' }>
        const text = richTextToMd(b.heading_3.rich_text as RichTextItem[])
        lines.push(`### ${text}`)
        lines.push('')
        break
      }
      case 'bulleted_list_item': {
        const b = block as Extract<BlockObjectResponse, { type: 'bulleted_list_item' }>
        const text = richTextToMd(b.bulleted_list_item.rich_text as RichTextItem[])
        lines.push(`- ${text}`)
        // Render child blocks (e.g. description paragraphs) indented inside the list item
        const bulletChildren = childrenMap?.get(block.id) ?? []
        for (const child of bulletChildren) {
          if (child.type === 'paragraph') {
            const cb = child as Extract<BlockObjectResponse, { type: 'paragraph' }>
            const childText = richTextToMd(cb.paragraph.rich_text as RichTextItem[])
            if (childText) {
              lines.push('')
              lines.push(`  ${childText}`)
            }
          }
        }
        break
      }
      case 'numbered_list_item': {
        const b = block as Extract<BlockObjectResponse, { type: 'numbered_list_item' }>
        const text = richTextToMd(b.numbered_list_item.rich_text as RichTextItem[])
        numberedListCounter++
        lines.push(`${numberedListCounter}. ${text}`)
        // Render child blocks indented inside the list item
        const numberedChildren = childrenMap?.get(block.id) ?? []
        for (const child of numberedChildren) {
          if (child.type === 'paragraph') {
            const cb = child as Extract<BlockObjectResponse, { type: 'paragraph' }>
            const childText = richTextToMd(cb.paragraph.rich_text as RichTextItem[])
            if (childText) {
              lines.push('')
              lines.push(`   ${childText}`)
            }
          }
        }
        break
      }
      case 'code': {
        const b = block as Extract<BlockObjectResponse, { type: 'code' }>
        const text = richTextToMd(b.code.rich_text as RichTextItem[])
        const lang = b.code.language ?? ''
        lines.push(`\`\`\`${lang}`)
        lines.push(text)
        lines.push('```')
        lines.push('')
        break
      }
      case 'quote': {
        const b = block as Extract<BlockObjectResponse, { type: 'quote' }>
        const text = richTextToMd(b.quote.rich_text as RichTextItem[])
        lines.push(`> ${text}`)
        lines.push('')
        break
      }
      case 'divider': {
        lines.push('---')
        lines.push('')
        break
      }
      case 'image': {
        const b = block as Extract<BlockObjectResponse, { type: 'image' }>
        const url =
          b.image.type === 'external' ? b.image.external.url : b.image.file.url
        const caption =
          b.image.caption && b.image.caption.length > 0
            ? richTextToMd(b.image.caption as RichTextItem[])
            : 'image'
        lines.push(`![${caption}](${url})`)
        lines.push('')
        break
      }
      case 'table': {
        const rows = childrenMap?.get(block.id) ?? []
        if (rows.length === 0) break
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i] as Extract<BlockObjectResponse, { type: 'table_row' }>
          if (row.type !== 'table_row') continue
          const cells = row.table_row.cells.map((cell) =>
            richTextToMd(cell as RichTextItem[]).replace(/\|/g, '\\|')
          )
          lines.push('| ' + cells.join(' | ') + ' |')
          if (i === 0) {
            lines.push('| ' + cells.map(() => '---').join(' | ') + ' |')
          }
        }
        lines.push('')
        break
      }
      default:
        break
    }

    prevType = type
  }

  return lines.join('\n').trimEnd()
}
