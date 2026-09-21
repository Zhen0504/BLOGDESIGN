import {
  AmbientLight,
  Color,
  DirectionalLight,
  FogExp2,
  ACESFilmicToneMapping,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Scene,
  SRGBColorSpace,
  Timer,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

import { createCrystalMotionController } from './createCrystalMotionController'
import { createParticleGalaxy } from './createParticleGalaxy'
import { createQualityProfile } from './createQualityProfile'
import { createScenePostProcessing } from './createScenePostProcessing'
import { createSectionTransitionController } from './createSectionTransitionController'
import { loadCrystalSystem } from './loadCrystalSystem'

let sceneSequence = 0

function disposeSceneGraph(root) {
  const geometries = new Set()
  const materials = new Set()
  const textures = new Set()
  root.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry)
    const objectMaterials = Array.isArray(object.material)
      ? object.material
      : object.material ? [object.material] : []
    objectMaterials.forEach((material) => {
      materials.add(material)
      Object.values(material).forEach((value) => {
        if (value?.isTexture) textures.add(value)
      })
    })
  })
  textures.forEach((texture) => texture.dispose())
  materials.forEach((material) => material.dispose())
  geometries.forEach((geometry) => geometry.dispose())
}

function addLighting(scene) {
  scene.add(new AmbientLight('#21183f', 0.15))
  const warm = new PointLight('#d69a75', 1.7, 7, 2)
  warm.position.set(-2.4, 2, 2.5)
  scene.add(warm)
  const violet = new PointLight('#6842ff', 4.8, 8, 2)
  violet.position.set(4.3, 0.8, 2.4)
  scene.add(violet)
  const blue = new PointLight('#4f54ff', 2.8, 7.5, 2)
  blue.position.set(0.5, -2.9, 2.1)
  scene.add(blue)
  const top = new DirectionalLight('#a99dff', 0.28)
  top.position.set(0, 4, 4)
  scene.add(top)

  const rim = new PointLight('#9f7dff', 3.1, 6.5, 2)
  rim.position.set(5.0, -2.2, 0.8)
  scene.add(rim)
}

