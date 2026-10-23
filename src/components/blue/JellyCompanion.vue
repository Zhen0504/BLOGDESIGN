<script setup>
import { onMounted,onBeforeUnmount,ref,watch,nextTick } from 'vue'
import { createCompanion } from './companion/createCompanion.js'
import CompanionWardrobe from './CompanionWardrobe.vue'
import {loadOutfit,saveOutfit,normalizeOutfit} from './companion/wardrobeState.js'
const props=defineProps({home:Boolean,left:Boolean,reading:Boolean,pageKey:String})
const host=ref(null),failed=ref(false)
const outfit=ref(loadOutfit()),saved=ref(true)
let jelly
function getLayout(){
  const column=host.value?.closest('.blue-experience')?.querySelector('.blue-reading')?.getBoundingClientRect()
  return {home:props.home,left:props.left,column:column?{left:column.left,right:column.right}:null}
}
function changeOutfit(value){
  outfit.value=normalizeOutfit(value);saved.value=saveOutfit(outfit.value);jelly?.setOutfit(outfit.value)
}
onMounted(()=>{
  try{jelly=createCompanion(host.value,{getLayout,outfit:outfit.value})}catch(error){
    failed.value=true
    console.error('Physical jelly renderer could not initialize.',error)
  }
})
watch(()=>[props.home,props.left,props.pageKey],async()=>{await nextTick();jelly?.setPage()},{flush:'post'})
onBeforeUnmount(()=>jelly?.dispose())
</script>
<template>
  <div ref="host" class="jelly-companion" role="group" aria-label="果冻伙伴活动空间">
    <span v-if="failed" class="jelly-fallback">•ᴗ•</span>
    <CompanionWardrobe :outfit="outfit" :saved="saved" :disabled="failed" @change="changeOutfit" @open-change="jelly?.setWardrobeOpen($event)" />
  </div>
</template>
<style scoped>
.jelly-companion{position:fixed;inset:0;width:100%;height:100%;z-index:4;isolation:isolate;pointer-events:none;color:#2262b0}
.jelly-companion :deep(canvas){position:absolute;inset:0;z-index:1;display:block;width:100%;height:100%;pointer-events:none}
.jelly-companion :deep(.companion-hit){position:absolute;z-index:3;display:block;background:transparent;border:0;border-radius:48%;padding:0;margin:0;pointer-events:auto;cursor:grab;touch-action:none;-webkit-tap-highlight-color:transparent}
.jelly-companion :deep(.companion-hit:focus),.jelly-companion :deep(.companion-hit:focus-visible){outline:none;box-shadow:none}
.jelly-companion.dragging :deep(.companion-hit){cursor:grabbing}
.jelly-companion :deep(.companion-speech){position:absolute;z-index:4;width:max-content;max-width:min(220px,65vw);padding:10px 14px;border:1px solid #ddd6ec;border-radius:16px 16px 16px 3px;background:#fffffff0;color:#73658f;font:12px/1.8 var(--font-serif-cn);box-shadow:0 5px 20px #7963990a;pointer-events:none}
.jelly-companion :deep(.companion-tank){position:absolute;inset:0;width:100%;height:100%;z-index:2;overflow:visible;pointer-events:none}
.jelly-companion :deep(.companion-contact){position:absolute;z-index:2;border-radius:50%;background:radial-gradient(ellipse,#a4e5ffb3 0%,#59b5fb88 35%,#5ba2fa00 75%);box-shadow:0 0 12px #6cb9fb40;pointer-events:none}
.jelly-companion :deep(.companion-contact[data-kind=portal]){border:1px solid #83c8f6;background:radial-gradient(ellipse,#c4eaff88,#8bbffc44 45%,#8bbffc00 75%);animation:portal-breathe .7s ease-in-out infinite alternate}
.jelly-fallback{position:absolute;right:12vw;top:40vh;width:150px;height:145px;display:grid;place-items:center;border-radius:49% 45% 34% 37%;background:linear-gradient(135deg,#d1f0fe,#c7bafa);color:#345a76;font-size:22px}
@keyframes portal-breathe{to{filter:brightness(1.15);box-shadow:0 0 18px #6cb9fb65}}
@media(max-width:650px){.jelly-companion :deep(.companion-speech){font-size:10px;padding:8px 12px;max-width:185px}}
@media(prefers-reduced-motion:reduce){.jelly-companion :deep(.companion-contact){animation:none}}
</style>
