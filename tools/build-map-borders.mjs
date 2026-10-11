import { readFileSync, writeFileSync } from 'node:fs'

const project = ([lon, lat]) => [(lon + 180) / 360 * 1000, (90 - lat) / 180 * 500]
for (const [source, target] of [
  ['public/maps/ne_50m_admin_0_boundary_lines_land.geojson', 'world-borders.svg'],
  ['public/maps/ne_50m_admin_1_states_provinces_lines.geojson', 'province-borders.svg'],
]) {
  const data = JSON.parse(readFileSync(source, 'utf8'))
  const paths = []
  for (const feature of data.features) {
    const geometry = feature.geometry
    if (!geometry) continue
    const lines = geometry.type === 'MultiLineString' ? geometry.coordinates : geometry.type === 'LineString' ? [geometry.coordinates] : []
    for (const line of lines) {
      let previous = null
      let path = ''
      line.forEach((coordinate, index) => {
        const point = project(coordinate)
        if (previous && Math.hypot(point[0] - previous[0], point[1] - previous[1]) < .13 && index !== line.length - 1) return
        const jump = previous && Math.abs(point[0] - previous[0]) > 500
        path += `${previous && !jump ? 'L' : 'M'}${point.map(value => value.toFixed(2)).join(',')}`
        previous = point
      })
      if (path) paths.push(path)
    }
  }
  writeFileSync(`public/maps/${target}`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500"><title>Natural Earth generalized administrative boundaries</title><g fill="none" stroke="#a5a0ba" stroke-width="0.16" stroke-linejoin="round">${paths.map(path => `<path d="${path}"/>`).join('')}</g></svg>`)
  console.log(`${target}: ${paths.length} boundary segments`)
}
