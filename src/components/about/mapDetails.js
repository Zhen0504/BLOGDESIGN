import { projectLocation } from './mapLocation.js'

// A deliberately small set of geographic reference labels, not visitor records.
const cities = [
  ['北京', 39.9, 116.4], ['上海', 31.2, 121.5], ['广州', 23.1, 113.3],
  ['成都', 30.6, 104.1], ['武汉', 30.6, 114.3], ['西安', 34.3, 108.9],
  ['沈阳', 41.8, 123.4], ['哈尔滨', 45.8, 126.5], ['济南', 36.7, 117.0],
  ['东京', 35.7, 139.7], ['首尔', 37.6, 127.0], ['新加坡', 1.35, 103.8],
  ['曼谷', 13.8, 100.5], ['新德里', 28.6, 77.2], ['迪拜', 25.2, 55.3],
  ['伦敦', 51.5, -.1], ['巴黎', 48.9, 2.35], ['柏林', 52.5, 13.4],
  ['开罗', 30.0, 31.2], ['悉尼', -33.9, 151.2], ['纽约', 40.7, -74.0],
  ['洛杉矶', 34.1, -118.2], ['圣保罗', -23.6, -46.6], ['开普敦', -33.9, 18.4],
].map(([name, latitude, longitude]) => ({ name, ...projectLocation({ latitude, longitude }) }))

export function visibleCityLabels(scale, offset, markers = []) {
  if (scale < 4) return []
  const labels = []
  for (const city of cities) {
    const x = city.x * scale + offset.x
    const y = city.y * scale + offset.y
    if (x < 40 || x > 885 || y < 45 || y > 400) continue
    // Avoid the foreground pins and their labels, and avoid other city names.
    if (markers.some(pin => x > pin.x - 85 && x < pin.x + 160 && Math.abs(y - pin.y) < 55)) continue
    if (labels.some(label => Math.abs(x - label.x) < 110 && Math.abs(y - label.y) < 42)) continue
    labels.push({ name: city.name, x, y })
    if (labels.length >= 11) break
  }
  return labels
}
