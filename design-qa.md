# Design QA — Minimal intro and scene balance

## Evidence

- Source visual truth (intro line language): `C:\Users\lenovo\AppData\Local\Temp\codex-clipboard-f68c8f7e-4726-44c2-a0a5-faceefdceb9a.png`
- Source visual truth (approved 00 composition, left half): `output/playwright/qa-compare-00-before.png`
- Rendered intro: `output/qa-intro-complete.png`
- Rendered 00 page: `output/qa-overview-final.png`
- Rendered section samples: `output/qa-section-development.png`, `output/qa-section-contact.png`
- Focused intro comparison: `output/qa-intro-comparison.png`
- Full-view 00 comparison: `output/qa-overview-comparison.png`

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
- Colors and tokens: intro gradients stay inside the site's violet, indigo, ice-blue, and restrained gold palette. Scene exposure, bloom, emissive intensity, and edge highlights are lower than the previous pass; no left-side shadow bars remain.
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

## Follow-up polish

- [P3] A later material-only pass could move the user-supplied Blender meshes closer to the smooth transparent-glass concept without changing this layout or interaction work.

## Implementation checklist

- [x] Minimal ZHEN line-drawing intro
- [x] English 01–04 display headings
- [x] Right-shifted 00 crystal composition with centered core
- [x] More visible ambient moving particles
- [x] Organic broken nebula clouds instead of a closed ring
- [x] Reduced lighting, bloom, emissive, and depth-of-field intensity
- [x] Browser interaction, layout, overflow, and console verification

final result: passed
