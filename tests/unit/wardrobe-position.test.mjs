import assert from 'node:assert/strict'
import {clampPosition,toRatio,fromRatio,loadPositions,savePositions,POSITION_KEY} from '../../src/components/blue/companion/wardrobePosition.js'
const viewport={width:1440,height:1000},size={width:320,height:420}
assert.deepEqual(clampPosition({x:-100,y:3000},size,viewport),{x:12,y:568})
const point={x:300,y:250},ratio=toRatio(point,size,viewport)
assert.deepEqual(fromRatio(ratio,size,viewport),point)
const mobile={width:390,height:844},mobileSize={width:358,height:320}
const moved=fromRatio({x:1,y:1},mobileSize,mobile)
assert.ok(moved.x>=12&&moved.x+mobileSize.width<=mobile.width-12)
assert.ok(moved.y+mobileSize.height<=mobile.height-12)
assert.deepEqual(fromRatio({x:Infinity,y:0},size,viewport),null)
assert.deepEqual(clampPosition({x:100,y:200},{width:500,height:500},{width:200,height:200}),{x:12,y:12})
const memory=new Map(),storage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)}
assert.equal(savePositions({panel:ratio,trigger:{x:1,y:1}},storage),true)
assert.deepEqual(loadPositions(storage),{panel:ratio,trigger:{x:1,y:1}})
memory.set(POSITION_KEY,'broken');assert.deepEqual(loadPositions(storage),{panel:null,trigger:null})
const denied={getItem(){throw Error('denied')},setItem(){throw Error('denied')}}
assert.deepEqual(loadPositions(denied),{panel:null,trigger:null});assert.equal(savePositions({},denied),false)
assert.equal(savePositions({panel:null,trigger:null},storage),true)
assert.deepEqual(loadPositions(storage),{panel:null,trigger:null})
console.log('Floating wardrobe: boundary clamp, resize-safe ratios, invalid storage and position reset passed.')
