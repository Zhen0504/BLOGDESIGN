import { Euler, Vector2, Vector3 } from 'three'

const MOTION = Object.freeze({
  about: { phase: 0.3, x: 0.115, y: 0.085, tilt: 0.082 },
  development: { phase: 1.7, x: 0.09, y: 0.105, tilt: 0.072 },
  research: { phase: 3.2, x: 0.105, y: 0.09, tilt: 0.078 },
  contact: { phase: 4.8, x: 0.085, y: 0.10, tilt: 0.07 },
  center: { phase: 2.4, x: 0.032, y: 0.026, tilt: 0.024 },
})

export function createCrystalMotionController({ canvas, models, galaxy, reducedMotion }) {
  const pointer = new Vector2()
  const target = new Vector2()
  const tempPosition = new Vector3()
  const tempRotation = new Euler()
  let enabled = true

  function setPointer(x, y) {
    target.set(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)))
  }

  function onPointerMove(event) {
    const rect = canvas.getBoundingClientRect()
    setPointer(
      ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
      -(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1),
    )
  }

  function onPointerLeave() {
    setPointer(0, 0)
  }

  function update(delta, time) {
    const response = 1 - Math.exp(-Math.min(delta, 0.05) * 5.4)
    pointer.lerp(target, response)
    const inputStrength = enabled && !reducedMotion ? 1 : 0

    Object.entries(models).forEach(([key, model]) => {
      const motion = MOTION[key]
      if (!motion || !model.userData.restPosition) return
      const rest = model.userData.restPosition
      const rotation = model.userData.restRotation
      const distanceWeight = key === 'center'
        ? 0.34
        : 0.72 + 0.28 * Math.max(0, 1 - Math.abs(pointer.x - rest.x / 4.2))
      const idleWeight = reducedMotion ? 0 : 1
      const breathe = Math.sin(time * (0.48 + motion.x) + motion.phase)
      tempPosition.set(
        rest.x + pointer.x * motion.x * distanceWeight * inputStrength,
        rest.y + pointer.y * motion.y * distanceWeight * inputStrength
          + breathe * 0.018 * idleWeight,
        rest.z + Math.cos(time * 0.41 + motion.phase) * 0.015 * idleWeight,
      )
      model.position.lerp(tempPosition, response)

      tempRotation.set(
        rotation.x - pointer.y * motion.tilt * inputStrength,
        rotation.y + pointer.x * motion.tilt * inputStrength,
        rotation.z + breathe * 0.009 * idleWeight,
      )
      model.rotation.x += (tempRotation.x - model.rotation.x) * response
      model.rotation.y += (tempRotation.y - model.rotation.y) * response
      model.rotation.z += (tempRotation.z - model.rotation.z) * response
      model.scale.setScalar(model.userData.restScale)
    })

    const galaxyRest = galaxy.group.userData.restPosition
    galaxy.group.position.set(
      galaxyRest.x - pointer.x * 0.045 * inputStrength,
      galaxyRest.y - pointer.y * 0.032 * inputStrength,
      galaxyRest.z,
    )
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerout', onPointerLeave, { passive: true })

  return {
    set enabled(value) {
      enabled = Boolean(value)
      if (!enabled) setPointer(0, 0)
    },
    setPointer,
    update,
    dispose() {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerout', onPointerLeave)
    },
  }
}
