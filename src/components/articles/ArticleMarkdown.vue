<script setup>
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { computed } from 'vue'

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
})

const html = computed(() => DOMPurify.sanitize(marked.parse(props.source, {
  gfm: true,
  breaks: false,
})))
</script>

<template>
  <div class="article-markdown" v-html="html"></div>
</template>

<style scoped>
.article-markdown {
  color: rgba(228, 226, 235, 0.84);
  font-family: var(--font-serif-cn);
  font-size: 17px;
  letter-spacing: 0.025em;
  line-height: 2;
  overflow-wrap: anywhere;
}

.article-markdown :deep(h2),
.article-markdown :deep(h3),
.article-markdown :deep(h4) {
  margin: 2.2em 0 0.8em;
  color: var(--color-text);
  font-weight: 500;
  line-height: 1.35;
}

.article-markdown :deep(h2) { font-size: 28px; }
.article-markdown :deep(h3) { font-size: 22px; }
.article-markdown :deep(p) { margin: 1.2em 0; }
.article-markdown :deep(a) { color: #a794ff; text-decoration-color: rgba(167, 148, 255, 0.42); }
.article-markdown :deep(img) { display: block; max-width: 100%; margin: 32px auto; border-radius: 10px; }
.article-markdown :deep(blockquote) {
  margin: 28px 0;
  padding: 4px 0 4px 24px;
  border-left: 1px solid rgba(156, 132, 255, 0.6);
  color: rgba(205, 201, 224, 0.66);
}
.article-markdown :deep(pre) {
  overflow: auto;
  margin: 28px 0;
  padding: 20px;
  border: 1px solid rgba(145, 127, 220, 0.2);
  border-radius: 8px;
  background: rgba(5, 6, 20, 0.82);
  font-size: 13px;
  line-height: 1.7;
}
.article-markdown :deep(code) { font-family: 'SFMono-Regular', Consolas, monospace; }
.article-markdown :deep(:not(pre) > code) {
  padding: 0.15em 0.38em;
  border-radius: 4px;
  background: rgba(109, 91, 190, 0.18);
  color: #d7cffc;
}
.article-markdown :deep(table) { display: block; overflow-x: auto; max-width: 100%; margin: 28px 0; border-collapse: collapse; }
.article-markdown :deep(th),
.article-markdown :deep(td) { padding: 10px 12px; border-bottom: 1px solid rgba(221, 220, 235, 0.13); text-align: left; }
.article-markdown :deep(ul),
.article-markdown :deep(ol) { padding-left: 1.4em; }
</style>
