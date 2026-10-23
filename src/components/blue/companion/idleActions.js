export const primaryIdleActions=['peek','sideLie','lookBack','pounce','sway','walking']
export const idleActions=[...primaryIdleActions,'melt','spin']
export function chooseIdleAction(random,last){
  const pool=[...primaryIdleActions,...primaryIdleActions,...primaryIdleActions,'melt','spin'].filter(id=>id!==last)
  return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))]
}
export function chooseReadingIdleAction(random,last){
  const pool=['peek','peek','peek','sideLie','lookBack','sway','walking','peek','sway','melt'].filter(id=>id!==last)
  return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))]
}
const smooth=(a,b,p)=>{const t=Math.max(0,Math.min(1,(p-a)/(b-a)));return t*t*(3-2*t)}
export function idlePose(action,progress){
  const p=Math.max(0,Math.min(1,progress)),e=Math.sin(Math.PI*p)**2
  const pose={scaleX:1,scaleY:1,scaleZ:1,roll:0,turn:0,pitch:0,upperTwist:0,lean:0,depth:0,lift:0,step:0,expression:'happy',action}
  if(action==='peek'){
    const turn=smooth(0,.25,p)*(1-smooth(.73,1,p)),lean=smooth(.18,.43,p)*(1-smooth(.65,.92,p))
    pose.turn=-1.05*turn;pose.upperTwist=.22*lean;pose.lean=-.16*lean;pose.pitch=.10*lean;pose.expression='curious'
  }
  if(action==='sideLie'){
    const settle=smooth(0,.35,p)*(1-smooth(.72,1,p))
    pose.turn=.95*settle;pose.roll=-.85*settle;pose.pitch=-.24*settle;pose.scaleY=1-.13*settle;pose.lean=.10*settle;pose.expression='shy'
  }
  if(action==='lookBack'){
    const away=smooth(0,.24,p)*(1-smooth(.80,1,p)),glance=smooth(.38,.58,p)*(1-smooth(.77,.94,p))
    pose.turn=2.65*away;pose.upperTwist=-1.62*glance;pose.depth=-.32*away;pose.step=Math.sin(p*Math.PI*10)*smooth(.15,.23,p)*(1-smooth(.36,.44,p));pose.expression=glance>.4?'playful':'curious'
  }
  if(action==='pounce'){
    const prep=smooth(0,.18,p)*(1-smooth(.20,.32,p)),jump=smooth(.23,.40,p)*(1-smooth(.66,.90,p))
    const land=Math.sin(Math.max(0,p-.66)*Math.PI*10)*(1-smooth(.66,1,p))
    pose.depth=-.20*prep+.72*jump;pose.lift=.25*jump;pose.pitch=.18*prep-.25*jump;pose.scaleY=1-.10*prep-.08*land;pose.scaleX=1+.05*prep+.04*land;pose.expression=jump>.3?'happy':'focused'
  }
  if(action==='sway'){
    const shift=Math.sin(p*Math.PI*4)*e
    pose.turn=.58*shift;pose.upperTwist=-.14*Math.sin((p-.08)*Math.PI*4)*e;pose.lean=.15*shift;pose.roll=-.10*shift;pose.step=shift;pose.expression='curious'
  }
  if(action==='melt'){pose.scaleX=1+e*.35;pose.scaleY=1-e*.42;pose.scaleZ=1+e*.15;pose.expression='sleepy'}
  if(action==='spin'){pose.turn=Math.PI*2*(p*p*(3-2*p));pose.expression='playful'}
  return pose
}
