import { readFileSync, writeFileSync } from 'node:fs'
// Mechanical conversion of Natural Earth public-domain land polygons.
const input = JSON.parse(readFileSync('public/maps/ne_50m_land.geojson', 'utf8'))
const project = ([lon, lat]) => [((lon + 180) / 360 * 1000).toFixed(3), ((90 - lat) / 180 * 500).toFixed(3)]
const paths = []
for (const { geometry } of input.features) {
  const polygons = geometry.type === 'MultiPolygon' ? geometry.coordinates : [geometry.coordinates]
  for (const polygon of polygons) {
    paths.push(polygon.map(ring => ring.map((p, i) => `${i ? 'L' : 'M'}${project(p).join(',')}`).join('') + 'Z').join(''))
  }
}
writeFileSync('public/maps/world-land.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500"><title>Natural Earth land, equirectangular projection</title><g fill="#303348" fill-rule="evenodd" stroke="#55536d" stroke-width="0.12">${paths.map(d => `<path d="${d}"/>`).join('')}</g></svg>`)
