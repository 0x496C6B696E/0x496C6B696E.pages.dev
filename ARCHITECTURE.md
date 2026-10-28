# Architecture

A fully static Next.js 16 (App Router) site. `next build` writes `out/`; nothing runs on a server after that.

## Rendering strategy

| Concern | Decision |
| --- | --- |
| Output | `output: "export"`, `images.unoptimized: true`. Every route is an HTML file; dynamic project pages come from `generateStaticParams`. |
| Navigation | Real routes (`/files`, `/about`, `/projects/[slug]`, ...) rendered inside a persistent root layout. Client-side transitions keep the 3D room mounted; deep links and the back button work because every window is a URL. |
| Data | Typed TypeScript files in `src/data` plus a JSON snapshot of the public GitHub API written at build time. The only runtime request to another origin is the avatar image from GitHub's avatar CDN (allowed in the CSP `img-src`), so a new profile picture shows up without a redeploy; `public/avatar.jpg` is refreshed at build as the fallback. No API keys in the bundle. |
| State | One React context (`ExperienceProvider`) holding mode (immersive/explorer), entered flag, view (screen/desk), stage, the boot state, whether the 3D camera has settled, whether the room is drawing, reduced-motion, WebGL capability, a low-power hint, terminal visibility, the sound toggle, the desk hint and a power-on event bus. `localStorage` remembers the mode, `sessionStorage` remembers that the machine was powered on. |
| 3D | React Three Fiber room, lazy-loaded with `next/dynamic` only when Immersive mode is active and WebGL exists. The CSS wallpaper underneath is always rendered and doubles as the loading state and the fallback. |
| Motion | CSS only for the UI: keyframes for window entrances and the boot progress; transitions for hover and reveals. The camera and the painted screens are the only JavaScript animation. A global `prefers-reduced-motion` rule collapses every CSS animation. |

## Layers

```text
src/app                      routes, metadata, sitemap, robots, 404
  layout.tsx                 fonts, metadata, JSON-LD, <Backdrop/> <main/> <OsShell/> <Terminal/> <GlobalKeys/>
  page.tsx                   lock screen -> boot -> desktop (Session)
  files/page.tsx             the Files app on the home folder
  about|skills|projects|stack|stats|contact/page.tsx
  projects/[slug]/page.tsx   project window (static params from data)
src/config/site.ts           identity, hostname, the six files and the app each opens in (the only place personal data lives)
src/data                     projects.ts, skills.ts, stack.ts, github.ts + github.snapshot.json
src/components
  experience/                ExperienceProvider, Backdrop, RoomFallback (CSS wallpaper), GlobalKeys
  scene/WorkstationScene.tsx R3F room: camera rig, desk, three monitors with canvas-painted screens, keyboard, tower, lamp, mug, plant,
                             speakers, headphone stand, bias light, dust; every object on the desk is a click target with a hint
  desktop/                   LockScreen, BootSequence (HTML fallback), DesktopHome (status line), Session (sequencer)
  os/                        OsShell (panel + icons + Trash, or the desk overlay), Panel, AppsMenu, DesktopIcons, TrashWindow,
                             DeskOverlay, FileGlyph (CSS folder / file / app glyphs)
  terminal/Terminal.tsx      shell window over lib/terminal.ts with the two-line prompt
  ui/                        AppWindow (window chrome), Tabs, TechIcon, DestinationIcon
  about|skills|stack|contact/ app-specific interactive pieces
src/lib                      cn, format, useMediaQuery, boot (shared boot log and clock), terminal (pure command interpreter),
                             useHum (Web Audio room tone)
scripts                      fetch-github (prebuild), normalize-export + verify-export (postbuild), serve-out, make-assets (OG + icons)
tests/unit                   Vitest: data integrity, formatting, terminal parser, boot log
tests/e2e                    Playwright against the exported site: navigation, folders/Trash/menu, keyboard, terminal, console/network
                             hygiene, links, a11y basics, responsive sweep + screenshots, immersive mode (boot on the monitor, desk)
public                       _headers (CSP etc.), og.png, icons, avatar, project charts
qa/screenshots               visual QA output (committed), see QA_REPORT.md
```

## Session state machine

