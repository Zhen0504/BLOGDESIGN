<script setup>
import { ref } from 'vue'

const isContactDialogOpen = ref(false)

// Hero 下方四个方向卡片集中维护，后续新增栏目时只需要补充这里的数据。
const recordTopics = [
  {
    index: '01',
    title: '技术笔记',
    text: '记录前端开发、后端接口、数据库、算法和工具链等学习过程。',
  },
  {
    index: '02',
    title: '项目复盘',
    text: '整理课程设计、团队项目、功能实现、问题修复和版本迭代过程。',
  },
  {
    index: '03',
    title: '团队协作',
    text: '记录需求讨论、任务分工、协作流程和阶段性总结。',
  },
  {
    index: '04',
    title: '成长记录',
    text: '沉淀学习路线、阶段反思、踩坑经验和后续计划。',
  },
]

// 学习沉淀流程保持短文本，便于在桌面横向、移动端纵向两种布局里复用。
const processSteps = [
  {
    title: '发现问题',
    text: '从课程、项目和实践中发现真实问题。',
  },
  {
    title: '动手实践',
    text: '通过代码、实验和调试验证解决方案。',
  },
  {
    title: '记录过程',
    text: '保留关键步骤、错误原因和解决思路。',
  },
  {
    title: '总结复盘',
    text: '提炼方法、经验和可复用结论。',
  },
  {
    title: '形成文章',
    text: '整理成博客内容，方便回看和展示。',
  },
]

// 后续计划用于替代原先的简单链接列表，让 About 页更像项目说明页。
const futurePlans = [
  {
    title: '完善文章分类',
    text: '建立技术笔记、项目复盘、课程实践、团队协作等分类。',
    status: 'Building',
  },
  {
    title: '补充项目展示',
    text: '整理课程设计、Web 项目和团队实践项目的展示页面。',
    status: 'Building',
  },
  {
    title: '优化团队介绍',
    text: '补充成员分工、协作方式和阶段成果。',
    status: 'Planned',
  },
  {
    title: '建立学习路线',
    text: '把阶段性学习目标和技术路线整理成可持续更新的内容。',
    status: 'Planned',
  },
]

// 联系方式目前是占位状态，后续开放真实渠道时优先修改这一组数据。
const contactItems = [
  {
    label: '邮箱',
    value: '暂未开放 / Coming soon',
    text: '课程合作、文章投稿和项目交流入口后续补充。',
  },
  {
    label: 'GitHub',
    value: '建设中',
    text: '项目仓库整理完成后会在这里放出统一入口。',
  },
  {
    label: '交流方式',
    value: '后续开放',
    text: '团队协作方式和公开交流渠道会随页面继续完善。',
  },
]

const openContactDialog = () => {
  isContactDialogOpen.value = true
}

const closeContactDialog = () => {
  isContactDialogOpen.value = false
}
</script>

