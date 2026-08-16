---
name: jgabor.se
description: Jonathan Gabor — Speaks code, ships product.
style: Engineered Futurism
colors:
  black: "#000000"
  white: "#ffffff"
  gray: "#999999"
typography:
  display:
    fontFamily: "Bebas Neue, ui-sans-serif, system-ui, sans-serif"
    textTransform: uppercase
  body:
    fontFamily: "Source Sans 3, ui-sans-serif, system-ui, sans-serif"
  label:
    fontFamily: "Departure Mono, ui-monospace, monospace"
    textTransform: uppercase
    letterSpacing: "0.15em–0.2em"
---

# Design System: Engineered Futurism

## 1. Overview

**Creative North Star: "Engineered Futurism"**

A hybrid of Soviet Constructivism, Art Deco stepped geometry, and disciplined Memphis/Bauhaus — executed like a technical schematic. The site is strictly monochrome, geometric, and architectural on the main surface. Type is structure. White space carries the composition. The solar footer is a deliberate whiplash into color, motion, and organic form.

**Key Characteristics:**

- **Monochrome only** — three values on the main page; no per-component color accents.
- **Primitive geometry** — pylons, nodes, forks, plus signs, squares, triangles, stepped bars.
- **Schematic notation** — dotted lines, hatch fills, registration marks as connective tissue.
- **Type as architecture** — oversized condensed display caps paired with humanist body text.
- **Light/dark themes** — `.dark` inverts `--ef-black` / `--ef-white` tokens; gray stays fixed.
- **Restrained motion** — scroll reveals, draw-on schematics, and micro-interactions; all opt-in and reduced-motion safe.

## 2. Colors

Exactly three values on the schematic page. No exceptions on the main surface.

| Token | Hex       | Usage                                    |
| ----- | --------- | ---------------------------------------- |
| Black | `#000000` | Foreground, fills, borders, buttons      |
| White | `#ffffff` | Background, negative space               |
| Gray  | `#999999` | Muted text, secondary borders, type tags |

In dark mode, black and white invert via CSS custom properties (`--ef-black`, `--ef-white`). Gray does not invert. `--ef-cosmos` (`#000`) is reserved for the solar footer and does not invert.

**Default theme.** `BaseLayout.astro` sets `<html class="dark">` by default. An inline script reads `localStorage.getItem('theme')` and falls back to `prefers-color-scheme`; the nav theme toggle persists the user's choice back to `localStorage`.

### Named Rules

**The Three-Value Rule.** No other colors on the main page. Do not use opacity to simulate additional hues (e.g. fake mid-grays via `rgba`).

**The Flat Rule.** No drop shadows or blur-based depth on the main page.

**Opacity for motion and depth.** Opacity is allowed for animation (fade-in, draw-on, blink), decorative backdrop wash (`HeroBackdrop`), and solar-zone effects — not for inventing new gray values on the schematic surface.

### Solar Footer Exception

The footer (`SolarSection`) is a deliberate break from the flat monochrome rule:

- Fixed `--ef-cosmos` background and rift fill (does not follow token inversion).
- Organic Bézier rift silhouette — the one place organic curves are intentional.
- Canvas gradients, star/planet color, and glow on the rift SVG filter.
- White headline text over the dark canvas.

This is the scroll-reward terminus of the page — not part of the schematic surface system.

### CV Page Exception

The CV page (`/cv`, `src/pages/cv.astro`) is a separate print-oriented layout outside the main schematic surface system — similar in spirit to the solar footer exception, but scoped to PDF/print. It uses its own palette (`--color-accent`, rgba borders) and does not follow the three-value rule or `BaseLayout` theme tokens.

## 3. Shape Vocabulary

Seven glyph primitives, defined in `src/components/SchematicDefs.astro`:

1. **Pylon** (`#glyph-pylon`) — stepped-bar peak on code row markers
2. **Node** (`#glyph-node`) — square frame with center square; section connectors
3. **Fork** (`#glyph-fork`) — offset reference square on outbound links
4. **Plus** (`#glyph-plus`) — node joints; hero bottom divider
5. **Square** — frames, number badges, inputs, registration marks
6. **Triangle** — directional accents, bar peaks, rating ticks on chart caps
7. **Stepped bar** — career chart bars and timeline motif

