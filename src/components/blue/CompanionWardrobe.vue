<script setup>
import {ref,nextTick,onMounted,onBeforeUnmount} from 'vue'
import {headwear,eyewear,chestwear,normalizeOutfit} from './companion/wardrobeState.js'
import {clampPosition,toRatio,fromRatio,loadPositions,savePositions} from './companion/wardrobePosition.js'
const props=defineProps({outfit:{type:Object,required:true},saved:{type:Boolean,default:true},disabled:Boolean})
const emit=defineEmits(['change','open-change'])
const open=ref(false),panel=ref(null),trigger=ref(null)
const teleportTarget=ref(null)
const categories=[{slot:'head',title:'头饰',items:headwear},{slot:'face',title:'眼镜',items:eyewear},{slot:'chest',title:'胸前',items:chestwear}]
const activeTab=ref('head'),panelPosition=ref(null),triggerPosition=ref(null),dragging=ref(''),positionSaved=ref(true)
let positions=loadPositions(),drag=null,suppressClickUntil=0,resizeFrame
const viewport=()=>({width:innerWidth,height:innerHeight})
const element=kind=>kind==='panel'?panel.value:trigger.value
const positionRef=kind=>kind==='panel'?panelPosition:triggerPosition
const positionStyle=position=>position?{left:`${position.x}px`,top:`${position.y}px`,right:'auto',bottom:'auto'}:undefined
function place(kind,useSaved=true){
  const el=element(kind);if(!el)return
  const box=el.getBoundingClientRect(),size={width:box.width,height:box.height}
  positionRef(kind).value=fromRatio(useSaved?positions[kind]:null,size,viewport())||clampPosition({x:box.x,y:box.y},size,viewport())
}
function persist(kind){
  const box=element(kind)?.getBoundingClientRect();if(!box)return
  positions[kind]=toRatio(positionRef(kind).value,{width:box.width,height:box.height},viewport())
  positionSaved.value=savePositions(positions)
}
function startDrag(kind,event){
  if(event.button!==0||event.isPrimary===false||event.target.closest('.wardrobe-close'))return
  const el=element(kind),box=el.getBoundingClientRect()
  drag={kind,id:event.pointerId,owner:event.currentTarget,x:event.clientX,y:event.clientY,origin:{x:box.x,y:box.y},size:{width:box.width,height:box.height},moved:false}
  event.currentTarget.setPointerCapture(event.pointerId)
  if(kind==='panel')event.preventDefault()
}
function moveDrag(event){
  if(!drag||drag.id!==event.pointerId)return
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y
  if(!drag.moved&&Math.hypot(dx,dy)<5)return
  drag.moved=true;dragging.value=drag.kind;event.preventDefault()
  positionRef(drag.kind).value=clampPosition({x:drag.origin.x+dx,y:drag.origin.y+dy},drag.size,viewport())
}
function endDrag(event){
  if(!drag||event&&drag.id!==event.pointerId)return
  const ending=drag;drag=null;dragging.value=''
  if(ending.moved){persist(ending.kind);if(ending.kind==='trigger')suppressClickUntil=performance.now()+250}
  if(ending.owner.hasPointerCapture(ending.id))ending.owner.releasePointerCapture(ending.id)
}
function triggerClick(event){if(event.detail&&performance.now()<suppressClickUntil)return;toggle()}
function moveByKey(kind,event){
  if(event.target!==event.currentTarget||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return
  event.preventDefault();event.stopPropagation();place(kind,false)
  const p=positionRef(kind).value,box=element(kind).getBoundingClientRect(),step=event.shiftKey?32:12
  const dx=event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0,dy=event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0
  positionRef(kind).value=clampPosition({x:p.x+dx,y:p.y+dy},{width:box.width,height:box.height},viewport());persist(kind)
}
async function selectTab(slot){activeTab.value=slot;await nextTick();place('panel',false)}
async function tabKeys(event){
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return
  event.preventDefault()
  const index=categories.findIndex(item=>item.slot===activeTab.value),next=event.key==='Home'?0:event.key==='End'?categories.length-1:(index+(event.key==='ArrowRight'?1:-1)+categories.length)%categories.length
  await selectTab(categories[next].slot);panel.value?.querySelector('[role=tab][aria-selected=true]')?.focus()
}
async function resetPositions(){
  endDrag();positions={trigger:null,panel:null};positionSaved.value=savePositions(positions)
  triggerPosition.value=null;panelPosition.value=null;await nextTick();place('trigger');place('panel')
}
function resize(){endDrag();cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{place('trigger');place('panel')})}
async function toggle(value=!open.value,restoreFocus=false){
  endDrag()
  open.value=value;emit('open-change',value)
  await nextTick()
  if(value){place('panel');panel.value?.querySelector('button')?.focus({preventScroll:true})}
  else if(restoreFocus)trigger.value?.focus({preventScroll:true})
}
function choose(slot,id){if(props.outfit[slot]!==id)emit('change',{...props.outfit,[slot]:id})}
function outside(event){if(open.value&&!panel.value?.contains(event.target)&&!trigger.value?.contains(event.target))toggle(false)}
function keydown(event){if(open.value&&event.key==='Escape'){event.preventDefault();toggle(false,true)}}
onMounted(()=>{teleportTarget.value=trigger.value?.closest('.blue-experience');place('trigger');document.addEventListener('pointerdown',outside);document.addEventListener('keydown',keydown);window.addEventListener('resize',resize)})
onBeforeUnmount(()=>{endDrag();cancelAnimationFrame(resizeFrame);document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',keydown);window.removeEventListener('resize',resize)})
</script>

<template>
  <Teleport :to="teleportTarget||'body'" :disabled="!teleportTarget">
  <div class="companion-wardrobe" :data-dragging="dragging" @pointerdown.stop @wheel.stop>
    <button ref="trigger" type="button" class="wardrobe-trigger" :style="positionStyle(triggerPosition)" :disabled="disabled" :aria-expanded="open" aria-controls="companion-wardrobe-panel" title="点击打开；拖动或使用方向键移动" @click="triggerClick" @pointerdown="startDrag('trigger',$event)" @pointermove="moveDrag" @pointerup="endDrag" @pointercancel="endDrag" @lostpointercapture="endDrag" @keydown="moveByKey('trigger',$event)">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6a2 2 0 1 1 3 1.7v2l7 5a1 1 0 0 1-.6 1.8H4.6A1 1 0 0 1 4 14.7l7-5"/></svg>
      <span>装扮盒</span>
    </button>
    <Transition name="wardrobe-panel">
      <section v-if="open" id="companion-wardrobe-panel" ref="panel" class="wardrobe-panel" :style="positionStyle(panelPosition)" role="dialog" aria-labelledby="wardrobe-title" :aria-modal="false">
        <header tabindex="0" role="group" aria-label="移动装扮盒：可拖动，也可使用方向键" @pointerdown="startDrag('panel',$event)" @pointermove="moveDrag" @pointerup="endDrag" @pointercancel="endDrag" @lostpointercapture="endDrag" @keydown="moveByKey('panel',$event)"><div><p>⠿ 拖动这里 · 自由摆放</p><h2 id="wardrobe-title">给软团换个心情</h2></div><button type="button" class="wardrobe-close" aria-label="关闭装扮盒" @click="toggle(false,true)">×</button></header>
        <p class="wardrobe-intro">挑一件小装饰，它会侧过身给你看看。</p>
        <div class="wardrobe-tabs" role="tablist" aria-label="装扮分类"><button v-for="category in categories" :id="`wardrobe-tab-${category.slot}`" :key="category.slot" type="button" role="tab" :aria-selected="activeTab===category.slot" :aria-controls="`wardrobe-slot-${category.slot}`" :tabindex="activeTab===category.slot?0:-1" @click="selectTab(category.slot)" @keydown="tabKeys">{{category.title}}<span v-if="outfit[category.slot]!=='none'" aria-hidden="true">·</span></button></div>
        <fieldset v-for="category in categories.filter(item=>item.slot===activeTab)" :id="`wardrobe-slot-${category.slot}`" :key="category.slot" role="tabpanel" :aria-labelledby="`wardrobe-tab-${category.slot}`">
          <legend class="sr-only">{{category.title}}</legend>
          <div class="wardrobe-options" :class="{'wardrobe-options--face':category.slot==='face'}">
            <button v-for="item in category.items" :key="item.id" type="button" :aria-label="item.name" :aria-pressed="outfit[category.slot]===item.id" @click="choose(category.slot,item.id)">
              <svg viewBox="0 0 60 40" aria-hidden="true" class="wardrobe-item-icon" :data-icon="item.icon">
                <g v-if="item.icon==='none'"><circle cx="30" cy="20" r="10"/><path d="m23 27 14-14"/></g>
                <g v-else-if="item.icon==='crown'"><path d="m13 13 10 7 7-13 7 13 10-7-4 19H17Z"/><path d="M17 28h26"/></g>
                <g v-else-if="item.icon==='bow'"><path d="M27 17C8 3 9 32 27 23M33 17C52 3 51 32 33 23M26 23l-5 12 8-4M34 23l5 12-8-4"/><rect x="26" y="16" width="8" height="9" rx="3"/></g>
                <g v-else-if="item.icon==='beret'"><path d="M12 25c-5-14 25-22 35-8 9 14-17 12-35 8Z"/><path d="m31 9 2-5M16 27c5 7 19 6 26 1"/></g>
                <g v-else-if="item.icon==='cap'"><path d="M13 25C9 5 44 4 44 25Z"/><path d="M32 25c9-1 21 0 21 5-9 2-18 0-21-5ZM28 10c6 1 8 7 8 15"/></g>
                <g v-else-if="item.icon==='sprout'"><path d="M30 34V20M30 23C12 25 11 8 14 9c13-1 17 8 16 14ZM30 18C29 5 46 4 47 7c-1 10-8 14-17 11Z"/></g>
                <g v-else-if="item.icon==='scarf'"><path d="M12 12c8 4 28 4 36 0v10c-8 5-28 5-36 0ZM22 24l-3 12h10l3-11M36 25l2 8h8l-4-9M20 32h10"/></g>
                <g v-else-if="item.icon==='star'"><path d="m30 5 5 10 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2Z"/><circle cx="30" cy="22" r="2"/></g>
                <g v-else-if="item.icon==='round'"><circle cx="19" cy="21" r="9"/><circle cx="41" cy="21" r="9"/><path d="M28 20q2-3 4 0M10 19l-5-4M50 19l5-4"/></g>
                <g v-else-if="item.icon==='sunglasses'"><path d="M8 14h19l-2 13q-13 8-17-4ZM33 14h19v9q-4 12-17 4Z"/><path d="M27 17h6M8 16l-4-3M52 16l4-3"/></g>
              </svg>
              <span>{{item.name}}</span><span v-if="outfit[category.slot]===item.id" class="wardrobe-selected" aria-hidden="true">✓</span>
            </button>
          </div>
        </fieldset>
        <footer><div class="wardrobe-actions"><button type="button" class="wardrobe-reset" :disabled="outfit.head==='none'&&outfit.face==='none'&&outfit.chest==='none'" @click="emit('change',normalizeOutfit(null))">一键脱下</button><button type="button" class="wardrobe-reset" @click="resetPositions">位置复原</button></div><p role="status">{{saved&&positionSaved?'装扮和位置只记在这台浏览器里。':'已更新；浏览器暂不允许保存，刷新后可能重置。'}}</p></footer>
      </section>
    </Transition>
  </div>
  </Teleport>
</template>

<style scoped>
.companion-wardrobe{position:fixed;inset:0;z-index:20;pointer-events:none;font-family:var(--font-ui);color:#4c5279}
button{font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}button:focus-visible{outline:2px solid #8b76bd;outline-offset:3px}button:disabled{cursor:default;opacity:.45}
.wardrobe-trigger{position:fixed;right:24px;bottom:44px;pointer-events:auto;touch-action:none;user-select:none;display:flex;align-items:center;gap:7px;padding:9px 13px;background:#fcfdfff2;border:1px solid #ddd8ed;border-radius:30px;color:#79629d;font-size:11px;box-shadow:0 4px 18px #7978a00a;transition:background .2s,border-color .2s;cursor:grab}
.wardrobe-trigger:hover{background:#f0ecfa;border-color:#b9a7d7}.wardrobe-trigger svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}
.wardrobe-panel{position:fixed;right:calc(48vw + 36px);bottom:96px;box-sizing:border-box;width:320px;max-width:calc(100vw - 24px);max-height:calc(100svh - 24px);overflow:auto;overscroll-behavior:contain;pointer-events:auto;background:#fcfdfffa;border:1px solid #ded9ee;border-radius:18px;padding:22px;box-shadow:0 16px 50px #343c7114;backdrop-filter:blur(12px)}
header{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;touch-action:none;user-select:none;cursor:grab;border-radius:6px}header p{font-size:9px;letter-spacing:.08em;color:#9385ac;margin:0 0 8px}header:focus-visible{outline:2px solid #b9a7d7;outline-offset:5px}.companion-wardrobe[data-dragging=panel] header,.companion-wardrobe[data-dragging=trigger] .wardrobe-trigger{cursor:grabbing}h2{font:400 19px/1.5 var(--font-serif-cn);color:#38496b;margin:0}.wardrobe-close{border:0;background:none;color:#9383aa;font:22px/1 sans-serif;padding:0 2px}
.wardrobe-intro{font:11px/1.8 var(--font-serif-cn);color:#8d8ba6;margin:10px 0 22px}fieldset{min-width:0;padding:0;border:0;margin:0 0 22px}legend{font-size:10px;letter-spacing:.06em;color:#6a6e91;margin-bottom:10px}
.wardrobe-tabs{display:flex;gap:5px;margin-bottom:15px;padding:4px;background:#f2f3fa;border-radius:9px}.wardrobe-tabs button{flex:1;border:0;border-radius:6px;padding:7px;color:#9890a6;background:transparent;font-size:11px}.wardrobe-tabs button[aria-selected=true]{background:#fff;color:#785c9e;box-shadow:0 2px 7px #68628c0a}.wardrobe-tabs span{margin-left:4px}.sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.wardrobe-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.wardrobe-options button{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;min-height:72px;border:1px solid #e5e4ef;border-radius:10px;background:#f6f8fc;color:#8586a0;padding:9px 4px;font-size:10px;transition:background .2s,border-color .2s,transform .2s}.wardrobe-options button:hover{border-color:#bdb0db;transform:translateY(-2px)}.wardrobe-options button[aria-pressed=true]{color:#795ba9;background:#f0ebfa;border-color:#c3b0e0}
.wardrobe-item-icon{width:53px;height:35px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.wardrobe-item-icon[data-icon=crown]{color:#b79a54;fill:#f6ecd2}.wardrobe-item-icon[data-icon=bow]{color:#9b78b9;fill:#e7d9f3}.wardrobe-item-icon[data-icon=beret]{color:#8774ad;fill:#dcd4eb}.wardrobe-item-icon[data-icon=sunglasses]{fill:#697394;stroke:#5a6484}.wardrobe-item-icon[data-icon=none]{opacity:.5}.wardrobe-selected{position:absolute;right:7px;top:5px;font-size:9px}
footer{border-top:1px solid #e8e5f1;padding-top:14px}.wardrobe-actions{display:flex;justify-content:space-between;gap:16px}.wardrobe-reset{border:0;background:transparent;padding:0;color:#8165aa;font-size:10px;text-decoration:underline;text-underline-offset:4px}footer p{color:#9995aa;font:10px/1.8 var(--font-serif-cn);margin:12px 0 0}
.wardrobe-panel-enter-active,.wardrobe-panel-leave-active{transition:opacity .18s}.wardrobe-panel-enter-from,.wardrobe-panel-leave-to{opacity:0}
@media(max-width:1100px){.wardrobe-panel{left:16px;right:auto;bottom:230px}}
@media(max-width:650px){.wardrobe-trigger{right:16px;bottom:35px}.wardrobe-panel{left:16px;right:auto;top:140px;bottom:auto;width:min(358px,calc(100vw - 32px));padding:16px}h2{font-size:17px}.wardrobe-intro{display:none}header{margin-bottom:14px}fieldset{margin-bottom:14px}.wardrobe-tabs{margin-bottom:12px}.wardrobe-options{gap:5px}.wardrobe-options button{min-height:60px;font-size:9px;padding:6px 2px}.wardrobe-item-icon{width:44px;height:28px}footer{padding-top:10px}footer p{font-size:9px;margin-top:9px}}
@media(prefers-reduced-motion:reduce){.wardrobe-trigger,.wardrobe-options button,.wardrobe-panel-enter-active,.wardrobe-panel-leave-active{transition:none}.wardrobe-trigger:hover,.wardrobe-options button:hover{transform:none}}
</style>