<template>
  <div class="content-page about-page">
    <section class="page-section about-hero">
      <div class="page-container about-hero-layout">
        <!-- 左侧负责说明 Leo Team Blog 的定位，避免 Hero 只像首页副本。 -->
        <div class="about-hero-copy">
          <p class="eyebrow">About</p>
          <h1 class="section-title">关于 Leo Team Blog</h1>
          <p class="section-copy">
            一个记录技术学习、课程实践与项目复盘的博客空间。我们把零散的学习过程、项目经验和团队协作记录整理成可以回看、可以展示、也可以持续迭代的内容资产。
          </p>
          <div class="hero-actions" aria-label="关于页主要入口">
            <RouterLink class="about-button about-button-primary" to="/blog">查看博客</RouterLink>
            <RouterLink class="about-button about-button-secondary" to="/projects">查看项目</RouterLink>
          </div>

          <div class="hero-summary" aria-label="博客建立原因">
            <span>WHY</span>
            <p>
              建立这个博客，是为了把课程实践中的问题、项目实现中的取舍和团队协作中的经验保存下来，让学习不只停留在完成作业，而能持续变成文章、项目和可复盘的成果。
            </p>
          </div>
        </div>

        <!-- 右侧身份卡改为展开式社交卡，三个角标复用当前文章 / 项目 / GitHub 图标。 -->
        <aside class="identity-card-parent" aria-label="Leo Team Blog 信息摘要卡">
          <div class="identity-card">
            <div class="identity-card-background"></div>
            <div class="identity-card-logo" aria-hidden="true">
              <strong>Blog</strong>
              <span>Build / Learn / Review</span>
            </div>

            <RouterLink class="identity-box identity-box-1" to="/blog" aria-label="查看文章">
              <span class="identity-box-icon">
                <svg class="svg" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 4.5h10.4L19 8.1v11.4H5V4.5Zm9.5 1.7V9h2.8l-2.8-2.8ZM7.2 11.2h9.6v-1.4H7.2v1.4Zm0 3.2h9.6V13H7.2v1.4Zm0 3.2h6.4v-1.4H7.2v1.4Z" />
                </svg>
              </span>
            </RouterLink>
            <RouterLink class="identity-box identity-box-2" to="/projects" aria-label="查看项目">
              <span class="identity-box-icon">
                <svg class="svg" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 5.5h7.4l1.6 2h7v11H4v-13Zm2 4v7h12v-7h-6l-1.6-2H6v2Z" />
                </svg>
              </span>
            </RouterLink>
            <button class="identity-box identity-box-3" type="button" aria-label="查看 GitHub 状态" @click="openContactDialog">
              <span class="identity-box-icon">
                <svg class="svg" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.5A9.5 9.5 0 0 0 9 21c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 2.9.8.1-.7.4-1.1.7-1.4-2.2-.3-4.6-1.1-4.6-4.8 0-1.1.4-1.9 1-2.6-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 4.8 0c1.8-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.5 1 2.6 0 3.7-2.3 4.5-4.6 4.8.4.3.8 1 .8 2v2.6c0 .3.2.6.7.5A9.5 9.5 0 0 0 12 2.5Z" />
                </svg>
              </span>
            </button>
            <span class="identity-box identity-box-4" aria-hidden="true"></span>
          </div>
        </aside>
      </div>
    </section>

    <section id="record-topics" class="page-section about-section topic-section">
      <div class="page-container">
        <span class="section-ghost" aria-hidden="true">NOTES</span>
        <div class="section-heading narrative-heading">
          <div>
            <p class="eyebrow">Content</p>
            <h2>我们记录什么</h2>
          </div>
          <p>用更细的分类承接学习过程，让每次实践都能回到明确的内容位置。</p>
        </div>

        <!-- 翻转信息块：默认显示编号和方向，hover 后展示详细说明。 -->
        <div class="topic-strip">
          <article v-for="topic in recordTopics" :key="topic.title" class="topic-item">
            <div class="topic-card-inner">
              <div class="topic-face topic-face-front">
                <span class="topic-index">{{ topic.index }}</span>
                <h3>{{ topic.title }}</h3>
              </div>
              <div class="topic-face topic-face-back">
                <div class="topic-back-content">
                  <span>{{ topic.index }}</span>
                  <h3>{{ topic.title }}</h3>
                  <p>{{ topic.text }}</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="page-section about-section process-section">
      <div class="page-container">
        <span class="section-ghost process-ghost" aria-hidden="true">FLOW</span>
        <div class="section-heading process-heading">
          <div>
            <p class="eyebrow">Workflow</p>
            <h2>学习过程如何沉淀</h2>
          </div>
          <p>从发现问题到形成文章，中间每一步都尽量保留可复盘的证据和结论。</p>
        </div>

        <!-- 桌面端使用直线流程，流光由 CSS 伪元素驱动，节点更容易精准对齐。 -->
        <div class="process-river" aria-label="学习沉淀流程">
          <div class="process-river-line" aria-hidden="true"></div>

          <article
            v-for="(step, index) in processSteps"
            :key="step.title"
            class="process-node"
            :class="`process-node-${index + 1}`"
          >
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="page-section about-section roadmap-section">
      <div class="page-container roadmap-layout">
        <div class="roadmap-copy">
          <span class="section-ghost roadmap-ghost" aria-hidden="true">NEXT</span>
          <div class="section-heading roadmap-heading">
            <p class="eyebrow">Next</p>
            <h2>后续计划</h2>
            <p>页面和内容会继续跟着课程实践、团队项目和复盘节奏更新，不追求一次写满，而是持续沉淀。</p>
          </div>
          <button class="about-button about-button-secondary" type="button" @click="openContactDialog">
            联系我们
          </button>
        </div>

        <!-- Roadmap 用列表和状态承接后续计划，减少一排卡片造成的模板感。 -->
        <div class="roadmap-list">
          <article v-for="(plan, index) in futurePlans" :key="plan.title" class="roadmap-item">
            <span class="roadmap-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <div>
              <div class="roadmap-item-head">
                <h3>{{ plan.title }}</h3>
                <span class="roadmap-status" :class="{ 'is-planned': plan.status === 'Planned' }">
                  {{ plan.status }}
                </span>
              </div>
              <p>{{ plan.text }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Teleport 让联系弹窗脱离页面和 3D 卡片层级，避免 z-index 与 transform 互相影响。 -->
    <Teleport to="body">
      <div v-if="isContactDialogOpen" class="contact-dialog-backdrop" @click.self="closeContactDialog">
        <section class="contact-dialog" role="dialog" aria-modal="true" aria-labelledby="contact-dialog-title">
          <button class="dialog-close" type="button" aria-label="关闭联系方式弹窗" @click="closeContactDialog">
            ×
          </button>
          <p class="eyebrow">Contact</p>
          <h2 id="contact-dialog-title">联系方式</h2>
          <div class="contact-list">
            <article v-for="item in contactItems" :key="item.label" class="contact-item">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <p>{{ item.text }}</p>
            </article>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.about-page {
  position: relative;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 86% 10%, rgba(106, 90, 205, 0.13), transparent 24%),
    radial-gradient(circle at 12% 42%, rgba(32, 214, 199, 0.06), transparent 24%),
    var(--color-page);
}

