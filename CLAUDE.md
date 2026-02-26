# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ATEM** is a 3D spatial thought-mapping Progressive Web App (PWA). Thoughts are rendered as spheres in a THREE.js WebGL scene. The entire application lives in a single file: `index.html`.

Deploy: `vercel --prod`

There is no build step, no package.json, and no test runner.

## Architecture

### Single-file SPA
All HTML, CSS, and JavaScript are inline in `index.html` (~2500 lines). Dependencies are loaded from CDN via an importmap:
- **THREE.js** (v0.160.0) — 3D rendering
- **OrbitControls** — camera manipulation
- **idb-keyval** — IndexedDB persistence

### Global State (`state` object, ~line 527)
```js
let state = {
  version: 13,
  thoughts: [],       // Sphere nodes in 3D space
  connections: [],    // Typed edges between thoughts
  sessions: [],       // Tag-based context groups
  activeSession: null,
  camera: null,
  openToCapture: false,
}
```
State is persisted to IndexedDB on every modification, with localStorage as fallback. Schema migrations are versioned — bump `state.version` when making breaking changes.

### Rendering Pipeline
- WebGL renderer with `requestAnimationFrame` loop
- Selective rendering: only rerenders when dragging, animating, or camera moving
- Thoughts are THREE.js `Mesh` (sphere geometry) with canvas-texture text labels
- `thoughtMap` and `meshMap` provide O(1) lookups between thought IDs and 3D objects
- Labels are frustum-culled (hidden when off-screen)

### Interaction Model
- **Tap** → create thought
- **Drag** → move thought in 3D space (raycasting to a plane)
- **Hold (350ms)** → start a connection between thoughts
- **Lasso** → rectangular multi-select
- Touch and mouse events are unified; mobile is a primary target

### Sessions
Sessions are filters — activating a session shows only thoughts tagged to it. The `activeSession` ID controls which thoughts/connections are visible in the scene.

## PWA / Service Worker

`sw.js` uses a **cache-first** strategy under cache key `atem-vN`. When `index.html` is changed, the cache version **must be bumped** (e.g. `atem-v8` → `atem-v9`) or installed PWAs will keep serving the old cached file indefinitely. This is the most common cause of "works in browser, broken in PWA" bugs.

The hamburger button (`#session-btn`) is positioned `bottom-right` using `env(safe-area-inset-bottom)` and `env(safe-area-inset-right)` so it stays above the home indicator and outside the notch in landscape. The status bar style is `black-translucent` — any fixed element positioned near `top:0` without `env(safe-area-inset-top)` padding will be invisible in standalone mode on iPhone (black button on black status bar on black canvas).
