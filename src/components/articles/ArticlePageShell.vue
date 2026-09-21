<script setup>
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { onBeforeUnmount, ref, watch } from 'vue'

import { setPendingCrystalReturn } from '../crystal-scene/portalTransitionState'

const props = defineProps({
  category: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const leaving = ref(false)
const route = useRoute()
const shell = ref(null)
let exitTimer = 0
let resolveExit = null
watch(() => route.fullPath, () => {
  leaving.value = false
  shell.value?.scrollTo({ top: 0, behavior: 'instant' })
}, { flush: 'post' })
const removeAfterEach = router.afterEach((_to, _from, failure) => {
  if (failure) {
    leaving.value = false
    setPendingCrystalReturn(null)
  }
})
onBeforeUnmount(() => {
  window.clearTimeout(exitTimer)
  resolveExit?.()
  removeAfterEach()
})

function crystalPath() {
  return `/${props.category}`
}

async function pauseForExit() {
  if (leaving.value) return
  leaving.value = true
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  await new Promise((resolve) => {
    resolveExit = resolve
    exitTimer = window.setTimeout(resolve, reduced ? 120 : 360)
  })
}

function backToCrystal() {
  if (leaving.value) return
  router.push(crystalPath()).catch(() => {
    leaving.value = false
    setPendingCrystalReturn(null)
  })
}

onBeforeRouteLeave(async (to) => {
  if (to.name !== 'portfolio' || to.params.section !== props.category) return true
  setPendingCrystalReturn(props.category)
  await pauseForExit()
  return true
})
</script>

<template>
  <div ref="shell" class="article-page-shell" :class="{ 'is-leaving': leaving }">
    <div class="article-page-shell__stars" aria-hidden="true"></div>
    <header class="article-page-shell__header">
      <button type="button" class="article-page-shell__back" @click="backToCrystal">
        <span aria-hidden="true">←</span>
        BACK TO CRYSTAL
      </button>
      <span class="article-page-shell__brand">ZHEN</span>
    </header>
    <main class="article-page-shell__main">
      <slot />
    </main>
    <div class="article-page-shell__veil" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.article-page-shell {
  position: fixed;
  inset: 0;
  overflow: auto;
  background:
    radial-gradient(circle at 82% 18%, rgba(91, 68, 184, 0.13), transparent 31%),
    radial-gradient(circle at 18% 76%, rgba(51, 48, 135, 0.1), transparent 32%),
    #030512;
  color: var(--color-text);
  animation: article-page-reveal 520ms cubic-bezier(0.22, 0.7, 0.2, 1) both;
}

.article-page-shell__stars {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.34;
  background-image:
    radial-gradient(circle, rgba(167, 151, 255, 0.5) 0 1px, transparent 1.5px),
    radial-gradient(circle, rgba(238, 236, 255, 0.35) 0 1px, transparent 1.4px);
  background-position: 0 0, 43px 61px;
  background-size: 137px 149px, 193px 181px;
  mask-image: linear-gradient(to bottom, black, transparent 82%);
}

.article-page-shell__header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1180px, calc(100% - 48px));
  min-height: 82px;
  margin: 0 auto;
}

.article-page-shell__back {
  border: 0;
  padding: 12px 0;
  background: none;
  color: rgba(222, 221, 237, 0.66);
  font-family: var(--font-ui);
  font-size: 9px;
  letter-spacing: 0.25em;
  cursor: pointer;
}

.article-page-shell__back span {
  margin-right: 12px;
  color: var(--color-gold);
}

.article-page-shell__brand {
  color: rgba(241, 239, 247, 0.84);
  font-size: 11px;
  letter-spacing: 0.42em;
}

.article-page-shell__main {
  position: relative;
  z-index: 1;
  width: min(1120px, calc(100% - 48px));
  margin: 0 auto;
  padding: clamp(52px, 8vh, 96px) 0 100px;
}

.article-page-shell__veil {
  position: fixed;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  background:
    radial-gradient(circle, rgba(211, 202, 255, 0.92), rgba(91, 67, 196, 0.74) 38%, #080718 82%);
  opacity: 0;
  transition: opacity 360ms cubic-bezier(0.4, 0, 1, 1);
}

.article-page-shell.is-leaving .article-page-shell__veil {
  opacity: 1;
}

@keyframes article-page-reveal {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 760px) {
  .article-page-shell__header,
  .article-page-shell__main {
    width: min(100% - 34px, 720px);
  }

  .article-page-shell__main {
    padding-top: 38px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-page-shell {
    animation-duration: 180ms;
  }

  .article-page-shell__veil {
    transition-duration: 120ms;
  }
}
</style>