.about-page::before {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.026) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.026) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.7), transparent 78%);
  content: '';
}

.about-page > * {
  position: relative;
  z-index: 1;
}

.about-hero {
  min-height: auto;
  padding-top: 98px;
  padding-bottom: 44px;
}

.about-hero-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
  gap: clamp(48px, 8vw, 118px);
  align-items: center;
}

.about-hero-copy {
  max-width: 760px;
}

.about-hero-copy .section-copy {
  max-width: 780px;
  font-size: clamp(16px, 1.45vw, 19px);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}

.about-button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-sm);
  padding: 0 18px;
  color: #f7f7fb;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.about-button:hover {
  transform: translateY(-2px);
}

.about-button-primary {
  border-color: rgba(32, 214, 199, 0.46);
  background: linear-gradient(135deg, rgba(32, 214, 199, 0.24), rgba(255, 255, 255, 0.08));
  box-shadow: 0 16px 36px rgba(32, 214, 199, 0.12);
}

.about-button-secondary {
  background: rgba(255, 255, 255, 0.06);
}

.hero-summary {
  max-width: 680px;
  margin-top: clamp(28px, 4.6vh, 44px);
  border-left: 2px solid var(--color-accent);
  padding: 2px 0 2px 18px;
}

.hero-summary span {
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0;
}

.hero-summary p {
  margin: 8px 0 0;
  color: var(--color-muted);
  font-size: 15px;
}

.identity-card-parent {
  width: clamp(220px, 22vw, 280px);
  aspect-ratio: 1;
  align-self: center;
  justify-self: end;
  perspective: 900px;
}

.identity-card {
  /* 展开式 Blog 身份卡：hover 后角标依次滑入，入口图标沿用当前页面的文章 / 项目 / GitHub。 */
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  border-radius: 30px;
  box-shadow:
    rgba(32, 214, 199, 0.12) 0 0 42px -16px,
    rgba(100, 100, 111, 0.2) 0 7px 29px 0;
  transition:
    box-shadow 0.8s ease,
    transform 0.8s ease;
}

.identity-card-background {
  /* 卡片底色统一从这里维护，保持青紫渐变与页面科技感主题一致。 */
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 100% 107%, rgba(32, 214, 199, 0.95) 0%, rgba(98, 194, 254, 0.8) 32%, rgba(147, 112, 219, 0.86) 63%, rgba(72, 52, 154, 0.98) 100%),
    linear-gradient(135deg, #1a1428, #6a5acd);
}

