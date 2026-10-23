import assert from 'node:assert/strict'
import * as THREE from 'three'
import {accessoryBuilders} from '../../src/components/blue/companion/accessoryDesigns.js'

const stats={}
for(const [id,build] of Object.entries(accessoryBuilders)){
  const group=build(),materials=new Set(),geometries=new Set();let vertices=0,meshes=0
  group.traverse(object=>{
    if(!object.isMesh)return
    meshes++;vertices+=object.geometry.attributes.position.count
    materials.add(object.material);geometries.add(object.geometry)
    for(const attribute of ['position','normal'])assert.ok([...object.geometry.attributes[attribute].array].every(Number.isFinite),`${id} finite ${attribute}`)
    assert.equal(object.material.transparent,true)
    assert.equal(object.material.transmission,0,'accessories never fake the gel body or add another transmission pass')
    assert.ok(object.material.metalness<=.15,'no shiny gold/chrome finish')
  })
  stats[id]={vertices,meshes}
  if(id==='bow'){
    assert.equal(group.getObjectByName('bow-fold--1').geometry.userData.accessoryForm,'folded-ribbon')
    assert.equal(group.getObjectByName('bow-tail-1').geometry.userData.accessoryForm,'fishtail-ribbon')
    group.traverse(object=>{if(object.isMesh)assert.notEqual(object.geometry.type,'SphereGeometry','bow is folded cloth, not joined balloons')})
  }
  if(id==='scarf'){
    const wrap=group.getObjectByName('scarf-woven-wrap')
    assert.equal(wrap.geometry.userData.accessoryForm,'woven-wrap')
    const box=new THREE.Box3().setFromObject(group)
    assert.ok(box.min.z<-.7&&box.max.z>.7,'original scarf wraps all the way around')
    assert.ok(box.max.x-box.min.x>2.2,'preserves the original full-width silhouette')
    const tails=[0,1].map(i=>group.getObjectByName(`scarf-tail-${i}`))
    for(const tail of tails){
      assert.equal(tail.geometry.userData.accessoryForm,'soft-draped-scarf-tail','thin folded cloth, never capsule rods')
      assert.equal(tail.geometry.type,'BufferGeometry')
      assert.equal(tail.geometry.attributes.position.count,2*23*11,'two thin surfaces with bounded detail')
      const p=tail.geometry.attributes.position
      for(let n=0;n<23*11;n++){
        const front=new THREE.Vector3().fromBufferAttribute(p,n),back=new THREE.Vector3().fromBufferAttribute(p,n+23*11)
        assert.ok(Math.abs(front.distanceTo(back)-.009)<1e-5,'consistent thin fabric thickness')
      }
    }
    const tailBounds=tails.map(tail=>new THREE.Box3().setFromObject(tail))
    assert.ok(tailBounds[0].min.y<tailBounds[1].min.y-.08,'natural uneven lengths')
    group.traverse(object=>{if(object.isMesh){
      assert.ok(object.geometry.attributes.uv,'woven bump has valid UV coordinates')
      assert.ok(object.material.bumpMap?.isDataTexture)
      assert.ok(object.material.roughness>=.8)
      assert.equal(object.material.clearcoat,0)
      assert.ok(object.material.specularIntensity<.3)
    }})
  }
  if(id==='sprout')for(const side of [-1,1])assert.equal(group.getObjectByName(`sprout-pointed-leaf-${side}`).geometry.userData.accessoryForm,'cupped-pointed-leaf')
  if(id==='crown')assert.equal(group.getObjectByName('crown-rounded-porcelain').geometry.userData.accessoryForm,'rounded-circlet')
  if(id==='cap')assert.equal(group.getObjectByName('cap-curved-visor').geometry.userData.accessoryForm,'curved-cap-visor')
  if(id==='round')for(const side of [-1,1])assert.ok(group.getObjectByName(`glasses-fine-rim-${side}`).geometry.parameters.radius<.015,'fine frames')
  const textures=new Set([...materials].flatMap(mat=>Object.values(mat).filter(value=>value?.isTexture)))
  for(const resource of [...geometries,...materials,...textures])resource.dispose()
}
const maxVertices=Math.max(...['crown','beret','cap','sprout'].map(id=>stats[id].vertices))+Math.max(stats.round.vertices,stats.sunglasses.vertices)+Math.max(...['bow','scarf','star'].map(id=>stats[id].vertices))
const maxMeshes=Math.max(...['crown','beret','cap','sprout'].map(id=>stats[id].meshes))+Math.max(stats.round.meshes,stats.sunglasses.meshes)+Math.max(...['bow','scarf','star'].map(id=>stats[id].meshes))
assert.ok(maxVertices<12000&&maxMeshes<=30,'bounded detail budget, no unbounded subdivision or layered transmissions')
console.log('Refined accessories: folded sheets, woven wrap, pointed leaves, rounded porcelain, fine frames and bounded geometry passed.',{maxVertices,maxMeshes})
