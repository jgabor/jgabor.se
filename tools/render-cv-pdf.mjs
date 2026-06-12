#!/usr/bin/env node
// Render the live /cv/ page (built from the `career` collection) to a PDF using
// a headless Chromium. The HTML source is dist/client/cv/index.html (produced
// by `astro build`); the PDF is written to public/CV-Jonathan_Gabor.pdf so the
// existing download links (Hero, ContactSection, /cv/ page) keep working.
//
// Usage:  node tools/render-cv-pdf.mjs
//
// Runs as a postbuild hook (see package.json) and inside the `cv-pdf.yml`
// workflow. Exits 0 with a warning if Playwright/Chromium isn't available, so
// the committed fallback PDF still ships when the renderer is missing.

import { existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";

const CV_HTML = "dist/client/cv/index.html";
const DIST_ROOT = resolve("dist/client");
const OUTPUT = "public/CV-Jonathan_Gabor.pdf";

const SYSTEM_CHROMIUM_CANDIDATES = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  "/bin/google-chrome-stable",
  "/bin/chromium",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

async function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const srv = createServer();
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolvePort(port));
    });
    srv.on("error", reject);
  });
}

function startStaticServer(rootDir, port) {
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".woff2": "font/woff2",
    ".ico": "image/x-icon",
  };
  const server = createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
      const safe = urlPath.replace(/\.\.+/g, "");
      let filePath = join(rootDir, safe);
      if (!filePath.startsWith(DIST_ROOT + sep) && filePath !== DIST_ROOT) {
        res.writeHead(403);
        res.end("forbidden");
        return;
      }
      try {
        const st = await stat(filePath);
        if (st.isDirectory()) {
          filePath = join(filePath, "index.html");
        }
      } catch {
        if (!filePath.endsWith("/") && !extname(filePath)) {
          try {
            const indexPath = join(filePath, "index.html");
            const idxSt = await stat(indexPath);
            if (idxSt.isFile()) filePath = indexPath;
          } catch {
            // fall through to the readFile which will 404
          }
        }
      }
      const buf = await readFile(filePath);
      res.writeHead(200, {
        "content-type": types[extname(filePath)] ?? "application/octet-stream",
      });
      res.end(buf);
    } catch {
      res.writeHead(404);
      res.end("not found");
    }
  });
  return new Promise((resolveSrv, rejectSrv) => {
    server.once("error", rejectSrv);
    server.listen(port, "127.0.0.1", () => resolveSrv(server));
  });
}

async function resolveChromiumPath(playwright) {
  for (const candidate of SYSTEM_CHROMIUM_CANDIDATES) {
    if (existsSync(candidate)) return candidate;
  }
  try {
    return playwright.chromium.executablePath();
  } catch {
    return null;
  }
}

async function main() {
  if (!existsSync(CV_HTML) || statSync(CV_HTML).size === 0) {
    throw new Error(
      `${CV_HTML} not found or empty. Run \`vp run build\` (or \`astro build\`) first.`,
    );
  }

  let playwright;
  try {
    playwright = await import("playwright");
  } catch (err) {
    console.warn(
      "⚠ render-cv-pdf: playwright not installed. Skipping PDF generation; the committed fallback will be used.",
    );
    console.warn(`  ${err.message ?? err}`);
    return;
  }

  const executablePath = await resolveChromiumPath(playwright);
  if (!executablePath) {
    console.warn(
      "⚠ render-cv-pdf: no Chromium found. Skipping PDF generation; the committed fallback will be used.",
    );
    return;
  }

  const port = await getFreePort();
  const server = await startStaticServer(DIST_ROOT, port);
  let browser;
  try {
    browser = await playwright.chromium.launch({
      headless: true,
      executablePath,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${port}/cv/`, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    await page.pdf({
      path: OUTPUT,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });
  } finally {
    if (browser) await browser.close().catch(() => {});
    await new Promise((closeSrv) => server.close(closeSrv));
  }

  const sizeKB = (statSync(OUTPUT).size / 1024).toFixed(1);
  console.log(`✓ Rendered ${OUTPUT} (${sizeKB}KB) from ${CV_HTML} via ${executablePath}`);
}

main().catch((err) => {
  console.error("render-cv-pdf failed:", err);
  process.exit(1);
});