.identity-card-logo {
  /* 默认居中展示 Blog，hover 时移动到右下角，为左下角展开入口留空间。 */
  position: absolute;
  right: 50%;
  bottom: 50%;
  z-index: 3;
  text-align: center;
  transform: translate(50%, 50%);
  transition: all 0.6s ease-in-out;
}

.identity-card-logo strong,
.identity-card-logo span {
  display: block;
  color: #ffffff;
}

.identity-card-logo strong {
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
}

.identity-card-logo span {
  margin-top: 7px;
  font-size: 11px;
  font-weight: 800;
  opacity: 0.8;
  white-space: nowrap;
}

.identity-box {
  /* 展开角标的公共玻璃样式；尺寸、层级和入场延迟由 identity-box-1~4 分别控制。 */
  position: absolute;
  display: block;
  border: none;
  padding: 10px;
  text-align: right;
  border-top: 2px solid rgba(255, 255, 255, 0.88);
  border-right: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 10% 13% 42% 0% / 10% 12% 75% 0%;
  background: rgba(255, 255, 255, 0.28);
  box-shadow: rgba(8, 8, 18, 0.28) -7px 7px 29px 0;
  color: rgba(255, 255, 255, 0.84);
  cursor: pointer;
  transform-origin: bottom left;
  transition: all 1s ease-in-out;
}

.identity-box::before {
  /* hover 渐变层独立放在伪元素，避免影响图标 SVG 的点击和显色。 */
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  content: '';
  transition: opacity 0.45s ease-in-out;
}

.identity-box:hover::before {
  opacity: 1;
}

.identity-box-icon {
  position: relative;
  z-index: 1;
  display: inline-block;
  width: 20px;
  height: 20px;
}

.identity-box .svg {
  width: 100%;
  fill: currentColor;
  transition: all 0.5s ease-in-out;
}

.identity-box:hover .svg {
  fill: #ffffff;
  filter: drop-shadow(0 0 5px #ffffff);
}

.identity-box-1 {
  /* 最大入口：文章。宽高与负向 bottom/left 保持同一比例，才能从左下角完整滑入。 */
  bottom: -70%;
  left: -70%;
  width: 70%;
  height: 70%;
}

.identity-box-1::before {
  background: radial-gradient(circle at 30% 107%, rgba(32, 214, 199, 0.9) 0%, rgba(106, 90, 205, 0.82) 55%, rgba(98, 194, 254, 0.75) 90%);
}

.identity-box-2 {
  /* 第二层入口：项目。transition-delay 用来形成分层展开节奏。 */
  bottom: -50%;
  left: -50%;
  width: 50%;
  height: 50%;
  transition-delay: 0.2s;
}

.identity-box-2::before {
  background: radial-gradient(circle at 30% 107%, rgba(145, 233, 255, 0.95) 0%, rgba(0, 172, 238, 0.72) 90%);
}

.identity-box-3 {
  /* 第三层入口：GitHub/联系状态。保留 button 语义，用于触发联系弹窗。 */
  bottom: -30%;
  left: -30%;
  width: 30%;
  height: 30%;
  transition-delay: 0.4s;
}

.identity-box-3::before {
  background: radial-gradient(circle at 30% 107%, rgba(150, 159, 255, 0.9) 0%, rgba(179, 73, 255, 0.82) 90%);
}

.identity-box-4 {
  /* 最小层只补齐视觉层级，不承担交互。 */
  bottom: -10%;
  left: -10%;
  width: 10%;
  height: 10%;
  pointer-events: none;
  transition-delay: 0.6s;
}

.identity-card-parent:hover .identity-card {
  box-shadow:
    rgba(32, 214, 199, 0.18) 0 0 46px -12px,
    rgba(100, 100, 111, 0.26) 0 18px 42px 0;
  transform: scale(1.08);
}

.identity-card-parent:hover .identity-box {
  bottom: -1px;
  left: -1px;
}

.identity-card-parent:hover .identity-card-logo {
  right: 20px;
  bottom: 20px;
  transform: translate(0, 0);
}

.about-section {
  position: relative;
  border-top: 1px solid rgba(255, 255, 255, 0.045);
  padding-top: 50px;
  padding-bottom: 54px;
  background: transparent;
}

.section-heading {
  max-width: 720px;
  margin-bottom: 30px;
}

.section-heading h2 {
  margin: 0;
  font-size: clamp(28px, 3.2vw, 44px);
  line-height: 1.12;
}

.section-heading p:not(.eyebrow) {
  max-width: 680px;
  margin: 14px 0 0;
  color: var(--color-muted);
  font-size: 16px;
}

.section-ghost {
  position: absolute;
  top: 20px;
  right: max(28px, calc((100vw - 1180px) / 2));
  z-index: -1;
  color: rgba(255, 255, 255, 0.032);
  font-size: clamp(76px, 12vw, 158px);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 0.8;
  user-select: none;
}

.narrative-heading,
.process-heading {
  display: grid;
  grid-template-columns: minmax(220px, 0.65fr) minmax(0, 1fr);
  gap: clamp(24px, 5vw, 72px);
  align-items: end;
  max-width: none;
}

.topic-section {
  padding-top: 44px;
}

.topic-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  perspective: 1200px;
}

