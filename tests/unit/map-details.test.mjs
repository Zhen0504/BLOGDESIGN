import assert from 'node:assert/strict'
import { visibleCityLabels } from '../../src/components/about/mapDetails.js'
import { fitVisitorView } from '../../src/components/about/mapLocation.js'

assert.deepEqual(visibleCityLabels(3.99, { x: 0, y: 0 }), [])
const view = fitVisitorView({ latitude: 39.9, longitude: 116.4 })
const labels = visibleCityLabels(view.scale, view.offset)
assert.ok(labels.some(label => label.name === '北京'))
assert.ok(labels.length <= 11)
for (const label of labels) {
  assert.ok(label.x >= 40 && label.x <= 885 && label.y >= 45 && label.y <= 400)
}
const beijing = labels.find(label => label.name === '北京')
assert.ok(!visibleCityLabels(view.scale, view.offset, [beijing]).some(label => label.name === '北京'))
console.log('Map detail thresholds, viewport clipping and pin avoidance passed.')
