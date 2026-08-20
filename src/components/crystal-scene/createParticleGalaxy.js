import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  Points,
  ShaderMaterial,
} from 'three'

function seededRandom(seed) {
  let value = seed >>> 0
  return () => {
    value = (1664525 * value + 1013904223) >>> 0
    return value / 0x100000000
  }
}

function createPointMaterial({ size, opacity, drift }) {
  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: size },
      uOpacity: { value: opacity },
      uDrift: { value: drift },
    },
    vertexShader: `
      attribute float aPhase;
      attribute float aWeight;
      attribute float aStretch;
      varying vec3 vColor;
      varying float vAlpha;
      varying float vStretch;
      uniform float uTime;
      uniform float uSize;
      uniform float uDrift;
      void main() {
        vec3 p = position;
        p.z += sin(uTime * 0.43 + aPhase) * uDrift * aWeight;
        p.y += cos(uTime * 0.29 + aPhase * 1.7) * uDrift * 0.36;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * aWeight * (8.0 / max(1.0, -mv.z));
        gl_Position = projectionMatrix * mv;
        vColor = color;
        vStretch = aStretch;
        vAlpha = 0.7 + 0.3 * sin(uTime * (0.52 + aWeight * 0.14) + aPhase);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      varying float vStretch;
      uniform float uOpacity;
      void main() {
        vec2 centered = gl_PointCoord - 0.5;
        centered.x *= vStretch;
        float radius = length(centered);
        float core = smoothstep(0.46, 0.02, radius);
        float halo = smoothstep(0.5, 0.12, radius) * 0.34;
        float alpha = (core + halo) * vAlpha * uOpacity;
        if (alpha < 0.008) discard;
        gl_FragColor = vec4(vColor * (0.82 + core * 1.45), alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    vertexColors: true,
    blending: AdditiveBlending,
    toneMapped: false,
  })
}

function addAttributes(geometry, data) {
  geometry.setAttribute('position', new Float32BufferAttribute(data.positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(data.colors, 3))
  geometry.setAttribute('aPhase', new Float32BufferAttribute(data.phases, 1))
  geometry.setAttribute('aWeight', new Float32BufferAttribute(data.weights, 1))
  geometry.setAttribute('aStretch', new Float32BufferAttribute(data.stretches, 1))
}

function createStars(count, random) {
  const data = { positions: [], colors: [], phases: [], weights: [], stretches: [] }
  for (let index = 0; index < count; index += 1) {
    const angle = random() * Math.PI * 2
    const radius = 2.6 + Math.pow(random(), 0.72) * 7.4
    data.positions.push(Math.cos(angle) * radius + 1.1, Math.sin(angle) * radius * 0.58, -2.4 - random() * 3.6)
    const color = new Color(random() > 0.985 ? '#c6a066' : random() > 0.62 ? '#5266e8' : '#aaa9d8')
    data.colors.push(color.r, color.g, color.b)
    data.phases.push(random() * Math.PI * 2)
    data.weights.push(0.42 + random() * 0.82)
    data.stretches.push(1)
  }
  const geometry = new BufferGeometry()
  addAttributes(geometry, data)
  return new Points(geometry, createPointMaterial({ size: 2.55, opacity: 0.31, drift: 0.026 }))
}

function createOverviewSparkles(count, random) {
  const data = { positions: [], colors: [], phases: [], weights: [], stretches: [] }
  const palette = ['#6556dd', '#8276f4', '#a7a5e8', '#74b8ed', '#c39a61']
  for (let index = 0; index < count; index += 1) {
    const x = -4.3 + random() * 10.8
    const y = -3.8 + random() * 7.6
    const centerFade = Math.min(1, Math.hypot(x - 1.9, y) / 1.8)
    data.positions.push(x, y, -1.25 - random() * 2.8)
    const color = new Color(palette[Math.floor(random() * palette.length)])
    data.colors.push(color.r, color.g, color.b)
    data.phases.push(random() * Math.PI * 2)
    data.weights.push((0.34 + Math.pow(random(), 2.2) * 0.76) * (0.42 + centerFade * 0.58))
    data.stretches.push(1)
  }
  const geometry = new BufferGeometry()
  addAttributes(geometry, data)
  return new Points(geometry, createPointMaterial({ size: 3.9, opacity: 0.5, drift: 0.046 }))
}

const nebulaCenters = [
  { x: 2.08, y: 1.48, z: -0.52, angle: -0.12 },
  { x: 3.38, y: 0.02, z: -0.55, angle: -1.24 },
  { x: 2.06, y: -1.48, z: -0.52, angle: 0.12 },
  { x: 0.58, y: -0.02, z: -0.57, angle: 1.24 },
]

function createNebulaLayer(count, random, options) {
  const data = { positions: [], colors: [], phases: [], weights: [], stretches: [] }

  for (let index = 0; index < count; index += 1) {
    const centerIndex = Math.floor(random() * nebulaCenters.length)
    const center = nebulaCenters[centerIndex]
    const angle = random() * Math.PI * 2
    const radius = 0.16 + Math.pow(random(), 0.58) * 0.84
    const localX = Math.cos(angle) * options.radiusX * radius
    const localY = Math.sin(angle) * options.radiusY * radius
    const cos = Math.cos(center.angle)
    const sin = Math.sin(center.angle)
    const noiseX = (random() - 0.5) * options.noise
    const noiseY = (random() - 0.5) * options.noise
    data.positions.push(
      center.x + localX * cos - localY * sin + noiseX,
      center.y + localX * sin + localY * cos + noiseY,
      center.z + (random() - 0.5) * options.depth,
    )
    const color = new Color(options.palette[Math.floor(random() * options.palette.length)])
    data.colors.push(color.r, color.g, color.b)
    data.phases.push(centerIndex * 1.7 + random() * Math.PI * 2)
    data.weights.push(options.weight[0] + Math.pow(random(), options.weightPower) * options.weight[1])
    data.stretches.push(options.stretch[0] + random() * options.stretch[1])
  }

  const geometry = new BufferGeometry()
  addAttributes(geometry, data)
  return new Points(geometry, createPointMaterial({ size: options.size, opacity: options.opacity, drift: options.drift }))
}

export function createParticleGalaxy(quality) {
  const random = seededRandom(5042026)
  const group = new Group()
  group.name = 'ParticleGalaxy'
  group.position.x = 1.44

  const stars = createStars(quality.starCount, random)
  const overviewSparkles = createOverviewSparkles(quality.compact ? 190 : 420, random)
  const dust = createNebulaLayer(Math.round(quality.ribbonCount * 1.32), random, {
    radiusX: 1.06, radiusY: 0.52, noise: 0.28, depth: 0.52,
    palette: ['#4937b8', '#5d52df', '#7771ee', '#aaa6ec'],
    weight: [0.34, 0.82], weightPower: 1.4, stretch: [1, 0.7],
    size: 4.35, opacity: 0.58, drift: 0.075,
  })
  const mist = createNebulaLayer(Math.round(quality.ribbonCount * 0.54), random, {
    radiusX: 0.82, radiusY: 0.4, noise: 0.22, depth: 0.38,
    palette: ['#5844d5', '#6f58ef', '#9689ff'],
    weight: [0.5, 1.25], weightPower: 1.8, stretch: [1.4, 1.5],
    size: 5.15, opacity: 0.25, drift: 0.064,
  })
  const highlights = createNebulaLayer(quality.compact ? 56 : 104, random, {
    radiusX: 0.94, radiusY: 0.46, noise: 0.2, depth: 0.32,
    palette: ['#a99cff', '#c8c5ff', '#7365ff', '#caa66b'],
    weight: [0.72, 1.45], weightPower: 2.8, stretch: [1, 0.5],
    size: 5.2, opacity: 0.7, drift: 0.052,
  })
  const animated = [stars, overviewSparkles, dust, mist, highlights]
  let overviewOpacity = 1
  let overviewTarget = 1
  group.add(stars, overviewSparkles, dust, mist, highlights)
  group.userData.restPosition = group.position.clone()

  return {
    group,
    setSection(sectionId, immediate = false) {
      overviewTarget = sectionId === '00' ? 1 : 0.035
      if (immediate) overviewOpacity = overviewTarget
    },
    update(time, delta = 1 / 60) {
      animated.forEach((points, index) => {
        points.material.uniforms.uTime.value = time * (1 - index * 0.05)
      })
      const response = 1 - Math.exp(-Math.min(delta, 0.05) * 4.2)
      overviewOpacity += (overviewTarget - overviewOpacity) * response
      overviewSparkles.material.uniforms.uOpacity.value = 0.5 * overviewOpacity
    },
    dispose() {
      animated.forEach((points) => {
        points.geometry.dispose()
        points.material.dispose()
      })
    },
  }
}
