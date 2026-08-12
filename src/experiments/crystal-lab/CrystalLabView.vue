<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { createCrystalLab } from './createCrystalLab'

const canvas = ref(null)
const status = ref('loading')
const errorMessage = ref('')
let lab = null

onMounted(async () => {
  try {
    lab = await createCrystalLab({
      canvas: canvas.value,
      onStatus(nextStatus) {
        status.value = nextStatus
      },
    })
  } catch (error) {
    status.value = 'fallback'
    errorMessage.value = error instanceof Error ? error.message : String(error)
  }
})

onBeforeUnmount(() => {
  lab?.dispose()
  lab = null
})
</script>

<template>
  <main class="crystal-lab" :data-status="status">
    <canvas ref="canvas" class="crystal-lab__canvas" aria-label="About crystal WebGL prototype"></canvas>

    <div class="crystal-lab__hud">
      <p>01 / ABOUT CRYSTAL LAB</p>
      <strong>{{ status === 'ready' ? 'REALTIME STUDY' : 'PREPARING OPTICS' }}</strong>
    </div>

    <div v-if="status === 'fallback'" class="crystal-lab__fallback" role="status">
      <strong>Crystal preview unavailable</strong>
      <span>{{ errorMessage || 'WebGL2 is required for this visual study.' }}</span>
    </div>
  </main>
</template>

<style scoped>
.crystal-lab {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background: #02040f;
}

.crystal-lab__canvas {
  position: absolute;
  z-index: 0;
  inset: 0;
  display: block;
  width: 100vw;
  height: 100dvh;
}

.crystal-lab__hud {
  position: absolute;
  z-index: 2;
  top: 28px;
  left: 32px;
  color: rgba(230, 234, 255, 0.68);
  font-family: var(--font-ui);
  letter-spacing: 0.22em;
  pointer-events: none;
}

.crystal-lab__hud p {
  margin: 0 0 8px;
  font-size: 10px;
}

.crystal-lab__hud strong {
  color: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  font-weight: 500;
}

.crystal-lab__fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 8px;
  padding: 24px;
  color: #e9ecff;
  text-align: center;
}

.crystal-lab__fallback span {
  color: rgba(222, 226, 247, 0.62);
  font-size: 13px;
}
</style>
