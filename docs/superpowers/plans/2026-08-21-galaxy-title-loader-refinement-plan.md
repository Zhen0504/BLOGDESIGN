# Galaxy, Section Title, and Intro Refinement Implementation Plan

## 1. Intro readiness contract

- Extend `CrystalScene.vue` and `createWelcomeCrystalScene.js` with a scene-ready event that fires after all required GLB models, post-processing, initial transforms, and first render are available.
- Add `src/components/intro/ZhenIntro.vue` as a native Vue/SVG/CSS overlay with a minimum cinematic timeline, asset-ready hold, failure timeout, and reduced-motion path.
- Mount the intro once in `PortfolioView.vue`, blur and darken all underlying site layers during the intro, and suppress navigation until the reveal completes.

## 2. Galaxy and overview composition

- Remove all line geometry and line-material code from `createParticleGalaxy.js`.
- Increase star and ribbon population and point sizes while splitting the ribbon into broken, irregular point streams.
- Widen the four overview anchors in `crystalManifest.js`, retaining safe pointer-motion margins.

## 3. Focused crystal placement

- Move Development and Contact focus positions farther left in `crystalManifest.js`.
- Recheck the transition camera/look-at calculation and tune only if the moved models clip.

## 4. Section particle headings

- Generalize `SectionContent.vue` so 01–04 headings use `ParticleText.vue` with semantic fallback text.
- Add a compact heading mode and Chinese serif font handling, with a shorter gather sequence than the overview title.
- Ensure title canvases rebuild only when the displayed section swaps, not during every transition frame.

## 5. Tests and visual verification

- Extend `tests/unit/project-structure.test.mjs` to cover the intro component, ready event, no React dependency, no line-based galaxy, and particle headings.
- Run `npm run test:structure`, `npm run build`, and `git diff --check`.
- Start a local production preview and capture entry-animation checkpoints plus final 00, 02, and 04 states at desktop size.
- Check console errors, scene persistence, intro removal, correct headings, and crystal bounds.

