# Design system

A dark room and one phosphor-amber screen. Monospace where the machine speaks, a humanist sans where the person does. Readable first; atmosphere second.

## Tokens (`src/app/globals.css`, Tailwind v4 `@theme`)

Token names are generic so components never carry theme words.

| Token | Value | Use |
| --- | --- | --- |
| `abyss` | `#0a0c0f` | page background, canvas clear colour |
| `surface` | `#11151a` | window base |
| `raised` | `#181d24` | window top, cards |
| `edge` | `#273039` | borders, dividers |
| `gold` | `#ffb454` | primary accent (phosphor amber): eyebrows, icons, focus ring, bars |
| `gold-deep` | `#b8782a` | bar gradient start, dimmed accent |
| `ember` | `#59d4ff` | secondary signal accent, used sparingly (tower and rack LEDs) |
| `flare` | `#ffd79a` | highlights, hovered text, prompt echoes |
| `ink` | `#e4e8ec` | primary text |
| `ash` | `#98a2ad` | secondary text |
| `dust` | `#66717c` | tertiary text, hints, status lines |

Contrast: `ink` on `surface` about 14:1; `ash` on `surface` about 6.5:1; `gold` on `surface` about 9:1; `dust` is reserved for hints at 12 px+ (about 4:1).

## Typography

| Role | Font | Notes |
| --- | --- | --- |
| Display | JetBrains Mono 600/700 | wordmark, window and section titles, eyebrows, buttons, desktop icon names. Uppercase tracked for labels (`0.12em` to `0.3em`), tight at heading sizes. |
| Body/UI | Inter (variable) | paragraphs, cards, descriptions. 14 to 18px, line-height 1.6 to 1.7. |
| Mono | JetBrains Mono 400 | file names, repository names, the boot log, the terminal, status lines, numbers. |

Fonts are self-hosted through `next/font/google` (downloaded at build, served from the same origin).

## Surfaces

- **Window** (`.panel` + `.titlebar` + `.statusline`): 1px `edge` border, 6px radius, a 2px amber line along the top, a title bar with three dots (the first lit) and `file — Title`, a real close button, and a mono status line that links the previous and next files. Max width 64rem (78rem for wide content). Entrance: 14px rise + fade over 400 ms.
- **Card** (`.card`, `.card-interactive`): 4px radius, `edge` border; hover warms the border and lifts 2px (not on touch devices).
- **Desktop icon** (`.desk-icon`): a 56px rounded glyph tile in amber over `surface`, the app name in mono, the file name in dimmed amber, a one-line description in `ash`.
- **Taskbar**: 48px bottom bar, `edge` top border, blurred `abyss`; home wordmark, `~/path` breadcrumb, sound/terminal/mode toggles, close (in a window), clock.
- **Terminal**: window chrome above the taskbar, JetBrains Mono, gold prompt `0x496c6b696e@workstation:~$`, flare for echoed input, ash for output.

## Controls

- `.btn` base: mono uppercase, 44px minimum height, `edge` border, 4px radius. `.btn-primary` is a solid amber fill with dark text; `.btn-ghost` is text-only until hovered. `.btn-sm` for secondary rows (40px).
- `.tag`: mono chips for technologies and sources.
- `.kbd`: keyboard hints.
- Focus: 2px amber outline, 3px offset, everywhere (`:focus-visible`).
- Tabs follow the WAI-ARIA pattern (roving tabindex, arrow keys, Home/End).

## Motion

| Element | Motion | Reduced motion |
| --- | --- | --- |
| Standby -> desktop | standby fades out 0.5 s, boot log (9 lines at 190 ms) then 0.65 s hold, skippable with Esc/Enter/Space/click | skipped entirely |
| Camera | damped move to the stage target; hand-held sway and pointer parallax at standby only; near-static at the screen | snaps, no sway, no parallax |
| Screen | canvas redrawn ~8 fps: lines typed in over the first seconds, blinking block cursor, scanlines | unchanged (decorative texture, no large motion) |
| LEDs | per-frame colour toggles on tower and rack lights | unchanged |
| Dust | 140 slow points in the lamp light (not on low power) | scene not used by default |
| Windows, icons, inspect card | CSS `panel-in` 400 ms / `rise-in` 500 ms with 70 ms `animation-delay` stagger | instant |
| Bars | 1.1 s width grow | instant |
| CRT overlay | static scanlines + vignette; CSS room screen has a slow 4 s flicker | flicker off |

## Iconography

- UI icons: [lucide](https://lucide.dev) (ISC). Desktop glyphs: FileText (Profile), Cpu (Capabilities), FolderGit2 (Projects), Wrench (Toolchain), Activity (Telemetry), Mail (Mail). Taskbar: MonitorPlay, SquareTerminal, Volume2/VolumeX, LayoutGrid, X.
- Brand icons: [Simple Icons](https://simpleicons.org) (CC0 1.0), imported individually. Missing brands fall back to a two-letter monogram.
- Favicon (a CRT with three amber lines), OG image (the same CRT with the boot log and wordmark) and the room are generated in this repository.

## Layout rules

- 16px gutters at phone widths via `.safe-x` (respects `env(safe-area-inset-*)`), no horizontal scroll at 320px.
- Desktop: 2-column icon grid on phones, 3 columns from `sm`, centred, with the system status line below.
- Windows stack to one column under 1024px; sticky side rails only at `lg`. Bottom margin leaves room for the taskbar.
- Touch targets >= 44px; hover-only information is mirrored in text or `sr-only` copy.