.topic-item {
  min-height: 190px;
  overflow: visible;
  perspective: 1000px;
}

.topic-card-inner {
  /* 翻转卡片的 3D 容器；正反面内容必须都放在这里，hover 才能整体翻面。 */
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 190px;
  border-radius: 12px;
  transform-style: preserve-3d;
  transition: transform 360ms ease;
}

.topic-item:hover .topic-card-inner {
  transform: rotateY(180deg);
}

.topic-face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 12px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.topic-face-front {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.075);
  padding: 24px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.018)),
    rgba(16, 14, 22, 0.88);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.045);
}

.topic-face-front::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 48px;
  height: 1px;
  background: var(--color-accent);
  box-shadow: 0 0 16px rgba(32, 214, 199, 0.45);
  content: '';
}

.topic-face-back {
  display: grid;
  place-items: center;
  border: 1px solid rgba(32, 214, 199, 0.18);
  background: #12101a;
  transform: rotateY(180deg);
}

.topic-face-back::before {
  /* 背面流光层取青色和紫色，避免示例里的暖色流光破坏页面统一性。 */
  position: absolute;
  width: 96px;
  height: 170%;
  background: linear-gradient(90deg, transparent, rgba(32, 214, 199, 0.75), rgba(147, 112, 219, 0.8), transparent);
  content: '';
  animation: topicCardShine 5200ms linear infinite;
}

.topic-back-content {
  position: absolute;
  inset: 2px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 10px;
  padding: 22px;
  background:
    radial-gradient(circle at 85% 12%, rgba(106, 90, 205, 0.16), transparent 34%),
    rgba(18, 16, 26, 0.96);
}

@keyframes topicCardShine {
  from {
    transform: rotateZ(0deg);
  }

  to {
    transform: rotateZ(360deg);
  }
}

.topic-index,
.topic-back-content span,
.process-node span,
.roadmap-number {
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 900;
}

.topic-face h3,
.process-node h3,
.roadmap-item h3 {
  margin: 14px 0 0;
  font-size: 22px;
  line-height: 1.2;
}

.topic-face-back p,
.process-node p,
.roadmap-item p {
  margin: 12px 0 0;
  color: var(--color-muted);
  font-size: 14px;
}

.process-section {
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.012), rgba(106, 90, 205, 0.035) 50%, transparent);
}

.process-ghost {
  left: max(20px, calc((100vw - 1180px) / 2));
  right: auto;
}

.process-river {
  position: relative;
  min-height: 260px;
  margin-top: 12px;
  padding: 28px 6px 12px;
}

.process-river-line {
  /* 桌面端流程主线。节点 top 值需要与这里保持一致，圆点才会压在直线上。 */
  position: absolute;
  top: 118px;
  right: 2%;
  left: 2%;
  width: auto;
  height: 3px;
  overflow: hidden;
  border-radius: 999px;
  background:
    linear-gradient(90deg, rgba(32, 214, 199, 0.16), rgba(147, 112, 219, 0.36), rgba(32, 214, 199, 0.16)),
    rgba(255, 255, 255, 0.06);
  box-shadow:
    0 0 22px rgba(32, 214, 199, 0.18),
    0 0 46px rgba(106, 90, 205, 0.15);
  transform: translateX(-2%);
}

