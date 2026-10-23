import assert from 'node:assert/strict'
import {idleActions,idlePose,chooseIdleAction,chooseReadingIdleAction} from '../../src/components/blue/companion/idleActions.js'
import {deformPoint} from '../../src/components/blue/companion/motion.js'
import {CompanionSpace,companionLayout} from '../../src/components/blue/companion/space.js'
assert.equal(idleActions.length,8)
for(const action of idleActions){for(const p of [0,.25,.5,.75,1])assert.ok(Object.values(idlePose(action,p)).filter(x=>typeof x==='number').every(Number.isFinite))}
assert.ok(idlePose('peek',.5).turn<-.8)
assert.ok(idlePose('lookBack',.6).upperTwist< -1.5)
assert.ok(idlePose('sideLie',.5).turn>.8)
assert.ok(idlePose('pounce',.5).depth>.5)
assert.ok(idlePose('spin',1).turn>6)
for(const home of [true,false]){
 for(let i=0;i<8;i++){
  const random=()=>i/8+.01
  const space=new CompanionSpace(companionLayout({width:1440,height:1000,home,left:true}),random)
  for(let t=0;t<(home?302:1442);t++)space.tick(1/60)
  assert.equal(space.travel.action,(home?chooseIdleAction:chooseReadingIdleAction)(random))
  space.interact();assert.equal(space.travel,null)
 }
}
const pose={grab:{x:0,y:0,z:1},pull:{x:0,y:0},tail:{x:0,y:0},landing:0,breathe:0,feet:true,walkStep:1}
const foot=deformPoint(-.47,-1,.5,pose),middle=deformPoint(0,-1,.5,pose)
assert.ok(foot[1]<middle[1]-.12,'two local soft feet, not a whole-body scale')
let rare=0;for(let i=0;i<100;i++)if(['spin','melt'].includes(chooseIdleAction(()=>i/100)))rare++
assert.equal(rare,10,'only ten percent full spins or flattening')
console.log('Spatial gestures, delayed upper-body glance, rare spins, interruption and soft feet passed.')
const lively=new CompanionSpace(companionLayout({width:1440,height:1000,home:true}),()=>.4)
let active=0,previous='',changes=0
for(let i=0;i<1500;i++){const s=lively.tick(1/60);if(s.action)active++;if(s.action&&s.action!==previous){changes++;previous=s.action}}
assert.ok(active>120&&active<650,'home mostly observes, with occasional gestures')
assert.ok(changes>=1&&changes<=3,'no rapid action carousel')
const quiet=new CompanionSpace(companionLayout({width:1440,height:1000,home:false,left:true}))
for(let i=0;i<840;i++)quiet.tick(1/60)
assert.equal(quiet.travel,null,'reading stays quiet beyond fifteen seconds')
for(let i=0;i<500;i++)quiet.tick(1/60)
assert.equal(quiet.travel,null,'reading waits at least twenty-four seconds')
