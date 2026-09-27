<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import ArticleMarkdown from '../components/articles/ArticleMarkdown.vue'
import ArticlePageShell from '../components/articles/ArticlePageShell.vue'
import { getAdjacentArticles, getArticle, getCategoryLabel } from '../data/articles'

const props = defineProps({
  category: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
})

const categoryLabel = computed(() => getCategoryLabel(props.category))
const article = computed(() => getArticle(props.category, props.slug))
const adjacent = computed(() => getAdjacentArticles(props.category, props.slug))
const archivePath = computed(() => `/${props.category}/articles`)
</script>

<template>
  <ArticlePageShell :category="category">
    <article v-if="article" class="article-detail">
      <RouterLink class="article-detail__archive-link" :to="archivePath">
        {{ categoryLabel }} WRITINGS
      </RouterLink>
      <header class="article-detail__header">
        <p>{{ article.date }} / {{ categoryLabel }}</p>
        <h1>{{ article.title }}</h1>
        <p class="article-detail__summary">{{ article.summary }}</p>
        <div v-if="article.tags.length" class="article-detail__tags">
          <span v-for="tag in article.tags" :key="tag">#{{ tag }}</span>
        </div>
      </header>

      <img v-if="article.cover" class="article-detail__cover" :src="article.cover" :alt="article.title" />

      <ArticleMarkdown class="article-detail__content" :source="article.content" />

      <nav class="article-detail__adjacent" aria-label="Adjacent articles">
        <RouterLink v-if="adjacent.previous" :to="adjacent.previous.href">
          <span>PREVIOUS</span>
          <strong>{{ adjacent.previous.title }}</strong>
        </RouterLink>
        <RouterLink v-if="adjacent.next" :to="adjacent.next.href">
          <span>NEXT</span>
          <strong>{{ adjacent.next.title }}</strong>
        </RouterLink>
      </nav>
    </article>

    <section v-else class="article-not-found">
      <p>{{ categoryLabel }} WRITINGS</p>
      <h1>ARTICLE<br>NOT FOUND</h1>
      <RouterLink :to="archivePath">RETURN TO WRITINGS</RouterLink>
    </section>
  </ArticlePageShell>
</template>

<style scoped>
.article-detail {
  width: min(720px, 100%);
  margin: 0 auto;
}

.article-detail__archive-link,
.article-detail__header > p:first-child,
.article-detail__tags,
.article-detail__adjacent span,
.article-not-found > p,
.article-not-found a {
  font-family: var(--font-ui);
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.article-detail__archive-link,
.article-not-found a {
  color: var(--color-gold);
}

.article-detail__header {
  margin-top: 54px;
  padding-bottom: 48px;
  border-bottom: 1px solid rgba(222, 222, 239, 0.14);
}

.article-detail__header > p:first-child {
  color: var(--color-gold);
}

.article-detail h1,
.article-not-found h1 {
  margin: 22px 0 0;
  font-family: var(--font-serif-cn);
  overflow-wrap: anywhere;
  font-size: clamp(30px, 4.2vw, 52px);
  font-weight: 400;
  letter-spacing: 0.025em;
  line-height: 1.18;
}

.article-detail__summary {
  margin: 28px 0 0;
  color: var(--color-muted);
  font-family: var(--font-serif-cn);
  font-size: 18px;
  line-height: 1.75;
}

.article-detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 24px;
  color: #9a86ef;
}

.article-detail__cover {
  display: block;
  width: 100%;
  max-height: 480px;
  object-fit: contain;
  margin-top: 36px;
  border-radius: 10px;
}

.article-detail__content {
  margin-top: 52px;
}

.article-detail__adjacent {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 72px;
  padding-top: 28px;
  border-top: 1px solid rgba(222, 222, 239, 0.14);
}

.article-detail__adjacent a {
  display: grid;
  gap: 8px;
  color: var(--color-muted);
}

.article-detail__adjacent a:last-child {
  text-align: right;
}

.article-detail__adjacent strong {
  color: var(--color-text);
  font-family: var(--font-serif-cn);
  font-size: 15px;
  font-weight: 400;
}

.article-not-found {
  display: grid;
  justify-items: start;
  width: min(720px, 100%);
  min-height: 520px;
  margin: 0 auto;
  align-content: center;
}

.article-not-found > p {
  color: var(--color-gold);
}

.article-not-found a {
  margin-top: 42px;
}

@media (max-width: 600px) {
  .article-detail__adjacent {
    grid-template-columns: 1fr;
  }

  .article-detail__adjacent a:last-child {
    text-align: left;
  }
}
</style>
