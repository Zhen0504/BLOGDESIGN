<script setup>
import ArticleMarkdown from '../components/articles/ArticleMarkdown.vue'
import ArticlePageShell from '../components/articles/ArticlePageShell.vue'
import DalianMapCard from '../components/about/DalianMapCard.vue'
import SuggestionCard from '../components/about/SuggestionCard.vue'

const introduction = `## 你好，欢迎来到我的小小轨道

这里是 ZHEN 的个人博客，用来记录学习过程、开发尝试，以及偶尔闪过的灵感。

建立这个博客，最初只是想把学过的东西和做过的尝试记下来，也受到了一些 UP 主分享的启发。希望在整理和回顾的过程中，把知识理解得更清楚。

网站还在慢慢完善，记录也会继续。
`
</script>

<template>
  <ArticlePageShell category="about">
    <article class="about-profile">
      <header class="about-profile__header">
        <p>ORBIT ARCHIVE / ABOUT</p>
        <h1>ABOUT ME</h1>
        <p class="about-profile__summary">保持好奇，记录探索，让想法慢慢成为作品。</p>
      </header>
      <ArticleMarkdown :source="introduction" />
      <DalianMapCard />
      <SuggestionCard />
    </article>
  </ArticlePageShell>
</template>

<style scoped>
.about-profile {
  width: min(720px, 100%);
  margin: 0 auto;
}

.about-profile__header {
  margin-bottom: 48px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(222, 222, 239, 0.14);
}

.about-profile__header > p:first-child {
  color: var(--color-gold);
  font-family: var(--font-ui);
  font-size: 9px;
  letter-spacing: 0.22em;
}

.about-profile h1 {
  margin: 22px 0 0;
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: clamp(48px, 7vw, 86px);
  font-weight: 400;
  line-height: 1.08;
}

.about-profile__summary {
  margin: 28px 0 0;
  color: var(--color-muted);
  font-family: var(--font-serif-cn);
  font-size: 18px;
  line-height: 1.75;
}
</style>
