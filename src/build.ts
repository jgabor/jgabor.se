import { Glob } from "bun";
import { mkdir, rm } from "node:fs/promises";
import { basename, join } from "node:path";
import { compressAll, type Encoding } from "./lib/compress";
import { minifyHTML } from "./lib/minify";

const PAGES_DIR = join(import.meta.dir, "pages");
const DIST_DIR = join(import.meta.dir, "..", "dist");

interface PageContent {
  name: string;
  html: string;
}

async function discoverPages(): Promise<PageContent[]> {
  const glob = new Glob("*.{ts,html}");
  const pages: PageContent[] = [];

  for await (const file of glob.scan(PAGES_DIR)) {
    const name = basename(file).replace(/\.(ts|html)$/, "");
    const filePath = join(PAGES_DIR, file);

    let html: string;
    if (file.endsWith(".ts")) {
      const module = await import(filePath);
      html = module.default;
    } else {
      html = await Bun.file(filePath).text();
    }

    pages.push({ name, html });
  }

  return pages;
}

async function build(): Promise<void> {
  console.log("Building...");

  await rm(DIST_DIR, { recursive: true, force: true });
  await mkdir(DIST_DIR, { recursive: true });

  const pages = await discoverPages();
  console.log(`Found ${pages.length} page(s): ${pages.map((p) => p.name).join(", ")}`);

  const kvEntries: Array<{ key: string; value: string; base64: boolean }> = [];

  for (const page of pages) {
    const minified = minifyHTML(page.html);
    const variants = compressAll(minified);

    await Bun.write(join(DIST_DIR, `${page.name}.html`), minified);

    const encodings: Encoding[] = ["zstd", "br", "gzip", "raw"];
    const extensions: Record<Encoding, string> = {
      zstd: ".zst",
      br: ".br",
      gzip: ".gz",
      raw: "",
    };

    for (const encoding of encodings) {
      const data = variants[encoding];
      const ext = extensions[encoding];

      if (ext) {
        await Bun.write(join(DIST_DIR, `${page.name}.html${ext}`), data);
      }

      kvEntries.push({
        key: `${page.name}:${encoding}`,
        value: Buffer.from(data).toString("base64"),
        base64: true,
      });
    }

    const sizes = {
      raw: variants.raw.length,
      gzip: variants.gzip.length,
      br: variants.br.length,
      zstd: variants.zstd.length,
    };

    console.log(`  ${page.name}: ${sizes.raw}B → gzip:${sizes.gzip}B br:${sizes.br}B zstd:${sizes.zstd}B`);
  }

  const kvFile = join(DIST_DIR, "kv-entries.json");
  await Bun.write(kvFile, JSON.stringify(kvEntries, null, 2));
  console.log(`\nKV entries written to ${kvFile}`);
  console.log("Upload with: wrangler kv bulk put --namespace-id <ID> dist/kv-entries.json");

  const devContent = generateDevContent(pages);
  const devContentFile = join(import.meta.dir, "dev-content.ts");
  await Bun.write(devContentFile, devContent);
  console.log(`Dev content written to ${devContentFile}`);
}

function generateDevContent(pages: PageContent[]): string {
  const entries = pages.map((page) => {
    const escaped = JSON.stringify(minifyHTML(page.html));
    return `  "${page.name}": ${escaped}`;
  });

  return `export const pages: Record<string, string> = {\n${entries.join(",\n")}\n};\n`;
}

build().catch(console.error);
