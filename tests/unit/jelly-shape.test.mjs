import assert from 'node:assert/strict'
import { jellyRestVertex } from '../../src/components/blue/jellyShape.js'
let min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity]
for(let i=0;i<=120;i++)for(let j=0;j<=120;j++){
  const a=i/120*Math.PI,b=j/120*Math.PI*2
  const p=jellyRestVertex(Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b))
  p.forEach((value,k)=>{assert.ok(Number.isFinite(value));min[k]=Math.min(min[k],value);max[k]=Math.max(max[k],value)})
}
const [width,height,depth]=max.map((v,k)=>v-min[k])
assert.ok(height/width>1.09 && height/width<1.2,'full, slightly taller egg silhouette')
assert.ok(depth/width>.9,'generous front-to-back volume')
assert.ok(min[1]>=-1.075 && min[1]<-1.06,'only the base is gently compressed')
for(let y=-1;y<1;y+=.025){
  assert.ok(jellyRestVertex(0,y+.025,0)[1]>jellyRestVertex(0,y,0)[1],'continuous vertical contour, no grooves')
}
console.log('Jelly rest pose is a full, slightly vertical egg with a soft grounded base.')
