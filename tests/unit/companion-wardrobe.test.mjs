import assert from 'node:assert/strict'
import * as THREE from 'three'
import {headwear,eyewear,chestwear,normalizeOutfit,loadOutfit,saveOutfit,WARDROBE_KEY} from '../../src/components/blue/companion/wardrobeState.js'
import {createWardrobe} from '../../src/components/blue/companion/wardrobe.js'
import {PetMotion} from '../../src/components/blue/companion/motion.js'
import {CompanionResponses} from '../../src/components/blue/companion/responses.js'

assert.equal(headwear.length,5);assert.equal(eyewear.length,3);assert.equal(chestwear.length,4)
assert.deepEqual(normalizeOutfit({head:'round',face:'crown',chest:'cap'}),{head:'none',face:'none',chest:'none'})
assert.deepEqual(normalizeOutfit(null),{head:'none',face:'none',chest:'none'})
assert.deepEqual(normalizeOutfit({head:'bow',face:'round'}),{head:'none',face:'round',chest:'bow'},'old head bow migrates to chest')
assert.deepEqual(normalizeOutfit({head:'bow',chest:'scarf'}),{head:'none',face:'none',chest:'scarf'},'explicit chest choice wins')
const memory=new Map(),storage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)}
assert.equal(saveOutfit({head:'crown',face:'round'},storage),true)
assert.deepEqual(loadOutfit(storage),{head:'crown',face:'round',chest:'none'})
memory.set(WARDROBE_KEY,'not-json');assert.deepEqual(loadOutfit(storage),{head:'none',face:'none',chest:'none'})
const denied={getItem(){throw Error('denied')},setItem(){throw Error('quota')}}
assert.deepEqual(loadOutfit(denied),{head:'none',face:'none',chest:'none'})
assert.equal(saveOutfit({head:'bow'},denied),false)

const character=new THREE.Group(),wardrobe=createWardrobe(character,{head:'crown',face:'round'})
assert.equal(wardrobe.root.parent,character,'all accessories inherit the real character transform')
assert.equal(wardrobe.root.children.length,2)
const motion=new PetMotion(()=>.8),pose=motion.tick(1/60)
for(const head of headwear)for(const face of eyewear)for(const chest of chestwear){
  wardrobe.set({head:head.id,face:face.id,chest:chest.id})
  wardrobe.update({...pose,pull:{x:.8,y:.3},idle:{scaleX:1.1,scaleY:.85,scaleZ:1,turn:0,upperTwist:.3,lean:.1}})
  wardrobe.root.traverse(object=>{
    if(!object.isMesh)return
    assert.equal(object.material.transparent,true,'avoid sampling accessories into gel transmission')
    assert.ok(object.renderOrder>=20)
    assert.ok([...object.geometry.attributes.position.array].every(Number.isFinite))
    assert.equal(object.userData.base.length,object.geometry.attributes.position.array.length)
  })
}
wardrobe.set({head:'cap',face:'round',chest:'bow'})
assert.equal(wardrobe.root.children.length,3,'all three slots coexist')
const bowBounds=new THREE.Box3().setFromObject(wardrobe.root.getObjectByName('chest:bow'))
assert.ok(bowBounds.max.y<0&&bowBounds.min.z>.8,'bow sits on chest, not head')
wardrobe.set({head:'beret',face:'sunglasses'})
let oldGeometry;wardrobe.root.traverse(object=>{if(object.isMesh&&!oldGeometry)oldGeometry=object.geometry})
let disposed=false;oldGeometry.addEventListener('dispose',()=>{disposed=true})
assert.equal(wardrobe.set({head:'beret',face:'sunglasses'}),false,'same choice avoids rebuilding')
assert.equal(disposed,false)
wardrobe.set({head:'none',face:'none'});assert.equal(disposed,true,'switching disposes replaced resources')
assert.equal(wardrobe.root.children.length,0)
wardrobe.set({chest:'scarf'})
const bump=wardrobe.root.getObjectByName('scarf-woven-wrap').material.bumpMap
let textureDisposals=0;bump.addEventListener('dispose',()=>textureDisposals++)
wardrobe.set({chest:'none'})
assert.equal(textureDisposals,1,'shared woven texture disposed exactly once when removed')
wardrobe.dispose();assert.equal(character.children.length,0)
const responses=new CompanionResponses();responses.tap(0,-1,'dress')
assert.equal(responses.update(.7).phase,'dress-curious')
assert.ok(responses.update(.7).pose.turn<-.5)
console.log('Wardrobe: three independent slots, legacy bow migration, 60 combinations, shared deformation, chest placement and cleanup passed.')
