<script setup>
import { computed, ref } from 'vue'
const svg = ref(null)
const loaded = ref(false)
const failed = ref(false)
const scale = ref(3.2)
const offset = ref({ x: -2200, y: -204 })
const location = { x: (121.614 + 180) / 360 * 1000, y: (90 - 38.914) / 180 * 500 }
const marker = computed(() => ({ x: location.x * scale.value + offset.value.x, y: location.y * scale.value + offset.value.y }))
const transform = computed(() => `translate(${offset.value.x} ${offset.value.y}) scale(${scale.value})`)
let drag = null
function bound(x, y, zoom = scale.value) {
  return { x: Math.min(0, Math.max(1000 * (1 - zoom), x)), y: Math.min(0, Math.max(500 * (1 - zoom), y)) }
}
function home() {
  scale.value = 3.2
  offset.value = bound(500 - location.x * scale.value, 250 - location.y * scale.value)
}
function world() { scale.value = 1; offset.value = { x: 0, y: 0 } }
function zoom(factor) {
  const next = Math.max(1, Math.min(8, scale.value * factor))
  const ratio = next / scale.value
  offset.value = bound(500 - (500 - offset.value.x) * ratio, 250 - (250 - offset.value.y) * ratio, next)
  scale.value = next
}
function point(event) {
  const matrix = svg.value?.getScreenCTM()
  return matrix ? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()) : null
}
function start(event) {
  if (event.button !== 0 || drag) return
  const p = point(event)
  if (!p) return
  drag = { id: event.pointerId, x: p.x, y: p.y, offset: { ...offset.value } }
  svg.value.setPointerCapture(event.pointerId)
}
function move(event) {
  if (!drag || event.pointerId !== drag.id) return
  const p = point(event)
  if (p) offset.value = bound(drag.offset.x + p.x - drag.x, drag.offset.y + p.y - drag.y)
}
function stop(event) {
  if (drag?.id !== event.pointerId) return
  if (svg.value?.hasPointerCapture(event.pointerId)) svg.value.releasePointerCapture(event.pointerId)
  drag = null
}
function key(event) {
  const moves = { ArrowLeft: [45, 0], ArrowRight: [-45, 0], ArrowUp: [0, 45], ArrowDown: [0, -45] }
  if (moves[event.key]) {
    event.preventDefault()
    const [x, y] = moves[event.key]
    offset.value = bound(offset.value.x + x, offset.value.y + y)
  } else if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(1.3) }
  else if (event.key === '-') { event.preventDefault(); zoom(1 / 1.3) }
  else if (event.key === 'Home') { event.preventDefault(); home() }
}
home()
</script>

<template>
  <section class="dalian-map" aria-labelledby="dalian-map-title">
    <div class="dalian-map__top"><span>CURRENT ORBIT / 01</span><span>121.614° E · 38.914° N</span></div>
    <div class="dalian-map__visual">
      <svg ref="svg" viewBox="0 0 1000 500" role="group" tabindex="0" aria-label="大连所在地地图，可拖动，方向键平移，加减键缩放，Home 回到大连"
        @pointerdown="start" @pointermove="move" @pointerup="stop" @pointercancel="stop" @lostpointercapture="drag = null" @keydown="key">
        <title>中国大连 · 陆地与海岸轮廓</title>
        <rect width="1000" height="500" fill="#0b1020" />
        <g :transform="transform">
          <path v-for="x in [0, 166.667, 333.333, 500, 666.667, 833.333, 1000]" :key="`lon${x}`" :d="`M${x},0V500`" class="grid" />
          <path v-for="y in [83.333, 166.667, 250, 333.333, 416.667]" :key="`lat${y}`" :d="`M0,${y}H1000`" class="grid" />
          <image :href="'/maps/world-land.svg'" width="1000" height="500" @load="loaded = true" @error="failed = true" />
        </g>
        <g v-if="loaded && !failed" :transform="`translate(${marker.x} ${marker.y})`" class="pin">
          <circle r="25" class="pulse" />
          <circle r="11" fill="#171b35" stroke="#b9a4ff" stroke-width="1.5" />
          <path d="M0,-9L6,0L0,9L-6,0Z" fill="#c9b8ff" />
          <path d="M14,0H32" stroke="#b9a4ff" stroke-width="1" />
          <rect x="32" y="-17" width="102" height="34" rx="6" fill="#11172a" fill-opacity=".94" stroke="#655e83" />
          <text x="83" y="5" text-anchor="middle" fill="#eee7ff" font-size="13" letter-spacing="2">DALIAN</text>
        </g>
      </svg>
      <div class="dalian-map__compass" aria-hidden="true">↑<br>N</div>
      <p v-if="failed" class="dalian-map__message" role="status">地图暂时无法加载，大连坐标信息仍可查看。</p>
      <p v-else-if="!loaded" class="dalian-map__message" role="status">正在加载本地地图…</p>
      <div class="dalian-map__toolbar" aria-label="地图控制">
        <button type="button" aria-label="放大地图" :disabled="scale >= 8" @click="zoom(1.3)">＋</button>
        <button type="button" aria-label="缩小地图" :disabled="scale <= 1" @click="zoom(1 / 1.3)">−</button>
        <button type="button" @click="world">世界视野</button>
        <button type="button" @click="home">回到大连</button>
      </div>
      <span class="dalian-map__hint">拖动探索 · {{ scale.toFixed(1) }}×</span>
    </div>
    <div class="dalian-map__copy">
      <p class="dalian-map__eyebrow">A SMALL DOT, A PLACE TO BEGIN</p>
      <h2 id="dalian-map-title">我在<span>中国 · 大连</span></h2>
      <p class="dalian-map__latin">DALIAN, CHINA</p>
      <p class="dalian-map__description">海风抵达的地方，也是我目前生活与记录的坐标。</p>
      <p class="dalian-map__status">访客定位尚未接入 · 暂不显示连线与距离</p>
    </div>
    <p class="dalian-map__credit">陆地轮廓：<a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noopener noreferrer">Natural Earth</a> · 本地 SVG · 小比例尺位置展示，非导航地图</p>
  </section>
