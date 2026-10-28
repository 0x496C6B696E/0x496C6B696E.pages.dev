# Design system

A dark room, a modern desk, one bright ultrawide. Cool accents (cyan and violet) on near-black glass. Readable first; atmosphere second.

## Tokens (`src/app/globals.css`, Tailwind v4 `@theme`)

| Token | Value | Use |
| --- | --- | --- |
| `void` | `#0a0d12` | page background, canvas clear colour |
| `surface` | `#10151d` | window base |
| `raised` | `#161c27` | window top, icon tiles |
| `edge` | `#232c3b` | neutral borders |
| `accent` | `#5ee1ff` | primary accent (cyan): eyebrows, focus ring, bars, dock indicator |
| `accent-deep` | `#1d8fb0` | bar gradient start |
| `signal` | `#b388ff` | secondary accent (violet): gradients, wallpaper, RGB parts |
| `glow` | `#c9f3ff` | highlights, hovered text, prompt echoes |
| `ink` | `#e7ebf2` | primary text |
| `ash` | `#9aa6b8` | secondary text |
| `dust` | `#67738a` | tertiary text, hints, status lines |

Contrast: `ink` on `surface` about 14:1; `ash` on `surface` about 6.6:1; `accent` on `surface` about 10:1; `dust` is reserved for hints at 12 px+ (about 4:1).

## Typography

| Role | Font | Notes |
| --- | --- | --- |
| Display and UI | Inter (variable) | wordmark, window and section titles (600, tight tracking), buttons, labels, body. 14 to 18px body, line-height 1.6 to 1.7. |
| Mono | JetBrains Mono 400/600 | file names, paths, repository names, the boot log, the terminal, status lines, numbers. |

Fonts are self-hosted through `next/font/google` (downloaded at build, served from the same origin).

## Surfaces

- **Window** (`.panel` + `.titlebar` + `.statusline`): translucent glass (blur from `md`), 16px radius, 1px white border at 8%, soft deep shadow. Title bar: one real close control (`.winclose`, turns red on hover), a mono breadcrumb `~ / projects / CreateOS`, and the app name with its index on the right. Status line links the previous and next files. Max width 64rem (78rem for wide content). Entrance: 14px rise + fade over 400 ms.
- **Card** (`.card`, `.card-interactive`): 12px radius, white border at 7%; hover warms the border to cyan and lifts 2px (not on touch devices).
- **App icon** (`.app-icon`): a 60px rounded tile with a cyan-to-violet gradient fill, the app name, the file name in dimmed cyan mono, a one-line description.
- **Dock** (`.dock`, `.dock-item`): floating glass pill at the bottom; 44px round items, current app marked with a cyan dot, toggles use `aria-pressed`.
- **Terminal**: window chrome above the dock, JetBrains Mono, cyan prompt `0x496c6b696e@workstation:~$`, glow for echoed input, ash for output.

## Controls

- `.btn` base: Inter 600, pill shape, 44px minimum height, white border at 10%. `.btn-primary` is a cyan-to-violet gradient with dark text; `.btn-ghost` is text-only until hovered. `.btn-sm` for secondary rows (40px).
- `.tag`: mono pill chips for technologies and sources.
- `.kbd`: keyboard hints.
- Focus: 2px cyan outline, 3px offset, everywhere (`:focus-visible`).
- Tabs follow the WAI-ARIA pattern (roving tabindex, arrow keys, Home/End).

## Motion

| Element | Motion | Reduced motion |
| --- | --- | --- |
| Lock -> desktop | lock screen fades 0.5 s, boot log (9 lines at 230 ms) with a gradient progress bar, 0.5 s hold; skippable with Esc/Enter/Space/click | skipped entirely |
| Camera | damped move to the stage target; hand-held sway and pointer parallax when locked; near-static at the screen | snaps, no sway, no parallax |
| Panel (3D screen) | canvas redrawn ~10 fps: lock wallpaper with the wordmark and a breathing dot, dim wallpaper once on | unchanged (decorative texture) |
| RGB parts | hue cycles per frame on keyboard underglow, fan rings, bias strip; power button pulses | unchanged |
| Dust | 120 slow points in the bias light (not on low power) | scene not used by default |
| Wallpaper (CSS) | two blurred colour blobs drift over 24 s | static |
| Windows, icons, inspect card | CSS `panel-in` 400 ms / `rise-in` 500 ms with 70 ms `animation-delay` stagger | instant |
| Bars | 1.1 s width grow | instant |

## Iconography

- UI icons: [lucide](https://lucide.dev) (ISC). Apps: FileText (Profile), Cpu (Capabilities), FolderGit2 (Projects), Wrench (Toolchain), Activity (Telemetry), Mail (Mail). Dock: MonitorSmartphone, SquareTerminal, Volume2/VolumeX, LayoutGrid. Lock screen: Power.
- Brand icons: [Simple Icons](https://simpleicons.org) (CC0 1.0), imported individually. Missing brands fall back to a two-letter monogram.
- Favicon (a gradient-framed monitor), OG image (a glass window on the wallpaper with a dock) and the room are generated in this repository.

## Layout rules

- 16px gutters at phone widths via `.safe-x` (respects `env(safe-area-inset-*)`), no horizontal scroll at 320px.
- Desktop: 2-column icon grid on phones, 3 columns from `sm`, centred, with the system status line below.
- Windows stack to one column under 1024px; sticky side rails only at `lg`. Bottom padding leaves room for the dock, and `scroll-padding-bottom` keeps scrolled-to targets above it.
- Touch targets >= 44px; hover-only information is mirrored in text or `sr-only` copy.
