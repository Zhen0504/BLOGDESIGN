import * as THREE from 'three'
import {skin,material,add,line,roundedBox,sheet,softenedShape,compact} from './accessorySurfaces.js'

const palette={pearl:0xe7e4ef,champagne:0xd8c9aa,lavender:0xc5b4d9,ink:0x78839e,sage:0xa6c7b0}
const sample=(fn,count=24)=>Array.from({length:count+1},(_,i)=>new THREE.Vector3(...fn(i/count)))

function crown(){
  const group=new THREE.Group(),pearl=material(palette.pearl,{roughness:.28,sheen:.12,clearcoat:.28}),trim=material(palette.champagne,{roughness:.32,metalness:.13,sheen:.1}),gem=material(0xb2a4d0,{roughness:.24,clearcoat:.35})
  const radius=.325,height=a=>.105+.16*(.5+.5*Math.cos(5*a))**.85
  add(group,'crown-rounded-porcelain',sheet((u,v)=>{const a=u*Math.PI*2,r=radius+.007*Math.sin(Math.PI*v);return [Math.cos(a)*r,v*height(a),Math.sin(a)*r]},{u:80,v:5,thickness:.024,facing:null,flip:true,closedU:true,form:'rounded-circlet'}),pearl)
  line(group,'crown-base-inlay',sample(t=>{const a=t*Math.PI*2;return [Math.cos(a)*(radius+.014),.025,Math.sin(a)*(radius+.014)]},64).slice(0,-1),.008,trim,{closed:true})
  line(group,'crown-rounded-rim',sample(t=>{const a=t*Math.PI*2;return [Math.cos(a)*radius,height(a),Math.sin(a)*radius]},80).slice(0,-1),.007,trim,{closed:true})
  add(group,'crown-cabochon',new THREE.SphereGeometry(1,20,12),gem,[0,.10,radius+.018],[.042,.057,.019])
  group.position.set(-.07,1.085,.015);group.rotation.z=.09;return group
}
function bow(){
  const group=new THREE.Group(),satin=material(0xc4afd7,{roughness:.38,sheen:.85}),edge=material(0xd8c8e5,{roughness:.43,sheen:.7})
  for(const side of [-1,1]){
    const fold=(u,v)=>{
      const across=v*2-1,width=.038+.09*Math.sin(u*Math.PI/2),pleat=.010*Math.cos(across*Math.PI*2)*Math.sin(Math.PI*u)
      return [side*(.045+.27*u+.022*u*u*(1-across*across)),across*width+.018*Math.sin(Math.PI*u),.012+.038*Math.sin(Math.PI*u)*(1-.5*across*across)+pleat]
    }
    add(group,`bow-fold-${side}`,sheet(fold,{u:20,v:12,thickness:.008,form:'folded-ribbon'}),satin)
    line(group,`bow-fold-hem-${side}`,sample(t=>fold(1,t),20),.003,edge,{segments:20,sides:5})
    const tail=(u,v)=>{
      const across=v*2-1
      return [side*(.067+.045*u)+across*(.045+.006*u),-.055-.22*u+.038*(1-Math.abs(across))*u**8,.006+.018*Math.sin(Math.PI*u)+.008*across*across]
    }
    add(group,`bow-tail-${side}`,sheet(tail,{u:14,v:8,thickness:.007,form:'fishtail-ribbon'}),satin)
  }
  const knot=add(group,'bow-wrapped-knot',roundedBox(.093,.157,.088,.022),edge,[0,.004,.025]);knot.rotation.z=-.06
  group.position.copy(skin(0,-.38,.067));group.rotation.z=-.035;return group
}
function beret(){
  const group=new THREE.Group(),fabric=material(0xada3c3,{roughness:.58,sheen:.65}),rim=material(0x958aa9,{roughness:.6}),stitch=material(0xc2b9d3,{roughness:.65})
  const geometry=new THREE.SphereGeometry(1,36,20),p=geometry.attributes.position
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),fold=.008*Math.sin(a*6+.4)*(1-y*y)
    p.setXYZ(i,x*(.50+.015*y)+.022*y,.075+y*.17+fold,z*.42*(1+.025*Math.cos(a*2)))
  }
  geometry.computeVertexNormals();add(group,'beret-soft-crown',geometry,fabric)
  const band=add(group,'beret-bound-edge',new THREE.TorusGeometry(.34,.017,8,56),rim,[0,-.032,0],[1,1,.91]);band.rotation.x=Math.PI/2
  line(group,'beret-fine-seam',sample(t=>{const a=t*Math.PI*2;return [.493*Math.cos(a),.062+.004*Math.sin(a*6+.4),.419*Math.sin(a)]},64).slice(0,-1),.0025,stitch,{closed:true,sides:5})
  line(group,'beret-folded-stem',[new THREE.Vector3(.025,.24,0),new THREE.Vector3(.028,.275,.003),new THREE.Vector3(.008,.29,.005)],.012,rim,{segments:12,sides:6})
  group.position.set(-.07,1.075,0);group.rotation.z=.17;return group
}
function cap(){
  const group=new THREE.Group(),fabric=material(0x9aaec7,{roughness:.55,sheen:.55}),visor=material(0x839ab8,{roughness:.5}),underside=material(0x7588a4,{roughness:.65}),stitch=material(0xbac7d9,{roughness:.65})
  const geometry=new THREE.SphereGeometry(1,36,18,0,Math.PI*2,0,Math.PI/2),p=geometry.attributes.position
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);p.setXYZ(i,x*.46,y*.33,z*.405)}
  geometry.computeVertexNormals();add(group,'cap-panel-crown',geometry,fabric)
  const bill=(u,v)=>{const a=(u-.5)*Math.PI;return [Math.sin(a)*(.437+.035*v),-.01-.050*v*v+.014*Math.sin(a)**2,Math.cos(a)*(.393+.28*v)]}
  add(group,'cap-curved-visor',sheet(bill,{u:32,v:7,thickness:.014,facing:[0,1,0],form:'curved-cap-visor'}),visor)
  const bottom=add(group,'cap-visor-underlay',sheet((u,v)=>{const [x,y,z]=bill(u,v);return [x,y-.01,z]},{u:32,v:6,thickness:.004,facing:[0,-1,0]}),underside)
  bottom.renderOrder=22
  line(group,'cap-visor-stitch',sample(t=>{const [x,y,z]=bill(t,.87);return [x,y+.009,z]},32),.0024,stitch,{segments:32,sides:5})
  for(let panel=0;panel<6;panel++){
    const a=panel*Math.PI/3
    line(group,`cap-panel-seam-${panel}`,sample(t=>{const phi=.07+t*(Math.PI/2-.08);return [Math.cos(a)*Math.sin(phi)*.463,Math.cos(phi)*.333,Math.sin(a)*Math.sin(phi)*.408]},20),.0025,stitch,{segments:20,sides:5})
  }
  add(group,'cap-covered-button',new THREE.SphereGeometry(.021,14,8),fabric,[0,.334,0],[1,.55,1])
  group.position.set(-.035,1.085,.015);group.rotation.z=.09;return group
}
function sprout(){
  const group=new THREE.Group(),stem=material(0x87a894,{roughness:.55}),leaf=material(palette.sage,{roughness:.44,sheen:.5}),vein=material(0x8aab94,{roughness:.6})
  line(group,'sprout-curved-stem',[new THREE.Vector3(0,0,0),new THREE.Vector3(-.012,.17,0),new THREE.Vector3(.025,.32,.01)],.012,stem,{segments:20,sides:7})
  for(const side of [-1,1]){
    const length=side<0?.285:.325,start=side<0?.18:.29
    const blade=(u,v)=>{
      const across=v*2-1,width=Math.sin(Math.PI*u)**.85*.080
      return [side*(.006+length*u)-side*.48*width*across,start+.15*u+.045*Math.sin(Math.PI*u)+.87*width*across,.015+.058*Math.sin(Math.PI*u)*(1-across*across)-.012*u*u]
    }
    add(group,`sprout-pointed-leaf-${side}`,sheet(blade,{u:22,v:10,thickness:.006,form:'cupped-pointed-leaf'}),leaf)
    line(group,`sprout-subtle-vein-${side}`,sample(t=>{const [x,y,z]=blade(.04+t*.85,.5);return [x,y,z+.004]},18),.0023,vein,{segments:18,sides:5})
  }
  group.position.set(.015,1.14,0);return group
}
function scarf(){
  const group=new THREE.Group(),size=64,data=new Uint8Array(size*size*4)
  // A fine, deterministic weave changes the surface normals, not the silhouette.
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const warp=Math.cos(x*Math.PI/2),weft=Math.cos(y*Math.PI/2),over=((x>>2)+(y>>2))%2
    const value=Math.round(128+25*(over?warp:weft)+9*(over?weft:warp)),i=(y*size+x)*4
    data.set([value,value,value,255],i)
  }
  const weave=new THREE.DataTexture(data,size,size,THREE.RGBAFormat)
  weave.wrapS=weave.wrapT=THREE.RepeatWrapping;weave.repeat.set(12,2)
  weave.magFilter=THREE.LinearFilter;weave.minFilter=THREE.LinearMipmapLinearFilter;weave.generateMipmaps=true;weave.needsUpdate=true
  const fabric=material(0xd5b0ad,{roughness:.82,sheen:.42,clearcoat:0}),edge=material(0xe6cebf,{roughness:.85,sheen:.3,clearcoat:0})
  for(const cloth of [fabric,edge]){cloth.bumpMap=weave;cloth.bumpScale=.0015;cloth.specularIntensity=.22;cloth.envMapIntensity=.3;cloth.sheenRoughness=.9}
  const points=Array.from({length:64},(_,i)=>{
    const a=i/64*Math.PI*2,x=Math.cos(a)*1.10,y=-.30+.015*Math.sin(a),side=Math.sign(Math.sin(a))
    const z=skin(x,y,0).z*side
    return new THREE.Vector3(x*1.015,y,z+Math.sign(z)*.025)
  })
  const wrap=line(group,'scarf-woven-wrap',points,.085,fabric,{closed:true,segments:96,sides:10})
  wrap.geometry.userData.accessoryForm='woven-wrap'
  for(const [i,[anchor,length,bend,width]] of [[-.27,.46,-.10,.185],[-.075,.35,.065,.165]].entries()){
    const drape=(u,v)=>{
      const across=v*2-1,tip=u*u*u
      const x=anchor+bend*(u*u)+.016*Math.sin(u*Math.PI)+across*width*.5*(1-.10*u)
      const y=-.32-length*u+.023*across*u+.014*across*across*tip
      const fold=.014*Math.sin(across*Math.PI*1.4+u*2+i)*Math.sin(Math.PI*u)
      return [...skin(x,y,.067+fold+.045*tip+.010*across*across)]
    }
    const geometry=sheet(drape,{u:22,v:10,thickness:.009,form:'soft-draped-scarf-tail'})
    const uv=[]
    for(let side=0;side<2;side++)for(let u=0;u<=22;u++)for(let v=0;v<=10;v++)uv.push(v/10*.15,u/22)
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2))
    add(group,`scarf-tail-${i}`,geometry,fabric)
    line(group,`scarf-tail-trim-${i}`,sample(v=>{const [x,y,z]=drape(.88,v);return [x,y,z+.006]},16),.003,edge,{segments:16,sides:5})
  }
  return group
}
function star(){
  const group=new THREE.Group(),trim=material(palette.champagne,{roughness:.35,metalness:.12,sheen:.12}),enamel=material(palette.pearl,{roughness:.27,clearcoat:.3,sheen:.15}),inlay=material(0xa8a2c8,{roughness:.28})
  const points=Array.from({length:10},(_,i)=>{const a=i/10*Math.PI*2,r=i%2?.082:.16;return new THREE.Vector2(Math.sin(a)*r,Math.cos(a)*r)})
  const settings={depth:.018,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.007,bevelThickness:.006,curveSegments:5}
  add(group,'star-rounded-setting',compact(new THREE.ExtrudeGeometry(softenedShape(points,.22),settings)),trim)
  add(group,'star-pearl-inlay',compact(new THREE.ExtrudeGeometry(softenedShape(points.map(p=>p.clone().multiplyScalar(.82)),.22),{...settings,depth:.012,bevelSize:.005})),enamel,[0,0,.020])
  add(group,'star-lavender-center',new THREE.SphereGeometry(.020,16,10),inlay,[0,0,.041],[1,1,.45])
  group.position.copy(skin(.42,-.43,.046));group.rotation.set(.04,.29,-.10);return group
}
function glasses(sun=false){
  const group=new THREE.Group(),frame=material(sun?0x73809c:0xb4a8c5,{roughness:.29,metalness:.10,sheen:.1,clearcoat:.2}),hinge=material(palette.champagne,{roughness:.35,metalness:.12,sheen:.1})
  const lens=sun?new THREE.MeshPhysicalMaterial({color:0x546a8d,roughness:.18,metalness:0,clearcoat:.5,envMapIntensity:.45,transparent:true,opacity:.62,depthWrite:false}):null
  for(const side of [-1,1]){
    const point=(t,r=1)=>{const a=t*Math.PI*2,u=Math.cos(a),v=Math.sin(a),x=side*.32+(sun?Math.sign(u)*Math.abs(u)**.63*.232:u*.202)*r,y=.18+(sun?Math.sign(v)*Math.abs(v)**.70*.15:v*.213)*r;return skin(x,y,.041+.008*(1-r*r))}
    line(group,`glasses-fine-rim-${side}`,Array.from({length:64},(_,i)=>point(i/64)),sun?.014:.012,frame,{closed:true,segments:64,sides:8})
    if(lens){
      const positions=[],indices=[],segments=48,rings=8
      for(let ring=0;ring<=rings;ring++)for(let i=0;i<=segments;i++){
        const p=point(i/segments,ring/rings);positions.push(p.x,p.y,p.z-.003)
        if(ring<rings&&i<segments){const n=ring*(segments+1)+i;indices.push(n,n+segments+1,n+1,n+1,n+segments+1,n+segments+2)}
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();add(group,`glasses-curved-lens-${side}`,geometry,lens).renderOrder=21
    }
    line(group,`glasses-temple-${side}`,[skin(side*.53,.19,.041),skin(side*.75,.16,.035),skin(side*.96,.10,.024),new THREE.Vector3(side*1.035,.065,.24)],.009,frame,{segments:24,sides:7})
    add(group,`glasses-small-hinge-${side}`,roundedBox(.027,.022,.025,.006),hinge,[...skin(side*.53,.19,.045)])
  }
  line(group,'glasses-light-bridge',[skin(-.112,.20,.044),skin(0,.235,.049),skin(.112,.20,.044)],.010,frame,{segments:20,sides:7});return group
}
export const accessoryBuilders={crown,bow,beret,cap,sprout,scarf,star,round:()=>glasses(),sunglasses:()=>glasses(true)}
