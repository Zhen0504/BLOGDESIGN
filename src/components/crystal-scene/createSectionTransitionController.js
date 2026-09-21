import { Euler, Vector3 } from 'three'

import { setMaterialOpacity } from './createCrystalMaterials'
import { FOCUS_POSITIONS, SECTION_FOCUS, WELCOME_ANCHORS } from './crystalManifest'

const TRANSITION_DURATION = 1.35
const PORTAL_DURATION = 1.58

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2
}

function makeState(sectionId, models) {
  const focusKey = SECTION_FOCUS[sectionId] ?? null
  const overview = sectionId === '00' || !focusKey
  const modelStates = {}

  Object.keys(models).forEach((key) => {
    const anchor = WELCOME_ANCHORS[key]
    if (overview) {
      modelStates[key] = { ...anchor, opacity: 1 }
      return
    }

    if (key === focusKey) {
      modelStates[key] = {
        position: FOCUS_POSITIONS[key],
        rotation: [0.02, key === 'development' || key === 'contact' ? -0.12 : 0.12, anchor.rotation[2] * 0.35],
        scale: 1.52,
        opacity: 1,
      }
      return
    }

    const depth = key === 'center' ? -1.2 : -1.82
    modelStates[key] = {
      position: [anchor.position[0], anchor.position[1], depth],
      rotation: anchor.rotation,
      scale: key === 'center' ? 0.68 : 0.72,
      opacity: key === 'center' ? 0.34 : 0.22,
    }
  })

  const focusPosition = overview ? [3.12, 0, 0] : FOCUS_POSITIONS[focusKey]
  return {
    sectionId,
    focusKey,
    overview,
    camera: overview ? [0, 0, 8.28] : [0.22, 0.06, 6.42],
    lookAt: overview ? [1.92, 0, 0] : [focusPosition[0] * 0.42, focusPosition[1] * 0.2, 0.12],
    focusPosition,
    bokeh: overview ? 0 : 2.25,
    focusRange: overview ? 4.8 : 1.05,
    modelStates,
  }
}

function makePortalState(sectionId, models) {
  const focusKey = SECTION_FOCUS[sectionId]
  if (!focusKey) return null
  const modelStates = {}

  Object.keys(models).forEach((key) => {
    const anchor = WELCOME_ANCHORS[key]
    if (key === focusKey) {
      modelStates[key] = {
        position: [0, 0, 1.22],
        rotation: [0, 0, 0],
        scale: 4.9,
        opacity: 1,
      }
      return
    }

    modelStates[key] = {
      position: [anchor.position[0], anchor.position[1], -2.4],
      rotation: anchor.rotation,
      scale: 0.48,
      opacity: 0.04,
    }
  })

  return {
    sectionId,
    focusKey,
    overview: false,
    camera: [0, 0, 4.26],
    lookAt: [0, 0, 1.18],
    focusPosition: [0, 0, 1.22],
    bokeh: 4.8,
    focusRange: 0.22,
    modelStates,
  }
}

function snapshot(camera, lookAt, focusTarget, models, depthOfField) {
  const modelStates = {}
  Object.entries(models).forEach(([key, model]) => {
    modelStates[key] = {
      position: model.userData.restPosition.toArray(),
      rotation: model.userData.restRotation.toArray().slice(0, 3),
      scale: model.userData.restScale,
      opacity: model.userData.opacity,
    }
  })
  return {
    camera: camera.position.toArray(),
    lookAt: lookAt.toArray(),
    focusPosition: focusTarget.toArray(),
    bokeh: depthOfField.bokehScale,
    focusRange: depthOfField.cocMaterial.focusRange,
    modelStates,
  }
}

function lerpNumber(from, to, progress) {
  return from + (to - from) * progress
}

