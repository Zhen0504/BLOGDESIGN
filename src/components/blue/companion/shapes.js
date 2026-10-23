const pow=(v,p)=>Math.sign(v)*Math.abs(v)**p
export const characterShape=Object.freeze({id:'cloud',width:1.12,height:1.16,depth:1.05,power:.90,base:-1.02})
function heightAt(y,c){return c.base+Math.log1p(Math.exp((y*c.height-c.base)*22))/22}
export function blobVertex(x,y,z,c){
  const upper=1+.025*y
  const leftCheek=Math.exp(-((x+.70)**2/.12+(y+.15)**2/.24))
  const rightCheek=Math.exp(-((x-.72)**2/.13+(y+.28)**2/.19))
  const swell=.075*leftCheek+.035*rightCheek
  const lean=.016*y
  return [pow(x,c.power)*c.width*(upper+swell)+lean,heightAt(y,c),pow(z,c.power)*c.depth*(1+.018*x)]
}
// Analytic front projection keeps thin facial meshes flush with the soft body.
// No raycasting through thousands of triangles for every face vertex.
export function frontPoint(x,y,c){
  let lo=-1,hi=1
  for(let i=0;i<24;i++){const mid=(lo+hi)/2;if(heightAt(mid,c)<y)lo=mid;else hi=mid}
  const ny=(lo+hi)/2,r=Math.sqrt(Math.max(0,1-ny*ny))
  lo=-r;hi=r
  for(let i=0;i<24;i++){const nx=(lo+hi)/2;if(blobVertex(nx,ny,0,c)[0]<x)lo=nx;else hi=nx}
  const nx=(lo+hi)/2
  return blobVertex(nx,ny,Math.sqrt(Math.max(0,1-nx*nx-ny*ny)),c)
}
