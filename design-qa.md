# Design QA — Minimal intro and scene balance

## Evidence

- Source visual truth (intro line language): `C:\Users\lenovo\AppData\Local\Temp\codex-clipboard-f68c8f7e-4726-44c2-a0a5-faceefdceb9a.png`
- Source visual truth (approved 00 composition, left half): `output/playwright/qa-compare-00-before.png`
- Rendered intro: `output/qa-intro-complete.png`
- Rendered 00 page: `output/qa-overview-final.png`
- Rendered section samples: `output/qa-section-development.png`, `output/qa-section-contact.png`
- Focused intro comparison: `output/qa-intro-comparison.png`
- Full-view 00 comparison: `output/qa-overview-comparison.png`
- Reported section background mismatch: `output/qa-color-difference-before.png`
- Corrected About state: `output/qa-color-difference-after-about.png`
- Background before/after comparison: `output/qa-color-difference-comparison.png`
- Additional corrected states: `output/qa-color-difference-after-research.png`, `output/qa-color-difference-after-contact.png`

## Normalization

- Browser CSS viewport: 1280 × 720.
- Browser device pixel ratio: 1.5.
- Browser screenshots were returned at 1280 × 720 pixels, so comparisons use the browser's CSS-pixel-normalized captures.
- Intro source: 391 × 211 pixels. It was proportionally fitted into a 540 × 303 comparison panel.
- Intro implementation focus crop: 680 × 285 CSS-pixel region from the 1280 × 720 capture, fitted into a 564 × 303 panel.
- Full-view composition source: the 1680 × 945 left half of the retained comparison image. The 1280 × 720 implementation was resampled to 1680 × 945 for equal-aspect side-by-side review.
- State: completed ZHEN hold frame for the intro; settled 00 route after the intro for the overview.

## Findings

- No actionable P0, P1, or P2 findings remain for the four requested changes.
- Typography: the intro now uses four rounded monoline glyphs with animated dash drawing instead of filled serif text and glow filters. The 01–04 display headings are English and retain the established particle-letter hierarchy.
- Spacing and layout: the 00 crystal cluster occupies the right half, the center crystal sits at the visual average of the four outer anchors, and 01/03 versus 02/04 preserve the intended alternating content sides.
- Colors and tokens: intro gradients stay inside the site's violet, indigo, ice-blue, and restrained gold palette. Scene exposure, bloom, emissive intensity, and edge highlights are lower than the previous pass; no left-side shadow bars remain. The former section-dependent horizontal backdrop gradients were removed, so the WebGL scene now has one horizontally consistent background treatment on 01–04.
- Image and asset fidelity: the user's Blender crystal assets remain unchanged. Their faceted surface is intentionally less smooth than the earlier concept render, but this is outside the requested intro/composition/lighting correction and does not impair the current interaction.
- Copy and content: 00 remains English-only. Section headings resolve to ABOUT ME, DEVELOPMENT, RESEARCH, and CONTACT; supporting placeholder content remains honest and unchanged.
- Interaction and accessibility: all four navigation routes were clicked in sequence, their headings and alternating layout positions were verified, pointer movement was exercised on the 00 scene, overflow remained hidden at 1280 × 720, and the browser console contained no errors. The intro retains its status label and reduced-motion handling.

## Comparison history

### Pass 1 — blocked

- [P2] The particle field still read as a thin closed orbital ring in the first browser capture.
- Fix: replaced the closed Catmull–Rom ribbon distribution with four broad, rotated nebula clusters; widened depth and transverse spread; increased sparse overview sparkles without restoring a geometric line.
- Additional fixes already visible in this pass: replaced the filled/glowing ZHEN treatment with rounded SVG dash animation, shifted 00 anchors and center crystal rightward, translated 01–04 particle headings to English, and reduced exposure/bloom/material emission.

### Pass 2 — passed

- Post-fix evidence: `output/qa-overview-final.png` and `output/qa-overview-comparison.png`.
- The particle connection now reads as separated, organic clouds rather than one continuous line; the page retains a coherent relationship among the four crystals.
- The intro focus comparison shows the requested minimalist line language with project-specific colors and no glow bars.

### Pass 3 — passed

- [P2] User evidence revealed a different dark tone behind the content side on every detail page.
- Root cause: `.ambient-background` applied a high-opacity 90-degree gradient on 01/03 and reversed it to 270 degrees on 02/04, darkening whichever side held the DOM content. This was independent of the transparent particle-text canvas.
- Fix: removed both directional gradients and the section-specific reversal; retained only a centered, very low-opacity radial atmosphere plus the existing vertical vignette.
- Post-fix evidence: `output/qa-color-difference-after-about.png`, `output/qa-color-difference-after-research.png`, `output/qa-color-difference-after-contact.png`, and the equal-viewport comparison `output/qa-color-difference-comparison.png`.
- All checked routes rendered without a content-side background block, and the browser console contained no errors.

## Follow-up polish

- [P3] A later material-only pass could move the user-supplied Blender meshes closer to the smooth transparent-glass concept without changing this layout or interaction work.

## Implementation checklist

- [x] Minimal ZHEN line-drawing intro
- [x] English 01–04 display headings
- [x] Right-shifted 00 crystal composition with centered core
- [x] More visible ambient moving particles
- [x] Organic broken nebula clouds instead of a closed ring
- [x] Reduced lighting, bloom, emissive, and depth-of-field intensity
- [x] Horizontally consistent background treatment on 01–04
- [x] Browser interaction, layout, overflow, and console verification

final result: passed

## ZHEN first-frame regression — passed

- Captured the page approximately 120 ms after navigation began in a fresh tab.
- The visible frame contained only partially drawn glyph segments; the completed ZHEN wordmark did not flash before animation.
- After the intro completed, a same-tab reload produced no intro status overlay, preserving the session-only behavior.
- Browser console: 0 errors and 0 warnings.

---

# Design QA — Session intro and genuine loading state

## Scope

- Show the ZHEN line-drawing intro once per browser-tab session.
- Skip ZHEN on later reloads in the same tab.
- Show LOADING only when the initial 3D scene remains unresolved for more than 300 ms.
- Keep normal 00–04 camera transitions free of the loading overlay.

## Browser verification

- Fresh local tab: the ZHEN status overlay was present during the draw phase and blocked navigation until its reveal completed.
- Same-tab reload: ZHEN was skipped. The cached local 3D scene completed inside the 300 ms grace period, so LOADING correctly did not flash.
- ABOUT → DEVELOPMENT → RESEARCH → CONTACT: every route resolved to the correct heading and no `role="status"` loading overlay appeared during camera transitions.
- Console: 0 errors and 0 warnings.

## Implementation checks

- Session state is isolated behind safe `sessionStorage` helpers and degrades gracefully when storage access throws.
- ZHEN and LOADING share the same Vue monoline wordmark component; no React dependency was introduced.
- LOADING uses the approved copy: `NETWORK CONDITIONS MAY DELAY THE EXPERIENCE.`
- Delayed-show, minimum-visible, settle, fade, hard-timeout, and reduced-motion behavior are covered by structure tests.
- WebGL initialization failure settles the loader through the scene fallback event rather than leaving the interface locked.

final result: passed
