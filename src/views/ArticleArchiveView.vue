<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import ArticlePageShell from '../components/articles/ArticlePageShell.vue'
import { getArticlesByCategory, getCategoryLabel } from '../data/articles'

const props = defineProps({
  category: {
    type: String,
    required: true,
  },
})

const categoryLabel = computed(() => getCategoryLabel(props.category))
const articles = computed(() => getArticlesByCategory(props.category))
</script>

<template>
  <ArticlePageShell :category="category">
    <section class="article-archive">
      <p class="article-archive__eyebrow">ORBIT WRITINGS / {{ categoryLabel }}</p>
      <h1>{{ categoryLabel }}<br>WRITINGS</h1>
      <p class="article-archive__intro">
        Notes, experiments and ideas collected from this part of the orbit.
      </p>

      <div v-if="articles.length" class="article-archive__list">
        <RouterLink
          v-for="(article, index) in articles"
          :key="article.slug"
          class="article-archive__item"
          :to="article.href"
        >
          <span class="article-archive__index">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="article-archive__body">
            <span class="article-archive__date">{{ article.date }}</span>
            <strong>{{ article.title }}</strong>
            <span>{{ article.summary }}</span>
            <span v-if="article.tags.length" class="article-archive__tags">
              <span v-for="tag in article.tags" :key="tag">#{{ tag }}</span>
            </span>
          </span>
          <span class="article-archive__arrow" aria-hidden="true">↗</span>
        </RouterLink>
      </div>

      <div v-else class="article-archive__empty">
        <span class="article-archive__empty-orbit" aria-hidden="true"></span>
        <strong>NO ARTICLES YET</strong>
        <p>This part of the archive is still waiting for its first entry.</p>
      </div>
    </section>
  </ArticlePageShell>
</template>

<style scoped>
.article-archive {
  width: min(920px, 100%);
  margin: 0 auto;
}

.article-archive__eyebrow,
.article-archive__date,
.article-archive__index,
.article-archive__tags {
  font-family: var(--font-ui);
  text-transform: uppercase;
}

.article-archive__eyebrow {
  margin: 0;
  color: var(--color-gold);
  font-size: 9px;
  letter-spacing: 0.32em;
}

.article-archive h1 {
  margin: 24px 0 0;
  font-family: var(--font-display);
  font-size: clamp(40px, 6vw, 80px);
  font-weight: 400;
  letter-spacing: 0.035em;
  line-height: 0.84;
}

.article-archive__intro {
  max-width: 520px;
  margin: 32px 0 0;
  color: var(--color-muted);
  font-family: var(--font-serif-cn);
  font-size: 16px;
}

.article-archive__list {
  display: grid;
  margin-top: 64px;
  border-top: 1px solid rgba(222, 222, 239, 0.16);
}

.article-archive__item {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) 30px;
  gap: 20px;
  align-items: center;
  padding: 18px 4px;
  border-bottom: 1px solid rgba(222, 222, 239, 0.13);
  color: inherit;
  transition: background 220ms ease, padding 220ms ease;
}

.article-archive__item:hover,
.article-archive__item:focus-visible {
  padding-right: 16px;
  padding-left: 16px;
  background: linear-gradient(90deg, rgba(101, 76, 211, 0.12), transparent);
}

.article-archive__index,
.article-archive__date {
  color: var(--color-gold);
  font-size: 9px;
  letter-spacing: 0.12em;
}

.article-archive__body {
  display: grid;
  gap: 5px;
}

.article-archive__body strong {
  font-family: var(--font-serif-cn);
  font-size: clamp(18px, 1.8vw, 24px);
  font-weight: 400;
}

.article-archive__body > span:not(.article-archive__date, .article-archive__tags) {
  color: var(--color-muted);
  font-family: var(--font-serif-cn);
  font-size: 13px;
}

.article-archive__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #8f80db;
  font-size: 8px;
  letter-spacing: 0.08em;
}

.article-archive__arrow {
  color: #a28cff;
  font-size: 18px;
}

.article-archive__empty {
  display: grid;
  justify-items: center;
  min-height: 310px;
  margin-top: 62px;
  padding-top: 66px;
  border-top: 1px solid rgba(222, 222, 239, 0.13);
  text-align: center;
}

.article-archive__empty-orbit {
  width: 68px;
  height: 68px;
  border: 1px solid rgba(139, 116, 255, 0.42);
  border-radius: 50%;
  box-shadow: 0 0 38px rgba(105, 79, 231, 0.18), inset 0 0 24px rgba(116, 88, 238, 0.12);
}

.article-archive__empty strong {
  margin-top: 28px;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.32em;
}

.article-archive__empty p {
  color: var(--color-subtle);
  font-family: var(--font-serif-cn);
  font-size: 13px;
}
</style>
