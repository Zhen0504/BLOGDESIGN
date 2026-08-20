import {
  AdditiveBlending,
  Color,
  DoubleSide,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  ShaderMaterial,
} from 'three'

function glassMaterial({ inner = false } = {}) {
  return new MeshPhysicalMaterial({
    color: inner ? '#b9afff' : '#cbc4ff',
    metalness: 0,
    roughness: inner ? 0.045 : 0.065,
    transmission: 1,
    transparent: true,
    opacity: inner ? 0.44 : 0.7,
    ior: inner ? 1.42 : 1.47,
    thickness: inner ? 0.085 : 0.22,
    attenuationColor: inner ? '#8c72ff' : '#6845e8',
    attenuationDistance: inner ? 3.8 : 2.4,
    dispersion: inner ? 0.03 : 0.055,
    iridescence: inner ? 0.005 : 0.012,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [120, 220],
    clearcoat: 1,
    clearcoatRoughness: inner ? 0.035 : 0.05,
    specularIntensity: inner ? 0.5 : 0.48,
    specularColor: new Color('#f4f0ff'),
    envMapIntensity: inner ? 0.48 : 0.52,
    side: DoubleSide,
    depthWrite: !inner,
  })
}

function edgeMaterial(center = false) {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(center ? '#786cff' : '#9a91ff') },
      uIntensity: { value: center ? 2.4 : 0.9 },
      uOpacity: { value: center ? 0.58 : 0.2 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uIntensity;
      uniform float uOpacity;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.25);
        float alpha = rim * uOpacity;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(uColor * (0.35 + rim * uIntensity), alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    toneMapped: false,
  })
}

export function createCrystalMaterials(key) {
  const icon = new MeshBasicMaterial({
    color: '#ecebff',
    transparent: true,
    opacity: 0.98,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  })
  const star = new MeshBasicMaterial({
    color: '#a99cff',
    transparent: true,
    opacity: 0.74,
    toneMapped: false,
  })
  const core = new MeshBasicMaterial({
    color: '#c7d0ff',
    transparent: true,
    opacity: 0.9,
    toneMapped: false,
  })

  return {
    outer: glassMaterial(),
    inner: glassMaterial({ inner: true }),
    icon,
    star,
    core,
    edge: edgeMaterial(key === 'center'),
  }
}

export function setMaterialOpacity(materials, opacity) {
  materials.outer.opacity = 0.7 * opacity
  materials.inner.opacity = 0.44 * opacity
  materials.icon.opacity = Math.min(0.98, opacity * 1.2)
  materials.star.opacity = Math.min(0.78, opacity)
  materials.core.opacity = Math.min(0.94, opacity * 1.1)
  materials.edge.uniforms.uOpacity.value = (materials.key === 'center' ? 0.58 : 0.2) * opacity
}
