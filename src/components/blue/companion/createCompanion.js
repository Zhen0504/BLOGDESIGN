import * as THREE from 'three'
import { createExpressionPreview } from './renderer.js'
import { characterShape,frontPoint } from './shapes.js'
import { PetMotion,deformPoint } from './motion.js'
import { expressionById } from './expressions.js'
import { DialogueDirector,dialogueTopic } from './dialogue.js'
import { CompanionSpace,companionLayout } from './space.js'
import { createCompanionDecor } from './decor.js'
import { idlePose } from './idleActions.js'
import {PoseTransition,ExpressionTransition} from './transitions.js'
import {ShakeDizziness} from './shakeDizziness.js'
import {CompanionResponses} from './responses.js'
import {createWardrobe} from './wardrobe.js'

export function createCompanion(host,{getLayout=()=>({home:true,left:false}),outfit}={}){
const model=createExpressionPreview(host,'calm',{backgroundVisible:false,viewport:true})
const canvas=model.renderer.domElement
const wardrobe=createWardrobe(model.character,outfit)
let wardrobeOpen=false
canvas.setAttribute('aria-hidden','true')
const decor=createCompanionDecor(host),{speech,hit}=decor
const readLayout=()=>companionLayout({width:innerWidth,height:innerHeight,...getLayout()})
const space=new CompanionSpace(readLayout()),motion=new PetMotion()
const poseTransition=new PoseTransition(),expressionTransition=new ExpressionTransition()
const shakeDizziness=new ShakeDizziness()
const responses=new CompanionResponses()
let previousIdleAction=''
let smoothHeading=0,footBlend=0,smoothStep=0
const attention={until:0,turn:0,pitch:0}
decor.layout(space.layout)
const ray=new THREE.Raycaster()
const reduced=matchMedia('(prefers-reduced-motion: reduce)')
const dialogue=new DialogueDirector(),geometryCache=new WeakMap()
const sweatGeometry=new THREE.SphereGeometry(1,16,12)
const sweatMaterial=new THREE.MeshPhysicalMaterial({color:0x69bdf4,roughness:.12,metalness:0,clearcoat:1,transparent:true,opacity:.85,depthWrite:false})
const sweat=Array.from({length:3},()=>{const mesh=new THREE.Mesh(sweatGeometry,sweatMaterial);mesh.renderOrder=25;mesh.visible=false;model.character.add(mesh);return mesh})
const dropGeometry=new THREE.SphereGeometry(.055,14,10)
let expressionId='',pointer=null,lastTap=0,lastTime=performance.now(),lastRender=0,frame,dropAt=0,drops=[]
model.renderer.localClippingEnabled=true
model.body.frustumCulled=false
model.bodyGeometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(),3.5)
function updateClipping(){
  const l=space.layout,c=l.column
  const planes=c?[
    new THREE.Plane(new THREE.Vector3(-1,0,0),(c.left-l.width/2)/100),
    new THREE.Plane(new THREE.Vector3(1,0,0),(l.width/2-c.right)/100),
    new THREE.Plane(new THREE.Vector3(0,1,0),(c.top-l.height/2)/100),
    new THREE.Plane(new THREE.Vector3(0,-1,0),(l.height/2-c.bottom)/100),
  ]:[]
  for(const root of [model.character,model.shadow])root.traverse(o=>{if(o.material){o.material.clippingPlanes=planes;o.material.clipIntersection=true}})
}
function localHit(event){
  const ndc=new THREE.Vector2(event.clientX/innerWidth*2-1,1-event.clientY/innerHeight*2)
  ray.setFromCamera(ndc,model.camera)
  const hit=ray.intersectObject(model.body,false)[0]
  return hit?model.body.worldToLocal(hit.point.clone()):new THREE.Vector3(0,.1,1)
}
function down(event){
  space.interact()
  if(event.button!==0||motion.flipTime!==null||space.travel)return
  const local=localHit(event)
  pointer={id:event.pointerId,x:event.clientX,y:event.clientY,grab:{x:local.x,y:local.y,z:local.z},dragged:false}
  hit.setPointerCapture(event.pointerId);hit.focus({preventScroll:true});event.preventDefault()
}
function tapResponse(x=space.x){
  if(!responses.tap(motion.clock,x<=space.x?-1:1))return
  motion.expression='calm';motion.expressionAt=motion.clock+8
}
function move(event){
  if(!pointer){attention.until=motion.clock+1.8;attention.turn=THREE.MathUtils.clamp((event.clientX-space.x)/space.size,-.28,.28);attention.pitch=THREE.MathUtils.clamp((event.clientY-space.y)/space.size,-.10,.10);return}
  if(!pointer||pointer.id!==event.pointerId)return
  if(space.layout.home)return
  if(!pointer.dragged&&Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)>5){
    pointer.dragged=motion.startDrag({x:0,y:0},pointer.grab)
    if(pointer.dragged){responses.cancel();space.begin({x:pointer.x,y:pointer.y},motion.drag.willing);shakeDizziness.begin(pointer.x,pointer.y)}
    host.classList.toggle('dragging',pointer.dragged)
  }
  if(pointer.dragged){
    if(motion.drag)shakeDizziness.move(event.clientX,event.clientY,space.size)
    space.move({x:event.clientX,y:event.clientY})
    const scale=space.size/229.1
    if(motion.drag&&!motion.drag.willing)motion.moveDrag({x:(event.clientX-pointer.x)/(100*scale),y:-(event.clientY-pointer.y)/(100*scale)})
    if(space.travel?.kind==='portal'){motion.endDrag();shakeDizziness.end()}
    event.preventDefault()
  }
}
function up(event){
  if(!pointer||pointer.id!==event.pointerId)return
  if(pointer.dragged){motion.endDrag();space.end();shakeDizziness.end()}
  else if(event.type!=='pointercancel'){
    if(space.layout.home)tapResponse(event.clientX)
    else{const now=performance.now();if(now-lastTap<330){responses.cancel();motion.flip();lastTap=0}else{lastTap=now;tapResponse(event.clientX)}}
  }
  pointer=null;host.classList.remove('dragging')
  if(hit.hasPointerCapture(event.pointerId))hit.releasePointerCapture(event.pointerId)
}
hit.addEventListener('pointerdown',down);hit.addEventListener('pointermove',move)
hit.addEventListener('pointerenter',event=>{space.interact();attention.until=motion.clock+2;responses.enter(motion.clock,event.clientX<=space.x?-1:1)})
hit.addEventListener('pointerleave',()=>responses.leave(motion.clock))
hit.addEventListener('pointerup',up);hit.addEventListener('pointercancel',up);hit.addEventListener('lostpointercapture',up)
hit.addEventListener('keydown',event=>{if(event.code==='Space'){event.preventDefault();space.interact();if(space.layout.home)tapResponse();else if(!space.travel){responses.cancel();motion.flip()}}})
function setPage(){
  responses.cancel()
  shakeDizziness.end()
  if(pointer){motion.endDrag();const id=pointer.id;pointer=null;if(hit.hasPointerCapture(id))hit.releasePointerCapture(id)}
  host.classList.remove('dragging');space.setLayout(readLayout());decor.layout(space.layout);updateClipping()
}
function resize(){
  responses.cancel()
  shakeDizziness.end()
  if(pointer){motion.endDrag();const id=pointer.id;pointer=null;if(hit.hasPointerCapture(id))hit.releasePointerCapture(id)}
  host.classList.remove('dragging');space.setLayout(readLayout(),false);decor.layout(space.layout);updateClipping()
}
addEventListener('resize',resize)
function cache(mesh){
  let data=geometryCache.get(mesh.geometry)
  if(data)return data
  const position=mesh.geometry.attributes.position,base=new Float32Array(position.array)
  data={base,closed:null,centerY:0}
  if(mesh!==model.body){
    let low=Infinity,high=-Infinity
    for(let i=1;i<base.length;i+=3){low=Math.min(low,base[i]);high=Math.max(high,base[i])}
    data.centerY=(low+high)/2;data.closed=new Float32Array(base.length/3)
    for(let i=0;i<position.count;i++){
      const x=base[i*3],y=base[i*3+1],z=base[i*3+2]
      data.closed[i]=frontPoint(x,data.centerY,characterShape)[2]+z-frontPoint(x,y,characterShape)[2]
    }
  }
  geometryCache.set(mesh.geometry,data);return data
}
function deform(mesh,pose,blink){
  const position=mesh.geometry.attributes.position,data=cache(mesh),base=data.base
  for(let i=0;i<position.count;i++){
    let x=base[i*3],y=base[i*3+1],z=base[i*3+2]
    if(data.closed){y=data.centerY+(y-data.centerY)*blink;z=z*blink+data.closed[i]*(1-blink)}
    position.setXYZ(i,...deformPoint(x,y,z,pose))
  }
  position.needsUpdate=true
  if(mesh===model.body)mesh.geometry.computeVertexNormals()
}
function updateMood(expression,pose,dt){
  const uniforms=model.bodyMaterial.userData.emotionUniforms
  const blend=1-Math.exp(-dt*7)
  uniforms.gelAnger.value+=(Number(expression.anger||0)-uniforms.gelAnger.value)*blend
  uniforms.gelBlush.value+=(Number(expression.blush||0)-uniforms.gelBlush.value)*blend
  const sweating=pose.state==='resisting'||pose.state==='wall'||expression.id==='struggle'
  sweat.forEach((mesh,i)=>{
    mesh.visible=sweating
    if(!sweating)return
    const phase=(pose.clock*.85+i*.34)%1,side=i%2? -1:1
    const x=side*(.78+phase*.13),y=.55-phase*.72
    const z=frontPoint(x,y,characterShape)[2]+.065
    mesh.position.set(...deformPoint(x,y,z,pose))
    const size=Math.sin(phase*Math.PI)*.052
    mesh.scale.set(size*.65,size*(1.35+phase),size*.45)
    mesh.rotation.z=side*-.22
  })
  const topic=dialogueTopic(pose.state,expression.id),line=dialogue.update(topic,pose.clock,{reading:!space.layout.home,response:pose.response})
  if(speech.textContent!==line)speech.textContent=line
  const point=new THREE.Vector3(1.15,.80,.25).applyMatrix4(model.character.matrixWorld).project(model.camera)
  const width=host.clientWidth,height=host.clientHeight,centerX=(space.x/width)*width
  let x=(point.x+1)*width/2+14
  if(x+speech.offsetWidth>width-12)x=centerX-space.size/2-speech.offsetWidth-14
  let y=(1-point.y)*height/2-20
  const column=space.layout.column
  if(!column&&x<space.x+space.size*.55&&x+speech.offsetWidth>space.x-space.size*.55){x=space.x-space.size*.55-speech.offsetWidth-14}
  if(column){
    if(space.layout.mobile){x=space.x>width/2?12:width-speech.offsetWidth-12;y=column.bottom+10}
    else{
      x=space.x-speech.offsetWidth/2
      x=space.x<width/2?Math.max(12,Math.min(column.left-speech.offsetWidth-14,x)):Math.max(column.right+14,Math.min(width-speech.offsetWidth-12,x))
      y=space.y-space.size/2-speech.offsetHeight-22
    }
  }
  speech.style.left=Math.max(12,Math.min(width-speech.offsetWidth-12,x))+'px'
  speech.style.top=Math.max(125,Math.min(height-speech.offsetHeight-40,y))+'px'
  speech.hidden=!line||Boolean(space.travel&&!space.travel.roaming)
  canvas.dataset.sweat=String(sweating?3:0);canvas.dataset.dialogueTopic=topic
  canvas.dataset.anger=uniforms.gelAnger.value.toFixed(2);canvas.dataset.blush=uniforms.gelBlush.value.toFixed(2)
}

