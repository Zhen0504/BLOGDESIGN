import {
  AdditiveBlending,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  Points,
  ShaderMaterial,
  Vector3,
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

function galaxyCurve() {
  return new CatmullRomCurve3([
    new Vector3(0.72, 1.45, -0.48),
    new Vector3(1.92, 1.82, -0.56),
    new Vector3(3.18, 1.26, -0.5),
    new Vector3(3.58, -0.06, -0.54),
    new Vector3(3.08, -1.38, -0.46),
    new Vector3(1.92, -1.78, -0.56),
    new Vector3(0.84, -1.45, -0.48),
    new Vector3(0.38, -0.06, -0.58),
  ], true, 'centripetal', 0.42)
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
  return new Points(geometry, createPointMaterial({ size: 3.2, opacity: 0.42, drift: 0.026 }))
}

function createRibbonLayer(count, random, options) {
  const curve = galaxyCurve()
  const data = { positions: [], colors: [], phases: [], weights: [], stretches: [] }
  const tangent = new Vector3()
  const normal = new Vector3()
  const point = new Vector3()

  for (let index = 0; index < count; index += 1) {
    const t = (index / count + (random() - 0.5) * options.jitter + 1) % 1
    curve.getPointAt(t, point)
    curve.getTangentAt(t, tangent)
    normal.set(-tangent.y, tangent.x, 0).normalize()
    const spread = (random() - 0.5) * options.spread * (0.45 + random())
    data.positions.push(
      point.x + normal.x * spread,
      point.y + normal.y * spread,
      point.z + (random() - 0.5) * options.depth,
    )
    const color = new Color(options.palette[Math.floor(random() * options.palette.length)])
    data.colors.push(color.r, color.g, color.b)
    data.phases.push(t * Math.PI * 11 + random() * 1.5)
    data.weights.push(options.weight[0] + Math.pow(random(), options.weightPower) * options.weight[1])
    data.stretches.push(options.stretch[0] + random() * options.stretch[1])
  }

  const geometry = new BufferGeometry()
  addAttributes(geometry, data)
  return new Points(geometry, createPointMaterial({ size: options.size, opacity: options.opacity, drift: options.drift }))
}

function createFilament() {
  const geometry = new BufferGeometry().setFromPoints(galaxyCurve().getSpacedPoints(420))
  const material = new LineBasicMaterial({
    color: '#5f4ad5',
    transparent: true,
    opacity: 0.34,
    blending: AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  })
  return new Line(geometry, material)
}

export function createParticleGalaxy(quality) {
  const random = seededRandom(5042026)
  const group = new Group()
  group.name = 'ParticleGalaxy'
  group.position.x = 1.12

  const stars = createStars(quality.starCount, random)
  const dust = createRibbonLayer(Math.round(quality.ribbonCount * 1.05), random, {
    jitter: 0.014, spread: 0.46, depth: 0.38,
    palette: ['#4937b8', '#5d52df', '#7771ee', '#aaa6ec'],
    weight: [0.34, 0.82], weightPower: 1.4, stretch: [1, 0.7],
    size: 3.5, opacity: 0.64, drift: 0.065,
  })
  const mist = createRibbonLayer(Math.round(quality.ribbonCount * 0.34), random, {
    jitter: 0.009, spread: 0.24, depth: 0.24,
    palette: ['#5844d5', '#6f58ef', '#9689ff'],
    weight: [0.5, 1.25], weightPower: 1.8, stretch: [1.4, 1.5],
    size: 5.4, opacity: 0.3, drift: 0.052,
  })
  const highlights = createRibbonLayer(quality.compact ? 34 : 58, random, {
    jitter: 0.004, spread: 0.16, depth: 0.16,
    palette: ['#a99cff', '#c8c5ff', '#7365ff', '#caa66b'],
    weight: [0.72, 1.45], weightPower: 2.8, stretch: [1, 0.5],
    size: 4.8, opacity: 0.86, drift: 0.04,
  })
  const filament = createFilament()
  const animated = [stars, dust, mist, highlights]
  group.add(filament, stars, dust, mist, highlights)
  group.userData.restPosition = group.position.clone()

  return {
    group,
    update(time) {
      animated.forEach((points, index) => {
        points.material.uniforms.uTime.value = time * (1 - index * 0.05)
      })
      filament.material.opacity = 0.3 + Math.sin(time * 0.34) * 0.045
    },
    dispose() {
      animated.forEach((points) => {
        points.geometry.dispose()
        points.material.dispose()
      })
      filament.geometry.dispose()
      filament.material.dispose()
    },
  }
}
