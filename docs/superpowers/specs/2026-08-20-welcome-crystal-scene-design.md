# Welcome Crystal Scene Design

## 1. Objective

Build the final `00` welcome page for the personal portfolio by integrating the Blender-authored crystal models from:

`C:\Users\lenovo\Desktop\草稿\信拓\testmodel\crystal-web`

into the existing portfolio repository and branch:

`codex/personal-portfolio-redesign`

The source `crystal-web` directory remains an untouched reference prototype. Its models are copied into the portfolio repository; its files are not edited or deleted.

This phase delivers the complete welcome page and a real, reversible `00 → 01 / ABOUT` transition. It does not redesign the content of sections `01–04`.

## 2. Confirmed Direction

Use one persistent Three.js scene for the entire portfolio. The four outer crystals, center crystal, galaxy particles, camera, and post-processing remain alive while the active section changes. HTML remains responsible for readable text, navigation, accessibility, and links.

Do not use:

- free-drag OrbitControls;
- wheel zoom;
- separate Three.js scenes for each section;
- a Blender-rendered transition video;
- externally hosted fonts, scripts, textures, or models;
- a screenshot or CSS imitation of the crystals.

## 3. Welcome Page Composition

### 3.1 Desktop layout

The page fills the viewport with a deep navy-to-black background rather than pure black. Sparse stars and very light spatial haze establish depth without competing with the crystals.

The left side occupies approximately 38% of the composition and contains:

- the `ZHEN` identity mark in the upper-left;
- the exact main title `WELCOME to MY BLOG`, with the lowercase `to` intentionally preserved and visually subordinated;
- the subtitle `A personal space for development, research, and ideas.`;
- the small topic line `DEVELOPMENT · RESEARCH · NOTES`;
- a restrained `SCROLL TO EXPLORE` label and vertical guide near the lower-left.

The `00` state contains no Chinese text.

The right side occupies approximately 62% and contains:

- the person, code, research/study, and contact crystals;
- the smaller center crystal;
- a continuous irregular galaxy particle ribbon connecting the four outer crystals.

The crystals form a perspective-aware elliptical orbit instead of a rigid grid. The initial semantic placement is:

- person: upper-left of the orbit;
- code: upper-right;
- research/study: lower-left;
- contact: lower-right;
- center crystal: near the visual axis.

All four outer crystals have equal visual priority and clarity in state `00`. They have enough negative space to remain individually legible and do not overlap. The center crystal is smaller and functions as the orbital anchor.

### 3.2 Header and state indicator

The persistent header contains:

- `ZHEN` at the upper-left;
- `ABOUT / DEVELOPMENT / RESEARCH / CONTACT` at the upper-right;
- a `00` section indicator.

Navigation clicks use the same 3D transition system as wheel navigation. They do not perform an abrupt page jump.

### 3.3 Mobile layout

Mobile is a stability-first adaptation rather than the primary visual approval target. The title sits above a scaled version of the complete crystal system. All four outer crystals and the center crystal remain present. Touch movement may provide a small parallax response. Post-processing quality is reduced as necessary to maintain stable interaction and control device heat.

## 4. Model and Material Policy

The geometry and embedded icon designs from the Blender-authored GLB files remain unchanged. Web runtime presentation may adjust:

- model scale and orbital placement;
- material parameters;
- environment lighting and reflection cards;
- transparency, attenuation, roughness, dispersion, and exposure;
- Bloom, depth of field, and color grading.

The target appearance is a dark-purple translucent gemstone: readable internal forms, bright but controlled edges, and no broad overexposed white regions. The scene may depart from the current `crystal-web` lighting if that produces a stronger final result.

## 5. Idle and Pointer Motion

### 5.1 Idle motion

- Each outer crystal has a small breathing drift and rotation.
- The four animation phases and amplitudes differ so they never move in lockstep.
- The center crystal rotates more slowly and moves less than the outer crystals.
- Galaxy particles travel slowly along the ribbon; local highlights pulse occasionally without rapid flicker.
- Animation is delta-time based and does not change speed with display refresh rate.

### 5.2 Pointer response

Free dragging, panning, and wheel zoom are removed.

When the pointer moves:

- every outer crystal moves slightly toward the pointer while remaining within a bounded area around its orbital anchor;
- crystals nearer the pointer react more strongly than distant crystals;
- each crystal has a different response delay and maximum displacement;
- crystals tilt by no more than approximately `4–6°`, allowing highlights to change with the viewing angle;
- the center crystal moves no more than approximately one third of an outer crystal's displacement;
- the particle ribbon receives a weaker counter-parallax response;
- when movement stops or the pointer leaves, every object returns smoothly to its anchor without spring oscillation or jitter.

A subtle brightness increase may occur near a hovered crystal. The welcome page does not open content cards or display dense information on hover.

When `prefers-reduced-motion` is active, perpetual drift and pointer tilt are substantially reduced or disabled. Necessary section transitions and content fades remain understandable.

## 6. `00 → 01 / ABOUT` Cinematic Transition

Wheel-down from `00` defaults to `01 / ABOUT`. Clicking `ABOUT` triggers the same transition.

The transition duration is approximately `1.35 seconds`, within the approved `1.2–1.5 second` range. Its timing is slow at the beginning, visibly accelerates through the middle, and eases gently into the final frame.

The transition sequence is:

