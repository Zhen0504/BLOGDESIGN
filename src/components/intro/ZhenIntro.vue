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
    <div class="zhen-intro__aura" aria-hidden="true"></div>
    <svg
      class="zhen-intro__mark"
      viewBox="0 0 920 250"
      role="img"
      aria-label="ZHEN"
    >
      <defs>
        <linearGradient id="zhen-main-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#8772ff" />
          <stop offset="0.38" stop-color="#d9d2ff" />
          <stop offset="0.72" stop-color="#82c9ff" />
          <stop offset="1" stop-color="#d5aa66" />
        </linearGradient>
        <linearGradient id="zhen-accent-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#6d4cff" />
          <stop offset="0.48" stop-color="#bf8cff" />
          <stop offset="0.78" stop-color="#75d5ff" />
          <stop offset="1" stop-color="#f1bf6d" />
        </linearGradient>
        <filter id="zhen-soft-glow" x="-35%" y="-80%" width="170%" height="260%">
          <feGaussianBlur stdDeviation="5.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <text class="zhen-intro__ghost" x="460" y="164" text-anchor="middle">ZHEN</text>
      <text class="zhen-intro__stroke" x="460" y="164" text-anchor="middle">ZHEN</text>
      <text class="zhen-intro__accent" x="460" y="164" text-anchor="middle">ZHEN</text>
      <text class="zhen-intro__fill" x="460" y="164" text-anchor="middle">ZHEN</text>
    </svg>
    <span class="zhen-intro__resolved" aria-hidden="true">ZHEN</span>
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
  background: rgba(1, 2, 12, 0.28);
  opacity: 1;
  pointer-events: auto;
  transition: opacity 1s cubic-bezier(0.22, 0.7, 0.2, 1);
}

.zhen-intro[data-phase='revealing'],
.zhen-intro[data-phase='complete'] {
  opacity: 0;
  pointer-events: none;
}

.zhen-intro__aura {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(72vw, 980px);
  aspect-ratio: 2.8;
  border-radius: 50%;
  background:
    radial-gradient(ellipse, rgba(105, 73, 255, 0.18), rgba(53, 76, 197, 0.065) 42%, transparent 72%);
  filter: blur(22px);
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.68);
  animation: zhen-aura 3.5s ease-out forwards;
}

.zhen-intro__mark {
  position: relative;
  width: min(72vw, 780px);
  overflow: visible;
}

