# Design system

A quiet, cinematic dark fantasy: stone, parchment, embers. Everything readable first; atmosphere second.

## Tokens (`src/app/globals.css`, Tailwind v4 `@theme`)

| Token | Value | Use |
| --- | --- | --- |
| `abyss` | `#080a0d` | page background, canvas clear colour |
| `surface` | `#11151b` | panel base |
| `raised` | `#1a2028` | panel top, cards |
| `edge` | `#2a313b` | neutral borders |
| `gold` | `#d4af61` | primary accent, eyebrows, borders, focus ring |
| `gold-deep` | `#9a7a3c` | bar gradient start |
| `ember` | `#e56c35` | fire, hot accents, bullets |
| `flare` | `#f3d99b` | highlights, hovered text, bar ends |
| `ink` | `#e9e4d8` | primary text |
| `ash` | `#989a9f` | secondary text |
| `dust` | `#686c73` | tertiary text, hints |

Contrast: `ink` on `surface` is about 13:1; `ash` on `surface` about 6:1; `gold` on `surface` about 7.6:1; `dust` is reserved for hints at 14px+ (about 3.9:1, decorative-adjacent).

## Typography

| Role | Font | Notes |
| --- | --- | --- |
| Display | Cinzel 400/600/700 | titles, eyebrows, buttons, waystone names. Tracked wide (`0.2em` to `0.4em`) at small sizes, `0.02em` at heading sizes. Never used for body copy. |
| Body/UI | Inter (variable) | paragraphs, cards, controls. 14 to 18px, line-height 1.6 to 1.7. |
| Mono | JetBrains Mono 400 | repository names, the hex handle, percentages, keyboard hints. |

Fonts are self-hosted through `next/font/google` (downloaded at build, served from the same origin).

## Surfaces

- **Panel** (`.panel`): gradient surface, 1px gold border at 16% alpha, inner hairline frame, corner ticks drawn with background gradients, deep soft shadow. Max width 64rem (78rem for wide content). Entrance: 18px rise + fade over 550 ms.
- **Card** (`.card`, `.card-interactive`): lighter version for list items; hover lifts 2px and warms the border. Hover lift is disabled on touch devices (`@media (hover: hover)`).
- **Waystone** (`.waystone`): hub hotspot; rune disc with lucide icon, Cinzel name, plain label underneath so the destination is never ambiguous. In Immersive mode each one is pinned to a standing stone in the 3D camp (far stones carry the plaque above, near stones at the foot) and the stone's rune glows on hover or focus.
- **Terminal** (`BonfireTerminal`): a panel-styled bottom drawer in JetBrains Mono; gold prompt, flare for input echoes, ash for output.
- **Kindling log**: mono boot sequence in gold with a blinking block cursor; the first line in flare.
- **Attribute radar**: seven-axis SVG polygon filled with a flare-to-ember gradient over gold grid rings.

## Controls

- `.btn` base: Cinzel small caps, 44px minimum height, gold border. `.btn-primary` fills gold on hover with dark text; `.btn-ghost` is text-only until hovered. `.btn-sm` for secondary rows (40px).
- `.tag`: small tracked chips for technologies and sources.
- `.kbd`: keyboard hints.
- Focus: 2px gold outline, 3px offset, everywhere (`:focus-visible`).
- Tabs follow the WAI-ARIA pattern (roving tabindex, arrow keys, Home/End).

## Motion

| Element | Motion | Reduced motion |
| --- | --- | --- |
| Entry -> hub | camp fades out 0.6 s, kindling boot log (10 lines at 210 ms) then 0.65 s hold, skippable with Esc/Enter/Space/click | skipped entirely |
| Camera | damped move to the stage target; slow breathing drift at the entry camp only; pointer parallax on fine pointers (smaller at the hub so pinned links stay put); dolly toward the focused stone when a panel opens | snaps, no drift, no parallax |
| Ash | 120 grey points falling slowly over the camp (not on low power) | scene not used by default |
| Embers (3D) | 170 additive points (60 on low power) | scene not used by default |
| Embers (CSS) | 26 spans, 7 to 13 s rises | static |
| Panels | CSS `panel-in` 550 ms fade/rise (no JS needed, so server-rendered text paints before hydration) | instant |
| Waystones, inspect card, sigil letters | CSS `rise-in` 600 ms with 80 ms `animation-delay` stagger; sigil letters use transitions with `transition-delay` | instant |
| Stat bars | 1.1 s width grow | instant (global `transition-duration` override) |

## Iconography

- UI icons: [lucide](https://lucide.dev) (ISC). Destination glyphs: Scroll, Swords, BookMarked, Shield, Gem, Signpost.
- Brand icons: [Simple Icons](https://simpleicons.org) (CC0 1.0), imported individually. Missing brands fall back to a two-letter rune monogram in Cinzel.
- Favicon, OG image, summon sigil, ruin silhouettes: original SVG/CSS in this repo.

## Layout rules

- 16px gutters at phone widths via `.safe-x` (respects `env(safe-area-inset-*)`), no horizontal scroll at 320px.
- Hub: ring of six waystones around the fire at >= 1024x640 in Immersive mode; otherwise a 1/2/3-column grid of cards.
- Panels stack to one column under 1024px; sticky side rails only at `lg`.
- Touch targets >= 44px; hover-only information is mirrored in text or `sr-only` copy.
