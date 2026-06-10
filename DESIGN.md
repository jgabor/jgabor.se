---
name: jgabor.se
description: Jonathan Gabor — Speaks code, ships product.
colors:
  primary: "#3ad2e6"
  neutral-bg: "#ffffff"
  neutral-bg-dark: "#000000"
  neutral-fg: "#171717"
  neutral-fg-dark: "#ffffff"
  accent-teal: "#289e87"
  accent-violet: "#7048e8"
  accent-emerald: "#2db36f"
  accent-sky: "#26a2e6"
typography:
  display:
    fontFamily: "Josefin Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 9vw, 6.5rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Raleway, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Departure Mono, ui-monospace, monospace"
    fontSize: "0.625rem"
    fontWeight: 400
    letterSpacing: "0.2em"
rounded:
  sm: "0px"
  md: "24px"
spacing:
  sm: "16px"
  md: "32px"
components:
  button-primary:
    backgroundColor: "{colors.neutral-fg}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.sm}"
    padding: "12px 32px"
  button-primary-hover:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-fg}"
  input-field:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
---

# Design System: jgabor.se

## 1. Overview

**Creative North Star: "The Systems Terminal"**

This visual system translates systems engineering rigor into a clean, functional editorial layout. It rejects the soft blurs, generic templates, and loud gradients of modern SaaS landing pages in favor of strict typography, high-contrast states, and micro-bordered layouts resembling terminal controls and print matrices.

**Key Characteristics:**
* **Monospaced Accents**: Structural labeling, badges, lists, and metadata are presented in Departure Mono to enforce a developer-oriented, precise feel.
* **Sharp Outlines**: Layout containers, inputs, and buttons are designed with sharp (`0px`) corners to reflect a structured, industrial interface.
* **Tonal Rarity**: High-chroma accent colors appear only as minor indicators (≤5% of the viewport) to guide focus toward active states or specific product categories.

## 2. Colors

A stark, high-contrast foundation with a functional set of vibrant accents.

### Primary
* **Systems Cyan** (`#3ad2e6` / `oklch(80% 0.18 200)`): The primary indicator color, used for active location badges, focus rings, and high-visibility interactive highlights.

### Secondary
* **Agentic Violet** (`#7048e8` / `oklch(50% 0.25 280)`): Custom accent for advanced workflows, developer ecosystems, and AI system categories.
* **Refined Teal** (`#289e87` / `oklch(60% 0.15 168)`): Custom accent for pipeline and utility CLI tools.
* **Finsliparn Emerald** (`#2db36f` / `oklch(65% 0.20 145)`): Indicator accent representing loop passes, refinement states, and test status.
* **Clear Sky** (`#26a2e6` / `oklch(68% 0.18 215)`): Custom accent representing desktop software and graphical gaming utilities.

### Neutral
* **Pure Light Background** (`#ffffff`): The canonical light surface background.
* **Terminal Abyss Background** (`#000000`): The canonical dark surface background.
* **Terminal Dark Ink** (`#171717`): High-contrast dark typography and overlay fills for light mode.
* **Pure Output** (`#ffffff`): High-contrast light typography and overlay fills for dark mode.

### Named Rules
**The Rarity Rule.** Primary color accents are limited to less than 5% of the total screen space. Their rarity is what makes them functional indicators rather than decorative noise.
**The True Contrast Rule.** Background surfaces are strictly solid white (`#ffffff`) or pure black (`#000000`), avoiding muddy gray zones or soft gray-purple card grids.

## 3. Typography

**Display Font:** Josefin Sans (700 Weight, clamp sizing)
**Body Font:** Raleway (400–600 Weight, standard line heights)
**Label/Mono Font:** Departure Mono (400 Weight, tracked uppercase, self-hosted)

### Hierarchy
* **Display** (Bold 700, size `clamp(2.75rem, 9vw, 6.5rem)`, leading `0.92`): Personal headlines and section titles.
* **Headline** (Semibold 600, size `1.875rem` / `3xl` to `2.25rem` / `4xl`): Supporting hero lines and card titles.
* **Title** (Mono Regular 400, size `0.625rem`–`0.75rem`, uppercase, letter-spacing `0.15em`–`0.2em`): Metadata labels and form labels.
* **Body** (Regular 400, size `1rem` to `1.125rem`, leading `1.6`): Editorial description blocks.
* **Label** (Departure Mono, eyebrow pills): Section category labels, navigation options, and status badges.

### Named Rules
**The Strict Case Rule.** All Departure Mono labels, section subtitles, and status badges must be strictly uppercase and carry wide letter-spacing (`0.15em` or higher) to distinguish them from standard text.

## 4. Elevation

The system is flat by default, relying on thin outlines and tonal overlays to convey depth instead of soft gradients or blurry box shadows.

### Named Rules
**The Stroke-Over-Shadow Rule.** Use thin `1px` borders (`border-overlay/12` or `border-accent/20`) to group and separate elements rather than shadows. Shadows are forbidden except for the hero portrait image.

## 5. Components

### Buttons
* **Shape:** Sharp corners (`0px`).
* **Primary:** Foreground solid bg (`#171717` / `#ffffff`), uppercase monospaced text, padding `12px 32px`.
* **Hover / Focus:** Reverses colors to transparent background with a solid border outline. Exposes primary accent focus indicator on keyboard select.

### Inputs / Fields
* **Style:** High-contrast background with a thin `1px` border (`border-overlay/12`), sharp corners (`0px`).
* **Focus:** Transition borders to the primary Systems Cyan (`#3ad2e6`) outline with an outer glow.

### Cards / Containers
* **Style:** Solid background fill (`bg-card`), `1px` border (`border-overlay/12`), sharp corners (`0px`), inner padding `24px` (`p-6`).

### Navigation
* **Style:** Fixed height, semi-transparent blur (`backdrop-blur-xl` / `bg-surface/80`), thin bottom border (`border-overlay/6`).

## 6. Do's and Don'ts

### Do:
* **Do** group distinct categories using custom project accents (e.g. violet for agent workflows, teal for CLI tools).
* **Do** enforce a monospaced uppercase style on form labels and indicator badges.
* **Do** use strict `1px` overlay lines for separating sections and cards.

### Don't:
* **Don't** use standard SaaS templates, fuzzy shadow cards, or blurry glass containers.
* **Don't** apply rounded corners to interactive controls or container grids (with the exception of portrait frames and eyebrow pills).
* **Don't** use gradient text backgrounds or heavy side-stripe border accents.
* **Don't** use pulsing status dots, section-index watermarks, or rainbow accent sprinkles outside project type labels.

### Footer
The solar-system canvas footer is intentional — a delightful reward for visitors who read the full page. It is exempt from the flat terminal rules above.
