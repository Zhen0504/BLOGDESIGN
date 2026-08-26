<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

import LineWordmark from './LineWordmark.vue'

const props = defineProps({
  pending: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['active-change'])
const phase = ref('hidden')
const settled = ref(false)
let showTimer = 0
let settleTimer = 0
let hideTimer = 0
let timeoutTimer = 0
let visibleAt = 0
let timedOut = false

const SHOW_DELAY = 300
const MIN_VISIBLE = 500
const SETTLE_DELAY = 280
const EXIT_CAP = 700
const FADE_DURATION = 400
const HARD_TIMEOUT = 10000

function clearTimers() {
  window.clearTimeout(showTimer)
  window.clearTimeout(settleTimer)
  window.clearTimeout(hideTimer)
  window.clearTimeout(timeoutTimer)
  showTimer = 0
  settleTimer = 0
  hideTimer = 0
  timeoutTimer = 0
}

function finish() {
  if (phase.value === 'hidden' || phase.value === 'finishing') return
  settled.value = true
  const visibleFor = performance.now() - visibleAt
  const wait = Math.min(EXIT_CAP, Math.max(SETTLE_DELAY, MIN_VISIBLE - visibleFor))
  settleTimer = window.setTimeout(() => {
    phase.value = 'finishing'
    hideTimer = window.setTimeout(() => {
      phase.value = 'hidden'
      settled.value = false
      emit('active-change', false)
    }, FADE_DURATION)
  }, wait)
}

function show() {
  if (!props.pending || timedOut) return
  phase.value = 'visible'
  settled.value = false
  visibleAt = performance.now()
  emit('active-change', true)
  timeoutTimer = window.setTimeout(() => {
    timedOut = true
    finish()
  }, HARD_TIMEOUT)
}

function startWaiting() {
  clearTimers()
  timedOut = false
  settled.value = false
  phase.value = 'waiting'
  showTimer = window.setTimeout(show, SHOW_DELAY)
}

watch(() => props.pending, (pending) => {
  if (pending) {
    if (phase.value === 'hidden') startWaiting()
    return
  }

  window.clearTimeout(showTimer)
  window.clearTimeout(timeoutTimer)
  if (phase.value === 'waiting') {
    phase.value = 'hidden'
    settled.value = false
  } else if (phase.value === 'visible') {
    finish()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  clearTimers()
  if (phase.value === 'visible' || phase.value === 'finishing') emit('active-change', false)
})
</script>

<template>
  <div
    v-if="phase !== 'hidden'"
    class="loading-overlay"
    :data-phase="phase"
    role="status"
    aria-live="polite"
    aria-label="Loading portfolio. Network conditions may delay the experience."
  >
    <LineWordmark
      class="loading-overlay__wordmark"
      word="LOADING"
      :animation="settled ? 'static' : 'loop'"
    />
    <p class="loading-overlay__caption">NETWORK CONDITIONS MAY DELAY THE EXPERIENCE.</p>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 96;
  display: grid;
  align-content: center;
  justify-items: center;
  overflow: hidden;
  background: rgba(1, 2, 11, 0.46);
  backdrop-filter: blur(11px) brightness(0.66) saturate(0.82);
  opacity: 1;
  pointer-events: auto;
  transition: opacity 400ms cubic-bezier(0.22, 0.7, 0.2, 1);
}

.loading-overlay[data-phase='waiting'] {
  opacity: 0;
  pointer-events: none;
}

.loading-overlay[data-phase='finishing'] {
  opacity: 0;
  pointer-events: none;
}

.loading-overlay__wordmark {
  width: min(72vw, 560px);
}

.loading-overlay__caption {
  margin: 24px 0 0;
  color: rgba(198, 199, 227, 0.46);
  font-family: var(--font-ui);
  font-size: 8px;
  letter-spacing: 0.38em;
  line-height: 1.8;
  text-align: center;
  text-indent: 0.38em;
}

@media (max-width: 760px) {
  .loading-overlay__wordmark {
    width: min(88vw, 520px);
  }

  .loading-overlay__caption {
    max-width: 82vw;
    margin-top: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-overlay {
    transition-duration: 180ms;
  }
}
</style>
