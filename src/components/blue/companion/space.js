import {chooseIdleAction,chooseReadingIdleAction} from './idleActions.js'
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v))
const ease=t=>t*t*(3-2*t)
export function companionLayout({width:w,height:h,home,left,column}){
  const mobile=w<=1100,header=w<=650?130:mobile?125:100
  if(home){
    const small=w<=650
    const tank={left:w*(small?.42:.535),right:w*.975,top:h*(small?.615:.215),bottom:h*(small?.92:.845)}
    const size=Math.min(400,(tank.right-tank.left)*.72,(tank.bottom-tank.top)*.70)
    const r=size/2+12
    return {home:true,width:w,height:h,size,tank,column:null,mobile,
      anchor:{x:(tank.left+tank.right)/2,y:(tank.top+tank.bottom)/2+size*.04},
      bounds:{left:tank.left+r,right:tank.right-r,top:tank.top+r,bottom:tank.bottom-r}}
  }
  const size=mobile?Math.min(110,w*.27):Math.min(180,w*.13),r=size/2
  const obstacle=mobile?{left:0,right:w,top:header,bottom:h-(w<=650?165:205)}:
    {left:column?.left??(w-680)/2,right:column?.right??(w+680)/2,top:header,bottom:h-42}
  const bounds={left:r+12,right:w-r-12,top:mobile?obstacle.bottom+r+5:header+r+12,bottom:h-r-43}
  return {home:false,width:w,height:h,size,tank:null,column:obstacle,mobile,
    anchor:{x:mobile?w-r-24:left?obstacle.left/2:(obstacle.right+w)/2,y:mobile?(bounds.top+bounds.bottom)/2:h*.58},bounds}
}

