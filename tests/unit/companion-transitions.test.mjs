import assert from 'node:assert/strict'
import {PoseTransition,ExpressionTransition} from '../../src/components/blue/companion/transitions.js'
const pose=new PoseTransition()
let value=pose.update({turn:1,scaleY:.6},1/60)
assert.ok(value.turn>0&&value.turn<.2)
for(let i=0;i<90;i++)value=pose.update({turn:1,scaleY:.6},1/60)
const previous=value.turn
value=pose.update(null,1/60)
assert.ok(value.turn<previous&&value.turn>.7,'interruption settles instead of snapping')
const face=new ExpressionTransition()
let frame
for(let i=0;i<90;i++)frame=face.update('curious',1/60)
let last=frame.id,swaps=0
for(let i=0;i<30;i++){
 frame=face.update('curious',1/60)
 if(frame.id!==last){assert.ok(frame.openness<.15,'new eye shape is revealed from closed lids');swaps++;last=frame.id}
}
assert.equal(frame.id,'curious')
const held=face.update('happy',1/60)
assert.equal(held.id,'curious','rapid targets do not restart blinking')
const turn=new PoseTransition()
for(let i=0;i<=120;i++)turn.update({turn:i/120*Math.PI*2},1/60)
const before=turn.value.turn
turn.update(null,1/60)
assert.ok(turn.value.turn>=before,'full turn settles along shortest angle, never rewinds')
console.log('Pose easing, interruption, shortest rotations and blink-gated expression changes passed.')
