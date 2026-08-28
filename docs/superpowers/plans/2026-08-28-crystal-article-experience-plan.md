# Crystal Article Experience Implementation Plan

1. Add tracked empty Markdown category directories and a normalized content loader with metadata validation, sorting, and lookup helpers.
2. Add compact latest-writing entries to Development and Research, emitting navigation intents to the persistent portfolio scene.
3. Add hash routes and independent archive/detail views with empty, missing, previous/next, and Markdown-rendering states.
4. Extend the Three.js section transition controller with portal-enter and portal-exit states, and add a CSS veil fallback for reduced motion or unavailable WebGL.
5. Coordinate forward and return transitions without coupling article content to the scene internals.
6. Add structure/data tests, build, run desktop browser journeys for both categories and both entry paths, check direct refresh/back/empty states, and inspect the console.
