import * as THREE from 'three'
import {deformPoint} from './motion.js'
import {normalizeOutfit} from './wardrobeState.js'
import {accessoryBuilders as builders} from './accessoryDesigns.js'


// Bake the authored local transforms once. The small accessory meshes can then
// share the exact skin-deformation field, including drag, landing and head turns.
function bake(source){
  const group=new THREE.Group();source.updateMatrixWorld(true)
  source.traverse(object=>{
    if(!object.isMesh)return
    object.geometry.applyMatrix4(object.matrixWorld)
    const flat=new THREE.Mesh(object.geometry,object.material);flat.name=object.name;flat.renderOrder=object.renderOrder||22;flat.frustumCulled=false
    flat.userData.base=new Float32Array(flat.geometry.attributes.position.array);group.add(flat)
  })
  return group
}
function disposeGroup(group){
  const resources=new Set();group.traverse(object=>{
    if(object.geometry)resources.add(object.geometry)
    if(object.material){
      resources.add(object.material)
      for(const value of Object.values(object.material))if(value?.isTexture)resources.add(value)
    }
  })
  for(const resource of resources)resource.dispose()
  group.clear()
}
export function createWardrobe(character,initial){
  const root=new THREE.Group();root.name='companion-accessories';character.add(root)
  let outfit={head:'none',face:'none',chest:'none'}
  function set(value){
    const next=normalizeOutfit(value)
    if(next.head===outfit.head&&next.face===outfit.face&&next.chest===outfit.chest)return false
    disposeGroup(root);outfit=next
    for(const [slot,id] of Object.entries(outfit))if(builders[id]){const group=bake(builders[id]());group.name=`${slot}:${id}`;root.add(group)}
    return true
  }
  set(initial)
  return {root,get outfit(){return {...outfit}},set,
    update(pose){root.traverse(object=>{
      if(!object.isMesh)return
      const positions=object.geometry.attributes.position,base=object.userData.base
      for(let i=0;i<positions.count;i++)positions.setXYZ(i,...deformPoint(base[i*3],base[i*3+1],base[i*3+2],pose))
      positions.needsUpdate=true;object.geometry.computeVertexNormals()
    })},
    dispose(){disposeGroup(root);root.removeFromParent()},
  }
}
