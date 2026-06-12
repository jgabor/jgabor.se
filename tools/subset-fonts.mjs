#!/usr/bin/env node
// Subset a woff2 font to only the glyphs listed in tools/font-glyphs.txt.
// Reads the full original woff2, writes the subset to public/fonts/.
//
// Usage:  node tools/subset-fonts.mjs
//
// The original is preserved as DepartureMono-Regular.original.woff2 (never served).
// The subset is written to DepartureMono-Regular.subset.woff2 (referenced from @font-face).

import { readFile, writeFile, stat } from "node:fs/promises";
import subsetFont from "subset-font";

const ORIGINAL = "public/fonts/DepartureMono-Regular.original.woff2";
const SUBSET = "public/fonts/DepartureMono-Regular.subset.woff2";
const GLYPHS = "tools/font-glyphs.txt";

async function main() {
  const [originalBuffer, glyphsRaw] = await Promise.all([
    readFile(ORIGINAL),
    readFile(GLYPHS, "utf-8"),
  ]);

  const glyphs = [...new Set(glyphsRaw)]
    .filter((ch) => ch !== "\n" && ch !== "#" || ch === "#")
    .join("");

  const subsetBuffer = await subsetFont(originalBuffer, glyphs, { targetFormat: "woff2" });
  await writeFile(SUBSET, subsetBuffer);

  const originalKB = (originalBuffer.byteLength / 1024).toFixed(1);
  const subsetKB = (subsetBuffer.byteLength / 1024).toFixed(1);
  const reduction = (((originalBuffer.byteLength - subsetBuffer.byteLength) / originalBuffer.byteLength) * 100).toFixed(1);
  console.log(`✓ Subset ${glyphs.length} glyphs: ${originalKB}KB → ${subsetKB}KB (-${reduction}%)`);
}

main().catch((err) => {
  console.error("subset-fonts failed:", err);
  process.exit(1);
});
