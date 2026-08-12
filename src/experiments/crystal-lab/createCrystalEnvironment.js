import {
  BackSide,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Scene,
  SphereGeometry,
} from 'three'

function addCard(scene, {
  color,
  intensity,
  position,
  rotation,
  scale,
}) {
  const card = new Mesh(
    new PlaneGeometry(scale[0], scale[1]),
    new MeshBasicMaterial({
      color: new Color(color).multiplyScalar(intensity),
      side: DoubleSide,
      toneMapped: false,
    }),
  )
  card.position.set(...position)
  card.rotation.set(...rotation)
  scene.add(card)
}

export function createCrystalEnvironment() {
  const scene = new Scene()
  const enclosure = new Mesh(
    new SphereGeometry(12, 32, 20),
    new MeshBasicMaterial({ color: '#03061a', side: BackSide }),
  )
  scene.add(enclosure)

  addCard(scene, {
    color: '#e8edff',
    intensity: 1.45,
    position: [-1.8, 4.9, 1.8],
    rotation: [Math.PI / 2, 0, -0.18],
    scale: [3.8, 0.34],
  })
  addCard(scene, {
    color: '#6474ff',
    intensity: 1.2,
    position: [-4.7, 0.4, 1.2],
    rotation: [0, Math.PI / 2, -0.25],
    scale: [2.8, 0.24],
  })
  addCard(scene, {
    color: '#ddd6ff',
    intensity: 1.15,
    position: [4.8, -1.4, -0.4],
    rotation: [0, -Math.PI / 2, 0.34],
    scale: [2.2, 0.12],
  })
  addCard(scene, {
    color: '#c9995b',
    intensity: 0.58,
    position: [0.8, -4.8, 1.7],
    rotation: [-Math.PI / 2, 0, 0.12],
    scale: [1.5, 0.08],
  })

  return scene
}
