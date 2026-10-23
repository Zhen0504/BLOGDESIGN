<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
const canvas = ref(null)
let dispose
onMounted(() => {
  const surface = canvas.value, ctx = surface.getContext('2d')
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  let width, height, lines = [], frame, pointer = { x: 0, y: 0 }, focus={x:0,y:0}, lastMove=-Infinity
  function resize() {
    width = innerWidth; height = innerHeight
    const dpr = Math.min(devicePixelRatio, 2)
    surface.width = width * dpr; surface.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    focus={x:width*.6,y:height*.5}
    lines = Array.from({ length: width<650?34:60 }, (_, i) => {
      const x = ((i * 173 + 41) % 1000) / 1000 * width
      const y = ((i * 97 + 67) % 800) / 800 * height
      const direction = i % 2 ? 1 : -1
      const spread=.7+(i%5)*.12
      return [[x, y], [x + direction * 65*spread, y], [x + direction * 100*spread, y + 35], [x + direction * 100*spread, y + 140], [x + direction * 145*spread, y + 185], [x + direction * 225*spread, y + 185]]
    })
    surface.dataset.traceCount=String(lines.length)
  }
  function draw(time) {
    ctx.clearRect(0, 0, width, height)
    const following=time-lastMove<1600
    const target=motion.matches?{x:width*.5,y:height*.5}:following?pointer:{x:width*(.5+.35*Math.sin(time/7300)),y:height*(.5+.34*Math.cos(time/9100))}
    focus.x+=(target.x-focus.x)*.045;focus.y+=(target.y-focus.y)*.045
    surface.dataset.fieldMode=motion.matches?'reduced':following?'pointer':'autonomous'
    surface.dataset.focusX=focus.x.toFixed(1);surface.dataset.focusY=focus.y.toFixed(1)
    lines.forEach((points, i) => {
      ctx.beginPath(); points.forEach(([x, y], n) => n ? ctx.lineTo(x, y) : ctx.moveTo(x, y))
      // Different copper layers have different visual weights; most stay quiet.
      const layer=(i*7)%10
      const tone=layer<4?.14:layer<7?.23:layer<9?.32:.43
      ctx.lineWidth = layer<4?.6:layer<7?.75:layer<9?.9:1.05
      ctx.strokeStyle = `rgba(126,136,155,${tone})`; ctx.setLineDash([]); ctx.stroke()
      const near = Math.max(0, 1 - Math.min(...points.map(([x,y]) => Math.hypot(x-focus.x,y-focus.y))) / 310)
      const breath = motion.matches ? .06 : (.5 + .5 * Math.sin(time / 2200 + i * .83)) ** 5 * .23
      const gradient=ctx.createLinearGradient(points[0][0],points[0][1],points.at(-1)[0],points.at(-1)[1])
      gradient.addColorStop(0,`rgba(74,138,225,${breath+near*.5})`);gradient.addColorStop(1,`rgba(143,89,211,${breath+near*.6})`)
      ctx.strokeStyle = gradient
      ctx.lineWidth = 1.1; ctx.setLineDash([48, 310]); ctx.lineDashOffset = motion.matches ? 0 : -time / 21 - i * 38; ctx.stroke()
      ctx.setLineDash([])
      if(!motion.matches && near>.05) {
        const glow=ctx.createRadialGradient(focus.x,focus.y,5,focus.x,focus.y,270)
        glow.addColorStop(0,'rgba(131,95,219,.48)');glow.addColorStop(.4,'rgba(91,134,229,.2)');glow.addColorStop(1,'rgba(91,134,229,0)')
        ctx.strokeStyle=glow;ctx.lineWidth=1.3;ctx.stroke()
      }
      // Linework only: branches and paired lanes, without component symbols.
      ctx.strokeStyle=`rgba(128,139,158,${tone*.85})`;ctx.lineWidth=.65
      if(i%2===0){
        const [x,y]=points[3],side=i%2?1:-1
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+side*32,y);ctx.lineTo(x+side*52,y-20);ctx.lineTo(x+side*52,y-48);ctx.stroke()
      }
      if(i%4===1){
        const lanes=i%3===0?3:1
        for(let lane=1;lane<=lanes;lane++){
          ctx.beginPath();points.slice(0,4).forEach(([x,y],n)=>n?ctx.lineTo(x+5*lane,y-5*lane):ctx.moveTo(x+5*lane,y-5*lane));ctx.stroke()
        }
      }
      if(i%7===3){
        const [x,y]=points[0]
        ctx.beginPath();ctx.moveTo(x-29,y-19);ctx.lineTo(x-17,y-19);ctx.lineTo(x-9,y-11);ctx.lineTo(x-9,y);ctx.stroke()
      }
    })
    frame = requestAnimationFrame(draw)
  }
  const move = e => { pointer = {x:e.clientX,y:e.clientY};lastMove=performance.now() }
  resize(); frame = requestAnimationFrame(draw)
  addEventListener('resize',resize); addEventListener('pointermove',move)
  dispose = () => { cancelAnimationFrame(frame); removeEventListener('resize',resize); removeEventListener('pointermove',move) }
})
onBeforeUnmount(() => dispose?.())
</script>
<template><canvas ref="canvas" class="circuit-field" aria-hidden="true" /></template>
<style scoped>.circuit-field{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0}</style>
