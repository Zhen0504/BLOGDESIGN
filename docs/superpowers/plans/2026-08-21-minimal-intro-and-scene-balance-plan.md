# Minimal Intro and Scene Balance Implementation Plan

## 1. Intro glyph rewrite

- Replace the current layered text implementation in `ZhenIntro.vue` with four supplied-technique monoline SVG glyphs.
- Add finite dash-array/dash-offset drawing, stable hold styles, reduced-motion fallback, and clean reveal.
- Remove aura, blur filter, gradient fill fallback, and all large shadow effects.

## 2. Content and composition

- Replace 01–04 Chinese particle headings with `ABOUT ME`, `DEVELOPMENT`, `RESEARCH`, and `CONTACT`.
- Change section particle typography to the English display stack.
- Move the four overview anchors and center anchor right, and move the galaxy group by the same amount.

## 3. Ambient particle layer

- Add a separately batched overview sparkle field to `createParticleGalaxy.js`.
- Add `setSection()` and smooth overview opacity handling so the layer fades for focus states.
- Wire the active scene section into the galaxy controller without creating a second renderer.

## 4. Lighting balance

- Reduce renderer exposure, point-light intensities, material reflection/emission, bloom, and focus bokeh.
- Retain purple glass readability and verify all focused crystals remain clear.

## 5. QA and delivery

- Extend structure checks for the English headings, monoline SVG intro, and no React dependency.
- Run structure tests, crystal tests, build, and `git diff --check`.
- Use the Codex in-app browser at 1440×900 for entry, 00, 02, and 04 captures.
- Write `design-qa.md`, compare against the reference image, fix P0–P2 issues, and require `final result: passed` before handoff.

