<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import CrystalScene from '../components/crystal-scene/CrystalScene.vue'
import { consumePendingCrystalReturn } from '../components/crystal-scene/portalTransitionState'
import LoadingOverlay from '../components/intro/LoadingOverlay.vue'
import ZhenIntro from '../components/intro/ZhenIntro.vue'
import {
  hasSeenSessionIntro,
  markSessionIntroSeen,
} from '../components/intro/sessionIntro'
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
const returningFromArticles = consumePendingCrystalReturn(activeSection.value.slug)
const displayedSection = ref(activeSection.value)
const transitionLocked = ref(returningFromArticles)
const contentHidden = ref(returningFromArticles)
const sceneReady = ref(false)
const sceneSettled = ref(false)
const returningSession = hasSeenSessionIntro()
const showSessionIntro = !returningSession && !returningFromArticles
const introComplete = ref(returningSession || returningFromArticles)
const introRevealing = ref(false)
const loadingOverlayActive = ref(false)
const crystalScene = ref(null)
const portalMode = ref(returningFromArticles ? 'return-waiting' : null)
const portalVeilVisible = ref(returningFromArticles)
const portalTargetPath = ref('')
const returningLoadPending = computed(() => (
  returningSession && !returningFromArticles && !sceneSettled.value
))
const interactionLocked = computed(() => (
  transitionLocked.value
  || !introComplete.value
  || loadingOverlayActive.value
  || Boolean(portalMode.value)
))
let wheelDelta = 0
let wheelResetTimer = 0
let contentSwapTimer = 0
let contentRevealTimer = 0
let portalNavigationTimer = 0
let portalFallbackTimer = 0
let portalWatchdog = 0
let unmounted = false
let portalRevealFrame = 0

async function navigateTo(section) {
  if (!section || interactionLocked.value || section.id === activeSection.value.id) return
  transitionLocked.value = true
  wheelDelta = 0
  try {
    const failure = await router.push(getSectionPath(section))
    if (failure || !sceneReady.value) transitionLocked.value = false
  } catch (error) {
    transitionLocked.value = false
    console.error('Section navigation failed.', error)
  }
}

function moveByOffset(offset) {
  const currentIndex = sectionDefinitions.findIndex(({ id }) => id === activeSection.value.id)
  const nextIndex = Math.max(0, Math.min(sectionDefinitions.length - 1, currentIndex + offset))
  if (nextIndex === currentIndex) return
  navigateTo(sectionDefinitions[nextIndex])
}

function onWheel(event) {
  const scrollArea = event.target.closest?.('.writing-scroll')
  if (scrollArea && scrollArea.scrollHeight > scrollArea.clientHeight
    && ((event.deltaY > 0 && scrollArea.scrollTop + scrollArea.clientHeight < scrollArea.scrollHeight - 1)
      || (event.deltaY < 0 && scrollArea.scrollTop > 0))) return
  if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return
  event.preventDefault()
  if (interactionLocked.value) return
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

function onSceneReady() {
  sceneReady.value = true
  sceneSettled.value = true
  if (!returningFromArticles || !portalMode.value?.startsWith('return')) return

  portalMode.value = 'returning'
  const started = crystalScene.value?.exitPortal(activeSection.value.id)
  portalRevealFrame = window.requestAnimationFrame(() => {
    portalVeilVisible.value = false
  })
  if (!started) {
    portalFallbackTimer = window.setTimeout(finishPortalReturn, 420)
  }
}

function onSceneFallback() {
  sceneReady.value = false
  sceneSettled.value = true
  transitionLocked.value = false
  if (portalMode.value?.startsWith('return')) {
    portalMode.value = 'returning'
    portalRevealFrame = window.requestAnimationFrame(() => {
      portalVeilVisible.value = false
    })
    portalFallbackTimer = window.setTimeout(finishPortalReturn, 420)
  }
}

function finishPortalReturn() {
  window.clearTimeout(portalNavigationTimer)
  window.clearTimeout(portalWatchdog)
  window.clearTimeout(portalFallbackTimer)
  portalMode.value = null
  portalVeilVisible.value = false
  contentHidden.value = false
  transitionLocked.value = false
}

async function finishPortalNavigation() {
  if (unmounted || portalMode.value !== 'entering' || !portalTargetPath.value) return
  portalMode.value = 'navigating'
  window.clearTimeout(portalWatchdog)
  try {
    const failure = await router.push(portalTargetPath.value)
    if (failure && !unmounted) recoverPortal()
  } catch {
    if (!unmounted) recoverPortal()
  }
}

function recoverPortal() {
  crystalScene.value?.resetSection(activeSection.value.id)
  finishPortalReturn()
  portalTargetPath.value = ''
}

function onPortalProgress(_sectionId, kind, progress) {
  if (kind === 'portal-enter' && portalMode.value === 'entering' && progress >= 0.72) {
    portalVeilVisible.value = true
  }
}

function onPortalComplete(_sectionId, kind) {
  if (kind === 'portal-exit') {
    finishPortalReturn()
    return
  }
  if (kind !== 'portal-enter' || portalMode.value !== 'entering') return
  portalVeilVisible.value = true
  portalNavigationTimer = window.setTimeout(finishPortalNavigation, 120)
}

function openWriting({ category, path }) {
  if (interactionLocked.value || category !== activeSection.value.slug || !path) return
  transitionLocked.value = true
  contentHidden.value = true
  portalMode.value = 'entering'
  portalTargetPath.value = path
  wheelDelta = 0

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const started = crystalScene.value?.enterPortal(activeSection.value.id)
  portalWatchdog = window.setTimeout(() => {
    if (portalMode.value !== 'entering') return
    portalVeilVisible.value = true
    portalFallbackTimer = window.setTimeout(finishPortalNavigation, 400)
  }, 8000)

  if (!started) {
    portalVeilVisible.value = true
    portalFallbackTimer = window.setTimeout(finishPortalNavigation, reducedMotion ? 420 : 460)
  }
}

function onIntroRevealStart() {
  introRevealing.value = true
}

function onIntroComplete() {
  introComplete.value = true
  introRevealing.value = false
  markSessionIntroSeen()
}

watch(() => activeSection.value.id, () => {
  if (portalMode.value) recoverPortal()
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
  if (returningFromArticles) portalWatchdog = window.setTimeout(recoverPortal, 12000)
  if (returningFromArticles) markSessionIntroSeen()
  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  unmounted = true
  window.cancelAnimationFrame(portalRevealFrame)
  window.clearTimeout(portalWatchdog)
  window.removeEventListener('wheel', onWheel)
  window.removeEventListener('keydown', onKeydown)
  window.clearTimeout(wheelResetTimer)
  window.clearTimeout(contentSwapTimer)
  window.clearTimeout(contentRevealTimer)
  window.clearTimeout(portalNavigationTimer)
  window.clearTimeout(portalFallbackTimer)
})
</script>

<template>
  <div
    class="portfolio-view"
    :class="{
      'intro-active': !introComplete,
      'intro-revealing': introRevealing,
    }"
    :data-section="activeSection.id"
  >
    <div class="portfolio-stage">
      <CrystalScene
        ref="crystalScene"
        :section-id="activeSection.id"
        @scene-ready="onSceneReady"
        @scene-fallback="onSceneFallback"
        @transition-start="onTransitionStart"
        @transition-complete="onTransitionComplete"
        @portal-complete="onPortalComplete"
        @portal-progress="onPortalProgress"
      />
      <div class="ambient-background" aria-hidden="true"></div>

      <PortfolioHeader
        :active-section="activeSection"
        :navigation-locked="interactionLocked"
        @navigate="navigateTo"
      />

      <main
        class="portfolio-main"
        :class="[`content-${displayedSection.contentSide}`, { 'content-hidden': contentHidden, 'writing-scroll': ['02', '03'].includes(displayedSection.id) }]"
        :aria-label="displayedSection.navLabel"
      >
        <SectionContent :section="displayedSection" @open-writing="openWriting" />
      </main>

      <SectionIndicator
        :active-section="activeSection"
        :navigation-locked="interactionLocked"
        @navigate="navigateTo"
      />
    </div>

    <ZhenIntro
      v-if="showSessionIntro && !introComplete"
      :scene-ready="sceneReady"
      @reveal-start="onIntroRevealStart"
      @complete="onIntroComplete"
    />

    <LoadingOverlay
      :pending="returningLoadPending"
      @active-change="loadingOverlayActive = $event"
    />

    <div
      class="crystal-portal-veil"
      :class="{ 'is-visible': portalVeilVisible }"
      aria-hidden="true"
    ></div>
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

