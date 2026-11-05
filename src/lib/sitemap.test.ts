import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, it } from "node:test";
import { renderSitemap, sitemap } from "./sitemap.ts";

function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1] ?? "");
}

describe("renderSitemap", () => {
  it("renders a sitemaps.org urlset with absolute URLs", () => {
    const xml = renderSitemap("https://jgabor.se", ["", "cv/"]);

    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n'));
    assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
    assert.ok(xml.endsWith("</urlset>\n"));
    assert.deepEqual(locs(xml), ["https://jgabor.se/", "https://jgabor.se/cv/"]);
  });

  it("sorts and deduplicates pathnames", () => {
    const xml = renderSitemap("https://jgabor.se/", ["cv/", "", "/cv/", "cv/"]);
    assert.deepEqual(locs(xml), ["https://jgabor.se/", "https://jgabor.se/cv/"]);
  });

  it("leaves out error pages", () => {
    const xml = renderSitemap("https://jgabor.se", ["", "404", "404/", "500", "/500/", "cv/"]);
    assert.deepEqual(locs(xml), ["https://jgabor.se/", "https://jgabor.se/cv/"]);
  });

  it("escapes XML special characters", () => {
    const xml = renderSitemap("https://jgabor.se", ["it's/a&b/"]);
    assert.deepEqual(locs(xml), ["https://jgabor.se/it&apos;s/a&amp;b/"]);
  });

  it("keeps a base path on the site URL", () => {
    const xml = renderSitemap("https://example.com/base", ["", "cv/"]);
    assert.deepEqual(locs(xml), ["https://example.com/base/", "https://example.com/base/cv/"]);
  });
});

// Hook arguments are partial fakes, so they are cast with `as never`.
describe("sitemap integration", () => {
  it("fails the build when site is not set", () => {
    const integration = sitemap();
    const configDone = integration.hooks["astro:config:done"];
    assert.ok(configDone);
    assert.throws(() => configDone({ config: {} } as never), /Set `site`/);
  });

  it("writes sitemap.xml for the built pages", async () => {
    const dir = await mkdtemp(join(tmpdir(), "sitemap-test-"));
    try {
      const integration = sitemap();
      const configDone = integration.hooks["astro:config:done"];
      const buildDone = integration.hooks["astro:build:done"];
      assert.ok(configDone && buildDone);

      await configDone({
        config: { site: "https://jgabor.se" },
      } as never);
      await buildDone({
        dir: pathToFileURL(`${dir}/`),
        pages: [{ pathname: "" }, { pathname: "cv/" }],
        logger: { info() {} },
      } as never);

      const xml = await readFile(join(dir, "sitemap.xml"), "utf8");
      assert.deepEqual(locs(xml), ["https://jgabor.se/", "https://jgabor.se/cv/"]);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