.zhen-intro__resolved {
  position: absolute;
  top: 50%;
  left: 50%;
  color: transparent;
  font-family: var(--font-display), 'Times New Roman', serif;
  font-size: clamp(82px, 9.6vw, 138px);
  font-weight: 420;
  letter-spacing: 0.24em;
  line-height: 1;
  white-space: nowrap;
  background: linear-gradient(90deg, #8772ff, #d9d2ff 38%, #82c9ff 72%, #d5aa66);
  background-clip: text;
  filter: drop-shadow(0 0 14px rgba(116, 91, 255, 0.54));
  opacity: 0;
  transform: translate(-48%, -52%);
  transition: opacity 220ms ease-out;
}

.zhen-intro__mark text {
  font-family: var(--font-display), 'Times New Roman', serif;
  font-size: 138px;
  font-weight: 420;
  letter-spacing: 0.24em;
  paint-order: stroke fill;
}

.zhen-intro__ghost {
  fill: transparent;
  stroke: rgba(156, 143, 224, 0.13);
  stroke-width: 1.2;
}

.zhen-intro__stroke {
  fill: transparent;
  stroke: url(#zhen-main-gradient);
  stroke-width: 2.15;
  stroke-dasharray: 1680;
  stroke-dashoffset: 1680;
  filter: url(#zhen-soft-glow);
  animation: zhen-draw 2.75s cubic-bezier(0.58, 0.02, 0.2, 1) forwards;
}

.zhen-intro__accent {
  fill: transparent;
  stroke: url(#zhen-accent-gradient);
  stroke-width: 4.1;
  stroke-linecap: round;
  stroke-dasharray: 18 310;
  stroke-dashoffset: 920;
  filter: url(#zhen-soft-glow);
  opacity: 0;
  animation:
    zhen-accent-reveal 280ms 350ms ease-out forwards,
    zhen-accent-travel 2.65s 350ms cubic-bezier(0.52, 0, 0.38, 1) forwards;
}

.zhen-intro__fill {
  fill: url(#zhen-main-gradient);
  opacity: 0;
  stroke: transparent;
  animation: zhen-fill 760ms 2.35s ease-out forwards;
}

.zhen-intro[data-phase='holding'] .zhen-intro__fill {
  animation: zhen-hold 2.4s ease-in-out infinite;
}

.zhen-intro[data-phase='holding'] .zhen-intro__mark {
  opacity: 0.12;
}

.zhen-intro[data-phase='holding'] .zhen-intro__resolved {
  opacity: 0.92;
}

.zhen-intro[data-phase='holding'] .zhen-intro__stroke {
  stroke-dashoffset: 0;
  opacity: 1;
  animation: none;
}

.zhen-intro[data-phase='holding'] .zhen-intro__accent {
  stroke-dashoffset: 0;
  opacity: 0.88;
  animation: zhen-accent-hold 1.8s ease-in-out infinite;
}

.zhen-intro[data-phase='holding'] .zhen-intro__caption {
  color: rgba(198, 199, 227, 0.42);
  animation: none;
}

.zhen-intro__caption {
  margin: -20px 0 0;
  color: rgba(198, 199, 227, 0);
  font-family: var(--font-ui);
  font-size: 8px;
  letter-spacing: 0.42em;
  text-indent: 0.42em;
  animation: zhen-caption 820ms 2.55s ease-out forwards;
}

@keyframes zhen-draw {
  0% { stroke-dashoffset: 1680; opacity: 0.25; }
  18% { opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 1; }
}

@keyframes zhen-accent-reveal {
  to { opacity: 0.96; }
}

@keyframes zhen-accent-travel {
  from { stroke-dashoffset: 920; }
  to { stroke-dashoffset: -160; }
}

@keyframes zhen-accent-hold {
  0%, 100% { stroke-dashoffset: 0; opacity: 0.66; }
  50% { stroke-dashoffset: -42; opacity: 0.96; }
}

@keyframes zhen-fill {
  to { opacity: 0.72; }
}

@keyframes zhen-hold {
  0%, 100% { opacity: 0.68; }
  50% { opacity: 0.88; }
}

@keyframes zhen-caption {
  to { color: rgba(198, 199, 227, 0.42); }
}

@keyframes zhen-aura {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.68); }
  48% { opacity: 0.8; }
  100% { opacity: 0.56; transform: translate(-50%, -50%) scale(1); }
}

@media (max-width: 760px) {
  .zhen-intro__mark {
    width: min(90vw, 620px);
  }


  .zhen-intro__resolved {
    font-size: clamp(66px, 18vw, 112px);
    letter-spacing: 0.17em;
  }

  .zhen-intro__mark text {
    font-size: 120px;
    letter-spacing: 0.17em;
  }

  .zhen-intro__caption {
    max-width: 78vw;
    margin-top: -34px;
    text-align: center;
    line-height: 1.8;
  }
}

@media (prefers-reduced-motion: reduce) {
  .zhen-intro__aura,
  .zhen-intro__stroke,
  .zhen-intro__accent,
  .zhen-intro__fill,
  .zhen-intro__caption {
    animation: none;
  }

  .zhen-intro__aura { opacity: 0.5; transform: translate(-50%, -50%); }
  .zhen-intro__stroke { stroke-dashoffset: 0; }
  .zhen-intro__accent { opacity: 0.8; stroke-dashoffset: 0; }
  .zhen-intro__fill { opacity: 0.72; }
  .zhen-intro__caption { color: rgba(198, 199, 227, 0.42); }
}
</style>
