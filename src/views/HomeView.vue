<script setup>
import HeroSection from '../components/home/HeroSection.vue'
</script>

<template>
  <HeroSection />

  <section id="home-preview" class="page-section preview-section">
    <div class="page-container preview-grid">
      <article class="preview-item">
        <p class="eyebrow">Blog</p>
        <h2>技术文章</h2>
        <p>沉淀课程学习、前端实践和项目复盘。</p>
      </article>
      <article class="preview-item">
        <p class="eyebrow">Projects</p>
        <h2>项目展示</h2>
        <p>展示团队协作完成的阶段性成果。</p>
      </article>
      <article class="preview-item">
        <p class="eyebrow">Team</p>
        <h2>团队成员</h2>
        <p>介绍成员分工、技能方向和协作方式。</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.preview-section {
  border-top: 1px solid var(--color-border);
  background: #ffffff;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.preview-item {
  min-height: 210px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 28px;
  background: #ffffff;
  box-shadow: var(--shadow-soft);
}

.preview-item h2 {
  margin: 0;
  font-size: 26px;
}

.preview-item p:last-child {
  margin: 14px 0 0;
  color: var(--color-muted);
}

@media (max-width: 820px) {
  .home-hero {
    min-height: auto;
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
