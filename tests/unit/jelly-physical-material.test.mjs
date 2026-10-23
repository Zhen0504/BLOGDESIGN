import assert from 'node:assert/strict'
import { Material } from 'three'
import { createJellyMaterial } from '../../src/components/blue/jellyRenderer.js'
const material=createJellyMaterial()
assert.equal(material.type,'MeshPhysicalMaterial')
assert.equal(material.transmission,1)
assert.equal(material.opacity,1)
assert.equal(material.transparent,false)
assert.equal(material.metalness,0)
assert.equal(material.roughness,.08)
assert.equal(material.ior,1.4)
assert.ok(material.thickness>0)
assert.equal(material.onBeforeCompile,Material.prototype.onBeforeCompile,'stock physical transmission shader, no painted-light override')
material.dispose()
console.log('Jelly uses full-opacity physical transmission and the stock refraction shader.')