function updateDrops(pose,s,dt){
  if(pose.state==='willing'&&Math.hypot(s.vx,s.vy)>180&&pose.clock>dropAt&&drops.length<6&&!reduced.matches){
    const mesh=new THREE.Mesh(dropGeometry,model.bodyMaterial),scale=s.size/229.1
    mesh.position.copy(model.character.position);mesh.position.x-=Math.sign(s.vx)*scale
    mesh.scale.setScalar(scale*(.6+Math.random()*.4))
    model.scene.add(mesh);drops.push({mesh,age:0,vx:s.vx/700,vy:-s.vy/700-.15,scale:mesh.scale.x});dropAt=pose.clock+.12
  }
  drops=drops.filter(drop=>{
    drop.age+=dt;drop.vy-=dt*.7;drop.mesh.position.x+=drop.vx*dt;drop.mesh.position.y+=drop.vy*dt
    drop.mesh.scale.setScalar(drop.scale*Math.max(0,1-drop.age/.72))
    if(drop.age>.72){model.scene.remove(drop.mesh);return false}return true
  })
}
function tick(now){
  const dt=Math.min(.033,(now-lastTime)/1000);lastTime=now
  if(!document.hidden){
    if(wardrobeOpen)space.nextRoam=space.clock+(space.layout.home?5:24)
    const s=space.tick(dt,reduced.matches),pose=motion.tick(dt,reduced.matches),scale=s.size/229.1
    const shakeDizzy=shakeDizziness.update(dt)
    const response=responses.update(motion.clock,{dizzy:shakeDizzy||motion.expression==='dizzy'&&!motion.drag,busy:Boolean(motion.drag||motion.flipTime!==null||space.travel&&!space.travel.roaming),reduced:reduced.matches})
    pose.response=response
    if(response.phase)space.nextRoam=Math.max(space.nextRoam,space.clock+(space.layout.home?5:24))
    if(s.state!=='free'){pose.state=s.state;pose.expression=s.state==='walking'?'curious':'focused'}
    if(s.contact?.kind==='wall'){pose.state='wall';pose.expression='struggle';pose.collision={side:s.contact.side,amount:s.contact.strength}}
    pose.walkStep=s.step
    pose.feet=s.state==='walking'
    if(s.action&&s.action!=='walking'){pose.idle=idlePose(s.action,s.actionProgress);pose.expression=pose.idle.expression;pose.state=s.action}
    if(s.action==='peek'&&s.x<innerWidth/2){pose.idle.turn*=-1;pose.idle.upperTwist*=-1;pose.idle.lean*=-1}
    const activeIdle=Boolean(s.action&&s.action!=='walking')
    if(!activeIdle&&!previousIdleAction&&s.state==='free'){
      const attending=motion.clock<attention.until
      pose.idle={turn:.075*Math.sin(pose.clock*.33)+(attending?attention.turn:0),pitch:.025*Math.sin(pose.clock*.45)+(attending?attention.pitch:0),lean:attending?.035:0}
    }
    if(response.pose&&s.state==='free')pose.idle={...pose.idle,...response.pose}
    const smoothed=poseTransition.update(pose.idle,dt,reduced.matches)
    if(activeIdle||previousIdleAction){pose.idle=smoothed;previousIdleAction=activeIdle?s.action:Math.abs(smoothed.turn)+Math.abs(smoothed.roll)+Math.abs(smoothed.scaleY-1)>.005?'settling':''}
    if(s.state==='free'&&!previousIdleAction)pose.idle=smoothed
    if(Math.abs(pose.idle?.step||0)>.025){pose.feet=true;pose.walkStep=pose.idle.step}
    const settle=1-Math.exp(-dt*8)
    footBlend+=((pose.feet?1:0)-footBlend)*settle
    smoothStep+=(pose.walkStep-smoothStep)*settle
    pose.feet=footBlend>.01;pose.footBlend=footBlend;pose.walkStep=smoothStep
    if(pose.state==='willing')pose.tail={x:THREE.MathUtils.clamp(-s.vx/(100*scale)*.065,-.5,.5),y:THREE.MathUtils.clamp(s.vy/(100*scale)*.065,-.5,.5)}
    if(response.expression)pose.expression=response.expression
    if(now-lastRender>=1000/60-1){
      const face=expressionTransition.update(pose.expression,(now-lastRender)/1000,reduced.matches)
      const expression=expressionById(face.id)
      if(expression.id!==expressionId){model.setExpression(expression);expressionId=expression.id;updateClipping()}
      const blink=(expression.closed?1:pose.blink)*face.openness*(response.blink??1)
      deform(model.body,pose,1);for(const mesh of model.eyes.children)deform(mesh,pose,blink)
      wardrobe.update(pose)
      let cx=s.x+motion.x*scale*100,cy=s.y-pose.y*scale*100-Math.abs(s.step)*scale*3
      if(space.layout.home&&s.state==='free'){
        const b=space.layout.bounds
        cx=THREE.MathUtils.clamp(cx,b.left,b.right);cy=THREE.MathUtils.clamp(cy,b.top,b.bottom)
      }
      if(space.layout.home&&pose.idle){
        const a=space.layout.tank,r=Math.min((a.right-a.left)/2-4,s.size*.5*Math.max(1,pose.idle.scaleX))
        cx=THREE.MathUtils.clamp(cx,a.left+r,a.right-r)
      }
      const depth=(pose.idle?.depth||0)*scale,projection=12/(12-depth)
      model.character.position.set((cx-innerWidth/2)/100,(innerHeight/2-cy)/100+(pose.idle?.lift||0)*scale,depth)
      model.character.scale.setScalar(scale*projection)
      model.bodyMaterial.thickness=1.5;model.bodyMaterial.attenuationDistance=2*scale*projection
      const dizzy=!reduced.matches&&response.sway ? .055*response.sway*Math.sin(pose.clock*3) : 0
      const walk=space.travel?.kind==='walking'?space.travel:null,phase=walk?Math.min(1,walk.time/walk.duration/.16,(1-walk.time/walk.duration)/.16):0
      const heading=walk?Math.sign(walk.to.x-walk.from.x)*.90*Math.max(0,phase):0
      smoothHeading+=(heading-smoothHeading)*(1-Math.exp(-(now-lastRender)/1000*7))
      model.character.rotation.set(pose.rotationX+(pose.idle?.pitch||0),smoothHeading+(pose.idle?.turn||0)+(pose.state==='idle'&&!reduced.matches?.028*Math.sin(pose.clock*.65):0),pose.rotationZ+dizzy+smoothStep*.065+(pose.idle?.roll||0))
      model.shadow.rotation.x=0;model.shadow.position.set((s.x-innerWidth/2)/100,(innerHeight/2-s.y)/100+characterShape.base*scale,-.08)
      const shadowScale=scale*(1-(pose.idle?.lift||0)*.25)
      model.shadow.scale.set(shadowScale,shadowScale*.20,scale)
      model.shadow.material.opacity=.65/(1+Math.max(0,pose.y-motion.y+(pose.idle?.lift||0))*1.6)
      model.render();updateMood(expression,pose,(now-lastRender)/1000);lastRender=now
      updateDrops(pose,s,dt);decor.update(space.layout,s,cx,cy)
      canvas.dataset.idleAction=s.action
      canvas.dataset.response=response.phase
      canvas.dataset.headAccessory=wardrobe.outfit.head;canvas.dataset.faceAccessory=wardrobe.outfit.face;canvas.dataset.chestAccessory=wardrobe.outfit.chest
      hit.style.cursor=space.layout.home?'pointer':'grab'
      hit.setAttribute('aria-label',space.layout.home?'果冻伙伴：点击回应，闲置时自己玩耍':'果冻伙伴：拖拽互动，双击或按空格后空翻')
      Object.assign(canvas.dataset,{state:pose.state,expression:expression.id,blinks:String(motion.blinkCount),expressionChanges:String(motion.expressionChanges),flips:String(motion.flips),rotationX:pose.rotationX.toFixed(3),x:cx.toFixed(2),y:cy.toFixed(2),size:s.size.toFixed(2),pull:Math.hypot(pose.pull.x,pose.pull.y).toFixed(3),tail:Math.hypot(pose.tail.x,pose.tail.y).toFixed(3),drops:String(drops.length),boundary:space.drag?.boundary||s.contact?.kind||'',travel:s.state,home:String(space.layout.home),roaming:String(Boolean(space.travel?.roaming))})
    }
  }
  frame=requestAnimationFrame(tick)
}
updateClipping();frame=requestAnimationFrame(tick)
return {setPage,
  setOutfit(value){
    if(!wardrobe.set(value))return
    space.interact();updateClipping()
    responses.tap(motion.clock,space.x<innerWidth/2?1:-1,'dress')
  },
  setWardrobeOpen(value){wardrobeOpen=Boolean(value);space.interact()},
  dispose(){
  cancelAnimationFrame(frame);removeEventListener('resize',resize)
  if(pointer&&hit.hasPointerCapture(pointer.id))hit.releasePointerCapture(pointer.id)
  for(const drop of drops)model.scene.remove(drop.mesh)
  dropGeometry.dispose();wardrobe.dispose();decor.dispose();model.dispose()
}}
}