All corners are sharp (`0px` radius). No rounded pills or blobs on the schematic surface. Organic curves are confined to the solar rift (see §2).

**Deprecated (removed).** `#glyph-spine` was an unused symbol in `SchematicDefs.astro`; section connectors use `#glyph-node` instead.

## 4. Fill Textures

Shared SVG patterns live in `src/components/SchematicDefs.astro`:

| Pattern          | ID                | Typical use                         |
| ---------------- | ----------------- | ----------------------------------- |
| Diagonal hatch   | `#hatch-diag`     | Accents, hovers, IKEA career bar    |
| Vertical hatch   | `#hatch-vert`     | Hero wings, Cloud Royale career bar |
| Horizontal hatch | `#hatch-horiz`    | Hero shapes, UpCloud career bar     |
| Dot halftone     | `#halftone`       | Mechanical texture, Surftown bar    |
| Corner grid      | `#schematic-grid` | Hero schematic diamond              |
| Solid black      | `currentColor`    | Structural mass, strokes, buttons   |
| White / negative | background        | Default surface, carved structure   |

**CSS hatch overlay** — `--schematic-hatch` (`color-mix` of black at 12%) powers diagonal hover fills on nav logo and similar targets without adding a palette value.

**Chart-local pattern** — `#career-grid` is defined inside `CareerChart.astro` for the FS Data bar (centered grid, bar-relative `patternTransform`). Each of the five career bars uses a distinct hatch; no solid bar fills.

## 5. Typography

Two families plus mono labels:

| Role    | Family         | Treatment                           |
| ------- | -------------- | ----------------------------------- |
| Display | Bebas Neue     | All caps, oversized, structural     |
| Body    | Source Sans 3  | Regular weight, readable paragraphs |
| Labels  | Departure Mono | All caps, wide tracking, metadata   |

### Hierarchy

- **Hero name** — `clamp(3.5rem, 12vw, 8rem)`, display, uppercase
- **Section headings** — `text-3xl` to `text-5xl`, display, uppercase
- **Tagline** — mono, `text-sm`, uppercase, `tracking-[0.2em]`
- **Eyebrows** — mono, `0.625rem`, uppercase, gray; flanked by dotted rules and square terminals (`eyebrow-row`)
- **Body** — `1rem`–`1.125rem`, leading `1.6`

### Named Rules

**The Two-Family Rule.** Display + body only. Departure Mono is a label variant, not a third family.

**The Caps Rule.** All display headings and mono labels are uppercase.

## 6. Section Structure

Single-page layout with scroll-anchored sections:

| #   | ID         | Eyebrow | Heading                     |
| --- | ---------- | ------- | --------------------------- |
| 01  | `#code`    | CODE    | Things I've built           |
| 02  | `#career`  | CAREER  | 15+ years building products |
| 03  | `#contact` | CONTACT | Get in touch                |

Sections use eyebrow + heading via `SectionShell.astro`. No oversized section numerals.

### Section Connectors

Symmetric dividers sit **between** sections (not inside section padding):

- Code and Career export `showConnector` — section bottom padding collapses to `pb-0`.
- Career and Contact use `connectedTop` — top padding collapses to `pt-0`.
- Connector markup: dotted rule · `#glyph-node` · dotted rule (`.section-connector`, padding matched to hero divider rhythm).

### Naming

Section labels, data files, and Astro collections share one vocabulary:

| Section | Data source                                                    | Notes                                                                                                         |
| ------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Code    | `src/lib/github/code-feed.ts` + `src/data/code-overrides.json` | Built at compile time from GitHub pins and recent pushes; falls back to `src/data/code.snapshot.json` offline |
| Career  | `src/data/career.json`                                         | `career` collection; company tenure is calculated from role periods at build time                             |
| Contact | (form only)                                                    | —                                                                                                             |

The CV page (`/cv`) also loads the `career` collection.

## 7. Components

### Navigation

