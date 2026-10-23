import assert from 'node:assert/strict'
import { PetMotion,deformPoint } from '../../src/components/blue/companion/motion.js'
const pointer={x:0,y:0},grab={x:0,y:.1,z:1}
const advance=(motion,frames=60)=>{let pose;for(let i=0;i<frames;i++)pose=motion.tick(1/60);return pose}
const willing=new PetMotion(()=>.8);willing.mode='willing'
assert.ok(willing.startDrag(pointer,grab));willing.moveDrag({x:2,y:.3})
const moving=advance(willing,18)
assert.equal(moving.state,'willing');assert.ok(willing.x>0);assert.ok(moving.tail.x<0,'tail trails velocity')
const before=willing.x;willing.endDrag();advance(willing,20)
assert.ok(willing.x>before,'release preserves inertia');assert.ok(willing.x<=willing.bounds.x)
advance(willing,200);assert.ok(Math.hypot(willing.vx,willing.vy)<.01)

const refusing=new PetMotion(()=>.2);refusing.mode='resisting';refusing.startDrag(pointer,grab);refusing.moveDrag({x:200,y:30})
const stretched=advance(refusing,45)
assert.equal(stretched.expression,'struggle');assert.ok(Math.hypot(refusing.x,refusing.y)<.1,'anchor stays local')
assert.ok(Math.hypot(stretched.pull.x,stretched.pull.y)<=1.4,'bounded elastic pull')
const front=deformPoint(0,.1,1,stretched),back=deformPoint(0,.1,-1,stretched),foot=deformPoint(0,-1.02,0,stretched)
assert.ok(front[0]-back[0]>.6,'grabbed skin moves more than the back')
assert.ok(Math.abs(foot[0])<.01,'base stays anchored')
refusing.endDrag();advance(refusing,150)
assert.ok(Math.hypot(refusing.pull.x,refusing.pull.y)<.001,'release springs back')
assert.equal(refusing.x,0);assert.equal(refusing.y,0)

const flip=new PetMotion(()=>.5)
assert.ok(flip.flip());assert.equal(flip.flip(),false,'cannot stack flips')
const mid=advance(flip,35)
assert.ok(mid.rotationX< -2&&mid.rotationX> -5);assert.ok(mid.y>.8,'full 3D rotation with a jump')
const landed=advance(flip,120)
assert.equal(landed.rotationX,0);assert.equal(flip.flipTime,null);assert.equal(flip.flips,1)
assert.ok(flip.blinkCount>0)
advance(flip,2400);assert.ok(flip.expressionChanges>=3);assert.ok(flip.blinkCount>=3)
const slow=new PetMotion(()=>0)
advance(slow,470);assert.equal(slow.expressionChanges,0,'idle face holds for at least eight seconds')
advance(slow,30);assert.equal(slow.expressionChanges,1)
const reduced=new PetMotion(()=>.5);const reducedPose=reduced.tick(1/60,true)
assert.equal(reducedPose.breathe,0);assert.equal(reducedPose.y,.14)
console.log('Motion checks passed: idle/blink/random expressions, bounded drag modes, inertia, skin pull, return and one full backflip.')
