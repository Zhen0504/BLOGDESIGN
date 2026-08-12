export function createQualityProfile(renderer, viewport = window) {
  const gl = renderer.getContext()
  const hasWebGL2 = typeof WebGL2RenderingContext !== 'undefined'
    && gl instanceof WebGL2RenderingContext
  const hasHalfFloat = Boolean(gl.getExtension('EXT_color_buffer_float'))
  const isCompact = viewport.innerWidth <= 760
  const reducedMotion = viewport.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  if (!hasWebGL2) {
    return Object.freeze({
      tier: 'fallback',
      pixelRatio: 1,
      transmissionScale: 0,
      halfFloat: false,
      reducedMotion,
    })
  }

  return Object.freeze({
    tier: isCompact ? 'medium' : 'high',
    pixelRatio: Math.min(viewport.devicePixelRatio || 1, isCompact ? 1.15 : 1.35),
    transmissionScale: isCompact ? 0.34 : 0.46,
    halfFloat: hasHalfFloat,
    reducedMotion,
  })
}
