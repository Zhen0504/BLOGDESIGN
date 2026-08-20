<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  particleSize: { type: Number, default: 1.7 },
  density: { type: Number, default: 4 },
  color: { type: String, default: '#eeeaf8' },
  highlightColor: { type: String, default: '#8064ff' },
  scatter: { type: Number, default: 120 },
  gatherDuration: { type: Number, default: 1400 },
  stagger: { type: Number, default: 340 },
  pointerRepel: { type: Number, default: 34 },
  repelRadius: { type: Number, default: 110 },
  idleDrift: { type: Number, default: 0.55 },
  fontSize: { type: String, default: 'clamp(52px, 5.8vw, 92px)' },
  fontWeight: { type: [String, Number], default: 500 },
  fontFamily: { type: String, default: 'inherit' },
  glow: { type: Boolean, default: true },
})

const container = ref(null)
const canvas = ref(null)
let cleanup = null

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value))
const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3)

function parseHex(hex) {
  const clean = hex.replace('#', '').trim()
  if (!/^[0-9a-f]{6}$/i.test(clean)) return null
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
  }
}

function mixColor(from, to, amount) {
  if (!from || !to) return props.color
  const channel = (key) => Math.round(from[key] + (to[key] - from[key]) * amount)
  return `rgb(${channel('r')}, ${channel('g')}, ${channel('b')})`
}

