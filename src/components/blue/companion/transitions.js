const angleDelta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a))
export class PoseTransition{
  constructor(){this.value={scaleX:1,scaleY:1,scaleZ:1,roll:0,turn:0,pitch:0,upperTwist:0,lean:0,depth:0,lift:0,step:0}}
  update(target,dt,reduced=false){
    const neutral={scaleX:1,scaleY:1,scaleZ:1},a=reduced?1:1-Math.exp(-Math.min(dt,.05)*7)
    for(const key of Object.keys(this.value)){
      const goal=target?.[key]??neutral[key]??0
      const diff=['roll','turn','pitch','upperTwist'].includes(key)?angleDelta(this.value[key],goal):goal-this.value[key]
      this.value[key]+=diff*a
    }
    return {...this.value}
  }
}
export class ExpressionTransition{
  constructor(){this.current='calm';this.pending='calm';this.time=-1;this.hold=0;this.swapped=false}
  update(target,dt,reduced=false){
    this.pending=target;this.hold+=dt
    if(reduced){this.current=target;this.time=-1;return {id:target,openness:1}}
    if(this.time<0&&target!==this.current&&this.hold>=1.4){this.time=0;this.next=target;this.swapped=false}
    let openness=1
    if(this.time>=0){
      this.time+=dt
      if(this.time<.12)openness=Math.max(.015,1-this.time/.12)
      else{
        if(!this.swapped){this.current=this.next;this.swapped=true;this.hold=0}
        openness=Math.max(.015,Math.min(1,(this.time-.12)/.18))
      }
      if(this.time>=.30)this.time=-1
    }
    return {id:this.current,openness}
  }
}