.crystal-portal-veil {
  position: fixed;
  inset: 0;
  z-index: 92;
  pointer-events: none;
  opacity: 0;
  background:
    radial-gradient(circle at 50% 48%, rgba(232, 227, 255, 0.95) 0 4%, rgba(159, 133, 255, 0.8) 18%, rgba(75, 52, 166, 0.68) 42%, rgba(5, 5, 20, 0.98) 82%),
    #080718;
  filter: saturate(1.1);
  transition: opacity 360ms cubic-bezier(0.4, 0, 1, 1);
}

.crystal-portal-veil::before,
.crystal-portal-veil::after {
  position: absolute;
  inset: 50% auto auto 50%;
  width: 42vmax;
  height: 42vmax;
  border: 1px solid rgba(224, 217, 255, 0.22);
  border-radius: 46% 54% 61% 39%;
  content: '';
  transform: translate(-50%, -50%) rotate(18deg);
}

.crystal-portal-veil::after {
  width: 66vmax;
  height: 66vmax;
  border-color: rgba(151, 128, 255, 0.16);
  transform: translate(-50%, -50%) rotate(-28deg);
}

.crystal-portal-veil.is-visible {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .crystal-portal-veil {
    transition-duration: 120ms;
  }
}

.portfolio-stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
  filter: none;
  transform: scale(1);
  transform-origin: center;
  transition:
    filter 1s cubic-bezier(0.22, 0.7, 0.2, 1),
    transform 1s cubic-bezier(0.22, 0.7, 0.2, 1);
}

.portfolio-view.intro-active .portfolio-stage {
  filter: blur(14px) brightness(0.58) saturate(0.82);
  transform: scale(1.035);
}

.portfolio-view.intro-active:not(.intro-revealing) .portfolio-stage {
  transition: none;
}

.portfolio-view.intro-revealing .portfolio-stage {
  filter: blur(0) brightness(1) saturate(1);
  transform: scale(1);
}

.ambient-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ambient-background {
  z-index: 1;
  background:
    radial-gradient(circle at 50% 48%, rgba(37, 45, 112, 0.045), transparent 62%);
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

.portfolio-main.writing-scroll {
  height: 100svh;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  pointer-events: auto;
}

.portfolio-main.writing-scroll :deep(.section-content) {
  align-self: safe center;
}

@media (max-height: 800px) {
  .portfolio-main.writing-scroll { padding-top: calc(var(--header-height) + 18px); }
  .writing-scroll :deep(.section-particle-title) { margin-top: 12px; height: 74px; }
  .writing-scroll :deep(.section-kicker),
  .writing-scroll :deep(.content-pending) { margin-top: 16px; }
  .writing-scroll :deep(.writing-preview) { margin-top: 18px; }
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
