// Capture visible characters at their actual screen positions, not a synthetic grid.
export function captureGlyphs(root, context) {
  const bounds = root.getBoundingClientRect(), glyphs = []
  const visible = r => r.width > 0 && r.bottom > bounds.top && r.top < bounds.bottom && r.right > bounds.left && r.left < bounds.right
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node
  while ((node = walker.nextNode()) && glyphs.length < 2200) {
    const parent = node.parentElement
    if (!parent || parent.closest('[aria-hidden="true"],canvas,script,style')) continue
    const style = getComputedStyle(parent)
    if (style.display === 'none' || parseFloat(style.fontSize) < 7) continue
    const range = document.createRange()
    for (let i=0;i<node.textContent.length && glyphs.length<2200;i++) {
      const char = node.textContent[i]
      if (/\s/.test(char)) continue
      range.setStart(node,i); range.setEnd(node,i+1)
      const r = range.getBoundingClientRect()
      if (!visible(r)) continue
      glyphs.push({char,x:r.left,y:r.top + r.height*.79,font:`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,color:style.color})
    }
  }
  return glyphs
}

export function captureParticlePoints(root) {
  const points=[]
  const bounds=root.getBoundingClientRect()
  root.querySelectorAll('.particle-text').forEach(element=>{
    const rect=element.getBoundingClientRect()
    if(rect.bottom<=bounds.top || rect.top>=bounds.bottom)return
    for(const point of element.captureParticlePoints?.() || []) {
      points.push({...point,x:rect.left+point.x,y:rect.top+point.y})
    }
  })
  return points
}

export function waterfallPose(glyph, index, progress, entering) {
  const delay = ((index*17)%31)/150
  const p = Math.max(0,Math.min(1,(progress-delay)/(1-delay)))
  const travel = 130 + (index%11)*13
  return { x:glyph.x, y:glyph.y + (entering ? (1-p)**2*travel : -p*p*travel), alpha:entering ? Math.min(1,p*2) : Math.max(0,1-p*1.3), p }
}

export function animateWaterfall(canvas, root, entering = false) {
  const context=canvas.getContext('2d'), glyphs=captureGlyphs(root,context)
  const particles=captureParticlePoints(root)
  const dpr=Math.min(devicePixelRatio,2)
  canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr
  context.setTransform(dpr,0,0,dpr,0,0)
  canvas.dataset.glyphCount=String(glyphs.length)
  canvas.dataset.particleCount=String(particles.length)
  canvas.dataset.phase=entering?'enter':'leave'
  let frame, finish
  const finished = new Promise(resolve=>finish=resolve), start=performance.now()
  const duration=entering?820:940
  function draw(now) {
    const progress=Math.min(1,(now-start)/duration)
    canvas.dataset.progress=String(progress)
    context.clearRect(0,0,innerWidth,innerHeight)
    const bounds=root.getBoundingClientRect()
    context.save();context.beginPath();context.rect(bounds.left,bounds.top,bounds.width,bounds.height);context.clip()
    glyphs.forEach((glyph,index)=>{
      const pose=waterfallPose(glyph,index,progress,entering)
      context.font=glyph.font;context.textBaseline='alphabetic'
      for(let tail=2;tail>=0;tail--) {
        context.globalAlpha=pose.alpha*(tail ? .14 : 1)
        context.fillStyle=tail || pose.p>.18?'#7863ca':glyph.color
        context.fillText(tail ? '01<>/ABC'[index%8] : glyph.char,pose.x,pose.y+tail*15*Math.sin(pose.p*Math.PI))
      }
    })
    // Preserve the title's point shapes and spacing while scrolling it upward.
    const p=1-(1-progress)**3
    particles.forEach(point=>{
      context.globalAlpha=entering?Math.min(1,progress*4):1-progress
      context.fillStyle=point.color
      context.fillRect(point.x-point.size/2,point.y+(entering?(1-p)*190:-p*240)-point.size/2,point.size,point.size)
    })
    context.restore();context.globalAlpha=1
    if(progress<1)frame=requestAnimationFrame(draw)
    else {context.clearRect(0,0,innerWidth,innerHeight);canvas.dataset.phase='idle';finish()}
  }
  frame=requestAnimationFrame(draw)
  return {finished,cancel(){cancelAnimationFrame(frame);context.clearRect(0,0,innerWidth,innerHeight);canvas.dataset.phase='idle';finish()}}
}
