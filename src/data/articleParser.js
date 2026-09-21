import { parse as parseYaml } from 'yaml'

export const articleCategoryLabels = Object.freeze({
  development: 'DEVELOPMENT',
  research: 'RESEARCH',
})

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/
const frontMatterPattern = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/

function normalizeDate(value) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  const date = String(value ?? '')
  if (!isoDatePattern.test(date)) return null
  const parsed = Date.parse(`${date}T00:00:00Z`)
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === date
    ? date
    : null
}

function categoryFromPath(path) {
  return path.match(/^\/?content\/(development|research)\/[^/]+\.md$/i)?.[1] ?? null
}

function slugFromPath(path) {
  return path.split('/').pop()?.replace(/\.md$/i, '') ?? ''
}

export function parseArticleSource(path, source) {
  const match = String(source ?? '').match(frontMatterPattern)
  if (!match) return null

  try {
    const metadata = parseYaml(match[1])
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
    const category = categoryFromPath(path)
    const slug = slugFromPath(path)
    const date = normalizeDate(metadata.date)
    if (!Array.isArray(metadata.tags) || metadata.tags.some((tag) => (
      typeof tag !== 'string' || !tag.trim()
    ))) return null
    const tags = [...new Set(metadata.tags.map((tag) => tag.trim()))]
    if (metadata.cover !== undefined && (typeof metadata.cover !== 'string'
      || !/^(\/(?!\/)|https?:\/\/)/i.test(metadata.cover.trim()))) return null

    if (!category || !slug || !date || typeof metadata.title !== 'string' || !metadata.title.trim()
      || typeof metadata.summary !== 'string' || !metadata.summary.trim()) {
      return null
    }

    return Object.freeze({
      slug,
      category,
      categoryLabel: articleCategoryLabels[category],
      title: metadata.title.trim(),
      date,
      summary: metadata.summary.trim(),
      tags: Object.freeze(tags),
      cover: typeof metadata.cover === 'string' && metadata.cover.trim()
        ? metadata.cover.trim()
        : null,
      content: match[2].trim(),
      href: `/${category}/articles/${encodeURIComponent(slug)}`,
    })
  } catch {
    return null
  }
}
