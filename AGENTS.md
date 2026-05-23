# Agent Guide for jgabor.se

This file serves as a reference guide for AI agents working in this repository. It documents standard commands, diagnostic procedures, performance audits, and general codebase rules to prevent re-discovery.

---

## Development Server

Do not invoke `pnpm` or `npm` directly. Use the unified toolchain CLI **`vp`** for all tasks.

* **Command**: `vp run dev` (runs the underlying `astro dev` command)
* **Default Port**: `http://localhost:4321/`
* **Workflow**: Run this command as a background task.

> [!WARNING]
> Running `vp dev` starts a raw `vite+` development server on port `5173`, which does not correctly process Astro-specific pages and outputs `404 Not Found` for the application. Always use `vp run dev` to launch the Astro-supported dev server.

---

## Launching Chrome for Debugging

When requested to run/open Chrome with DevTools activated, use:

```bash
google-chrome-stable --auto-open-devtools-for-tabs http://localhost:4321/
```

### Guidelines:
* Ensure Chrome is run asynchronously in the background so it doesn't block shell execution.
* The `--auto-open-devtools-for-tabs` flag guarantees DevTools opens immediately for the active tab.

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
* **Simulated (Mobile Throttling)**: The local dev environment typically scores lower (~60s) in simulated mobile audits than production (~98s). This is normal dev server behavior.
* **Network Requests**: The local dev server loads unbundled ES modules dynamically (making 40+ requests, including Astro Dev Toolbar components), whereas the production build bundles, minifies, and compresses assets (making fewer than 20 requests).
* **Observed (Actual) Performance**: Under unthrottled conditions, both local and production load almost instantly (~100-140ms LCP).

---

## General Agent Guidelines

### 1. CLI Usage & Safety
* **Non-Interactive Commands**: Never run interactive CLI tools. Provide flags such as `--no-input`, `--no-enable-error-reporting`, etc.
* **Background Tasks**: Run long-running servers and processes in the background. Use the background task manager to verify logs.
* **Avoid Root Scoping**: Never run glob/grep searches on `$HOME/` or root (`/`). Only search within `/home/jgabor/git/jgabor.se/` to avoid massive latency.

### 2. Commit Style
* Write concise, imperative descriptions of changes matching the repository's convention:
  * Example: `docs: document development workflows in AGENTS.md`

### 3. Engineering Principles
* **DTC (Document, Test, Code)**: Document intent, enforce with tests, write code.
* **DRY & SOLID**: Keep code modular, reuse functions where appropriate, and avoid duplicate logic.
* **YAGNI**: Implement only what is requested/needed now, avoiding unnecessary speculative complexity.
