<script setup>
import { RouterView } from 'vue-router'
import SiteRegistration from './components/layout/SiteRegistration.vue'
import { defineAsyncComponent, ref } from 'vue'
const BlueExperience = defineAsyncComponent(() => import('./views/BlueExperience.vue'))
let savedAppearance = 'blue'
try { savedAppearance = localStorage.getItem('zhen-appearance') || 'blue' } catch {}
const blue = ref(savedAppearance !== 'crystal')
function setAppearance(value) {
  blue.value = value
  document.documentElement.dataset.appearance = value ? 'blue' : 'crystal'
  document.documentElement.style.backgroundColor = value ? '#fcfdff' : '#030512'
  document.querySelector('meta[name="theme-color"]').content = value ? '#fcfdff' : '#030512'
  try { localStorage.setItem('zhen-appearance', value ? 'blue' : 'crystal') } catch {}
}
</script>

<template>
  <BlueExperience v-if="blue" />
  <RouterView v-else />
  <div class="appearance-switch" :class="{'appearance-switch--blue':blue}" role="group" aria-label="界面风格">
    <button :aria-pressed="!blue" @click="setAppearance(false)">CRYSTAL</button><span>/</span><button :aria-pressed="blue" @click="setAppearance(true)">BLUE</button>
  </div>
  <SiteRegistration />
</template>
<style>
.appearance-switch{position:fixed;right:4vw;top:35px;z-index:90;display:flex;gap:10px;align-items:center;color:#8d83a7;font:9px var(--font-ui);letter-spacing:.12em}.appearance-switch button{padding:6px 0;background:none;border:0;font:inherit;color:inherit;cursor:pointer}.appearance-switch button[aria-pressed=true]{color:#c7b7ff}.appearance-switch--blue{color:#7f92aa}.appearance-switch--blue button[aria-pressed=true]{color:#1b78d8}.appearance-switch--blue~.site-registration a{color:#7590ad;background:#fbfdffdb}.appearance-switch:not(.appearance-switch--blue){top:auto;bottom:30px}.appearance-switch--blue button:focus-visible{outline:1px solid #387bc3}
@media(max-width:650px){.appearance-switch{right:22px;top:58px;font-size:8px;gap:8px}}
</style>
