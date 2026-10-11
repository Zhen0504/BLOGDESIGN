export const DALIAN = { latitude: 38.914, longitude: 121.614 }

export function projectLocation({ latitude, longitude }) {
  return { x: (longitude + 180) / 360 * 1000, y: (90 - latitude) / 180 * 500 }
}

export function fitVisitorView(visitor) {
  const home = projectLocation(DALIAN)
  const other = projectLocation(visitor)
  // Leave room for both labels and the curved connection, even at close range.
  const scale = Math.max(1, Math.min(8,
    680 / Math.max(1, Math.abs(other.x - home.x)),
    260 / Math.max(1, Math.abs(other.y - home.y))))
  return {
    scale,
    offset: {
      x: Math.min(0, Math.max(1000 * (1 - scale), 500 - (home.x + other.x) / 2 * scale)),
      y: Math.min(0, Math.max(500 * (1 - scale), 250 - (home.y + other.y) / 2 * scale)),
    },
  }
}

export function visitorGreeting(visitor, random = Math.random()) {
  const city = typeof visitor?.city === 'string' ? visitor.city.trim() : ''
  const messages = [
    '你那边的天气怎么样？希望今天也有让你心情变好的片刻。',
    '最近过得怎么样？忙碌之余，也记得给自己留一点时间。',
    '谢谢你从另一处坐标来到这里，愿你今天过得自在。',
    '隔着地图打个招呼，愿我们都能慢慢靠近喜欢的生活。',
    city ? `${city}，有机会也想去走走，看看你日常见到的风景。` : '有机会，也想去你所在的城市走走，看看不一样的风景。',
    '今天有没有遇见什么小小的好事？平凡的一天也值得被记住。',
    '如果最近有点累，就在这里歇一会儿，不用急着赶路。',
    '你窗外是什么风景？我这边想把一点海风分享给你。',
    '不知道你正走在怎样的路上，希望下一站有你期待的风景。',
    '很高兴在这片小小的网络角落遇见你，愿你一直保有好奇。',
  ]
  return messages[Math.min(messages.length - 1, Math.max(0, Math.floor(random * messages.length)))]
}

export function validVisitorLocation(data) {
  return data?.available === true && typeof data.latitude === 'number' && typeof data.longitude === 'number'
    && Number.isFinite(data.latitude) && Number.isFinite(data.longitude)
    && Math.abs(data.latitude) <= 90 && Math.abs(data.longitude) <= 180
}

export function distanceKm(a, b) {
  const rad = value => value * Math.PI / 180
  const deltaLat = rad(b.latitude - a.latitude)
  const deltaLon = rad(b.longitude - a.longitude)
  const term = Math.sin(deltaLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(deltaLon / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, term))))
}