.process-river-line::before {
  /* 直线流光扫过效果，单独用伪元素动画，不影响节点定位。 */
  position: absolute;
  inset: -10px auto -10px -28%;
  width: 34%;
  background: linear-gradient(90deg, transparent, rgba(32, 214, 199, 0.95), rgba(147, 112, 219, 0.85), transparent);
  filter: blur(2px);
  content: '';
  animation: processLineFlow 3600ms linear infinite;
}

@keyframes processLineFlow {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(390%);
  }
}

.process-node {
  /* 流程节点使用绝对定位；process-node-1~5 只负责水平位置和上下排布。 */
  position: absolute;
  z-index: 2;
  width: min(190px, 19vw);
  min-height: 120px;
  padding-top: 22px;
  transform: translateX(-50%);
}

.process-node::before {
  position: absolute;
  top: 0;
  left: 50%;
  width: 9px;
  aspect-ratio: 1;
  border: 2px solid var(--color-accent);
  border-radius: 50%;
  background: #0f0d14;
  box-shadow:
    0 0 0 8px rgba(32, 214, 199, 0.08),
    0 0 22px rgba(32, 214, 199, 0.55);
  content: '';
  transform: translateX(-50%);
}

.process-node-1 {
  top: 118px;
  left: 5%;
}

.process-node-2 {
  /* 上方节点：文字块整体上移，圆点通过 ::before 的 bottom:0 回到主线。 */
  top: 118px;
  left: 27.5%;
  padding-top: 0;
  padding-bottom: 22px;
  transform: translate(-50%, -100%);
}

.process-node-3 {
  top: 118px;
  left: 50%;
}

.process-node-4 {
  /* 上方节点：与 02 保持同一定位方式，保证上下交错但圆点仍在主线上。 */
  top: 118px;
  left: 72.5%;
  padding-top: 0;
  padding-bottom: 22px;
  transform: translate(-50%, -100%);
}

.process-node-5 {
  top: 118px;
  left: 95%;
}

.process-node-2::before,
.process-node-4::before {
  /* 偶数节点文字在线上方，圆点改由底部对齐到直线。 */
  top: auto;
  bottom: 0;
}

.roadmap-section {
  padding-bottom: 68px;
}

.roadmap-layout {
  display: grid;
  grid-template-columns: minmax(250px, 0.42fr) minmax(0, 1fr);
  gap: clamp(36px, 7vw, 96px);
  align-items: start;
}

.roadmap-copy {
  position: sticky;
  top: 112px;
  isolation: isolate;
  overflow: visible;
}

.roadmap-ghost {
  /* NEXT 背景字跟随 Roadmap 左侧说明区，white-space 防止字样换行或被裁掉。 */
  top: -26px;
  right: auto;
  left: -10px;
  z-index: -1;
  white-space: nowrap;
}

.roadmap-heading {
  display: flex;
  max-width: 420px;
  align-items: flex-start;
  flex-direction: column;
  gap: 0;
  margin-bottom: 22px;
}

.roadmap-list {
  position: relative;
  display: grid;
  gap: 0;
  padding-left: 28px;
}

.roadmap-list::before {
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 4px;
  width: 1px;
  background: linear-gradient(180deg, var(--color-accent), rgba(106, 90, 205, 0.4), transparent);
  box-shadow: 0 0 18px rgba(32, 214, 199, 0.2);
  content: '';
}

.roadmap-item {
  position: relative;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 18px;
  padding: 20px 0 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.075);
}

.roadmap-item::before {
  position: absolute;
  top: 28px;
  left: -28px;
  width: 9px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 18px rgba(32, 214, 199, 0.55);
  content: '';
}

.roadmap-item:nth-child(even) {
  padding-left: clamp(0px, 4vw, 42px);
}

.roadmap-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.roadmap-status {
  flex: 0 0 auto;
  border: 1px solid rgba(32, 214, 199, 0.25);
  border-radius: 999px;
  padding: 5px 10px;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 900;
}

.roadmap-status.is-planned {
  border-color: rgba(147, 112, 219, 0.3);
  color: #b9a6ff;
}

