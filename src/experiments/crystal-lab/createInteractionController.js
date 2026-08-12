import { Euler, Vector2, Vector3 } from 'three'

import { CRYSTAL_VIEWS, POINTER_LIMITS } from './crystalConstants'

export function createInteractionController({ canvas, root, nodes, reducedMotion }) {
  const pointer = new Vector2()
  const pointerTarget = new Vector2()
  const basePosition = new Vector3()
  const baseRotation = new Euler()
  const nodeBasePositions = new Map(
    Object.values(nodes).map((node) => [node, node.position.clone()]),
  )
  let currentView = 'front'

  function setView(name) {
    const next = CRYSTAL_VIEWS[name]
    if (!next) throw new Error(`Unknown crystal view: ${name}`)
    currentView = name
    baseRotation.set(...next.rotation)
  }

  function setPointer(x, y) {
    pointerTarget.set(
      Math.max(-1, Math.min(1, x)),
      Math.max(-1, Math.min(1, y)),
    )
  }

  function onPointerMove(event) {
    const rect = canvas.getBoundingClientRect()
    setPointer(
      (event.clientX - rect.left) / Math.max(rect.width, 1) * 2 - 1,
      -((event.clientY - rect.top) / Math.max(rect.height, 1) * 2 - 1),
    )
  }

  function onPointerLeave() {
    setPointer(0, 0)
  }

  function update(delta) {
    const response = 1 - Math.exp(-Math.min(delta, 0.05) * 6.5)
    pointer.lerp(pointerTarget, response)
    const weight = reducedMotion ? 0.18 : 1
    root.rotation.x = baseRotation.x - pointer.y * POINTER_LIMITS.pitch * weight
    root.rotation.y = baseRotation.y + pointer.x * POINTER_LIMITS.yaw * weight
    root.rotation.z = baseRotation.z + pointer.x * 0.018 * weight
    root.position.copy(basePosition)
    root.position.x += pointer.x * POINTER_LIMITS.translation * weight
    root.position.y += pointer.y * POINTER_LIMITS.translation * 0.65 * weight

    if (!reducedMotion) {
      const parallax = {
        outerFrame: 0.010,
        innerRing: 0.019,
        panel: 0.028,
        glassCover: 0.034,
      }
      for (const [key, node] of Object.entries(nodes)) {
        const origin = nodeBasePositions.get(node)
        const amount = parallax[key] ?? 0
        node.position.set(
          origin.x + pointer.x * amount,
          origin.y + pointer.y * amount * 0.72,
          origin.z,
        )
      }
    }
  }

  setView('front')
  canvas.addEventListener('pointermove', onPointerMove, { passive: true })
  canvas.addEventListener('pointerleave', onPointerLeave, { passive: true })

  return {
    get currentView() {
      return currentView
    },
    setView,
    setPointer,
    update,
    dispose() {
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
    },
  }
}
