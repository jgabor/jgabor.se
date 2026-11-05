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
- **Homepage call**: `src/lib/github/home-code-entries.ts` runs the feed once per build and shares the result between the homepage and `/index.md`, so the build log has one `[code-feed] status=` line. In `vp run dev` it fetches on every request.
- **Offline fallback**: `src/data/code.snapshot.json` is used when `GH_PROFILE_TOKEN` is missing or the GitHub API fails.
- **Refresh cadence**: `.github/workflows/refresh-code.yml` rebuilds twice daily so pushes to other repos update the site without a commit here.
- **Failure policy**: Normal deployments and local builds allow the snapshot fallback for missing tokens or GitHub fetch failures. The refresh workflow sets `CODE_FEED_REQUIRE_LIVE=true`, which makes those failures stop the build and skip deployment.
- **CI reporting**: Both workflows capture build logs and run `tools/report-code-feed.mjs` even after a failed build or deployment. The report adds a warning annotation for snapshot fallback, an error annotation for a failed refresh, and a summary of feed, build, and deployment status. Build and deployment errors remain blocking.

### Local live data

Optional `.env` entry for live GitHub fetches during `vp run dev`:

```bash
GH_PROFILE_TOKEN=ghp_...
```

---

## CV PDF

The downloadable CV at `/CV-Jonathan_Gabor.pdf` is generated from the same `career` collection (`src/data/career.json`), CV copy (`src/data/cv-copy.ts`), and `cv.astro` template the live site uses. There is no separate CV data source.

- **Renderer**: `tools/render-cv-pdf.mjs` (Playwright/Chromium). Runs as a `postbuild` step on `vp run build` and inside `.github/workflows/cv-pdf.yml`.
- **Regeneration**: `.github/workflows/cv-pdf.yml` runs monthly, on path-filtered pushes to `main` (career data, CV copy, CV template, career and tenure helpers, renderer, tests, or workflow), and on `workflow_dispatch`. It rebuilds the PDF, runs the content assertions, and commits the result back to `main` so the next deploy ships the fresh copy. `public/CV-Jonathan_Gabor.pdf` is intentionally kept in git as a fallback.
- **Test**: `src/lib/cv-pdf.test.ts` is part of `vp run test` and asserts the PDF contains the name, headline, every company, a role per company, and stable `cvDescription` sentinels.
- **Manual regeneration**: `node tools/render-cv-pdf.mjs` (or `vp run cv:pdf`) after `vp run build` has produced `dist/client/cv/index.html`.

---

## Agent discovery

Crawlers and AI agents get machine-readable versions of the site.

- **robots.txt**: `public/robots.txt` allows every crawler, including AI search crawlers, fetchers acting for a user, and training crawlers. It blocks `/api/` and points to the sitemap.
  - A crawler that matches a named `User-agent` group ignores the `*` group (RFC 9309), so every group repeats the same rules.
  - Every group declares `Content-Signal: search=yes, ai-input=yes, ai-train=yes`.
  - Cloudflare AI Crawl Control must keep "Block AI bots" and Bot Preference Sync off. Otherwise Cloudflare may block these crawlers at the edge or add its own rules to robots.txt.
- **sitemap.xml**: the `sitemap()` integration in `src/lib/sitemap.ts` writes `dist/client/sitemap.xml` on every `astro build`. It lists every built page as an absolute URL, using `site` from `astro.config.mjs`, and skips error pages. `vp run dev` does not serve it.
- **Markdown versions**: `/index.md` and `/cv/index.md` are prerendered endpoints (`src/pages/index.md.ts` and `src/pages/cv/index.md.ts`). They render from the same sources as the HTML pages:
  - `src/data/home-copy.ts`: homepage copy (hero, section headings, strengths, skills, links, and the contact note);
  - `src/data/cv-copy.ts`: CV copy (header, contacts, summary, strengths, skills, and languages);
  - `src/data/career.json` and the code feed.

  Edit page copy in these modules, not in the templates, so the HTML and markdown stay in sync.

- **Accept negotiation**: `src/worker.ts` is the Worker entry (`main` in `wrangler.jsonc`). `assets.run_worker_first` sends `/` and `/cv/` to it; Cloudflare serves every other built file directly.
  - A request whose `Accept` header names `text/markdown` at least as high as HTML gets the markdown version with `Content-Type: text/markdown; charset=utf-8`.
  - Other requests get the HTML with `Link: </index.md>; rel="alternate"; type="text/markdown"` (or the `/cv/` equivalent).
  - Both carry `Vary: Accept`. All other requests go to Astro's handler.
  - `MARKDOWN_ALTERNATES` in `src/lib/markdown/negotiation.ts` lists the pages. `run_worker_first` must list the same paths; a test checks this.
  - To add a markdown version for another page, add an endpoint, an entry in `MARKDOWN_ALTERNATES`, the path in `run_worker_first`, and a canonical rule in `public/_headers`.
- **Canonical headers**: `public/_headers` gives each `.md` file a `Link: <page URL>; rel="canonical"` header, so search engines index the HTML page.
- **Left out on purpose**:
  - No `x-markdown-tokens` header. It is optional, and an estimate would not be an exact token count.
  - No DNS-AID records. The site has no agent endpoint (A2A or MCP) to advertise.
  - Cloudflare's own Markdown for Agents is not used. It needs a Pro plan or higher, and the Worker covers the same need.

---

## Tests

```bash
vp run type-check
```

Generates `worker-configuration.d.ts` from `wrangler.jsonc`, then runs Astro's
strict type checker. The generated Worker declarations are gitignored.
`src/env.d.ts` adds secret types that are not in the Worker configuration.
`@types/node` supplies types for the build scripts and Node test runner.

```bash
vp run test
```

Covers:

- the GitHub code-feed builder and its fallback/strict modes (`src/lib/github/code-feed.test.ts`);
- CI feed reporting (`tools/report-code-feed.test.mjs`);
- CV PDF content assertions (`src/lib/cv-pdf.test.ts`);
- career tenure calculation (`src/utils/career-tenure.test.ts`);
- the robots.txt policy (`src/lib/robots.test.ts`);
- sitemap rendering and the build integration (`src/lib/sitemap.test.ts`);
- Accept negotiation, and that `run_worker_first` in `wrangler.jsonc` matches the markdown routes (`src/lib/markdown/negotiation.test.ts`);
- the homepage and CV markdown content (`src/lib/markdown/home.test.ts`, `src/lib/markdown/cv.test.ts`).

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
