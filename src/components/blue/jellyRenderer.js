import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import { jellyRestVertex } from './jellyShape.js'

export function createJellyMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color:0xffffff,transmission:1,opacity:1,metalness:0,roughness:.08,
    ior:1.4,thickness:.85,attenuationDistance:1.1,
    attenuationColor:0x89d0ff,envMapIntensity:1,
    clearcoat:.12,clearcoatRoughness:.1,
  })
}

// Shared by the isolated optical test and the homepage. No custom color/highlight shader.
export function createJellyRenderer(host, initial = {}) {
  const settings={backdrop:'page',tinted:true,lightPose:'left',bodyVisible:true,...initial}
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true})
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75))
  renderer.setClearColor(0xfcfdff,0)
  // Match the white DOM backdrop; tone-mapping only the transmissive body would
  // turn an optically clear object grey against an un-tone-mapped web canvas.
  renderer.toneMapping=THREE.NoToneMapping
  renderer.toneMappingExposure=1
  host.appendChild(renderer.domElement)
  RectAreaLightUniformsLib.init()
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,40)
  camera.position.set(0,.65,6.3);camera.lookAt(0,.05,0)

  const geometry=new THREE.SphereGeometry(1,96,64)
  const positions=geometry.attributes.position
  for(let i=0;i<positions.count;i++)positions.setXYZ(i,...jellyRestVertex(positions.getX(i),positions.getY(i),positions.getZ(i)))
  geometry.computeVertexNormals()
  const material=createJellyMaterial()
  const body=new THREE.Mesh(geometry,material);scene.add(body);body.updateMatrixWorld(true)
  const face=new THREE.Group();scene.add(face)
  const ray=new THREE.Raycaster(),direction=new THREE.Vector3(0,0,-1)
  function surface(x,y){ray.set(new THREE.Vector3(x,y,3),direction);return ray.intersectObject(body,false)[0]}
  const eyeGeometry=new THREE.SphereGeometry(1,24,16)
  const eyeMaterial=new THREE.MeshBasicMaterial({color:0x345a76,transparent:true,opacity:.9,depthWrite:false})
  for(const x of [-.205,.205]){
    const hit=surface(x,.10);if(!hit)continue
    const eye=new THREE.Mesh(eyeGeometry,eyeMaterial)
    eye.position.copy(hit.point).addScaledVector(hit.face.normal,.007)
    eye.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),hit.face.normal)
    eye.scale.set(.044,.063,.009);eye.renderOrder=5;face.add(eye)
  }
  const mouthPoints=[]
  for(let i=0;i<=32;i++){
    const a=Math.PI+i/32*Math.PI,hit=surface(Math.cos(a)*.09,-.035+Math.sin(a)*.044)
    if(hit)mouthPoints.push(hit.point.clone().addScaledVector(hit.face.normal,.008))
  }
  const mouth=new THREE.Line(new THREE.BufferGeometry().setFromPoints(mouthPoints),new THREE.LineBasicMaterial({color:0x345a76,transparent:true,opacity:.85,depthWrite:false}))
  mouth.renderOrder=5;face.add(mouth)

  // The actual opaque backdrop participates in Three's transmission render pass.
  const backdropCanvas=document.createElement('canvas');backdropCanvas.width=1024;backdropCanvas.height=1024
  const ctx=backdropCanvas.getContext('2d')
  const backdropTexture=new THREE.CanvasTexture(backdropCanvas);backdropTexture.colorSpace=THREE.SRGBColorSpace
  const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:backdropTexture,toneMapped:false}))
  // Page linework is drawn into the real transmission buffer, but not duplicated
  // over the DOM in the final pass. This keeps lines outside the body crisp.
  backdrop.onBeforeRender=()=>{
    backdrop.material.colorWrite=settings.backdrop==='checker'||renderer.getRenderTarget()!==null
  }
  backdrop.renderOrder=-5;scene.add(backdrop)

  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=128
  const shadowContext=shadowCanvas.getContext('2d');shadowContext.scale(1,.5)
  const gradient=shadowContext.createRadialGradient(128,128,5,128,128,112)
  gradient.addColorStop(0,'rgba(42,66,79,.25)');gradient.addColorStop(.48,'rgba(42,66,79,.14)');gradient.addColorStop(1,'rgba(42,66,79,0)')
  shadowContext.fillStyle=gradient;shadowContext.fillRect(0,0,256,256)
  const shadowTexture=new THREE.CanvasTexture(shadowCanvas)
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(2.75,1.35),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,toneMapped:false}))
  shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.072;shadow.renderOrder=-1;scene.add(shadow)

  const environment=new THREE.Scene();environment.background=new THREE.Color(0x151b28)
  const room=new THREE.Mesh(new THREE.BoxGeometry(16,16,16),new THREE.MeshBasicMaterial({color:0x202838,side:THREE.BackSide}))
  environment.add(room)
  function panel(color,intensity,width,height,position){
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),side:THREE.DoubleSide}))
    mesh.position.set(...position);mesh.lookAt(0,0,0);environment.add(mesh)
    return mesh
  }
  const topPanel=panel(0xffffff,5,5.0,1.5,[-2,4,2])
  panel(0xffffff,3,.65,4,[4,1,2])
  panel(0x83dcff,2,3,4,[-3.4,.5,2.5])
  panel(0xb7a0ff,3.5,2.8,3.8,[3.4,-.1,2.5])
  const key=new THREE.RectAreaLight(0xffffff,3.5,4.5,1.1)
  const side=new THREE.RectAreaLight(0xddeeff,1.5,.45,3)
  side.position.set(3.5,.2,2);side.lookAt(0,0,0);scene.add(key,side)
  const pmrem=new THREE.PMREMGenerator(renderer)
  let environmentTarget
  function setLighting(pose){
    settings.lightPose=pose
    const position=pose==='right'?[2.5,2.8,3]:[-2.5,4,2]
    topPanel.position.set(...position);topPanel.lookAt(0,0,0)
    key.position.set(...position);key.lookAt(0,0,0)
    const next=pmrem.fromScene(environment,.025,.1,30)
    scene.environment=next.texture;environmentTarget?.dispose();environmentTarget=next
    renderer.domElement.dataset.lightPose=pose
  }
  function setTint(tinted){
    settings.tinted=tinted
    material.attenuationColor.set(tinted?0x89d0ff:0xffffff)
    material.attenuationDistance=tinted?1.1:Infinity
    renderer.domElement.dataset.material=tinted?'physical-blue':'physical-clear'
  }
  function drawBackdrop(){
    const size=backdropCanvas.width
    ctx.fillStyle='#fcfdff';ctx.fillRect(0,0,size,size)
    if(settings.backdrop==='checker'){
      // Projected squares, not a UV texture painted onto the character.
      const columns=16,rows=Math.round(columns/camera.aspect)
      for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
        ctx.fillStyle=(row+col)%2?'#586779':'#f4f7fc'
        ctx.fillRect(col*size/columns,row*size/rows,size/columns+1,size/rows+1)
      }
    }else{
      const field=document.querySelector('.circuit-field'),r=renderer.domElement.getBoundingClientRect()
      if(field&&r.width>0&&r.height>0){const ratio=field.width/innerWidth;ctx.drawImage(field,r.left*ratio,r.top*ratio,r.width*ratio,r.height*ratio,0,0,size,size)}
    }
    backdropTexture.needsUpdate=true
  }
  function render(){
    drawBackdrop();body.visible=settings.bodyVisible;face.visible=settings.bodyVisible;shadow.visible=settings.bodyVisible
    renderer.render(scene,camera)
  }
  function resize(){
    const r=host.getBoundingClientRect();if(!r.width||!r.height)return
    renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()
    const distance=9,viewHeight=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*distance
    backdrop.position.copy(camera.position).addScaledVector(camera.getWorldDirection(new THREE.Vector3()),distance)
    backdrop.quaternion.copy(camera.quaternion);backdrop.scale.set(viewHeight*camera.aspect,viewHeight,1)
    render()
  }
  setLighting(settings.lightPose);setTint(settings.tinted)
  const observer=new ResizeObserver(resize);observer.observe(host);resize()
  let frame,last=0
  function tick(now){if(!document.hidden&&now-last>65){render();last=now}frame=requestAnimationFrame(tick)}
  frame=requestAnimationFrame(tick)
  return {
    renderer,material,body,camera,render,
    configure(options){
      if(options.lightPose && options.lightPose!==settings.lightPose)setLighting(options.lightPose)
      if(options.tinted!==undefined)setTint(options.tinted)
      Object.assign(settings,options);render()
    },
    dispose(){
      cancelAnimationFrame(frame);observer.disconnect()
      const resources=new Set([backdropTexture,shadowTexture])
      for(const source of [scene,environment])source.traverse(o=>{if(o.geometry)resources.add(o.geometry);if(o.material)resources.add(o.material)})
      resources.forEach(r=>r.dispose());environmentTarget?.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove()
    },
  }
}
