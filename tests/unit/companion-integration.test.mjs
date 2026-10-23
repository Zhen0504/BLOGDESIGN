import assert from 'node:assert/strict'
import {readFileSync,existsSync,readdirSync} from 'node:fs'
const dir=new URL('../../src/components/blue/companion/',import.meta.url)
for(const file of readdirSync(dir)){
  const source=readFileSync(new URL(file,dir),'utf8')
  assert.doesNotMatch(source,/from ['"][^'"]*experiments\//,'production must not depend on a preview directory')
}
const component=readFileSync(new URL('../../src/components/blue/JellyCompanion.vue',import.meta.url),'utf8')
assert.match(component,/createCompanion\(host.value/)
assert.match(component,/onBeforeUnmount\(\(\)=>jelly\?\.dispose\(\)\)/)
assert.doesNotMatch(component,/STATIC MATERIAL PREVIEW|createJellyRenderer/)
const runtime=readFileSync(new URL('createCompanion.js',dir),'utf8')
assert.doesNotMatch(runtime,/document.querySelector/,'runtime is scoped to its supplied host')
assert.match(runtime,/cancelAnimationFrame\(frame\)/)
assert.match(runtime,/decor.dispose\(\)/)
assert.match(runtime,/removeEventListener\('resize',resize\)/)
const renderer=readFileSync(new URL('renderer.js',dir),'utf8')
assert.match(renderer,/renderer.getRenderTarget\(\)!==null/,'white backing only renders into physical transmission pass')
assert.match(renderer,/renderer.forceContextLoss\(\)/)
assert.equal(existsSync(new URL('../../experiments/soft-blob-playground/index.html',import.meta.url)),false)
console.log('Companion integrated without preview dependencies; teardown and HTML composition checks passed.')
