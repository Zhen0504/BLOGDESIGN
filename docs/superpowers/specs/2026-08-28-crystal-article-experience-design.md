# Crystal Article Experience Design

## Scope

Extend only sections 02 (Development) and 03 (Research) with category-specific writing. Sections 00, 01, and 04 keep their current content behavior.

## Content model

- Articles live as local Markdown files under `content/development` and `content/research`.
- Required front matter: `title`, `date`, `summary`, and `tags`; `cover` is optional.
- Category pages sort valid articles by ISO date descending.
- Section 02 and 03 display at most the latest two articles. Empty slots are not rendered and no sample article is invented.
- `VIEW ALL` remains available even when a category contains no articles.
- Tags are visual metadata. Navigation has exactly two entry paths: a latest-article entry opens its detail, and `VIEW ALL` opens the category list.

## Routes

- `/development/articles`
- `/development/articles/:slug`
- `/research/articles`
- `/research/articles/:slug`

Hash history remains in use so direct refresh works on static hosting.

## Crystal transition

Both latest-article and `VIEW ALL` navigation begin in the persistent Three.js scene. Current DOM content fades, navigation locks, the active crystal turns toward the camera, and the camera/crystal motion makes the crystal fill the viewport. Stronger violet rim light, refraction, depth-of-field, and a final pale violet veil conceal the route swap. Target duration is 1.4–1.8 seconds.

Returning reverses the experience: reading content fades, the veil appears, and the portfolio scene resumes at the originating 02 or 03 crystal. Browser history uses the same exit path.

Reduced-motion, low-quality, or unavailable-WebGL environments use a roughly 400 ms violet crystal-outline veil instead of the full 3D move.

## Reading surfaces

The article list and detail views are independent readable pages. They retain the deep navy palette, restrained violet particles, and subtle refraction atmosphere without continuing the full 3D scene.

Empty categories show `NO ARTICLES YET` and a return-to-crystal action. Missing or invalid articles show `ARTICLE NOT FOUND` without crashing the application.

Detail pages use a roughly 720 px reading column and support headings, paragraphs, lists, code blocks, images, blockquotes, tables, and links. Previous/next navigation and return-to-list controls hide when unavailable. Chinese body copy uses the established Song/FangSong-oriented serif stack; English display text uses the current site fonts.

## Architecture

- A content loader owns Markdown discovery, front-matter validation, sorting, and category lookup.
- Compact previews, list views, and detail views consume normalized article records.
- Article routes remain independent of the Three.js implementation.
- A bounded portal-transition controller owns enter/exit phases and fallback behavior, while the scene exposes only transition commands and completion events.

## Acceptance criteria

- Zero, one, and two latest-article states render without fabricated placeholders.
- Both navigation paths play the correct Development or Research crystal transition.
- Return controls and browser Back restore the correct crystal state.
- Direct detail refresh works under hash routing.
- Invalid Markdown, missing articles, reduced motion, and WebGL failure degrade cleanly.
- Existing overview, about, contact, wheel navigation, pointer motion, and ZHEN session intro remain unchanged.
- Production build, structure tests, browser routes, console, and representative viewport checks pass.
