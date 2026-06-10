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

A hybrid of Soviet Constructivism, Art Deco stepped geometry, and disciplined Memphis/Bauhaus — executed like a technical schematic. The site is strictly monochrome, geometric, and architectural. Type is structure. White space carries the composition.

**Key Characteristics:**

- **Monochrome only** — three values, no gradients, no shadows, no glow.
- **Primitive geometry** — pylons, spines, forks, plus signs, squares, triangles, stepped bars.
- **Schematic notation** — dotted lines, section numerals, hatch fills as connective tissue.
- **Type as architecture** — oversized condensed display caps paired with humanist body text.

## 2. Colors

Exactly three values. No exceptions.

| Token | Hex       | Usage                                    |
| ----- | --------- | ---------------------------------------- |
| Black | `#000000` | Foreground, fills, borders, buttons      |
| White | `#ffffff` | Background, negative space               |
| Gray  | `#999999` | Muted text, secondary borders, type tags |

### Named Rules

**The Three-Value Rule.** No other colors, no opacity tricks to simulate additional hues, no gradients.
**The Flat Rule.** No drop shadows, no glow, no blur-based depth.

## 3. Shape Vocabulary

Six primitives only:

1. **Pylon** — miniature stepped-bar peak on code rows and footer
2. **Spine** — ascending triangle rating row on section dividers
3. **Fork** — offset reference square on outbound links
4. **Plus sign** — node joints, schematic notation
5. **Square** — frames, number badges, inputs
6. **Triangle** — rating indicators, directional accents
7. **Stepped bar** — career timeline, rising-bar motif

All corners are sharp (`0px` radius). No rounded pills, blobs, or organic curves.

## 4. Fill Textures

Five fills, used interchangeably:

1. **Solid black** — primary structural mass
2. **Diagonal hatch** (`#hatch-diag`) — hover states, accent panels
3. **Vertical hatch** (`#hatch-vert`) — alternating card fills
4. **Dot halftone** (`#halftone`) — mechanical texture accents
5. **White / negative space** — default background, carved-out structure

SVG pattern definitions live in `src/components/SchematicDefs.astro`.

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
- **Eyebrows** — mono, `0.625rem`, bordered pill-rectangle (square corners)
- **Body** — `1rem`–`1.125rem`, leading `1.6`
- **Section numbers** — `clamp(5rem, 14vw, 11rem)`, opacity `0.18`, left margin anchor

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

Section numbers render as huge geometric type on the left margin via `SectionShell.astro`.

## 7. Components

### Navigation

- Fixed top bar, `1px` black bottom border, white background.
- Logo mark: `JG` in a square frame.
- Links: Code · Career · Contact (mono caps).
- No theme toggle — monochrome is the only mode.

### Hero

- Split layout: name dominates left, portrait right.
- Portrait: `4:5` aspect, square frame, `grayscale(100%) contrast(1.35)`.
- Location tag with status dot, mono caps.
- Social links as underlined text with fork reference primitive.

### Code

- Technical index rows with numbered square badge + pylon marker.
- Type tag: uniform gray bordered treatment (no per-category color).
- Tech stack as mono uppercase chips.

### Career

- Stepped-bar timeline (desktop) with star-rating triangles.
- Strengths in 3-column bordered grid.
- Skills as inline chips.
- Work history with left border timeline.

### Contact

- Square-cornered inputs with `1px` black border.
- Submit button: solid black, white caps text, inverts on hover.

### Footer

- Minimal schematic divider with spine marker + copyright.

## 8. Do's and Don'ts

### Do:

- **Do** use the six shape primitives for all iconography.
- **Do** enforce the three-color palette everywhere.
- **Do** render section numbers large and structural on the left margin.
- **Do** use hatch fills and dotted lines as schematic connective tissue.
- **Do** keep copy verbatim from source data files.

### Don't:

- **Don't** add color, gradients, glow, or drop shadows.
- **Don't** soften corners on shapes, cards, or buttons.
- **Don't** use organic, hand-drawn, or rounded-blob shapes.
- **Don't** break symmetry casually without visual justification.
- **Don't** use stock icon libraries (Font Awesome, Material, etc.).
- **Don't** include a theme toggle.
- **Don't** paraphrase canonical copy.