</template>

<style scoped>
.dalian-map { margin-top: 76px; overflow: hidden; border: 1px solid rgba(190,179,242,.18); border-radius: 16px; background: #0c1020; }
.dalian-map__top { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 16px 22px; color: #aaa1c1; font: 9px/1.6 var(--font-ui); letter-spacing: .15em; }
.dalian-map__visual { position: relative; overflow: hidden; border-block: 1px solid rgba(190,179,242,.10); }
.dalian-map__visual svg { display: block; width: 100%; aspect-ratio: 2; touch-action: none; cursor: grab; }
.dalian-map__visual svg:active { cursor: grabbing; }
.dalian-map__visual svg:focus-visible { outline: 2px solid #b7a0ff; outline-offset: -3px; }
.grid { fill: none; stroke: #a698c8; stroke-opacity: .09; stroke-width: .7; vector-effect: non-scaling-stroke; }
.pin { pointer-events: none; }
.pulse { fill: #ab91ff; opacity: .14; transform-box: fill-box; transform-origin: center; animation: map-pulse 4s ease-in-out infinite; }
@keyframes map-pulse { 50% { transform: scale(1.3); opacity: .06; } }
.dalian-map__compass { position: absolute; top: 13px; right: 20px; color: #c0b5d8; text-align: center; font: 11px/1.6 var(--font-ui); pointer-events: none; }
.dalian-map__toolbar { position: absolute; bottom: 14px; right: 14px; display: flex; gap: 4px; }
.dalian-map__toolbar button { border: 1px solid #49425f; border-radius: 5px; background: #101629; color: #dfd5f7; min-height: 32px; min-width: 32px; padding: 5px 9px; font: 11px var(--font-ui); cursor: pointer; }
.dalian-map__toolbar button:disabled { opacity: .4; cursor: default; }
.dalian-map__toolbar button:focus-visible { outline: 2px solid #c3afff; }
.dalian-map__hint { position: absolute; left: 16px; bottom: 22px; color: #b2aac4; font: 10px var(--font-ui); pointer-events: none; }
.dalian-map__message { position: absolute; top: 40%; width: 100%; text-align: center; color: #d0c2ef; font-size: 13px; }
.dalian-map__copy { padding: 27px 24px 20px; text-align: center; }
.dalian-map__eyebrow { margin: 0 0 14px; color: #9b8bbf; font: 8px var(--font-ui); letter-spacing: .24em; }
.dalian-map h2 { margin: 0; font: 400 24px/1.5 var(--font-serif-cn); color: var(--color-text); }
.dalian-map h2 span { margin-left: 10px; color: #c6b5ff; }
.dalian-map__latin { color: #9d93b4; font: 10px var(--font-ui); letter-spacing: .22em; margin: 9px 0 20px; }
.dalian-map__description { color: var(--color-muted); font: 14px/1.9 var(--font-serif-cn); margin: 0; }
.dalian-map__status { color: #8a839f; font: 10px/1.8 var(--font-ui); margin: 13px 0 0; }
.dalian-map__credit { margin: 0; padding: 12px 20px; border-top: 1px solid #ffffff09; text-align: center; color: #888197; font: 9px/1.8 var(--font-ui); }
.dalian-map__credit a { color: #afa2cf; }
@media(max-width: 650px) { .dalian-map { margin-top: 56px; } .dalian-map__hint { display: none; } .dalian-map__toolbar { bottom: 8px; right: 8px; } .dalian-map__toolbar button { min-height: 36px; padding-inline: 7px; } .dalian-map__top { padding: 12px; font-size: 8px; } }
@media(prefers-reduced-motion: reduce) { .pulse { animation: none; } }
</style>