1. Accumulate wheel input until the navigation threshold is reached.
2. Lock new wheel and navigation input for the duration of the transition.
3. Move and fade the welcome copy slightly toward the left.
4. Move the camera along a shallow curved path toward the person crystal. Do not fake the movement by scaling the canvas.
5. Move the person crystal toward the camera on the Z axis and into its final close-up position on the right side of the screen.
6. Let nearby galaxy particles pass the camera at a visibly higher apparent speed.
7. Keep the other three crystals and center crystal in the same scene but farther behind.
8. Rack focus from the full orbital system to the person crystal. The person crystal remains sharp while the background crystals become depth-of-field blurred, darker, and visually smaller.
9. Fade in the existing `01` content skeleton on the left after the camera approaches its resting point.
10. Unlock input only after all camera, crystal, focus, content, route, and indicator states have settled.

Reverse wheel navigation follows the same path backward:

- `01` content fades first;
- focus returns to the full orbit;
- the person crystal returns to its anchor;
- the camera returns to its `00` position;
- the remaining crystals regain equal clarity;
- `WELCOME to MY BLOG` reappears.

The Canvas and GLB assets are not recreated during forward or reverse transitions.

## 7. Other Navigation Targets

The transition controller exposes targets for all four outer crystals. Clicking `DEVELOPMENT`, `RESEARCH`, or `CONTACT` can focus the corresponding crystal and enter the existing section skeleton through the same state machine. This phase does not redesign the content of those sections, and detailed visual tuning is required only for the approved `00 → 01` path.

Rapid wheel input, repeated clicks, and mixed wheel/click input cannot start overlapping transitions. A new target may be queued only after the active transition settles.

Hash state updates as navigation begins, and refreshing a supported hash restores its corresponding settled section state without replaying the entire welcome transition.

## 8. Architecture

### 8.1 Component responsibilities

- `PortfolioView`: owns DOM content, header, section indicator, and current section presentation.
- `CrystalScene`: owns the single persistent Three.js Canvas and its lifecycle.
- `CrystalAssetLoader`: loads the five local GLB files in parallel and validates required assets.
- `CrystalMaterials`: creates and owns the glass, icon, highlight, and center-crystal materials.
- `ParticleRibbon`: owns the star field and the continuous galaxy connection.
- `CrystalMotionController`: owns idle motion and bounded pointer response.
- `SectionTransitionController`: owns camera paths, crystal focus positions, focus distance, transition locking, and reverse motion.
- `QualityProfile`: selects pixel ratio, particle count, Bloom quality, depth-of-field quality, and mobile degradation.

Each unit exposes a narrow interface and owns the resources it creates. Material, geometry, texture, render target, composer, listener, and animation disposal must be explicit.

### 8.2 State flow

The state flow is single-directional:

`Hash route → active section → transition target → camera/crystal state + DOM content + indicator`

The Hash route is the canonical settled section state. The transition controller may hold a temporary `transitioning` state but does not create an independent competing route state.

## 9. Reliability and Fallbacks

- Show a minimal English loading state until the required initial assets are ready.
- If one outer crystal fails, keep navigation and DOM content functional and show a restrained missing-visual state for that target.
- If WebGL is unavailable, render the full deep-background DOM experience and navigation without creating fake CSS crystals.
- Do not invent personal information, project descriptions, email addresses, or links.
- Pause continuous rendering when the document is hidden.
- Dispose the animation loop, listeners, controls, render targets, geometries, materials, textures, composer, and WebGL context when the persistent scene is actually unmounted.

All production assets are local. The implementation must not depend on Google Fonts, runtime CDNs, or foreign network requests, supporting stable access from mainland China.

## 10. Performance Targets

- Desktop approval viewport: `1440×900`.
- Desktop target: stable `50–60 FPS` during idle and pointer movement on the test machine.
- Mobile target: at least `30 FPS`, with quality reduction preferred over crashes, extreme heat, or broken input.
- Keep one Canvas throughout section navigation.
- Cap device pixel ratio and scale particle and post-processing cost by quality tier.
- Reduce or disable depth of field on devices that cannot sustain the mobile target.

## 11. Acceptance Criteria

### Visual

- Desktop `00` matches the approved 38/62 text-and-crystal composition.
- The exact title is `WELCOME to MY BLOG` and the exact subtitle is present.
- No Chinese text appears in state `00`.
- Four distinct outer crystals and one center crystal are visible.
- A continuous irregular particle galaxy connects the four outer crystals.
- Welcome-state crystals have equal clarity and do not overlap.
- Glass highlights are controlled; the crystals are neither nearly black nor broadly overexposed.

### Interaction

- No OrbitControls drag, pan, or wheel zoom remains.
- Each crystal follows the pointer independently within a bounded local range.
- Wheel-down performs the approved cinematic `00 → 01` transition.
- Wheel-up reverses that transition without a jump or scene reload.
- The person crystal finishes sharp on the right; other crystals remain present and depth-blurred.
- Fast wheel input and repeated navigation clicks cannot corrupt the final state.
- Header navigation and Hash routing remain synchronized.

### Responsive and accessibility

- Desktop and `390×844` mobile layouts have no horizontal overflow.
- Reduced-motion mode remains navigable and understandable.
- All real text and links remain DOM content.
- Keyboard-accessible navigation remains available even if WebGL fails.

### Technical

- Production build succeeds.
- Application console contains no errors.
- Only one Canvas exists during section navigation.
- Refreshing each supported Hash produces the correct settled state.
- Unmounting the scene stops RAF, removes listeners, and releases WebGL resources.
- Browser screenshots and a short interaction video verify the actual visual result and camera transition.

## 12. Out of Scope for This Phase

- redesigning the detailed content of `01–04`;
- finalizing personal biography or project data;
- creating additional Blender geometry beyond the supplied five models;
- deployment, domain configuration, ICP filing, analytics, or WordPress integration;
- merging into a protected branch or publishing without separate approval.