```text
                 POWER ON (screen button, tower button or the monitor) / Skip boot
  [lock] ───────────────────────────────────────────────────▶ [boot ~2.3 s, skippable] ──▶ [desktop]
   ▲                                                           painted on the 3D monitor while the
   │  Lock screen (panel, menu) or the tower's power button     camera travels; HTML boot if the room
   │  at the desk                                               is not drawing yet; skipped in Explorer
   │                                                           mode and under reduced motion
  [desktop] ◀──── Esc, × or the Trash/menu ───── [window]  (visit "/about" etc. lands here directly)
  [desktop] ──── "Back to the desk" (panel, menu) ────▶ [desk] ──── centre screen, keyboard, Esc, button ────▶ [desktop]
```

Stages map to camera targets: `lock` (three-quarter view), `desk` (frontal, everything clickable), `desktop` and `window` (the centre screen fills the viewport). The camera reports `settled` when it arrives; the HTML operating system is gated on `osReady = boot finished && (explorer || reduced motion || settled)`, so text never appears before the screen does. While a window is open the canvas drops to a 4 to 8 fps demand loop.

## Panel, icons, terminal and sound

- `OsShell` lives in the layout so the panel and the desktop icons stay behind every window. The panel holds the applications menu, launchers (Files, Terminal, Firefox -> GitHub), the open window's title, back-to-desk, sound, mode, a clock and lock. Icons: Home and projects (folders), the five files, Firefox and the Trash; folders and files are CSS glyphs.
- `AppWindow` is the window chrome: "file — App" title with maximize and close, a path bar, the body, a status bar linking the neighbouring files. `/files` reuses it with its own chrome.
- `lib/terminal.ts` is a pure command interpreter over the same typed data files (`ls`, `cd`, `projects`, `open`, `neofetch`, `stats`, `mode`, ...). `Terminal` renders it as a window (backtick, panel button or the keyboard on the desk) and performs navigation through the router. Unit tests cover the parser.
- `lib/boot.ts` holds the boot log and its clock, shared by the HTML boot screen and the canvas painter so both run the same lines in the same time.
- `lib/useHum.ts` synthesises a quiet fan hum and air noise with the Web Audio API. It is off until the visitor presses the panel toggle or the speakers on the desk, so autoplay rules are respected and nothing is downloaded.

## Fallbacks and degradation

- **No WebGL / context loss**: a failed renderer construction is caught by an error boundary around the scene, and `webglcontextlost` disables 3D for the session; both switch to the CSS wallpaper permanently. The desk view is only offered in Immersive mode.
- **Reduced motion**: no boot sequence, no sway or parallax, camera snaps, CSS entrances collapse.
- **Low power** (small screen, `saveData`, few cores): DPR capped at 1, no dust, slower demand loop. Phones and weak devices default to Explorer so the first load never includes three.js; the panel toggle opts into 3D and the choice is remembered.
- **No JavaScript**: the lock screen, all window content, links and metadata are in the HTML. Only the power button needs JS.

## Security model

Static hosting means there is no server to compromise, but also no per-request nonces. `public/_headers` ships a CSP that allows only same-origin assets plus the inline hydration scripts Next.js requires (`'unsafe-inline'` in `script-src`). No third-party scripts, fonts (self-hosted by `next/font`), analytics or cookies. External links use `rel="noopener noreferrer"`. The GitHub fetch happens in a Node script at build; an optional `GITHUB_TOKEN` is read there only.

## Decisions worth knowing

- **No drei, no postprocessing, no models**: the room is boxes, cylinders, a torus or two, an instanced keyboard, canvas textures for the three screens and a few emissive parts whose colour cycles per frame. Small bundle, nothing to license.
- **HTML desktop over 3D hit-testing**: the files on the desktop are real links drawn over the screen. Keyboard, screen readers and SEO get them for free. The 3D click targets (desk objects, power button, monitor) only do things that are also reachable from HTML controls.
- **`main` lets pointer events through**: so the 3D room is clickable at the lock screen and the desk; windows and buttons opt back in with `pointer-events-auto`.
- **No GitHub Actions**: requested by the owner. `npm run verify` runs the same pipeline (typecheck, lint, unit, build + export verification, e2e) locally; Cloudflare Pages builds on push.
- **GitHub stats are a snapshot**: contribution graphs need authenticated GraphQL, so they are omitted rather than approximated. The page states the snapshot date.
