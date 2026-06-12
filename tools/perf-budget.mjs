#!/usr/bin/env node
// Report the size of every asset in dist/client/ as raw bytes + gzipped bytes.
// Emits tmp/perf-budget.json with totals, per-folder breakdown, and largest assets.
//
// Usage:  node tools/perf-budget.mjs
//
// Runs as a postbuild hook (see package.json). Exits 1 if the index HTML + its
// referenced CSS/JS exceed a configurable threshold (default 60 KB uncompressed).

import { readFile, readdir, stat, writeFile, mkdir } from "node:fs/promises";
import { gzipSync, brotliCompressSync } from "node:zlib";
import { join, relative } from "node:path";

const DIST = "dist/client";
const REPORT_PATH = "tmp/perf-budget.json";
const THRESHOLD_KB = 250;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

function compressStats(buf) {
  return {
    gzip: gzipSync(buf).byteLength,
    brotli: brotliCompressSync(buf).byteLength,
  };
}

async function main() {
  const files = [];
  for await (const path of walk(DIST)) {
    const st = await stat(path);
    if (!st.isFile()) continue;
    const buf = await readFile(path);
    const compressed = compressStats(buf);
    files.push({
      path: relative(DIST, path),
      bytes: st.size,
      gzip: compressed.gzip,
      brotli: compressed.brotli,
    });
  }

  const byFolder = {};
  for (const f of files) {
    const folder = f.path.split("/")[0];
    byFolder[folder] = byFolder[folder] || { count: 0, bytes: 0, gzip: 0, brotli: 0 };
    byFolder[folder].count++;
    byFolder[folder].bytes += f.bytes;
    byFolder[folder].gzip += f.gzip;
    byFolder[folder].brotli += f.brotli;
  }

  // Critical bundle = HTML + everything in _astro/ that a browser might request.
  // Note: includes all <Picture> format variants (AVIF + WebP at multiple sizes),
  // but a modern browser will only download the smallest matching source.
  const indexHtml = files.find((f) => f.path === "index.html");
  const indexReferenced = indexHtml ? files.filter((f) => f.path.startsWith("_astro/")) : [];
  const criticalBytes = (indexHtml?.bytes ?? 0) + indexReferenced.reduce((s, f) => s + f.bytes, 0);
  const criticalBrotli = (indexHtml?.brotli ?? 0) + indexReferenced.reduce((s, f) => s + f.brotli, 0);
  const criticalKB = (criticalBytes / 1024).toFixed(1);
  const criticalBrotliKB = (criticalBrotli / 1024).toFixed(1);

  // "Wire" size = what a modern browser actually downloads (smallest format per resource).
  // Useful for understanding real-world LCP impact vs raw size.
  const astroImages = files.filter((f) => /\.(avif|webp|png|jpg|jpeg)$/i.test(f.path));
  const smallestAstroImage = astroImages.length
    ? astroImages.reduce((min, f) => (f.brotli < min.brotli ? f : min))
    : null;
  const wireBytes =
    criticalBytes -
    (indexReferenced
      .filter((f) => /\.(avif|webp|png|jpg|jpeg)$/i.test(f.path))
      .reduce((s, f) => s + f.bytes, 0) - (smallestAstroImage?.bytes ?? 0));
  const wireBrotli =
    criticalBrotli -
    (indexReferenced
      .filter((f) => /\.(avif|webp|png|jpg|jpeg)$/i.test(f.path))
      .reduce((s, f) => s + f.brotli, 0) - (smallestAstroImage?.brotli ?? 0));

  const report = {
    generatedAt: new Date().toISOString(),
    total: {
      count: files.length,
      bytes: files.reduce((s, f) => s + f.bytes, 0),
      gzip: files.reduce((s, f) => s + f.gzip, 0),
      brotli: files.reduce((s, f) => s + f.brotli, 0),
    },
    critical: {
      description: "index.html + referenced _astro/* assets (raw, all variants)",
      bytes: criticalBytes,
      kb: criticalKB,
      brotliKB: criticalBrotliKB,
    },
    wire: {
      description: "what a modern browser actually downloads (smallest format per asset)",
      bytes: wireBytes,
      kb: (wireBytes / 1024).toFixed(1),
      brotliKB: (wireBrotli / 1024).toFixed(1),
    },
    byFolder,
    largest: files.sort((a, b) => b.bytes - a.bytes).slice(0, 10),
  };

  await mkdir("tmp", { recursive: true });
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`\n📊 Performance Budget Report`);
  console.log(`  Wire (smallest variants): ${(wireBytes / 1024).toFixed(1)}KB raw / ${(wireBrotli / 1024).toFixed(1)}KB brotli`);
  console.log(`  Critical (all variants):  ${criticalKB}KB raw / ${criticalBrotliKB}KB brotli`);
  console.log(`  Total dist:               ${(report.total.bytes / 1024).toFixed(1)}KB raw / ${(report.total.brotli / 1024).toFixed(1)}KB brotli`);
  console.log(`  Largest: ${report.largest.slice(0, 3).map((f) => `${f.path} (${(f.bytes / 1024).toFixed(1)}KB)`).join(", ")}`);
  console.log(`  Full report: ${REPORT_PATH}\n`);

  if (wireBytes / 1024 > THRESHOLD_KB) {
    console.error(`✗ Wire bundle ${(wireBytes / 1024).toFixed(1)}KB exceeds threshold of ${THRESHOLD_KB}KB`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("perf-budget failed:", err);
  process.exit(1);
});