export function createSectionTransitionController({
  camera,
  models,
  depthOfField,
  quality,
  onStart,
  onComplete,
  onProgress,
}) {
  const lookAt = new Vector3(1.83, 0, 0)
  const focusTarget = new Vector3(1.92, 0, 0)
  let activeSection = '00'
  let fromState = null
  let toState = null
  let elapsed = 0
  let transitioning = false
  let transitionDuration = TRANSITION_DURATION
  let transitionKind = 'section'

  depthOfField.target = focusTarget

  function applyState(state, progress = 1) {
    const source = fromState ?? state
    camera.position.set(
      lerpNumber(source.camera[0], state.camera[0], progress),
      lerpNumber(source.camera[1], state.camera[1], progress),
      lerpNumber(source.camera[2], state.camera[2], progress),
    )
    lookAt.set(
      lerpNumber(source.lookAt[0], state.lookAt[0], progress),
      lerpNumber(source.lookAt[1], state.lookAt[1], progress),
      lerpNumber(source.lookAt[2], state.lookAt[2], progress),
    )
    camera.lookAt(lookAt)
    focusTarget.set(
      lerpNumber(source.focusPosition[0], state.focusPosition[0], progress),
      lerpNumber(source.focusPosition[1], state.focusPosition[1], progress),
      lerpNumber(source.focusPosition[2], state.focusPosition[2], progress),
    )
    depthOfField.bokehScale = quality.depthOfField
      ? lerpNumber(source.bokeh, state.bokeh, progress)
      : 0
    depthOfField.cocMaterial.focusRange = lerpNumber(
      source.focusRange,
      state.focusRange,
      progress,
    )

    Object.entries(models).forEach(([key, model]) => {
      const from = source.modelStates[key]
      const to = state.modelStates[key]
      model.userData.restPosition.set(
        lerpNumber(from.position[0], to.position[0], progress),
        lerpNumber(from.position[1], to.position[1], progress),
        lerpNumber(from.position[2], to.position[2], progress),
      )
      model.userData.restRotation.copy(new Euler(
        lerpNumber(from.rotation[0], to.rotation[0], progress),
        lerpNumber(from.rotation[1], to.rotation[1], progress),
        lerpNumber(from.rotation[2], to.rotation[2], progress),
      ))
      model.userData.restScale = lerpNumber(from.scale, to.scale, progress)
      model.userData.opacity = lerpNumber(from.opacity, to.opacity, progress)
      setMaterialOpacity(model.userData.materials, model.userData.opacity)
    })
  }

  function setSection(sectionId, immediate = false) {
    const targetState = makeState(sectionId, models)
    activeSection = sectionId
    if (immediate) {
      fromState = targetState
      toState = targetState
      applyState(targetState, 1)
      transitioning = false
      transitionKind = 'section'
      onComplete?.(sectionId, transitionKind)
      return
    }
    fromState = snapshot(camera, lookAt, focusTarget, models, depthOfField)
    toState = targetState
    elapsed = 0
    transitionDuration = TRANSITION_DURATION
    transitionKind = 'section'
    transitioning = true
    onStart?.(sectionId, transitionKind)
  }

  function enterPortal(sectionId) {
    const targetState = makePortalState(sectionId, models)
    if (!targetState || !models[targetState.focusKey] || quality.reducedMotion || quality.compact || !quality.webgl2) return false
    activeSection = sectionId
    fromState = snapshot(camera, lookAt, focusTarget, models, depthOfField)
    toState = targetState
    elapsed = 0
    transitionDuration = PORTAL_DURATION
    transitionKind = 'portal-enter'
    transitioning = true
    onStart?.(sectionId, transitionKind)
    return true
  }

  function exitPortal(sectionId) {
    const portalState = makePortalState(sectionId, models)
    if (!portalState || !models[portalState.focusKey] || quality.reducedMotion || quality.compact || !quality.webgl2) return false
    activeSection = sectionId
    fromState = portalState
    toState = makeState(sectionId, models)
    applyState(portalState, 1)
    elapsed = 0
    transitionDuration = PORTAL_DURATION
    transitionKind = 'portal-exit'
    transitioning = true
    onStart?.(sectionId, transitionKind)
    return true
  }

  function update(delta) {
    if (!transitioning || !toState) return
    elapsed += delta
    const rawProgress = Math.min(1, elapsed / transitionDuration)
    const progress = quality.reducedMotion ? rawProgress : easeInOutCubic(rawProgress)
    applyState(toState, progress)
    onProgress?.(activeSection, transitionKind, rawProgress)
    if (rawProgress >= 1) {
      transitioning = false
      fromState = toState
      onComplete?.(activeSection, transitionKind)
    }
  }

  return {
    get isTransitioning() {
      return transitioning
    },
    get activeSection() {
      return activeSection
    },
    setSection,
    enterPortal,
    exitPortal,
    update,
  }
}
