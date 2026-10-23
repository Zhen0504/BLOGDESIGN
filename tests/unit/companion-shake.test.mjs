import assert from 'node:assert/strict'
import {ShakeDizziness} from '../../src/components/blue/companion/shakeDizziness.js'

function simulate(detector,seconds,position){
  let dizzy=false
  for(let i=0;i<seconds*60;i++){
    const time=(i+1)/60
    detector.move(...position(time),240)
    dizzy=detector.update(1/60)
  }
  return dizzy
}
const shake=t=>[100+96*Math.sin(t*Math.PI*6),100]
for(const position of [t=>[100+t*30,100],t=>[100+t*900,100],t=>[100+3*Math.sin(t*Math.PI*6),100]]){
  const detector=new ShakeDizziness();detector.begin(100,100)
  assert.equal(simulate(detector,6,position),false,'slow drag, one-way speed and tiny jitter must not trigger')
}
const short=new ShakeDizziness();short.begin(100,100)
assert.equal(simulate(short,2,shake),false,'short shake must not trigger')
short.end();assert.equal(simulate(short,4,()=>[100,100]),false)
const sustained=new ShakeDizziness();sustained.begin(100,100)
assert.equal(simulate(sustained,5,shake),true,'sustained vigorous reversals trigger dizziness')
sustained.end()
assert.equal(simulate(sustained,3.5,()=>[100,100]),true,'dizziness survives release')
assert.equal(simulate(sustained,1,()=>[100,100]),false,'recovers after four seconds without vigorous shaking')
console.log('Shake dizziness: sustained reversals only, no ordinary drag trigger, timed recovery.')
