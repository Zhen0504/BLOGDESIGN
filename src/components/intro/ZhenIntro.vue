<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  sceneReady: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['reveal-start', 'complete'])
const phase = ref('drawing')
const minimumHoldReached = ref(false)
const reducedMotion = ref(false)
let holdTimer = 0
let drawingTimer = 0
let timeoutTimer = 0
let completeTimer = 0
let revealing = false

function beginReveal() {
  if (revealing) return
  revealing = true
  phase.value = 'revealing'
  emit('reveal-start')
  completeTimer = window.setTimeout(() => {
    phase.value = 'complete'
    emit('complete')
  }, reducedMotion.value ? 520 : 1000)
}

function releaseWhenReady() {
  if (minimumHoldReached.value && props.sceneReady) beginReveal()
}

onMounted(() => {
  reducedMotion.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const minimumDuration = reducedMotion.value ? 760 : 3500
  drawingTimer = window.setTimeout(() => {
    phase.value = 'holding'
  }, reducedMotion.value ? 120 : 2800)
  holdTimer = window.setTimeout(() => {
    minimumHoldReached.value = true
    releaseWhenReady()
  }, minimumDuration)

  timeoutTimer = window.setTimeout(() => {
    minimumHoldReached.value = true
    beginReveal()
  }, reducedMotion.value ? 1800 : 9000)
})

watch(() => props.sceneReady, releaseWhenReady)

onBeforeUnmount(() => {
  window.clearTimeout(holdTimer)
  window.clearTimeout(drawingTimer)
  window.clearTimeout(timeoutTimer)
  window.clearTimeout(completeTimer)
})
</script>

<template>
  <div class="zhen-intro" :data-phase="phase" role="status" aria-label="ZHEN — loading portfolio">
    <div class="zhen-intro__loader" aria-hidden="true">
      <svg class="zhen-intro__glyph" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="zhen-gradient-z" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stop-color="#9a70ff" />
            <stop offset="1" stop-color="#4d77ff" />
          </linearGradient>
        </defs>
        <path
          class="zhen-intro__dash"
          style="--dash-delay: 0ms"
          d="M 10 11 H 54 L 10 53 H 54"
          pathLength="360"
          stroke="url(#zhen-gradient-z)"
        />
      </svg>

      <svg class="zhen-intro__glyph" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="zhen-gradient-h" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stop-color="#d8d1ff" />
            <stop offset="1" stop-color="#7959ff" />
          </linearGradient>
        </defs>
        <path
          class="zhen-intro__dash"
          style="--dash-delay: 90ms"
          d="M 10 8 V 56 M 54 8 V 56 M 10 32 H 54"
          pathLength="360"
          stroke="url(#zhen-gradient-h)"
        />
      </svg>

      <svg class="zhen-intro__glyph" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="zhen-gradient-e" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stop-color="#72d8ff" />
            <stop offset="1" stop-color="#6b55ff" />
          </linearGradient>
        </defs>
        <path
          class="zhen-intro__dash"
          style="--dash-delay: 180ms"
          d="M 54 10 H 10 V 54 H 54 M 10 32 H 47"
          pathLength="360"
          stroke="url(#zhen-gradient-e)"
        />
      </svg>

      <svg class="zhen-intro__glyph" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="zhen-gradient-n" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stop-color="#efbd67" />
            <stop offset="1" stop-color="#8d64ff" />
          </linearGradient>
        </defs>
        <path
          class="zhen-intro__dash"
          style="--dash-delay: 270ms"
          d="M 10 56 V 8 L 54 56 V 8"
          pathLength="360"
          stroke="url(#zhen-gradient-n)"
        />
      </svg>
    </div>
    <p class="zhen-intro__caption">PERSONAL ARCHIVE · DEVELOPMENT · RESEARCH</p>
  </div>
</template>

<style scoped>
.zhen-intro {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  align-content: center;
  justify-items: center;
  overflow: hidden;
  color: #f0edff;
  background: rgba(1, 2, 12, 0.24);
  opacity: 1;
  pointer-events: auto;
  transition: opacity 1s cubic-bezier(0.22, 0.7, 0.2, 1);
}

.zhen-intro[data-phase='revealing'],
.zhen-intro[data-phase='complete'] {
  opacity: 0;
  pointer-events: none;
}

.zhen-intro__loader {
  display: flex;
  gap: clamp(5px, 0.7vw, 11px);
  align-items: center;
  justify-content: center;
  width: min(68vw, 620px);
}

.zhen-intro__glyph {
  display: block;
  flex: 1 1 0;
  max-width: 132px;
  overflow: visible;
}

.zhen-intro__dash {
  fill: none;
  stroke-width: 5.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 0 1 359 0;
  stroke-dashoffset: 365;
  animation:
    zhen-dash-array 2.5s ease-in-out var(--dash-delay) both,
    zhen-dash-offset 2.5s linear var(--dash-delay) both;
}

.zhen-intro[data-phase='holding'] .zhen-intro__dash {
  stroke-dasharray: 359 1 0 0;
  stroke-dashoffset: 5;
  animation: none;
}

.zhen-intro[data-phase='holding'] .zhen-intro__caption {
  color: rgba(198, 199, 227, 0.42);
  animation: none;
}

.zhen-intro__caption {
  margin: 24px 0 0;
  color: rgba(198, 199, 227, 0);
  font-family: var(--font-ui);
  font-size: 8px;
  letter-spacing: 0.42em;
  text-indent: 0.42em;
  animation: zhen-caption 620ms 2.28s ease-out forwards;
}

@keyframes zhen-dash-array {
  0% { stroke-dasharray: 0 1 359 0; }
  50% { stroke-dasharray: 0 359 1 0; }
  100% { stroke-dasharray: 359 1 0 0; }
}

@keyframes zhen-dash-offset {
  from { stroke-dashoffset: 365; }
  to { stroke-dashoffset: 5; }
}

@keyframes zhen-caption {
  to { color: rgba(198, 199, 227, 0.42); }
}

@media (max-width: 760px) {
  .zhen-intro__loader {
    width: min(86vw, 520px);
  }

  .zhen-intro__caption {
    max-width: 78vw;
    margin-top: 18px;
    text-align: center;
    line-height: 1.8;
  }
}

@media (prefers-reduced-motion: reduce) {
  .zhen-intro__dash,
  .zhen-intro__caption {
    animation: none;
  }

  .zhen-intro__dash { stroke-dasharray: 359 1 0 0; stroke-dashoffset: 5; }
  .zhen-intro__caption { color: rgba(198, 199, 227, 0.42); }
}
</style>
