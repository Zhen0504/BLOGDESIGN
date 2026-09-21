<script setup>
import ArticleMarkdown from '../components/articles/ArticleMarkdown.vue'
import ArticlePageShell from '../components/articles/ArticlePageShell.vue'

const introduction = `## 你好，欢迎来到我的小小轨道

这里是 ZHEN 的个人空间。我希望把开发中的尝试、研究时的思考，以及偶尔闪过的灵感，慢慢整理在这里。

## 我在关注什么

我对技术与表达之间的关系充满好奇：一个想法如何变成可以使用的作品，一段代码如何带来更自然的体验，一个问题又如何引出新的探索。

这里将陆续记录一些项目实践、学习笔记和研究过程，也会保留那些还没有答案的问题。

## 关于这个网站

这片轨道连接着开发、研究与日常思考。希望每一次来到这里，都能遇见一点新的东西。

> 以上为临时简介占位，后续会替换为正式个人介绍。
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
