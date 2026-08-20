import {
  AdditiveBlending,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  Group,
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
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      uniform float uSize;
      uniform float uDrift;
      void main() {
        vec3 p = position;
        p.z += sin(uTime * 0.55 + aPhase) * uDrift * aWeight;
        p.y += cos(uTime * 0.32 + aPhase * 1.7) * uDrift * 0.45;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * aWeight * (8.0 / max(1.0, -mv.z));
        gl_Position = projectionMatrix * mv;
        vColor = color;
        vAlpha = 0.58 + 0.42 * sin(uTime * (0.7 + aWeight * 0.22) + aPhase);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uOpacity;
      void main() {
        vec2 centered = gl_PointCoord - 0.5;
        float distanceToCenter = length(centered);
        float alpha = smoothstep(0.5, 0.08, distanceToCenter) * vAlpha * uOpacity;
        if (alpha < 0.012) discard;
        gl_FragColor = vec4(vColor * (1.0 + alpha * 1.6), alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    blending: AdditiveBlending,
    toneMapped: false,
  })
}

function createStars(count, random) {
  const positions = []
  const colors = []
  const phases = []
  const weights = []
  for (let index = 0; index < count; index += 1) {
    const angle = random() * Math.PI * 2
    const radius = 2.3 + Math.pow(random(), 0.7) * 7.2
    positions.push(
      Math.cos(angle) * radius + 0.8,
      Math.sin(angle) * radius * 0.58,
      -2.2 - random() * 3.4,
    )
    const color = new Color(random() > 0.95 ? '#e8bd72' : random() > 0.64 ? '#6977ff' : '#cbd2ff')
    colors.push(color.r, color.g, color.b)
    phases.push(random() * Math.PI * 2)
    weights.push(0.55 + random() * 1.25)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geometry.setAttribute('aPhase', new Float32BufferAttribute(phases, 1))
  geometry.setAttribute('aWeight', new Float32BufferAttribute(weights, 1))
  return new Points(geometry, createPointMaterial({ size: 5.2, opacity: 0.62, drift: 0.035 }))
}

function createRibbon(count, random) {
  const curve = new CatmullRomCurve3([
    new Vector3(0.74, 1.21, -0.35),
    new Vector3(1.88, 1.65, -0.48),
    new Vector3(3.05, 1.03, -0.38),
    new Vector3(3.34, -0.12, -0.42),
    new Vector3(2.88, -1.18, -0.34),
    new Vector3(1.94, -1.55, -0.46),
    new Vector3(1.00, -1.21, -0.36),
    new Vector3(0.50, -0.12, -0.48),
  ], true, 'centripetal', 0.42)
  const positions = []
  const colors = []
  const phases = []
  const weights = []
  const tangent = new Vector3()
  const normal = new Vector3()
  const point = new Vector3()
  const palette = ['#5f65ff', '#8f77ff', '#e3e7ff', '#e6b865']

  for (let index = 0; index < count; index += 1) {
    const t = (index / count + (random() - 0.5) * 0.009 + 1) % 1
    curve.getPointAt(t, point)
    curve.getTangentAt(t, tangent)
    normal.set(-tangent.y, tangent.x, 0).normalize()
    const spread = (random() - 0.5) * (0.12 + random() * 0.25)
    positions.push(
      point.x + normal.x * spread,
      point.y + normal.y * spread,
      point.z + (random() - 0.5) * 0.24,
    )
    const color = new Color(palette[Math.floor(random() * palette.length)])
    colors.push(color.r, color.g, color.b)
    phases.push(t * Math.PI * 12 + random() * 1.2)
    weights.push(0.55 + Math.pow(random(), 2.2) * 2.4)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geometry.setAttribute('aPhase', new Float32BufferAttribute(phases, 1))
  geometry.setAttribute('aWeight', new Float32BufferAttribute(weights, 1))
  return new Points(geometry, createPointMaterial({ size: 5.8, opacity: 0.82, drift: 0.075 }))
}

export function createParticleGalaxy(quality) {
  const random = seededRandom(5042026)
  const group = new Group()
  group.name = 'ParticleGalaxy'
  group.position.x = 0.75
  const stars = createStars(quality.starCount, random)
  const ribbon = createRibbon(quality.ribbonCount, random)
  group.add(stars, ribbon)
  group.userData.restPosition = group.position.clone()

  return {
    group,
    update(time) {
      stars.material.uniforms.uTime.value = time
      ribbon.material.uniforms.uTime.value = time
    },
    dispose() {
      stars.geometry.dispose()
      stars.material.dispose()
      ribbon.geometry.dispose()
      ribbon.material.dispose()
    },
  }
}
