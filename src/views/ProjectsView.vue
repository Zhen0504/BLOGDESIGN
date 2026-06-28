<template>
  <section class="page-section projects-section">
    <div class="page-container">
      <div class="projects-heading">
        <p class="eyebrow">Projects</p>
        <h1 class="section-title">项目展示</h1>
        <p class="section-copy">
          这里记录团队在课程实践、前端开发和协作过程中的阶段性成果。
        </p>
      </div>

      <div class="project-list" aria-label="项目列表">
        <article
          v-for="project in projects"
          :key="project.name"
          class="project-card"
        >
          <div class="project-content">
            <div class="project-heading">
              <h2>{{ project.name }}</h2>
              <span class="project-meta">{{ project.year }}</span>
              <span class="project-status">{{ project.status }}</span>
              <!-- 收起态把技术标签放在第一行右侧，展开后会淡出，避免和下方详情标签重复。 -->
              <div class="project-tags project-tags-inline" aria-label="技术标签">
                <span v-for="tag in project.tags" :key="tag">{{ tag }}</span>
              </div>
            </div>
            <p class="project-description">{{ project.description }}</p>
            <!-- 展开态使用这组标签，位置回到简介下方，保持大卡片的信息层级。 -->
            <div class="project-tags project-tags-detail" aria-label="技术标签">
              <span v-for="tag in project.tags" :key="tag">{{ tag }}</span>
            </div>
            <a class="project-link" href="#" aria-label="查看项目外部链接" @click.prevent>
              <span>查看项目</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 17L17 7" />
                <path d="M9 7h8v8" />
              </svg>
            </a>
          </div>

          <div class="project-preview" aria-hidden="true">
            <div class="preview-window">
              <img :src="project.image" :alt="project.name" />
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
// 项目页目前使用本地静态数据；后续如果项目增多，可以迁移到 src/data/projects.js。
const projects = [
  {
    year: '2026',
    name: 'Home Page',
    description: '博客首页首屏，使用粒子背景、中心标题和主要入口按钮建立第一视觉印象。',
    tags: ['Hero', 'Particles', 'Responsive', 'CSS'],
    status: '已完成',
    image: '/images/projects/home-page.png',
  },
  {
    year: '2026',
    name: 'Blog Page',
    description: '博客文章列表页面，用卡片网格展示技术栈介绍、项目复盘和精选预告内容。',
    tags: ['Article Card', 'Grid', 'Content'],
    status: '已完成',
    image: '/images/projects/blog-page.png',
  },
  {
    year: '2026',
    name: 'Projects Page',
    description: '项目展示页面，用可展开卡片整理已完成页面、技术标签和项目预览截图。',
    tags: ['Portfolio', 'Hover Card', 'Preview'],
    status: '开发中',
    image: '/images/projects/projects-page.png',
  },
  {
    year: '2026',
    name: 'About Page',
    description: '关于页面说明博客定位、内容分类和建设目的，帮助访问者快速理解站点价值。',
    tags: ['About', 'Content', 'Layout'],
    status: '已完成',
    image: '/images/projects/about-page.png',
  },
]
</script>

<style scoped>
.projects-section {
  min-height: 100vh;
  padding-top: 128px;
  background:
    radial-gradient(circle at 88% 10%, rgba(32, 214, 199, 0.13), transparent 24%),
    radial-gradient(circle at 12% 22%, rgba(192, 132, 252, 0.10), transparent 28%),
    var(--color-page);
}

.projects-heading {
  max-width: 820px;
}

.project-list {
  display: grid;
  gap: 16px;
  margin-top: 42px;
  padding-top: 34px;
  border-top: 1px solid var(--color-border);
}

/* 默认是横向小卡片：固定高度只展示标题行，hover/focus 时展开成完整项目卡片。 */
.project-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0fr);
  gap: 0;
  align-items: stretch;
  width: 100%;
  height: 116px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 22px clamp(22px, 4vw, 34px);
  background: rgba(255, 255, 255, 0.035);
  box-shadow: var(--shadow-soft);
  transition:
    height 560ms cubic-bezier(0.22, 1, 0.36, 1),
    gap 560ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 260ms ease,
    background 260ms ease,
    box-shadow 260ms ease,
    grid-template-columns 560ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* focus-within 让键盘用户 tab 到链接时也能看到完整卡片内容。 */
.project-card:hover,
.project-card:focus-within {
  grid-template-columns: minmax(0, 1fr) minmax(240px, 34%);
  gap: clamp(24px, 5vw, 56px);
  height: 248px;
  border-color: rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.05);
}

.project-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
}

.project-heading {
  display: flex;
  min-width: 0;
  flex-wrap: nowrap;
  gap: 10px;
  align-items: center;
}

