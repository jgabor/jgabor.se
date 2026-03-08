import { defineConfig, fontProviders, passthroughImageService } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  adapter: cloudflare({ imageService: "passthrough" }),
  image: {
    service: passthroughImageService(),
  },
  vite: {
    plugins: [tailwindcss()],
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
