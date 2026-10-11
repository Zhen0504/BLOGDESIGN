import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const app = readFileSync('src/App.vue', 'utf8')
const footer = readFileSync('src/components/layout/SiteRegistration.vue', 'utf8')
assert.match(app, /<SiteRegistration\s*\/>/)
assert.match(footer, /湘ICP备2026045349号-1/)
assert.match(footer, /href="https:\/\/beian\.miit\.gov\.cn\/"/)
assert.match(footer, /rel="noopener noreferrer"/)
console.log('Global ICP registration link checks passed.')
