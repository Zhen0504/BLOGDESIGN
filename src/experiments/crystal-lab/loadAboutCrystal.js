import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Box3, Group, Vector3 } from 'three'

import { CRYSTAL_ASSETS, CRYSTAL_NODE_NAMES } from './crystalConstants'
import {
  createGlassCoverMaterial,
  createInnerRingMaterial,
  createOuterGemMaterial,
} from './materials/createGemTransmissionMaterial'
import { createEtchedPanelMaterial } from './materials/createEtchedPanelMaterial'

function assetUrl(path) {
  return `${import.meta.env.BASE_URL}${path}`
}

function requireNode(scene, name) {
  const matches = []
  scene.traverse((object) => {
    if (object.name === name) matches.push(object)
  })
  if (matches.length !== 1) {
    throw new Error(`Expected one ${name} node, found ${matches.length}`)
  }
  return matches[0]
}

export async function loadAboutCrystal({ buffer, environment, quality }) {
  const gltf = await new GLTFLoader().loadAsync(assetUrl(CRYSTAL_ASSETS.model))
  const source = gltf.scene
  const nodes = {
    outerFrame: requireNode(source, CRYSTAL_NODE_NAMES.outerFrame),
    innerRing: requireNode(source, CRYSTAL_NODE_NAMES.innerRing),
    panel: requireNode(source, CRYSTAL_NODE_NAMES.panel),
    glassCover: requireNode(source, CRYSTAL_NODE_NAMES.glassCover),
  }

  nodes.outerFrame.material?.dispose()
  nodes.innerRing.material?.dispose()
  nodes.panel.material?.dispose()
  nodes.glassCover.material?.dispose()
  nodes.outerFrame.material = createOuterGemMaterial({ buffer, environment, quality })
  nodes.innerRing.material = createInnerRingMaterial({ environment })
  nodes.panel.material = await createEtchedPanelMaterial({
    iconUrl: assetUrl(CRYSTAL_ASSETS.icon),
    environment,
  })
  nodes.glassCover.material = createGlassCoverMaterial({ buffer, environment, quality })

  const root = new Group()
  root.name = 'AboutCrystalRoot'
  root.add(source)

  const bounds = new Box3().setFromObject(source)
  const size = bounds.getSize(new Vector3())
  const center = bounds.getCenter(new Vector3())
  source.position.sub(center)
  const targetSize = quality.tier === 'medium' ? 1.82 : 3.42
  const scale = targetSize / Math.max(size.y, size.x)
  source.scale.setScalar(scale)
  root.rotation.set(0, 0, -0.08)

  return { root, nodes, source }
}