// Pixel-space motion is independent of the camera and of the local gel skin.
// A route changes the target, never the current position in its first frame.
export class CompanionSpace{
  constructor(layout,random=Math.random){this.random=random;this.layout=layout;this.x=layout.anchor.x;this.y=layout.anchor.y;this.size=layout.size;this.vx=0;this.vy=0;this.drag=null;this.travel=null;this.contact=null;this.clock=0;this.lastInteraction=0;this.nextRoam=layout.home?5:24}
  interact(){this.lastInteraction=this.clock;this.nextRoam=this.clock+(this.layout.home?4:24);if(this.travel?.roaming)this.travel=null}
  setLayout(layout,animate=true){
    this.interact()
    const previous=this.layout;this.layout=layout
    this.nextRoam=this.clock+(layout.home?5:24)
    if(!animate){this.travel=null;this.drag=null;this.contact=null;this.x=clamp(this.x,layout.bounds.left,layout.bounds.right);this.y=clamp(this.y,layout.bounds.top,layout.bounds.bottom);this.size=layout.size;return}
    this.drag=null;this.contact=null;this.vx=0;this.vy=0
    const distance=Math.hypot(layout.anchor.x-this.x,layout.anchor.y-this.y)
    this.travel={kind:'walking',time:0,duration:clamp(distance/340,1.2,3),from:{x:this.x,y:this.y,size:this.size},to:{...layout.anchor,size:layout.size},arc:Math.min(layout.height-60,Math.max(this.y,layout.anchor.y)+110)}
    if(previous.home&&layout.home)this.travel.arc=(this.y+layout.anchor.y)/2
  }
  begin(pointer,willing=true){
    this.interact()
    if(this.travel)return false
    this.contact=null;this.vx=0;this.vy=0
    this.drag={start:{...pointer},anchor:{x:this.x,y:this.y},target:{x:this.x,y:this.y},willing,boundary:this.random()<.5?'wall':'portal'}
    return true
  }
  move(pointer){
    if(!this.drag||this.travel)return
    const d=this.drag,l=this.layout,r=this.size/2
    let x=d.anchor.x+pointer.x-d.start.x,y=d.anchor.y+pointer.y-d.start.y
    this.contact=null
    if(!d.willing)return
    x=clamp(x,l.bounds.left,l.bounds.right);y=clamp(y,l.bounds.top,l.bounds.bottom)
    const c=l.column
    if(c){
      const touch=l.mobile?pointer.y-d.start.y< -12&&y-r<=c.bottom+8:
        y+r>c.top&&y-r<c.bottom&&((d.anchor.x<c.left&&x+r>=c.left)||(d.anchor.x>c.right&&x-r<=c.right))
      if(touch){
        const side=l.mobile?'bottom':d.anchor.x<c.left?'left':'right'
        const cx=side==='left'?c.left:side==='right'?c.right:x,cy=side==='bottom'?c.bottom:y
        if(d.boundary==='portal'){
          d.entering=side
          if(side==='bottom')y=Math.max(c.bottom+r-this.size/3-2,d.anchor.y+pointer.y-d.start.y)
          else x=side==='left'?Math.min(x,c.left-r+this.size/3+2):Math.max(x,c.right+r-this.size/3-2)
          d.target={x,y};return
        }
        const stop=side==='left'?c.left-r-3:side==='right'?c.right+r+3:c.bottom+r+5
        const pressure=side==='bottom'?Math.abs(pointer.y-d.start.y)/100:Math.abs(x-stop)/100
        if(side==='bottom')y=stop;else x=stop
        this.contact={x:cx,y:cy,side,strength:clamp(pressure,.15,1),kind:'wall'}
      }
    }
    d.target={x,y}
  }
  end(){
    if(this.drag?.entering&&!this.travel){const c=this.layout.column,r=this.size/2,side=this.drag.entering;if(side==='bottom')this.y=Math.max(this.y,c.bottom+r+5);else this.x=side==='left'?Math.min(this.x,c.left-r):Math.max(this.x,c.right+r)}
    this.drag=null;if(!this.travel)this.contact=null;this.lastInteraction=this.clock;this.nextRoam=this.clock+(this.layout.home?4:24)
  }
  tick(dt,reduced=false){
    dt=clamp(dt,0,.033);this.clock+=dt
    if(!reduced&&!this.drag&&!this.travel&&this.clock-this.lastInteraction>=(this.layout.home?3:24)&&this.clock>=this.nextRoam){
      const l=this.layout,b=l.bounds,c=l.column,r=this.size/2
      let min=b.left,max=b.right
      if(c&&!l.mobile){if(this.x<l.width/2)max=c.left-r-8;else min=c.right+r+8}
      const action=(l.home?chooseIdleAction:chooseReadingIdleAction)(this.random,this.lastAction)
      this.lastAction=action
      const to=action==='walking'?{x:min+this.random()*Math.max(0,max-min),y:b.top+this.random()*(b.bottom-b.top),size:this.size}:{x:this.x,y:this.y,size:this.size}
      const baseDuration=action==='walking'?clamp(Math.hypot(to.x-this.x,to.y-this.y)/(l.home?110:85),l.home?1.5:2,l.home?3:4):l.home?(action==='lie'||action==='melt'?3.2:2.8):action==='lie'?6:action==='melt'?5:action==='spin'?3.5:4
      const duration=baseDuration*1.12
      this.travel={kind:action==='walking'?'walking':'idle-action',action,roaming:true,time:0,duration,from:{x:this.x,y:this.y,size:this.size},to,arc:action==='walking'?(this.y+to.y)/2+12:this.y};this.nextRoam=this.clock+duration+(l.home?8+this.random()*8:24+this.random()*16)
    }
    if(this.travel){
      const t=this.travel;t.time+=dt
      const f=clamp(t.time/t.duration,0,1),p=ease(f)
      this.x=t.from.x+(t.to.x-t.from.x)*p
      this.y=(1-p)**2*t.from.y+2*(1-p)*p*t.arc+p*p*t.to.y
      this.size=t.from.size+(t.to.size-t.from.size)*p
      if(f===1){this.travel=null;this.contact=null}
    }else{
      if(this.drag?.willing){const a=1-Math.exp(-25*dt);this.vx=(this.drag.target.x-this.x)*a/Math.max(dt,.001);this.vy=(this.drag.target.y-this.y)*a/Math.max(dt,.001)}
      else {this.vx*=Math.exp(-7*dt);this.vy*=Math.exp(-7*dt)}
      this.x+=this.vx*dt;this.y+=this.vy*dt
      const b=this.layout.bounds
      const c=this.layout.column,r=this.size/2
      this.x=clamp(this.x,b.left,b.right);this.y=clamp(this.y,this.drag?.entering==='bottom'?c.bottom+r-this.size/3-2:b.top,b.bottom)
      if(c&&this.drag?.entering){
        const side=this.drag.entering,depth=side==='bottom'?c.bottom-(this.y-r):side==='left'?this.x+r-c.left:c.right-(this.x-r)
        if(depth>=this.size/3){
          const targetX=this.layout.mobile?(this.x<this.layout.width/2?b.right:b.left):side==='left'?c.right+r+16:c.left-r-16
          this.travel={kind:'portal',time:0,duration:1.35,from:{x:this.x,y:this.y,size:this.size},to:{x:clamp(targetX,b.left,b.right),y:this.layout.mobile?this.layout.anchor.y:this.y,size:this.size},arc:this.layout.mobile?c.bottom-r-20:this.y,side}
          this.contact={x:side==='left'?c.left:side==='right'?c.right:this.x,y:side==='bottom'?c.bottom:this.y,side,strength:1,kind:'portal'};this.drag=null
        }
      }
      if(c&&!this.drag?.entering&&!this.travel&&!this.layout.mobile&&this.y+r>c.top&&this.y-r<c.bottom&&this.x+r>c.left&&this.x-r<c.right){
        this.x=this.x<(c.left+c.right)/2?c.left-r-3:c.right+r+3;this.vx=0
      }
    }
    let contact=this.contact
    if(contact?.kind==='wall'){
      const gap=contact.side==='bottom'?Math.abs(this.y-this.size/2-contact.y):Math.abs(this.x+(contact.side==='left'?1:-1)*this.size/2-contact.x)
      if(gap>18)contact=null
    }
    return {x:this.x,y:this.y,size:this.size,state:this.travel?.kind||'free',action:this.travel?.action||'',actionProgress:this.travel?this.travel.time/this.travel.duration:0,roaming:Boolean(this.travel?.roaming),contact,step:!reduced&&this.travel?.kind==='walking'?Math.sin(this.clock*13):0,vx:this.vx,vy:this.vy}
  }
}
