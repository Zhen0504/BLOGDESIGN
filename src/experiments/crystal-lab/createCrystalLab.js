import {
  Color,
  HalfFloatType,
  LinearFilter,
  NoToneMapping,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Timer,
  UnsignedByteType,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three'

import { createCosmicBackdrop } from './createCosmicBackdrop'
import { createCrystalEnvironment } from './createCrystalEnvironment'
import { createInteractionController } from './createInteractionController'
import { createPostProcessing } from './createPostProcessing'
import { createQualityProfile } from './createQualityProfile'
import { loadAboutCrystal } from './loadAboutCrystal'

let labSequence = 0

function disposeObjectResources(root) {
  const geometries = new Set()
  const materials = new Set()
  const textures = new Set()
  root.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry)
    const objectMaterials = Array.isArray(object.material)
      ? object.material
      : object.material ? [object.material] : []
    for (const material of objectMaterials) {
      materials.add(material)
      for (const texture of material.userData?.ownedTextures ?? []) textures.add(texture)
    }
  })
  textures.forEach((texture) => texture.dispose())
  materials.forEach((material) => material.dispose())
  geometries.forEach((geometry) => geometry.dispose())
}

export async function createCrystalLab({ canvas, onStatus }) {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: false,
    antialias: false,
    powerPreference: 'high-performance',
  })
  const quality = createQualityProfile(renderer)
  if (quality.tier === 'fallback') {
    renderer.dispose()
    renderer.forceContextLoss()
    throw new Error('This crystal study requires WebGL2.')
  }

  const scene = new Scene()
  const camera = new PerspectiveCamera(34, 1, 0.1, 100)
  const timer = new Timer()
  const instanceId = `crystal-lab-${++labSequence}`
  const listeners = []
  const pmrem = new PMREMGenerator(renderer)
  const environmentScene = createCrystalEnvironment()
  const environmentTarget = pmrem.fromScene(environmentScene, 0.024)
  const captureTarget = new WebGLRenderTarget(2, 2, {
    type: quality.halfFloat ? HalfFloatType : UnsignedByteType,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    depthBuffer: true,
  })
  const { group: cosmos, glints } = createCosmicBackdrop()

  let rafId = 0
  let disposed = false
  let visible = !document.hidden
  let frame = 0
  let fpsWindowStart = performance.now()
  let fpsWindowFrames = 0
  let averageFps = 0
  let lastRenderAt = 0
  let interaction = null
  let crystal = null
  let post = null
  let debug = null

  scene.background = new Color('#01030d')
  scene.environment = environmentTarget.texture
  scene.add(cosmos)
  camera.position.set(0, 0, 7.2)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = NoToneMapping
  renderer.setPixelRatio(quality.pixelRatio)

  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options)
    listeners.push(() => target.removeEventListener(type, handler, options))
  }

  function resize() {
    if (disposed) return
    const width = Math.max(1, canvas.clientWidth)
    const height = Math.max(1, canvas.clientHeight)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    post?.setSize(width, height)
    const captureScale = quality.transmissionScale * quality.pixelRatio
    captureTarget.setSize(
      Math.max(2, Math.round(width * captureScale)),
      Math.max(2, Math.round(height * captureScale)),
    )
  }

  function captureTransmission() {
    if (!crystal) return
    const previousVisible = crystal.nodes.outerFrame.visible
    const previousCoverVisible = crystal.nodes.glassCover.visible
    crystal.nodes.outerFrame.visible = false
    crystal.nodes.glassCover.visible = false
    renderer.setRenderTarget(captureTarget)
    renderer.clear()
    renderer.render(scene, camera)
    renderer.setRenderTarget(null)
    crystal.nodes.outerFrame.visible = previousVisible
    crystal.nodes.glassCover.visible = previousCoverVisible
  }

  function render(now) {
    if (disposed || !visible) return
    rafId = requestAnimationFrame(render)
    const frameInterval = 1000 / 60
    const sinceLastRender = now - lastRenderAt
    if (lastRenderAt && sinceLastRender < frameInterval - 2) return
    lastRenderAt = now - (sinceLastRender % frameInterval)
    timer.update(now)
    const delta = Math.min(timer.getDelta(), 0.05)
    frame += 1
    fpsWindowFrames += 1
    const elapsed = now - fpsWindowStart
    if (elapsed >= 1000) {
      averageFps = fpsWindowFrames * 1000 / elapsed
      fpsWindowFrames = 0
      fpsWindowStart = now
    }

    interaction?.update(delta)
    const outerMaterial = crystal?.nodes.outerFrame.material
    if (outerMaterial?.uniforms?.time) {
      outerMaterial.uniforms.time.value += delta
    }
    const coverMaterial = crystal?.nodes.glassCover.material
    if (coverMaterial?.uniforms?.time) {
      coverMaterial.uniforms.time.value += delta
    }
    captureTransmission()
    post?.render(delta)
  }

  function start() {
    if (disposed || rafId || !visible) return
    timer.reset()
    fpsWindowStart = performance.now()
    fpsWindowFrames = 0
    lastRenderAt = 0
    rafId = requestAnimationFrame(render)
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
  }

  function setView(name) {
    interaction?.setView(name)
  }

  function setPointer(x, y) {
    interaction?.setPointer(x, y)
  }

  function onVisibilityChange() {
    visible = !document.hidden
    if (visible) start()
    else stop()
  }

  function dispose() {
    if (disposed) return
    disposed = true
    stop()
    interaction?.dispose()
    interaction = null
    listeners.splice(0).forEach((remove) => remove())
    post?.dispose()
    post = null
    disposeObjectResources(scene)
    captureTarget.dispose()
    environmentTarget.dispose()
    disposeObjectResources(environmentScene)
    pmrem.dispose()
    timer.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    if (window.__CRYSTAL_LAB__?.instanceId === instanceId) {
      delete window.__CRYSTAL_LAB__
    }
  }

  debug = window.__CRYSTAL_LAB__ = {
    ready: false,
    instanceId,
    get activeRaf() {
      return !disposed && Boolean(rafId)
    },
    get listenerCount() {
      return listeners.length + (interaction ? 2 : 0)
    },
    qualityTier: quality.tier,
    get averageFps() {
      return averageFps
    },
    get frame() {
      return frame
    },
    setView,
    setPointer,
    dispose,
  }

  try {
    onStatus?.('loading')
    crystal = await loadAboutCrystal({
      buffer: captureTarget.texture,
      environment: environmentTarget.texture,
      quality,
    })
    crystal.root.add(glints)
    scene.add(crystal.root)
    interaction = createInteractionController({
      canvas,
      root: crystal.root,
      nodes: crystal.nodes,
      reducedMotion: quality.reducedMotion,
    })
    post = createPostProcessing({ renderer, scene, camera, quality })
    resize()
    listen(window, 'resize', resize)
    listen(document, 'visibilitychange', onVisibilityChange)
    debug.ready = true
    onStatus?.('ready')
    start()
  } catch (error) {
    dispose()
    throw error
  }

  return { dispose, renderer, scene, camera }
}
