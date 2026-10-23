// Observe pointer motion only; never alter the companion's drag physics.
export class ShakeDizziness {
  constructor(){this.clock=0;this.until=0;this.active=false;this.energy=0;this.sample=null;this.direction=null;this.fastAt=-Infinity;this.reverseAt=-Infinity}
  begin(x,y){
    this.active=true;this.energy=0;this.sample={x,y,time:this.clock};this.direction=null;this.fastAt=-Infinity;this.reverseAt=-Infinity
  }
  move(x,y,size){
    if(!this.active)return
    const previous=this.sample,dt=this.clock-previous.time
    if(dt<=0)return
    const dx=(x-previous.x)/Math.max(size,1),dy=(y-previous.y)/Math.max(size,1),distance=Math.hypot(dx,dy)
    this.sample={x,y,time:this.clock}
    if(dt>.15||distance/dt<2.5)return
    this.fastAt=this.clock
    if(distance>.001){
      const direction={x:dx/distance,y:dy/distance}
      if(this.direction&&direction.x*this.direction.x+direction.y*this.direction.y<-.25)this.reverseAt=this.clock
      this.direction=direction
    }
  }
  end(){this.active=false;this.energy=0;this.sample=null;this.direction=null}
  update(dt){
    this.clock+=Math.max(0,Math.min(dt,.05))
    const vigorous=this.active&&this.clock-this.fastAt<.12&&this.clock-this.reverseAt<.4
    this.energy=Math.max(0,Math.min(3,this.energy+(vigorous?dt:-dt*2)))
    if(vigorous&&this.energy>=3-.0001)this.until=this.clock+4
    return this.clock<this.until
  }
}
