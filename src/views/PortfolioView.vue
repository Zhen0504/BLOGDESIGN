<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import CrystalScene from '../components/crystal-scene/CrystalScene.vue'
import PortfolioHeader from '../components/layout/PortfolioHeader.vue'
import SectionIndicator from '../components/layout/SectionIndicator.vue'
import SectionContent from '../components/sections/SectionContent.vue'
import {
  getSectionBySlug,
  getSectionPath,
  sectionDefinitions,
} from '../data/portfolio'

const props = defineProps({
  section: {
    type: String,
    default: '',
  },
})

const router = useRouter()
const activeSection = computed(() => getSectionBySlug(props.section))
const displayedSection = ref(activeSection.value)
const transitionLocked = ref(false)
const contentHidden = ref(false)
let wheelDelta = 0
let wheelResetTimer = 0
let contentSwapTimer = 0
let contentRevealTimer = 0

async function navigateTo(section) {
  if (!section || transitionLocked.value || section.id === activeSection.value.id) return
  transitionLocked.value = true
  wheelDelta = 0
  try {
    await router.push(getSectionPath(section))
  } catch (error) {
    transitionLocked.value = false
    throw error
  }
}

function moveByOffset(offset) {
  const currentIndex = sectionDefinitions.findIndex(({ id }) => id === activeSection.value.id)
  const nextIndex = Math.max(0, Math.min(sectionDefinitions.length - 1, currentIndex + offset))
  if (nextIndex === currentIndex) return
  navigateTo(sectionDefinitions[nextIndex])
}

function onWheel(event) {
  if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return
  event.preventDefault()
  if (transitionLocked.value) return
  wheelDelta += event.deltaY
  window.clearTimeout(wheelResetTimer)
  wheelResetTimer = window.setTimeout(() => { wheelDelta = 0 }, 180)
  if (Math.abs(wheelDelta) < 42) return
  moveByOffset(wheelDelta > 0 ? 1 : -1)
  wheelDelta = 0
}

function onKeydown(event) {
  if (event.key === 'ArrowDown' || event.key === 'PageDown') {
    event.preventDefault()
    moveByOffset(1)
  } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
    event.preventDefault()
    moveByOffset(-1)
  }
}

function onTransitionStart() {
  transitionLocked.value = true
}

function onTransitionComplete() {
  transitionLocked.value = false
}

watch(() => activeSection.value.id, () => {
  const nextSection = activeSection.value
  window.clearTimeout(contentSwapTimer)
  window.clearTimeout(contentRevealTimer)
  contentHidden.value = true
  contentSwapTimer = window.setTimeout(() => {
    displayedSection.value = nextSection
    contentRevealTimer = window.setTimeout(() => {
      contentHidden.value = false
    }, 34)
  }, 280)
})

onMounted(() => {
  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('wheel', onWheel)
  window.removeEventListener('keydown', onKeydown)
  window.clearTimeout(wheelResetTimer)
  window.clearTimeout(contentSwapTimer)
  window.clearTimeout(contentRevealTimer)
})
</script>

<template>
  <div class="portfolio-view" :data-section="activeSection.id">
    <CrystalScene
      :section-id="activeSection.id"
      @transition-start="onTransitionStart"
      @transition-complete="onTransitionComplete"
    />
    <div class="ambient-background" aria-hidden="true"></div>

    <PortfolioHeader
      :active-section="activeSection"
      :navigation-locked="transitionLocked"
      @navigate="navigateTo"
    />

    <main
      class="portfolio-main"
      :class="[`content-${displayedSection.contentSide}`, { 'content-hidden': contentHidden }]"
      :aria-label="displayedSection.navLabel"
    >
      <SectionContent :section="displayedSection" />
    </main>

    <SectionIndicator
      :active-section="activeSection"
      :navigation-locked="transitionLocked"
      @navigate="navigateTo"
    />
  </div>
</template>

<style scoped>
.portfolio-view {
  position: relative;
  isolation: isolate;
  min-height: 100svh;
  overflow: hidden;
  background:
    radial-gradient(circle at 70% 46%, rgba(55, 50, 137, 0.08), transparent 38%),
    var(--color-page);
}

.ambient-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ambient-background {
  z-index: 1;
  background:
    linear-gradient(90deg, rgba(2, 4, 16, 0.92) 0%, rgba(2, 4, 16, 0.78) 28%, transparent 52%),
    radial-gradient(circle at 14% 54%, rgba(37, 45, 112, 0.12), transparent 38%);
}

.ambient-background::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(1, 2, 11, 0.16), transparent 18%, transparent 78%, rgba(1, 2, 11, 0.36));
  content: '';
}

.portfolio-main {
  position: relative;
  z-index: 4;
  display: grid;
  grid-template-columns: minmax(370px, 0.62fr) minmax(0, 1fr);
  align-items: center;
  width: 100%;
  min-height: 100svh;
  padding: calc(var(--header-height) + 34px) clamp(68px, 5.4vw, 104px) 64px;
  pointer-events: none;
}

.portfolio-main :deep(a),
.portfolio-main :deep(button) {
  pointer-events: auto;
}

.portfolio-main :deep(.section-content) {
  transition:
    opacity 360ms ease,
    transform 520ms cubic-bezier(0.2, 0.75, 0.2, 1);
}

.portfolio-main.content-hidden :deep(.section-content) {
  opacity: 0;
  transform: translateY(14px);
}

.portfolio-main.content-left :deep(.section-content) {
  grid-column: 1;
  justify-self: start;
}

.portfolio-main.content-right :deep(.section-content) {
  grid-column: 2;
  justify-self: end;
}

.portfolio-view[data-section='02'] .ambient-background,
.portfolio-view[data-section='04'] .ambient-background {
  background:
    linear-gradient(270deg, rgba(2, 4, 16, 0.9) 0%, rgba(2, 4, 16, 0.72) 27%, transparent 51%),
    radial-gradient(circle at 86% 54%, rgba(37, 45, 112, 0.12), transparent 38%);
}

@media (max-width: 980px) {
  .portfolio-main {
    grid-template-columns: minmax(340px, 0.72fr) minmax(0, 1fr);
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
    pointer-events: none;
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
