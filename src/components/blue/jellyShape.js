// Static rest pose: pressure compression is geometry, not a scale animation.
export function jellyRestVertex(x,y,z) {
  // An uninterrupted egg volume, with compression confined to its lowest tip.
  const compressedY=-1.07+Math.log1p(Math.exp((y*1.30+1.07)*16))/16
  const fullness=1.055-.065*y
  return [x*fullness+.035*(y+.35)+.018*z*y, compressedY+.009*x*z*(1+y), z*(1.01-.035*y)*(1+.018*x)]
}
