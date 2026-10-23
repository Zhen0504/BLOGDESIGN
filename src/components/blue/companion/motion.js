const clamp=(v,a,b)=>Math.max(a,Math.min(b,v))
const length=v=>Math.hypot(v.x,v.y)
const limited=(v,max)=>{const d=length(v);return d>max?{x:v.x*max/d,y:v.y*max/d}:v}
const smooth=t=>t*t*(3-2*t)
export class PetMotion {
  constructor(random=Math.random){this.random=random;this.mode='random';this.bounds={x:2.3,y:1.1};this.reset()}
  reset(){
    Object.assign(this,{x:0,y:0,vx:0,vy:0,pull:{x:0,y:0},pullVelocity:{x:0,y:0},grab:{x:0,y:.1,z:1},drag:null,flipTime:null,landingTime:10,blinkAt:2.2,blinkTime:-1,blinkCount:0,expressionAt:8+this.random()*6,expression:'calm',expressionChanges:0,flips:0,clock:0,state:'idle'})
  }
  startDrag(pointer,grab){
    if(this.flipTime!==null)return false
    const willing=this.mode==='random'?this.random()>.42:this.mode==='willing'
    this.grab={...grab};this.drag={willing,anchor:{x:this.x,y:this.y},start:{...pointer},target:{x:this.x,y:this.y}}
    this.state=willing?'willing':'resisting';this.expression=willing?'happy':'struggle';return true
  }
  moveDrag(pointer){
    if(!this.drag)return
    const delta={x:pointer.x-this.drag.start.x,y:pointer.y-this.drag.start.y}
    if(this.drag.willing){this.drag.target={x:clamp(this.drag.anchor.x+delta.x,-this.bounds.x,this.bounds.x),y:clamp(this.drag.anchor.y+delta.y,-this.bounds.y,this.bounds.y)}}
    else this.drag.target=limited(delta,1.35)
  }
  endDrag(){
    if(!this.drag)return
    if(!this.drag.willing){this.x=this.drag.anchor.x;this.y=this.drag.anchor.y;this.vx=0;this.vy=0}
    this.drag=null;this.state='settling';this.expression='curious';this.expressionAt=this.clock+8+this.random()*6
  }
  flip(){
    if(this.drag||this.flipTime!==null)return false
    this.flipTime=0;this.flips++;this.state='flipping';this.expression='surprised';this.vx=0;this.vy=0;return true
  }
  tick(delta,reduced=false){
    const dt=clamp(delta,0,1/30);this.clock+=dt;this.landingTime+=dt
    if(this.flipTime!==null){this.flipTime+=dt;if(this.flipTime>=.90){this.flipTime=null;this.landingTime=0;this.state='settling';this.expression='dizzy';this.expressionAt=this.clock+2.8}}
    if(this.drag?.willing){
      this.vx+=(this.drag.target.x-this.x)*115*dt-this.vx*12*dt
      this.vy+=(this.drag.target.y-this.y)*115*dt-this.vy*12*dt
    }else if(this.drag){
      this.x=this.drag.anchor.x+this.pull.x*.055;this.y=this.drag.anchor.y+this.pull.y*.055
      this.vx=0;this.vy=0
    }else{
      this.vx*=Math.exp(-3.5*dt);this.vy*=Math.exp(-3.5*dt)
    }
    if(!this.drag||this.drag.willing){this.x+=this.vx*dt;this.y+=this.vy*dt}
    for(const [position,velocity,limit] of [['x','vx',this.bounds.x],['y','vy',this.bounds.y]]){
      if(Math.abs(this[position])>limit){this[position]=clamp(this[position],-limit,limit);this[velocity]*=-.2}
    }
    const target=this.drag&&!this.drag.willing?this.drag.target:{x:0,y:0}
    for(const key of ['x','y']){
      this.pullVelocity[key]+=(target[key]-this.pull[key])*105*dt-this.pullVelocity[key]*14*dt
      this.pull[key]+=this.pullVelocity[key]*dt
    }
    if(this.clock>=this.blinkAt&&this.blinkTime<0){this.blinkTime=0;this.blinkCount++}
    if(this.blinkTime>=0){this.blinkTime+=dt;if(this.blinkTime>.19){this.blinkTime=-1;this.blinkAt=this.clock+2.2+this.random()*2.5}}
    if(!this.drag&&this.flipTime===null&&this.clock>=this.expressionAt){
      const names=['calm','calm','curious','happy','sleepy']
      const pool=names.filter(id=>id!==this.expression)
      this.expression=pool[Math.floor(this.random()*pool.length)];this.expressionChanges++;this.expressionAt=this.clock+8+this.random()*6
    }
    if(this.state==='settling'&&Math.hypot(this.vx,this.vy,this.pull.x,this.pull.y)<.03&&this.landingTime>.8)this.state='idle'
    const f=this.flipTime===null?0:clamp(this.flipTime/.90,0,1)
    const jump=this.flipTime===null?0:Math.sin(f*Math.PI)*Math.min(1.10,.2+Math.max(0,this.bounds.y-this.y))
    const blink=this.blinkTime<0?1:1-.96*Math.sin(this.blinkTime/.19*Math.PI)**2
    const bob=reduced?0:.036*Math.sin(this.clock*1.55)+.012*Math.sin(this.clock*2.1)
    const landing=Math.exp(-this.landingTime*7)*Math.sin(this.landingTime*19)
    return {x:this.x,y:this.y+.14+bob+jump,rotationX:this.flipTime===null?0:-Math.PI*2*smooth(f),rotationZ:this.drag?.willing?clamp(-this.vx*.027,-.17,.17):0,
      pull:{...this.pull},grab:this.grab,tail:this.drag?.willing||this.state==='settling'?limited({x:-this.vx*.11,y:-this.vy*.11},.55):{x:0,y:0},
      landing,blink,expression:this.expression,state:this.state,clock:this.clock,speed:Math.hypot(this.vx,this.vy),breathe:reduced?0:.005*Math.sin(this.clock*1.6)}
  }
}

