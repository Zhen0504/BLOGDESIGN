import * as THREE from 'three'

export function createParticleFace(host, hooks = {}) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(29, 1, 0.1, 30)
  camera.position.set(0, 0.03, 5.7)
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7))
  renderer.setClearColor(0x000000, 0)
  host.appendChild(renderer.domElement)

  const root = new THREE.Group()
  root.scale.setScalar(0.6)
  scene.add(root)
  const geometry = new THREE.BufferGeometry()
  const material = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color('#D9D0FF') }, uPointScale: { value: 300 } },
    vertexShader: `
      attribute float aSize;
      attribute float aVisible;
      uniform float uPointScale;
      varying float vVisible;
      varying float vLight;
      void main() {
        vVisible = aVisible;
        vec3 normal = normalize(vec3(position.xy, 0.82));
        vLight = 0.48 + max(0.0, dot(normal, normalize(vec3(-0.42, 0.58, 0.78)))) * 0.52;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (uPointScale / max(1.0, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vVisible;
      varying float vLight;
      void main() {
        if (vVisible < 0.02) discard;
        vec2 point = gl_PointCoord - 0.5;
        float distanceToCenter = length(point);
        if (distanceToCenter > 0.5) discard;
        float softness = 1.0 - smoothstep(0.34, 0.5, distanceToCenter);
        vec3 litColor = uColor;
        gl_FragColor = vec4(litColor, softness * vVisible);
      }
    `,
    transparent: true,
    depthWrite: true,
    depthTest: true,
  })
  const points = new THREE.Points(geometry, material)
  const rollPivot = new THREE.Group()
  root.add(rollPivot)
  rollPivot.add(points)
  const cursor = { x: 0, y: 0, down: false, lastX: 0, lastY: 0 }
  const state = { expression: 'smile', paused: false, color: '#D9D0FF', count: 2600, size: 0.046, breathAmount: 0.03, breathSpeed: 0.2, yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0, time: 0, last: performance.now(), frame: 0 }
  const baseFace = { gazeX: 0, gazeY: 0, tilt: 0, yaw: 0, squeeze: 0, leftClose: 0, rightClose: 0, eyeWidth: 0.105, eyeHeight: 0.14, mouthX: 0, mouthWidth: 0.22, mouthY: -0.17, mouthCurve: 0.095, mouthThickness: 0.039, mouthOpen: 0, brow: 0 }
  const expressions = {
    smile: { ...baseFace },
    listen: { ...baseFace, gazeX: -0.09, gazeY: 0.015, mouthX: -0.06, mouthWidth: 0.25, mouthThickness: 0.045, tilt: 0.045, yaw: -0.16 },
    surprise: { ...baseFace, eyeWidth: 0.12, eyeHeight: 0.15, mouthOpen: 1, mouthWidth: 0.075, mouthY: -0.23, mouthThickness: 0.095, mouthCurve: 0 },
    wink: { ...baseFace, rightClose: 1, tilt: -0.035, mouthX: 0.025 },
    think: { ...baseFace, gazeX: -0.06, gazeY: 0.05, eyeHeight: 0.135, brow: 1, mouthX: 0.05, mouthWidth: 0.13, mouthCurve: 0.04, mouthThickness: 0.033, tilt: 0.06 },
    happy: { ...baseFace, squeeze: 1, leftClose: 1, rightClose: 1, mouthWidth: 0.28, mouthCurve: 0.12, mouthThickness: 0.05 },
  }
  let current = { ...(expressions[hooks.initialExpression] || expressions.smile) }
  let from = current
  let target = current
  let transition = 1
  let activeMode = 'morph'
  let seedPoints = []

  function seedFor(index) { const n = Math.sin(index * 12.9898 + 78.233) * 43758.5453; return n - Math.floor(n) }
  function ellipse(x, y, cx, cy, rx, ry) { return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 }
  function featureMask(x, y, exp) {
    // Signed distances give soft edges and let eyelids morph instead of
    // drawing closed eyes on top of the original open-eye holes.
    const smoothCoverage = (distance) => 1 - THREE.MathUtils.smoothstep(distance, -0.009, 0.009)
    function eye(cx, close, direction) {
      const dx = x - cx
      const cy = 0.13 + exp.gazeY
      const ellipseDistance = (Math.sqrt((dx / exp.eyeWidth) ** 2 + ((y - cy) / exp.eyeHeight) ** 2) - 1) * Math.min(exp.eyeWidth, exp.eyeHeight)
      const half = 0.13
      const arc = cy + 0.07 * (1 - (dx / half) ** 2)
      const arcDistance = Math.max(Math.abs(dx) - half, Math.abs(y - arc) - 0.031)
      const chevronX = direction * (0.09 - 1.25 * Math.abs(y - cy))
      const chevronDistance = Math.max(Math.abs(y - cy) - 0.105, Math.abs(dx - chevronX) / 1.6 - 0.03)
      const closedDistance = THREE.MathUtils.lerp(arcDistance, chevronDistance, exp.squeeze)
      return smoothCoverage(THREE.MathUtils.lerp(ellipseDistance, closedDistance, close))
    }
    const eyeSpacing = 0.30 + exp.squeeze * 0.065
    let mask = Math.max(eye(-eyeSpacing + exp.gazeX, exp.leftClose, 1), eye(eyeSpacing + exp.gazeX, exp.rightClose, -1))
    const dx = x - exp.mouthX
    const u = dx / exp.mouthWidth
    const center = exp.mouthY - exp.mouthCurve * (1 - u * u)
    // Taper the smile tips instead of cutting a thick rectangular slit.
    const thickness = exp.mouthThickness * Math.sqrt(Math.max(0, 1 - u * u))
    const smileDistance = Math.max(Math.abs(dx) - exp.mouthWidth, Math.abs(y - center) - thickness)
    const openDistance = (Math.sqrt(u * u + ((y - exp.mouthY) / exp.mouthThickness) ** 2) - 1) * Math.min(exp.mouthWidth, exp.mouthThickness)
    mask = Math.max(mask, smoothCoverage(THREE.MathUtils.lerp(smileDistance, openDistance, exp.mouthOpen)))
    if (exp.brow > 0) {
      const bx = x + 0.30 - exp.gazeX
      const browCurve = 0.38 + 0.045 * (1 - (bx / 0.17) ** 2)
      mask = Math.max(mask, exp.brow * smoothCoverage(Math.max(Math.abs(bx) - 0.17, Math.abs(y - browCurve) - 0.023)))
    }
    return mask
  }
  function buildGeometry() {
    const columns = Math.ceil(Math.sqrt(state.count * 1.35))
    const candidates = []
    for (let index = 0; index < columns * columns; index += 1) {
      const row = Math.floor(index / columns)
      const column = index % columns
      const gridX = (column / Math.max(1, columns - 1)) * 2 - 1
      const gridY = (row / Math.max(1, columns - 1)) * 2 - 1
      const cell = 2 / Math.max(1, columns - 1)
      const jitterX = (seedFor(index) - 0.5) * cell * 0.32
      const jitterY = (seedFor(index + 17) - 0.5) * cell * 0.32
      const radial = Math.hypot(gridX, gridY)
      if (radial > 1) continue
      const x = gridX + jitterX
      const y = gridY + jitterY
      const depth = Math.sqrt(Math.max(0.02, 1 - x * x - y * y))
      candidates.push({ x, y, z: 0.64 * depth - 0.12, depth, edge: radial > 0.91 && index % 3 === 0, seed: seedFor(index + 100) })
    }
    seedPoints = Array.from({ length: Math.min(state.count, candidates.length) }, (_, i) => candidates[Math.floor(i * candidates.length / Math.min(state.count, candidates.length))])
    const count = seedPoints.length
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const visible = new Float32Array(count)
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    seedPoints.forEach((point, index) => {
      sizes[index] = state.size * (0.92 + point.seed * 0.16)
      visible[index] = 1
    })
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('aVisible', new THREE.BufferAttribute(visible, 1))
    geometry.setDrawRange(0, count)
  }
  function sampleTarget(point, exp) {
    const cos = Math.cos(exp.tilt)
    const sin = Math.sin(exp.tilt)
    const faceYaw = exp.yaw || 0
    let x = point.x + exp.gazeX * 0.1
    let y = point.y
    const mask = point.edge ? 0 : featureMask(x, y, exp)
    const angle = Math.atan2(y, x)
    const breath = 1 + Math.sin(state.time * state.breathSpeed * Math.PI * 2) * state.breathAmount
    if (point.edge) {
      const drift = 0.08 + Math.sin(state.time * 0.42 + point.seed * 12) * 0.035
      x += Math.cos(angle + point.seed * 3) * drift
      y += Math.sin(angle + point.seed * 3) * drift
    }
    x *= breath
    y *= breath
    const rotatedX = x * cos - y * sin
    const rotatedY = x * sin + y * cos
    const yawCos = Math.cos(faceYaw)
    const yawSin = Math.sin(faceYaw)
    const z = point.z * breath + Math.sin(state.time * 1.1 + point.depth * 2) * state.breathAmount * 0.18
    return { x: rotatedX * yawCos + z * yawSin, y: rotatedY, z: z * yawCos - rotatedX * yawSin, mask }
  }
  function rebuild() {
    buildGeometry()
  }
  function render(now) {
    if (document.hidden) { state.last = now; state.frame = requestAnimationFrame(render); return }
    const delta = Math.max(0, Math.min(0.05, (now - state.last) / 1000))
    state.last = now
    if (!state.paused && !hooks.reducedMotion) state.time += delta
    if (!state.paused) transition = Math.min(1, transition + delta / (activeMode === 'roll' ? 0.65 : 0.85))
    const smooth = transition * transition * (3 - 2 * transition)
    const overshoot = transition < 0.82 ? smooth : smooth + Math.sin((transition - 0.82) / 0.18 * Math.PI) * 0.055
    const t = Math.min(1, Math.max(0, overshoot))
    // Replace the expression while the face is turned away, then land facing forward.
    const faceBlend = activeMode === 'roll' ? THREE.MathUtils.smoothstep(transition, 0.38, 0.62) : t
    current = Object.fromEntries(Object.keys(baseFace).map(key => [key, THREE.MathUtils.lerp(from[key], target[key], faceBlend)]))
    // Keep the face frame still. Each point travels around its own vertical
    // elliptical belt: down the front, up the back, then home. No rigid flip.
    rollPivot.rotation.x = 0
    const flowing = activeMode === 'roll' && transition < 1
    const flowEnvelope = flowing
      ? THREE.MathUtils.smoothstep(transition, 0, 0.18) * (1 - THREE.MathUtils.smoothstep(transition, 0.80, 1))
      : 0
    const position = geometry.attributes.position.array
    const visible = geometry.attributes.aVisible.array
    const sizes = geometry.attributes.aSize.array
    seedPoints.forEach((point, index) => {
      const next = sampleTarget(point, current)
      const { x, y, z } = next
      position[index * 3] = x
      position[index * 3 + 1] = y
      position[index * 3 + 2] = z
      visible[index] = 1 - next.mask
      if (flowing) {
        const radius = Math.max(0.08, Math.sqrt(Math.max(0, 1 - point.x * point.x)))
        const startAngle = Math.asin(THREE.MathUtils.clamp(point.y / radius, -1, 1))
        // Slight phase variation makes separate streams instead of a solid wheel.
        const phaseOffset = Math.sin(Math.PI * transition) * (point.seed - 0.5) * 0.32
        const angle = startAngle - smooth * Math.PI * 2 + phaseOffset
        const beltY = radius * Math.sin(angle)
        const beltZ = radius * 0.64 * Math.cos(angle) - 0.12
        position[index * 3] = THREE.MathUtils.lerp(x, point.x, flowEnvelope)
        position[index * 3 + 1] = THREE.MathUtils.lerp(y, beltY, flowEnvelope)
        position[index * 3 + 2] = THREE.MathUtils.lerp(z, beltZ, flowEnvelope)
        // Expose all points during the waterfall, then reveal the new features
        // top-to-bottom as the flow comes to rest.
        const reveal = THREE.MathUtils.smoothstep(transition, 0.72 + (1 - point.y) * 0.06, 0.88 + (1 - point.y) * 0.06)
        const erase = THREE.MathUtils.smoothstep(transition, 0, 0.16)
        visible[index] = 1 - next.mask * ((1 - erase) + reveal)
      }
      sizes[index] = state.size * (0.92 + point.seed * 0.16)
    })
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.aVisible.needsUpdate = true
    geometry.attributes.aSize.needsUpdate = true
    if (!state.paused) {
      root.rotation.y += (state.targetYaw + Math.sin(state.time * 0.45) * 0.10 - root.rotation.y) * 0.08
      root.rotation.x += (state.targetPitch + Math.sin(state.time * 0.32) * 0.035 - root.rotation.x) * 0.08
    }
    renderer.render(scene, camera)
    state.frame = requestAnimationFrame(render)
  }
  function resize() {
    const rect = host.getBoundingClientRect()
    renderer.setSize(rect.width, rect.height, false)
    camera.aspect = rect.width / Math.max(1, rect.height)
    // Fill the formal card while reserving room for breathing and edge particles.
    // The independent demo retains its approved framing.
    camera.position.z = hooks.fitToCard
      ? 0.4 + 0.68 / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 0.82 * Math.max(0.25, Math.min(1, camera.aspect)))
      : Math.max(5.7, 3.1 / Math.max(0.25, camera.aspect))
    camera.updateProjectionMatrix()
    material.uniforms.uPointScale.value = rect.height * renderer.getPixelRatio() * 0.55
  }
  function onPointerDown(event) { cursor.down = true; cursor.lastX = event.clientX; cursor.lastY = event.clientY; host.setPointerCapture?.(event.pointerId) }
  function onPointerMove(event) {
    if (!cursor.down) return
    const dx = event.clientX - cursor.lastX
    const dy = event.clientY - cursor.lastY
    cursor.lastX = event.clientX; cursor.lastY = event.clientY
    state.targetYaw = THREE.MathUtils.clamp(state.targetYaw + dx * 0.006, -0.48, 0.48)
    state.targetPitch = THREE.MathUtils.clamp(state.targetPitch + dy * 0.004, -0.25, 0.25)
  }
  function onPointerUp() { cursor.down = false }
  function setExpression(id, mode = 'morph') {
    // Rapid clicks update the destination without snapping or queueing extra rolls.
    if (activeMode === 'roll' && transition < 1 && mode === 'roll') {
      target = expressions[id] || expressions.smile
      state.expression = id
      return
    }
    from = { ...current }; target = expressions[id] || expressions.smile
    activeMode = hooks.reducedMotion ? 'morph' : mode; transition = hooks.reducedMotion ? 1 : 0; state.expression = id
  }
  function setSettings(next) {
    const changed = state.count !== next.particleCount
    state.count = next.particleCount; state.size = next.particleSize
    state.breathAmount = next.breathAmount; state.breathSpeed = next.breathSpeed
    if (changed) rebuild()
  }
  function setColor(color) { state.color = color; material.uniforms.uColor.value.set(color) }
  function setPaused(value) { state.paused = value }
  function resetView() { state.targetYaw = 0; state.targetPitch = 0 }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)
  host.addEventListener('pointerdown', onPointerDown)
  host.addEventListener('pointermove', onPointerMove)
  host.addEventListener('pointerup', onPointerUp)
  host.addEventListener('pointercancel', onPointerUp)
  buildGeometry(); resize(); state.frame = requestAnimationFrame(render)
  return { setExpression, setSettings, setColor, setPaused, resetView, destroy() { cancelAnimationFrame(state.frame); resizeObserver.disconnect(); host.removeEventListener('pointerdown', onPointerDown); host.removeEventListener('pointermove', onPointerMove); host.removeEventListener('pointerup', onPointerUp); host.removeEventListener('pointercancel', onPointerUp); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove() } }
}
