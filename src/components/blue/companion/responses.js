const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t)}

// Small, interruptible responses layered over the existing motion and skin.
export class CompanionResponses {
  constructor(){this.sequence=null;this.awaySince=0;this.lastGreeting=-Infinity;this.wasDizzy=false;this.recoveryAt=null;this.serial=0}
  tap(now,side=-1,kind='tap'){
    if(this.wasDizzy||this.recoveryAt!==null||this.sequence&&now-this.sequence.start<1.4)return false
    this.sequence={kind,start:now,side:side<0?-1:1,id:++this.serial}
    return true
  }
  leave(now){if(this.awaySince===null)this.awaySince=now}
  enter(now,side=-1){
    const returning=this.awaySince!==null&&now-this.awaySince>=20&&now-this.lastGreeting>=30
    this.awaySince=null
    if(returning&&!this.wasDizzy&&this.recoveryAt===null&&!this.sequence){
      this.lastGreeting=now;this.sequence={kind:'return',start:now,side:side<0?-1:1,id:++this.serial}
    }
  }
  cancel(){this.sequence=null}
  update(now,{dizzy=false,busy=false,reduced=false}={}){
    if(dizzy){this.sequence=null;this.wasDizzy=true;this.recoveryAt=null;return {phase:'dizzy',expression:'dizzy',sway:1,blink:1}}
    if(this.wasDizzy){this.wasDizzy=false;this.recoveryAt=now;this.serial++}
    if(busy){this.sequence=null;this.recoveryAt=null;return {phase:'',blink:1}}
    if(this.recoveryAt!==null){
      const t=now-this.recoveryAt
      if(t<1.1){
        const blink=t<.10?1-t/.10:t<.22?0:Math.min(1,(t-.22)/.22)
        return {phase:'recovering',id:this.serial,expression:'calm',blink:reduced?1:blink,sway:reduced?0:1-smooth(t/1.1)}
      }
      this.recoveryAt=null
    }
    if(!this.sequence)return {phase:'',blink:1,sway:0}
    const s=this.sequence,t=now-s.start
    if(t>=3.2){this.sequence=null;return {phase:'',blink:1,sway:0}}
    const curious=t<1.65,envelope=smooth(t/.4)*(1-smooth((t-1.65)/1.1))
    return {phase:`${s.kind}-${curious?'curious':'happy'}`,id:s.id,expression:curious?'curious':'happy',blink:1,sway:0,
      pose:reduced?{}:{turn:s.side*.58*envelope,upperTwist:-s.side*.10*envelope,pitch:.055*envelope,lean:s.side*.035*envelope}}
  }
}
