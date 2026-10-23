export const WARDROBE_KEY='zhen-companion-wardrobe-v1'
export const headwear=Object.freeze([
  {id:'none',name:'不戴头饰',icon:'none'},
  {id:'crown',name:'小皇冠',icon:'crown'},
  {id:'beret',name:'贝雷帽',icon:'beret'},
  {id:'cap',name:'棒球帽',icon:'cap'},
  {id:'sprout',name:'小叶芽',icon:'sprout'},
])
export const chestwear=Object.freeze([
  {id:'none',name:'不戴胸饰',icon:'none'},
  {id:'bow',name:'蝴蝶领结',icon:'bow'},
  {id:'scarf',name:'小围巾',icon:'scarf'},
  {id:'star',name:'星星胸针',icon:'star'},
])
export const eyewear=Object.freeze([
  {id:'none',name:'不戴眼镜',icon:'none'},
  {id:'round',name:'圆框眼镜',icon:'round'},
  {id:'sunglasses',name:'小墨镜',icon:'sunglasses'},
])
export function normalizeOutfit(value){
  return {
    head:headwear.some(item=>item.id===value?.head)?value.head:'none',
    face:eyewear.some(item=>item.id===value?.face)?value.face:'none',
    chest:chestwear.some(item=>item.id===value?.chest)?value.chest:value?.chest===undefined&&value?.head==='bow'?'bow':'none',
  }
}
export function loadOutfit(storage){
  try{return normalizeOutfit(JSON.parse((storage??globalThis.localStorage)?.getItem(WARDROBE_KEY)||'null'))}
  catch{return normalizeOutfit(null)}
}
export function saveOutfit(outfit,storage){
  try{
    const target=storage??globalThis.localStorage
    if(!target)return false
    target.setItem(WARDROBE_KEY,JSON.stringify(normalizeOutfit(outfit)))
    return true
  }catch{return false}
}
