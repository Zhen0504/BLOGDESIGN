import { Euler, Vector2, Vector3 } from 'three'

import { SECTION_FOCUS } from './crystalManifest'

const MOTION = Object.freeze({
  about: { phase: 0.3, x: 0.15, y: 0.115, tilt: 0.095, response: 4.2 },
  development: { phase: 1.7, x: 0.125, y: 0.145, tilt: 0.086, response: 3.4 },
  research: { phase: 3.2, x: 0.14, y: 0.125, tilt: 0.092, response: 3.8 },
  contact: { phase: 4.8, x: 0.12, y: 0.135, tilt: 0.082, response: 3.1 },
  center: { phase: 2.4, x: 0.046, y: 0.038, tilt: 0.032, response: 2.8 },
})

const clamp01 = (value) => Math.max(0, Math.min(1, value))

export function createCrystalMotionController({ canvas, camera, models, galaxy, reducedMotion }) {
  const pointer = new Vector2()
  const target = new Vector2()
  const projected = new Vector3()
  const tempPosition = new Vector3()
  const tempRotation = new Euler()
  let enabled = true
  let pointerActive = false
  let sectionId = '00'
  const influences = {}

  function setPointer(x, y) {
    target.set(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)))
    pointerActive = true
  }

  function onPointerMove(event) {
    const rect = canvas.getBoundingClientRect()
    setPointer(
      ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
      -(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1),
    )
  }

  function onPointerLeave() {
    pointerActive = false
    target.set(0, 0)
  }

  function pointerInfluence(rest) {
    if (!pointerActive) return 0
    projected.copy(rest).project(camera)
    const width = Math.max(1, canvas.clientWidth)
    const height = Math.max(1, canvas.clientHeight)
    const dx = (pointer.x - projected.x) * width * 0.5
    const dy = (pointer.y - projected.y) * height * 0.5
    const radius = Math.min(390, Math.max(210, Math.min(width, height) * 0.37))
    const normalized = clamp01(1 - Math.hypot(dx, dy) / radius)
    return normalized * normalized * (3 - 2 * normalized)
  }

  function update(delta, time) {
    const pointerResponse = 1 - Math.exp(-Math.min(delta, 0.05) * 5.1)
    pointer.lerp(target, pointerResponse)
    const inputStrength = enabled && !reducedMotion ? 1 : 0
    const focusKey = SECTION_FOCUS[sectionId]
    const overview = sectionId === '00' || !focusKey

    Object.entries(models).forEach(([key, model]) => {
      const motion = MOTION[key]
      if (!motion || !model.userData.restPosition) return
      const rest = model.userData.restPosition
      const rotation = model.userData.restRotation
      const proximity = pointerInfluence(rest)
      influences[key] = proximity
      const selected = key === focusKey
      const sectionWeight = overview
        ? (key === 'center' ? 0.28 : 0.12 + proximity * 0.88)
        : selected
          ? 0.38 + proximity * 0.62
          : 0.045 + proximity * 0.17
      const breathe = reducedMotion ? 0 : Math.sin(time * (0.46 + motion.x) + motion.phase)
      const response = 1 - Math.exp(-Math.min(delta, 0.05) * motion.response)
      const lift = proximity * (selected ? 0.075 : 0.052) * inputStrength

      tempPosition.set(
        rest.x + pointer.x * motion.x * sectionWeight * inputStrength,
        rest.y + pointer.y * motion.y * sectionWeight * inputStrength + breathe * 0.015,
        rest.z + lift + Math.cos(time * 0.39 + motion.phase) * 0.012,
      )
      model.position.lerp(tempPosition, response)

      tempRotation.set(
        rotation.x - pointer.y * motion.tilt * sectionWeight * inputStrength,
        rotation.y + pointer.x * motion.tilt * sectionWeight * inputStrength,
        rotation.z + breathe * 0.008,
      )
      model.rotation.x += (tempRotation.x - model.rotation.x) * response
      model.rotation.y += (tempRotation.y - model.rotation.y) * response
      model.rotation.z += (tempRotation.z - model.rotation.z) * response
      model.scale.setScalar(model.userData.restScale * (1 + proximity * 0.012 * inputStrength))
    })

    const galaxyRest = galaxy.group.userData.restPosition
    const parallax = overview ? 1 : 0.46
    galaxy.group.position.set(
      galaxyRest.x - pointer.x * 0.075 * parallax * inputStrength,
      galaxyRest.y - pointer.y * 0.052 * parallax * inputStrength,
      galaxyRest.z,
    )
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('blur', onPointerLeave)

  return {
    set enabled(value) {
      enabled = Boolean(value)
    },
    set section(value) {
      sectionId = value
    },
    setPointer,
    get influences() {
      return { ...influences }
    },
    update,
    dispose() {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('blur', onPointerLeave)
    },
  }
}