.contact-dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 13, 20, 0.58);
  backdrop-filter: blur(9px);
}

.contact-dialog {
  /* 联系弹窗为占位联系信息服务，真实渠道开放时只替换 contactItems。 */
  position: relative;
  width: min(540px, 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 32px;
  background:
    radial-gradient(circle at 18% 0%, rgba(32, 214, 199, 0.1), transparent 34%),
    rgba(23, 20, 31, 0.96);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.34);
}

.dialog-close {
  position: absolute;
  top: 16px;
  right: 16px;
  display: grid;
  width: 36px;
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.055);
  color: #f7f7fb;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.dialog-close:hover {
  background: rgba(255, 255, 255, 0.16);
  color: var(--color-accent);
  transform: scale(1.06);
}

.contact-dialog h2 {
  margin: 0 0 24px;
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1.1;
}

.contact-list {
  display: grid;
  gap: 16px;
}

.contact-item {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-sm);
  padding: 18px;
  background: rgba(255, 255, 255, 0.04);
}

.contact-item span {
  display: block;
  color: var(--color-accent);
  font-size: 13px;
  font-weight: 800;
}

.contact-item strong {
  display: block;
  margin-top: 6px;
  color: #f7f7fb;
  font-size: 17px;
}

.contact-item p {
  margin: 10px 0 0;
  color: var(--color-muted);
  font-size: 14px;
}

@media (max-width: 1100px) {
  .about-hero-layout {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 320px);
    gap: 42px;
  }

  .identity-card-parent {
    width: min(320px, 100%);
  }

  .topic-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .process-node {
    width: min(180px, 21vw);
  }

  .roadmap-layout {
    grid-template-columns: minmax(220px, 0.34fr) minmax(0, 1fr);
    gap: 44px;
  }

}

@media (max-width: 780px) {
  .about-hero {
    padding-top: 94px;
    padding-bottom: 42px;
  }

  .about-hero-layout {
    grid-template-columns: 1fr;
  }

  .identity-card-parent {
    justify-self: center;
    width: min(260px, 100%);
  }

  .identity-card,
  .identity-card-parent:hover .identity-card {
    transform: none;
  }

  .about-section {
    padding-top: 42px;
    padding-bottom: 46px;
  }

  .section-ghost {
    top: 26px;
    right: 20px;
    font-size: 72px;
  }

  .narrative-heading,
  .process-heading,
  .roadmap-layout {
    grid-template-columns: 1fr;
    gap: 22px;
  }

  .topic-strip {
    grid-template-columns: 1fr;
  }

  .topic-item {
    min-height: auto;
  }

  .topic-card-inner {
    min-height: 172px;
  }

  .process-river {
    display: grid;
    gap: 22px;
    min-height: auto;
    padding: 8px 0 0 24px;
  }

  .process-river::before {
    position: absolute;
    top: 12px;
    bottom: 8px;
    left: 4px;
    width: 1px;
    background: linear-gradient(180deg, var(--color-accent), rgba(147, 112, 219, 0.55), transparent);
    box-shadow: 0 0 16px rgba(32, 214, 199, 0.28);
    content: '';
  }

  .process-river-line {
    display: none;
  }

  .process-node,
  .process-node-1,
  .process-node-2,
  .process-node-3,
  .process-node-4,
  .process-node-5 {
    position: relative;
    top: auto;
    left: auto;
    width: auto;
    min-height: auto;
    margin: 0;
    padding: 0 0 0 18px;
    transform: none;
  }

  .process-node::before {
    top: 3px;
    bottom: auto;
    left: 0;
    transform: none;
  }

  .roadmap-copy {
    position: relative;
    top: auto;
  }

  .roadmap-ghost {
    top: -18px;
    left: 0;
  }

  .roadmap-heading {
    margin-bottom: 16px;
  }

  .roadmap-list {
    padding-left: 24px;
  }

  .roadmap-item,
  .roadmap-item:nth-child(even) {
    grid-template-columns: 42px minmax(0, 1fr);
    padding-left: 0;
  }

  .roadmap-item-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 460px) {
  .hero-actions,
  .about-button {
    width: 100%;
  }

  .identity-card-parent {
    width: min(220px, 100%);
  }
}
</style>
