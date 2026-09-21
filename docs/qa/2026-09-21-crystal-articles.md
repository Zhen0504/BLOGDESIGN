# Crystal articles acceptance — 2026-09-21

## Scope and final state

Continued the interrupted implementation on `codex/personal-portfolio-redesign`, preserving pre-existing changes. No redesign, push, merge or deployment. Both content directories contain only `.gitkeep`. Temporary `qa-check-*.md` articles were removed before the final production build. The previous `qa-portal-article.md` is absent.

## Current automated results

All passed on the final source: `npm run test:articles`, `npm run test:structure`, `npm run test:crystal`, `npm run build`, `git diff --check`.

Article tests cover blank/non-string titles and summaries, impossible/leap dates, malformed/duplicate YAML metadata, invalid tag types and blank tags, cover URL validation, category validation, return state, actual transition-controller progress, missing target crystals, and compact/reduced-motion/non-WebGL2 branches refusing the 3D move. Slow-frame updates do not reach the veil threshold early.

Build retains a Vite warning for the roughly 946 kB main chunk (262 kB gzip). This is not a build failure. Git also reports the configured LF-to-CRLF conversion warning.

## Actual browser checks in this run

- Development with three temporary articles: newest two shown in descending date order; all three correctly ordered in archive.
- Latest Development article click reaches its detail through the portal; VIEW ALL reaches archive.
- Research single-article preview on a 390×844 viewport; article click reaches Research detail.
- Chinese body, code block, table, visible tags and actual cover image loading verified. Temporary cover initially referenced a nonexistent favicon; replaced with an existing image and `naturalWidth > 0` verified.
- Adjacent-article navigation brings its title back into viewport after scrolling to the previous/next control.
- Browser Back restores Development from detail; Forward restores detail; detail reload renders its content. Return button restores the crystal and unlocks navigation.
- Desktop 1280×720 two-card screenshot; mobile 390×844 one/two-card screenshots. Second mobile card bottom measured at 627.49 px. At 390×600, content height 625 px is accessible through the 600 px scroll container.
- Clean production preview: Research VIEW ALL reaches NO ARTICLES YET; archive reload retains empty state; deleted article URL renders ARTICLE NOT FOUND; Development archive empty state verified after final rebuild.
- New-origin ZHEN loading status observed before the portfolio becomes interactive. Its animation source was not modified.

## Code fixes and limits of evidence

Labels now wrap visibly. Cover rendered in detail. Reading shell resets its own scroll position. Veil start follows actual 3D progress. Mobile, reduced motion, low measured frame rate, missing crystal and unavailable WebGL use the CSS fallback. Pending model initialization can be cancelled; late models are disposed. Required-model failure adds the loaded system to the disposal graph before cleanup. Initialization has a 15-second fallback; return watchdog and route-failure recovery unlock controls. Portal timers and scheduled return frame are cleared on unmount.

The failure/unmount safeguards were inspected in code; no browser network-failure injection, GPU memory profiling, physical low-end device test, or OS reduced-motion switch was performed. The controller's reduced-motion/non-WebGL2 paths were tested in Node through Vite, not by claiming an actual disabled-WebGL browser run. No claim of complete resource-leak proof.

Browser tooling exposed no console-log or network interception capability. Therefore a clean runtime console is NOT claimed. Recording documentation returned unavailable; no reliable transition video/sequence was captured. Some click/wait calls timed out; fresh snapshots and node-based interaction verified the eventual routes. One screenshot returned an older frame, so it was excluded from evidence. Screenshot timing is not proof of animation duration or every ZHEN first frame. No exhaustive 00/01/04 regression or all-first-frame guarantee is claimed.

## Evidence

The first three images contain temporary QA articles which are absent from the delivered build.

- [Desktop newest two](crystal-articles/desktop-two-articles.png)
- [Mobile single article](crystal-articles/mobile-one-article.png)
- [Mobile newest two](crystal-articles/mobile-two-articles.png)
- [Production empty Research archive](crystal-articles/empty-research.png)

## Manual acceptance

Open `http://127.0.0.1:4173/#/development`, click VIEW ALL, confirm the empty list, and return with BACK TO CRYSTAL. Repeat for Research, then test browser Back/Forward and reload the archive. Missing detail: `/#/development/articles/qa-check-2`. The README documents adding real Markdown and images.
