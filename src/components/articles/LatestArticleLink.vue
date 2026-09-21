<script setup>
defineProps({
  article: {
    type: Object,
    required: true,
  },
})

defineEmits(['open'])
</script>

<template>
  <button class="latest-article-link" type="button" @click="$emit('open', article)">
    <span class="latest-article-link__date">{{ article.date }}</span>
    <strong>{{ article.title }}</strong>
    <span class="latest-article-link__summary">{{ article.summary }}</span>
    <span v-if="article.tags.length" class="latest-article-link__tags">
      <span v-for="tag in article.tags" :key="tag">#{{ tag }}</span>
    </span>
    <span class="latest-article-link__arrow" aria-hidden="true">↗</span>
  </button>
</template>

<style scoped>
.latest-article-link {
  position: relative;
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr) 18px;
  gap: 4px 14px;
  align-items: center;
  width: 100%;
  min-height: 66px;
  padding: 10px 12px;
  border: 1px solid rgba(218, 219, 239, 0.13);
  border-radius: 8px;
  background: rgba(8, 10, 28, 0.28);
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
  transition: border-color 220ms ease, background 220ms ease, transform 220ms ease;
}

.latest-article-link:hover,
.latest-article-link:focus-visible {
  border-color: rgba(139, 117, 255, 0.58);
  background: rgba(34, 27, 78, 0.38);
  transform: translateY(-2px);
}

.latest-article-link__date {
  grid-row: 1 / span 3;
  color: var(--color-gold);
  font-family: var(--font-ui);
  font-size: 9px;
  letter-spacing: 0.1em;
}

.latest-article-link strong {
  grid-column: 2;
  overflow: hidden;
  font-family: var(--font-serif-cn);
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.04em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.latest-article-link__summary {
  grid-column: 2;
  overflow: hidden;
  color: var(--color-subtle);
  font-family: var(--font-serif-cn);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.latest-article-link__tags {
  display: flex;
  grid-column: 2;
  flex-wrap: wrap;
  gap: 3px 9px;
  color: #b4a2f6;
  font-family: var(--font-serif-cn);
  font-size: 10px;
  overflow-wrap: anywhere;
}

.latest-article-link__arrow {
  grid-column: 3;
  grid-row: 1 / span 3;
  color: #9a83ff;
  font-size: 14px;
  transition: transform 220ms ease;
}

.latest-article-link:hover .latest-article-link__arrow {
  transform: translate(2px, -2px);
}

@media (max-width: 760px) {
  .latest-article-link {
    grid-template-columns: 72px minmax(0, 1fr) 18px;
  }
}
</style>
