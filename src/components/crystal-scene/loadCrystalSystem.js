import { Box3, Group, Mesh, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

import { createCrystalMaterials } from './createCrystalMaterials'
import { CRYSTAL_KEYS, CRYSTAL_MANIFEST } from './crystalManifest'

function normalizeModel(model, targetSize) {
  model.updateMatrixWorld(true)
  const bounds = new Box3().setFromObject(model)
  const center = bounds.getCenter(new Vector3())
  const size = bounds.getSize(new Vector3())
  model.position.sub(center)
  model.scale.setScalar(targetSize / Math.max(size.x, size.y, size.z, 0.001))
}

function applyMaterials(model, key, materials) {
  const edgeSources = []

  model.traverse((object) => {
    if (!object.isMesh) return
    object.castShadow = false
    object.receiveShadow = false
    const name = object.name.toLowerCase()

    if (name.includes('outer_crystal')) {
      object.material = materials.outer
      object.renderOrder = 1
      edgeSources.push(object)
    } else if (name.includes('inner_crystal')) {
      object.material = materials.inner
      object.renderOrder = 2
    } else if (
      name.includes('user')
      || name.includes('head')
      || name.includes('shoulder')
      || name.includes('icon')
    ) {
      object.material = materials.icon
      object.renderOrder = 8
    } else if (name === 'energy_core') {
      object.visible = false
    } else if (name.includes('energy_core_center')) {
      object.material = materials.core
      object.scale.multiplyScalar(0.35)
    } else if (name.includes('star')) {
      // The Blender files contain hundreds of individual star meshes. The
      // shared particle ribbon replaces them with two GPU draw calls.
      object.visible = false
    }
  })

  for (const source of edgeSources) {
    const edge = new Mesh(source.geometry, materials.edge)
    edge.name = `${source.name}_WebEdge`
    edge.scale.setScalar(key === 'center' ? 1.012 : 1.005)
    edge.renderOrder = 5
    source.add(edge)
  }
}

async function loadOne(loader, key) {
  const definition = CRYSTAL_MANIFEST[key]
  const gltf = await loader.loadAsync(definition.url)
  const materials = createCrystalMaterials(key)
  materials.key = key
  applyMaterials(gltf.scene, key, materials)
  normalizeModel(gltf.scene, definition.targetSize)

  const orientation = new Group()
  orientation.rotation.x = Math.PI / 2
  orientation.add(gltf.scene)

  const root = new Group()
  root.name = `Crystal_${key}`
  root.add(orientation)
  root.userData.materials = materials
  root.userData.restPosition = root.position.clone()
  root.userData.restRotation = root.rotation.clone()
  root.userData.restScale = 1
  root.userData.opacity = 1

  return root
}

export async function loadCrystalSystem(onProgress) {
  const loader = new GLTFLoader()
  const system = new Group()
  system.name = 'WelcomeCrystalSystem'
  const models = {}
  let completed = 0

  const results = await Promise.allSettled(
    CRYSTAL_KEYS.map(async (key) => {
      const root = await loadOne(loader, key)
      completed += 1
      onProgress?.(completed, CRYSTAL_KEYS.length)
      return [key, root]
    }),
  )

  const failures = []
  results.forEach((result, index) => {
    const key = CRYSTAL_KEYS[index]
    if (result.status === 'fulfilled') {
      const [, root] = result.value
      models[key] = root
      system.add(root)
    } else {
      failures.push({ key, error: result.reason })
    }
  })

  if (!models.about || !models.center) {
    throw new Error('Required ABOUT crystal assets could not be loaded.')
  }

  return { system, models, failures }
}
