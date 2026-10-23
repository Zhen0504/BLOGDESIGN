export const POSITION_KEY='zhen-companion-wardrobe-position-v1'
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v))
const margin=12
const span=(size,viewport)=>({x:Math.max(0,viewport.width-size.width-margin*2),y:Math.max(0,viewport.height-size.height-margin*2)})
export function clampPosition(point,size,viewport){
  const range=span(size,viewport)
  return {x:clamp(point.x,margin,margin+range.x),y:clamp(point.y,margin,margin+range.y)}
}
export function toRatio(point,size,viewport){
  const range=span(size,viewport),p=clampPosition(point,size,viewport)
  return {x:range.x?(p.x-margin)/range.x:0,y:range.y?(p.y-margin)/range.y:0}
}
export function fromRatio(ratio,size,viewport){
  if(!ratio||!Number.isFinite(ratio.x)||!Number.isFinite(ratio.y))return null
  const range=span(size,viewport)
  return {x:margin+clamp(ratio.x,0,1)*range.x,y:margin+clamp(ratio.y,0,1)*range.y}
}
function normalize(value){
  const result={trigger:null,panel:null}
  for(const key of Object.keys(result))if(Number.isFinite(value?.[key]?.x)&&Number.isFinite(value?.[key]?.y))result[key]={x:clamp(value[key].x,0,1),y:clamp(value[key].y,0,1)}
  return result
}
export function loadPositions(storage){
  try{return normalize(JSON.parse((storage??globalThis.localStorage)?.getItem(POSITION_KEY)||'null'))}catch{return normalize(null)}
}
export function savePositions(value,storage){
  try{const target=storage??globalThis.localStorage;if(!target)return false;target.setItem(POSITION_KEY,JSON.stringify(normalize(value)));return true}catch{return false}
}
