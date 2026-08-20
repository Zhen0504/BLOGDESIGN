# Minimal Intro and Scene Balance Design

## Scope

Refine the existing Vue and Three.js portfolio in four targeted areas: the `ZHEN` intro mark, English section headings, the 00 composition and ambient particles, and the scene's excessive highlights and shadow artifacts. Keep the current routing, GLB models, particle-title system, and no-React constraint.

## ZHEN intro

- Replace the serif outline/fill wordmark, aura, SVG blur filter, and DOM gradient-fill fallback with four independent monoline SVG glyphs: Z, H, E, and N.
- Build the glyphs from simple rounded paths and animate them with the same motion principle as the supplied Uiverse reference: coordinated `stroke-dasharray` and `stroke-dashoffset` changes.
- Use one restrained gradient per glyph in the site's violet, indigo, ice-blue, and warm-gold palette. Do not reproduce the reference's green/pink palette unchanged.
- Slow the complete draw to roughly 2.8 seconds, then hold the finished line glyphs for about 0.7 seconds before the existing one-second reveal.
- Keep the 00 scene blurred behind the loader, but remove all large glow filters and drop shadows that can produce banding or residual bars.
- Preserve the ready-state wait, timeout fallback, reduced-motion behavior, and real accessible `ZHEN` label.

## English section headings

- Change only the 01–04 primary headings to English:
  - 01: `ABOUT ME`
  - 02: `DEVELOPMENT`
  - 03: `RESEARCH`
  - 04: `CONTACT`
- Keep the current particle gather interaction, shorter section timing, and semantic DOM headings.
- Render the particles with the existing English display serif rather than the Chinese Song-style stack.
- Leave supporting Chinese placeholder content unchanged because the request only changes the primary headings.

## 00 composition and ambient particles

- Move the complete four-crystal arrangement, center crystal, and connecting galaxy approximately 0.30 world units to the right.
- Recalculate the center crystal from the average of the four outer anchors so it remains visually centered after the move.
- Add a separate overview-only field of small, slowly drifting glow particles across currently empty areas. Use restrained violet/ice-blue points with very sparse gold accents.
- Fade the overview sparkles almost completely out in 01–04 so depth of field does not turn them into large bokeh discs.
- Keep the galaxy free of a closed line.

## Lighting and artifact reduction

- Reduce tone-mapping exposure, direct point-light energy, environment reflections, edge emission, and bloom intensity as one coordinated change.
- Preserve readable violet glass and small white highlights, but eliminate clipped white facets and the impression of a damaged or overexposed screen.
- Reduce focus-state bokeh strength so background particles remain soft without becoming oversized circular blobs.
- Remove the intro aura, SVG blur filter, and drop-shadow layers; these are the primary suspected source of the reported left-side bar artifacts.

## Verification

- Capture the supplied monoline reference and the implemented `ZHEN` state at comparable scale for design QA.
- Capture final 00, 02, and 04 desktop states at 1440×900.
- Confirm the center crystal sits inside the visual center of the four outer crystals and the group has moved right without clipping.
- Confirm ambient particles are visible on 00 but subdued in 01–04.
- Confirm no left-side shadow bars remain after the intro, highlights are not clipped, all four English headings are accessible, and the single Three.js scene persists across navigation.
- Run both structure checks, production build, console inspection, and overflow checks.

