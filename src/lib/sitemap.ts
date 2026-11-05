import { writeFile } from "node:fs/promises";
import type { AstroIntegration } from "astro";

const ERROR_PAGE = /^(404|500)\/?$/;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** Renders a sitemap with one absolute, sorted, unique URL per page pathname. */
export function renderSitemap(site: string | URL, pathnames: string[]): string {
  const base = new URL(site);
  if (!base.pathname.endsWith("/")) base.pathname += "/";

  const urls = new Set<string>();
  for (const pathname of pathnames) {
    const relative = pathname.replace(/^\/+/, "");
    if (ERROR_PAGE.test(relative)) continue;
    urls.add(new URL(relative, base).href);
  }

  const entries = [...urls].sort().map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");
}

/** Writes sitemap.xml for every built page, so new pages are listed on the next build. */
export function sitemap(): AstroIntegration {
  let site: URL | undefined;

  return {
    name: "jgabor:sitemap",
    hooks: {
      "astro:config:done": ({ config }) => {
        if (!config.site) {
          throw new Error("[sitemap] Set `site` in astro.config.mjs to generate absolute URLs.");
        }
        site = new URL(config.site);
      },
      "astro:build:done": async ({ dir, pages, logger }) => {
        if (!site) throw new Error("[sitemap] `site` was not resolved before the build finished.");
        const xml = renderSitemap(
          site,
          pages.map((page) => page.pathname),
        );
        await writeFile(new URL("sitemap.xml", dir), xml);
        logger.info(`Wrote sitemap.xml with ${xml.split("<url>").length - 1} URLs.`);
      },
    },
  };
}
