const MARKDOWN_TYPES = new Set(['text/markdown', 'text/x-markdown', 'text/plain'])
const HTML_TYPES = new Set(['text/html', 'application/xhtml+xml'])

/**
 * True when the Accept header ranks a Markdown/plain-text type above HTML.
 * Ties go to whichever was listed first; wildcards fall through to HTML.
 */
export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false
  let md = { q: 0, pos: Infinity }
  let html = { q: 0, pos: Infinity }

  accept.split(',').forEach((part, pos) => {
    const [type, ...params] = part.trim().toLowerCase().split(';')
    const qParam = params.map((p) => p.trim()).find((p) => p.startsWith('q='))
    const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1
    if (!(q > 0)) return
    const media = type.trim()
    if (MARKDOWN_TYPES.has(media) && q > md.q) md = { q, pos }
    if (HTML_TYPES.has(media) && q > html.q) html = { q, pos }
  })

  if (md.q === 0) return false
  return md.q > html.q || (md.q === html.q && md.pos < html.pos)
}
