# Architecture

BonfireOS is a fully static Next.js 16 (App Router) site. `next build` writes `out/`; nothing runs on a server after that.

## Rendering strategy

| Concern | Decision |
| --- | --- |
| Output | `output: "export"`, `images.unoptimized: true`. Every route is an HTML file; dynamic quest pages come from `generateStaticParams`. |
| Navigation | Real routes (`/about`, `/projects/[slug]`, ...) rendered inside a persistent root layout. Client-side transitions keep the 3D scene mounted; deep links and the back button work because every panel is a URL. |
| Data | Typed TypeScript files in `src/data` plus a JSON snapshot of the public GitHub API written at build time. No runtime fetches, no API keys in the bundle. |
| State | One React context (`ExperienceProvider`) holding mode (immersive/explorer), entered flag, stage (entry/hub/panel), reduced-motion, WebGL capability and a low-power hint. `localStorage` remembers the mode, `sessionStorage` remembers that the camp was entered. |
| 3D | React Three Fiber scene, lazy-loaded with `next/dynamic` only when Immersive mode is active and WebGL exists. The CSS scene underneath is always rendered and doubles as the loading state and the fallback. |
| Motion | CSS only: keyframes for panel/hub entrances, embers and bars; transitions for hover and reveals. A global `prefers-reduced-motion` rule collapses every animation. The brief suggested Motion/Framer Motion; it was dropped after Lighthouse showed its ~47 KB and hydration cost on throttled mobile without any visual gain over CSS. |

## Layers

```text
src/app                      routes, metadata, sitemap, robots, 404
  layout.tsx                 fonts, metadata, JSON-LD, <Backdrop/> <Hud/> <main/>
  page.tsx                   hub (entry screen -> kindling -> waystones)
  about|skills|projects|stack|stats|contact/page.tsx
  projects/[slug]/page.tsx   quest dossier (static params from data)
src/config/site.ts           identity, hostname, destinations (the only place personal data lives)
src/data                     projects.ts, skills.ts, stack.ts, github.ts + github.snapshot.json
src/components
  experience/                ExperienceProvider, Backdrop, EmberFallback (CSS camp)
  scene/BonfireScene.tsx     R3F camp: camera rig, fire, embers, ruins, mist, stars
  hub/                       EntryScreen, Hub (waystones), HubExperience (transition state machine)
  hud/Hud.tsx                fixed top bar: brand, breadcrumb, mode toggle, return
  ui/                        Panel (destination surface), Tabs, TechIcon, DestinationIcon
  about|skills|stack|contact/ destination-specific interactive pieces
src/lib                      cn, format, useMediaQuery
scripts                      fetch-github (prebuild), verify-export (postbuild), serve-out (static server), make-assets (OG + icons)
tests/unit                   Vitest: data integrity, formatting, sigil decoding
tests/e2e                    Playwright against the exported site: navigation, keyboard, console/network hygiene, links, a11y basics, responsive sweep + screenshots, immersive mode
public                       _headers (CSP etc.), og.png, icons, avatar, project charts
qa/screenshots               visual QA output (committed), see QA_REPORT.md
```

## Experience state machine

```text
            visit "/"                     ENTER / Skip
  [entry] ───────────────▶ (entered=false) ──────────────▶ [kindling 1.5 s, skippable] ──▶ [hub]
                                                             (skipped entirely in Explorer
                                                              mode or reduced motion)
  visit "/about" etc.  ─────────────────────────────────────────────────────────────────▶ [panel]
  Esc or "Return" from a panel ─────────────────────────────────────────────────────────▶ [hub]
```

The scene reads the stage to pick a camera target (far camp, hub, panel) and sets `frameloop="never"` while a panel is open so the GPU idles behind the content.

## Fallbacks and degradation

- **No WebGL / context loss**: `webglcontextlost` or a failed capability probe switches to the CSS scene permanently for the session.
- **Reduced motion**: no kindling, no ember animation, camera snaps instead of damping, `motion` entrances disabled.
- **Low power** (small screen, `saveData`, few cores): DPR capped at 1, fewer embers, no mist layer. Phones and weak devices default to Explorer so the first load never includes three.js; the HUD toggle opts into 3D and the choice is remembered.
- **No JavaScript**: the entry screen, all panel content, links and metadata are in the HTML. Only the button needs JS.

## Security model

Static hosting means there is no server to compromise, but also no per-request nonces. `public/_headers` ships a CSP that allows only same-origin assets plus the inline hydration scripts Next.js requires (`'unsafe-inline'` in `script-src`). No third-party scripts, fonts (self-hosted by `next/font`), analytics or cookies. External links use `rel="noopener noreferrer"`. The GitHub fetch happens in a Node script at build; an optional `GITHUB_TOKEN` is read there only.

## Decisions worth knowing

- **No drei, no postprocessing**: the scene is a handful of primitives and sprites; bloom-like glow is done with additive sprites. Smaller bundle, fewer moving parts.
- **HTML waystones over 3D raycasting**: hotspots are real links. Keyboard, screen readers and SEO get them for free; the 3D scene stays decorative.
- **No GitHub Actions**: requested by the owner. `npm run verify` runs the same pipeline (typecheck, lint, unit, build + export verification, e2e) locally; Cloudflare Pages builds on push.
- **GitHub stats are a snapshot**: contribution graphs need authenticated GraphQL, so they are omitted rather than approximated. The page states the snapshot date.
