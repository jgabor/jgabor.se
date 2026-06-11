import { defineConfig, fontProviders } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import { contentDataHmrPlugin } from "./vite-plugins/content-data-hmr.mjs";

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
  server: {
    host: true,
  },
  vite: {
    plugins: [omitAstroToolbarSourcemapPlugin(), contentDataHmrPlugin()],
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Bebas Neue",
      cssVariable: "--font-bebas",
      weights: [400],
      styles: ["normal"],
    },
    {
      provider: fontProviders.google(),
      name: "Source Sans 3",
      cssVariable: "--font-source",
      weights: [400, 600],
      styles: ["normal"],
    },
  ],
});
