# Sprinter Animation Studio

A browser playground for the original Sprinter van SVG, with eight expressions and shadcn/ui controls backed by Base UI.

## Run locally

Requires **Bun 1.4.2** (the stable version used by this project).

```sh
bun install
bun run dev
```

Open **http://localhost:5173/**. This is a single static page; it does not use a client-side router.

## Controls

- **Expressions:** idle, happy, thinking, working, excited, success, concerned, sleepy.
- **Ambient animation:** enable or disable motion while retaining the expression.
- **Replay:** restart the selected animation, including the one-shot success celebration.
- **Pupils / Exhaust:** customize their colors; the headlamp sockets stay black.
- **Reset to defaults:** restore idle, animation enabled, and the original colors.

The pupils blink, glance, change shape with the selected expression, and follow your pointer with damped springs from Motion. Each black socket and pupil clip uses the actual lens contour extracted from the base SVG, rather than an approximate ellipse. The original eyebrows/lashes and exhaust animation are retained.

The animation respects the browser's `prefers-reduced-motion` setting, including disabling pointer-following.

## Build

```sh
bun run typecheck
bun run build
bun run preview
```

The production build is written to `dist/`. Preview defaults to **http://localhost:4173/**. Any static web host can serve this page; no routing rewrites or backend are needed.

## GitHub Pages

**Live playground:** https://callajd.github.io/animation/

The public source repository is https://github.com/callajd/animation. Pushes to `main` automatically build and deploy the page using `.github/workflows/pages.yml`. The workflow pins Bun 1.4.2 and installs dependencies from `bun.lock` with `--frozen-lockfile`.

The Pages build uses Vite's `/animation/` asset base so scripts, styles, and fonts load correctly under the repository URL. The app itself is still a single page, with no hash or additional routes.

To preview the Pages build locally:

```sh
bun run build:pages
bun run preview:pages
```

Open **http://localhost:4173/animation/**. You can also trigger deployment manually from the repository's Actions tab.

## Project layout

- `src/animation_ready_van.svg` — original logo, imported as text through Vite.
- `src/SprinterVan.tsx` — SVG preparation and expression component.
- `src/SprinterVan.css` — pupil expressions, blinks, glances, and existing body/exhaust animation.
- `src/usePupilGaze.ts` — spring-smoothed pointer-following.
- `src/SprinterVan.example.tsx` — interactive playground and controls.
- `src/pages/AnimationPage.tsx` — page layout.
- `src/App.tsx` — single-page app entry.
- `src/components/ui/` — installed shadcn/ui Base UI components.
- `src/styles.css` — Tailwind CSS 4, shadcn theme, and responsive page styling.
- `components.json` — shadcn Base Nova configuration.

The app uses **TypeScript 7.0.2**, **React 19.3.0**, and **Vite 5.4.21**. The SVG stays in `src/`; no separate public copy or runtime asset request is needed for the playground. The component's optional URL-loading API uses Effect 4 for cancellation and error handling.

To add more Base UI–backed components:

```sh
bunx --bun shadcn@latest add <component>
```

No test framework or test files are included.
