import assert from 'node:assert/strict'
import { waterfallPose, captureParticlePoints } from '../../src/components/blue/textWaterfall.js'
const glyph={x:218,y:367,char:'圳'}
for(let index=0;index<100;index++) {
  assert.deepEqual(waterfallPose(glyph,index,0,false),{x:218,y:367,alpha:1,p:0})
  let previousLeave=367,previousEnter=Infinity
  for(let step=0;step<=20;step++) {
    const leave=waterfallPose(glyph,index,step/20,false)
    const enter=waterfallPose(glyph,index,step/20,true)
    assert.equal(leave.x,glyph.x)
    assert.equal(enter.x,glyph.x)
    assert.ok(leave.y<=previousLeave)
    assert.ok(enter.y<=previousEnter && enter.y>=glyph.y)
    previousLeave=leave.y;previousEnter=enter.y
  }
  assert.equal(waterfallPose(glyph,index,1,true).y,glyph.y)
  assert.equal(waterfallPose(glyph,index,1,true).alpha,1)
  assert.equal(waterfallPose(glyph,index,1,false).alpha,0)
}
console.log('Waterfall preserves each glyph column, exits upward and enters at its actual position.')
const livePoints=[{x:12,y:18,size:1.7,color:'#182444'}]
const element={getBoundingClientRect:()=>({left:100,top:200,bottom:260}),captureParticlePoints:()=>livePoints}
const root={getBoundingClientRect:()=>({top:100,bottom:800}),querySelectorAll:()=>[element]}
assert.deepEqual(captureParticlePoints(root),[{x:112,y:218,size:1.7,color:'#182444'}])
assert.deepEqual(livePoints,[{x:12,y:18,size:1.7,color:'#182444'}])
element.getBoundingClientRect=()=>({left:100,top:900,bottom:960})
assert.deepEqual(captureParticlePoints(root),[])
console.log('Particle transitions copy live points in viewport coordinates without font conversion.')
