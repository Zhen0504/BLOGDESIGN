import * as THREE from 'three'
import { characterShape,blobVertex,frontPoint } from './shapes.js'
import { expressions } from './baselineExpressions.js'
import { createGelMaterial } from './gelMaterial.js'

export function createExpressionPreview(host,expression='calm',{checker=false,cameraScale=1,backgroundVisible=true,viewport=false}={}){
  const c=characterShape
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true})
  renderer.setPixelRatio(Math.min(devicePixelRatio,viewport?1:1.75));renderer.setClearColor(0xfcfdff,0)
  if(viewport)renderer.transmissionResolutionScale=.5
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05
  host.appendChild(renderer.domElement)
  const scene=new THREE.Scene(),character=new THREE.Group();scene.add(character)
  const camera=viewport?new THREE.OrthographicCamera(-1,1,1,-1,.1,100):new THREE.PerspectiveCamera(34,1,.1,30)
  const bodyMaterial=createGelMaterial()
  // HTML circuits live outside WebGL: preserve physical transmission RGB but
  // composite the gel silhouette opaquely so DOM lines never bleed into its face.
  if(!backgroundVisible){
    const compile=bodyMaterial.onBeforeCompile
    bodyMaterial.onBeforeCompile=shader=>{
      compile(shader)
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','#include <opaque_fragment>\n gl_FragColor.a = 1.0;')
    }
    bodyMaterial.customProgramCacheKey=()=> 'companion-html-volume-gel-v2'
  }
  const bodyGeometry=new THREE.SphereGeometry(1,viewport?48:96,viewport?32:64),p=bodyGeometry.attributes.position
  for(let i=0;i<p.count;i++)p.setXYZ(i,...blobVertex(p.getX(i),p.getY(i),p.getZ(i),c))
  bodyGeometry.computeVertexNormals()
  const body=new THREE.Mesh(bodyGeometry,bodyMaterial);character.add(body)

  const eyes=new THREE.Group();eyes.name='minimal-eyes';character.add(eyes)
  // Fully opaque color, sorted after the transmitting body. Not sampled by its
  // transmission pass, so the eyes cannot be refracted into a second image.
  const eyeMaterial=new THREE.MeshBasicMaterial({color:0x182644,toneMapped:false,transparent:true,opacity:1,depthWrite:false})
  function skin(x,y){return frontPoint(x,y,c)[2]}
  function setExpression(next){
  for(const child of [...eyes.children]){child.geometry.dispose();eyes.remove(child)}
  const state=typeof next==='string'?(expressions.find(item=>item.id===next)||expressions[0]):next
  expression=state.id
  for(const side of [-1,1]){
    const eye=state.eyes[side===-1?0:1]
    const cx=side*.30+state.look[0],cy=.15+state.look[1]+(eye.y||0)
    const angle=eye.angle||0,cos=Math.cos(angle),sin=Math.sin(angle)
    function position(dx,dy,lift=.012){
      const x=cx+dx*cos-dy*sin,y=cy+dx*sin+dy*cos
      return new THREE.Vector3(x,y,skin(x,y)+lift)
    }
    if(eye.kind==='angry'){
      const shape=[[-.16,.085],[.14,-.008],[.13,-.078],[-.13,-.095],[-.16,-.04]]
      const points=shape.map(([x,y])=>position(x*-side,y,.029)),vertices=[],indices=[]
      const center=points.reduce((sum,p)=>sum.add(p),new THREE.Vector3()).multiplyScalar(1/points.length)
      vertices.push(center.x,center.y,center.z)
      for(const p of points)vertices.push(p.x,p.y,p.z)
      for(let i=0;i<points.length;i++){
        const a=i+1,b=(i+1)%points.length+1,pa=points[i],pb=points[(i+1)%points.length]
        if((pa.x-center.x)*(pb.y-center.y)-(pa.y-center.y)*(pb.x-center.x)>0)indices.push(0,a,b);else indices.push(0,b,a)
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();eyes.add(new THREE.Mesh(geometry,eyeMaterial))
    }else if(state.closed||eye.closed||eye.kind==='chevron'||eye.kind==='spiral'){
      const points=[]
      if(eye.kind==='chevron'){
        const span=eye.span||.115,opening=eye.opening||.085
        points.push(position(side*span,opening,.021),position(-side*span*.48,0,.021),position(side*span,-opening,.021))
      }else if(eye.kind==='spiral'){
        for(let j=0;j<=72;j++){const t=j/72,a=t*Math.PI*3.6,r=.008+t*.155;points.push(position(Math.cos(a)*r,Math.sin(a)*r,.029))}
      }else for(let j=0;j<=32;j++){
        const t=j/32
        points.push(position((t-.5)*.28,Math.sin(t*Math.PI)*(eye.curve??.10),.018))
      }
      const curve=new THREE.CatmullRomCurve3(points)
      // A single rounded ribbon projected onto the skin stays continuous while
      // stretching. A tube's rear half and separate caps could sink into the gel.
      const vertices=[],indices=[],radius=eye.stroke||.031
      const add=(x,y)=>{vertices.push(x,y,skin(x,y)+.029);return vertices.length/3-1}
      for(let i=0;i<=48;i++){
        const p=curve.getPoint(i/48),t=curve.getTangent(i/48),d=Math.hypot(t.x,t.y)||1
        add(p.x-t.y/d*radius,p.y+t.x/d*radius);add(p.x+t.y/d*radius,p.y-t.x/d*radius)
        if(i<48){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2)}
      }
      for(const p of [points[0],points.at(-1)]){
        const center=add(p.x,p.y)
        for(let i=0;i<=24;i++){
          const a=i/24*Math.PI*2;add(p.x+Math.cos(a)*radius,p.y+Math.sin(a)*radius)
          if(i<24)indices.push(center,center+i+1,center+i+2)
        }
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals()
      eyes.add(new THREE.Mesh(geometry,eyeMaterial))
    }else{
      const rings=12,segments=64,vertices=[],indices=[]
      for(let ring=0;ring<=rings;ring++)for(let j=0;j<=segments;j++){
        const r=ring/rings,a=j/segments*Math.PI*2
        const u=Math.cos(a)*r,v=Math.sin(a)*r
        const soft=value=>Math.sign(value)*Math.abs(value)**.78
        const point=position(soft(u)*eye.rx,soft(v)*eye.ry,.012+.012*(1-r*r))
        vertices.push(point.x,point.y,point.z)
        if(ring<rings&&j<segments){const n=ring*(segments+1)+j;indices.push(n,n+segments+1,n+1,n+1,n+segments+1,n+segments+2)}
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals()
      eyes.add(new THREE.Mesh(geometry,eyeMaterial))
    }
  }
  eyes.traverse(object=>{if(object.isMesh)object.renderOrder=20})
  }
  setExpression(expression)

  scene.add(new THREE.HemisphereLight(0xdce9ff,0x6c639a,1.35))
  // Area reflections carry the gloss; point-like specular dots are disabled.
  const environment=new THREE.Scene();environment.background=new THREE.Color(0x52688f)
  function reflectionPanel(color,intensity,width,height,position){
    const material=new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),side:THREE.DoubleSide})
    const panel=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);panel.position.set(...position);panel.lookAt(0,0,0);environment.add(panel)
  }
  reflectionPanel(0xffffff,6,5,1.5,[-2.4,4,2.8])
  reflectionPanel(0xffffff,3.2,.65,4,[4,.5,2])
  reflectionPanel(0xa6ddff,1.8,2.5,4,[-4,.4,1])
  reflectionPanel(0xc6b3ff,2.2,2.8,4,[3.5,-.1,1.5])
  const pmrem=new THREE.PMREMGenerator(renderer),target=pmrem.fromScene(environment,.025,.1,20);scene.environment=target.texture

  // A real opaque background gives transmission rays something to refract.
  // The optional checker is QA-only; the normal preview remains plain white.
  const backgroundCanvas=document.createElement('canvas');backgroundCanvas.width=512;backgroundCanvas.height=512
  const backgroundContext=backgroundCanvas.getContext('2d')
  backgroundContext.fillStyle='#fcfdff';backgroundContext.fillRect(0,0,512,512)
  if(checker)for(let y=0;y<12;y++)for(let x=0;x<12;x++){
    backgroundContext.fillStyle=(x+y)%2?'#6c788b':'#f4f7fc';backgroundContext.fillRect(x*512/12,y*512/12,512/12+1,512/12+1)
  }
  const backgroundTexture=new THREE.CanvasTexture(backgroundCanvas);backgroundTexture.colorSpace=THREE.SRGBColorSpace
  const background=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:backgroundTexture,toneMapped:false}));background.renderOrder=-5;scene.add(background)
  if(!backgroundVisible){
    background.material.depthWrite=false
    // Supply white radiance to the physical transmission buffer, without drawing
    // a rectangular white patch over the HTML circuit field in the final pass.
    background.onBeforeRender=()=>{background.material.colorWrite=renderer.getRenderTarget()!==null}
  }

  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=128
  const ctx=shadowCanvas.getContext('2d');ctx.scale(1,.5)
  const shadowGradient=ctx.createRadialGradient(128,128,8,128,128,112)
  shadowGradient.addColorStop(0,'rgba(47,48,86,.30)');shadowGradient.addColorStop(.48,'rgba(47,48,86,.12)');shadowGradient.addColorStop(1,'rgba(47,48,86,0)')
  ctx.fillStyle=shadowGradient;ctx.fillRect(0,0,256,256)
  const shadowTexture=new THREE.CanvasTexture(shadowCanvas)
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(3.1,1.8),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}))
  shadow.rotation.x=-Math.PI/2;shadow.position.y=c.base-.003;scene.add(shadow)
  let view='front'
  function render(){
    if(viewport){camera.position.set(0,0,12);camera.lookAt(0,0,0)}
    else{if(view==='side')camera.position.set(3.15,.58,4.28);else camera.position.set(.10,.50,5.24);camera.position.multiplyScalar(cameraScale);camera.lookAt(0,.03,0)}
    const distance=viewport?20:9,h=viewport?camera.top-camera.bottom:2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*distance
    background.position.copy(camera.position).addScaledVector(camera.getWorldDirection(new THREE.Vector3()),distance);background.quaternion.copy(camera.quaternion);background.scale.set(h*camera.aspect,h,1)
    renderer.render(scene,camera)
    renderer.domElement.dataset.character=c.id;renderer.domElement.dataset.expression=expression;renderer.domElement.dataset.view=view;renderer.domElement.dataset.transmission=String(bodyMaterial.transmission)
  }
  function resize(){const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;if(viewport){camera.left=-r.width/200;camera.right=r.width/200;camera.top=r.height/200;camera.bottom=-r.height/200}camera.updateProjectionMatrix();render()}
  const observer=new ResizeObserver(resize);observer.observe(host);resize()
  return {renderer,scene,camera,character,body,bodyGeometry,eyes,bodyMaterial,shadow,render,setExpression,
    setView(value){view=value;render()},setCameraScale(value){cameraScale=value;render()},dispose(){
    observer.disconnect();const resources=new Set([shadowTexture,backgroundTexture,background.geometry,background.material]);for(const source of [scene,environment])source.traverse(o=>{if(o.geometry)resources.add(o.geometry);if(o.material)resources.add(o.material)})
    resources.forEach(r=>r.dispose());target.dispose();pmrem.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove()
  }}
}
