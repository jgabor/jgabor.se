// Worker entry. Wrangler runs it first only for the paths in
// `assets.run_worker_first`; Cloudflare serves every other built file directly.
import { negotiatePage } from "./lib/markdown/negotiation";

type AstroHandle = typeof import("@astrojs/cloudflare/handler").handle;

let astroHandle: Promise<AstroHandle> | undefined;

// Loaded on first use, so serving `/` from the assets binding skips Astro's app setup.
function loadAstroHandle(): Promise<AstroHandle> {
  astroHandle ??= import("@astrojs/cloudflare/handler").then((module) => module.handle);
  return astroHandle;
}

export default {
  async fetch(request, env, ctx) {
    const page = await negotiatePage(request, async (variant) => {
      const asset = await env.ASSETS.fetch(variant);
      if (asset.status !== 404) return asset;
      // `astro dev` has no built assets, so Astro renders the page instead.
      const handle = await loadAstroHandle();
      return handle(variant, env, ctx);
    });
    if (page) return page;

    const handle = await loadAstroHandle();
    return handle(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
