<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { DALIAN, distanceKm, fitVisitorView, projectLocation, validVisitorLocation, visitorGreeting } from './mapLocation'
import { visibleCityLabels } from './mapDetails'
const svg = ref(null)
const loaded = ref(false)
const failed = ref(false)
const scale = ref(3.2)
const offset = ref({ x: -2200, y: -204 })
const location = projectLocation(DALIAN)
const visitor = ref(null)
const visitorState = ref('loading')
const greetingChoice = Math.random()
const greeting = computed(() => visitorGreeting(visitor.value, greetingChoice))
const visitorName = computed(() => {
  if (!visitor.value) return ''
  const names = [visitor.value.country, visitor.value.city].filter(value => typeof value === 'string' && value)
  return names.join(' · ') || '未知城市'
})
const distance = computed(() => visitor.value ? distanceKm(DALIAN, visitor.value) : null)
const visitorMarker = computed(() => {
  if (!visitor.value) return null
  const position = projectLocation(visitor.value)
  return { x: position.x * scale.value + offset.value.x, y: position.y * scale.value + offset.value.y }
})
const connection = computed(() => {
  if (!visitorMarker.value) return ''
  const a = marker.value
  const b = visitorMarker.value
  const span = Math.hypot(b.x - a.x, b.y - a.y)
  if (span < 25) return ''
  return `M${a.x},${a.y} Q${(a.x + b.x) / 2},${Math.min(a.y, b.y) - Math.min(90, span * 0.22)} ${b.x},${b.y}`
})
const marker = computed(() => ({ x: location.x * scale.value + offset.value.x, y: location.y * scale.value + offset.value.y }))
const cityLabels = computed(() => visibleCityLabels(scale.value, offset.value, [marker.value, visitorMarker.value].filter(Boolean)))
const transform = computed(() => `translate(${offset.value.x} ${offset.value.y}) scale(${scale.value})`)
let drag = null
let userMoved = false
let lookupController = null
function showBoth() {
  if (!visitor.value) return home()
  const view = fitVisitorView(visitor.value)
  scale.value = view.scale
  offset.value = view.offset
}
async function loadVisitor() {
  lookupController = new AbortController()
  const timer = setTimeout(() => lookupController?.abort(), 8000)
  try {
    const response = await fetch('/api/location', { signal: lookupController.signal, cache: 'no-store' })
    const data = response.ok ? await response.json() : null
    if (!validVisitorLocation(data)) { visitorState.value = 'unavailable'; return }
    visitor.value = data
    visitorState.value = 'ready'
    // Keep the visitor's manual map movement if lookup took a while.
    if (!drag && !userMoved) showBoth()
  } catch {
    visitorState.value = 'unavailable'
  } finally {
    clearTimeout(timer)
    lookupController = null
  }
}
onMounted(loadVisitor)
onBeforeUnmount(() => lookupController?.abort())
function bound(x, y, zoom = scale.value) {
  return { x: Math.min(0, Math.max(1000 * (1 - zoom), x)), y: Math.min(0, Math.max(500 * (1 - zoom), y)) }
}
function home() {
  userMoved = true
  scale.value = 3.2
  offset.value = bound(500 - location.x * scale.value, 250 - location.y * scale.value)
}
function world() { userMoved = true; scale.value = 1; offset.value = { x: 0, y: 0 } }
function zoom(factor) {
  userMoved = true
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
  userMoved = true
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
    userMoved = true
    event.preventDefault()
    const [x, y] = moves[event.key]
    offset.value = bound(offset.value.x + x, offset.value.y + y)
  } else if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(1.3) }
  else if (event.key === '-') { event.preventDefault(); zoom(1 / 1.3) }
  else if (event.key === 'Home') { event.preventDefault(); home() }
}
home()
userMoved = false
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
          <image v-if="loaded && !failed" href="/maps/world-borders.svg" width="1000" height="500" class="map-borders" />
          <image v-if="loaded && !failed && scale >= 4" href="/maps/province-borders.svg" width="1000" height="500" class="map-provinces" />
        </g>
        <g v-if="loaded && !failed" class="city-labels" aria-hidden="true">
          <g v-for="city in cityLabels" :key="city.name" :transform="`translate(${city.x} ${city.y})`">
            <circle r="2" />
            <text x="8" y="4">{{ city.name }}</text>
          </g>
        </g>
        <g v-if="loaded && !failed && visitorMarker" class="visitor-pin">
          <path v-if="connection" :d="connection" class="visitor-connection" />
          <g :transform="`translate(${visitorMarker.x} ${visitorMarker.y})`">
            <circle r="17" fill="#7fd3bd" fill-opacity=".12" />
            <circle r="5" fill="#a9e2d1" stroke="#152b2b" stroke-width="2" />
            <rect x="14" y="19" width="58" height="26" rx="5" fill="#101f29" stroke="#527d76" />
            <text x="43" y="36" text-anchor="middle" fill="#c2eee1" font-size="11" letter-spacing="1">YOU</text>
          </g>
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
        <button v-if="visitor" type="button" @click="showBoth">你与我</button>
      </div>
      <span class="dalian-map__hint">拖动探索 · {{ scale.toFixed(1) }}×</span>
    </div>
    <div class="dalian-map__copy">
      <p class="dalian-map__eyebrow">A SMALL DOT, A PLACE TO BEGIN</p>
      <h2 id="dalian-map-title">我在<span>中国 · 大连</span></h2>
      <p class="dalian-map__latin">DALIAN, CHINA</p>
      <p class="dalian-map__description">海风抵达的地方，也是我目前生活与记录的坐标。</p>
      <p class="dalian-map__status" role="status" aria-live="polite">
        <template v-if="visitorState === 'ready'">你的大致位置：{{ visitorName }} · {{ distance < 25 ? '与大连相距不到 25 公里' : `与大连直线相距约 ${Math.round(distance / 10) * 10} 公里` }}</template>
        <template v-else-if="visitorState === 'loading'">正在估计访客所在城市…</template>
        <template v-else>暂时无法估计你的城市 · 大连坐标仍可查看</template>
      </p>
      <p v-if="visitorState === 'ready'" class="dalian-map__greeting">{{ greeting }}</p>
    </div>
    <div class="dalian-map__credit">
      <p class="dalian-map__privacy">根据网络出口估计，可能有误差；使用代理时可能显示代理所在地。仅在本站查询，不请求设备精确位置。</p>
      <p>陆地轮廓：<a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noopener noreferrer">Natural Earth</a> · <a href="https://db-ip.com" target="_blank" rel="noopener noreferrer">IP Geolocation by DB-IP</a> · 小比例尺位置展示，非导航地图</p>
    </div>
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
.map-borders { opacity: .55; pointer-events: none; }
.map-provinces { opacity: .35; pointer-events: none; }
.city-labels { pointer-events: none; fill: #a09db3; opacity: .72; font: 12px var(--font-serif-cn); }
.city-labels text { paint-order: stroke; stroke: #24283d; stroke-width: 3px; stroke-linejoin: round; }
.visitor-pin { pointer-events: none; }
.visitor-connection { fill: none; stroke: #8fcdbc; stroke-width: 1.5; stroke-dasharray: 5 6; opacity: .65; }
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
.dalian-map__status { color: #a9d4c7; font: 14px/1.9 var(--font-serif-cn); margin: 16px 0 0; overflow-wrap: anywhere; }
.dalian-map__greeting { color: #d3bbcf; font: 14px/1.9 var(--font-serif-cn); margin: 8px 0 0; overflow-wrap: anywhere; }
.dalian-map__credit { margin: 0; padding: 12px 20px; border-top: 1px solid #ffffff09; text-align: center; color: #888197; font: 9px/1.8 var(--font-ui); }
.dalian-map__credit p { margin: 0; }
.dalian-map__credit .dalian-map__privacy { max-width: 520px; margin: 0 auto 7px; }
.dalian-map__credit a { color: #afa2cf; }
@media(max-width: 650px) { .dalian-map { margin-top: 56px; } .dalian-map__hint { display: none; } .dalian-map__toolbar { bottom: 8px; right: 8px; } .dalian-map__toolbar button { min-height: 36px; padding-inline: 7px; } .dalian-map__top { padding: 12px; font-size: 8px; } }
@media(prefers-reduced-motion: reduce) { .pulse { animation: none; } }
</style>
