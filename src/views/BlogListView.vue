<script setup>
import ArticleCard from '../components/blog/ArticleCard.vue'
import { blogPosts } from '../data/posts'
</script>

<template>
  <section class="page-section blog-section">
    <div class="page-container">
      <div class="blog-heading">
        <p class="eyebrow">Blog</p>
        <h1 class="section-title">博客文章</h1>
        <p class="section-copy">
          这里记录 Leo Team Blog 的开发过程、技术选型、页面设计思路与团队协作经验。
          目前文章内容仍在整理中，先通过技术栈介绍、项目复盘和精选预告展示博客模块的基本形态。
        </p>
      </div>

      <div class="article-grid">
        <ArticleCard v-for="post in blogPosts" :key="post.title" :post="post" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.blog-section {
  min-height: 100vh;
  padding-top: 128px;
  background:
    radial-gradient(circle at 88% 10%, rgba(32, 214, 199, 0.13), transparent 24%),
    radial-gradient(circle at 12% 22%, rgba(192, 132, 252, 0.10), transparent 28%),
    var(--color-page);
}

.blog-heading {
  max-width: 820px;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5em;
  margin-top: 42px;
  padding-top: 34px;
  border-top: 1px solid var(--color-border);
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.35rem);
}

.article-grid :deep(.article-card:nth-child(3)) {
  grid-column: span 2;
  grid-row: span 2;
}

.article-grid :deep(.article-card:nth-child(4)) {
  grid-column: 1 / span 2;
  grid-row: 2 / span 2;
}

.article-grid :deep(.article-card:nth-child(6)) {
  grid-column: 4;
  grid-row: 3;
}

@media (max-width: 980px) {
  .article-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .article-grid :deep(.article-card:nth-child(3)),
  .article-grid :deep(.article-card:nth-child(4)),
  .article-grid :deep(.article-card:nth-child(6)) {
    grid-column: auto;
    grid-row: auto;
  }
}

@media (max-width: 640px) {
  .blog-section {
    padding-top: 92px;
  }

  .article-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
