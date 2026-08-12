import {
  AdditiveBlending,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from 'three'

function seededRandom(seed) {
  let value = seed >>> 0
  return () => {
    value = (1664525 * value + 1013904223) >>> 0
    return value / 0x100000000
  }
}

function createBackgroundPlane() {
  const material = new ShaderMaterial({
    depthWrite: false,
    uniforms: {
      innerColor: { value: new Color('#0b1030') },
      outerColor: { value: new Color('#01030d') },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform vec3 innerColor;
      uniform vec3 outerColor;
      void main() {
        vec2 p = vUv - vec2(0.53, 0.50);
        float radius = length(p * vec2(0.82, 1.0));
        float halo = 1.0 - smoothstep(0.02, 0.72, radius);
        float vertical = smoothstep(0.0, 1.0, vUv.y) * 0.08;
        gl_FragColor = vec4(mix(outerColor, innerColor, halo + vertical), 1.0);
      }
    `,
  })
  const plane = new Mesh(new PlaneGeometry(18, 11), material)
  plane.name = 'CrystalLabBackdrop'
  plane.position.z = -4.2
  return plane
}

function createStars() {
  const random = seededRandom(504)
  const positions = []
  const colors = []
  for (let index = 0; index < 330; index += 1) {
    const angle = random() * Math.PI * 2
    const radius = Math.pow(random(), 0.72) * 7.6
    positions.push(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.66,
      -2.5 - random() * 1.1,
    )
    const warm = random() > 0.93
    const color = new Color(warm ? '#f1c68a' : random() > 0.65 ? '#8795ff' : '#dce4ff')
    colors.push(color.r, color.g, color.b)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  const material = new PointsMaterial({
    size: 0.027,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.78,
    vertexColors: true,
    blending: AdditiveBlending,
    depthWrite: false,
  })
  return new Points(geometry, material)
}

function createGalaxyLine(scale, opacity, color, z) {
  const points = []
  for (let index = 0; index < 96; index += 1) {
    const angle = index / 96 * Math.PI * 2
    const radius = scale * (1 + 0.07 * Math.sin(angle * 3 + 0.45))
    points.push(new Vector3(
      Math.cos(angle) * radius * 1.22,
      Math.sin(angle) * radius * 0.87,
      z + 0.05 * Math.sin(angle * 2),
    ))
  }
  const curve = new CatmullRomCurve3(points, true, 'centripetal')
  const geometry = new BufferGeometry().setFromPoints(curve.getPoints(280))
  const material = new LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: AdditiveBlending,
    depthWrite: false,
  })
  return new Line(geometry, material)
}

function createGlints() {
  const group = new Group()
  const locations = [
    [-1.24, 1.13, 0.14, '#dce5ff', 0.030],
    [1.17, -1.09, 0.16, '#a7b5ff', 0.034],
    [1.36, 0.72, 0.10, '#efc483', 0.027],
    [-1.05, -1.28, 0.12, '#bdc9ff', 0.032],
  ]
  for (const [x, y, z, color, radius] of locations) {
    const material = new MeshBasicMaterial({ color, toneMapped: false })
    material.color.multiplyScalar(color === '#efc483' ? 2.1 : 2.8)
    const glint = new Mesh(new SphereGeometry(radius, 16, 12), material)
    glint.position.set(x, y, z)
    group.add(glint)
  }
  group.name = 'CrystalEdgeGlints'
  return group
}

export function createCosmicBackdrop() {
  const group = new Group()
  group.name = 'CrystalLabCosmos'
  group.add(
    createBackgroundPlane(),
    createStars(),
    createGalaxyLine(2.12, 0.24, '#5363ff', -0.45),
    createGalaxyLine(2.26, 0.10, '#a9b4ff', -0.53),
  )
  return { group, glints: createGlints() }
}
