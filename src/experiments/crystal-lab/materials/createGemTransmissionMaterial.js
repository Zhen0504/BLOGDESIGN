import { MeshTransmissionMaterial } from '@pmndrs/vanilla/materials/MeshTransmissionMaterial.js'
import {
  Color,
  FrontSide,
  MeshPhysicalMaterial,
} from 'three'

function addRimLighting(material, {
  color = '#cfd7ff',
  intensity = 2.1,
  power = 4.5,
  tint = '#28356f',
  tintIntensity = 0.08,
  sheen = '#dce4ff',
  sheenIntensity = 0.12,
} = {}) {
  const baseCompile = material.onBeforeCompile.bind(material)
  material.onBeforeCompile = (shader, renderer) => {
    baseCompile(shader, renderer)
    shader.uniforms.crystalRimColor = { value: new Color(color) }
    shader.uniforms.crystalRimIntensity = { value: intensity }
    shader.uniforms.crystalRimPower = { value: power }
    shader.uniforms.crystalTint = { value: new Color(tint) }
    shader.uniforms.crystalTintIntensity = { value: tintIntensity }
    shader.uniforms.crystalSheen = { value: new Color(sheen) }
    shader.uniforms.crystalSheenIntensity = { value: sheenIntensity }
    shader.vertexShader = `
      varying vec3 vCrystalObjectPosition;
    ${shader.vertexShader}`.replace(
      '#include <begin_vertex>',
      `
        #include <begin_vertex>
        vCrystalObjectPosition = position;
      `,
    )
    shader.fragmentShader = `
      varying vec3 vCrystalObjectPosition;
      uniform vec3 crystalRimColor;
      uniform float crystalRimIntensity;
      uniform float crystalRimPower;
      uniform vec3 crystalTint;
      uniform float crystalTintIntensity;
      uniform vec3 crystalSheen;
      uniform float crystalSheenIntensity;
    ${shader.fragmentShader}`.replace(
      '#include <opaque_fragment>',
      `
        float crystalFresnel = pow(
          1.0 - clamp(abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0),
          crystalRimPower
        );
        float crystalSheenBand = exp(-pow(
          vCrystalObjectPosition.y + vCrystalObjectPosition.x * 0.32 - 0.82,
          2.0
        ) * 22.0);
        float crystalLowerBand = exp(-pow(
          vCrystalObjectPosition.y - vCrystalObjectPosition.x * 0.18 + 1.16,
          2.0
        ) * 42.0);
        float crystalFineBand = exp(-pow(
          vCrystalObjectPosition.y + vCrystalObjectPosition.x * 0.48 - 1.04,
          2.0
        ) * 115.0);
        outgoingLight += crystalTint * crystalTintIntensity * (0.42 + crystalFresnel * 0.58);
        outgoingLight += crystalSheen * crystalSheenIntensity
          * (crystalSheenBand + crystalLowerBand * 0.44 + crystalFineBand * 0.76)
          * (0.3 + crystalFresnel * 0.7);
        outgoingLight += crystalRimColor * crystalFresnel * crystalRimIntensity;
        #include <opaque_fragment>
      `,
    )
  }
  material.customProgramCacheKey = () => `crystal-rim-${color}-${intensity}-${power}-${tint}-${tintIntensity}-${sheen}-${sheenIntensity}`
  return material
}

export function createOuterGemMaterial({ buffer, environment, quality }) {
  const material = new MeshTransmissionMaterial({
    samples: quality.tier === 'high' ? 3 : 2,
    buffer,
    _transmission: 0.965,
    thickness: 0.31,
    roughness: 0.095,
    chromaticAberration: quality.tier === 'high' ? 0.018 : 0.009,
    anisotropicBlur: 0.035,
    distortion: 0.006,
    distortionScale: 0.32,
    temporalDistortion: 0,
    attenuationDistance: 2.35,
    attenuationColor: new Color('#8d9fe3'),
  })
  material.name = 'MAT_about_outer_realtime'
  material.color.set('#b6c2ed')
  material.ior = 1.49
  material.metalness = 0
  material.clearcoat = 1
  material.clearcoatRoughness = 0.075
  material.envMap = environment
  material.envMapIntensity = 1.0
  material.side = FrontSide
  material.depthWrite = true

  return addRimLighting(material, {
    color: '#9baaff',
    intensity: 1.38,
    power: 5.2,
    tint: '#324da8',
    tintIntensity: 0.12,
    sheen: '#d6ddff',
    sheenIntensity: 0.34,
  })
}

export function createInnerRingMaterial({ environment }) {
  const material = new MeshPhysicalMaterial({
    name: 'MAT_about_inner_ring_realtime',
    color: '#283065',
    metalness: 0,
    roughness: 0.16,
    transmission: 0,
    thickness: 0,
    ior: 1.44,
    dispersion: 0.02,
    clearcoat: 1,
    clearcoatRoughness: 0.11,
    transparent: true,
    opacity: 0.82,
    envMap: environment,
    envMapIntensity: 0.92,
    side: FrontSide,
  })
  return addRimLighting(material, {
    color: '#716fff',
    intensity: 0.82,
    power: 5.9,
    tint: '#3d42b7',
    tintIntensity: 0.14,
    sheen: '#949eff',
    sheenIntensity: 0.31,
  })
}

export function createGlassCoverMaterial({ buffer, environment, quality }) {
  const material = new MeshTransmissionMaterial({
    samples: 2,
    buffer,
    _transmission: 0.92,
    thickness: 0.095,
    roughness: 0.075,
    chromaticAberration: quality.tier === 'high' ? 0.012 : 0.006,
    anisotropicBlur: 0.025,
    distortion: 0.004,
    distortionScale: 0.22,
    temporalDistortion: 0,
    attenuationDistance: 2.8,
    attenuationColor: new Color('#aab6ea'),
  })
  material.name = 'MAT_about_glass_cover_realtime'
  material.color.set('#b6c4f1')
  material.ior = 1.46
  material.clearcoat = 1
  material.clearcoatRoughness = 0.055
  material.envMap = environment
  material.envMapIntensity = 0.82
  material.side = FrontSide
  material.depthWrite = true

  return addRimLighting(material, {
    color: '#c1caff',
    intensity: 0.72,
    power: 5.8,
    tint: '#33478d',
    tintIntensity: 0.055,
    sheen: '#dce3ff',
    sheenIntensity: 0.12,
  })
}
