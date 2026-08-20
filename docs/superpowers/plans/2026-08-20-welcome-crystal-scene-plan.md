# Welcome Crystal Scene Implementation Plan

## Goal

Deliver a browser-visible `00` welcome page in the existing portfolio using the five Blender-authored GLB assets, then prove the `00 → 01 / ABOUT → 00` cinematic camera transition in a real browser.

## Constraints

- Work only on `codex/personal-portfolio-redesign`.
- Treat `C:\Users\lenovo\Desktop\草稿\信拓\testmodel\crystal-web` as read-only source material.
- Preserve unrelated untracked `.superpowers/`, `assets/`, and legacy Blender scripts.
- Keep all runtime assets local for mainland-China stability.
- Do not redesign the detailed contents of sections `01–04`.

## Phase 1 — Import and validate source assets

1. Copy the five GLB files into `public/models/crystals/` with semantic names.
2. Add a source manifest recording original filename, target filename, byte size, and role.
3. Extend structural tests to assert all required local models exist and no external asset URL is used.
4. Run the structure tests and production build.

## Phase 2 — Build the persistent Three.js scene

Create focused modules under `src/components/crystal-scene/`:

- `CrystalScene.vue`: Canvas mounting, status reporting, and disposal.
- `createCrystalScene.js`: renderer, camera, scene, shared lifecycle, and render loop.
- `crystalManifest.js`: asset URLs, semantic keys, welcome anchors, and focus targets.
- `loadCrystalSystem.js`: GLTF loading, node material mapping, normalization, and error isolation.
- `createCrystalMaterials.js`: glass, icon, core, and controlled highlight materials.
- `createParticleGalaxy.js`: sparse stars and the continuous irregular galaxy ribbon.
- `createQualityProfile.js`: desktop/mobile/reduced-motion quality tiers.

Keep one Canvas and one loaded crystal system while Hash routes change.

## Phase 3 — Implement welcome composition

1. Mount `CrystalScene` behind the existing DOM in `PortfolioView.vue`.
2. Update the `00` content data and DOM styles to render:
   - `ZHEN` identity mark;
   - exact title `WELCOME to MY BLOG`;
   - exact subtitle;
   - topic line;
   - `SCROLL TO EXPLORE` cue.
3. Keep `00` entirely English.
4. Retain the persistent header and section indicator.
5. Tune the desktop layout to the approved 38/62 balance at `1440×900`.

## Phase 4 — Add bounded pointer motion

Create `createCrystalMotionController.js`:

1. Store immutable welcome anchors for each model.
2. Apply distinct idle phases and amplitudes.
3. Convert pointer position to bounded local offsets and `4–6°` maximum tilt.
4. Weight response by pointer distance and per-crystal depth.
5. Give the center crystal one-third movement and the particle galaxy weak counter-parallax.
6. Smoothly return to anchors after pointer leave.
7. Respect reduced-motion preferences.

## Phase 5 — Implement cinematic section transitions

Create `createSectionTransitionController.js` and `useSectionNavigation.js`:

1. Define settled scene states for `00–04`.
2. Use an approximately `1.35s` eased camera and model transition.
3. For `00 → 01`, move the camera on a shallow arc and the person crystal forward/right.
4. Animate focus distance so the person crystal is sharp and the remaining scene is blurred.
5. Synchronize DOM copy, header, indicator, and Hash route with the transition state.
6. Lock repeated wheel/click input until the active transition settles.
7. Reverse the exact path for `01 → 00`.
8. Initialize a refreshed Hash directly in its settled state.

## Phase 6 — Fallbacks, performance, and lifecycle

1. Add a minimal English loading state.
2. Keep DOM navigation functional when one GLB or WebGL fails.
3. Pause the render loop while the document is hidden.
4. Dispose RAF, listeners, post-processing, render targets, textures, materials, geometries, loaders, and WebGL context on unmount.
5. Cap device pixel ratio and reduce particles/depth-of-field quality on mobile.
6. Avoid foreign CDN, font, model, and texture requests.

## Phase 7 — Browser acceptance and visual iteration

1. Run unit/structure tests and a production build.
2. Open the page in a real browser at `1440×900`.
3. Capture the welcome state and inspect model layout, exposure, glass readability, particle continuity, typography, and negative space.
4. Record pointer-follow interaction.
5. Record `00 → 01 → 00` camera motion and verify input locking.
6. Verify console, Hash refresh, one-Canvas persistence, and resource disposal.
7. Verify `390×844` mobile layout and horizontal overflow.
8. Iterate until a presentable desktop screenshot and transition video are ready for user visual review.

## Verification commands

- `npm run test:structure`
- `npm run test:crystal`
- `npm run build`
- `git diff --check`
- Playwright CLI browser screenshots, console inspection, interaction recording, and lifecycle checks

## Delivery checkpoint

Stop after producing and committing a complete first-page implementation plus the reversible ABOUT transition. Show the user the actual screenshot and video before expanding or redesigning the remaining sections.
