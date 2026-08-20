const asset = (name) => `${import.meta.env.BASE_URL}models/crystals/${name}.glb`

export const CRYSTAL_KEYS = Object.freeze([
  'about',
  'development',
  'research',
  'contact',
  'center',
])

export const CRYSTAL_MANIFEST = Object.freeze({
  about: { url: asset('about'), targetSize: 1.48 },
  development: { url: asset('development'), targetSize: 1.40 },
  research: { url: asset('research'), targetSize: 1.45 },
  contact: { url: asset('contact'), targetSize: 1.37 },
  center: { url: asset('center'), targetSize: 0.68 },
})

export const SECTION_FOCUS = Object.freeze({
  '00': null,
  '01': 'about',
  '02': 'development',
  '03': 'research',
  '04': 'contact',
})

export const WELCOME_ANCHORS = Object.freeze({
  about: { position: [1.52, 1.48, 0.08], rotation: [0.08, 0.10, -0.18], scale: 1 },
  development: { position: [4.60, 1.25, -0.04], rotation: [0.08, -0.11, 0.15], scale: 1 },
  research: { position: [1.70, -1.48, -0.12], rotation: [-0.09, 0.11, 0.13], scale: 1 },
  contact: { position: [4.50, -1.33, -0.14], rotation: [-0.08, -0.11, -0.12], scale: 1 },
  center: { position: [3.12, 0.00, 0.22], rotation: [0, 0, 0], scale: 1 },
})

export const FOCUS_POSITIONS = Object.freeze({
  about: [2.48, 0.02, 1.46],
  development: [-1.52, 0.04, 1.38],
  research: [2.42, 0.03, 1.44],
  contact: [-1.54, 0.02, 1.36],
})