export async function createWelcomeCrystalScene({
  canvas,
  signal,
  initialSection,
  onStatus,
  onTransitionStart,
  onTransitionComplete,
  onPortalStart,
  onPortalComplete,
  onPortalProgress,
}) {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  })
  const quality = createQualityProfile(renderer)
  const scene = new Scene()
  const camera = new PerspectiveCamera(38, 1, 0.05, 100)
  const timer = new Timer()
  const instanceId = `welcome-crystal-${++sceneSequence}`
  const listeners = []
  const pmrem = new PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environmentTarget = pmrem.fromScene(room, 0.035)
  const galaxy = createParticleGalaxy(quality)
  let post = null
  let motion = null
  let transition = null
  let crystalModels = {}
  let rafId = 0
  let disposed = false
  let visible = !document.hidden
  let fpsStartedAt = performance.now()
  let fpsFrames = 0
  let averageFps = 0
  let frame = 0

  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.47
  renderer.setPixelRatio(quality.pixelRatio)
  scene.background = new Color('#01020b')
  scene.fog = new FogExp2('#020415', 0.022)
  scene.environment = environmentTarget.texture
  scene.add(galaxy.group)
  addLighting(scene)

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
  }

  function render(now) {
    if (disposed || !visible) return
    rafId = requestAnimationFrame(render)
    timer.update(now)
    const delta = Math.min(0.05, timer.getDelta())
    const time = now * 0.001
    frame += 1
    fpsFrames += 1
    const fpsElapsed = now - fpsStartedAt
    if (fpsElapsed >= 1000) {
      averageFps = fpsFrames * 1000 / fpsElapsed
      fpsFrames = 0
      fpsStartedAt = now
    }
    transition?.update(delta)
    if (motion) {
      motion.section = transition?.activeSection ?? initialSection
      motion.enabled = !transition?.isTransitioning
    }
    motion?.update(delta, time)
    galaxy.update(time, delta)
    post?.render(delta)
  }

  function start() {
    if (disposed || rafId || !visible) return
    timer.reset()
    fpsStartedAt = performance.now()
    fpsFrames = 0
    rafId = requestAnimationFrame(render)
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
  }

  function onVisibilityChange() {
    visible = !document.hidden
    if (visible) start()
    else stop()
  }

  function setSection(sectionId, immediate = false) {
    transition?.setSection(sectionId, immediate)
    galaxy.setSection(sectionId, immediate)
  }

  function enterPortal(sectionId) {
    if (window.innerWidth <= 760
      || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      || (averageFps > 0 && averageFps < 28)) return false
    galaxy.setSection(sectionId, false)
    return transition?.enterPortal(sectionId) ?? false
  }

  function exitPortal(sectionId) {
    if (window.innerWidth <= 760
      || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      || (averageFps > 0 && averageFps < 28)) return false
    galaxy.setSection(sectionId, true)
    return transition?.exitPortal(sectionId) ?? false
  }

  function dispose() {
    if (disposed) return
    disposed = true
    stop()
    motion?.dispose()
    motion = null
    listeners.splice(0).forEach((remove) => remove())
    post?.dispose()
    post = null
    galaxy.dispose()
    disposeSceneGraph(scene)
    environmentTarget.dispose()
    room.dispose?.()
    pmrem.dispose()
    timer.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    if (window.__WELCOME_CRYSTAL_SCENE__?.instanceId === instanceId) {
      delete window.__WELCOME_CRYSTAL_SCENE__
    }
  }

  const debug = window.__WELCOME_CRYSTAL_SCENE__ = {
    instanceId,
    ready: false,
    quality,
    get frame() { return frame },
    get averageFps() { return averageFps },
    get activeSection() { return transition?.activeSection ?? initialSection },
    get transitioning() { return transition?.isTransitioning ?? false },
    get activeRaf() { return Boolean(rafId) && !disposed },
    get listenerCount() { return listeners.length + (motion ? 2 : 0) },
    get renderCalls() { return renderer.info.render.calls },
    get triangles() { return renderer.info.render.triangles },
    get crystalTransforms() {
      return Object.fromEntries(Object.entries(crystalModels).map(([key, model]) => [key, {
        position: model.position.toArray(),
        rotation: [model.rotation.x, model.rotation.y, model.rotation.z],
      }]))
    },
    get pointerInfluences() { return motion?.influences ?? {} },
    setSection,
    enterPortal,
    exitPortal,
    setPointer(x, y) { motion?.setPointer(x, y) },
    pause: stop,
    resume: start,
    dispose,
  }

  if (signal) listen(signal, 'abort', dispose, { once: true })

  try {
    if (signal?.aborted) throw new Error('Crystal scene initialization cancelled.')
    onStatus?.('loading', 'Loading crystal system 0 / 5')
    const { system, models, failures } = await loadCrystalSystem((loaded, total) => {
      if (!disposed) onStatus?.('loading', `Loading crystal system ${loaded} / ${total}`)
    })
    if (disposed || signal?.aborted) {
      disposeSceneGraph(system)
      throw new Error('Crystal scene initialization cancelled.')
    }
    crystalModels = models
    scene.add(system)
    if (!models.about || !models.center) throw new Error('Required crystal assets could not be loaded.')
    post = createScenePostProcessing({ renderer, scene, camera, quality })
    transition = createSectionTransitionController({
      camera,
      models,
      depthOfField: post.depthOfField,
      quality,
      onProgress: onPortalProgress,
      onStart(sectionId, kind) {
        if (kind === 'section') onTransitionStart?.(sectionId)
        else onPortalStart?.(sectionId, kind)
      },
      onComplete(sectionId, kind) {
        if (kind === 'section') onTransitionComplete?.(sectionId)
        else onPortalComplete?.(sectionId, kind)
      },
    })
    transition.setSection(initialSection, true)
    galaxy.setSection(initialSection, true)
    motion = createCrystalMotionController({
      canvas,
      camera,
      models,
      galaxy,
      reducedMotion: quality.reducedMotion,
    })
    resize()
    listen(window, 'resize', resize)
    listen(document, 'visibilitychange', onVisibilityChange)
    debug.ready = true
    debug.failures = failures.map(({ key }) => key)
    onStatus?.('ready', '')
    start()
  } catch (error) {
    onStatus?.('fallback', error instanceof Error ? error.message : String(error))
    dispose()
    throw error
  }

  return { setSection, enterPortal, exitPortal, dispose, renderer, scene, camera }
}
