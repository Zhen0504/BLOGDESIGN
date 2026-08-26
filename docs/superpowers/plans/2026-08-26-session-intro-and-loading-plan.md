# Session Intro and Loading Overlay Implementation Plan

## Goal

Implement the approved once-per-tab ZHEN intro and delayed LOADING overlay without changing normal 00–04 transitions.

## Tasks

1. Add a small session helper with a versioned `sessionStorage` key and safe read/write fallbacks.
2. Extract the ZHEN monoline glyph rendering into a reusable line-wordmark component and add optically tuned LOADING glyphs.
3. Refactor ZhenIntro to use the shared renderer while preserving its current timing, scene-ready gate, timeout, caption, and reduced-motion behavior.
4. Add a LoadingOverlay component with a 300 ms display delay, 500 ms minimum visible duration, completed-stroke settle state, 700 ms exit cap, 400 ms fade, and hard timeout release.
5. Update PortfolioView to choose the first-session intro or returning-session loader and keep normal section transitions independent.
6. Extend structural tests for the shared renderer, session behavior, exact caption, anti-flash timing, and route-transition exclusion.
7. Run structure tests, crystal tests, production build, and browser checks for fresh-session, returning-session fast/slow loading, 00–04 navigation, reduced motion, console errors, and background consistency.

## Files

- Add `src/components/intro/LineWordmark.vue`.
- Add `src/components/intro/LoadingOverlay.vue`.
- Add `src/components/intro/sessionIntro.js`.
- Modify `src/components/intro/ZhenIntro.vue`.
- Modify `src/views/PortfolioView.vue`.
- Modify `tests/unit/project-structure.test.mjs`.

## Completion

- Commit the implementation separately from the approved design and this plan.
- Do not push, merge, or deploy without explicit approval.
