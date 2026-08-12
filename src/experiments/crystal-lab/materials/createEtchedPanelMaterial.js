import {
  Color,
  FrontSide,
  MeshPhysicalMaterial,
  NoColorSpace,
  TextureLoader,
} from 'three'

export async function createEtchedPanelMaterial({ iconUrl, environment }) {
  const icon = await new TextureLoader().loadAsync(iconUrl)
  icon.colorSpace = NoColorSpace
  icon.flipY = false

  const material = new MeshPhysicalMaterial({
    name: 'MAT_about_etched_panel_realtime',
    color: '#050819',
    metalness: 0,
    roughness: 0.27,
    transmission: 0,
    thickness: 0,
    ior: 1.42,
    emissive: '#070d32',
    emissiveIntensity: 0.82,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMap: environment,
    envMapIntensity: 0.7,
    bumpMap: icon,
    bumpScale: -0.045,
    side: FrontSide,
  })

  material.onBeforeCompile = (shader) => {
    shader.uniforms.etchMap = { value: icon }
    shader.uniforms.etchColor = { value: new Color('#cbd3ff') }
    shader.uniforms.etchIntensity = { value: 1.05 }
    shader.fragmentShader = `
      uniform sampler2D etchMap;
      uniform vec3 etchColor;
      uniform float etchIntensity;
    ${shader.fragmentShader}`
      .replace(
        '#include <roughnessmap_fragment>',
        `
          #include <roughnessmap_fragment>
          float crystalEtchMask = texture2D(etchMap, vBumpMapUv).r;
          roughnessFactor = mix(roughnessFactor, 0.68, crystalEtchMask);
        `,
      )
      .replace(
        '#include <lights_fragment_end>',
        `
          #include <lights_fragment_end>
          float crystalEtchFresnel = pow(
            1.0 - clamp(abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0),
            2.4
          );
          float crystalEtchEdge = smoothstep(0.08, 0.48, crystalEtchMask)
            * (1.0 - smoothstep(0.52, 0.94, crystalEtchMask));
          float crystalEtchCore = smoothstep(0.58, 0.92, crystalEtchMask);
          totalEmissiveRadiance += etchColor
            * (crystalEtchEdge * 1.15 + crystalEtchCore * 0.48)
            * (0.72 + crystalEtchFresnel * etchIntensity);
        `,
      )
      .replace(
        '#include <opaque_fragment>',
        `
          outgoingLight *= 1.0 - crystalEtchCore * 0.22;
          #include <opaque_fragment>
        `,
      )
  }
  material.customProgramCacheKey = () => 'about-etched-panel-v3'
  material.userData.ownedTextures = [icon]
  return material
}
