<script setup>
import { computed } from 'vue'

import { getLatestProjects, portfolio } from '../../data/portfolio'
import CompactProjectLink from '../projects/CompactProjectLink.vue'

defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const latestDevelopmentProjects = computed(() => (
  getLatestProjects(portfolio.developmentProjects)
))

const latestResearchProjects = computed(() => (
  getLatestProjects(portfolio.researchProjects)
))
</script>

<template>
  <Transition name="content-swap" mode="out-in" appear>
    <section :key="section.id" class="section-content" :class="`section-${section.id}`">
      <template v-if="section.id === '00'">
        <h1 class="overview-title">
          <span>Orbit</span>
          <span>Archive.</span>
        </h1>
        <p class="overview-subtitle">{{ portfolio.brand.subtitle }}</p>
      </template>

      <template v-else-if="section.id === '01'">
        <p class="chapter-label">CHAPTER <strong>01</strong> / ABOUT</p>
        <h1>个人简介</h1>
        <p v-if="portfolio.profile.summary" class="section-summary">
          {{ portfolio.profile.summary }}
        </p>
        <p v-else class="content-pending">个人资料待确认</p>
        <ul v-if="portfolio.profile.keywords.length" class="keyword-list">
          <li v-for="keyword in portfolio.profile.keywords.slice(0, 3)" :key="keyword">
            {{ keyword }}
          </li>
        </ul>
      </template>

      <template v-else-if="section.id === '02'">
        <p class="chapter-label">CHAPTER <strong>02</strong> / DEVELOPMENT</p>
        <h1>开发项目</h1>
        <p class="section-kicker">最近完成</p>
        <div v-if="latestDevelopmentProjects.length" class="project-links">
          <CompactProjectLink
            v-for="(project, index) in latestDevelopmentProjects"
            :key="project.id"
            :project="project"
            :index="index"
          />
        </div>
        <p v-else class="content-pending">开发项目资料待确认</p>
      </template>

      <template v-else-if="section.id === '03'">
        <p class="chapter-label">CHAPTER <strong>03</strong> / RESEARCH</p>
        <h1>科研项目</h1>
        <p class="section-kicker">近期研究</p>
        <div v-if="latestResearchProjects.length" class="project-links">
          <CompactProjectLink
            v-for="(project, index) in latestResearchProjects"
            :key="project.id"
            :project="project"
            :index="index"
          />
        </div>
        <p v-else class="content-pending">科研项目资料待确认</p>
      </template>

      <template v-else>
        <p class="chapter-label">CHAPTER <strong>04</strong> / CONTACT</p>
        <h1>联系方式</h1>
        <div class="contact-links">
          <a
            class="contact-link"
            :href="portfolio.contact.github.href"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>GITHUB</span>
            <strong>{{ portfolio.contact.github.label }}</strong>
            <span aria-hidden="true">↗</span>
          </a>
          <a
            v-if="portfolio.contact.email"
            class="contact-link"
            :href="`mailto:${portfolio.contact.email}`"
          >
            <span>EMAIL</span>
            <strong>{{ portfolio.contact.email }}</strong>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </template>
    </section>
  </Transition>
</template>

<style scoped>
.section-content {
  width: min(520px, 100%);
}

.section-content h1 {
  margin: 30px 0 0;
  color: var(--color-text);
  font-family: var(--font-serif-cn);
  font-size: clamp(52px, 6.2vw, 94px);
  font-weight: 400;
  letter-spacing: 0.12em;
  line-height: 1.08;
}

.overview-title {
  display: grid;
  margin: 0 !important;
  font-family: var(--font-display) !important;
  font-size: clamp(74px, 8vw, 132px) !important;
  letter-spacing: -0.055em !important;
  line-height: 0.87 !important;
}

.overview-subtitle {
  margin: 30px 0 0;
  color: var(--color-muted);
  font-family: var(--font-ui);
  font-size: 11px;
  letter-spacing: 0.28em;
}

.chapter-label {
  margin: 0;
  color: var(--color-muted);
  font-family: var(--font-ui);
  font-size: 11px;
  letter-spacing: 0.3em;
}

.chapter-label strong {
  margin: 0 8px;
  color: var(--color-gold);
  font-size: 18px;
  font-weight: 400;
}

.section-summary,
.section-kicker,
.content-pending {
  margin: 28px 0 0;
  color: var(--color-muted);
  font-family: var(--font-serif-cn);
  font-size: 18px;
  letter-spacing: 0.08em;
}

.content-pending {
  color: var(--color-subtle);
  font-size: 14px;
}

.keyword-list {
  display: flex;
  gap: 22px;
  margin: 34px 0 0;
  padding: 22px 0 0;
  border-top: 1px solid rgba(224, 227, 238, 0.11);
  list-style: none;
}

.keyword-list li {
  color: var(--color-muted);
  font-family: var(--font-ui);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.project-links {
  display: grid;
  gap: 14px;
  margin-top: 32px;
}

.contact-links {
  display: grid;
  gap: 0;
  margin-top: 38px;
}

.contact-link {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  width: min(420px, 100%);
  padding: 16px 0;
  border-bottom: 1px solid rgba(224, 227, 238, 0.12);
  color: var(--color-muted);
  font-family: var(--font-ui);
  font-size: 11px;
  letter-spacing: 0.18em;
}

.contact-link strong {
  overflow: hidden;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-overflow: ellipsis;
}

.contact-link > span:last-child {
  color: var(--color-gold);
}

.content-swap-enter-active,
.content-swap-leave-active {
  transition:
    opacity 260ms ease,
    transform 340ms cubic-bezier(0.2, 0.75, 0.2, 1);
}

.content-swap-enter-from {
  opacity: 0;
  transform: translateY(18px);
}

.content-swap-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 760px) {
  .section-content {
    width: min(100%, 480px);
  }

  .section-content h1 {
    margin-top: 20px;
    font-size: clamp(42px, 13vw, 68px);
  }

  .overview-title {
    font-size: clamp(64px, 19vw, 96px) !important;
  }

  .overview-subtitle {
    max-width: 280px;
    font-size: 9px;
    line-height: 2;
  }

  .chapter-label {
    font-size: 9px;
    letter-spacing: 0.2em;
  }

  .chapter-label strong {
    font-size: 15px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .content-swap-enter-active,
  .content-swap-leave-active {
    transition: opacity 120ms linear;
  }

  .content-swap-enter-from,
  .content-swap-leave-to {
    transform: none;
  }
}
</style>