async function setup() {
  cleanup?.()
  await nextTick()
  const host = container.value
  const surface = canvas.value
  const context = surface?.getContext('2d', { alpha: true })
  if (!host || !surface || !context) return

  let particles = []
  let animationFrame = 0
  let resizeFrame = 0
  let buildId = 0
  let gathering = false
  let gatherStartedAt = 0
  let width = 0
  let height = 0
  let dpr = 1
  let reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const pointer = { active: false, x: 0, y: 0, smoothX: 0, smoothY: 0 }

  function startGather(scatterFirst = true) {
    if (!particles.length || reducedMotion) return
    const now = performance.now()
    particles.forEach((particle) => {
      if (scatterFirst) {
        const angle = particle.seed * Math.PI * 2
        const distance = props.scatter * (0.3 + particle.depth * 0.68)
        particle.x = particle.targetX + Math.cos(angle) * distance
        particle.y = particle.targetY + Math.sin(angle) * distance
      }
      particle.startX = particle.x
      particle.startY = particle.y
      particle.delay = particle.seed * props.stagger
    })
    gatherStartedAt = now
    gathering = true
  }

  function render(now) {
    if (document.hidden) {
      animationFrame = 0
      return
    }
    context.clearRect(0, 0, width, height)
    pointer.smoothX += (pointer.x - pointer.smoothX) * 0.16
    pointer.smoothY += (pointer.y - pointer.smoothY) * 0.16
    context.shadowBlur = props.glow && !reducedMotion ? props.particleSize * 3.2 : 0
    context.shadowColor = props.highlightColor
    let complete = true

    particles.forEach((particle) => {
      let baseX = particle.targetX
      let baseY = particle.targetY
      let progress = 1
      if (gathering) {
        const local = (now - gatherStartedAt - particle.delay) / Math.max(1, props.gatherDuration)
        progress = clamp(local, 0, 1)
        const eased = easeOutCubic(progress)
        baseX = particle.startX + (particle.targetX - particle.startX) * eased
        baseY = particle.startY + (particle.targetY - particle.startY) * eased
        if (progress < 1) complete = false
      } else if (!reducedMotion) {
        const seconds = now * 0.001
        baseX += Math.sin(seconds * 0.82 + particle.seed * 11) * props.idleDrift * particle.depth
        baseY += Math.cos(seconds * 0.68 + particle.depth * 9) * props.idleDrift * particle.depth
      }

      if (pointer.active && !reducedMotion) {
        const dx = baseX - pointer.smoothX
        const dy = baseY - pointer.smoothY
        const distance = Math.hypot(dx, dy)
        if (distance > 0 && distance < props.repelRadius) {
          const force = Math.pow(1 - distance / props.repelRadius, 2) * props.pointerRepel
          baseX += dx / distance * force
          baseY += dy / distance * force
        }
      }

      const follow = reducedMotion ? 1 : 0.2
      particle.x += (baseX - particle.x) * follow
      particle.y += (baseY - particle.y) * follow
      context.globalAlpha = clamp(0.26 + progress * 0.74, 0, 1)
      context.fillStyle = particle.color
      const size = particle.size
      if (size < 2.15) {
        context.fillRect(particle.x - size / 2, particle.y - size / 2, size, size)
      } else {
        context.beginPath()
        context.arc(particle.x, particle.y, size / 2, 0, Math.PI * 2)
        context.fill()
      }
    })

    context.globalAlpha = 1
    context.shadowBlur = 0
    if (gathering && complete) gathering = false
    animationFrame = requestAnimationFrame(render)
  }

  async function sampleText() {
    const currentBuild = ++buildId
    const rect = host.getBoundingClientRect()
    width = Math.floor(rect.width)
    height = Math.floor(rect.height)
    if (width < 2 || height < 2) return

    dpr = Math.min(window.devicePixelRatio || 1, 1.6)
    surface.width = Math.floor(width * dpr)
    surface.height = Math.floor(height * dpr)
    context.setTransform(dpr, 0, 0, dpr, 0, 0)

    const computed = getComputedStyle(host)
    const family = props.fontFamily === 'inherit' ? computed.fontFamily : props.fontFamily
    const probe = document.createElement('span')
    Object.assign(probe.style, {
      position: 'absolute', visibility: 'hidden', pointerEvents: 'none',
      fontSize: props.fontSize, fontWeight: String(props.fontWeight), fontFamily: family,
    })
    probe.textContent = 'M'
    host.appendChild(probe)
    let resolvedSize = Number.parseFloat(getComputedStyle(probe).fontSize) || 80
    probe.remove()
    let font = `${props.fontWeight} ${resolvedSize}px ${family}`
    try {
      await document.fonts?.load(font)
      await document.fonts?.ready
    } catch {}
    if (currentBuild !== buildId) return

    const offscreen = document.createElement('canvas')
    const offscreenContext = offscreen.getContext('2d', { willReadFrequently: true })
    offscreenContext.font = font
    const maxWidth = width * 0.96
    let metrics = offscreenContext.measureText(props.text)
    if (metrics.width > maxWidth) {
      resolvedSize *= maxWidth / metrics.width
      font = `${props.fontWeight} ${resolvedSize}px ${family}`
      offscreenContext.font = font
      metrics = offscreenContext.measureText(props.text)
    }
    const ascent = Math.ceil(metrics.actualBoundingBoxAscent || resolvedSize * 0.8)
    const descent = Math.ceil(metrics.actualBoundingBoxDescent || resolvedSize * 0.2)
    const padding = Math.max(10, Math.ceil(resolvedSize * 0.08))
    offscreen.width = Math.ceil(metrics.width) + padding * 2
    offscreen.height = ascent + descent + padding * 2
    offscreenContext.font = font
    offscreenContext.textBaseline = 'alphabetic'
    offscreenContext.fillStyle = '#fff'
    offscreenContext.fillText(props.text, padding, padding + ascent)

    const data = offscreenContext.getImageData(0, 0, offscreen.width, offscreen.height)
    const targets = []
    const step = Math.max(2, Math.floor(props.density))
    for (let y = 0; y < offscreen.height; y += step) {
      for (let x = 0; x < offscreen.width; x += step) {
        const alpha = data.data[(y * offscreen.width + x) * 4 + 3]
        if (alpha > 46) targets.push({ x, y, alpha: alpha / 255 })
      }
    }

    const maxParticles = Math.max(700, Math.min(3000, Math.floor(width * height / 80)))
    const stride = Math.max(1, Math.ceil(targets.length / maxParticles))
    const from = parseHex(props.color)
    const to = parseHex(props.highlightColor)
    particles = targets.filter((_, index) => index % stride === 0).map((target, index) => {
      const seed = ((index * 9301 + 49297) % 233280) / 233280
      const depth = 0.45 + ((index * 233 + 97) % 1000) / 1000 * 0.9
      const targetX = width / 2 - offscreen.width / 2 + target.x
      const targetY = height / 2 - offscreen.height / 2 + target.y
      const blend = clamp(targetX / width + (seed - 0.5) * 0.28, 0, 1)
      const angle = seed * Math.PI * 2
      const distance = reducedMotion ? 0 : props.scatter * (0.3 + depth * 0.68)
      return {
        x: targetX + Math.cos(angle) * distance,
        y: targetY + Math.sin(angle) * distance,
        startX: targetX,
        startY: targetY,
        targetX,
        targetY,
        size: Math.max(0.65, props.particleSize * (0.72 + target.alpha * 0.48)),
        color: mixColor(from, to, blend),
        seed,
        depth,
        delay: seed * props.stagger,
      }
    })

    pointer.x = width / 2
    pointer.y = height / 2
    pointer.smoothX = pointer.x
    pointer.smoothY = pointer.y
    if (reducedMotion) {
      particles.forEach((particle) => {
        particle.x = particle.targetX
        particle.y = particle.targetY
      })
    } else {
      startGather(false)
    }
    if (!animationFrame) animationFrame = requestAnimationFrame(render)
  }

  function queueSample() {
    cancelAnimationFrame(resizeFrame)
    resizeFrame = requestAnimationFrame(sampleText)
  }

  function updatePointer(event) {
    const rect = surface.getBoundingClientRect()
    pointer.x = event.clientX - rect.left
    pointer.y = event.clientY - rect.top
    pointer.active = true
  }

  function onPointerEnter(event) {
    updatePointer(event)
    startGather(true)
  }

  function onPointerLeave() {
    pointer.active = false
  }

  function onVisibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame)
      animationFrame = 0
    } else if (!animationFrame && particles.length) {
      animationFrame = requestAnimationFrame(render)
    }
  }

  const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  const onMotionChange = (event) => {
    reducedMotion = event.matches
    sampleText()
  }
  const resizeObserver = new ResizeObserver(queueSample)
  resizeObserver.observe(host)
  surface.addEventListener('pointerenter', onPointerEnter)
  surface.addEventListener('pointermove', updatePointer)
  surface.addEventListener('pointerleave', onPointerLeave)
  document.addEventListener('visibilitychange', onVisibilityChange)
  motionQuery?.addEventListener('change', onMotionChange)
  sampleText()

  cleanup = () => {
    buildId += 1
    resizeObserver.disconnect()
    surface.removeEventListener('pointerenter', onPointerEnter)
    surface.removeEventListener('pointermove', updatePointer)
    surface.removeEventListener('pointerleave', onPointerLeave)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    motionQuery?.removeEventListener('change', onMotionChange)
    cancelAnimationFrame(animationFrame)
    cancelAnimationFrame(resizeFrame)
    animationFrame = 0
    resizeFrame = 0
  }
}

onMounted(setup)
watch(() => [props.text, props.color, props.highlightColor, props.fontSize], setup)
onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <span ref="container" class="particle-text" aria-hidden="true">
    <canvas ref="canvas" class="particle-text__canvas"></canvas>
  </span>
</template>

<style scoped>
.particle-text {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  isolation: isolate;
  pointer-events: auto;
  touch-action: none;
}

.particle-text__canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}
</style>
