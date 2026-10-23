import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {runInNewContext} from 'node:vm'
const html=readFileSync(new URL('../../index.html',import.meta.url),'utf8')
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1]
for(const [saved,expected] of [['blue','blue'],['crystal','crystal'],[null,'blue'],['invalid','blue']]){
  const root={dataset:{},style:{}},meta={}
  runInNewContext(script,{localStorage:{getItem:()=>saved},document:{documentElement:root,querySelector:()=>meta}})
  assert.equal(root.dataset.appearance,expected)
  assert.equal(root.style.backgroundColor,expected==='blue'?'#fcfdff':'#030512')
  assert.equal(meta.content,root.style.backgroundColor)
}
const root={dataset:{},style:{}}
runInNewContext(script,{localStorage:{getItem:()=>{throw Error('blocked')}},document:{documentElement:root,querySelector:()=>({})}})
assert.equal(root.dataset.appearance,'blue')
assert.ok(html.indexOf(script)<html.indexOf('/src/main.js'),'theme is selected before the app module loads')
console.log('Pre-mount appearance and storage-failure fallback passed.')
