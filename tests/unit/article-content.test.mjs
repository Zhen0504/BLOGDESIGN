import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')
const parser = await import(pathToFileURL(resolve(root, 'src/data/articleParser.js')).href)
const portalState = await import(pathToFileURL(resolve(
  root,
  'src/components/crystal-scene/portalTransitionState.js',
)).href)

const source = `---
title: 一篇开发文章
date: 2026-08-28
summary: 用于验证文章元数据。
tags:
  - Vue
  - Three.js
cover: /images/example.png
---

## 正文

内容。`

const development = parser.parseArticleSource('/content/development/first-entry.md', source)
assert.ok(development)
assert.equal(development.slug, 'first-entry')
assert.equal(development.category, 'development')
assert.equal(development.date, '2026-08-28')
assert.deepEqual(development.tags, ['Vue', 'Three.js'])
assert.equal(development.href, '/development/articles/first-entry')
assert.match(development.content, /## 正文/)

const research = parser.parseArticleSource('/content/research/first-paper.md', source)
assert.equal(research.category, 'research')
assert.equal(research.categoryLabel, 'RESEARCH')

assert.equal(parser.parseArticleSource('/content/development/missing.md', '# no metadata'), null)
assert.equal(parser.parseArticleSource(
  '/content/development/bad-date.md',
  source.replace('2026-08-28', '2026-13-99'),
), null)

assert.equal(portalState.consumePendingCrystalReturn('development'), false)
portalState.setPendingCrystalReturn('development')
assert.equal(portalState.consumePendingCrystalReturn('research'), false)
assert.equal(portalState.consumePendingCrystalReturn('development'), true)
assert.equal(portalState.consumePendingCrystalReturn('development'), false)
portalState.setPendingCrystalReturn('invalid')
assert.equal(portalState.consumePendingCrystalReturn('invalid'), false)

console.log('Article content checks passed.')


for (const [before, after] of [
  ['title: 一篇开发文章', 'title: "   "'],
  ['title: 一篇开发文章', 'title: 123'],
  ['summary: 用于验证文章元数据。', 'summary: ""'],
  ['2026-08-28', '2026-02-29'],
  ['2026-08-28', '2026-04-31'],
  ['2026-08-28', '08/28/2026'],
  ['  - Vue', '  - 123'],
  ['  - Vue', '  - " "'],
  ['  - Vue', '  - {name: Vue}'],
  [`tags:
  - Vue
  - Three.js`, 'tags: Vue'],
  [`tags:
  - Vue
  - Three.js`, ''],
  ['cover: /images/example.png', 'cover: 123'],
  ['cover: /images/example.png', 'cover: javascript:alert(1)'],
  ['cover: /images/example.png', 'cover: //example.com/image.png'],
]) {
  assert.equal(parser.parseArticleSource('/content/development/check.md', source.replace(before, after)), null, after)
}
assert.ok(parser.parseArticleSource('/content/development/leap.md', source.replace('2026-08-28', '2024-02-29')))
assert.equal(parser.parseArticleSource('/content/unknown/test.md', source), null)
assert.equal(parser.parseArticleSource('/content/development/test.md', `---
- title
---
Body`), null)
assert.equal(parser.parseArticleSource('/content/development/test.md', source.replace('title: 一篇开发文章', `title: one
title: two`)), null)
assert.deepEqual(parser.parseArticleSource('/content/development/test.md', source.replace('  - Three.js', '  - Vue')).tags, ['Vue'])
assert.equal(development.cover, '/images/example.png')
console.log('Strict metadata checks passed.')

const { createServer } = await import('vite')
const { PerspectiveCamera, Object3D } = await import('three')
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
try {
  const { createSectionTransitionController } = await server.ssrLoadModule('/src/components/crystal-scene/createSectionTransitionController.js')
  function controller(quality = {}) {
    const model = new Object3D()
    model.userData = {
      restPosition: model.position.clone(), restRotation: model.rotation.clone(), restScale: 1, opacity: 1,
      materials: { outer: {}, inner: {}, icon: {}, star: {}, core: {}, edge: { uniforms: { uOpacity: { value: 1 } } } },
    }
    const progress = []
    const completed = []
    const api = createSectionTransitionController({
      camera: new PerspectiveCamera(), models: { development: model },
      depthOfField: { bokehScale: 0, cocMaterial: { focusRange: 1 } },
      quality: { webgl2: true, depthOfField: true, ...quality },
      onProgress: (_id, kind, value) => progress.push({ kind, value }),
      onComplete: (_id, kind) => completed.push(kind),
    })
    api.setSection('02', true)
    return { api, model, progress, completed }
  }
  for (const quality of [{ reducedMotion: true }, { compact: true }, { webgl2: false }]) {
    const { api, model } = controller(quality)
    const position = model.userData.restPosition.clone()
    assert.equal(api.enterPortal('02'), false)
    assert.equal(api.exitPortal('02'), false)
    assert.deepEqual(model.userData.restPosition, position)
  }
  const { api, progress, completed } = controller()
  assert.equal(api.enterPortal('02'), true)
  for (let i = 0; i < 20; i++) api.update(0.05)
  assert.ok(progress.at(-1).value < 0.72)
  assert.equal(completed.includes('portal-enter'), false)
  for (let i = 0; i < 12; i++) api.update(0.05)
  assert.equal(completed.at(-1), 'portal-enter')
  assert.equal(api.exitPortal('02'), true)
  api.update(1.58)
  assert.equal(completed.at(-1), 'portal-exit')
  assert.equal(api.enterPortal('03'), false)
  console.log('Portal progress and simplified-path checks passed.')
} finally {
  await server.close()
}
