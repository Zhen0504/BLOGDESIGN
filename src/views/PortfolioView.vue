<script setup>
import { computed } from 'vue'

import PortfolioHeader from '../components/layout/PortfolioHeader.vue'
import SectionIndicator from '../components/layout/SectionIndicator.vue'
import SectionContent from '../components/sections/SectionContent.vue'
import { getSectionBySlug } from '../data/portfolio'

const props = defineProps({
  section: {
    type: String,
    default: '',
  },
})

const activeSection = computed(() => getSectionBySlug(props.section))
</script>

<template>
  <div class="portfolio-view" :data-section="activeSection.id">
    <div class="ambient-background" aria-hidden="true"></div>
    <div class="scene-layer" aria-hidden="true"></div>

    <PortfolioHeader :active-section="activeSection" />

    <main
      class="portfolio-main"
      :class="`content-${activeSection.contentSide}`"
      :aria-label="activeSection.navLabel"
    >
      <SectionContent :section="activeSection" />
    </main>

    <SectionIndicator :active-section="activeSection" />
  </div>
</template>

<style scoped>
.portfolio-view {
  position: relative;
  isolation: isolate;
  min-height: 100svh;
  overflow: hidden;
  background:
    radial-gradient(circle at 62% 48%, rgba(55, 50, 137, 0.16), transparent 33%),
    radial-gradient(circle at 34% 74%, rgba(25, 45, 112, 0.1), transparent 38%),
    var(--color-page);
}

.ambient-background,
.scene-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ambient-background {
  z-index: -2;
  opacity: 0.72;
  background-image:
    radial-gradient(circle at 8% 22%, rgba(194, 202, 255, 0.72) 0 0.65px, transparent 0.9px),
    radial-gradient(circle at 76% 18%, rgba(103, 117, 255, 0.7) 0 0.7px, transparent 1px),
    radial-gradient(circle at 62% 72%, rgba(241, 191, 97, 0.54) 0 0.65px, transparent 0.95px),
    radial-gradient(circle at 28% 82%, rgba(145, 154, 236, 0.55) 0 0.7px, transparent 1px);
  background-size: 190px 170px, 230px 210px, 280px 250px, 320px 290px;
}

.ambient-background::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(3, 5, 18, 0.86), transparent 38%, transparent 68%, rgba(3, 5, 18, 0.32));
  content: '';
}

.scene-layer {
  z-index: -1;
}

.portfolio-main {
  position: relative;
  z-index: 4;
  display: grid;
  grid-template-columns: minmax(0, 0.78fr) minmax(420px, 1fr);
  align-items: center;
  width: 100%;
  min-height: 100svh;
  padding: calc(var(--header-height) + 34px) clamp(80px, 6vw, 112px) 64px;
}

.portfolio-main.content-left :deep(.section-content) {
  grid-column: 1;
  justify-self: start;
}

.portfolio-main.content-right :deep(.section-content) {
  grid-column: 2;
  justify-self: end;
}

@media (max-width: 980px) {
  .portfolio-main {
    grid-template-columns: minmax(0, 0.9fr) minmax(340px, 1fr);
    padding-right: 72px;
    padding-left: 48px;
  }
}

@media (max-width: 760px) {
  .portfolio-view {
    min-height: 100dvh;
  }

  .portfolio-main {
    display: block;
    min-height: 100dvh;
    padding:
      calc(var(--header-height) + 76px)
      24px
      calc(92px + env(safe-area-inset-bottom));
  }

  .portfolio-main.content-left :deep(.section-content),
  .portfolio-main.content-right :deep(.section-content) {
    margin: 0 auto;
  }

  .ambient-background::after {
    background: linear-gradient(180deg, rgba(3, 5, 18, 0.76), transparent 54%, rgba(3, 5, 18, 0.64));
  }
}
</style>
