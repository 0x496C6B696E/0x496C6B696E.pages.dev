# Design system

A dark room lit by one desk lamp: three monitors, warm amber light on wood and metal, and a Linux desktop on the centre screen. Amber is the system colour (selection, prompt, folders, the lamp), burnt orange its second hue; both come from the lamp light. Readable first; atmosphere second.

## Tokens (`src/app/globals.css`, Tailwind v4 `@theme`)

| Token | Value | Use |
| --- | --- | --- |
| `void` | `#0b0a08` | page background, canvas clear colour |
| `surface` | `#17140f` | window body |
| `raised` | `#1f1b14` | menus, tiles |
| `edge` | `#2e2820` | neutral borders |
| `accent` | `#f5b73b` | amber: selection, focus ring, prompt user, folders, primary button (dark text) |
| `accent-deep` | `#c98a12` | folder shadow side, bar gradient start |
| `signal` | `#e8743b` | burnt orange: wallpaper glow, bar gradient end |
| `glow` | `#ffe9b8` | highlights, selected path segment |
| `ok` | `#8fd16b` | prompt frame, "ready", healthy bars |
| `ink` | `#f1ebdf` | primary text |
| `ash` | `#b3a893` | secondary text |
| `dust` | `#6b7483` | tertiary text, hints, status bars |

Contrast: `ink` on `surface` about 15:1; `ash` on `surface` about 7.9:1; `accent` on `surface` about 10:1; `dust` about 4.7:1.

## Typography

| Role | Font | Notes |
| --- | --- | --- |
| Display and UI | Inter (variable) | wordmark, window and section titles (600, tight tracking), buttons, labels, body. 14 to 18px body, line-height 1.6 to 1.7. Sentence case everywhere; no tracked capitals. |
| Mono | JetBrains Mono 400/600 | file names, paths, repository names, the boot log, the terminal, status bars, the painted screens. |

Fonts are self-hosted through `next/font/google` (downloaded at build, served from the same origin).

## Surfaces

- **Window** (`.win` + `.win-title` + `.win-tools` + `.win-status`): opaque dark body, 10px radius, 1px white border at 9%, deep shadow. Title bar: app icon, centred "file — App" title, maximize and close (close turns red on hover). Path bar: `~ › projects › CreateOS` as chips, the current one amber. Status bar links the previous and next files. Max width 64rem (78rem for wide content; 100% when maximized). Entrance: 10px rise over 300 ms, transform only.
- **Panel** (`.ospanel`, `.panel-btn`, `.panel-btn-text`): fixed 36px bar at the top, 92% dark, blur from `md`; 32px square buttons, the Desk button carries its word; active state amber at 22%.
- **Browser window** (`.browser-bar`, `.browser-url`): the window's tool slot holds back/forward/reload glyphs, a pill address bar with a lock, and the one link out to github.com.
- **Applications menu** (`.apps-menu`, `.menu-item`): 17rem dropdown under the dragon button, grouped (Favourites, Files, Session), hover amber at 18%.
- **Desktop icons** (`.desk-icons`, `.desk-icon`): a column at the left from `md` (auto-flow into a second column), a grid on phones; label under the glyph with a text shadow; selected state amber at 28%. Dimmed to 55% while a window is open.
- **Glyphs** (`.glyph-folder`, `.glyph-file`, `.glyph-round`): CSS only. Folder: amber tab and body. File: paper with a folded corner and the extension printed in a colour per type (md brown, json amber, yaml pink, log slate, eml teal). Round: Firefox and the Trash.
- **Files app** (`.files-places`, `.file-grid`, `.file-list`): places sidebar; icon grid for the home folder; a detailed list (name, type, language, last push) for the projects folder.
- **Card** (`.card`): 8px radius, white border at 7%; interactive cards warm the border to amber.
- **Terminal** (`.term`): window chrome, JetBrains Mono, the two-line prompt `┌──(user㉿host)-[~]` / `└─$` in green frame, amber user, warm white path.
- **Hint chip** (`.hint-chip`): what the pointer is over on the desk, mono on 88% dark.

## Controls

- `.btn` base: Inter 600, 6px radius, 44px minimum height, white border at 12%. `.btn-primary` is flat amber with dark text; `.btn-ghost` is text-only until hovered. `.btn-sm` for secondary rows (38px).
- `.tag`: mono chips for technologies and sources. `.kbd`: keyboard hints.
- Focus: 2px amber outline, 2px offset, everywhere (`:focus-visible`).
- Tabs follow the WAI-ARIA pattern (roving tabindex, arrow keys, Home/End). The applications menu is `role=menu` with Escape and outside-click to close. The Trash is a `role=dialog`.

## Motion

| Element | Motion | Reduced motion |
| --- | --- | --- |
| Lock -> desktop | lock screen fades 0.5 s; the boot log (9 lines at 230 ms, gradient progress bar, 0.5 s hold) is painted on the 3D monitor while the camera moves in; the HTML OS fades in (450 ms) once the camera has settled; skippable with Esc/Enter/Space | boot skipped, camera snaps |
| Camera | damped move between lock, desk and screen targets; hand-held sway and pointer parallax at the lock view; at the desk, drag orbits (yaw ±40°, pitch -6° to +17°) and the wheel moves between 1.9 and 3.3 m; static at the screen | snaps, no sway, no parallax |
| Lower centre screen (3D) | canvas redrawn: sleeping dot while locked, boot log at ~14 fps, a small painted desktop (panel, icons, clock) every 0.5 s when seen from the desk, the wallpaper alone under the HTML OS | unchanged (decorative texture) |
| Upper and portrait screens (3D) | system monitor with random-walking CPU bars at 4 fps; build log adding a line every 0.6 s; or off | unchanged |
| Desk objects | lamp light on/off; mug level per sip; plant leaves spring for 0.9 s when poked; RGB theme (amber, spectrum, ember, off) on fans, keyboard underglow and bias strip | unchanged |
| Wallpaper (CSS) | two blurred colour blobs drift over 24 s behind two still ribbons | static |
| Windows, Trash, overlays | CSS `panel-in` 300 ms / `rise-in` 500 ms | instant |
| Bars | 1.1 s width grow | instant |

## Iconography

- UI icons: [lucide](https://lucide.dev) (ISC). Apps: FileText (Text Editor), Folder (Files), Activity (System Monitor), Mail (Mail). Panel: Folder, SquareTerminal, Armchair (desk), Volume2/VolumeX, Box (mode), Power. Lock screen: Power. Desk overlay: Monitor.
- Brand icons: [Simple Icons](https://simpleicons.org) (CC0 1.0), imported individually: the Kali Linux dragon for the applications button, the Firefox mark for the browser launcher, GitHub and the technology marks. Missing brands fall back to a two-letter monogram.
- Favicon (an amber-framed monitor), OG image (a window on the wallpaper under a panel) and the room are generated in this repository.

## Layout rules

- 16px gutters at phone widths via `.safe-x` (respects `env(safe-area-inset-*)`), no horizontal scroll at 320px.
- The panel is 36px tall; windows start below it (`--panel-h`), `scroll-padding-top` keeps anchors clear of it.
- Desktop icons: grid on phones (hidden while a window is open), left column from `md`.
- Windows stack to one column under 1024px; sticky side rails only at `lg`.
- Touch targets >= 44px; hover-only information is mirrored in text or `sr-only` copy; the desk hint is a live region.
