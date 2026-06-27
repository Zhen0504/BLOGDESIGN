<script setup>
import { Camera, Geometry, Mesh, Program, Renderer } from 'ogl'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  // Defaults mirror the site palette: mostly white particles with teal accents.
  particleColors: {
    type: Array,
    default: () => ['#ffffff', '#ffffff', '#20d6c7'],
  },
  particleCount: {
    type: Number,
    default: 190,
  },
  particleSpread: {
    type: Number,
    default: 10,
  },
  speed: {
    type: Number,
    default: 0.08,
  },
  particleBaseSize: {
    type: Number,
    default: 90,
  },
  moveParticlesOnHover: {
    type: Boolean,
    default: true,
  },
  particleHoverFactor: {
    type: Number,
    default: 0.72,
  },
  alphaParticles: {
    type: Boolean,
    default: true,
  },
})

const containerRef = ref(null)

let renderer = null
let gl = null
let program = null
let animationFrame = 0
let reduceMotion = false
let isFinePointer = false
let width = 1
let height = 1
let parallaxX = 0
let parallaxY = 0
let targetParallaxX = 0
let targetParallaxY = 0

const pointer = {
  // Offscreen defaults prevent hover influence before the first pointer event.
  x: -9999,
  y: -9999,
  active: 0,
}

const vertex = `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;

  uniform float uTime;
  uniform float uSpread;
  uniform float uSpeed;
  uniform float uBaseSize;
  uniform float uPixelRatio;
  uniform float uHoverFactor;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uPointerActive;
  uniform float uMoveOnHover;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Randomized low-amplitude drift keeps the background alive without pulling
    // focus from the hero headline.
    vec3 pos = position;
    float drift = uTime * uSpeed * (0.32 + random.x);
    pos.x += sin(drift + random.y * 6.283185) * 0.018 * uSpread;
    pos.y += cos(drift * 0.88 + random.z * 6.283185) * 0.014 * uSpread;

    vec2 screenPosition = (pos.xy * 0.5 + 0.5) * uResolution;
    vec2 pointerVector = screenPosition - uPointer;
    float pointerDistance = length(pointerVector);
    float influence = smoothstep(230.0, 0.0, pointerDistance) * uPointerActive * uMoveOnHover;

    if (influence > 0.0) {
      // Pointer influence pushes nearby particles away from the cursor.
      vec2 direction = normalize(pointerVector + 0.0001);
      pos.xy += direction * influence * uHoverFactor * 0.075;
    }

    gl_Position = vec4(pos.xy, 0.0, 1.0);
    gl_PointSize = uBaseSize * (0.62 + random.w * 0.76) * uPixelRatio / max(uResolution.y, 1.0);
    gl_PointSize *= 72.0;

    vColor = color;
    vAlpha = 0.34 + random.z * 0.52;
  }
`

const fragment = `
  precision highp float;

  uniform float uAlphaParticles;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Soft circular alpha turns point sprites into star-like particles.
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    float circle = smoothstep(0.5, 0.08, dist);
    float glow = smoothstep(0.5, 0.0, dist) * 0.32;
    float alpha = mix(1.0, vAlpha, uAlphaParticles) * (circle + glow);

    if (alpha < 0.02) {
      discard;
    }

    gl_FragColor = vec4(vColor, alpha);
  }
`

function hexToRgb(hex) {
  // Shader attributes need normalized RGB values instead of CSS hex strings.
  const value = hex.replace('#', '')
  const normalized = value.length === 3
    ? value.split('').map((char) => char + char).join('')
    : value
  const number = Number.parseInt(normalized, 16)

  return [
    ((number >> 16) & 255) / 255,
    ((number >> 8) & 255) / 255,
    (number & 255) / 255,
  ]
}

function createGeometry() {
  // Precompute particle positions, colors, and per-particle randomness once.
  const positions = new Float32Array(props.particleCount * 3)
  const randoms = new Float32Array(props.particleCount * 4)
  const colors = new Float32Array(props.particleCount * 3)
  const palette = props.particleColors.map(hexToRgb)

  for (let index = 0; index < props.particleCount; index += 1) {
    const i3 = index * 3
    const i4 = index * 4
    const radius = Math.sqrt(Math.random())
    const angle = Math.random() * Math.PI * 2
    const spread = props.particleSpread / 10

    positions[i3] = Math.cos(angle) * radius * spread
    positions[i3 + 1] = Math.sin(angle) * radius * spread
    positions[i3 + 2] = 0

    randoms[i4] = Math.random()
    randoms[i4 + 1] = Math.random()
    randoms[i4 + 2] = Math.random()
    randoms[i4 + 3] = Math.random()

    const color = palette[index % palette.length]
    colors[i3] = color[0]
    colors[i3 + 1] = color[1]
    colors[i3 + 2] = color[2]
  }

  return new Geometry(gl, {
    position: { size: 3, data: positions },
    random: { size: 4, data: randoms },
    color: { size: 3, data: colors },
  })
}

