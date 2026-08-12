import { HalfFloatType, UnsignedByteType } from 'three'
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from 'postprocessing'

export function createPostProcessing({ renderer, scene, camera, quality }) {
  const composer = new EffectComposer(renderer, {
    frameBufferType: quality.halfFloat ? HalfFloatType : UnsignedByteType,
    multisampling: 0,
  })
  const renderPass = new RenderPass(scene, camera)
  const bloom = new BloomEffect({
    intensity: quality.tier === 'high' ? 0.62 : 0.48,
    luminanceThreshold: 1.28,
    luminanceSmoothing: 0.18,
    mipmapBlur: true,
    radius: 0.56,
    levels: 5,
  })
  const toneMapping = new ToneMappingEffect({
    mode: ToneMappingMode.ACES_FILMIC,
  })
  const vignette = new VignetteEffect({
    offset: 0.31,
    darkness: 0.62,
  })
  const effectPass = new EffectPass(camera, bloom, toneMapping, vignette)
  composer.addPass(renderPass)
  composer.addPass(effectPass)

  return {
    composer,
    setSize(width, height) {
      composer.setSize(width, height)
    },
    render(delta) {
      composer.render(delta)
    },
    dispose() {
      composer.dispose()
    },
  }
}
