export function createQualityProfile(renderer, viewport = window) {
  const gl = renderer.getContext()
  const webgl2 = typeof WebGL2RenderingContext !== 'undefined'
    && gl instanceof WebGL2RenderingContext
  const compact = viewport.innerWidth <= 760
  const reducedMotion = viewport.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  return Object.freeze({
    webgl2,
    compact,
    reducedMotion,
    pixelRatio: Math.min(viewport.devicePixelRatio || 1, compact ? 1 : 1.25),
    starCount: compact ? 380 : 760,
    ribbonCount: compact ? 720 : 1380,
    depthOfField: webgl2 && !compact && !reducedMotion,
    bloomIntensity: compact ? 0.62 : 0.82,
  })
}
