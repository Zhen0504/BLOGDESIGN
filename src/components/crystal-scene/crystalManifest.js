const asset = (name) => `${import.meta.env.BASE_URL}models/crystals/${name}.glb`

export const CRYSTAL_KEYS = Object.freeze([
  'about',
  'development',
  'research',
  'contact',
  'center',
])

export const CRYSTAL_MANIFEST = Object.freeze({
  about: { url: asset('about'), targetSize: 1.38 },
  development: { url: asset('development'), targetSize: 1.30 },
  research: { url: asset('research'), targetSize: 1.35 },
  contact: { url: asset('contact'), targetSize: 1.27 },
  center: { url: asset('center'), targetSize: 0.62 },
})

export const SECTION_FOCUS = Object.freeze({
  '00': null,
  '01': 'about',
  '02': 'development',
  '03': 'research',
  '04': 'contact',
})

export const WELCOME_ANCHORS = Object.freeze({
  about: { position: [1.51, 1.24, 0.08], rotation: [0.08, 0.10, -0.18], scale: 1 },
  development: { position: [3.77, 1.05, -0.04], rotation: [0.08, -0.11, 0.15], scale: 1 },
  research: { position: [1.77, -1.20, -0.12], rotation: [-0.09, 0.11, 0.13], scale: 1 },
  contact: { position: [3.66, -1.17, -0.14], rotation: [-0.08, -0.11, -0.12], scale: 1 },
  center: { position: [2.68, 0.00, 0.22], rotation: [0, 0, 0], scale: 1 },
})

export const FOCUS_POSITIONS = Object.freeze({
  about: [2.15, 0.02, 1.52],
  development: [-1.82, 0.04, 1.48],
  research: [2.10, 0.03, 1.50],
  contact: [-1.82, 0.02, 1.46],
})
