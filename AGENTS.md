# Agent Guide for jgabor.se

This file serves as a reference guide for AI agents working in this repository. It documents standard commands, diagnostic procedures, performance audits, and general codebase rules to prevent re-discovery.

---

## Development Server

Do not invoke `pnpm` or `npm` directly. Use the unified toolchain CLI **`vp`** for all tasks.

- **Command**: `vp run dev` (runs the underlying `astro dev` command)
- **Default Port**: `http://localhost:4321/`
- **Workflow**: Run this command as a background task.

> [!WARNING]
> Running `vp dev` starts a raw `vite+` development server on port `5173`, which does not correctly process Astro-specific pages and outputs `404 Not Found` for the application. Always use `vp run dev` to launch the Astro-supported dev server.

---

## Launching Chrome for Debugging

When requested to run/open Chrome with DevTools activated, use:

```bash
google-chrome-stable --auto-open-devtools-for-tabs http://localhost:4321/
```

### Guidelines:

- Ensure Chrome is run asynchronously in the background so it doesn't block shell execution.
- The `--auto-open-devtools-for-tabs` flag guarantees DevTools opens immediately for the active tab.

---

## Performance Testing (Lighthouse)

To audit performance, use the Lighthouse CLI. Always run in non-interactive mode using the `--no-enable-error-reporting` flag to prevent prompts from hanging execution.

### Production Audit:

```bash
npx lighthouse --chrome-flags="--headless --no-sandbox" --only-categories=performance --no-enable-error-reporting --output=json --output-path=tmp/lighthouse-prod.json https://jgabor.se
```

### Local Audit:

```bash
npx lighthouse --chrome-flags="--headless --no-sandbox" --only-categories=performance --no-enable-error-reporting --output=json --output-path=tmp/lighthouse-local.json http://localhost:4321
```

### Key Differences to Note:

- **Simulated (Mobile Throttling)**: The local dev environment typically scores lower (~60s) in simulated mobile audits than production (~98s). This is normal dev server behavior.
- **Network Requests**: The local dev server loads unbundled ES modules dynamically (making 40+ requests, including Astro Dev Toolbar components), whereas the production build bundles, minifies, and compresses assets (making fewer than 20 requests).
- **Observed (Actual) Performance**: Under unthrottled conditions, both local and production load almost instantly (~100-140ms LCP).

---

## Code Section Data

The homepage Code section is built at compile time from GitHub activity, not a static list.

- **Feed module**: `src/lib/github/code-feed.ts` merges pinned repos and recent pushes (90-day window), sorted by `pushedAt`.
- **Overrides**: `src/data/code-overrides.json` supplies curated title, type, description, and tags per repo slug.
- **Offline fallback**: `src/data/code.snapshot.json` is used when `GH_PROFILE_TOKEN` is missing or the GitHub API fails.
- **Refresh cadence**: `.github/workflows/refresh-code.yml` rebuilds twice daily so pushes to other repos update the site without a commit here.

### Local live data

Optional `.env` entry for live GitHub fetches during `vp run dev`:

```bash
GH_PROFILE_TOKEN=ghp_...
```

---

## CV PDF

The downloadable CV at `/CV-Jonathan_Gabor.pdf` is generated from the same `career` collection (`src/data/career.json`) and `cv.astro` template the live site uses — there is no separate CV data source.

- **Renderer**: `tools/render-cv-pdf.mjs` (Playwright/Chromium). Runs as a `postbuild` step on `vp run build` and inside `.github/workflows/cv-pdf.yml`.
- **Regeneration**: `.github/workflows/cv-pdf.yml` triggers on path-filtered pushes to `main` (career.json, cv.astro, the tool, the test, the workflow itself) and on `workflow_dispatch`. It rebuilds the PDF, runs the content assertions, and commits the result back to `main` so the next deploy ships the fresh copy. `public/CV-Jonathan_Gabor.pdf` is intentionally kept in git as a fallback.
- **Test**: `src/lib/cv-pdf.test.ts` is part of `vp run test` and asserts the PDF contains the name, headline, every company, a role per company, and stable `cvDescription` sentinels.
- **Manual regeneration**: `node tools/render-cv-pdf.mjs` (or `vp run cv:pdf`) after `vp run build` has produced `dist/client/cv/index.html`.

---

## Tests

```bash
vp run test
```

Covers the GitHub code-feed builder (`src/lib/github/code-feed.test.ts`) and CV PDF content assertions (`src/lib/cv-pdf.test.ts`).

---

## General Agent Guidelines

### 1. CLI Usage & Safety

- **Non-Interactive Commands**: Never run interactive CLI tools. Provide flags such as `--no-input`, `--no-enable-error-reporting`, etc.
- **Background Tasks**: Run long-running servers and processes in the background. Use the background task manager to verify logs.
- **Avoid Root Scoping**: Never run glob/grep searches on `$HOME/` or root (`/`). Only search within `/home/jgabor/git/jgabor.se/` to avoid massive latency.

### 2. Commit Style

- Write concise, imperative descriptions of changes matching the repository's convention:
  - Example: `docs: document development workflows in AGENTS.md`

### 3. Engineering Principles

- **DTC (Document, Test, Code)**: Document intent, enforce with tests, write code.
- **DRY & SOLID**: Keep code modular, reuse functions where appropriate, and avoid duplicate logic.
- **YAGNI**: Implement only what is requested/needed now, avoiding unnecessary speculative complexity.
