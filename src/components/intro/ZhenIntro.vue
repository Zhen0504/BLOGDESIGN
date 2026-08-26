<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import LineWordmark from './LineWordmark.vue'

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
    <LineWordmark
      class="zhen-intro__loader"
      word="ZHEN"
      :animation="phase === 'drawing' ? 'once' : 'static'"
    />
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
  width: min(68vw, 620px);
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
  .zhen-intro__caption {
    animation: none;
  }

  .zhen-intro__caption { color: rgba(198, 199, 227, 0.42); }
}
</style>
