<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createParticleFace } from './createParticleFace'

const props = defineProps({ focused: Boolean, typing: Boolean })
const host = ref(null)
const unavailable = ref(false)
const options = ['smile', 'listen', 'surprise', 'wink', 'think', 'happy']
let face = null
let idleExpression = options[Math.floor(Math.random() * options.length)]
let cleanup = () => {}

function randomExpression() {
  const choices = options.filter(id => id !== idleExpression)
  idleExpression = choices[Math.floor(Math.random() * choices.length)]
  face?.setExpression(idleExpression, 'roll')
}
function resetView() { face?.resetView() }
watch(() => props.focused, focused => {
  face?.setExpression(focused ? 'listen' : idleExpression, 'morph')
})
onMounted(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const config = { initialExpression: props.focused ? 'listen' : idleExpression, reducedMotion: motion.matches, fitToCard: true }
  try {
    face = createParticleFace(host.value, config)
  } catch (error) {
    unavailable.value = true
    console.warn('Particle face unavailable', error)
    return
  }
  const changeMotion = () => { config.reducedMotion = motion.matches }
  motion.addEventListener('change', changeMotion)
  const observer = new IntersectionObserver(entries => face?.setPaused(!entries[0].isIntersecting))
  observer.observe(host.value)
  cleanup = () => { observer.disconnect(); motion.removeEventListener('change', changeMotion) }
})
onBeforeUnmount(() => { cleanup(); face?.destroy(); face = null })
</script>

<template>
  <div class="particle-smile">
    <div v-if="!unavailable" ref="host" class="particle-smile__surface" role="button" tabindex="0"
      aria-label="粒子笑脸，拖动调整视角，双击或按回车随机切换表情"
      @dblclick="randomExpression" @keydown.enter.prevent="randomExpression" @keydown.space.prevent="randomExpression"></div>
    <p v-else class="particle-smile__hint">当前设备暂不支持粒子互动</p>
    <div class="particle-smile__controls" v-if="!unavailable">
      <span>拖动看一看 · 双击换表情</span>
      <button type="button" @click="resetView">重置视角</button>
    </div>
  </div>
</template>

<style scoped>
.particle-smile { display: flex; flex-direction: column; width: 100%; min-height: 240px; height: 100%; }
.particle-smile__surface { width: 100%; min-height: 210px; height: 230px; flex: 1; touch-action: none; cursor: grab; border-radius: 12px; }
.particle-smile__surface:active { cursor: grabbing; }
.particle-smile__surface:focus-visible { outline: 1px solid #b7a0ff; outline-offset: 2px; }
.particle-smile__surface :deep(canvas) { display: block; width: 100%; height: 100%; }
.particle-smile__controls { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 8px; padding: 8px 4px; color: var(--color-muted); font: 10px/1.6 var(--font-ui); }
.particle-smile__controls button { border: 1px solid rgba(183,160,255,.28); border-radius: 5px; background: transparent; color: #c9baff; padding: 4px 8px; cursor: pointer; font: inherit; }
.particle-smile__controls button:focus-visible { outline: 1px solid #b7a0ff; }
.particle-smile__hint { color: var(--color-muted); text-align: center; margin: auto; }
</style>
