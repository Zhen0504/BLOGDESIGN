# Session Intro and Loading Overlay Design

## Objective

Turn the existing ZHEN animation into a deliberate first-entry experience and add a related LOADING animation for genuine slow resource loading. The two states must share one visual language without replaying a long cinematic intro during normal portfolio navigation.

## Approved experience

### First entry in a browser-tab session

- Play the current full-screen ZHEN line-drawing animation once.
- A browser-tab session is defined by `sessionStorage`; refreshing or returning to the portfolio in the same tab does not replay the full intro.
- The intro remains gated by both its minimum presentation time and the initial 3D scene-ready signal.
- Record the session flag only after the intro completes. If initialization is interrupted before completion, the next attempt may show the intro again.

### Later loads in the same session

- Do not replay ZHEN.
- If a genuine asynchronous load finishes within 300 ms, show no loading overlay.
- If it remains pending beyond 300 ms, show a full-screen, lightly dimmed and blurred overlay.
- Display `LOADING` in the same rounded monoline, violet/indigo/ice/gold gradient language as ZHEN.
- Display the exact caption:

  `NETWORK CONDITIONS MAY DELAY THE EXPERIENCE.`

- When loading completes, let the current stroke motion reach a visually complete frame, with a 700 ms maximum wait, then fade the overlay out over approximately 400 ms.
- Once shown, keep the overlay visible for at least 500 ms to prevent a flash.

### Normal section navigation

- Switching among 00–04 does not show LOADING.
- Existing 3D camera movement, crystal focus, particle-title transitions, wheel navigation, and navigation locking remain responsible for those transitions.
- LOADING is reserved for unresolved model, route, or network-backed resources.

## Visual design

- ZHEN keeps its current size, position, palette, and first-entry pacing.
- LOADING uses the same line caps, joins, stroke weight, gradient palette, and dark transparent surface.
- LOADING is smaller than the ZHEN opening mark so it reads as system feedback rather than a second title screen.
- The page beneath remains recognizable but is dimmed and softly blurred. The overlay must not introduce a different rectangular background tone.
- The caption uses the existing UI font, uppercase styling, restrained opacity, and wide tracking.
- No React dependency is introduced.

## Component boundaries

### Shared line-wordmark renderer

A small presentation component owns the monoline glyph rendering, per-letter delays, palette assignment, completed state, and reduced-motion state. It accepts a supported word variant (`ZHEN` or `LOADING`) rather than arbitrary text so every glyph can be optically tuned.

### ZHEN session intro

The existing intro remains responsible for first-entry timing and the scene-ready gate. It receives a decision from the parent about whether the session intro should be shown and reports reveal start and completion as it does now.

### LOADING overlay

A separate overlay owns the 300 ms appearance delay, 500 ms minimum visible time, completion-frame handoff, 700 ms completion cap, and 400 ms fade. It receives a boolean pending state and does not know why the resource is loading.

### Loading coordinator

The portfolio view coordinates three facts:

1. whether the ZHEN intro has completed in this tab session;
2. whether the initial crystal scene is ready;
3. whether a genuine later asynchronous operation is pending.

The coordinator never maps ordinary 00–04 route changes to the later-loading state.

## State flow

### New tab session

1. Read the versioned session key.
2. If absent, show ZHEN and begin scene initialization behind it.
3. Wait for the minimum intro duration and scene readiness, with the existing safety timeout.
4. Fade out ZHEN, unlock interaction, and write the session key.

### Existing tab session

1. Skip ZHEN.
2. Start scene initialization immediately.
3. If ready within 300 ms, unlock with no overlay.
4. If still pending, show LOADING.
5. On readiness, finish the visible stroke state and fade out.

### Later genuine load

1. Mark the operation pending.
2. Apply the same 300 ms anti-flash delay.
3. Show LOADING only if still pending.
4. Resolve through the same minimum-visible and fade behavior.

## Error handling

- The loading overlay must never trap the visitor indefinitely.
- Preserve the existing scene initialization timeout and fallback behavior.
- If a later operation fails, clear LOADING and let the owning view present its real error or fallback state.
- If `sessionStorage` is unavailable, continue safely and treat the current mount as a first entry; do not block rendering.
- Do not change the caption into a false hard-error message merely because loading is slow.

## Accessibility and motion

- Both overlays remain status regions with meaningful English accessible labels.
- The decorative letter paths stay hidden from assistive technology.
- With reduced motion, render the complete wordmark without looping strokes and use a short opacity transition only.
- Keyboard, wheel, and navigation interactions stay locked only while a full-screen overlay is actually active.

## Verification

- Fresh tab: ZHEN appears once and waits for scene readiness.
- Reload in the same tab: ZHEN does not replay.
- Scene ready before 300 ms: LOADING never flashes.
- Scene ready after 300 ms: LOADING appears with the exact approved caption and exits cleanly.
- 00–04 transitions: LOADING never appears.
- Hard timeout or initialization failure: the overlay releases to the existing fallback.
- Reduced-motion mode: no repeated drawing animation.
- Desktop visual capture confirms no background-tone seam around either overlay.
- Structure tests, crystal-scene tests, production build, browser console, and navigation regression checks pass.

## Scope exclusions

- No redesign of the crystal models, portfolio content, section transitions, or mobile composition.
- No artificial delay is added solely to make LOADING visible.
- No global network interception layer or service worker is introduced in this pass.