- Fixed top bar, dotted gray bottom rule (`.dotted-rule` vocabulary).
- Logo mark: `JG` in a square frame with registration marks.
- Links: Code · Career · Contact (mono caps), each with registration marks.
- Scroll-spy: active section link gets `.is-active` via `IntersectionObserver`.
- Theme toggle (geometric sun/moon icons) with registration marks; persists to `localStorage`.
- Mobile hamburger panel with Escape-to-close.

### Hero

- Split layout: name dominates left, mirrored schematic + portrait right.
- `HeroSchematic.astro` — wing mirror composition with hatch fills.
- `HeroBackdrop.astro` — faint geometric wash at low opacity.
- Portrait: `4:5` aspect, square frame, `grayscale(100%) contrast(1.35)`.
- Location tag with blinking status dot, mono caps.
- Social links as underlined text with fork reference primitive.
- Bottom schematic divider with dotted rules and plus glyph.

### Code

- Technical index rows with numbered square badge + pylon marker.
- Hover: pylon nudge, number badge inverts (black ↔ white).
- Type tag: uniform gray bordered treatment (no per-category color).
- Tech stack as mono uppercase chips.
- Rows link externally when a GitHub repo URL is present in the feed.

### Career

- **Desktop (`lg+`)** — stepped-bar chart with peaked bars, cap tick marks, and floating tenure badges. Five unique hatch patterns (halftone, grid, vertical, horizontal, diagonal).
- **Mobile** — horizontal stepped bars in `CareerTimeline.astro` with numbered company rows.
- Strengths in 3-column bordered grid with registration marks.
- Skills as inline chips.
- Work history with left-border timeline; role dates use body foreground color.

### Contact

- Two-column layout: form + symmetric transmission/antenna schematic (`ContactSchematic.astro`).
- Square-cornered inputs with `1px` border matching schematic frame.
- Submit button: solid black, white caps text, inverts on hover.
- `aria-live` region announces submit status to screen readers.
- Decorative schematic SVG (`aria-hidden`).

### Footer

- `SolarSection` — animated organic rift SVG, interactive solar canvas, mono decode headline reveal.
- Canvas and rift animations pause off-screen; respect `prefers-reduced-motion`.

## 8. Motion

All motion is progressive enhancement. `BaseLayout.astro` adds `.js` to `<html>`; without it, content is fully visible and static.

| Effect           | Target                        | Trigger              |
| ---------------- | ----------------------------- | -------------------- |
| Fade-in          | `.fade-in` sections/blocks    | Scroll intersection  |
| Hero draw-on     | `.hero-schematic-svg` strokes | Page load            |
| Chart bar grow   | `.chart-col-bar`              | Scroll intersection  |
| Chart cap fade   | `.chart-col-cap`              | After bar grow       |
| Code row hover   | `.code-row`                   | Hover / focus        |
| Status dot blink | `.status-dot`                 | Continuous (subtle)  |
| Nav scroll-spy   | `.nav-link.is-active`         | Section intersection |
| Footer decode    | `.solar-headline` spans       | Footer intersection  |
| Rift waveform    | `#rift-fill-path`             | Rift intersection    |
| Solar canvas     | `#solar-canvas`               | Footer intersection  |

Every animated effect checks `prefers-reduced-motion: reduce` and falls back to a static state.

## 9. Do's and Don'ts

### Do:

- **Do** use the seven glyph primitives for all iconography.
- **Do** enforce the three-color palette on the main schematic surface.
- **Do** use hatch fills and dotted lines as schematic connective tissue.
- **Do** keep Code copy verbatim from `code-overrides.json` and Career copy verbatim from `career.json`.
- **Do** default content to visible; opt into fade-in animation via `.js` on `<html>`.
- **Do** gate motion on `prefers-reduced-motion`.

### Don't:

- **Don't** add color accents on the main page (solar footer is the sole exception).
- **Don't** soften corners on shapes, cards, or buttons.
- **Don't** use organic or hand-drawn shapes on the schematic surface (rift excepted).
- **Don't** break symmetry casually without visual justification.
- **Don't** use stock icon libraries (Font Awesome, Material, etc.).
- **Don't** paraphrase canonical copy.
- **Don't** use opacity to fake additional gray values on the main surface.
