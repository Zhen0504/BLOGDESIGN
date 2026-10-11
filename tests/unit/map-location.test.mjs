import assert from 'node:assert/strict'
import { DALIAN, distanceKm, fitVisitorView, projectLocation, validVisitorLocation, visitorGreeting } from '../../src/components/about/mapLocation.js'

assert.equal(distanceKm(DALIAN, DALIAN), 0)
const london = { latitude: 51.5074, longitude: -0.1278 }
assert.ok(distanceKm(DALIAN, london) > 8000 && distanceKm(DALIAN, london) < 9000)
assert.equal(distanceKm(DALIAN, london), distanceKm(london, DALIAN))
assert.ok(distanceKm(DALIAN, { latitude: 38.9, longitude: 121.6 }) < 3)
assert.deepEqual(projectLocation({ latitude: 0, longitude: 0 }), { x: 500, y: 250 })
const beijing = { latitude: 39.9, longitude: 116.4 }
assert.ok(fitVisitorView(beijing).scale > fitVisitorView(london).scale * 2)
assert.equal(fitVisitorView(DALIAN).scale, 8)
for (const visitor of [beijing, london, DALIAN, { latitude: -33.9, longitude: 151.2 }]) {
  const view = fitVisitorView(visitor)
  assert.ok(view.scale >= 1 && view.scale <= 8)
  for (const position of [DALIAN, visitor]) {
    const point = projectLocation(position)
    const x = point.x * view.scale + view.offset.x
    const y = point.y * view.scale + view.offset.y
    const labelWidth = position === DALIAN ? 134 : 72
    assert.ok(x >= 25 && x + labelWidth <= 1000, 'Both map markers and labels fit horizontally')
    assert.ok(y >= 25 && y <= 440, 'Both map markers fit vertically')
  }
}
assert.match(visitorGreeting({ city: '北京' }, .45), /北京/)
assert.equal(new Set(Array.from({ length: 10 }, (_, index) => visitorGreeting({}, (index + .5) / 10))).size, 10)
assert.ok(!visitorGreeting(null, .99).includes('undefined'))
assert.equal(visitorGreeting({}, .2), visitorGreeting({}, .2))
assert.equal(validVisitorLocation({ available: true, ...DALIAN }), true)
for (const value of [null, {}, { available: false, ...DALIAN }, { available: true, latitude: 91, longitude: 0 }, { available: true, latitude: 0, longitude: Infinity }]) {
  assert.equal(validVisitorLocation(value), false)
}
console.log('City projection and approximate distance tests passed.')
