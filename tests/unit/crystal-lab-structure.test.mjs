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

console.log('Crystal lab structure checks passed.')
