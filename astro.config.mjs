import { defineConfig, fontProviders } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

function omitAstroToolbarSourcemapPlugin() {
  return {
    name: "jgabor:omit-astro-toolbar-sourcemap",
    configResolved(config) {
      const plugins = config.optimizeDeps.esbuildOptions?.plugins;
      if (plugins) {
        config.optimizeDeps.esbuildOptions.plugins = plugins.filter(
          (plugin) => plugin.name !== "astro:strip-toolbar-sourcemap",
        );
      }
    },
  };
}

export default defineConfig({
  adapter: cloudflare({ imageService: "compile" }),
  vite: {
    plugins: [omitAstroToolbarSourcemapPlugin()],
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: [400, 600, 700, 800, 900],
    },
    {
      provider: fontProviders.google(),
      name: "Space Mono",
      cssVariable: "--font-space-mono",
      weights: [400, 700],
      fallbacks: ["ui-monospace", "monospace"],
    },
  ],
});
