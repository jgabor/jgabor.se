# Astro Migration Plan

Migrate jgabor.se from custom Bun/Cloudflare Worker setup to Astro 6 beta + Vite 8 beta + Tailwind 4 + pnpm.

## Phase 1: Project Scaffold

- [ ] Remove Bun lockfile (`bun.lockb`) and `"engines"` field from package.json
- [ ] Initialize pnpm and install core dependencies:
  - `astro@6.0.0-beta.9`
  - `@astrojs/cloudflare@^12.6.12`
  - `@cloudflare/vite-plugin@^1.25.6`
  - `tailwindcss@^4` + `@tailwindcss/vite`
  - `wrangler@^4`
  - `typescript`
- [ ] Add `"overrides": { "vite": "^8.0.0-beta.16" }` to package.json
- [ ] Create `astro.config.mjs` with Cloudflare adapter, Tailwind Vite plugin, and experimental fonts API (Inter + Space Mono)
- [ ] Create `tsconfig.json` extending `astro/tsconfigs/strict`
- [ ] Update `wrangler.jsonc`: set `assets.directory` to `./dist`, keep KV binding for contact form rate limiting
- [ ] Update package.json scripts: `dev`, `build`, `preview`, `deploy`

## Phase 2: Global Styles & Layout

- [ ] Create `src/styles/global.css` with `@import "tailwindcss"` and `@theme` config (CSS variables, font families)
- [ ] Create `src/layouts/BaseLayout.astro` with shared `<head>`, `<Font>` components, global CSS import, and common structure

## Phase 3: Content Collections

- [ ] Create `src/data/projects.json` — extract project data from `src/pages/index.ts`
- [ ] Create `src/data/experiences.json` — extract work experience data from `src/pages/index.ts`
- [ ] Create `src/content.config.ts` with Zod schemas and `file()` loaders for both collections

## Phase 4: Components

- [ ] Create `src/components/Nav.astro`
- [ ] Create `src/components/Hero.astro`
- [ ] Create `src/components/ProjectCard.astro`
- [ ] Create `src/components/ProjectGrid.astro`
- [ ] Create `src/components/ExperienceItem.astro`
- [ ] Create `src/components/SkillTag.astro`
- [ ] Create `src/components/ContactForm.astro`
- [ ] Create `src/components/Footer.astro`
- [ ] Convert inline CSS to Tailwind utility classes across all components

## Phase 5: Pages

- [ ] Create `src/pages/index.astro` — compose components, query content collections
- [ ] Convert `src/pages/cv.html` to `src/pages/cv.astro` — preserve print styles, reuse experience data from collections

## Phase 6: Contact Form API

- [ ] Create `src/pages/api/contact.ts` with `export const prerender = false`
- [ ] Migrate JMAP/Fastmail email logic from `src/worker.ts`
- [ ] Migrate KV-based rate limiting logic
- [ ] Use ESM imports only (avoid `require()` — Vite 8 nodejs_compat issue)

## Phase 7: Cleanup

- [ ] Delete `src/build.ts`
- [ ] Delete `src/lib/compress.ts`
- [ ] Delete `src/lib/minify.ts`
- [ ] Delete `src/lib/template.ts`
- [ ] Delete `src/dev-content.ts`
- [ ] Delete `src/worker.ts` (logic moved to Astro API endpoint)
- [ ] Remove `concurrently`, `bun-types` from devDependencies

## Phase 8: Verify & Deploy

- [ ] Run `pnpm dev` — verify dev server works in workerd locally
- [ ] Run `pnpm build` — verify clean build with no errors
- [ ] Test contact form API endpoint
- [ ] Test CV page print styles
- [ ] Test fonts load correctly (no FOUT/FOIT)
- [ ] Run `pnpm deploy` — deploy to Cloudflare
- [ ] Verify production site at jgabor.se
