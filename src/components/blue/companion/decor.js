export function createCompanionDecor(host){
  const contact=document.createElement('div');contact.className='companion-contact';contact.setAttribute('aria-hidden','true');host.appendChild(contact)
  const exit=document.createElement('div');exit.className='companion-contact';exit.setAttribute('aria-hidden','true');host.appendChild(exit)
  const speech=document.createElement('div');speech.className='companion-speech';host.appendChild(speech)
  const hit=document.createElement('button');hit.type='button';hit.className='companion-hit';hit.setAttribute('aria-label','果冻伙伴：拖拽互动，双击或按空格后空翻');host.appendChild(hit)
  function layout(){}
  function marker(el,c,x,y){
    el.hidden=!c;if(!c)return
    const horizontal=c.side==='bottom';el.dataset.kind=c.kind
    el.style.width=horizontal?'115px':'12px';el.style.height=horizontal?'12px':'115px'
    el.style.left=(x-(horizontal?57.5:6))+'px';el.style.top=(y-(horizontal?6:57.5))+'px'
    el.style.opacity=String(.35+c.strength*.6)
  }
  function update(l,s,cx,cy){
    const r=s.size*.47;hit.style.left=(cx-r)+'px';hit.style.top=(cy-r)+'px';hit.style.width=hit.style.height=(r*2)+'px'
    hit.style.pointerEvents=s.state==='free'||s.roaming?'auto':'none';hit.style.visibility=s.state==='portal'?'hidden':'visible'
    const c=s.contact
    const wallX=c?.side==='bottom'?cx:c?.side==='left'?cx+s.size*.5*(1-.10*c.strength):cx-s.size*.5*(1-.10*(c?.strength||0))
    const wallY=c?.side==='bottom'?cy-s.size*.5*(1-.08*c.strength):cy
    marker(contact,c,c?.kind==='wall'?wallX:c?.x,c?.kind==='wall'?wallY:c?.y)
    const second=c?.kind==='portal'&&!l.mobile?{...c,side:c.side==='left'?'right':'left'}:null
    marker(exit,second,second?(second.side==='left'?l.column.left:l.column.right):0,c?.y)
  }
  return {speech,hit,layout,update,dispose(){contact.remove();exit.remove();speech.remove();hit.remove()}}
}
