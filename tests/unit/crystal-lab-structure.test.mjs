import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const read = (file) => readFileSync(resolve(root, file), 'utf8')

const requiredFiles = [
  'src/experiments/crystal-lab/CrystalLabView.vue',
  'src/experiments/crystal-lab/createCrystalLab.js',
  'src/experiments/crystal-lab/createQualityProfile.js',
  'src/experiments/crystal-lab/crystalConstants.js',
  'src/experiments/crystal-lab/loadAboutCrystal.js',
  'src/experiments/crystal-lab/createInteractionController.js',
  'src/experiments/crystal-lab/createPostProcessing.js',
  'src/experiments/crystal-lab/createCosmicBackdrop.js',
  'src/experiments/crystal-lab/createCrystalEnvironment.js',
  'src/experiments/crystal-lab/materials/createGemTransmissionMaterial.js',
  'src/experiments/crystal-lab/materials/createEtchedPanelMaterial.js',
  'public/experiments/crystal/about-crystal-v3.glb',
  'public/experiments/crystal/about-user-sdf-v3.png',
  'tools/blender/generate_about_crystal_v3.py',
]

for (const file of requiredFiles) {
  assert.equal(existsSync(resolve(root, file)), true, `${file} should exist`)
}

const packageJson = JSON.parse(read('package.json'))
assert.equal(packageJson.dependencies.three, '0.185.1')
assert.equal(packageJson.dependencies['@pmndrs/vanilla'], '1.25.0')
assert.equal(packageJson.dependencies.postprocessing, '6.39.4')
assert.equal(
  packageJson.scripts['test:crystal'],
  'node tests/unit/crystal-lab-structure.test.mjs',
)

const router = read('src/router/index.js')
assert.match(router, /path:\s*['"]\/__crystal-lab['"]/)
assert.match(router, /import\(['"]\.\.\/experiments\/crystal-lab\/CrystalLabView\.vue['"]\)/)

const view = read('src/experiments/crystal-lab/CrystalLabView.vue')
assert.match(view, /createCrystalLab/)
assert.match(view, /onBeforeUnmount/)
assert.match(view, /crystal-lab__canvas/)
assert.match(view, /crystal-lab__fallback/)
assert.match(view, /dispose\(\)/)

const scene = read('src/experiments/crystal-lab/createCrystalLab.js')
assert.match(scene, /WebGLRenderer/)
assert.match(scene, /__CRYSTAL_LAB__/)
assert.match(scene, /dispose/)
assert.match(scene, /WebGLRenderTarget/)
assert.match(scene, /createCrystalEnvironment/)
assert.match(scene, /captureTransmission/)

const constants = read('src/experiments/crystal-lab/crystalConstants.js')
assert.match(constants, /CRY_about_outer_frame_LOD0/)
assert.match(constants, /CRY_about_inner_ring_LOD0/)
assert.match(constants, /CRY_about_panel_LOD0/)
assert.match(constants, /CRY_about_glass_cover_LOD0/)

const loader = read('src/experiments/crystal-lab/loadAboutCrystal.js')
assert.match(loader, /GLTFLoader/)
assert.match(loader, /createOuterGemMaterial/)
assert.match(loader, /createEtchedPanelMaterial/)

const gemMaterial = read(
  'src/experiments/crystal-lab/materials/createGemTransmissionMaterial.js',
)
assert.match(gemMaterial, /MeshTransmissionMaterial/)
assert.match(gemMaterial, /MeshPhysicalMaterial/)
assert.match(gemMaterial, /chromaticAberration/)
assert.match(gemMaterial, /createGlassCoverMaterial/)

const etchedMaterial = read(
  'src/experiments/crystal-lab/materials/createEtchedPanelMaterial.js',
)
assert.match(etchedMaterial, /bumpScale:\s*-0\.045/)
assert.match(etchedMaterial, /crystalEtchMask/)

const interaction = read('src/experiments/crystal-lab/createInteractionController.js')
assert.match(interaction, /prefers-reduced-motion|reducedMotion/)
assert.match(interaction, /pointermove/)
assert.match(interaction, /pointerleave/)

console.log('Crystal lab structure checks passed.')