export function deformPoint(x,y,z,pose){
  const original={x,y,z},dx=x-pose.grab.x,dy=y-pose.grab.y,dz=z-pose.grab.z
  const anchor=clamp((y+1.02)/.65,0,1)
  const weight=Math.exp(-(dx*dx+dy*dy+dz*dz)/1.5)*anchor
  x+=pose.pull.x*weight;y+=pose.pull.y*weight
  const struggle=Math.hypot(pose.pull.x,pose.pull.y)>.1&&pose.state==='resisting'?.014*Math.sin(pose.clock*25)*weight:0
  x+=struggle*.35;y+=struggle
  const tailLength=Math.hypot(pose.tail.x,pose.tail.y)
  if(tailLength>.001){
    const tx=pose.tail.x/tailLength,ty=pose.tail.y/tailLength
    const along=(original.x*tx+original.y*ty)/1.15
    const across=-original.x*ty+original.y*tx
    const tailWeight=smooth(clamp((along+.05)/1.05,0,1))*Math.exp(-across*across/.30)*(.72+.28*(1-Math.min(1,Math.abs(z))))
    x+=pose.tail.x*tailWeight;y+=pose.tail.y*tailWeight
  }
  const pressure=pose.landing*(.35+.65*(1-clamp((original.y+1.02)/2.18,0,1)))
  x*=1+.105*pressure;y=-1.02+(y+1.02)*(1-.135*pressure);z*=1+.075*pressure+pose.breathe
  if(pose.walkStep){const wave=pose.walkStep;const weight=clamp((original.y+1.02)/2.18,0,1);x+=wave*.035*weight;y+=Math.abs(wave)*.025*(1-weight);z*=1+Math.abs(wave)*.012}
  if(pose.collision){
    const {side,amount}=pose.collision
    if(side==='bottom'){const w=clamp((original.y+.1)/1.2,0,1);y-=amount*.13*w;x*=1+amount*.035*w}
    else{const direction=side==='left'?1:-1,w=clamp((original.x*direction+.1)/1.2,0,1);x-=direction*amount*.14*w;y*=1+amount*.035*w}
  }
  if(pose.feet){
    const band=Math.exp(-Math.pow((original.y+1.00)/.21,2))*Math.max(0,Math.min(1,(original.z+.20)/.65))
    const l=Math.exp(-Math.pow((original.x+.47)/.25,2)),r=Math.exp(-Math.pow((original.x-.47)/.25,2))
    y-=band*(l*(.16+.045*(pose.walkStep||0))+r*(.16-.045*(pose.walkStep||0)))*(pose.footBlend??1)
    z+=band*(l+r)*.07*(pose.footBlend??1)
  }
  if(pose.idle){
    x*=pose.idle.scaleX;y=-1.02+(y+1.02)*pose.idle.scaleY;z*=pose.idle.scaleZ
    const upper=clamp((original.y+.90)/.95,0,1),a=(pose.idle.upperTwist||0)*upper*upper
    const nx=x*Math.cos(a)+z*Math.sin(a);z=z*Math.cos(a)-x*Math.sin(a);x=nx+(pose.idle.lean||0)*upper
  }
  return [x,y,z]
}