.project-meta,
.project-status {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  border-radius: 999px;
  padding: 0 10px;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
}

.project-meta {
  color: var(--color-accent);
}

.project-status {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--color-accent-soft);
  color: #dffcf8;
}

.project-heading h2 {
  min-width: 0;
  margin: 0;
  font-size: clamp(24px, 3vw, 36px);
  line-height: 1.28;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-description {
  max-width: 720px;
  max-height: 0;
  margin: 0;
  overflow: hidden;
  color: var(--color-muted);
  font-size: 16px;
  opacity: 0;
  transform: translateY(-6px);
  transition:
    max-height 480ms cubic-bezier(0.22, 1, 0.36, 1),
    margin 480ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 320ms ease 80ms,
    transform 480ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* 简介在收起态折叠，展开时延迟淡入，避免文字先于外框高度变化出现。 */
.project-card:hover .project-description,
.project-card:focus-within .project-description {
  max-height: 72px;
  margin-top: 16px;
  opacity: 1;
  transform: translateY(0);
}

.project-tags {
  display: flex;
  min-width: 0;
  flex-wrap: nowrap;
  gap: 8px;
  overflow: hidden;
}

.project-tags-inline {
  flex: 1 1 auto;
  justify-content: flex-end;
  margin-left: auto;
  opacity: 1;
  transition:
    max-width 360ms ease,
    opacity 260ms ease,
    transform 360ms ease;
}

/* 展开时隐藏第一行右侧标签，给预览图和详情区让出视觉空间。 */
.project-card:hover .project-tags-inline,
.project-card:focus-within .project-tags-inline {
  max-width: 0;
  opacity: 0;
  transform: translateX(8px);
}

.project-tags-detail {
  max-height: 0;
  margin-top: 0;
  opacity: 0;
  transform: translateY(-6px);
  transition:
    max-height 480ms cubic-bezier(0.22, 1, 0.36, 1),
    margin 480ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 320ms ease 90ms,
    transform 480ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* 详情标签只在展开态显示，和收起态标签共用同一份项目数据。 */
.project-card:hover .project-tags-detail,
.project-card:focus-within .project-tags-detail {
  max-height: 42px;
  margin-top: 20px;
  opacity: 1;
  transform: translateY(0);
}

.project-tags span {
  flex: 0 0 auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.06);
  color: #dcd8e6;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.project-link {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 8px;
  max-height: 0;
  margin-top: 0;
  overflow: hidden;
  color: var(--color-text);
  font-weight: 800;
  opacity: 0;
  transform: translateY(-6px);
  transition:
    max-height 480ms cubic-bezier(0.22, 1, 0.36, 1),
    margin 480ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 320ms ease 120ms,
    transform 480ms cubic-bezier(0.22, 1, 0.36, 1),
    color 180ms ease;
}

.project-card:hover .project-link,
.project-card:focus-within .project-link {
  max-height: 28px;
  margin-top: 24px;
  opacity: 1;
  transform: translateY(0);
}

.project-link:hover {
  color: var(--color-accent);
}

.project-link svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.project-preview {
  height: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateX(16px) scale(0.96);
  transition:
    height 560ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 360ms ease 100ms,
    transform 560ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* 右侧预览在收起态高度为 0，避免占位区域把小卡片外框撑高。 */
.project-card:hover .project-preview,
.project-card:focus-within .project-preview {
  height: 180px;
  opacity: 1;
  transform: translateX(0) scale(1);
}

.preview-window {
  position: relative;
  overflow: hidden;
  height: 100%;
  min-height: 180px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  background:
    linear-gradient(135deg, rgba(32, 214, 199, 0.26), rgba(255, 255, 255, 0.04)),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.22), transparent 26%),
    #14111b;
}

.preview-window img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.86;
}

@media (max-width: 820px) {
  /* 移动端没有稳定 hover 行为，因此直接显示完整项目内容。 */
  .project-card {
    grid-template-columns: 1fr;
    gap: 24px;
    width: 100%;
    height: auto;
    min-height: auto;
  }

  .project-description,
  .project-link,
  .project-preview,
  .project-tags-detail {
    max-height: none;
    margin-top: 16px;
    opacity: 1;
    transform: none;
  }

  .project-tags-inline {
    display: none;
  }

  .project-tags-detail {
    flex-wrap: wrap;
  }

  .project-preview {
    height: auto;
  }

  .project-link {
    margin-top: 24px;
  }

  .project-preview,
  .preview-window {
    min-height: 160px;
  }
}

@media (max-width: 640px) {
  .projects-section {
    padding-top: 92px;
  }
}
</style>
