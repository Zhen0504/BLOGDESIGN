<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvasRef = ref(null)

let animationFrame = 0
let context = null
let points = []
let width = 0
let height = 0
let dpr = 1
let reduceMotion = false
let isFinePointer = false

const mouse = {
  x: -9999,
  y: -9999,
}

function buildPoints() {
  const gap = width < 760 ? 34 : 30
  points = []

  for (let y = gap / 2; y < height; y += gap) {
    for (let x = gap / 2; x < width; x += gap) {
      points.push({ x, y })
    }
  }
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = rect.width
  height = rect.height

  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  context = canvas.getContext('2d')
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  buildPoints()
  draw()
}

function draw() {
  if (!context) return

  context.clearRect(0, 0, width, height)

  for (const point of points) {
    const dx = point.x - mouse.x
    const dy = point.y - mouse.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const influence = isFinePointer && !reduceMotion ? Math.max(0, 1 - distance / 160) : 0
    const offset = influence * 6
    const angle = Math.atan2(dy, dx)
    const x = point.x + Math.cos(angle) * offset
    const y = point.y + Math.sin(angle) * offset
    const alpha = 0.18 + influence * 0.48

    context.beginPath()
    context.fillStyle = influence > 0.18 ? `rgba(17, 17, 17, ${alpha})` : `rgba(17, 17, 17, ${alpha})`
    context.arc(x, y, influence > 0.25 ? 1.6 : 1.15, 0, Math.PI * 2)
    context.fill()
  }
}

function animate() {
  draw()
  animationFrame = requestAnimationFrame(animate)
}

function handlePointerMove(event) {
  mouse.x = event.clientX
  mouse.y = event.clientY
}

function handlePointerLeave() {
  mouse.x = -9999
  mouse.y = -9999
}

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  isFinePointer = window.matchMedia('(pointer: fine)').matches

  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  if (isFinePointer && !reduceMotion) {
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerleave', handlePointerLeave)
    animate()
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerleave', handlePointerLeave)
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="particle-background"
    aria-hidden="true"
  />
</template>

<style scoped>
.particle-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