function resize() {
  if (!containerRef.value || !renderer || !program) return

  // Canvas is intentionally larger than its host so parallax cannot expose edges.
  const rect = containerRef.value.getBoundingClientRect()
  width = Math.max(rect.width, 1)
  height = Math.max(rect.height, 1)

  renderer.setSize(width, height)
  gl.canvas.style.width = 'calc(100vw + 80px)'
  gl.canvas.style.height = 'calc(100vh + 80px)'
  gl.canvas.style.margin = '-40px'
  program.uniforms.uResolution.value = [width, height]
  program.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2)
}

function render(time = 0) {
  if (!renderer || !program) return

  // Smooth parallax target values to avoid sharp jumps as the pointer moves.
  parallaxX += (targetParallaxX - parallaxX) * 0.08
  parallaxY += (targetParallaxY - parallaxY) * 0.08
  gl.canvas.style.transform = `translate3d(${parallaxX}px, ${parallaxY}px, 0) scale(1.08)`

  program.uniforms.uTime.value = time * 0.001
  program.uniforms.uPointer.value = [pointer.x, pointer.y]
  program.uniforms.uPointerActive.value = pointer.active
  renderer.render({ scene: mesh, camera })

  if (!reduceMotion) {
    animationFrame = requestAnimationFrame(render)
  }
}

let camera = null
let mesh = null

function handlePointerMove(event) {
  if (!containerRef.value || !isFinePointer || reduceMotion) return

  // Move the whole particle field opposite the cursor for a subtle depth cue.
  const rect = containerRef.value.getBoundingClientRect()
  pointer.x = event.clientX - rect.left
  pointer.y = event.clientY - rect.top
  pointer.active = 1
  targetParallaxX = -((event.clientX / window.innerWidth) - 0.5) * 64
  targetParallaxY = -((event.clientY / window.innerHeight) - 0.5) * 64
}

function handlePointerLeave() {
  pointer.x = -9999
  pointer.y = -9999
  pointer.active = 0
  targetParallaxX = 0
  targetParallaxY = 0
}

onMounted(() => {
  // Respect user/device capabilities before starting hover-heavy work.
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  isFinePointer = window.matchMedia('(pointer: fine)').matches

  renderer = new Renderer({
    alpha: true,
    antialias: true,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
  })
  gl = renderer.gl
  gl.clearColor(0, 0, 0, 0)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  camera = new Camera(gl)
  program = new Program(gl, {
    vertex,
    fragment,
    transparent: true,
    depthTest: false,
    uniforms: {
      uTime: { value: 0 },
      uSpread: { value: props.particleSpread },
      uSpeed: { value: props.speed },
      uBaseSize: { value: props.particleBaseSize },
      uPixelRatio: { value: 1 },
      uHoverFactor: { value: props.particleHoverFactor },
      uResolution: { value: [width, height] },
      uPointer: { value: [pointer.x, pointer.y] },
      uPointerActive: { value: 0 },
      uMoveOnHover: { value: props.moveParticlesOnHover ? 1 : 0 },
      uAlphaParticles: { value: props.alphaParticles ? 1 : 0 },
    },
  })

  mesh = new Mesh(gl, {
    mode: gl.POINTS,
    geometry: createGeometry(),
    program,
  })

  containerRef.value.appendChild(gl.canvas)
  resize()
  render()

  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerleave', handlePointerLeave)
})

onBeforeUnmount(() => {
  // OGL is manually managed, so listeners and canvas need explicit cleanup.
  cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', resize)
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerleave', handlePointerLeave)

  if (gl?.canvas?.parentNode) {
    gl.canvas.parentNode.removeChild(gl.canvas)
  }
})
</script>

<template>
  <div ref="containerRef" class="particle-background" aria-hidden="true"></div>
</template>

<style scoped>
.particle-background {
  /* Layer is decorative; never block clicks or text selection above it. */
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.particle-background :deep(canvas) {
  display: block;
  width: calc(100% + 80px);
  height: calc(100% + 80px);
  margin: -40px;
  pointer-events: none;
  will-change: transform;
}
</style>
