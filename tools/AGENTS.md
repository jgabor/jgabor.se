# Build Pipeline Tools

This directory holds scripts that run as part of the build pipeline. They are
educational tools that make the build transparent, reproducible, and measurable.

## Scripts

### `tools/subset-fonts.mjs`

Reads `tools/font-glyphs.txt` and the full woff2 at
`public/fonts/DepartureMono-Regular.woff2` (source of truth, never modified),
writes a subset to `public/fonts/DepartureMono-Regular.subset.woff2`.

- **Runs:** `predev` and `prebuild` (automatic via `package.json` hooks).
- **Output:** `public/fonts/*.subset.woff2` (gitignored, regenerated on every build).
- **Source of truth:** `public/fonts/DepartureMono-Regular.woff2` (22.0KB, full glyph set).
  This file is never overwritten by the build; only read.
- **How to add a glyph:** append the new char to `tools/font-glyphs.txt`, or
  re-run the inline node script that scans `src/` and regenerates the file.
- **How to revert:** delete the prebuild hook + restore the @font-face line
  in `src/styles/global.css` to point at `DepartureMono-Regular.woff2`.

### `tools/perf-budget.mjs`

Walks `dist/client/`, gzips + brotlis every file, emits
`tmp/perf-budget.json` with totals + per-folder breakdown + top 10 largest,
and exits non-zero if the wire bundle exceeds 250KB.

- **Runs:** `postbuild` (automatic).
- **Wire bundle:** the bytes a modern browser actually downloads (smallest
  format per asset). This excludes Astro's image-format fallbacks (e.g., a
  37KB WebP that only ancient browsers without `<picture>` support would
  request). For real LCP-impact reasoning, trust the wire number, not the
  critical-raw number.
- **Threshold:** 250KB wire, 250KB raw. Tuned to allow for 4 image variants
  (AVIF + WebP × 2 sizes) while still flagging regressions.

## Build pipeline order

```
pnpm run build
  ↓
1. prebuild:  tools/subset-fonts.mjs     (~1s)
2. astro build (vite + postcss + esbuild) (~2-3s)
3. postbuild: tools/perf-budget.mjs      (~50ms)
```

## Decisions worth remembering

- **esbuild, not Lightning CSS.** Lightning CSS correctly preserves
  Tailwind v4's `@theme default` block, which adds ~11KB of unused `oklch`
  color variables (286 of them) to the CSS output. esbuild accidentally
  drops the block. The size benefit outweighs the correctness tradeoff.
  The decision is in `postcss.config.mjs` (uses esbuild via Tailwind v4
  PostCSS) and `astro.config.mjs` (no `css.transformer: "lightningcss"`).
- **No content-visibility on Hero.** Hero is above the fold on every
  viewport, so `content-visibility: auto` would only add the placeholder-
  height flash. Applied only to `SectionShell` (opt-out) and
  `solar-stage`. See `SectionShell.astro`'s `cvAuto` prop (default true).
- **Astro `<Picture>` fallback WebP is kept.** The `<picture>` element
  emits a `<img src="...">` for browsers without picture support (≈0% of
  modern traffic). The 37KB WebP stays in `_astro/`. Not worth the build
  complexity to strip.

## Adding new tools

1. Create `tools/your-tool.mjs` as a self-contained Node script.
2. Add a `pre*` / `post*` script to `package.json` to wire it in.
3. If it writes files, emit them to `tmp/` (gitignored) or another
   gitignored path. Never commit build outputs.
4. If the tool gates the build (e.g., perf-budget), make the threshold
   configurable via env var so it can be tuned without code changes.

## Bundle visualizer

Run with `ANALYZE=1 pnpm run build` to emit
`tmp/bundle-treemap.html`. Open it in a browser to see a treemap of
the built bundles.

## Lighthouse

The current site is not gated by Lighthouse CI because it's a portfolio
site with stable content. To add a Lighthouse gate:

```bash
pnpm add -D @lhci/cli
# Add lighthouserc.json + a "lhci" script in package.json
```
