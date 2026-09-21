import { articleCategoryLabels, parseArticleSource } from './articleParser'

const rawModules = {
  ...import.meta.glob('/content/development/*.md', {
    eager: true,
    import: 'default',
    query: '?raw',
  }),
  ...import.meta.glob('/content/research/*.md', {
    eager: true,
    import: 'default',
    query: '?raw',
  }),
}

const articleRecords = Object.freeze(
  Object.entries(rawModules)
    .map(([path, source]) => parseArticleSource(path, source))
    .filter(Boolean)
    .sort((left, right) => right.date.localeCompare(left.date)),
)

export function isArticleCategory(category) {
  return Object.hasOwn(articleCategoryLabels, category)
}

export function getCategoryLabel(category) {
  return articleCategoryLabels[category] ?? ''
}

export function getArticlesByCategory(category) {
  if (!isArticleCategory(category)) return []
  return articleRecords.filter((article) => article.category === category)
}

export function getLatestArticles(category, limit = 2) {
  return getArticlesByCategory(category).slice(0, Math.max(0, limit))
}

export function getArticle(category, slug) {
  return articleRecords.find((article) => (
    article.category === category && article.slug === slug
  )) ?? null
}

export function getAdjacentArticles(category, slug) {
  const articles = getArticlesByCategory(category)
  const index = articles.findIndex((article) => article.slug === slug)
  if (index < 0) return { previous: null, next: null }
  return {
    previous: articles[index + 1] ?? null,
    next: articles[index - 1] ?? null,
  }
}
