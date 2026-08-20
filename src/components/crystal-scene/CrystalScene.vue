<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { createWelcomeCrystalScene } from './createWelcomeCrystalScene'

const props = defineProps({
  sectionId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['transition-start', 'transition-complete'])
const canvas = ref(null)
const status = ref('loading')
const statusMessage = ref('Loading crystal system 0 / 5')
let sceneApi = null

onMounted(async () => {
  try {
    sceneApi = await createWelcomeCrystalScene({
      canvas: canvas.value,
      initialSection: props.sectionId,
      onStatus(nextStatus, message) {
        status.value = nextStatus
        statusMessage.value = message
      },
      onTransitionStart(sectionId) {
        emit('transition-start', sectionId)
      },
      onTransitionComplete(sectionId) {
        emit('transition-complete', sectionId)
      },
    })
  } catch (error) {
    console.error('Welcome crystal scene failed to initialize.', error)
  }
})

watch(() => props.sectionId, (sectionId) => {
  sceneApi?.setSection(sectionId)
})

onBeforeUnmount(() => {
  sceneApi?.dispose()
  sceneApi = null
})
</script>

<template>
  <div class="crystal-scene" :data-status="status" aria-hidden="true">
    <canvas ref="canvas" class="crystal-scene__canvas"></canvas>
    <p v-if="status === 'loading'" class="crystal-scene__status">{{ statusMessage }}</p>
    <p v-else-if="status === 'fallback'" class="crystal-scene__status crystal-scene__status--error">
      Crystal visual unavailable
    </p>
  </div>
</template>

<style scoped>
.crystal-scene,
.crystal-scene__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.crystal-scene {
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.crystal-scene__canvas {
  display: block;
  pointer-events: auto;
}

.crystal-scene__status {
  position: absolute;
  right: clamp(28px, 5vw, 72px);
  bottom: 30px;
  margin: 0;
  color: rgba(224, 228, 250, 0.48);
  font-family: var(--font-ui);
  font-size: 9px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.crystal-scene__status--error {
  color: rgba(238, 190, 170, 0.65);
}
</style>
