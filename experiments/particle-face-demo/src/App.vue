<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { createParticleFace } from '../../../src/components/about/createParticleFace.js'

const expressionOptions = [
  { id: 'smile', label: '微笑' },
  { id: 'listen', label: '向左倾听' },
  { id: 'surprise', label: '惊喜' },
  { id: 'wink', label: '眨眼' },
  { id: 'think', label: '思考' },
  { id: 'happy', label: '开心眯眼' },
]

const selectedExpression = ref('smile')
const transitionMode = ref('roll')
const autoPlay = ref(false)
const paused = ref(false)
const particleSize = ref(0.046)
const particleCount = ref(2600)
const breathAmount = ref(0.03)
const breathSpeed = ref(0.2)
const particleColor = ref('#D9D0FF')
const canvasHost = ref(null)
const statusText = computed(() => paused.value ? '动画已暂停' : autoPlay.value ? '自动轮播中' : '手动观察')

let demo = null
let autoTimer = 0

function setExpression(id) {
  selectedExpression.value = id
  demo?.setExpression(id, transitionMode.value)
}
function toggleAuto() {
  autoPlay.value = !autoPlay.value
  if (autoPlay.value) scheduleAutoPlay()
  else window.clearTimeout(autoTimer)
}
function scheduleAutoPlay() {
  window.clearTimeout(autoTimer)
  if (!autoPlay.value) return
  autoTimer = window.setTimeout(() => {
    const current = expressionOptions.findIndex((item) => item.id === selectedExpression.value)
    setExpression(expressionOptions[(current + 1) % expressionOptions.length].id)
    scheduleAutoPlay()
  }, 3200)
}
function resetView() { demo?.resetView() }
function togglePause() { paused.value = !paused.value; demo?.setPaused(paused.value) }
function updateColor() { demo?.setColor(particleColor.value) }
function updateSettings() {
  demo?.setSettings({
    particleSize: particleSize.value,
    particleCount: particleCount.value,
    breathAmount: breathAmount.value,
    breathSpeed: breathSpeed.value,
  })
}

onMounted(() => {
  demo = createParticleFace(canvasHost.value, {
    onExpressionChange: (id) => { selectedExpression.value = id },
    onSettingsChange: updateSettings,
  })
})
onBeforeUnmount(() => {
  window.clearTimeout(autoTimer)
  demo?.destroy()
})
</script>

<template>
  <main class="demo-shell">
    <header class="demo-header">
      <div>
        <p class="eyebrow">EXPERIMENT / 3D PARTICLE FACE</p>
        <h1>粒子笑脸实验</h1>
        <p class="lede">先观察体积、留白和表情变形，再决定它是否回到 ABOUT ME。</p>
      </div>
      <span class="status" aria-live="polite"><i></i>{{ statusText }}</span>
    </header>

    <section class="stage-panel" aria-label="3D 粒子笑脸预览">
      <div ref="canvasHost" class="canvas-host"></div>
      <p class="stage-hint">拖动脸部观察小角度侧面 · 正脸始终是主体</p>
    </section>

    <section class="control-panel" aria-label="粒子笑脸控制面板">
      <div class="expression-row">
        <div>
          <p class="control-label">切换方式</p>
          <div class="expression-buttons">
            <button type="button" :class="{ active: transitionMode === 'morph' }" @click="transitionMode = 'morph'">平滑变形</button>
            <button type="button" :class="{ active: transitionMode === 'roll' }" @click="transitionMode = 'roll'">轮胎式粒子流 · 0.65 秒</button>
          </div>
        </div>
        <div>
          <p class="control-label">EXPRESSIONS</p>
          <div class="expression-buttons">
            <button v-for="item in expressionOptions" :key="item.id" type="button" :class="{ active: selectedExpression === item.id }" @click="setExpression(item.id)">{{ item.label }}</button>
          </div>
        </div>
        <div class="action-buttons">
          <button type="button" :class="{ active: autoPlay }" @click="toggleAuto"><span class="toggle-dot"></span>自动轮播</button>
          <button type="button" @click="togglePause">{{ paused ? '继续动画' : '暂停动画' }}</button>
          <button type="button" @click="resetView">重置视角</button>
        </div>
      </div>
      <div class="settings-grid">
        <label>粒子大小 <output>{{ particleSize.toFixed(3) }}</output><input v-model.number="particleSize" type="range" min="0.018" max="0.06" step="0.001" @input="updateSettings" /></label>
        <label>粒子数量 <output>{{ particleCount }}</output><input v-model.number="particleCount" type="range" min="900" max="5200" step="100" @input="updateSettings" /></label>
        <label>呼吸幅度 <output>{{ Math.round(breathAmount * 100) }}%</output><input v-model.number="breathAmount" type="range" min="0" max="0.05" step="0.005" @input="updateSettings" /></label>
        <label>呼吸速度 <output>{{ breathSpeed.toFixed(2) }}</output><input v-model.number="breathSpeed" type="range" min="0.1" max="0.45" step="0.01" @input="updateSettings" /></label>
        <label class="color-control">统一粒子颜色 <output>{{ particleColor }}</output><input v-model="particleColor" type="color" @input="updateColor" /></label>
      </div>
    </section>
    <p class="scope-note">独立实验页 · 不连接博客表单、不写入后台、不修改正式笑脸</p>
  </main>
</template>
