import {
  Clock,
  Color,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three'

import { createQualityProfile } from './createQualityProfile'

let labSequence = 0

export async function createCrystalLab({ canvas, onStatus }) {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: false,
    antialias: false,
    powerPreference: 'high-performance',
  })
  const quality = createQualityProfile(renderer)
  const scene = new Scene()
  const camera = new PerspectiveCamera(34, 1, 0.1, 100)
  const clock = new Clock()
  const instanceId = `crystal-lab-${++labSequence}`
  const listeners = []
  let frame = 0
  let rafId = 0
  let disposed = false
  let fpsWindowStart = performance.now()
  let fpsWindowFrames = 0
  let averageFps = 0

  scene.background = new Color('#02040f')
  camera.position.set(0, 0, 7.2)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.setPixelRatio(quality.pixelRatio)

  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options)
    listeners.push(() => target.removeEventListener(type, handler, options))
  }

  function resize() {
    const width = Math.max(1, canvas.clientWidth)
    const height = Math.max(1, canvas.clientHeight)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  function render(now) {
    if (disposed) return
    frame += 1
    fpsWindowFrames += 1
    const elapsed = now - fpsWindowStart
    if (elapsed >= 1000) {
      averageFps = fpsWindowFrames * 1000 / elapsed
      fpsWindowFrames = 0
      fpsWindowStart = now
    }
    clock.getDelta()
    renderer.render(scene, camera)
    rafId = requestAnimationFrame(render)
  }

  function setView() {}
  function setPointer() {}

  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(rafId)
    listeners.splice(0).forEach((remove) => remove())
    renderer.dispose()
    renderer.forceContextLoss()
    if (window.__CRYSTAL_LAB__?.instanceId === instanceId) {
      delete window.__CRYSTAL_LAB__
    }
  }

  resize()
  listen(window, 'resize', resize)
  rafId = requestAnimationFrame(render)

  window.__CRYSTAL_LAB__ = {
    ready: false,
    instanceId,
    get activeRaf() {
      return !disposed && Boolean(rafId)
    },
    get listenerCount() {
      return listeners.length
    },
    qualityTier: quality.tier,
    get averageFps() {
      return averageFps
    },
    setView,
    setPointer,
    dispose,
  }

  onStatus?.('loading')
  await Promise.resolve()
  window.__CRYSTAL_LAB__.ready = true
  onStatus?.('ready')

  return { dispose, renderer, scene, camera, frame }
}
