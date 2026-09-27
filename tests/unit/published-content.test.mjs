import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseArticleSource } from '../../src/data/articleParser.js'
import { Marked } from 'marked'
import markedKatex from 'marked-katex-extension'

const renderer = new Marked(markedKatex({ throwOnError: false, trust: false, output: 'html' }))
let count = 0
for (const category of ['development', 'research']) {
  for (const file of readdirSync(`content/${category}`).filter(name => name.endsWith('.md'))) {
    const source = readFileSync(`content/${category}/${file}`, 'utf8')
    const article = parseArticleSource(`/content/${category}/${file}`, source)
    assert.ok(article, file)
    assert.notEqual(article.title, '---')
    for (const match of source.matchAll(/\]\((\/blog\/[^)]+)\)/g)) {
      assert.ok(existsSync(resolve('public', '.' + match[1])), match[1])
    }
    const html = renderer.parse(article.content)
    assert.ok(!html.includes('katex-error'), file)
    if (file === 'neural-network-from-scratch.md') assert.ok(html.includes('class="katex"'))
    count++
  }
}
assert.equal(count, 3)
console.log('Three published articles: metadata, local assets and math rendering passed.')
