import { HalfFloatType, UnsignedByteType, Vector3 } from 'three'
import {
  BloomEffect,
  DepthOfFieldEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  VignetteEffect,
} from 'postprocessing'

export function createScenePostProcessing({ renderer, scene, camera, quality }) {
  const halfFloat = Boolean(renderer.getContext().getExtension('EXT_color_buffer_float'))
  const composer = new EffectComposer(renderer, {
    frameBufferType: halfFloat ? HalfFloatType : UnsignedByteType,
    multisampling: 0,
  })
  const renderPass = new RenderPass(scene, camera)
  const depthOfField = new DepthOfFieldEffect(camera, {
    focusDistance: 6.2,
    focusRange: 4.8,
    bokehScale: 0,
    resolutionScale: quality.compact ? 0.25 : 0.35,
  })
  depthOfField.target = new Vector3(1.9, 0, 0)
  const bloom = new BloomEffect({
    intensity: quality.bloomIntensity,
    luminanceThreshold: 0.82,
    luminanceSmoothing: 0.22,
    mipmapBlur: true,
    radius: 0.62,
    levels: quality.compact ? 4 : 6,
  })
  const vignette = new VignetteEffect({ offset: 0.28, darkness: 0.72 })
  const effectPass = new EffectPass(camera, depthOfField, bloom, vignette)
  composer.addPass(renderPass)
  composer.addPass(effectPass)

  return {
    composer,
    depthOfField,
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
