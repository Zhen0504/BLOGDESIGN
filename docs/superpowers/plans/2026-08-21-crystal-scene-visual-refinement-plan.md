# Crystal Scene Visual Refinement Implementation Plan

## 1. Native Vue particle title

- Add `src/components/effects/ParticleText.vue` with canvas glyph sampling, scatter/gather, pointer repulsion, idle drift, resizing, font loading, reduced-motion fallback, and cleanup.
- Replace the static welcome heading with three coordinated ParticleText instances while retaining an accessible DOM heading.
- Add structure checks proving that no React dependency or import exists.

## 2. Crystal palette and overview composition

- Retune physical materials, edge shader, lights, and exposure toward violet-indigo glass.
- Expand and move the 00 anchors and galaxy ribbon to the right.
- Keep the title and section indicator clear of the crystal bounds.

## 3. Galaxy rendering

- Replace the single round-point shader with layered dust, filament, and sparse highlight point systems.
- Add anisotropic streak shaping, varied opacity, and restrained gold accents.
- Keep all layers GPU-batched and behind crystal surfaces.

## 4. Distance-aware pointer motion

- Pass camera and active-section state to the motion controller.
- Project each crystal rest position into screen space each frame.
- Calculate radial falloff from pointer distance and apply per-crystal lag, translation, depth lift, and tilt.
- Keep selected-section motion enabled with damped background response.

## 5. Camera and section transitions

- Retune left-side focus positions and camera look targets so Development and Contact remain fully visible.
- Interpolate the depth-of-field target rather than snapping it.
- Preserve one persistent scene and reversible movement.

## 6. Content-side transition state machine

- Add a displayed-section state separate from the route section.
- Fade the outgoing content at its old side, swap section and side atomically, then reveal the incoming content.
- Coordinate timing with the existing navigation lock.

## 7. Verification

- Run structure tests and production build.
- Browser-check 00 and all focused states at 1440×900.
- Verify pointer falloff, one persistent canvas, wheel reversal, and no console errors.
- Capture 01→02 intermediate frames and final screenshots.
