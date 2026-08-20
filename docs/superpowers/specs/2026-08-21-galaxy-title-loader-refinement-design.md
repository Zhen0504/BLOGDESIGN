# Galaxy, Section Title, and Intro Refinement Design

## Scope

Refine the existing Vue and Three.js portfolio without introducing React. This pass covers the 00 galaxy and crystal spacing, particle headings for 01–04, focused crystal placement for 02 and 04, and a new `ZHEN` entry animation adapted from the motion language of the referenced Uiverse loader.

## Entry experience

- The first visible state is a full-viewport intro layer with `ZHEN` centered on screen.
- The 00 scene loads behind the intro from the beginning, but it is darkened and strongly blurred so it supplies atmosphere without competing with the wordmark.
- `ZHEN` is implemented as native Vue/SVG/CSS rather than React. Its letters use animated stroke drawing, short colored accents, and restrained violet/ice-blue/gold gradients inspired by the referenced loader; the original `YOU` artwork is not copied.
- The animation must complete as a deliberate sequence instead of disappearing as soon as assets load:
  1. 0–0.4 s: blurred background fades in and the first letter strokes appear.
  2. 0.4–2.8 s: the complete `ZHEN` wordmark draws and its colored accents travel across the letter paths.
  3. 2.8–3.5 s: the finished wordmark remains clearly readable with a subtle glow pulse.
  4. 3.5–4.5 s: `ZHEN` dissolves, background blur reduces to zero, exposure rises, and the 00 interface becomes interactive.
- Four and a half seconds is the minimum cinematic duration. If GLB assets need longer, the completed wordmark remains in its subtle hold state until the scene reports ready; a timeout must still release the page if loading fails.
- The intro runs only on a fresh page load, never between 00–04 route changes. `prefers-reduced-motion` receives a short static `ZHEN` hold followed by a simple fade.
- All intro text remains real DOM/SVG content and the loading layer is removed from keyboard and pointer flow after completion.

## 00 galaxy

- Remove the closed circular filament completely. No continuous line or perfect ring may remain.
- Preserve a loose orbital reading through points alone: several overlapping, broken dust streams with irregular gaps, local clusters, and slight vertical thickness.
- Increase the total visible particle count by roughly 45–60% and point size by roughly 15–25% relative to the current implementation.
- Keep a hierarchy of many small violet/blue dust particles, fewer medium highlights, sparse ice-blue nodes, and very few warm-gold accents.
- Avoid a plastic bead appearance by varying opacity, scale, brightness, depth, and drift; soft mist may support the points but must not reconstruct a closed line.

## 00 crystal composition

- Widen the horizontal separation of the four outer crystals while preserving their existing upper/lower rhythm.
- Move both left crystals approximately 0.25–0.35 world units farther left and both right crystals approximately 0.25–0.35 world units farther right, then visually tune against the original approved layout.
- Keep the overall group on the right side of the page and maintain safe margins so pointer parallax cannot clip a crystal.
- Preserve the central faceted crystal, with the widened particle cloud visually connecting the four outer crystals without a hard orbit line.

## Particle headings for 01–04

- Reuse the native Vue `ParticleText` visual system already used by `WELCOME to MY BLOG` for the primary heading in About, Development, Research, and Contact.
- Each section heading gathers from particles when that section becomes active. The effect should be shorter and calmer than the 00 welcome animation so navigation remains responsive.
- Use the section's existing Chinese title with a Song/FangSong-style font stack where available. Keep off-white particles with violet edge accents; do not introduce unrelated rainbow colors.
- Preserve one real semantic heading in the DOM for accessibility, SEO, canvas failure, and reduced-motion fallback.
- The particle canvas must be remeasured correctly when the content changes sides and must not expose a stale title during route transitions.

## Focused crystal placement

- Move the selected Development (02) and Contact (04) crystals approximately 0.25–0.35 world units farther left than their current focused positions.
- Revalidate their camera framing after the move so glow, mouse parallax, and model bounds remain fully visible.
- About (01) and Research (03) keep their current right-side focused composition.

## Interaction and performance

- Keep the existing distance-weighted pointer response on 00 and focused-section pointer response on 01–04.
- The blurred intro background must use a bounded visual treatment and must not create a second Three.js renderer or duplicate GLB loads.
- Pause expensive particle-title simulation when its section is inactive or the document is hidden.
- Maintain the existing single persistent scene, hash routing, navigation lock, and no-React constraint.

## Verification

- Capture the entry experience at the initial draw, completed `ZHEN` hold, midpoint of the blur-to-focus transition, and final interactive 00 state.
- Verify the intro cannot reveal an unstyled or sharp 00 frame before `ZHEN` begins.
- Verify the intro waits for scene readiness, exits on load failure, and does not replay during 00–04 navigation.
- Capture 00 at 1440×900 and compare crystal spread with the previously approved layout.
- Confirm there is no closed line in the galaxy and particles remain legible without becoming plastic beads.
- Verify each 01–04 heading animates with the correct title, side, and accessible DOM fallback.
- Verify 02 and 04 focused crystals move left without clipping at common desktop widths.
- Run the structure tests and production build, and confirm zero browser console errors.

