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
      name: "Josefin Sans",
      cssVariable: "--font-josefin",
      weights: [400, 600, 700],
      styles: ["normal"],
    },
    {
      provider: fontProviders.google(),
      name: "Raleway",
      cssVariable: "--font-raleway",
      weights: [400, 500, 600],
      styles: ["normal"],
    },
  ],
});
