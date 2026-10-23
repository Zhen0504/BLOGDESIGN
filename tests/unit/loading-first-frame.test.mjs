import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const source=readFileSync(new URL('../../src/components/intro/LineWordmark.vue',import.meta.url),'utf8')
const loop=source.match(/\.line-wordmark\[data-animation='loop'\] \.line-wordmark__dash\s*\{([^}]+)\}/)[1]
assert.match(loop,/stroke-dasharray: 0 360/)
assert.match(loop,/opacity: 0/)
assert.match(loop,/infinite both/,'staggered letters stay blank during delay')
assert.match(source,/0%, 10% \{ stroke-dasharray: 0 360; opacity: 0;/)
assert.match(source,/data-animation='once'[\s\S]*line-wordmark-dash-array 2.5s/,'ZHEN once animation remains unchanged')
console.log('LOADING starts blank, including stagger delays and loop boundaries.')
