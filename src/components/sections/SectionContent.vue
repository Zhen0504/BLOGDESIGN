<script setup>
import { computed } from 'vue'

import { getLatestProjects, portfolio } from '../../data/portfolio'
import ParticleText from '../effects/ParticleText.vue'
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
  <section :key="section.id" class="section-content" :class="`section-${section.id}`">
      <template v-if="section.id === '00'">
        <h1 class="overview-title" aria-label="WELCOME to MY BLOG">
          <span class="overview-title__accessible">WELCOME to MY BLOG</span>
          <ParticleText
            class="overview-particles overview-particles--welcome"
            text="WELCOME"
            color="#eeeaf7"
            highlight-color="#8064ff"
            :particle-size="1.7"
            :density="4"
            :scatter="150"
          />
          <span class="overview-title__second-line">
            <ParticleText
              class="overview-particles overview-particles--to"
              text="to"
              color="#d7a64f"
              highlight-color="#f1d39a"
              :particle-size="1.55"
              :density="3"
              :scatter="62"
              font-size="clamp(30px, 3.2vw, 50px)"
              font-weight="500"
            />
            <ParticleText
              class="overview-particles overview-particles--blog"
              text="MY BLOG"
              color="#eeeaf7"
              highlight-color="#7458ff"
              :particle-size="1.7"
              :density="4"
              :scatter="150"
            />
          </span>
        </h1>
        <p class="overview-subtitle">A personal space for development, research, and ideas.</p>
        <p class="overview-topics">DEVELOPMENT · RESEARCH · NOTES</p>
        <div class="scroll-cue" aria-hidden="true">
          <span></span>
          <strong>SCROLL TO EXPLORE</strong>
        </div>
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
  width: min(500px, 100%);
  height: 176px;
  margin: 0 !important;
  font-family: var(--font-display) !important;
  grid-template-rows: 88px 88px;
}

.overview-title__accessible {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.overview-title__second-line {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr);
  min-width: 0;
}

.overview-particles {
  min-width: 0;
}

.overview-particles--to {
  transform: translateY(4px);
}

.overview-subtitle {
  max-width: 420px;
  margin: 34px 0 0;
  color: var(--color-muted);
  font-family: var(--font-display);
  font-size: clamp(16px, 1.35vw, 21px);
  letter-spacing: 0.025em;
  line-height: 1.55;
}

.overview-topics {
  margin: 24px 0 0;
  color: var(--color-gold);
  font-family: var(--font-ui);
  font-size: 9px;
  letter-spacing: 0.28em;
}

.scroll-cue {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: clamp(62px, 10vh, 112px);
  color: rgba(220, 223, 239, 0.5);
  font-family: var(--font-ui);
  font-size: 8px;
  letter-spacing: 0.28em;
}

.scroll-cue span {
  width: 42px;
  height: 1px;
  background: linear-gradient(90deg, var(--color-gold), rgba(240, 186, 91, 0));
}

.scroll-cue strong {
  font-weight: 400;
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

@media (max-width: 760px) {
  .section-content {
    width: min(100%, 480px);
  }

  .section-content h1 {
    margin-top: 20px;
    font-size: clamp(42px, 13vw, 68px);
  }

  .overview-title {
    width: min(100%, 430px);
    height: 132px;
    grid-template-rows: 66px 66px;
  }

  .overview-title__second-line {
    grid-template-columns: 56px minmax(0, 1fr);
  }

  .overview-subtitle {
    max-width: 280px;
    font-size: 15px;
    line-height: 1.55;
  }

  .scroll-cue {
    margin-top: 38px;
  }

  .chapter-label {
    font-size: 9px;
    letter-spacing: 0.2em;
  }

  .chapter-label strong {
    font-size: 15px;
  }
}

</style>
