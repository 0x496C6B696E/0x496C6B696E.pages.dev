# Architecture

A fully static Next.js 16 (App Router) site. `next build` writes `out/`; nothing runs on a server after that.

## Rendering strategy

| Concern | Decision |
| --- | --- |
| Output | `output: "export"`, `images.unoptimized: true`. Every route is an HTML file; dynamic project pages come from `generateStaticParams`. |
| Navigation | Real routes (`/about`, `/projects/[slug]`, ...) rendered inside a persistent root layout. Client-side transitions keep the 3D room mounted; deep links and the back button work because every window is a URL. |
| Data | Typed TypeScript files in `src/data` plus a JSON snapshot of the public GitHub API written at build time. No runtime fetches, no API keys in the bundle. |
| State | One React context (`ExperienceProvider`) holding mode (immersive/explorer), entered flag, stage (lock/desktop/window), reduced-motion, WebGL capability, a low-power hint, terminal visibility, the sound toggle and a power-on event bus. `localStorage` remembers the mode, `sessionStorage` remembers that the machine was powered on. |
| 3D | React Three Fiber room, lazy-loaded with `next/dynamic` only when Immersive mode is active and WebGL exists. The CSS wallpaper underneath is always rendered and doubles as the loading state and the fallback. |
| Motion | CSS only: keyframes for window/desktop entrances and the boot progress; transitions for hover and reveals. A global `prefers-reduced-motion` rule collapses every animation. |

## Layers

```text
src/app                      routes, metadata, sitemap, robots, 404
  layout.tsx                 fonts, metadata, JSON-LD, <Backdrop/> <main/> <Dock/> <Terminal/>
  page.tsx                   lock screen -> boot log -> desktop (Session)
  about|skills|projects|stack|stats|contact/page.tsx
  projects/[slug]/page.tsx   project window (static params from data)
src/config/site.ts           identity, hostname, the six files (the only place personal data lives)
src/data                     projects.ts, skills.ts, stack.ts, github.ts + github.snapshot.json
src/components
  experience/                ExperienceProvider, Backdrop, RoomFallback (CSS wallpaper)
  scene/WorkstationScene.tsx R3F room: camera rig, desk, ultrawide with a canvas-drawn panel, keyboard, tower, speakers, plant, bias light, dust
  desktop/                   LockScreen, BootSequence, Desktop (app icons), Session (sequencer)
  dock/Dock.tsx              floating dock: home, six apps, terminal, sound, mode, clock
  terminal/Terminal.tsx      shell drawer over lib/terminal.ts
  ui/                        AppWindow (window chrome), Tabs, TechIcon, DestinationIcon
  about|skills|stack|contact/ app-specific interactive pieces
src/lib                      cn, format, useMediaQuery, terminal (pure command interpreter), useHum (Web Audio room tone)
scripts                      fetch-github (prebuild), normalize-export + verify-export (postbuild), serve-out, make-assets (OG + icons)
tests/unit                   Vitest: data integrity, formatting, terminal parser, boot log
tests/e2e                    Playwright against the exported site: navigation, keyboard, terminal, console/network hygiene, links, a11y basics, responsive sweep + screenshots, immersive mode
public                       _headers (CSP etc.), og.png, icons, avatar, project charts
qa/screenshots               visual QA output (committed), see QA_REPORT.md
```

## Session state machine

```text
            visit "/"                      POWER ON (screen button or 3D tower button) / Skip boot
  [lock] ────────────────▶ (entered=false) ──────────────▶ [boot log ~2.5 s, skippable] ──▶ [desktop]
                                                             (skipped entirely in Explorer
                                                              mode or reduced motion)
  visit "/about" etc.  ─────────────────────────────────────────────────────────────────▶ [window]
  Esc, × or the dock's home from a window ─────────────────────────────────────────────▶ [desktop]
```

The 3D room reads the stage to pick a camera target: a three-quarter view of the desk when locked, the screen filling the viewport at the desktop, a hair closer behind a window. While a window is open the canvas drops to a 4 to 8 fps demand loop so the RGB still cycles but the GPU mostly idles.

## Dock, terminal and sound

- `Dock` is a floating pill that is present on the desktop and inside every window, so any app is one click away without going home first. It also hosts the terminal, sound and mode toggles and a clock (client-only).
- `lib/terminal.ts` is a pure command interpreter over the same typed data files (`ls`, `cd`, `projects`, `open`, `stats`, `mode`, ...). `Terminal` renders it as a drawer above the dock (backtick key or dock button) and performs navigation through the router. Unit tests cover the parser.
- `lib/useHum.ts` synthesises a quiet fan hum and air noise with the Web Audio API. It is off until the visitor presses the dock sound toggle, so autoplay rules are respected and nothing is downloaded.
- `BootSequence` is the progress-bar boot shown between the lock screen and the desktop; every number in it is read from the data files at render time.

## Fallbacks and degradation

- **No WebGL / context loss**: a failed renderer construction is caught by an error boundary around the scene, and `webglcontextlost` disables 3D for the session; both switch to the CSS wallpaper permanently.
- **Reduced motion**: no boot sequence, no sway or parallax, camera snaps, CSS entrances collapse.
- **Low power** (small screen, `saveData`, few cores): DPR capped at 1, no dust, slower demand loop. Phones and weak devices default to Explorer so the first load never includes three.js; the dock toggle opts into 3D and the choice is remembered.
- **No JavaScript**: the lock screen, all window content, links and metadata are in the HTML. Only the power button needs JS.

## Security model

Static hosting means there is no server to compromise, but also no per-request nonces. `public/_headers` ships a CSP that allows only same-origin assets plus the inline hydration scripts Next.js requires (`'unsafe-inline'` in `script-src`). No third-party scripts, fonts (self-hosted by `next/font`), analytics or cookies. External links use `rel="noopener noreferrer"`. The GitHub fetch happens in a Node script at build; an optional `GITHUB_TOKEN` is read there only.

## Decisions worth knowing

- **No drei, no postprocessing, no models**: the room is boxes, cylinders, a torus or two, an instanced keyboard, a canvas texture for the panel and a few emissive parts whose colour cycles per frame. Small bundle, nothing to license.
- **HTML desktop over 3D hit-testing**: the files on the desktop are real links drawn over the screen. Keyboard, screen readers and SEO get them for free. The one 3D click target (the tower's power button) duplicates a visible HTML button.
- **No GitHub Actions**: requested by the owner. `npm run verify` runs the same pipeline (typecheck, lint, unit, build + export verification, e2e) locally; Cloudflare Pages builds on push.
- **GitHub stats are a snapshot**: contribution graphs need authenticated GraphQL, so they are omitted rather than approximated. The page states the snapshot date.
