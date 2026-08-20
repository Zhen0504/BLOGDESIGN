# Crystal Scene Visual Refinement Design

## Scope

Refine the existing Vue and Three.js portfolio scene without introducing React. The work covers the visual appearance of the crystal system, scene composition, pointer motion, the welcome title, and section-content transition correctness.

## Architecture

- Keep the single persistent Three.js canvas and the existing Hash Router architecture.
- Keep the Blender GLB assets local under `public/models/crystals/`.
- Implement the React Bits ParticleText behavior as a native Vue component backed by a dedicated 2D canvas. Do not install or load React.
- Keep accessible text in the DOM while treating both canvases as decorative visuals.

## Crystal appearance

- Shift the outer and inner glass palette from grey-white to saturated violet and indigo.
- Preserve a small amount of neutral white specular light so the facets remain readable.
- Use violet edge light and attenuation rather than increasing white exposure.
- Retain the current Blender geometry; this pass changes rendering, not mesh topology.

## Welcome composition

- Move the complete 00 crystal arrangement farther right.
- Expand both horizontal and vertical spacing so the four crystals occupy more of the right 62% of the viewport.
- Increase the visual footprint without overlapping the welcome text or the section indicator.
- Keep all four crystals, the central crystal, and their connecting galaxy visible.

## Focus camera and clipping

- Recalculate left-side focus states for Development and Contact so the selected crystal remains fully inside the camera frustum.
- Avoid covering the selected crystal with the dark DOM readability gradient.
- Keep the selected crystal in front, with the other three crystals and central crystal behind it.
- Preserve the dolly-forward feeling and depth-of-field separation.

## Galaxy redesign

- Replace the current large, uniformly round points with a multi-scale galaxy ribbon.
- Use predominantly small violet-blue dust, a thinner luminous filament, sparse medium highlights, and very few warm-gold nodes.
- Vary opacity, elongation, drift, and brightness along the curve so the ribbon reads as flowing stellar matter instead of plastic beads.
- Keep the ribbon behind the crystal surfaces and reduce intersections across icons.

## Pointer motion

- Project each crystal anchor into screen space and calculate its distance from the pointer.
- Crystals near the pointer receive more translation, forward lift, and tilt; distant crystals receive progressively less.
- Each crystal keeps a distinct lag, amplitude, and idle phase.
- Enable the same system in 01–04: the selected crystal has the strongest but restrained response, background crystals respond slightly, and the galaxy moves in counter-parallax.
- Respect `prefers-reduced-motion`.

## Particle welcome title

- Create a native `ParticleText.vue` component based on the supplied React Bits behavior.
- Render the title as three coordinated particle fields: `WELCOME`, `to`, and `MY BLOG`, preserving the existing two-line layout.
- Use an off-white-to-violet blend for the two main fields and a restrained warm-gold blend for `to`.
- On mount, particles gather into the glyphs. Hover replays the scatter-and-gather sequence, while pointer proximity repels nearby particles.
- Retain an accessible combined heading, `WELCOME to MY BLOG`, in the DOM.
- Provide a static text fallback for reduced motion or missing canvas support.

## Section content transition fix

- Decouple the route section from the section currently rendered in the content layer.
- During navigation, keep the old section and its original left/right placement while it fades out.
- After the exit finishes, swap the rendered section and content-side class together, then fade the new section in.
- Do not allow the outgoing 01 content to inherit the 02 right-side layout for a frame.
- Keep the scene transition and content transition under one navigation lock.

## Verification

- Browser-check 00 at 1440×900 for palette, composition, particle title, and galaxy.
- Verify pointer distance response using near and far cursor positions.
- Verify 00→01, 01→02, 02→03, 03→04, and reverse navigation.
- Capture the 01→02 transition at multiple intermediate frames to confirm the outgoing content never changes sides.
- Confirm one persistent Three.js canvas, no React dependency, no console errors, and a successful production build.
