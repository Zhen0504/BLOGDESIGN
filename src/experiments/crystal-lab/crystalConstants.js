export const CRYSTAL_NODE_NAMES = Object.freeze({
  outerFrame: 'CRY_about_outer_frame_LOD0',
  innerRing: 'CRY_about_inner_ring_LOD0',
  panel: 'CRY_about_panel_LOD0',
  glassCover: 'CRY_about_glass_cover_LOD0',
})

export const CRYSTAL_ASSETS = Object.freeze({
  model: 'experiments/crystal/about-crystal-v3.glb',
  icon: 'experiments/crystal/about-user-sdf-v3.png',
})

export const CRYSTAL_VIEWS = Object.freeze({
  front: {
    rotation: [0, 0, -0.08],
    camera: [0, 0, 7.2],
  },
  'three-quarter': {
    rotation: [-0.16, 0.38, -0.08],
    camera: [0, 0, 7.2],
  },
})

export const POINTER_LIMITS = Object.freeze({
  yaw: 8 * Math.PI / 180,
  pitch: 6 * Math.PI / 180,
  translation: 0.06,
})
